// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {FreelancerEscrow} from "src/FreelancerEscrow.sol";
import {MockUSDC} from "test/mocks/MockUSDC.sol";

contract DeployEscrowScript is Script {
    FreelancerEscrow public escrow;
    MockUSDC public usdc;

    function setUp() public {}

    function run() public returns (address escrowAddr, address usdcAddr) {
        address deployer = msg.sender;
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        address arbitrator1 = vm.envOr("ARBITRATOR_1", deployer);
        address arbitrator2 = vm.envOr("ARBITRATOR_2", address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8));
        address arbitrator3 = vm.envOr("ARBITRATOR_3", address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC));

        vm.startBroadcast();

        if (usdcAddress == address(0)) {
            console.log("No USDC_ADDRESS provided. Deploying MockUSDC...");
            usdc = new MockUSDC();
            usdcAddress = address(usdc);
            console.log("MockUSDC deployed at:", usdcAddress);
        }

        address[3] memory arbiters = [arbitrator1, arbitrator2, arbitrator3];

        escrow = new FreelancerEscrow(usdcAddress, arbiters);
        escrowAddr = address(escrow);
        usdcAddr = usdcAddress;

        console.log("FreelancerEscrow deployed at:", escrowAddr);
        console.log("Arbitrator 1:", arbitrator1);
        console.log("Arbitrator 2:", arbitrator2);
        console.log("Arbitrator 3:", arbitrator3);

        vm.stopBroadcast();
    }
}

