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
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
      }
    }
  },
  
  // Default network
  DEFAULT_NETWORK: 'ALFAJORES',
  
  // Application settings
  APP: {
    name: 'Crypto Stokvel',
    description: 'Decentralized savings groups powered by smart contracts on Celo',
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