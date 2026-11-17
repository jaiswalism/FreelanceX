import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const rawRpc = process.env.RPC_URL;
const rpcUrl = (!rawRpc || rawRpc.includes('rpc.sepolia.org'))
  ? 'https://ethereum-sepolia-rpc.publicnode.com'
  : rawRpc;

const defaultEscrow = '0xcb4003d9f5c5793285780bb1ee969a40e3d40c39';
const rawEscrow = process.env.ESCROW_CONTRACT_ADDRESS;
const escrowAddress = (!rawEscrow || rawEscrow === '0x74239ad6bc5fb4f1b57eb056d3c75969b9651dd0' || rawEscrow === '0x0000000000000000000000000000000000000000')
  ? defaultEscrow
  : rawEscrow;

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  rpcUrl,
  jwtSecret: process.env.JWT_SECRET || 'freelancerx-dev-secret-key-32charsmin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  usdcAddress: (process.env.USDC_ADDRESS || '0x7a41e8dd0fdf0bf6ea984602e8e148f7e409a8de') as `0x${string}`,
  escrowAddress: escrowAddress as `0x${string}`,
};
