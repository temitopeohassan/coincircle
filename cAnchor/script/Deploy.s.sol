// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/CAnchor.sol";
import "../src/SimplePriceOracle.sol";

contract DeployCAnchor is Script {
    // Celo Mainnet addresses
    address constant CELO_MAINNET_cUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant CELO_MAINNET_cEUR = 0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73;
    address constant CELO_MAINNET_CELO = 0x471EcE3750Da237f93B8E339c536989b8978a438;
    
    // Celo Alfajores (testnet) addresses
    address constant CELO_TESTNET_cUSD = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address constant CELO_TESTNET_cEUR = 0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F;
    address constant CELO_TESTNET_CELO = 0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        // Determine which network we're on
        bool isMainnet = block.chainid == 42220; // Celo mainnet
        bool isTestnet = block.chainid == 44787;  // Celo Alfajores testnet
        
        require(isMainnet || isTestnet, "Unsupported network");
        
        // Set addresses based on network
        address cUSD = isMainnet ? CELO_MAINNET_cUSD : CELO_TESTNET_cUSD;
        address cEUR = isMainnet ? CELO_MAINNET_cEUR : CELO_TESTNET_cEUR;
        address CELO = isMainnet ? CELO_MAINNET_CELO : CELO_TESTNET_CELO;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Price Oracle
        console.log("Deploying SimplePriceOracle...");
        SimplePriceOracle priceOracle = new SimplePriceOracle(deployer);
        console.log("SimplePriceOracle deployed at:", address(priceOracle));
        
        // 2. Deploy cAnchor implementation
        console.log("Deploying cAnchor implementation...");
        CAnchor implementation = new CAnchor();
        console.log("cAnchor implementation deployed at:", address(implementation));
        
        // 3. Prepare initialization data
        bytes memory initData = abi.encodeWithSelector(
            CAnchor.initialize.selector,
            address(priceOracle),
            cUSD,
            cEUR,
            CELO,
            deployer
        );
        
        // 4. Deploy proxy
        console.log("Deploying ERC1967Proxy...");
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        console.log("ERC1967Proxy deployed at:", address(proxy));
        
        // 5. Get the proxied contract
        CAnchor cAnchor = CAnchor(address(proxy));
        
        // 6. Verify deployment
        console.log("Verifying deployment...");
        console.log("cAnchor name:", cAnchor.name());
        console.log("cAnchor symbol:", cAnchor.symbol());
        console.log("cAnchor decimals:", cAnchor.decimals());
        console.log("Total supply:", cAnchor.totalSupply());
        
        // 7. Set up initial oracle prices (if needed)
        console.log("Setting up initial oracle prices...");
        
        // Update prices with current approximate values
        if (isTestnet) {
            // On testnet, we can set example prices
            priceOracle.updatePrice(cUSD, 1e18);      // $1.00
            priceOracle.updatePrice(cEUR, 108e16);    // $1.08
            priceOracle.updatePrice(CELO, 65e16);     // $0.65
            priceOracle.updatePrice(address(cAnchor), 1e18); // $1.00 target
        }
        
        vm.stopBroadcast();
        
        // 8. Log deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", isMainnet ? "Celo Mainnet" : "Celo Alfajores Testnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("SimplePriceOracle:", address(priceOracle));
        console.log("cAnchor Implementation:", address(implementation));
        console.log("cAnchor Proxy (main contract):", address(proxy));
        console.log("cUSD:", cUSD);
        console.log("cEUR:", cEUR);
        console.log("CELO:", CELO);
        
        // 9. Save deployment info to file
        string memory deploymentInfo = string(abi.encodePacked(
            "# cAnchor Deployment Information\n\n",
            "- **Network**: ", isMainnet ? "Celo Mainnet" : "Celo Alfajores Testnet", "\n",
            "- **Chain ID**: ", vm.toString(block.chainid), "\n",
            "- **Deployer**: ", vm.toString(deployer), "\n",
            "- **SimplePriceOracle**: ", vm.toString(address(priceOracle)), "\n",
            "- **cAnchor Implementation**: ", vm.toString(address(implementation)), "\n",
            "- **cAnchor Proxy (Main Contract)**: ", vm.toString(address(proxy)), "\n",
            "- **cUSD**: ", vm.toString(cUSD), "\n",
            "- **cEUR**: ", vm.toString(cEUR), "\n",
            "- **CELO**: ", vm.toString(CELO), "\n\n",
            "## Contract Verification\n\n",
            "To verify the contracts on Celoscan, use:\n\n",
            "```bash\n",
            "forge verify-contract ", vm.toString(address(priceOracle)), " SimplePriceOracle --chain-id ", vm.toString(block.chainid), "\n",
            "forge verify-contract ", vm.toString(address(implementation)), " CAnchor --chain-id ", vm.toString(block.chainid), "\n",
            "```\n"
        ));
        
        vm.writeFile("deployment-info.md", deploymentInfo);
        console.log("\nDeployment info saved to deployment-info.md");
    }
}

// Utility script for post-deployment setup
contract SetupCAnchor is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cAnchorProxy = vm.envAddress("CANCHOR_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        CAnchor cAnchor = CAnchor(cAnchorProxy);
        
        // Additional setup if needed
        console.log("Setting up cAnchor post-deployment...");
        
        // Example: Grant roles to specific addresses
        // address stabilizer = 0x...; // Replace with actual stabilizer address
        // cAnchor.grantRole(cAnchor.STABILIZER_ROLE(), stabilizer);
        
        vm.stopBroadcast();
        
        console.log("Setup completed");
    }
}