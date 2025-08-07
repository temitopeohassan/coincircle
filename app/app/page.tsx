'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { JoinGroupModal } from '@/components/groups/JoinGroupModal';
import { ContributeModal } from '@/components/groups/ContributeModal';
import { PayoutModal } from '@/components/groups/PayoutModal';
import { GroupCard } from '@/components/groups/GroupCard';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Plus, Users, TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Web3Provider, useWeb3 } from '@/contexts/Web3Context';

interface Group {
  id: number;
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
  name?: string;
  description?: string;
  nextPayout?: string;
  currency?: string;
}

interface UserStats {
  totalContributed: number;
  totalReceived: number;
  activeGroups: number;
  pendingPayouts: number;
}

function HomeContent() {
  const {
    isConnected,
    walletAddress,
    userBalance,
    isLoading,
    isTransactionPending,
    connectWallet,
    disconnectWallet,
    createGroup,
    joinGroup,
    contribute,
    triggerPayout,
    getGroupInfo,
    getAllGroups
  } = useWeb3();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const [userStats] = useState<UserStats>({
    totalContributed: 12.5,
    totalReceived: 8.2,
    activeGroups: 3,
    pendingPayouts: 1
  });

  // Load groups from smart contract
  const loadGroups = async () => {
    if (!isConnected) return;
    
    setIsLoadingGroups(true);
    try {
      const allGroups = await getAllGroups();
      
      // Filter groups where user is a member
      const userGroups = allGroups.filter((group: Group) => 
        group.members.includes(walletAddress || '')
      );
      
      // Filter groups where user is not a member and group is not full
      const otherGroups = allGroups.filter((group: Group) => 
        !group.members.includes(walletAddress || '') && 
        !group.started && 
        group.members.length < group.groupSize
      );

      // Add mock data for display purposes (in real app, this would come from IPFS or similar)
                        const groupsWithMetadata = userGroups.map((group: Group) => ({
                    ...group,
                    name: `Stokvel Group ${group.id}`,
                    description: `A decentralized savings group with ${group.groupSize} members`,
                    nextPayout: new Date(Date.now() + group.roundDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    currency: 'CELO'
                  }));

                        const availableGroupsWithMetadata = otherGroups.map((group: Group) => ({
                    ...group,
                    name: `Available Group ${group.id}`,
                    description: `Join this group with ${group.groupSize} members`,
                    nextPayout: new Date(Date.now() + group.roundDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    currency: 'CELO'
                  }));

      setMyGroups(groupsWithMetadata);
      setAvailableGroups(availableGroupsWithMetadata);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Load groups when wallet connects
  useEffect(() => {
    if (isConnected) {
      loadGroups();
    }
  }, [isConnected, walletAddress]);

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletDisconnect = () => {
    disconnectWallet();
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      await createGroup(
        groupData.contributionAmount,
        groupData.roundDuration || 30, // Default 30 days
        groupData.groupSize || 10, // Default 10 members
        groupData.tokenAddress || '0x0000000000000000000000000000000000000000', // Default ETH
        groupData.payoutType || 'rotation'
      );
    setShowCreateModal(false);
      // Reload groups after creation
      setTimeout(loadGroups, 2000);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await joinGroup(groupId);
    setShowJoinModal(false);
      // Reload groups after joining
      setTimeout(loadGroups, 2000);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleContribute = async (groupId: number) => {
    try {
      await contribute(groupId);
      setShowContributeModal(false);
      // Reload groups after contribution
      setTimeout(loadGroups, 2000);
    } catch (error) {
      console.error('Failed to contribute:', error);
    }
  };

  const handlePayout = async (groupId: number) => {
    try {
      await triggerPayout(groupId);
    setShowPayoutModal(false);
      // Reload groups after payout
      setTimeout(loadGroups, 2000);
    } catch (error) {
      console.error('Failed to trigger payout:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                CoinCircle
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join decentralized savings groups, contribute cryptocurrency, and receive automated payouts. 
                Build wealth together with your community using smart contracts.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Create Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    Start your own stokvel with smart contract automation
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Contribute Crypto</h3>
                  <p className="text-sm text-muted-foreground">
                    Make regular contributions in ETH and other tokens
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Automated Payouts</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive fair payouts based on smart contract rules
                  </p>
                </CardContent>
              </Card>
            </div>

            <WalletConnection 
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
              isConnected={isConnected}
              address={walletAddress || ''}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">CoinCircle Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Manage your decentralized savings groups.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {parseFloat(userBalance).toFixed(4)} ETH
              </p>
            </div>
            <WalletConnection 
              onConnect={handleWalletConnect} 
              onDisconnect={handleWalletDisconnect}
              isConnected={isConnected}
              address={walletAddress || ''}
            />
          </div>
        </div>

        {/* Transaction Status */}
        {isTransactionPending && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-amber-800 dark:text-amber-200 font-medium">
                  Transaction in progress...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Dashboard */}
        <DashboardStats stats={userStats} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="my-groups" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-groups">My Groups</TabsTrigger>
                <TabsTrigger value="discover">Discover Groups</TabsTrigger>
              </TabsList>

              <TabsContent value="my-groups" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Stokvel Groups</h2>
                  <Button 
                    onClick={() => setShowCreateModal(true)} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isTransactionPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>

                {isLoadingGroups ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : myGroups.length > 0 ? (
                <div className="grid gap-4">
                  {myGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onContribute={() => {
                        setSelectedGroup(group);
                        setShowContributeModal(true);
                      }}
                      onViewDetails={() => {}}
                      onTriggerPayout={() => {
                        setSelectedGroup(group);
                        setShowPayoutModal(true);
                      }}
                    />
                  ))}
                </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Groups Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven&apos;t joined any stokvel groups yet. Create your own or join an existing one.
                      </p>
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Create Your First Group
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="discover" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Available Groups</h2>
                  <Badge variant="secondary" className="px-3 py-1">
                    {availableGroups.length} groups available
                  </Badge>
                </div>

                {isLoadingGroups ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : availableGroups.length > 0 ? (
                <div className="grid gap-4">
                  {availableGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onJoin={() => {
                        setSelectedGroup(group);
                        setShowJoinModal(true);
                      }}
                      onViewDetails={() => {}}
                      showJoinButton={true}
                    />
                  ))}
                </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Available Groups</h3>
                      <p className="text-muted-foreground">
                        All groups are currently full or have already started. Create your own group to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateGroup={handleCreateGroup}
      />

      <JoinGroupModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        group={selectedGroup}
        onJoinGroup={() => selectedGroup && handleJoinGroup(selectedGroup.id)}
      />

      <ContributeModal
        open={showContributeModal}
        onOpenChange={setShowContributeModal}
        group={selectedGroup}
        userBalance={parseFloat(userBalance)}
        onContribute={() => selectedGroup && handleContribute(selectedGroup.id)}
      />

      <PayoutModal
        open={showPayoutModal}
        onOpenChange={setShowPayoutModal}
        group={selectedGroup}
        onTriggerPayout={() => selectedGroup && handlePayout(selectedGroup.id)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Web3Provider>
      <HomeContent />
    </Web3Provider>
  );
}