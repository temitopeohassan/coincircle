// Application configuration
export const CONFIG = {
  // Contract addresses (update these with actual deployed addresses)
  CONTRACTS: {
    COINCIRCLE: process.env.NEXT_PUBLIC_COINCIRCLE_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // Network configuration - Celo Alfajores testnet only
  NETWORKS: {
    ALFAJORES: {
      chainId: 44787,
      name: 'Celo Alfajores Testnet',
      rpcUrl: 'https://alfajores-forno.celo-testnet.org',
      explorer: 'https://alfajores-blockscout.celo-testnet.org',
      nativeCurrency: {
        name: 'cAnchor',
        symbol: 'cAnchor',
        decimals: 18
      }
    }
  },
  
  // Default network
  DEFAULT_NETWORK: 'ALFAJORES',
  
  // Application settings
  APP: {
    name: 'CoinCircle',
    description: 'Decentralized savings groups powered by smart contracts on cAnchor',
    version: '1.0.0'
  },
  
  // UI settings
  UI: {
    maxGroupsToLoad: 50,
    refreshInterval: 30000, // 30 seconds
    transactionTimeout: 120000 // 2 minutes
  }
};

// Helper function to get current network
export const getCurrentNetwork = () => {
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || CONFIG.DEFAULT_NETWORK;
  return CONFIG.NETWORKS[networkName as keyof typeof CONFIG.NETWORKS] || CONFIG.NETWORKS.ALFAJORES;
};

// Helper function to get contract address
export const getContractAddress = (contractName: keyof typeof CONFIG.CONTRACTS) => {
  return CONFIG.CONTRACTS[contractName];
}; 

// Celo Alfajores Testnet
export const CELO_ALFAJORES = {
  chainId: 44787,
  name: 'Celo Alfajores Testnet',
  rpcUrl: 'https://rpc.ankr.com/celo_testnet',
  explorer: 'https://alfajores.celoscan.io',
  nativeCurrency: {
    name: 'cAnchor',
    symbol: 'cAnchor',
    decimals: 18,
  },
  contracts: {
    COINCIRCLE: '0x...', // Your CoinCircle contract address
    CANCHOR: '0x6d8b3e655519a31f80cc90bba06c0ad9a97baf69', // cAnchor proxy address
    CANCHOR_IMPLEMENTATION: '0x8048e80ad664f479e7792aebd5bab0340b05a7b5', // cAnchor implementation
    PRICE_ORACLE: '0xaa40c7fe8b36a205f8e43ca6bb7a52f176a30fd2', // Price oracle
    CUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', // cUSD testnet
    CEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F', // cEUR testnet
    CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9', // cAnchor testnet
  },
  defaultToken: 'CANCHOR', // Set cAnchor as default
}; 