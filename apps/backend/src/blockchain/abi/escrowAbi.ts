export const FREELANCER_ESCROW_ABI = [
  {
    type: 'event',
    name: 'ProjectCreated',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'client', type: 'address' },
      { indexed: true, name: 'freelancer', type: 'address' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ProjectFunded',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'MilestoneSubmitted',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'deliverableHash', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'RevisionRequested',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'MilestoneApproved',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'PaymentReleased',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'DisputeRaised',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: true, name: 'raisedBy', type: 'address' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'DisputeResolved',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'outcome', type: 'uint8' },
      { indexed: false, name: 'freelancerAmount', type: 'uint256' },
      { indexed: false, name: 'clientAmount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ProjectCompleted',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: true, name: 'client', type: 'address' },
      { indexed: true, name: 'freelancer', type: 'address' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ProjectCancelled',
    inputs: [
      { indexed: true, name: 'projectId', type: 'bytes32' },
      { indexed: false, name: 'refundedAmount', type: 'uint256' },
    ],
  },
] as const;
