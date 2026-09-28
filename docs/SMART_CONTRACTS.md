# FreelancerX Smart Contracts Specification

## 1. Overview
The core smart contract `FreelancerEscrow.sol` manages non-upgradeable milestone-based escrow for projects on Base Sepolia and Base Mainnet using USDC (ERC-20).

## 2. Functions

```solidity
function createProject(
    bytes32 projectId,
    address freelancer,
    uint256 totalAmount,
    uint256[] calldata milestoneAmounts
) external;

function fundProject(bytes32 projectId) external;

function submitMilestone(bytes32 projectId, uint256 milestoneIndex, string calldata deliverableHash) external;

function approveMilestone(bytes32 projectId, uint256 milestoneIndex) external;

function requestRevision(bytes32 projectId, uint256 milestoneIndex, string calldata reason) external;

function raiseDispute(bytes32 projectId, uint256 milestoneIndex, string calldata reason) external;

function resolveDispute(
    bytes32 projectId,
    uint256 milestoneIndex,
    uint8 outcome, // 0: Pay Freelancer, 1: Refund Client, 2: Split
    uint256 freelancerShare,
    uint256 clientShare,
    bytes[] calldata multisigSignatures
) external;
```

## 3. Events
- `ProjectCreated(bytes32 indexed projectId, address indexed client, address indexed freelancer, uint256 totalAmount)`
- `ProjectFunded(bytes32 indexed projectId, uint256 amount)`
- `MilestoneSubmitted(bytes32 indexed projectId, uint256 indexed milestoneIndex, string deliverableHash)`
- `MilestoneApproved(bytes32 indexed projectId, uint256 indexed milestoneIndex, uint256 amountReleased)`
- `PaymentReleased(bytes32 indexed projectId, uint256 indexed milestoneIndex, address indexed to, uint256 amount)`
- `DisputeRaised(bytes32 indexed projectId, uint256 indexed milestoneIndex, address indexed raisedBy, string reason)`
- `DisputeResolved(bytes32 indexed projectId, uint256 indexed milestoneIndex, uint8 outcome, uint256 freelancerAmount, uint256 clientAmount)`
- `ProjectCompleted(bytes32 indexed projectId, address indexed client, address indexed freelancer, uint256 totalAmount)`
