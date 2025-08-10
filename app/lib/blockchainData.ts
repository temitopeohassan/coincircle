import { ethers } from 'ethers';
import { CAnchorContract } from './contracts';
import { CONFIG } from './config';

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  price?: string;
}

export interface UserStats {
  totalContributed: number;
  totalReceived: number;
  activeGroups: number;
  pendingPayouts: number;
}

export interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'group_joined' | 'group_created' | 'mint' | 'burn' | 'transfer';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  groupName?: string;
  txHash?: string;
}

export class BlockchainDataService {
  private provider: ethers.providers.JsonRpcProvider;
  private cAnchorContract: CAnchorContract | null = null;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  setCAnchorContract(contract: CAnchorContract) {
    this.cAnchorContract = contract;
  }

  // Fetch supported collateral tokens from cAnchor contract
  async getSupportedCollateralTokens(): Promise<TokenInfo[]> {
    if (!this.cAnchorContract) {
      throw new Error('cAnchor contract not initialized');
    }

    try {
      // Get supported collaterals from the contract
      const supportedCollaterals = await this.cAnchorContract.getSupportedCollaterals();
      
      // Fetch token metadata for each supported collateral
      const tokenInfos: TokenInfo[] = [];
      
      for (const tokenAddress of supportedCollaterals) {
        try {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function name() view returns (string)', 'function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
            this.provider
          );

          const [name, symbol, decimals] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);

          tokenInfos.push({
            address: tokenAddress,
            symbol,
            name,
            decimals: decimals.toNumber()
          });
        } catch (error) {
          console.warn(`Failed to fetch metadata for token ${tokenAddress}:`, error);
          // Fallback to basic info
          tokenInfos.push({
            address: tokenAddress,
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            decimals: 18
          });
        }
      }

