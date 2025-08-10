'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
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

interface PayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onTriggerPayout: (groupId: number) => void;
}

export function PayoutModal({ open, onOpenChange, group, onTriggerPayout }: PayoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayout = async () => {
    if (!group) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onTriggerPayout(group.id);
    } catch (error) {
      console.error('Failed to process payout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open || !group) return null;

  const nextPayoutDate = group.nextPayout ? new Date(group.nextPayout).toLocaleDateString() : 'Not scheduled';
  const isPayoutReady = group.started && group.currentRound < group.groupSize;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <CardTitle>Payout Details</CardTitle>
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
              <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
              <Badge variant={isPayoutReady ? "default" : "secondary"}>
                {isPayoutReady ? "Ready for Payout" : "Next Payout"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{(parseFloat(group.contributionAmount) * group.members.length).toFixed(2)} cAnchor</p>
                  <p className="text-xs text-muted-foreground">Available pool</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{group.members.length} members</p>
                  <p className="text-xs text-muted-foreground">In group</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{nextPayoutDate}</p>
                  <p className="text-xs text-muted-foreground">Payout date</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium capitalize">{group.payoutType}</p>
                  <p className="text-xs text-muted-foreground">Schedule</p>
                </div>
              </div>
            </div>

            {isPayoutReady ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Payout Ready!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      The pool has reached the payout date. You can now trigger the payout 
                      to receive {(parseFloat(group.contributionAmount) * group.members.length).toFixed(2)} cAnchor.
                    </p>
                  </div>
                </div>
                    </div>
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  </div>
                <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Next Payout Scheduled
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                      The next payout is scheduled for {nextPayoutDate}. The pool currently 
                                              has {(parseFloat(group.contributionAmount) * group.members.length).toFixed(2)} cAnchor available.
                  </p>
                </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            {isPayoutReady && (
            <Button 
                onClick={handlePayout}
                disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
                {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                                      `Claim ${(parseFloat(group.contributionAmount) * group.members.length).toFixed(2)} cAnchor`
              )}
            </Button>
            )}
          </div>
        </CardContent>
          </div>
        </div>
  );
}