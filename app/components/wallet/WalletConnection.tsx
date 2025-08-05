'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  address?: string;
}

export function WalletConnection({ 
  onConnect, 
  onDisconnect, 
  isConnected = false, 
  address = '' 
}: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
    // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      onConnect(mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatAddress(address)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectWallet}
              className="h-8 px-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your wallet to start using Crypto Stokvel
          </p>
        </div>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
    </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}