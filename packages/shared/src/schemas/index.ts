import { z } from 'zod';

export const HexAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Invalid EVM Ethereum address format',
});

export const AuthNonceRequestSchema = z.object({
  address: HexAddressSchema,
});

export const AuthVerifyRequestSchema = z.object({
  address: HexAddressSchema,
  signature: z.string().min(1, 'Signature is required'),
  nonce: z.string().min(1, 'Nonce is required'),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  email: z.string().email().or(z.string().min(5)).optional(),
  resumeUrl: z.string().url().or(z.string().min(5)).optional(),
  bio: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  title: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().nonnegative().optional(),
  companyName: z.string().max(100).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

export const CreateJobSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  skills: z.array(z.string()).min(1),
  budgetUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Must be a valid positive USDC decimal number'),
  estimatedDurationDays: z.number().int().positive().optional(),
});

export const ProposedMilestoneSchema = z.object({
  description: z.string().min(3).max(200),
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Must be valid positive USDC amount'),
  durationDays: z.number().int().positive(),
});

export const CreateProposalSchema = z.object({
  jobId: z.string().uuid().or(z.string().min(1)),
  coverLetter: z.string().min(20).max(3000),
  proposedPriceUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Must be valid positive USDC amount'),
  proposedDurationDays: z.number().int().positive(),
  proposedMilestones: z.array(ProposedMilestoneSchema).min(1),
});

export const SubmitMilestoneSchema = z.object({
  deliverableDescription: z.string().min(10).max(2000),
  deliverableUri: z.string().url().or(z.string().min(1)).optional(),
});

export const RequestRevisionSchema = z.object({
  reason: z.string().min(10).max(2000),
});

export const RaiseDisputeSchema = z.object({
  reason: z.string().min(20).max(2000),
  evidenceUris: z.array(z.string()).default([]),
});
