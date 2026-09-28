import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  chainId: parseInt(process.env.CHAIN_ID || '84532', 10),
  rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
  jwtSecret: process.env.JWT_SECRET || 'freelancerx-dev-secret-key-32charsmin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  usdcAddress: (process.env.USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as `0x${string}`,
  escrowAddress: (process.env.ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
};
