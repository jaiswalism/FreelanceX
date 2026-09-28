# FreelancerX Backend API Reference

Base URL: `http://localhost:4000` (or configured API host)

## Authentication (SIWE)
- `POST /auth/nonce` - Generate single-use nonce for wallet address
- `POST /auth/verify` - Verify signed message, issue JWT session token
- `POST /auth/logout` - Revoke current session

## User & Profiles
- `GET /users/me` - Current authenticated user & combined profiles
- `PATCH /users/me/freelancer` - Update freelancer profile, skills, portfolio
- `PATCH /users/me/client` - Update client profile
- `GET /users/:address` - Public profile & verified on-chain history

## Jobs & Proposals
- `GET /jobs` - List open jobs (supports query, tags, budget filter)
- `POST /jobs` - Post a new job (client auth required)
- `GET /jobs/:id` - Job details & submitted proposals (if owner)
- `POST /jobs/:id/proposals` - Submit proposal with milestone structure
- `POST /proposals/:id/accept` - Accept proposal & initialize project

## Projects & Escrow
- `GET /projects` - Active/completed projects for current user
- `GET /projects/:id` - Project details, milestone states, tx hashes
- `POST /projects/:id/milestones/:index/submit` - Freelancer deliverable submission
- `POST /projects/:id/milestones/:index/dispute` - Raise dispute on milestone
