# Smart Contract Integration Guide

This document explains how the CoinCircle application integrates with the CoinCircle smart contract.

## Overview

The application has been upgraded to work with the CoinCircle.sol smart contract, which manages decentralized savings groups (stokvels) on the blockchain. All group operations are now handled through smart contracts for transparency and security.

## Smart Contract Features

### CoinCircle.sol Contract

The main contract provides the following functionality:

1. **Group Creation**: Create new stokvel groups with custom parameters
2. **Group Joining**: Join existing groups before they start
3. **Contributions**: Make regular contributions to active groups
4. **Payouts**: Trigger automated payouts based on group rules
5. **Group Management**: Track group status, members, and rounds

### Key Contract Functions

```solidity
// Create a new group
function createGroup(
    uint256 contributionAmount,
    uint256 roundDuration,
    uint256 groupSize,
    address tokenAddress,
    string memory payoutType
) external

// Join an existing group
function joinGroup(uint256 groupId) external

// Contribute to a group
function contribute(uint256 groupId) external

// Trigger payout for current round
function triggerPayout(uint256 groupId) external

// Get group information
function getGroupInfo(uint256 groupId) external view returns (...)
```

## Application Integration

### Web3 Context Provider

The application uses a Web3 context provider (`contexts/Web3Context.tsx`) to manage:

- Wallet connections
- Contract interactions
- Transaction states
- User balances

### Contract Classes

Two main classes handle contract interactions:

1. **CoinCircleContract**: Manages group operations
2. **TokenContract**: Handles ERC20 token operations

### Key Integration Points

#### 1. Wallet Connection
```typescript
const { connectWallet, isConnected, walletAddress } = useWeb3();
```

#### 2. Group Creation
```typescript
const { createGroup } = useWeb3();
await createGroup(contributionAmount, roundDuration, groupSize, tokenAddress, payoutType);
```

#### 3. Group Joining
```typescript
const { joinGroup } = useWeb3();
await joinGroup(groupId);
```

#### 4. Making Contributions
```typescript
const { contribute } = useWeb3();
await contribute(groupId);
```

#### 5. Triggering Payouts
```typescript
const { triggerPayout } = useWeb3();
await triggerPayout(groupId);
```

## Configuration

### Environment Variables

Create a `.env.local` file in the app directory:

```env
# CoinCircle Smart Contract Address
NEXT_PUBLIC_COINCIRCLE_ADDRESS=0xYourDeployedContractAddress

# Network Configuration
NEXT_PUBLIC_NETWORK_ID=80001
NEXT_PUBLIC_NETWORK_NAME=Mumbai Testnet
```

### Contract Deployment

1. **Deploy the Contract**:
   ```bash
   cd contracts
   forge script script/DeployCoinCircle.s.sol --rpc-url $RPC_URL --broadcast
   ```

2. **Update Environment Variables**:
   - Copy the deployed contract address
   - Update `NEXT_PUBLIC_COINCIRCLE_ADDRESS` in `.env.local`

3. **Verify Contract**:
   - Verify the contract on the blockchain explorer
   - Ensure the ABI matches the deployed contract

## Network Support

The application supports multiple networks:

- **Mumbai Testnet** (Default): For testing
- **Polygon Mainnet**: For production
- **Goerli Testnet**: For Ethereum testing

### Network Configuration

Update the network in `lib/config.ts`:

```typescript
export const CONFIG = {
  NETWORKS: {
    MUMBAI: {
      chainId: 80001,
      name: 'Mumbai Testnet',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      explorer: 'https://mumbai.polygonscan.com'
    },
    // Add other networks...
  }
};
```

## Transaction Flow

### 1. Group Creation Flow
1. User fills group creation form
2. App calls `createGroup()` on smart contract
3. Transaction is sent to blockchain
4. Group is created and indexed
5. UI updates to show new group

### 2. Contribution Flow
1. User clicks "Contribute" button
2. App checks token allowance
3. If needed, approves tokens for contract
4. Calls `contribute()` on smart contract
5. Transaction is processed
6. UI updates contribution status

### 3. Payout Flow
1. User clicks "Trigger Payout" button
2. App verifies all members have contributed
3. Calls `triggerPayout()` on smart contract
4. Smart contract distributes funds
5. UI updates payout status

## Error Handling

The application includes comprehensive error handling:

### Contract Errors
- Invalid contract address
- Insufficient funds
- Group not found
- User not a member
- Group already completed

### Network Errors
- Wrong network connected
- RPC connection issues
- Transaction failures

### User Errors
- Insufficient token balance
- Insufficient allowance
- Invalid input parameters

## Security Considerations

### Smart Contract Security
- All transactions are verified on-chain
- No centralized control over funds
- Transparent and auditable operations
- Immutable group rules

### Frontend Security
- Wallet connection validation
- Transaction confirmation dialogs
- Error message sanitization
- Input validation

## Testing

### Local Testing
1. Deploy contract to local network
2. Update environment variables
3. Test all functionality
4. Verify transaction logs

### Testnet Testing
1. Deploy to Mumbai testnet
2. Test with test tokens
3. Verify all operations
4. Test error scenarios

### Production Deployment
1. Deploy to mainnet
2. Verify contract on explorer
3. Update production environment
4. Monitor transactions

## Monitoring

### Transaction Monitoring
- Track transaction status
- Monitor gas usage
- Log contract events
- Handle transaction failures

### User Experience
- Loading states during transactions
- Success/error notifications
- Transaction history
- Real-time updates

## Troubleshooting

### Common Issues

1. **Contract Not Found**
   - Check contract address in environment
   - Verify contract is deployed
   - Ensure correct network

2. **Transaction Failures**
   - Check user balance
   - Verify token allowance
   - Check gas limits
   - Ensure correct parameters

3. **Network Issues**
   - Switch to correct network
   - Check RPC endpoint
   - Verify chain ID

4. **Wallet Connection**
   - Ensure MetaMask is installed
   - Check wallet permissions
   - Verify account is unlocked

### Debug Tools

- Browser console logs
- Contract event logs
- Transaction receipts
- Network explorer links

## Future Enhancements

### Planned Features
- Multi-token support
- Advanced payout algorithms
- Group governance
- Mobile app integration
- DeFi yield farming

### Technical Improvements
- Gas optimization
- Batch transactions
- Off-chain data storage
- Cross-chain support

## Support

For technical support:
1. Check the troubleshooting guide
2. Review contract documentation
3. Check GitHub issues
4. Contact development team

## License

This integration is part of the CoinCircle project and follows the same license terms as the main application. 