# Freelancer DApp — Engineering Specification & Development Plan

**Document:** SRS + Technical Design + Phased Implementation Plan  
**Version:** 2.0  
**Target:** Android DApp  
**Development Environment:** Android Studio  
**Mobile Framework:** React Native + TypeScript  
**Backend:** Node.js + TypeScript + Express  
**Database:** PostgreSQL  
**Smart Contracts:** Solidity + Foundry  
**Blockchain Client:** viem  
**Wallet:** Reown AppKit / WalletConnect-compatible EVM wallet  
**Initial Network:** Base Sepolia for development/testing; Base mainnet only after security review  
**Payment Asset:** USDC on the selected Base network  
**Contract Upgradeability:** Non-upgradeable MVP contracts  
**Dispute Authority:** 2-of-3 multisig arbitration authority for MVP

---

# 1. Project Definition

## 1.1 Product

A decentralized Android freelancer marketplace connecting **clients and freelancers**.

The platform allows:

- Clients to publish jobs.
- Freelancers to discover jobs and submit proposals.
- Clients to hire freelancers.
- Both parties to manage milestone-based projects.
- Clients to deposit USDC into smart-contract escrow.
- Freelancers to submit milestone deliverables.
- Clients to approve milestones.
- Smart contracts to release milestone payments.
- Completed work to create verifiable project history.
- Either party to initiate a dispute under defined conditions.

The system uses a **hybrid architecture**:

- Marketplace/application data is primarily off-chain.
- Financial settlement and critical project state are on-chain.
- Blockchain events provide verifiable anchors for completed projects and payments.

---

# 2. Core Product Principle

Blockchain is used where it provides a meaningful trust or settlement advantage.

Do **not** put normal marketplace data on-chain merely for decentralization.

## On-chain

- Escrow state
- Project identifier/hash
- Milestone identifiers and payment state
- USDC deposits
- USDC releases
- Refunds/cancellations
- Dispute resolution outcome
- Project completion event
- Relevant reputation anchor events

## Off-chain

- User profiles
- Job descriptions
- Proposals
- Chat messages
- Search/filter indexes
- Portfolio metadata
- File metadata
- Notifications
- UI preferences

Large files must never be stored directly on-chain.

---

# 3. User Model

## 3.1 Client

A user acting as a client can:

- Create/edit client profile
- Publish jobs
- Receive proposals
- Review freelancer profiles
- Accept/reject proposals
- Define project milestones
- Fund escrow
- Review deliverables
- Approve milestones
- Request revisions
- Raise disputes
- Review freelancers

## 3.2 Freelancer

A user acting as a freelancer can:

- Create/edit freelancer profile
- Add skills
- Add portfolio entries
- Browse/search jobs
- Submit proposals
- Negotiate project terms
- Accept projects
- Submit milestone deliverables
- Receive USDC payments
- Build verified project history
- Review clients

## 3.3 Dual-Sided User

A wallet is not permanently restricted to either role.

The same account can:

```text
Wallet
 ├── Client activity
 │    ├── Post jobs
 │    └── Hire freelancers
 │
 └── Freelancer activity
      ├── Apply to jobs
      └── Complete projects
```

Do not design the database as:

```text
role = CLIENT | FREELANCER
```

Instead, store user identity independently and model client/freelancer profile data separately where necessary.

---

# 4. MVP Scope

## 4.1 Authentication

- Wallet connection
- Wallet signature authentication
- Nonce generation
- Signature verification
- Session/JWT issuance
- Session revocation
- Wallet address association

The application must never request, transmit, or store private keys or seed phrases.

## 4.2 Profiles

### Freelancer

- Display name
- Profile image
- Bio
- Skills
- Experience
- Portfolio
- Hourly/project preference
- Availability
- Completed projects
- Verified project history

### Client

- Display name
- Company/organization
- Description
- Website
- Hiring history
- Completed projects

## 4.3 Jobs