      return tokenInfos;
    } catch (error) {
      console.error('Error fetching supported collateral tokens:', error);
      // Fallback to network-specific known tokens
      return this.getFallbackCollateralTokens();
    }
  }

  // Fallback collateral tokens based on network
  private getFallbackCollateralTokens(): TokenInfo[] {
    const network = CONFIG.DEFAULT_NETWORK;
    
    if (network === 'ALFAJORES') {
      return [
        { address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', symbol: 'cUSD', name: 'Celo Dollar', decimals: 18 },
        { address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F', symbol: 'cEUR', name: 'Celo Euro', decimals: 18 },
        { address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9', symbol: 'cAnchor', name: 'cAnchor Native', decimals: 18 }
      ];
    }
    
    // Add more networks as needed
    return [];
  }

  // Fetch user statistics from blockchain
  async getUserStats(walletAddress: string): Promise<UserStats> {
    if (!this.cAnchorContract) {
      throw new Error('cAnchor contract not initialized');
    }

    try {
      // Get user's collateral and debt balances
      const [collateralBalance, debtBalance] = await Promise.all([
        this.cAnchorContract.getUserCollateralBalance(walletAddress),
        this.cAnchorContract.getUserDebtBalance(walletAddress)
      ]);

      // Get user's group participation (this would need to be implemented in your group contracts)
      const activeGroups = 0; // TODO: Implement group contract integration
      const pendingPayouts = 0; // TODO: Implement group contract integration

      // Convert from Wei to readable format
      const totalContributed = parseFloat(ethers.utils.formatEther(collateralBalance));
      const totalReceived = parseFloat(ethers.utils.formatEther(debtBalance));

      return {
        totalContributed,
        totalReceived,
        activeGroups,
        pendingPayouts
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalContributed: 0,
        totalReceived: 0,
        activeGroups: 0,
        pendingPayouts: 0
      };
    }
  }

  // Fetch user's activity from blockchain events
  async getUserActivity(walletAddress: string): Promise<ActivityItem[]> {
    if (!this.cAnchorContract) {
      throw new Error('cAnchor contract not initialized');
    }

    try {
      const activities: ActivityItem[] = [];

      // Get recent events from cAnchor contract
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

      // Fetch Mint events
      const mintEvents = await this.cAnchorContract.queryMintEvents(walletAddress, fromBlock, currentBlock);
      
      for (const event of mintEvents) {
        activities.push({
          id: event.transactionHash,
          type: 'mint',
          title: 'cAnchor Minted',
          description: `You minted ${ethers.utils.formatEther(event.args?.mintAmount || 0)} cAnchor tokens`,
          amount: parseFloat(ethers.utils.formatEther(event.args?.mintAmount || 0)),
          timestamp: new Date().toISOString(), // TODO: Get actual block timestamp
          txHash: event.transactionHash
        });
      }

      // Fetch Burn events
      const burnEvents = await this.cAnchorContract.queryBurnEvents(walletAddress, fromBlock, currentBlock);
      
      for (const event of burnEvents) {
        activities.push({
          id: event.transactionHash,
          type: 'burn',
          title: 'cAnchor Burned',
          description: `You burned ${ethers.utils.formatEther(event.args?.amount || 0)} cAnchor tokens`,
          amount: parseFloat(ethers.utils.formatEther(event.args?.amount || 0)),
          timestamp: new Date().toISOString(), // TODO: Get actual block timestamp
          txHash: event.transactionHash
        });
      }

      // Fetch Transfer events
      const transferEvents = await this.cAnchorContract.queryTransferEvents(walletAddress, fromBlock, currentBlock);
      
      for (const event of transferEvents) {
        if (event.args?.from === walletAddress) {
          activities.push({
            id: event.transactionHash,
            type: 'transfer',
            title: 'cAnchor Transferred',
            description: `You transferred ${ethers.utils.formatEther(event.args?.value || 0)} cAnchor tokens`,
            amount: parseFloat(ethers.utils.formatEther(event.args?.value || 0)),
            timestamp: new Date().toISOString(), // TODO: Get actual block timestamp
            txHash: event.transactionHash
          });
        }
      }

      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, 10); // Return last 10 activities
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // Fetch token prices from price oracle
  async getTokenPrices(tokenAddresses: string[]): Promise<Map<string, string>> {
    if (!this.cAnchorContract) {
      throw new Error('cAnchor contract not initialized');
    }

    try {
      const priceOracle = await this.cAnchorContract.getPriceOracle();
      const priceOracleContract = new ethers.Contract(
        priceOracle,
        ['function getPrice(address) view returns (uint256)'],
        this.provider
      );

      const priceMap = new Map<string, string>();
      
      for (const tokenAddress of tokenAddresses) {
        try {
          const price = await priceOracleContract.getPrice(tokenAddress);
          priceMap.set(tokenAddress, ethers.utils.formatEther(price));
        } catch (error) {
          console.warn(`Failed to fetch price for token ${tokenAddress}:`, error);
          // Set default price of 1 for stablecoins
          priceMap.set(tokenAddress, '1.0');
        }
      }

      return priceMap;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return new Map();
    }
  }

  // Fetch cAnchor contract parameters
  async getCAnchorParameters(): Promise<{
    targetPrice: string;
    minCollateralRatio: number;
    liquidationRatio: number;
    stabilityFee: number;
    totalCollateralValue: string;
    totalSupply: string;
  }> {
    if (!this.cAnchorContract) {
      throw new Error('cAnchor contract not initialized');
    }

    try {
      const [
        targetPrice,
        minCollateralRatio,
        liquidationRatio,
        stabilityFee,
        totalCollateralValue,
        totalSupply
      ] = await Promise.all([
        this.cAnchorContract.getTargetPrice(),
        this.cAnchorContract.getMinCollateralRatio(),
        this.cAnchorContract.getLiquidationRatio(),
        this.cAnchorContract.getStabilityFee(),
        this.cAnchorContract.getTotalCollateralValue(),
        this.cAnchorContract.getTotalSupply()
      ]);

      return {
        targetPrice: ethers.utils.formatEther(targetPrice),
        minCollateralRatio: minCollateralRatio.toNumber(),
        liquidationRatio: liquidationRatio.toNumber(),
        stabilityFee: stabilityFee.toNumber(),
        totalCollateralValue: ethers.utils.formatEther(totalCollateralValue),
        totalSupply: ethers.utils.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Error fetching cAnchor parameters:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainDataService = new BlockchainDataService(CONFIG.NETWORKS.ALFAJORES.rpcUrl);
