'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'group_joined' | 'group_created';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  groupName?: string;
}

export function ActivityFeed() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'contribution',
      title: 'Contribution Made',
      description: 'You contributed to Tech Professionals Stokvel',
      amount: 0.5,
      timestamp: '2 hours ago',
      groupName: 'Tech Professionals Stokvel'
    },
    {
      id: '2',
      type: 'payout',
      title: 'Payout Received',
      description: 'You received a payout from University Alumni Fund',
      amount: 8.2,
      timestamp: '1 day ago',
      groupName: 'University Alumni Fund'
    },
    {
      id: '3',
      type: 'group_joined',
      title: 'Joined Group',
      description: 'You joined Entrepreneurs Circle',
      timestamp: '3 days ago',
      groupName: 'Entrepreneurs Circle'
    },
    {
      id: '4',
      type: 'group_created',
      title: 'Group Created',
      description: 'You created Tech Professionals Stokvel',
      timestamp: '1 week ago',
      groupName: 'Tech Professionals Stokvel'
    },
    {
      id: '5',
      type: 'contribution',
      title: 'Contribution Made',
      description: 'You contributed to University Alumni Fund',
      amount: 0.75,
      timestamp: '1 week ago',
      groupName: 'University Alumni Fund'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'contribution':
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'payout':
        return <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'group_joined':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'group_created':
        return <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'contribution':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'payout':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'group_joined':
        return 'bg-purple-100 dark:bg-purple-900/30';
      case 'group_created':
        return 'bg-orange-100 dark:bg-orange-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                {activity.groupName && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {activity.groupName}
                  </Badge>
                )}
                {activity.amount && (
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{activity.amount.toFixed(2)} ETH</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}