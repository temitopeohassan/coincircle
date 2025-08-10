"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Coins, TrendingUp, TrendingDown, ArrowRight, Activity, DollarSign } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { blockchainDataService, TokenInfo } from '@/lib/blockchainData';

const CAnchorDashboard = () => {
  const {
    cAnchorContract,
    cAnchorBalance,
    mintCAnchor,
    burnCAnchor,
    transferCAnchor,
    isTransactionPending
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('overview');
  const [mintAmount, setMintAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [collateralTokens, setCollateralTokens] = useState<TokenInfo[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [contractParams, setContractParams] = useState<any>(null);
  const [isLoadingParams, setIsLoadingParams] = useState(true);

  // Load dynamic data from blockchain
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!cAnchorContract) return;

      try {
        setIsLoadingTokens(true);
        setIsLoadingParams(true);

        // Set the contract in the blockchain data service
        blockchainDataService.setCAnchorContract(cAnchorContract);

        // Load collateral tokens and contract parameters in parallel
        const [tokens, params] = await Promise.all([
          blockchainDataService.getSupportedCollateralTokens(),
          blockchainDataService.getCAnchorParameters()
        ]);

        setCollateralTokens(tokens);
        setContractParams(params);

        // Set default selected collateral
        if (tokens.length > 0) {
          setSelectedCollateral(tokens[0].symbol);
        }
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      } finally {
        setIsLoadingTokens(false);
        setIsLoadingParams(false);
      }
    };

    loadBlockchainData();
  }, [cAnchorContract]);

  const handleMint = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert('Please enter a valid mint amount');
      return;
    }
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      alert('Please enter a valid collateral amount');
      return;
    }

    try {
      const selectedToken = collateralTokens.find(token => token.symbol === selectedCollateral);
      if (!selectedToken) {
        alert('Please select a valid collateral token');
        return;
      }

      await mintCAnchor(selectedToken.address, collateralAmount, mintAmount);
      setMintAmount('');
      setCollateralAmount('');
      alert('Successfully minted cAnchor tokens!');
    } catch (error) {
      console.error('Error minting:', error);
      alert('Error minting tokens. Please try again.');
    }
  };

  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await burnCAnchor(burnAmount);
      setBurnAmount('');
      alert('Successfully burned cAnchor tokens!');
    } catch (error) {
      console.error('Error burning:', error);
      alert('Error burning tokens. Please try again.');
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!transferTo || transferTo.length !== 42 || !transferTo.startsWith('0x')) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    try {
      await transferCAnchor(transferTo, transferAmount);
      setTransferAmount('');
      setTransferTo('');
      alert('Successfully transferred cAnchor tokens!');
    } catch (error) {
      console.error('Error transferring:', error);
      alert('Error transferring tokens. Please try again.');
    }
  };

  if (!cAnchorContract) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>cAnchor contract not available. Please connect your wallet first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">cAnchor Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your cAnchor stablecoin - mint, burn, and transfer tokens
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Coins className="w-4 h-4 mr-2" />
          cAnchor
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mint">Mint</TabsTrigger>
          <TabsTrigger value="burn">Burn</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cAnchorBalance || '0.00'}</div>
                <p className="text-xs text-muted-foreground">cAnchor tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingParams ? '...' : contractParams?.targetPrice || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">USD per token</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Min Collateral Ratio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingParams ? '...' : contractParams?.minCollateralRatio || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">Required collateral</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingParams ? '...' : contractParams?.totalSupply || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Circulating supply</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supported Collateral Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTokens ? (
                <div className="text-center py-4">Loading collateral tokens...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {collateralTokens.map((token) => (
                    <div key={token.address} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {token.decimals} decimals
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mint cAnchor Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collateral-token">Collateral Token</Label>
                  <Select value={selectedCollateral} onValueChange={setSelectedCollateral}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collateral token" />
                    </SelectTrigger>
                    <SelectContent>
                      {collateralTokens.map((token) => (
                        <SelectItem key={token.address} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collateral-amount">Collateral Amount</Label>
                  <Input
                    id="collateral-amount"
                    type="number"
                    placeholder="0.00"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mint-amount">Mint Amount (cAnchor)</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <Button 
                onClick={handleMint} 
                disabled={isTransactionPending || !mintAmount || !collateralAmount || !selectedCollateral}
                className="w-full"
              >
                {isTransactionPending ? 'Minting...' : 'Mint cAnchor'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Burn cAnchor Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="burn-amount">Burn Amount</Label>
                <Input
                  id="burn-amount"
                  type="number"
                  placeholder="0.00"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <Button 
                onClick={handleBurn} 
                disabled={isTransactionPending || !burnAmount}
                className="w-full"
              >
                {isTransactionPending ? 'Burning...' : 'Burn cAnchor'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer cAnchor Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-to">Recipient Address</Label>
                <Input
                  id="transfer-to"
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Transfer Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <Button 
                onClick={handleTransfer} 
                disabled={isTransactionPending || !transferAmount || !transferTo}
                className="w-full"
              >
                {isTransactionPending ? 'Transferring...' : 'Transfer cAnchor'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CAnchorDashboard;