Clients can:

- Create jobs
- Edit jobs before proposals are accepted
- Publish/unpublish jobs
- Close jobs
- View proposals

Jobs contain:

- Title
- Description
- Skills
- Budget
- Deadline
- Project type
- Expected deliverables
- Status
- Creation timestamp

## 4.4 Proposals

Freelancers can submit:

- Cover message
- Proposed price
- Estimated duration
- Proposed milestone structure
- Portfolio references

Clients can:

- View proposals
- View freelancer profiles
- Accept proposal
- Reject proposal
- Request changes

## 4.5 Projects

Accepted proposals create projects.

A project contains:

- Client
- Freelancer
- Contract/project ID
- Total USDC amount
- Milestones
- Project status
- Creation date
- Deadline

## 4.6 Milestones

Each milestone contains:

- Description
- Amount
- Deadline
- Deliverable reference
- Status

MVP milestone states:

```text
PENDING
FUNDED
SUBMITTED
REVISION_REQUESTED
APPROVED
PAID
DISPUTED
CANCELLED
```

---

# 5. Payment Architecture

## 5.1 Payment Decision

The MVP uses **USDC** rather than the native gas token for project payments.

Reason:

- Stable unit of account
- No freelancer exposure to native-token price volatility for project value
- Suitable for milestone-based contracts
- Standard ERC-20 interaction pattern

Gas is still paid using the network's native gas token.

## 5.2 Network

Development:

```text
Base Sepolia
```

Production target:

```text
Base Mainnet
```

Do not hard-code token addresses in application logic until the deployment configuration for the selected network is finalized.

Use environment/configuration values for:

```text
CHAIN_ID
RPC_URL
USDC_ADDRESS
ESCROW_CONTRACT_ADDRESS
ARBITRATION_MULTISIG_ADDRESS
BLOCK_EXPLORER_URL
```

## 5.3 Escrow Flow

```text
Client
  │
  │ Approve USDC spending
  ▼
USDC Contract
  │
  ▼
Escrow Contract
  │
  │ funds locked
  ▼
Freelancer completes milestone
  │
  ▼
Client approves
  │
  ▼
Escrow Contract
  │
  ▼
USDC transferred to Freelancer
```

The escrow contract must maintain an internal accounting invariant:

> Total releasable/refundable obligations must never exceed funds actually held for the relevant project.

---

# 6. Dispute Resolution — MVP Decision

Dispute resolution is intentionally **not fully decentralized in MVP**.

## 6.1 Authority

Use a **2-of-3 multisig arbitration authority**.

The three signer identities must be controlled independently.

No single signer can resolve a dispute alone.

## 6.2 Why

A fully decentralized arbitration system would add substantial complexity for:

- Oracle/arbitrator selection
- Evidence handling
- Incentives
- Sybil resistance
- Appeal mechanisms
- Arbitration fees

That belongs in a later version.

## 6.3 MVP Trust Assumption

The MVP explicitly trusts the 2-of-3 arbitration multisig to resolve disputes honestly.

This must be documented as a platform trust assumption.

The application must **not** claim that dispute resolution is fully decentralized.

## 6.4 Contract Behavior

Normal milestone approval:

```text
Client approves
      ↓
Payment released
```

Dispute:

```text
Client or Freelancer raises dispute
             ↓
       Funds remain locked
             ↓
       Evidence submitted
             ↓
    Arbitration multisig decides
             ↓
     Contract executes outcome
```

Possible outcomes:

```text
PAY_FREELANCER
REFUND_CLIENT
SPLIT_FUNDS
```

The contract must validate that the arbitration action is authorized by the configured arbitration authority.

---

# 7. Smart Contract Design

## 7.1 MVP Contract Policy

Contracts are **non-upgradeable**.

Do not use proxy contracts in MVP.

Reasons:

- Smaller attack surface
- Easier auditing
- Simpler testing
- No upgrade-admin trust assumption
- Clear immutable deployment

