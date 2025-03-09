
import React from 'react';
import { useAffiliateLeaderboard } from '@/hooks/useAffiliateSystem';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AffiliateLeaderboardDisplayProps {
  affiliateId?: string;
}

export function AffiliateLeaderboardDisplay({ affiliateId }: AffiliateLeaderboardDisplayProps) {
  const { data: leaderboard = [], isLoading } = useAffiliateLeaderboard(10);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No affiliate data available yet.</p>
        <p className="mt-2">Start earning commissions to appear on the leaderboard!</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Affiliate</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Conversions</TableHead>
          <TableHead>Total Earnings</TableHead>
          <TableHead>Achievements</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.id === affiliateId;
          
          return (
            <TableRow key={entry.id} className={isCurrentUser ? 'bg-primary/5' : ''}>
              <TableCell>
                {entry.rank <= 3 ? (
                  <div className="flex items-center">
                    <Trophy className={`h-5 w-5 mr-1 ${
                      entry.rank === 1 ? 'text-yellow-500' : 
                      entry.rank === 2 ? 'text-gray-400' : 
                      'text-amber-700'
                    }`} />
                    {entry.rank}
                  </div>
                ) : (
                  entry.rank
                )}
              </TableCell>
              <TableCell className="font-medium">
                {entry.name}
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2">You</Badge>
                )}
              </TableCell>
              <TableCell>{entry.tier}</TableCell>
              <TableCell>{entry.total_conversions}</TableCell>
              <TableCell>${entry.total_earnings.toFixed(2)}</TableCell>
              <TableCell>{entry.achievements_count}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
