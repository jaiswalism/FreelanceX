const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { sepolia } = require('viem/chains');

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x7be67f8f958e8240b7e13f1622129c41e4a1fec55e481f1df3108ce3569ba387';
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log('Deployer Address:', account.address);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Deployer Balance (ETH):', Number(balance) / 1e18);

  const mockUsdcArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../out/MockUSDC.sol/MockUSDC.json'), 'utf8')
  );
  const escrowArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../out/FreelancerEscrow.sol/FreelancerEscrow.json'), 'utf8')
  );

  console.log('\n--- Step 1: Deploying MockUSDC ---');
  const usdcTxHash = await walletClient.deployContract({
    abi: mockUsdcArtifact.abi,
    bytecode: mockUsdcArtifact.bytecode.object,
    gas: 4500000n,
  });
  console.log('MockUSDC deploy tx submitted:', usdcTxHash);
  const usdcReceipt = await publicClient.waitForTransactionReceipt({ hash: usdcTxHash });
  if (usdcReceipt.status !== 'success') {
    throw new Error('MockUSDC deployment failed! Status: ' + usdcReceipt.status);
  }
  const usdcAddress = usdcReceipt.contractAddress;
  console.log('✅ MockUSDC successfully deployed at:', usdcAddress);

  console.log('\n--- Step 2: Deploying FreelancerEscrow ---');
  const arbiters = [
    account.address,
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  ];
  const escrowTxHash = await walletClient.deployContract({
    abi: escrowArtifact.abi,
    bytecode: escrowArtifact.bytecode.object,
    args: [usdcAddress, arbiters],
    gas: 12000000n,
  });
  console.log('FreelancerEscrow deploy tx submitted:', escrowTxHash);
  const escrowReceipt = await publicClient.waitForTransactionReceipt({ hash: escrowTxHash });
  if (escrowReceipt.status !== 'success') {
    throw new Error('FreelancerEscrow deployment failed! Status: ' + escrowReceipt.status);
  }
  const escrowAddress = escrowReceipt.contractAddress;
  console.log('✅ FreelancerEscrow successfully deployed at:', escrowAddress);

  console.log('\n--- Step 3: Verifying Contract Configurations ---');
  const userUsdcBalance = await publicClient.readContract({
    address: usdcAddress,
    abi: mockUsdcArtifact.abi,
    functionName: 'balanceOf',
    args: [account.address],
  });
  console.log('Deployer MockUSDC Balance:', Number(userUsdcBalance) / 1e6, 'USDC');

  const escrowUsdc = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'usdc',
  });
  console.log('Escrow USDC Address configured:', escrowUsdc);

  console.log('\n================ DEPLOYMENT SUMMARY ================');
  console.log('Network: Ethereum Sepolia (ChainId: 11155111)');
  console.log('Deployer:', account.address);
  console.log('MockUSDC Address:', usdcAddress);
  console.log('FreelancerEscrow Address:', escrowAddress);
  console.log('MockUSDC Tx:', usdcTxHash);
  console.log('Escrow Tx:', escrowTxHash);
  console.log('====================================================\n');

  return { usdcAddress, escrowAddress, usdcTxHash, escrowTxHash };
}

main().catch((err) => {
  console.error('Fatal Deployment Error:', err);
  process.exit(1);
});
