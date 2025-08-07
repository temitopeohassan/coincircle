// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

// Celo-specific imports
interface ICeloToken {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Oracle interface for price feeds
interface IPriceOracle {
    function getPrice(address token) external view returns (uint256 price, uint256 timestamp);
    function isStale(address token, uint256 maxAge) external view returns (bool);
}

/**
 * @title cAnchor Stablecoin
 * @dev A hybrid-pegged stablecoin for the Celo ecosystem
 * Features:
 * - Hybrid collateralization (over-collateralized + algorithmic)
 * - Oracle-based price stability
 * - Celo native token integration
 * - Emergency controls and upgradability
 */
contract CAnchor is 
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant STABILIZER_ROLE = keccak256("STABILIZER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Stability mechanism parameters
    uint256 public constant TARGET_PRICE = 1e18; // $1.00 with 18 decimals
    uint256 public constant PRICE_DEVIATION_THRESHOLD = 5e15; // 0.5% deviation
    uint256 public constant MIN_COLLATERAL_RATIO = 150; // 150% minimum collateralization
    uint256 public constant LIQUIDATION_RATIO = 120; // 120% liquidation threshold
    uint256 public constant STABILITY_FEE = 50; // 0.5% annual stability fee (basis points)
    uint256 public constant MAX_ORACLE_AGE = 3600; // 1 hour max oracle age

    // State variables
    IPriceOracle public priceOracle;
    ICeloToken public cUSD;
    ICeloToken public cEUR;
    ICeloToken public celo;
    
    uint256 public totalCollateralValue;
    uint256 public lastRebalanceTime;
    uint256 public stabilityFeeRate;
    uint256 public targetCollateralRatio;
    bool public emergencyMode;

    // Collateral tracking
    mapping(address => uint256) public collateralBalances; // user -> collateral amount
    mapping(address => uint256) public debtBalances; // user -> debt amount
    mapping(address => bool) public supportedCollaterals;
    mapping(address => uint256) public collateralWeights; // collateral weight in basis points

    // Events
    event Mint(address indexed user, uint256 amount, uint256 collateralUsed);
    event Burn(address indexed user, uint256 amount, uint256 collateralReleased);
    event Liquidation(address indexed user, uint256 debtAmount, uint256 collateralLiquidated);
    event Rebalance(uint256 newPrice, uint256 totalSupply, uint256 timestamp);
    event CollateralAdded(address indexed collateral, uint256 weight);
    event EmergencyModeToggled(bool enabled);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _priceOracle,
        address _cUSD,
        address _cEUR,
        address _celo,
        address _admin
    ) public initializer {
        __ERC20_init("cAnchor", "cANCHOR");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _admin);
        _grantRole(STABILIZER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);

        // Initialize contracts
        priceOracle = IPriceOracle(_priceOracle);
        cUSD = ICeloToken(_cUSD);
        cEUR = ICeloToken(_cEUR);
        celo = ICeloToken(_celo);

        // Initialize stability parameters
        stabilityFeeRate = STABILITY_FEE;
        targetCollateralRatio = MIN_COLLATERAL_RATIO;
        lastRebalanceTime = block.timestamp;

        // Set up initial supported collaterals
        supportedCollaterals[_cUSD] = true;
        supportedCollaterals[_cEUR] = true;
        supportedCollaterals[_celo] = true;
        