If a future version requires new functionality, deploy a new contract version and migrate projects according to an explicitly designed migration mechanism.

## 7.2 Contract Responsibilities

The escrow contract should handle:

```text
createProject()
fundProject()
createMilestone()
submitMilestone()
approveMilestone()
requestRevision()
raiseDispute()
resolveDispute()
cancelProject()
releasePayment()
refundClient()
splitDisputeFunds()
```

Exact function names may change during implementation if the state machine remains equivalent.

## 7.3 Events

Emit events for every important state transition:

```text
ProjectCreated
ProjectFunded
MilestoneCreated
MilestoneSubmitted
RevisionRequested
MilestoneApproved
PaymentReleased
DisputeRaised
DisputeResolved
ProjectCancelled
ProjectCompleted
```

Events should contain enough information for the backend indexer to reconstruct important blockchain state.

## 7.4 Smart Contract Invariants

Tests must establish properties including:

1. A freelancer cannot withdraw another project's funds.
2. A client cannot approve another client's project.
3. A milestone cannot be paid twice.
4. A disputed milestone cannot be normally released.
5. Total payments cannot exceed escrowed funds.
6. Only authorized parties can create/modify project state.
7. Only authorized arbitration authority can resolve disputes.
8. Cancelled projects cannot later release funds.
9. Completed projects cannot be reopened.
10. Invalid state transitions revert.
11. USDC transfers must be checked for success.
12. Reentrancy protections must be applied where applicable.

---

# 8. Reputation Architecture

Reputation must not be only a mutable database field.

## 8.1 On-chain Anchor

When a project completes, the escrow contract emits:

```text
ProjectCompleted(
    projectId,
    client,
    freelancer,
    totalAmount
)
```

The event becomes the verifiable blockchain anchor.

## 8.2 Off-chain Aggregation

The backend can calculate:

- Completed projects
- Completed milestones
- Total verified volume
- Disputes
- Client/freelancer reviews
- On-time completion metrics

But the backend must distinguish:

```text
VERIFIED ON-CHAIN FACT
```

from:

```text
OFF-CHAIN USER CLAIM
```

Example:

```text
Completed projects: 24
 └── 21 verified from blockchain events
 └── 3 pending verification
```

## 8.3 Future Compatibility

Design reputation data so that a future version can introduce:

- Verifiable credentials
- Attestations
- ZK reputation proofs
- Portable reputation

Do not implement ZK reputation in MVP.

---

# 9. Blockchain Indexing

Blockchain events must be indexed into PostgreSQL.

## 9.1 MVP Indexer

Use a backend worker based on **viem**.

The initial approach is polling/block-based log retrieval:

```text
Blockchain
    │
    ▼
viem getLogs / event filtering
    │
    ▼
Indexer Worker
    │
    ▼
PostgreSQL
```

The indexer must:

- Track last processed block
- Fetch new blocks/logs
- Decode contract events
- Store transaction hash
- Store block number
- Store event data
- Handle confirmations
- Avoid duplicate events
- Retry failed indexing
- Support reprocessing from a known block

## 9.2 Indexing Tables

At minimum:

```text
blockchain_events
blockchain_transactions
indexed_blocks
```

## 9.3 Reorganization Handling

Do not immediately treat a newly observed transaction as permanently final.

The indexer should use a configurable confirmation depth and support rollback/reprocessing for reorg scenarios.

---

# 10. React Native + viem Wallet Architecture

This integration must be validated **before building the full marketplace**.

## 10.1 Phase 1/2 POC

Build a minimal Android proof of concept that can:

1. Open wallet connection flow.
2. Connect an EVM wallet.
3. Display connected address.
4. Read the current chain ID.
5. Read a simple contract value.
6. Request a signed message.
7. Submit a testnet transaction.
8. Display transaction hash.
9. Read transaction receipt.

