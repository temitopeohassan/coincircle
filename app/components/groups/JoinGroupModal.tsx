'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, Target } from 'lucide-react';
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

interface JoinGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onJoinGroup: (groupId: number) => void;
}

export function JoinGroupModal({ open, onOpenChange, group, onJoinGroup }: JoinGroupModalProps) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!group) return;
    
    setIsJoining(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onJoinGroup(group.id);
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (!open || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <CardTitle>Join Stokvel Group</CardTitle>
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
            <div>
              <h3 className="text-lg font-semibold mb-2">{group.name || `Group ${group.id}`}</h3>
              <p className="text-sm text-muted-foreground">{group.description || 'A decentralized savings group'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{group.members.length}/{group.groupSize} members</p>
                  <p className="text-xs text-muted-foreground">Current</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{parseFloat(group.contributionAmount).toFixed(4)} CELO</p>
                  <p className="text-xs text-muted-foreground">Per contribution</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{group.groupSize} rounds</p>
                  <p className="text-xs text-muted-foreground">Total rounds</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{group.roundDuration} days</p>
                  <p className="text-xs text-muted-foreground">Round duration</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">What happens when you join?</p>
                                     <p className="text-xs text-blue-700 dark:text-blue-300">
                     You&apos;ll be able to contribute {parseFloat(group.contributionAmount).toFixed(4)} CELO per round and receive 
                     payouts based on the {group.payoutType} schedule. The group will start when {group.groupSize} members join.
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
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining...
                </div>
              ) : (
                'Join Group'
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}