        collateralWeights[_cUSD] = 4000; // 40%
        collateralWeights[_cEUR] = 3000; // 30%
        collateralWeights[_celo] = 3000; // 30%
    }

    /**
     * @dev Mint cAnchor tokens by depositing collateral
     * @param collateralToken The collateral token to deposit
     * @param collateralAmount Amount of collateral to deposit
     * @param mintAmount Amount of cAnchor to mint
     */
    function mint(
        address collateralToken,
        uint256 collateralAmount,
        uint256 mintAmount
    ) external nonReentrant whenNotPaused {
        require(supportedCollaterals[collateralToken], "Unsupported collateral");
        require(collateralAmount > 0 && mintAmount > 0, "Invalid amounts");
        
        // Check collateralization ratio
        uint256 collateralValue = getCollateralValue(collateralToken, collateralAmount);
        uint256 requiredCollateral = (mintAmount * targetCollateralRatio) / 100;
        require(collateralValue >= requiredCollateral, "Insufficient collateral");

        // Transfer collateral from user
        ICeloToken(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);

        // Update user's positions
        collateralBalances[msg.sender] += collateralAmount;
        debtBalances[msg.sender] += mintAmount;
        totalCollateralValue += collateralValue;

        // Mint tokens
        _mint(msg.sender, mintAmount);

        emit Mint(msg.sender, mintAmount, collateralAmount);
    }

    /**
     * @dev Burn cAnchor tokens to redeem collateral
     * @param burnAmount Amount of cAnchor to burn
     * @param collateralToken Collateral token to receive
     */
    function burn(
        uint256 burnAmount,
        address collateralToken
    ) external nonReentrant {
        require(supportedCollaterals[collateralToken], "Unsupported collateral");
        require(burnAmount > 0, "Invalid burn amount");
        require(balanceOf(msg.sender) >= burnAmount, "Insufficient balance");
        require(debtBalances[msg.sender] >= burnAmount, "Exceeds debt");

        // Calculate collateral to release
        uint256 collateralToRelease = (collateralBalances[msg.sender] * burnAmount) / debtBalances[msg.sender];
        
        // Update positions
        collateralBalances[msg.sender] -= collateralToRelease;
        debtBalances[msg.sender] -= burnAmount;
        
        uint256 collateralValue = getCollateralValue(collateralToken, collateralToRelease);
        totalCollateralValue -= collateralValue;

        // Burn tokens and transfer collateral
        _burn(msg.sender, burnAmount);
        ICeloToken(collateralToken).transfer(msg.sender, collateralToRelease);

        emit Burn(msg.sender, burnAmount, collateralToRelease);
    }

    /**
     * @dev Liquidate undercollateralized positions
     * @param user Address of the user to liquidate
     * @param collateralToken Collateral token to liquidate
     */
    function liquidate(
        address user,
        address collateralToken
    ) external nonReentrant {
        require(supportedCollaterals[collateralToken], "Unsupported collateral");
        
        uint256 userCollateralValue = getCollateralValue(collateralToken, collateralBalances[user]);
        uint256 userDebt = debtBalances[user];
        uint256 collateralizationRatio = (userCollateralValue * 100) / userDebt;
        
        require(collateralizationRatio < LIQUIDATION_RATIO, "Position is healthy");

        // Calculate liquidation amounts
        uint256 liquidationAmount = userDebt;
        uint256 collateralToSeize = collateralBalances[user];

        // Update state
        collateralBalances[user] = 0;
        debtBalances[user] = 0;
        totalCollateralValue -= userCollateralValue;

        // Transfer collateral to liquidator (with discount)
        uint256 liquidatorReward = (collateralToSeize * 105) / 100; // 5% liquidation bonus
        ICeloToken(collateralToken).transfer(msg.sender, liquidatorReward);

        emit Liquidation(user, liquidationAmount, collateralToSeize);
    }

    /**
     * @dev Rebalance the system based on current price
     */
    function rebalance() external onlyRole(STABILIZER_ROLE) {
        (uint256 currentPrice, uint256 timestamp) = priceOracle.getPrice(address(this));
        require(!priceOracle.isStale(address(this), MAX_ORACLE_AGE), "Oracle data is stale");

        uint256 priceDeviation = currentPrice > TARGET_PRICE 
            ? currentPrice - TARGET_PRICE 
            : TARGET_PRICE - currentPrice;

        if (priceDeviation > PRICE_DEVIATION_THRESHOLD) {
            // Implement rebalancing logic based on price deviation
            if (currentPrice > TARGET_PRICE) {
                // Price too high - increase supply or reduce demand
                _handleHighPrice(currentPrice);
            } else {
                // Price too low - decrease supply or increase demand
                _handleLowPrice(currentPrice);
            }
        }

        lastRebalanceTime = block.timestamp;
        emit Rebalance(currentPrice, totalSupply(), timestamp);
    }

    /**
     * @dev Handle high price scenarios
     */
    function _handleHighPrice(uint256 currentPrice) internal {
        // Reduce target collateral ratio to encourage minting
        if (targetCollateralRatio > MIN_COLLATERAL_RATIO) {
            targetCollateralRatio = MIN_COLLATERAL_RATIO;
        }
    }

    /**
     * @dev Handle low price scenarios
     */
    function _handleLowPrice(uint256 currentPrice) internal {
        // Increase target collateral ratio to discourage minting
        targetCollateralRatio = (MIN_COLLATERAL_RATIO * 110) / 100; // 10% increase
    }

    /**
     * @dev Get collateral value in USD
     */
    function getCollateralValue(address collateralToken, uint256 amount) public view returns (uint256) {
        (uint256 price,) = priceOracle.getPrice(collateralToken);
        return (amount * price) / 1e18;
    }

    /**
     * @dev Get user's collateralization ratio
     */
    function getUserCollateralizationRatio(address user) external view returns (uint256) {
        if (debtBalances[user] == 0) return type(uint256).max;
        
        uint256 userCollateralValue = 0;
        // This is simplified - in practice, you'd iterate through all collateral types
        userCollateralValue = getCollateralValue(address(cUSD), collateralBalances[user]);
        
        return (userCollateralValue * 100) / debtBalances[user];
    }

    /**
     * @dev Emergency functions
     */
    function toggleEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = !emergencyMode;
        if (emergencyMode) {
            _pause();
        } else {
            _unpause();
        }
        emit EmergencyModeToggled(emergencyMode);
    }

    /**
     * @dev Add new supported collateral
     */
    function addCollateral(
        address collateralToken,
        uint256 weight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(weight <= 10000, "Weight too high"); // Max 100%
        supportedCollaterals[collateralToken] = true;
        collateralWeights[collateralToken] = weight;
        emit CollateralAdded(collateralToken, weight);
    }

    /**
     * @dev Update oracle address
     */
    function updateOracle(address newOracle) external onlyRole(ORACLE_ROLE) {
        priceOracle = IPriceOracle(newOracle);
    }

    /**
     * @dev Override required by Solidity
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Authorize upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}