Do this before Phase 6.

## 10.2 React Native Compatibility

Treat React Native as a distinct runtime.

Before using viem extensively on-device, verify required runtime dependencies/polyfills for the selected versions of:

- Buffer
- crypto
- URL/Web APIs
- secure storage
- WalletConnect/Reown transport

Do not blindly copy browser configuration into React Native.

If a library requires a native capability, use the appropriate React Native package/native module rather than forcing browser-only APIs into the runtime.

## 10.3 Separation of Responsibilities

### Mobile

- Wallet connection
- User signature
- User-approved transaction
- Read-only blockchain calls where useful
- Transaction status UX

### Backend

- Database
- Event indexing
- Search
- Marketplace APIs
- Server-side blockchain reads
- Transaction verification
- Business rules

The backend must never hold user private keys.

---

# 11. Wallet Authentication

Use SIWE-style signed-message authentication or an equivalent nonce-based EVM authentication scheme.

Flow:

```text
Android
   │
   │ request nonce
   ▼
Backend
   │
   │ nonce
   ▼
Android
   │
   │ wallet signs message
   ▼
Wallet
   │
   ▼
Android
   │
   │ signature
   ▼
Backend
   │
   ├── recover address
   ├── validate nonce
   ├── validate expiry
   ├── consume nonce
   └── issue session
```

Security requirements:

- Nonces must be single-use.
- Nonces must expire.
- Signatures must be bound to the intended domain/application.
- Sessions must support revocation.
- Never use a static message for authentication.

---

# 12. Database Model

Initial entities:

```text
users
user_profiles
freelancer_profiles
client_profiles
skills
freelancer_skills
portfolio_items

jobs
job_skills
proposals

projects
project_milestones

reviews
messages
conversations

disputes
dispute_evidence

notifications

blockchain_transactions
blockchain_events
indexed_blocks
auth_nonces
sessions
```

## 12.1 Important Relationships

```text
User
 ├── FreelancerProfile
 ├── ClientProfile
 ├── Jobs
 ├── Proposals
 ├── Projects
 └── Reviews

Job
 ├── Skills
 └── Proposals

Proposal
 └── Project

Project
 ├── Milestones
 ├── Blockchain Transaction
 ├── Dispute
 └── Completion Event
```

---

# 13. Backend API

Initial API groups:

## Authentication

```text
POST /auth/nonce
POST /auth/verify
POST /auth/logout
```

## Users

```text
GET  /users/me
PATCH /users/me
GET  /users/:address
```

## Jobs

```text
GET  /jobs
POST /jobs
GET  /jobs/:id
PATCH /jobs/:id
POST /jobs/:id/close
```

## Proposals

```text
POST /jobs/:id/proposals
GET  /jobs/:id/proposals
GET  /proposals/:id
PATCH /proposals/:id
POST /proposals/:id/accept
POST /proposals/:id/reject
```

## Projects

```text
GET  /projects
POST /projects
GET  /projects/:id
```

## Milestones

```text
POST /projects/:id/milestones
GET  /projects/:id/milestones
POST /milestones/:id/submit
POST /milestones/:id/revision
POST /milestones/:id/dispute
```

## Messaging

```text
GET  /conversations
GET  /conversations/:id/messages
POST /conversations/:id/messages
```

## Blockchain

```text
GET /blockchain/transactions/:hash
GET /blockchain/projects/:projectId
```

---

# 14. File Storage

Use normal object storage for normal files.

Use IPFS only when content-addressed storage provides a real benefit.

## MVP Rule

Never store:

- Large files
- Images
- Videos
- ZIPs
- Source archives

directly on-chain.

For IPFS, use a managed pinning/storage provider rather than operating raw IPFS infrastructure during MVP.

The provider must be configurable rather than hard-coded into the application architecture.

---

# 15. Android Application Structure

Recommended structure:

