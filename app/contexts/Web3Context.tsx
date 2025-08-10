'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CoinCircleContract, TokenContract, CAnchorContract, CONTRACT_ADDRESSES, CANCHOR_ABI } from '@/lib/contracts';

interface Web3ContextType {
  // Wallet state
  isConnected: boolean;
  walletAddress: string | null;
  signer: ethers.Signer | null;
  provider: ethers.providers.Web3Provider | null;
  
  // Contract instances
  coinCircleContract: CoinCircleContract | null;
  tokenContract: TokenContract | null;
  cAnchorContract: CAnchorContract | null;
  
  // User state
  userBalance: string;
  tokenBalance: string;
  cAnchorBalance: string;
  cAnchorCollateralBalance: string;
  cAnchorDebtBalance: string;
  
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
  
  // cAnchor functions
  mintCAnchor: (collateralToken: string, collateralAmount: string, mintAmount: string) => Promise<any>;
  burnCAnchor: (amount: string) => Promise<any>;
  transferCAnchor: (to: string, amount: string) => Promise<any>;
  getCAnchorBalance: () => Promise<string>;
  getCAnchorCollateralBalance: () => Promise<string>;
  getCAnchorDebtBalance: () => Promise<string>;
  
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
  const [cAnchorContract, setCAnchorContract] = useState<CAnchorContract | null>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [cAnchorBalance, setCAnchorBalance] = useState('0');
  const [cAnchorCollateralBalance, setCAnchorCollateralBalance] = useState('0');
  const [cAnchorDebtBalance, setCAnchorDebtBalance] = useState('0');
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
        
        // Set state
        setWalletAddress(account);
        setSigner(signer);
        setProvider(provider);
        setUserBalance(balanceInEth);
        setIsConnected(true);
        
        // Initialize contracts
        await initializeContracts(signer);
        await initializeCAnchorContract(signer);
        
        // Set up event listeners
        if (window.ethereum.on) {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        }
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
    setCAnchorContract(null);
    setUserBalance('0');
    setTokenBalance('0');
    setCAnchorBalance('0');
    setCAnchorCollateralBalance('0');
    setCAnchorDebtBalance('0');
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

  // Initialize contracts
  const initializeContracts = async (signer: ethers.Signer) => {
    try {
      const coinCircle = new CoinCircleContract(signer);
      setCoinCircleContract(coinCircle);
    } catch (error) {
      console.error('Error initializing CoinCircle contract:', error);
    }
  };

  // Initialize cAnchor contract
  const initializeCAnchorContract = async (signer: ethers.Signer) => {
    try {
      // Get the cAnchor contract address from config
      const cAnchorAddress = '0x6d8b3e655519a31f80cc90bba06c0ad9a97baf69'; // From config
      const cAnchorContractInstance = new ethers.Contract(cAnchorAddress, CANCHOR_ABI, signer);
      const cAnchor = new CAnchorContract(cAnchorContractInstance, cAnchorAddress);
      setCAnchorContract(cAnchor);
      
      // Get initial balances if wallet is connected
      if (walletAddress) {
        await updateCAnchorBalances(cAnchor, walletAddress);
      }
    } catch (error) {
      console.error('Error initializing cAnchor contract:', error);
    }
  };

  // Update cAnchor balances
  const updateCAnchorBalances = async (contract: CAnchorContract, address: string) => {
    try {
      const [balance, collateralBalance, debtBalance] = await Promise.all([
        contract.balanceOf(address),
        contract.getUserCollateralBalance(address),
        contract.getUserDebtBalance(address)
      ]);
      
      setCAnchorBalance(balance);
      setCAnchorCollateralBalance(collateralBalance.toString());
      setCAnchorDebtBalance(debtBalance.toString());
    } catch (error) {
      console.error('Error updating cAnchor balances:', error);
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

  // cAnchor functions
  const mintCAnchor = async (collateralToken: string, collateralAmount: string, mintAmount: string) => {
    if (!cAnchorContract || !walletAddress) {
      throw new Error('Wallet not connected or cAnchor contract not initialized');
    }
    
    try {
      setIsTransactionPending(true);
      const tx = await cAnchorContract.mint(collateralToken, collateralAmount, mintAmount);
      await tx.wait();
      
      // Update balances
      await updateCAnchorBalances(cAnchorContract, walletAddress);
      
      return tx;
    } catch (error) {
      console.error('Error minting cAnchor:', error);
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const burnCAnchor = async (amount: string) => {
    if (!cAnchorContract || !walletAddress) {
      throw new Error('Wallet not connected or cAnchor contract not initialized');
    }
    
    try {
      setIsTransactionPending(true);
      const tx = await cAnchorContract.burn(amount);
      await tx.wait();
      
      // Update balances
      await updateCAnchorBalances(cAnchorContract, walletAddress);
      
      return tx;
    } catch (error) {
      console.error('Error burning cAnchor:', error);
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const transferCAnchor = async (to: string, amount: string) => {
    if (!cAnchorContract || !walletAddress) {
      throw new Error('Wallet not connected or cAnchor contract not initialized');
    }
    
    try {
      setIsTransactionPending(true);
      const tx = await cAnchorContract.transfer(to, amount);
      await tx.wait();
      
      // Update balances
      await updateCAnchorBalances(cAnchorContract, walletAddress);
      
      return tx;
    } catch (error) {
      console.error('Error transferring cAnchor:', error);
      throw error;
    } finally {
      setIsTransactionPending(false);
    }
  };

  const getCAnchorBalance = async () => {
    if (!cAnchorContract || !walletAddress) {
      return '0';
    }
    
    try {
      const balance = await cAnchorContract.balanceOf(walletAddress);
      setCAnchorBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error getting cAnchor balance:', error);
      return '0';
    }
  };

  const getCAnchorCollateralBalance = async () => {
    if (!cAnchorContract || !walletAddress) {
      return '0';
    }
    
    try {
      const balance = await cAnchorContract.getUserCollateralBalance(walletAddress);
      setCAnchorCollateralBalance(balance.toString());
      return balance.toString();
    } catch (error) {
      console.error('Error getting cAnchor collateral balance:', error);
      return '0';
    }
  };

  const getCAnchorDebtBalance = async () => {
    if (!cAnchorContract || !walletAddress) {
      return '0';
    }
    
    try {
      const balance = await cAnchorContract.getUserDebtBalance(walletAddress);
      setCAnchorDebtBalance(balance.toString());
      return balance.toString();
    } catch (error) {
      console.error('Error getting cAnchor debt balance:', error);
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
          const balanceInEth = ethers.utils.formatEther(balance);
          setUserBalance(balanceInEth);
          
          // Update cAnchor balances if contract is available
          if (cAnchorContract) {
            await updateCAnchorBalances(cAnchorContract, walletAddress);
          }
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
    cAnchorContract,
    userBalance,
    tokenBalance,
    cAnchorBalance,
    cAnchorCollateralBalance,
    cAnchorDebtBalance,
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
    mintCAnchor,
    burnCAnchor,
    transferCAnchor,
    getCAnchorBalance,
    getCAnchorCollateralBalance,
    getCAnchorDebtBalance,
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