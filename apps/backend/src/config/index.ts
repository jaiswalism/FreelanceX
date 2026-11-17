import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  rpcUrl: process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
  jwtSecret: process.env.JWT_SECRET || 'freelancerx-dev-secret-key-32charsmin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  usdcAddress: (process.env.USDC_ADDRESS || '0x7a41e8dd0fdf0bf6ea984602e8e148f7e409a8de') as `0x${string}`,
  escrowAddress: (process.env.ESCROW_CONTRACT_ADDRESS || '0x74239ad6bc5fb4f1b57eb056d3c75969b9651dd0') as `0x${string}`,
};