```text
freelancer-dapp/
├── android/
├── src/
│   ├── components/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── jobs/
│   │   ├── proposals/
│   │   ├── projects/
│   │   ├── wallet/
│   │   ├── messages/
│   │   ├── profile/
│   │   └── disputes/
│   ├── navigation/
│   ├── services/
│   │   ├── api/
│   │   ├── blockchain/
│   │   └── wallet/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── config/
├── package.json
└── tsconfig.json
```

Keep blockchain code isolated from UI components.

Do not put contract calls directly inside screens.

---

# 16. Development Phases

# Phase 0 — Final Product Decisions

Lock:

- MVP scope
- User model
- Project state machine
- Milestone state machine
- USDC payment model
- Base Sepolia development network
- Base mainnet production target
- 2-of-3 multisig dispute authority
- Non-upgradeable contracts
- Reputation event model
- Indexing strategy

**Output:**

- Final SRS
- State diagrams
- Architecture decisions
- Threat model

---

# Phase 1 — Repository & Development Environment

Create a monorepo:

```text
freelancer-dapp/
├── apps/
│   ├── mobile/
│   └── backend/
├── packages/
│   ├── shared/
│   └── contracts/
└── docs/
```

Recommended separation:

```text
apps/mobile       → React Native Android app
apps/backend      → Node.js API + indexer
packages/shared   → shared TypeScript types/validation
packages/contracts → Foundry project
```

Set up:

- Git
- TypeScript
- ESLint
- Prettier
- Environment configuration
- Git hooks if useful
- CI checks

**Output:** Clean reproducible repository.

---

# Phase 2 — Android Foundation + Wallet POC

Build:

- React Native Android project
- Android Studio configuration
- Navigation
- Basic UI
- Wallet connection
- Address display
- Chain ID display
- Message signing
- Simple contract read
- Testnet transaction

Do not build the marketplace yet.

**Exit condition:**

A test Android build can connect to a wallet and successfully perform a basic Base Sepolia read/write flow.

---

# Phase 3 — Backend + Database

Implement:

- Express API
- PostgreSQL
- Migrations
- Validation
- Wallet authentication
- Session management
- User profiles

**Exit condition:**

A wallet can authenticate into the Android app and retrieve/update its profile.

---

# Phase 4 — Marketplace

Implement:

- Jobs
- Search
- Filters
- Freelancer profiles
- Proposals
- Proposal acceptance
- Client/freelancer dashboards

**Exit condition:**

A client can publish a job and a freelancer can submit a proposal and get hired.

---

# Phase 5 — Smart Contracts

Create Foundry project.

Implement:

- Escrow contract
- USDC integration
- Project creation
- Funding
- Milestones
- Submission state
- Approval
- Revision
- Payment release
- Cancellation
- Dispute state
- Multisig resolution

Write:

- Unit tests
- Fuzz tests
- Invariant tests

Run against:

```text
Anvil
```

**Exit condition:**

All core escrow invariants pass locally.

---

# Phase 6 — Testnet Contract Deployment + Indexer

Deploy contracts to Base Sepolia.

Set:

```text
USDC_ADDRESS
ESCROW_CONTRACT_ADDRESS
ARBITRATION_MULTISIG_ADDRESS
```

Implement backend blockchain indexer.

Indexer responsibilities:

- Poll blocks/logs
- Decode events
- Store events
- Track confirmations
- Handle duplicates
- Handle retries
- Track last indexed block

**Exit condition:**

A testnet project can be reconstructed from blockchain events into PostgreSQL.

---

# Phase 7 — Escrow Integration

Connect Android → wallet → smart contract.

Implement:

```text
Approve USDC
      ↓
Fund Escrow
      ↓
Wait for confirmation
      ↓
Update project
```

Then:

```text
Submit Milestone
      ↓
Client Approves
      ↓
Smart Contract Releases USDC
      ↓
Indexer Detects Payment
      ↓
Backend Updates Project
```

**Exit condition:**

