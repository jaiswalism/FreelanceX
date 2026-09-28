# FreelancerX Architecture & Technical Design

## 1. System Overview

FreelancerX is a hybrid decentralized freelancer marketplace targeting Android on the **Base Sepolia** / **Base Mainnet** EVM network.

```
┌──────────────────────────────────────────────────────────┐
│                   Android Mobile App                     │
│    (React Native + TypeScript + viem + Reown AppKit)     │
└──────────────┬─────────────────────────────┬─────────────┘
               │ SIWE Auth / REST / WS       │ viem EVM RPC / Signatures
               ▼                             ▼
┌──────────────────────────────┐    ┌───────────────────────────────────┐
│     Node.js Express API      │    │       Base Sepolia Network        │
│   (TypeScript + PostgreSQL)  │    │                                   │
│  - Marketplace Data          │    │ - FreelancerEscrow.sol            │
│  - Off-chain Profiles & Jobs │    │ - USDC Token (0x036CbD...)        │
│  - Event Indexer Worker      │◄───┤ - 2-of-3 Multisig Arbitration     │
└──────────────────────────────┘    └───────────────────────────────────┘
```

## 2. On-Chain vs. Off-Chain Responsibilities

### On-Chain (Smart Contracts)
- Project funding with USDC (`fundProject`)
- Milestone escrow lockup & balance accounting
- Milestone release upon client approval (`approveMilestone`)
- Dispute freeze & 2-of-3 multisig resolution execution (`resolveDispute`)
- Project completion & verifiable reputation events (`ProjectCompleted`)

### Off-Chain (PostgreSQL + API)
- User, freelancer, and client profiles
- Job listings, tags, requirements, search filters
- Proposals & cover letters
- Chat messaging & real-time notifications
- Blockchain log indexing & historical cache

## 3. Security Invariants
1. Private keys and seed phrases are never accessed, stored, or transmitted by the app or backend.
2. USDC funds held in escrow strictly match total unreleased milestone obligations.
3. Only the client or freelancer involved in a project may initiate actions or disputes on that project.
4. Only the authorized 2-of-3 multisig arbitration authority can execute dispute payouts or refunds.
5. All financial calculations use 6-decimal integer base units (never IEEE-754 floating point numbers).
