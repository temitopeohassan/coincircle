'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { X } from 'lucide-react';

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

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  userBalance: number;
  onContribute: (groupId: number) => void;
}

export function ContributeModal({ 
  open, 
  onOpenChange, 
  group, 
  userBalance, 
  onContribute 
}: ContributeModalProps) {
  const [amount, setAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  const handleContribute = async () => {
    if (!group || !amount) return;
    
    const contributionAmount = parseFloat(amount);
    if (contributionAmount <= 0 || contributionAmount > userBalance) return;
    
    setIsContributing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onContribute(group.id);
    } catch (error) {
      console.error('Failed to contribute:', error);
    } finally {
      setIsContributing(false);
    }
  };

  const suggestedAmount = group ? parseFloat(group.contributionAmount) : 0;
  const progressPercentage = group && group.started ? (group.currentRound / group.groupSize) * 100 : 0;

  if (!open || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <CardTitle>Contribute to {group.name || `Group ${group.id}`}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {group.started && (
              <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Round Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {group.currentRound} / {group.groupSize} rounds
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{group.members.length}/{group.groupSize} members</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>

                <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{parseFloat(group.contributionAmount).toFixed(4)} CELO</p>
                  <p className="text-xs text-muted-foreground">Suggested</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount (CELO)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={userBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${suggestedAmount.toFixed(4)}`}
              />
              <p className="text-xs text-muted-foreground">
                Available balance: {userBalance.toFixed(4)} CELO
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Contribution Benefits
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your contribution helps the group progress to the next round. 
                    Each member contributes {parseFloat(group.contributionAmount).toFixed(4)} CELO per round.
                  </p>
                </div>
                </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContribute}
              disabled={isContributing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isContributing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Contributing...
                </div>
              ) : (
                `Contribute ${amount ? parseFloat(amount).toFixed(4) : '0.0000'} CELO`
              )}
            </Button>
          </div>
        </CardContent>
          </div>
        </div>
  );
}