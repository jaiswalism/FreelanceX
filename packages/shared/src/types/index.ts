export type HexAddress = `0x${string}`;

export type UserRole = 'CLIENT' | 'FREELANCER';

export interface User {
  id: string;
  address: HexAddress;
  createdAt: string;
  updatedAt: string;
  freelancerProfile?: FreelancerProfile;
  clientProfile?: ClientProfile;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  hourlyRate?: number;
  skills: string[];
  portfolio: PortfolioItem[];
  completedProjectsCount: number;
  verifiedProjectsCount: number;
  rating: number;
  totalEarningsUsdc: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  displayName: string;
  companyName?: string;
  avatarUrl?: string;
  description?: string;
  website?: string;
  totalSpentUsdc: string;
  hiredProjectsCount: number;
  completedProjectsCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl?: string;
  tags: string[];
  verifiedOnChain?: boolean;
  projectContractId?: string;
}

export type JobStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Job {
  id: string;
  clientId: string;
  clientAddress: HexAddress;
  title: string;
  description: string;
  skills: string[];
  budgetUsdc: string; // in human readable format or base units
  budgetBaseUnits: string; // in 6 decimal base units e.g. 500000000 for 500 USDC
  estimatedDurationDays?: number;
  status: JobStatus;
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
  clientProfile?: Partial<ClientProfile>;
}

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface ProposedMilestone {
  description: string;
  amountUsdc: string;
  durationDays: number;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerAddress: HexAddress;
  coverLetter: string;
  proposedPriceUsdc: string;
  proposedDurationDays: number;
  proposedMilestones: ProposedMilestone[];
  status: ProposalStatus;
  createdAt: string;
  freelancerProfile?: Partial<FreelancerProfile>;
}

export type ProjectStatus =
  | 'INITIALIZED'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type MilestoneStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'PAID'
  | 'DISPUTED'
  | 'CANCELLED';

export interface Milestone {
  id: string;
  projectId: string;
  index: number;
  title: string;
  description: string;
  amountUsdc: string;
  amountBaseUnits: string;
  deadline?: string;
  status: MilestoneStatus;
  deliverableDescription?: string;
  deliverableUri?: string;
  submissionDate?: string;
  paidDate?: string;
  paymentTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  onChainProjectId?: string; // numeric or bytes32 ID on smart contract
  jobId: string;
  proposalId: string;
  clientId: string;
  clientAddress: HexAddress;
  freelancerId: string;
  freelancerAddress: HexAddress;
  title: string;
  totalAmountUsdc: string;
  totalAmountBaseUnits: string;
  escrowContractAddress: HexAddress;
  status: ProjectStatus;
  milestones: Milestone[];
  fundedTxHash?: string;
  completedTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export type DisputeOutcome = 'PAY_FREELANCER' | 'REFUND_CLIENT' | 'SPLIT_FUNDS';

export interface Dispute {
  id: string;
  projectId: string;
  milestoneId?: string;
  raisedByAddress: HexAddress;
  reason: string;
  evidenceUris: string[];
  outcome?: DisputeOutcome;
  resolvedTxHash?: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface BlockchainTransaction {
  hash: HexAddress;
  from: HexAddress;
  to: HexAddress;
  chainId: number;
  blockNumber: number;
  status: 'PENDING' | 'SUCCESS' | 'REVERTED';
  eventName?: string;
  timestamp: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}
