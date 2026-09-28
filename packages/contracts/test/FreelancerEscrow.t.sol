// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../src/FreelancerEscrow.sol";
import "./mocks/MockUSDC.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract FreelancerEscrowTest is Test {
    using MessageHashUtils for bytes32;

    FreelancerEscrow public escrow;
    MockUSDC public usdc;

    address public client = address(0x1111);
    address public freelancer = address(0x2222);

    uint256 public arbKey1 = 0xA11;
    uint256 public arbKey2 = 0xA22;
    uint256 public arbKey3 = 0xA33;

    address public arbSigner1;
    address public arbSigner2;
    address public arbSigner3;

    bytes32 public projectId = keccak256("PROJECT_1");
    uint256 public totalAmount = 1000 * 10 ** 6; // 1,000 USDC

    function setUp() public {
        arbSigner1 = vm.addr(arbKey1);
        arbSigner2 = vm.addr(arbKey2);
        arbSigner3 = vm.addr(arbKey3);

        address[3] memory signers = [arbSigner1, arbSigner2, arbSigner3];

        usdc = new MockUSDC();
        escrow = new FreelancerEscrow(address(usdc), signers);

        // Fund client with 1,000,000 USDC
        usdc.mint(client, 1_000_000 * 10 ** 6);
    }

    function test_CreateAndFundProject() public {
        uint256[] memory milestones = new uint256[](2);
        milestones[0] = 600 * 10 ** 6;
        milestones[1] = 400 * 10 ** 6;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        (
            address storedClient,
            address storedFreelancer,
            uint256 storedTotal,
            uint256 released,
            uint256 refunded,
            FreelancerEscrow.ProjectStatus status,
            uint256 count,
            uint256 paidCount
        ) = escrow.projects(projectId);

        assertEq(storedClient, client);
        assertEq(storedFreelancer, freelancer);
        assertEq(storedTotal, totalAmount);
        assertEq(released, 0);
        assertEq(refunded, 0);
        assertEq(uint8(status), uint8(FreelancerEscrow.ProjectStatus.FUNDED));
        assertEq(count, 2);
        assertEq(paidCount, 0);
        assertEq(usdc.balanceOf(address(escrow)), totalAmount);
    }

    function test_SubmitAndApproveMilestone() public {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = totalAmount;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        // Freelancer submits milestone
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "ipfs://deliverable-v1");

        // Client approves milestone
        uint256 freelancerBalanceBefore = usdc.balanceOf(freelancer);
        vm.prank(client);
        escrow.approveMilestone(projectId, 0);

        uint256 freelancerBalanceAfter = usdc.balanceOf(freelancer);
        assertEq(freelancerBalanceAfter - freelancerBalanceBefore, totalAmount);
        assertEq(usdc.balanceOf(address(escrow)), 0);

        // Project should be marked COMPLETED
        (, , , , , FreelancerEscrow.ProjectStatus status, , ) = escrow.projects(projectId);
        assertEq(uint8(status), uint8(FreelancerEscrow.ProjectStatus.COMPLETED));
    }

    function test_RevisionRequestFlow() public {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = totalAmount;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        // Submit
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "ipfs://draft-1");

        // Client requests revision
        vm.prank(client);
        escrow.requestRevision(projectId, 0, "Please fix test coverage and add documentation");

        (, FreelancerEscrow.MilestoneStatus status, ) = escrow.milestones(projectId, 0);
        assertEq(uint8(status), uint8(FreelancerEscrow.MilestoneStatus.REVISION_REQUESTED));

        // Resubmit
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "ipfs://draft-2-fixed");

        // Approve
        vm.prank(client);
        escrow.approveMilestone(projectId, 0);

        assertEq(usdc.balanceOf(freelancer), totalAmount);
    }

    function test_Dispute2Of3MultisigResolutionSplit() public {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = totalAmount;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        // Submit & Raise Dispute
        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "ipfs://work");

        vm.prank(client);
        escrow.raiseDispute(projectId, 0, "Scope incomplete");

        // Prepare 50/50 split resolution
        uint256 freelancerShare = 500 * 10 ** 6;
        uint256 clientShare = 500 * 10 ** 6;

        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                block.chainid,
                address(escrow),
                projectId,
                uint256(0),
                uint8(FreelancerEscrow.DisputeOutcome.SPLIT_FUNDS),
                freelancerShare,
                clientShare
            )
        );

        bytes32 ethSigned = disputeHash.toEthSignedMessageHash();

        // Sign with Arbitrator 1 & 2
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(arbKey1, ethSigned);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(arbKey2, ethSigned);

        bytes[] memory signatures = new bytes[](2);
        signatures[0] = abi.encodePacked(r1, s1, v1);
        signatures[1] = abi.encodePacked(r2, s2, v2);

        uint256 clientBalBefore = usdc.balanceOf(client);
        uint256 freelancerBalBefore = usdc.balanceOf(freelancer);

        // Execute resolution
        escrow.resolveDispute(
            projectId,
            0,
            FreelancerEscrow.DisputeOutcome.SPLIT_FUNDS,
            freelancerShare,
            clientShare,
            signatures
        );

        assertEq(usdc.balanceOf(freelancer) - freelancerBalBefore, freelancerShare);
        assertEq(usdc.balanceOf(client) - clientBalBefore, clientShare);
        assertEq(usdc.balanceOf(address(escrow)), 0);

        // Replay resolution should revert
        vm.expectRevert(FreelancerEscrow.InvalidMilestoneState.selector);
        escrow.resolveDispute(
            projectId,
            0,
            FreelancerEscrow.DisputeOutcome.SPLIT_FUNDS,
            freelancerShare,
            clientShare,
            signatures
        );
    }

    function test_RevertWhen_UnauthorizedApprove() public {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = totalAmount;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        vm.prank(freelancer);
        escrow.submitMilestone(projectId, 0, "ipfs://work");

        // Attacker attempts to approve
        address attacker = address(0x9999);
        vm.prank(attacker);
        vm.expectRevert(FreelancerEscrow.Unauthorized.selector);
        escrow.approveMilestone(projectId, 0);
    }

    function test_RevertWhen_InvalidArbitrationSignatures() public {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = totalAmount;

        vm.startPrank(client);
        usdc.approve(address(escrow), totalAmount);
        escrow.createAndFundProject(projectId, freelancer, totalAmount, milestones);
        vm.stopPrank();

        vm.prank(client);
        escrow.raiseDispute(projectId, 0, "Dispute");

        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                block.chainid,
                address(escrow),
                projectId,
                uint256(0),
                uint8(FreelancerEscrow.DisputeOutcome.PAY_FREELANCER),
                totalAmount,
                uint256(0)
            )
        );

        bytes32 ethSigned = disputeHash.toEthSignedMessageHash();

        // Sign with fake key
        (uint8 vFake, bytes32 rFake, bytes32 sFake) = vm.sign(0xF99, ethSigned);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(arbKey1, ethSigned);

        bytes[] memory signatures = new bytes[](2);
        signatures[0] = abi.encodePacked(rFake, sFake, vFake);
        signatures[1] = abi.encodePacked(r1, s1, v1);

        vm.expectRevert(FreelancerEscrow.InvalidArbitrationSignatures.selector);
        escrow.resolveDispute(
            projectId,
            0,
            FreelancerEscrow.DisputeOutcome.PAY_FREELANCER,
            totalAmount,
            0,
            signatures
        );
    }

    function testFuzz_MilestoneSumValidation(uint128 m1, uint128 m2) public {
        vm.assume(m1 > 0 && m2 > 0);
        vm.assume(m1 < 500_000 * 10 ** 6 && m2 < 500_000 * 10 ** 6);

        uint256 fuzzTotal = uint256(m1) + uint256(m2);
        bytes32 fuzzProjId = keccak256(abi.encodePacked(m1, m2));

        uint256[] memory milestones = new uint256[](2);
        milestones[0] = m1;
        milestones[1] = m2;

        vm.startPrank(client);
        usdc.approve(address(escrow), fuzzTotal);
        escrow.createAndFundProject(fuzzProjId, freelancer, fuzzTotal, milestones);
        vm.stopPrank();

        (,, uint256 storedTotal,,,,,) = escrow.projects(fuzzProjId);
        assertEq(storedTotal, fuzzTotal);
    }
}
