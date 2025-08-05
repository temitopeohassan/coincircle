'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Info } from 'lucide-react';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (groupData: any) => void;
}

export function CreateGroupModal({ open, onOpenChange, onCreateGroup }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    roundDuration: '30',
    groupSize: '10',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Default to ETH
    payoutType: 'rotation'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      onCreateGroup({
        ...formData,
        contributionAmount: parseFloat(formData.contributionAmount),
      roundDuration: parseInt(formData.roundDuration),
      groupSize: parseInt(formData.groupSize)
      });
      setFormData({
        name: '',
        description: '',
        contributionAmount: '',
      roundDuration: '30',
      groupSize: '10',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      payoutType: 'rotation'
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <CardTitle>Create New Stokvel Group</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
                  required
                />
              </div>

              <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your stokvel group"
                  required
                />
              </div>

              <div className="space-y-2">
            <Label htmlFor="contributionAmount">Contribution Amount (ETH)</Label>
                <Input
              id="contributionAmount"
                  type="number"
              step="0.01"
              value={formData.contributionAmount}
              onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
              placeholder="0.1"
              required
                />
              </div>

                <div className="space-y-2">
            <Label htmlFor="roundDuration">Round Duration (days)</Label>
                  <Input
              id="roundDuration"
                    type="number"
              min="1"
              value={formData.roundDuration}
              onChange={(e) => setFormData({ ...formData, roundDuration: e.target.value })}
              placeholder="30"
                    required
                  />
                </div>

                <div className="space-y-2">
            <Label htmlFor="groupSize">Group Size</Label>
                  <Input
              id="groupSize"
                    type="number"
              min="2"
              max="50"
              value={formData.groupSize}
              onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
              placeholder="10"
                    required
                  />
                </div>

          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              value={formData.tokenAddress}
              onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
              placeholder="0x0000000000000000000000000000000000000000"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use 0x0000000000000000000000000000000000000000 for ETH
            </p>
              </div>

              <div className="space-y-2">
            <Label htmlFor="payoutType">Payout Type</Label>
                <Select
              value={formData.payoutType}
              onValueChange={(value) => setFormData({ ...formData, payoutType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="rotation">Rotation</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Smart Contract Group
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This group will be created on the blockchain with automated payouts. 
                  All transactions are transparent and secure.
                    </p>
                  </div>
                </div>
              </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}