'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';

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

interface GroupCardProps {
  group: Group;
  onContribute?: () => void;
  onViewDetails?: () => void;
  onTriggerPayout?: () => void;
  onJoin?: () => void;
  showJoinButton?: boolean;
}

export function GroupCard({ 
  group, 
  onContribute, 
  onViewDetails, 
  onTriggerPayout,
  onJoin,
  showJoinButton = false 
}: GroupCardProps) {
  const progressPercentage = group.started ? (group.currentRound / group.groupSize) * 100 : 0;
  const nextPayoutDate = group.nextPayout || new Date(Date.now() + group.roundDuration * 24 * 60 * 60 * 1000).toLocaleDateString();
  const isPayoutReady = group.started && group.currentRound < group.groupSize;
  const isGroupFull = group.members.length >= group.groupSize;
  const isGroupCompleted = group.completed;

  const getStatusBadge = () => {
    if (isGroupCompleted) return { text: 'Completed', variant: 'secondary' as const };
    if (group.started) return { text: 'Active', variant: 'default' as const };
    if (isGroupFull) return { text: 'Full', variant: 'destructive' as const };
    return { text: 'Open', variant: 'outline' as const };
  };

  const status = getStatusBadge();

  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{group.name || `Group ${group.id}`}</CardTitle>
            <p className="text-sm text-muted-foreground mb-3">{group.description || `A decentralized savings group`}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={status.variant}>
                {status.text}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {group.payoutType}
              </Badge>
              {group.creator && (
                <Badge variant="outline">Creator</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {group.started && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{group.members.length}/{group.groupSize}</p>
              <p className="text-xs text-muted-foreground">Members</p>
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

        {/* Current Round Info */}
        {group.started && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Round</span>
              <span className="text-sm text-muted-foreground">
                {group.currentRound + 1} of {group.groupSize}
              </span>
            </div>
            {group.currentRound < group.groupSize && (
              <p className="text-xs text-muted-foreground mt-1">
                Next payout in {group.roundDuration} days
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showJoinButton ? (
            <Button
              onClick={onJoin}
              disabled={isGroupFull || group.started}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGroupFull ? 'Group Full' : group.started ? 'Already Started' : 'Join Group'}
            </Button>
          ) : (
            <>
              {onContribute && group.started && !isGroupCompleted && (
                <Button
                  onClick={onContribute}
                  variant="outline"
                  className="flex-1"
                >
              <TrendingUp className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          )}

              {onTriggerPayout && isPayoutReady && (
                <Button
                  onClick={onTriggerPayout}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
              Trigger Payout
            </Button>
          )}

              {isGroupCompleted && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Group completed
                </div>
              )}
            </>
          )}
          
          {onViewDetails && (
          <Button 
              onClick={onViewDetails}
            variant="ghost" 
            size="sm" 
          >
              View Details
          </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}