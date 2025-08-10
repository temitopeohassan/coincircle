'use client';

import { useState, useEffect, useCallback } from 'react';
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
import CAnchorDashboard from '@/components/CAnchorDashboard';
import { Plus, Users, TrendingUp, DollarSign, Activity, AlertCircle, Coins } from 'lucide-react';
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
  const [userStats, setUserStats] = useState<UserStats>({
    totalContributed: 0,
    totalReceived: 0,
    activeGroups: 0,
    pendingPayouts: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load groups from smart contract
  const loadGroups = useCallback(async () => {
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

      // Add dynamic metadata based on blockchain data
      const groupsWithMetadata = userGroups.map((group: Group) => ({
        ...group,
        name: `Stokvel Group ${group.id}`,
        description: `A decentralized savings group with ${group.groupSize} members`,
        nextPayout: new Date(Date.now() + group.roundDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'cAnchor'
      }));

      const availableGroupsWithMetadata = otherGroups.map((group: Group) => ({
        ...group,
        name: `Available Group ${group.id}`,
        description: `Join this group with ${group.groupSize} members`,
        nextPayout: new Date(Date.now() + group.roundDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'cAnchor'
      }));

      setMyGroups(groupsWithMetadata);
      setAvailableGroups(availableGroupsWithMetadata);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [isConnected, walletAddress, getAllGroups]);

  // Load user statistics from blockchain
  const loadUserStats = useCallback(async () => {
    if (!isConnected || !walletAddress) return;
    
    setIsLoadingStats(true);
    try {
      // For now, we'll calculate basic stats from groups
      // In the future, this should come from the blockchain data service
      const totalContributed = myGroups.reduce((sum, group) => {
        return sum + (parseFloat(group.contributionAmount) * group.members.length);
      }, 0);
      
      const totalReceived = myGroups.reduce((sum, group) => {
        return sum + (parseFloat(group.contributionAmount) * group.members.length);
      }, 0);
      
      const activeGroups = myGroups.filter(group => !group.completed).length;
      const pendingPayouts = myGroups.filter(group => 
        group.started && !group.completed && group.currentRound > 0
      ).length;

      setUserStats({
        totalContributed,
        totalReceived,
        activeGroups,
        pendingPayouts
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isConnected, walletAddress, myGroups]);

  // Load groups when wallet connects
  useEffect(() => {
    if (isConnected) {
      loadGroups();
    }
  }, [isConnected, walletAddress]);

  // Load user stats when groups change
  useEffect(() => {
    if (isConnected && myGroups.length > 0) {
      loadUserStats();
    }
  }, [isConnected, myGroups]);

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
                    Receive payouts automatically when conditions are met
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleWalletConnect} size="lg" className="px-8">
              Connect Wallet to Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Manage your decentralized savings groups and cAnchor stablecoin
            </p>
          </div>
          
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `${userStats.totalContributed.toFixed(2)} cAnchor`}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all groups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `${userStats.totalReceived.toFixed(2)} cAnchor`}
              </div>
              <p className="text-xs text-muted-foreground">
                From payouts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : userStats.activeGroups}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently participating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : userStats.pendingPayouts}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting distribution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            <TabsTrigger value="discover">Discover Groups</TabsTrigger>
            <TabsTrigger value="canchor">cAnchor</TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Groups</h2>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            {isLoadingGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your groups...</p>
              </div>
            ) : myGroups.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>You haven&apos;t joined any groups yet.</p>
                    <Button 
                      onClick={() => setShowCreateModal(true)} 
                      className="mt-4"
                    >
                      Create Your First Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={() => setSelectedGroup(group)}
                    onContribute={() => {
                      setSelectedGroup(group);
                      setShowContributeModal(true);
                    }}
                    onTriggerPayout={() => {
                      setSelectedGroup(group);
                      setShowPayoutModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Discover Groups</h2>
            </div>

            {isLoadingGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading available groups...</p>
              </div>
            ) : availableGroups.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>No groups available to join at the moment.</p>
                    <Button 
                      onClick={() => setShowCreateModal(true)} 
                      className="mt-4"
                    >
                      Create a New Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {availableGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={() => {
                      setSelectedGroup(group);
                      setShowJoinModal(true);
                    }}
                    onContribute={() => {}}
                    onTriggerPayout={() => {}}
                    showJoinButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="canchor" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">cAnchor Stablecoin</h2>
            </div>
            <CAnchorDashboard />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateGroupModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateGroup={handleCreateGroup}
        />

        <JoinGroupModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          onJoinGroup={() => selectedGroup && handleJoinGroup(selectedGroup.id)}
          group={selectedGroup}
        />

        <ContributeModal
          open={showContributeModal}
          onOpenChange={setShowContributeModal}
          onContribute={() => selectedGroup && handleContribute(selectedGroup.id)}
          group={selectedGroup}
          userBalance={typeof userBalance === 'number' ? userBalance : 0}
        />

        <PayoutModal
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          onTriggerPayout={() => selectedGroup && handlePayout(selectedGroup.id)}
          group={selectedGroup}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}