Complete testnet money flow works end-to-end.

---

# Phase 8 — Project Management

Implement:

- Project dashboard
- Milestone dashboard
- Deliverables
- Revision requests
- Payment history
- Transaction links
- Project completion

**Exit condition:**

A client and freelancer can complete a multi-milestone project.

---

# Phase 9 — Reputation

Implement:

- Project completion indexing
- Verified project history
- Reviews
- Ratings
- Client/freelancer history

Clearly distinguish blockchain-verified information from off-chain reviews.

**Exit condition:**

A completed project produces a verifiable on-chain reputation anchor.

---

# Phase 10 — Messaging & Notifications

Implement:

- Conversations
- Project chat
- Message history
- Notifications
- Push notification infrastructure

**Exit condition:**

Client and freelancer can communicate during a project.

---

# Phase 11 — Disputes

Implement:

- Raise dispute
- Freeze normal milestone release
- Submit evidence
- Arbitration queue
- Multisig resolution
- On-chain resolution
- Backend synchronization

**Exit condition:**

Every possible dispute outcome can be executed and reconciled correctly.

---

# Phase 12 — Security Testing

## Smart Contract

Perform:

- Unit tests
- Fuzz tests
- Invariant tests
- Static analysis
- Manual review
- Access-control review
- Reentrancy review
- ERC-20 handling review

## Backend

Test:

- Authentication
- Authorization
- Rate limiting
- Input validation
- SQL injection
- File validation
- Session revocation
- Replay protection

## Android

Test:

- Wallet failures
- Wrong network
- Rejected transactions
- Insufficient USDC
- Insufficient gas
- Offline mode
- RPC failures
- Backend failures
- Expired sessions

---

# Phase 13 — Testnet Beta

Run complete real-world scenarios.

## Scenario A

```text
Client
 → Create job
 → Receive proposal
 → Hire freelancer
 → Fund escrow
 → Approve milestones
 → Complete project
```

## Scenario B

```text
Freelancer
 → Browse job
 → Apply
 → Get hired
 → Submit work
 → Receive payment
 → Review client
```

## Scenario C

```text
Dispute
 → Raise
 → Submit evidence
 → Arbitration
 → Resolve
 → Verify on-chain
```

Test failures at every step.

---

# Phase 14 — Production Preparation

Before mainnet:

- Security review
- Smart-contract review/audit as appropriate
- Multisig setup
- Production database
- Production RPC providers
- Monitoring
- Error tracking
- Backups
- Rate limits
- Abuse controls
- Privacy policy
- Terms of service
- Risk disclosures
- Mainnet deployment checklist

---

# Phase 15 — Production Release

Deploy:

```text
Base Mainnet
     │
     ▼
Smart Contracts
     │
     ▼
Backend
     │
     ▼
Indexer
     │
     ▼
Android Application
```

Start with controlled limits and monitor contract/application behavior.

---

# 17. Security Rules for Codex

Codex must follow these rules throughout development.

1. Never store private keys or seed phrases.
2. Never create a hidden custodial wallet for users.
3. Never hard-code production private keys.
4. Never hard-code secrets into the Android application.
5. Never bypass wallet confirmation for user funds.
6. Never assume a transaction succeeded without receipt verification.
7. Never trust frontend-provided wallet addresses without authentication/verification.
8. Never allow arbitrary contract addresses from API input.
9. Validate chain ID before financial transactions.
10. Validate USDC contract address against configured network.
11. Use integer/base-unit arithmetic for token amounts.
12. Never use floating-point arithmetic for USDC.
13. Prevent duplicate milestone payments.
14. Treat blockchain events as authoritative for settlement state.
15. Treat backend data as an index/cache where blockchain state exists.
16. Never mark a transaction successful merely because a wallet returned a transaction hash.
17. Handle transaction replacement, revert, timeout, and dropped transaction states.
18. Do not deploy mainnet contracts without tests passing.
19. Do not add upgradeability unless explicitly approved in a future architecture decision.
20. Keep dispute authority limited to the configured 2-of-3 multisig.

