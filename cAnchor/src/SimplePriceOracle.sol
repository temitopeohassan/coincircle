// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SimplePriceOracle
 * @dev A simple price oracle for cAnchor stablecoin system
 * In production, integrate with Chainlink, Band Protocol, or Celo oracles
 */
contract SimplePriceOracle is AccessControl, ReentrancyGuard {
    bytes32 public constant ORACLE_UPDATER_ROLE = keccak256("ORACLE_UPDATER_ROLE");
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(address => PriceData) public priceFeeds;
    uint256 public constant MAX_PRICE_AGE = 3600; // 1 hour
    
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_UPDATER_ROLE, admin);
        
        // Initialize with some default prices (18 decimals)
        // cUSD = $1.00
        priceFeeds[0x765DE816845861e75A25fCA122bb6898B8B1282a] = PriceData({
            price: 1e18,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // cEUR = $1.10 (approximate)
        priceFeeds[0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73] = PriceData({
            price: 110e16,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // CELO = $0.50 (example price)
        priceFeeds[0x471EcE3750Da237f93B8E339c536989b8978a438] = PriceData({
            price: 5e17,
            timestamp: block.timestamp,
            isActive: true
        });
    }
    
    function updatePrice(
        address token,
        uint256 price
    ) external onlyRole(ORACLE_UPDATER_ROLE) {
        require(price > 0, "Invalid price");
        
        priceFeeds[token] = PriceData({
            price: price,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit PriceUpdated(token, price, block.timestamp);
    }
    
    function getPrice(address token) external view returns (uint256 price, uint256 timestamp) {
        PriceData memory data = priceFeeds[token];
        require(data.isActive, "Price feed not active");
        require(block.timestamp - data.timestamp <= MAX_PRICE_AGE, "Price data too old");
        
        return (data.price, data.timestamp);
    }
    
    function isStale(address token, uint256 maxAge) external view returns (bool) {
        PriceData memory data = priceFeeds[token];
        return !data.isActive || (block.timestamp - data.timestamp > maxAge);
    }
    
    function activateFeed(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        priceFeeds[token].isActive = true;
    }
    
    function deactivateFeed(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        priceFeeds[token].isActive = false;
    }
}