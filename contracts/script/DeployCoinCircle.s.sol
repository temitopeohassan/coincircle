// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CoinCircle.sol";

contract DeployCoinCircle is Script {
    function run() external {
        // Load private key
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        // Broadcast deployment
        vm.startBroadcast(deployerKey);

        CoinCircle coinCircle = new CoinCircle();

        vm.stopBroadcast();

        console2.log("CoinCircle deployed at:", address(coinCircle));
    }
}
