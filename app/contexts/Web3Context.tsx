'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CoinCircleContract, TokenContract, CONTRACT_ADDRESSES } from '@/lib/contracts';

interface Web3ContextType {
  // Wallet state
  isConnected: boolean;
  walletAddress: string | null;
  signer: ethers.Signer | null;
  provider: ethers.providers.Web3Provider | null;
  
  // Contract instances
  coinCircleContract: CoinCircleContract | null;
  tokenContract: TokenContract | null;
  
  // User state
  userBalance: string;
  tokenBalance: string;
  
  // Connection functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Contract functions
  createGroup: (contributionAmount: number, roundDuration: number, groupSize: number, tokenAddress: string, payoutType: 'rotation' | 'random') => Promise<any>;
  joinGroup: (groupId: number) => Promise<any>;
  contribute: (groupId: number) => Promise<any>;
  triggerPayout: (groupId: number) => Promise<any>;
  getGroupInfo: (groupId: number) => Promise<any>;
  getAllGroups: () => Promise<any[]>;
  
  // Token functions
  approveTokens: (spender: string, amount: string) => Promise<any>;
  getTokenBalance: () => Promise<string>;
  
  // Loading states
  isLoading: boolean;
  isTransactionPending: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [coinCircleContract, setCoinCircleContract] = useState<CoinCircleContract | null>(null);
  const [tokenContract, setTokenContract] = useState<TokenContract | null>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Create provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Get user balance
        const balance = await provider.getBalance(account);
        const balanceInEth = ethers.utils.formatEther(balance);
        
        // Initialize contracts
        const coinCircleContract = new CoinCircleContract(signer);
        
        setWalletAddress(account);
        setSigner(signer);
        setProvider(provider);
        setCoinCircleContract(coinCircleContract);
        setUserBalance(balanceInEth);
        setIsConnected(true);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setSigner(null);
    setProvider(null);
    setCoinCircleContract(null);
    setTokenContract(null);
    setUserBalance('0');
    setTokenBalance('0');
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      if (provider) {
        const balance = await provider.getBalance(accounts[0]);
        setUserBalance(ethers.utils.formatEther(balance));
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    window.location.reload();
  };

  // Initialize token contract
  const initializeTokenContract = async (tokenAddress: string) => {
    if (signer) {
      const tokenContract = new TokenContract(signer, tokenAddress);
      setTokenContract(tokenContract);
      
      if (walletAddress) {
        const balance = await tokenContract.getBalance(walletAddress);
        setTokenBalance(balance);
      }
    }
  };

  // Contract functions
  const createGroup = async (
    contributionAmount: number,
    roundDuration: number,
    groupSize: number,
    tokenAddress: string,
    payoutType: 'rotation' | 'random'
  ) => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    
    setIsTransactionPending(true);
    try {
      const tx = await coinCircleContract.createGroup(
        contributionAmount,
        roundDuration,
        groupSize,
        tokenAddress,
        payoutType
      );
      await tx.wait();
      return tx;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const joinGroup = async (groupId: number) => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    
    setIsTransactionPending(true);
    try {
      const tx = await coinCircleContract.joinGroup(groupId);
      await tx.wait();
      return tx;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const contribute = async (groupId: number) => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    
    setIsTransactionPending(true);
    try {
      const tx = await coinCircleContract.contribute(groupId);
      await tx.wait();
      return tx;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const triggerPayout = async (groupId: number) => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    
    setIsTransactionPending(true);
    try {
      const tx = await coinCircleContract.triggerPayout(groupId);
      await tx.wait();
      return tx;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const getGroupInfo = async (groupId: number) => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    return await coinCircleContract.getGroupInfo(groupId);
  };

  const getAllGroups = async () => {
    if (!coinCircleContract) throw new Error('Contract not initialized');
    return await coinCircleContract.getAllGroups();
  };

  // Token functions
  const approveTokens = async (spender: string, amount: string) => {
    if (!tokenContract) throw new Error('Token contract not initialized');
    
    setIsTransactionPending(true);
    try {
      const tx = await tokenContract.approve(spender, amount);
      await tx.wait();
      return tx;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const getTokenBalance = async () => {
    if (!tokenContract || !walletAddress) return '0';
    
    try {
      const balance = await tokenContract.getBalance(walletAddress);
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  // Initialize on mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Update balance when connected
  useEffect(() => {
    if (isConnected && provider && walletAddress) {
      const updateBalance = async () => {
        try {
          const balance = await provider.getBalance(walletAddress);
          setUserBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      };
      
      updateBalance();
      const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, provider, walletAddress]);

  const value: Web3ContextType = {
    isConnected,
    walletAddress,
    signer,
    provider,
    coinCircleContract,
    tokenContract,
    userBalance,
    tokenBalance,
    connectWallet,
    disconnectWallet,
    createGroup,
    joinGroup,
    contribute,
    triggerPayout,
    getGroupInfo,
    getAllGroups,
    approveTokens,
    getTokenBalance,
    isLoading,
    isTransactionPending,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
} 