---

# 18. Coding Rules for Codex

## General

- TypeScript strict mode.
- No unnecessary `any`.
- Small, testable modules.
- Keep UI, API, and blockchain layers separate.
- Validate all external input.
- Use environment configuration.
- Do not duplicate business logic across mobile/backend/contracts.

## React Native

- Screens should not directly contain blockchain logic.
- Use service modules/hooks.
- Keep wallet state separate from application authentication.
- Handle loading/error/empty states.
- Handle rejected wallet transactions explicitly.

## Backend

- Controllers should remain thin.
- Business logic belongs in services.
- Database access belongs in repositories/data-access modules.
- Validate request bodies.
- Authenticate and authorize every protected endpoint.

## Solidity

- Follow checks-effects-interactions.
- Use established OpenZeppelin contracts/libraries where appropriate.
- Use custom errors where appropriate.
- Emit events for important state changes.
- Use explicit access control.
- Write invariant tests for financial properties.
- Avoid unnecessary complexity.

---

# 19. Definition of Done

A feature is not considered complete until:

- Code compiles.
- Type checking passes.
- Relevant tests pass.
- Error states are handled.
- Authentication/authorization is checked.
- Blockchain transactions are receipt-verified where applicable.
- Database migrations are included where needed.
- Android behavior is tested.
- No secrets are committed.
- Documentation is updated.

For smart-contract features, additionally:

- Unit tests pass.
- Fuzz tests pass where applicable.
- Invariant tests pass where applicable.
- Events are emitted.
- Indexer support exists for required events.

---

# 20. MVP End-to-End Success Criteria

The MVP is complete only when this entire flow works:

```text
                         CLIENT
                            │
                        Connect Wallet
                            │
                            ▼
                        Create Job
                            │
                            ▼
                     ┌──────────────┐
                     │     JOB      │
                     └──────┬───────┘
                            │
                     Freelancer Applies
                            │
                            ▼
                         PROPOSAL
                            │
                       Client Accepts
                            │
                            ▼
                         PROJECT
                            │
                     Create Milestones
                            │
                            ▼
                    Client Funds Escrow
                            │
                            ▼
                       USDC LOCKED
                            │
                            ▼
                   Freelancer Submits
                            │
                            ▼
                      CLIENT REVIEW
                       /           \
                  Approve          Dispute
                    │                 │
                    ▼                 ▼
             USDC RELEASE       2-of-3 MULTISIG
                    │                 │
                    └────────┬────────┘
                             ▼
                       PROJECT COMPLETE
                             │
                             ▼
                  ON-CHAIN COMPLETION EVENT
                             │
                             ▼
                    VERIFIED REPUTATION
```

The fundamental product test is:

> **A real client and freelancer can complete a multi-milestone project using USDC escrow through the Android application, while the blockchain provides verifiable settlement and project-completion evidence.**

---

# 21. Future V2/V3

Do not implement these during MVP unless explicitly approved:

- Fully decentralized arbitration
- DAO governance
- Upgradeable contracts
- Multi-chain deployment
- ZK reputation
- Decentralized identity
- AI freelancer matching
- Freelancer teams
- Bounties
- Skill credentials
- Cross-chain payments
- iOS application
- Web application

The architecture should leave room for these features without prematurely implementing them.

---

# 22. Suggested Repository Layout

```text
freelancer-dapp/
│
├── apps/
│   ├── mobile/
│   │   ├── android/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   │   ├── api/
│   │   │   │   ├── blockchain/
│   │   │   │   └── wallet/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── config/
│   │   └── package.json
│   │
│   └── backend/
│       ├── src/
│       │   ├── modules/
│       │   ├── blockchain/
│       │   │   ├── contracts/
│       │   │   ├── indexer/
│       │   │   └── clients/
│       │   ├── database/
│       │   ├── middleware/
│       │   └── config/
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   └── validation/
│   │
│   └── contracts/
│       ├── src/
│       ├── test/
│       ├── script/
│       ├── lib/
│       └── foundry.toml
│
├── docs/
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── SMART_CONTRACTS.md
│   └── API.md
│
└── README.md
```

