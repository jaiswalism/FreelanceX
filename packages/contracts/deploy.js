const { createWalletClient, createPublicClient, http } = require('viem');
const { mnemonicToAccount } = require('viem/accounts');
const { sepolia } = require('viem/chains');
const fs = require('fs');
const path = require('path');

async function main() {
  const account = mnemonicToAccount('crop theory mouse cherry pitch call shift ensure loop identify cattle woman');
  console.log('Deployer account:', account.address);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com')
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com')
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Deployer ETH balance:', balance.toString());

  const artifactPath = path.join(__dirname, 'out/FreelancerEscrow.sol/FreelancerEscrow.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const usdcAddress = '0x7a41e8dd0fdf0bf6ea984602e8e148f7e409a8de';
  const arbiters = [
    account.address,
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  ];

  console.log('Deploying upgraded FreelancerEscrow...');

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    args: [usdcAddress, arbiters]
  });

  console.log('Deploy tx hash:', hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('NEW FREELANCER ESCROW DEPLOYED AT:', receipt.contractAddress);
}

main().catch(err => {
  console.error('Deploy error:', err);
  process.exit(1);
});

