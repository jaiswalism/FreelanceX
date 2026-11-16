import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  rpcUrl: process.env.RPC_URL || 'https://rpc.sepolia.org',
  jwtSecret: process.env.JWT_SECRET || 'freelancerx-dev-secret-key-32charsmin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  usdcAddress: (process.env.USDC_ADDRESS || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238') as `0x${string}`,
  escrowAddress: (process.env.ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
};
