// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title FreelancerEscrow
 * @notice Non-upgradeable milestone-based USDC escrow protocol with 2-of-3 multisig arbitration for FreelancerX.
 */
contract FreelancerEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // --- Enums ---

    enum ProjectStatus {
        NONE,
        FUNDED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    enum MilestoneStatus {
        PENDING,
        FUNDED,
        SUBMITTED,
        REVISION_REQUESTED,
        APPROVED,
        PAID,
        DISPUTED,
        CANCELLED
    }

    enum DisputeOutcome {
        PAY_FREELANCER,
        REFUND_CLIENT,
        SPLIT_FUNDS
    }

    // --- Structs ---

    struct Milestone {
        uint256 amount;
        MilestoneStatus status;
        string deliverableHash;
    }

    struct Project {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 refundedAmount;
        ProjectStatus status;
        uint256 milestoneCount;
        uint256 paidMilestoneCount;
    }

    // --- State Variables ---

    IERC20 public immutable usdc;
    address[3] public arbitrationSigners;

    // projectId => Project
    mapping(bytes32 => Project) public projects;
    // projectId => milestoneIndex => Milestone
    mapping(bytes32 => mapping(uint256 => Milestone)) public milestones;
    // disputeHash => executed
    mapping(bytes32 => bool) public executedDisputes;

    // --- Events ---

    event ProjectCreated(
        bytes32 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount
    );

    event ProjectFunded(bytes32 indexed projectId, uint256 amount);

    event MilestoneSubmitted(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        string deliverableHash
    );

    event RevisionRequested(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        string reason
    );

    event MilestoneApproved(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 amount
    );

    event PaymentReleased(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed to,
        uint256 amount
    );

    event DisputeRaised(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed raisedBy,
        string reason
    );

    event DisputeResolved(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        DisputeOutcome outcome,
        uint256 freelancerAmount,
        uint256 clientAmount
    );

    event ProjectCompleted(
        bytes32 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount
    );

    event ProjectCancelled(bytes32 indexed projectId, uint256 refundedAmount);

    // --- Errors ---

    error ZeroAddress();
    error InvalidAmount();
    error ProjectAlreadyExists();
    error ProjectNotFound();
    error InvalidProjectState();
    error InvalidMilestoneIndex();
    error InvalidMilestoneState();
    error Unauthorized();
    error MilestoneSumMismatch();
    error InvalidArbitrationSignatures();
    error DisputeAlreadyExecuted();
    error InvalidDisputeSplit();

    // --- Constructor ---

    constructor(address _usdc, address[3] memory _arbitrationSigners) {
        if (_usdc == address(0)) revert ZeroAddress();
        for (uint256 i = 0; i < 3; i++) {
            if (_arbitrationSigners[i] == address(0)) revert ZeroAddress();
            for (uint256 j = 0; j < i; j++) {
                if (_arbitrationSigners[i] == _arbitrationSigners[j]) revert ZeroAddress();
            }
        }

        usdc = IERC20(_usdc);
        arbitrationSigners = _arbitrationSigners;
    }

    // --- External Functions ---

    /**
     * @notice Creates and locks full USDC funds for a milestone-based project in one transaction
     */
    function createAndFundProject(
        bytes32 projectId,
        address freelancer,
        uint256 totalAmount,
        uint256[] calldata milestoneAmounts
    ) external nonReentrant {
        if (freelancer == address(0) || freelancer == msg.sender) revert Unauthorized();
        if (totalAmount == 0) revert InvalidAmount();
        if (projects[projectId].status != ProjectStatus.NONE) revert ProjectAlreadyExists();

        uint256 count = milestoneAmounts.length;
        if (count == 0) revert InvalidMilestoneIndex();

        uint256 sum = 0;
        for (uint256 i = 0; i < count; i++) {
            if (milestoneAmounts[i] == 0) revert InvalidAmount();
            sum += milestoneAmounts[i];
            milestones[projectId][i] = Milestone({
                amount: milestoneAmounts[i],
                status: MilestoneStatus.FUNDED,
                deliverableHash: ""
            });
        }

        if (sum != totalAmount) revert MilestoneSumMismatch();

        projects[projectId] = Project({
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: totalAmount,
            releasedAmount: 0,
            refundedAmount: 0,
            status: ProjectStatus.FUNDED,
            milestoneCount: count,
            paidMilestoneCount: 0
        });

        // Pull USDC into escrow
        usdc.safeTransferFrom(msg.sender, address(this), totalAmount);

        emit ProjectCreated(projectId, msg.sender, freelancer, totalAmount);
        emit ProjectFunded(projectId, totalAmount);
    }

    /**
     * @notice Freelancer submits deliverable for milestone
     */
    function submitMilestone(
        bytes32 projectId,
        uint256 milestoneIndex,
        string calldata deliverableHash
    ) external {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.FUNDED && project.status != ProjectStatus.IN_PROGRESS) {
            revert InvalidProjectState();
        }
        if (msg.sender != project.freelancer) revert Unauthorized();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[projectId][milestoneIndex];
        if (
            milestone.status != MilestoneStatus.FUNDED &&
            milestone.status != MilestoneStatus.REVISION_REQUESTED
        ) {
            revert InvalidMilestoneState();
        }

        milestone.status = MilestoneStatus.SUBMITTED;
        milestone.deliverableHash = deliverableHash;
        project.status = ProjectStatus.IN_PROGRESS;

        emit MilestoneSubmitted(projectId, milestoneIndex, deliverableHash);
    }

    /**
     * @notice Client requests revision on submitted milestone deliverable
     */
    function requestRevision(
        bytes32 projectId,
        uint256 milestoneIndex,
        string calldata reason
    ) external {
        Project storage project = projects[projectId];
        if (msg.sender != project.client) revert Unauthorized();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.SUBMITTED) revert InvalidMilestoneState();

        milestone.status = MilestoneStatus.REVISION_REQUESTED;

        emit RevisionRequested(projectId, milestoneIndex, reason);
    }

    /**
     * @notice Client approves milestone, releasing escrowed USDC to freelancer
     */
    function approveMilestone(bytes32 projectId, uint256 milestoneIndex) external nonReentrant {
        Project storage project = projects[projectId];
        if (msg.sender != project.client) revert Unauthorized();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.SUBMITTED) revert InvalidMilestoneState();

        uint256 amountToRelease = milestone.amount;
        milestone.status = MilestoneStatus.PAID;
        project.releasedAmount += amountToRelease;
        project.paidMilestoneCount += 1;

        emit MilestoneApproved(projectId, milestoneIndex, amountToRelease);
        emit PaymentReleased(projectId, milestoneIndex, project.freelancer, amountToRelease);

        // Check if all milestones completed
        if (project.paidMilestoneCount == project.milestoneCount) {
            project.status = ProjectStatus.COMPLETED;
            emit ProjectCompleted(projectId, project.client, project.freelancer, project.totalAmount);
        }

        // Release USDC directly to freelancer
        usdc.safeTransfer(project.freelancer, amountToRelease);
    }

    /**
     * @notice Either party can raise a dispute on an active milestone
     */
    function raiseDispute(
        bytes32 projectId,
        uint256 milestoneIndex,
        string calldata reason
    ) external {
        Project storage project = projects[projectId];
        if (msg.sender != project.client && msg.sender != project.freelancer) revert Unauthorized();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[projectId][milestoneIndex];
        if (
            milestone.status != MilestoneStatus.FUNDED &&
            milestone.status != MilestoneStatus.SUBMITTED &&
            milestone.status != MilestoneStatus.REVISION_REQUESTED
        ) {
            revert InvalidMilestoneState();
        }

        milestone.status = MilestoneStatus.DISPUTED;

        emit DisputeRaised(projectId, milestoneIndex, msg.sender, reason);
    }

    /**
     * @notice Executes dispute resolution via 2-of-3 multisig arbitration authorization
     */
    function resolveDispute(
        bytes32 projectId,
        uint256 milestoneIndex,
        DisputeOutcome outcome,
        uint256 freelancerShare,
        uint256 clientShare,
        bytes[] calldata signatures
    ) external nonReentrant {
        Project storage project = projects[projectId];
        if (project.status == ProjectStatus.NONE) revert ProjectNotFound();
        if (milestoneIndex >= project.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = milestones[projectId][milestoneIndex];
        if (milestone.status != MilestoneStatus.DISPUTED) revert InvalidMilestoneState();

        if (freelancerShare + clientShare != milestone.amount) revert InvalidDisputeSplit();

        // Generate arbitration hash
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                block.chainid,
                address(this),
                projectId,
                milestoneIndex,
                uint8(outcome),
                freelancerShare,
                clientShare
            )
        );

        if (executedDisputes[disputeHash]) revert DisputeAlreadyExecuted();
        executedDisputes[disputeHash] = true;

        // Verify 2-of-3 multisig signatures
        _verifyArbitrationSignatures(disputeHash, signatures);

        milestone.status = MilestoneStatus.PAID;
        project.releasedAmount += freelancerShare;
        project.refundedAmount += clientShare;
        project.paidMilestoneCount += 1;

        emit DisputeResolved(projectId, milestoneIndex, outcome, freelancerShare, clientShare);

        if (project.paidMilestoneCount == project.milestoneCount) {
            project.status = ProjectStatus.COMPLETED;
            emit ProjectCompleted(projectId, project.client, project.freelancer, project.totalAmount);
        }

        // Transfers
        if (freelancerShare > 0) {
            usdc.safeTransfer(project.freelancer, freelancerShare);
        }
        if (clientShare > 0) {
            usdc.safeTransfer(project.client, clientShare);
        }
    }

    /**
     * @notice Helper to verify 2 distinct valid signatures from configured 3 arbitration signers
     */
    function _verifyArbitrationSignatures(
        bytes32 hash,
        bytes[] calldata signatures
    ) internal view {
        if (signatures.length < 2) revert InvalidArbitrationSignatures();

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address firstSigner = address(0);
        uint256 validCount = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ethSignedHash.recover(signatures[i]);
            if (_isArbitrationSigner(signer)) {
                if (firstSigner == address(0)) {
                    firstSigner = signer;
                    validCount++;
                } else if (signer != firstSigner) {
                    validCount++;
                    break;
                }
            }
        }

        if (validCount < 2) revert InvalidArbitrationSignatures();
    }

    function _isArbitrationSigner(address signer) internal view returns (bool) {
        return (
            signer == arbitrationSigners[0] ||
            signer == arbitrationSigners[1] ||
            signer == arbitrationSigners[2]
        );
    }
}
