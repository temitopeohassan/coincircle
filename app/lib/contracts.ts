import { ethers } from 'ethers';
import { getContractAddress, getCurrentNetwork } from './config';

// CoinCircle Contract ABI (extracted from the compiled contract)
export const COINCIRCLE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "roundDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "groupSize",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "payoutType",
        "type": "string"
      }
    ],
    "name": "createGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "name": "joinGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "name": "triggerPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      }
    ],
    "name": "getGroupInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "roundDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "groupSize",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "payoutType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "currentRound",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "started",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      },
      {
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "isMember",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "groupCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "groups",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "roundDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "groupSize",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "payoutType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "currentRound",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "started",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "GroupJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "beneficiary",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "PayoutTriggered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "groupId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "WithdrawalMade",
    "type": "event"
  }
];

// ERC20 Token ABI for token approvals
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract interaction functions
export class CoinCircleContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;
  private contractAddress: string;

  constructor(signer: ethers.Signer, contractAddress?: string) {
    this.signer = signer;
    this.contractAddress = contractAddress || getContractAddress('COINCIRCLE');
    
    if (this.contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract address not configured. Please set NEXT_PUBLIC_COINCIRCLE_ADDRESS in your environment variables.');
    }
    
    this.contract = new ethers.Contract(this.contractAddress, COINCIRCLE_ABI, signer);
  }

  // Get total number of groups
  async getGroupCounter(): Promise<number> {
    try {
      const counter = await this.contract.groupCounter();
      return counter.toNumber();
    } catch (error) {
      console.error('Error getting group counter:', error);
      return 0;
    }
  }

  // Create a new group
  async createGroup(
    contributionAmount: number,
    roundDuration: number,
    groupSize: number,
    tokenAddress: string,
    payoutType: 'rotation' | 'random'
  ): Promise<ethers.ContractTransaction> {
    try {
      const tx = await this.contract.createGroup(
        ethers.utils.parseEther(contributionAmount.toString()),
        roundDuration,
        groupSize,
        tokenAddress,
        payoutType
      );
      return tx;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Join a group
  async joinGroup(groupId: number): Promise<ethers.ContractTransaction> {
    try {
      const tx = await this.contract.joinGroup(groupId);
      return tx;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Contribute to a group
  async contribute(groupId: number): Promise<ethers.ContractTransaction> {
    try {
      const tx = await this.contract.contribute(groupId);
      return tx;
    } catch (error) {
      console.error('Error contributing to group:', error);
      throw error;
    }
  }

  // Trigger payout for a group
  async triggerPayout(groupId: number): Promise<ethers.ContractTransaction> {
    try {
      const tx = await this.contract.triggerPayout(groupId);
      return tx;
    } catch (error) {
      console.error('Error triggering payout:', error);
      throw error;
    }
  }

  // Get group information
  async getGroupInfo(groupId: number): Promise<{
    creator: string;
    tokenAddress: string;
    contributionAmount: string;
    roundDuration: number;
    groupSize: number;
    payoutType: string;
    currentRound: number;
    started: boolean;
    completed: boolean;
    members: string[];
  }> {
    try {
      const info = await this.contract.getGroupInfo(groupId);
      return {
        creator: info.creator,
        tokenAddress: info.tokenAddress,
        contributionAmount: ethers.utils.formatEther(info.contributionAmount),
        roundDuration: info.roundDuration.toNumber(),
        groupSize: info.groupSize.toNumber(),
        payoutType: info.payoutType,
        currentRound: info.currentRound.toNumber(),
        started: info.started,
        completed: info.completed,
        members: info.members
      };
    } catch (error) {
      console.error('Error getting group info:', error);
      throw error;
    }
  }

  // Check if user is a member of a group
  async isMember(groupId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.isMember(groupId, userAddress);
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  // Get all groups (up to a limit)
  async getAllGroups(limit: number = 50): Promise<any[]> {
    try {
      const counter = await this.getGroupCounter();
      const groups = [];
      
      for (let i = 0; i < Math.min(counter, limit); i++) {
        try {
          const groupInfo = await this.getGroupInfo(i);
          groups.push({
            id: i,
            ...groupInfo
          });
        } catch (error) {
          console.error(`Error getting group ${i}:`, error);
        }
      }
      
      return groups;
    } catch (error) {
      console.error('Error getting all groups:', error);
      return [];
    }
  }

  // Get contract address
  getContractAddress(): string {
    return this.contractAddress;
  }
}

// Token contract interaction
export class TokenContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer, tokenAddress: string) {
    this.signer = signer;
    this.contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  }

  // Get token balance
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  // Approve tokens for spending
  async approve(spender: string, amount: string): Promise<ethers.ContractTransaction> {
    try {
      const tx = await this.contract.approve(spender, ethers.utils.parseEther(amount));
      return tx;
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }

  // Get allowance
  async getAllowance(owner: string, spender: string): Promise<string> {
    try {
      const allowance = await this.contract.allowance(owner, spender);
      return ethers.utils.formatEther(allowance);
    } catch (error) {
      console.error('Error getting allowance:', error);
      return '0';
    }
  }

  // Get token info
  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number }> {
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals()
      ]);
      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }
} 