---

# 23. First Coding Task

Do **not** start by building the marketplace UI.

The first implementation milestone is:

```text
1. Create repository structure.
2. Initialize React Native Android app.
3. Initialize Node.js/TypeScript backend.
4. Initialize PostgreSQL development environment.
5. Initialize Foundry project.
6. Configure Base Sepolia.
7. Implement wallet connection POC.
8. Read chain ID from Android.
9. Sign a test message.
10. Perform one harmless Base Sepolia transaction.
11. Verify the transaction receipt.
12. Only then proceed to marketplace development.
```

This sequence deliberately validates the highest-risk integration — **Android + wallet + EVM + viem/Reown** — before substantial application code is written.

---

# 24. Authoritative Documentation

Use current official documentation during implementation rather than relying on generated/stale examples:

- viem: https://viem.sh/
- Reown: https://docs.reown.com/
- Foundry: https://book.getfoundry.sh/
- Base: https://docs.base.org/
- Solidity: https://docs.soliditylang.org/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
- React Native: https://reactnative.dev/docs/getting-started

When APIs differ from this document because dependencies have changed, prefer the current official documentation and update the implementation notes rather than introducing deprecated APIs.

---

# 25. Important Engineering Decision Log

| Decision | MVP Choice | Reason |
|---|---|---|
| Mobile | React Native + TypeScript | Existing TS/React expertise and Android target |
| IDE | Android Studio | Android development/debugging |
| Blockchain | EVM | Ecosystem and tooling |
| Contract framework | Foundry | Solidity-native testing, fuzzing, Anvil |
| Blockchain client | viem | Type-safe EVM interaction |
| Wallet | Reown AppKit / WalletConnect-compatible | Mobile wallet interoperability |
| Development network | Base Sepolia | Low-cost EVM testnet |
| Production network | Base Mainnet | Low-cost EVM deployment target |
| Project currency | USDC | Stable unit of account |
| Contract upgradeability | None in MVP | Reduce trust/complexity |
| Disputes | 2-of-3 multisig | Avoid unilateral admin control while keeping MVP feasible |
| Reputation | Hybrid | On-chain completion anchor + off-chain aggregation |
| Indexing | Backend viem indexer | Simple MVP architecture |
| Marketplace data | PostgreSQL | Search/query efficiency |
| Large files | Object storage/IPFS | Avoid on-chain storage |
| Arbitration | Platform-controlled multisig | Fully decentralized arbitration deferred to V2 |

---

# 26. Instruction to Coding Agent

This document is the source of truth for the initial implementation.

Before writing substantial code:

1. Inspect the existing repository.
2. Identify what is already implemented.
3. Do not overwrite existing working code without checking it.
4. Follow the architecture and phase order in this document.
5. Complete one phase at a time.
6. Run tests and type checks after meaningful changes.
7. Do not silently change architectural decisions.
8. If a technical decision must change, document the reason and update the relevant decision log.
9. Never use real funds during development.
10. Use Base Sepolia/test assets until production deployment is explicitly authorized.
11. Never commit secrets, private keys, seed phrases, API keys, or production credentials.
12. Prefer official, current documentation when library APIs differ from examples in this document.
13. Keep the system runnable at the end of every phase.
14. Do not implement V2 features during MVP unless explicitly requested.

The immediate objective is **not** to build every feature.

The immediate objective is to establish a clean, testable foundation and prove:

**Android → Wallet → Base Sepolia → Smart Contract → USDC Escrow → Backend Indexer → Verified Project State.**
