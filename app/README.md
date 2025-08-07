# CoinCircle - Decentralized Savings Groups

A modern web application for managing decentralized savings groups (stokvels) using cryptocurrency. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🏦 **Group Management**
- Create new stokvel groups with custom parameters
- Join existing groups with transparent information
- View group progress and member statistics
- Manage contribution schedules and payout cycles

### 💰 **Contribution System**
- Make regular contributions in ETH
- Track contribution history and pool progress
- Automated contribution reminders
- Real-time balance updates

### 🎯 **Payout System**
- Automated payout scheduling (weekly, monthly, quarterly)
- Fair distribution based on contribution amounts
- Payout queue management
- Smart contract integration ready

### 📊 **Dashboard & Analytics**
- Personal contribution and payout statistics
- Group performance metrics
- Activity feed with real-time updates
- Wallet balance tracking

### 🔐 **Wallet Integration**
- Secure wallet connection
- Multi-wallet support (MetaMask, WalletConnect, etc.)
- Transaction history
- Balance management

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks
- **Build Tool**: Turbopack (development)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── wallet/           # Wallet-related components
│   ├── groups/           # Group management components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Key Components

### UI Components (`components/ui/`)
- **Button**: Customizable button with variants
- **Card**: Container component for content
- **Badge**: Status and label indicators
- **Tabs**: Tabbed interface
- **Input**: Form input fields
- **Select**: Dropdown selection
- **Textarea**: Multi-line text input

### Wallet Components (`components/wallet/`)
- **WalletConnection**: Main wallet connection interface
- Handles wallet connection/disconnection
- Displays wallet address and balance
- Supports multiple wallet providers

### Group Components (`components/groups/`)
- **CreateGroupModal**: Create new stokvel groups
- **JoinGroupModal**: Join existing groups
- **ContributeModal**: Make contributions
- **PayoutModal**: Manage payouts
- **GroupCard**: Display group information

### Dashboard Components (`components/dashboard/`)
- **DashboardStats**: User statistics overview
- **ActivityFeed**: Recent activity timeline

## Features in Detail

### Creating Groups
Users can create new stokvel groups with:
- Group name and description
- Target pool amount
- Contribution amount per cycle
- Payout schedule (weekly/monthly/quarterly)
- Maximum member limit

### Joining Groups
Users can join existing groups by:
- Viewing group details and requirements
- Understanding contribution schedules
- Reviewing member statistics
- Confirming participation

### Making Contributions
Users can contribute to groups:
- Specified contribution amounts
- Real-time balance validation
- Transaction confirmation
- Progress tracking

### Managing Payouts
Group owners can:
- Trigger scheduled payouts
- View payout queue
- Monitor payout status
- Handle early payouts (if enabled)

## Smart Contract Integration

The application is designed to integrate with smart contracts for:
- Automated contribution processing
- Secure fund management
- Transparent payout distribution
- Immutable transaction records

## Future Enhancements

- **Multi-chain Support**: Ethereum, Polygon, BSC
- **Advanced Analytics**: Detailed reporting and charts
- **Mobile App**: React Native companion app
- **Social Features**: Group chat and notifications
- **DeFi Integration**: Yield farming and lending
- **Governance**: DAO-style group decision making

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 