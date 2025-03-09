
import React from 'react';
import { Referral } from '@/types/affiliate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface ReferralsListProps {
  referrals: Referral[];
}

export const ReferralsList = ({ referrals }: ReferralsListProps) => {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't received any referrals yet.</p>
        <p className="mt-2">Share your referral link to start earning commissions!</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead>Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((referral) => (
          <TableRow key={referral.id}>
            <TableCell>{formatDistanceToNow(new Date(referral.created_at))} ago</TableCell>
            <TableCell>
              <StatusBadge status={referral.status} />
            </TableCell>
            <TableCell>
              {referral.commission_earned > 0 
                ? `$${referral.commission_earned.toFixed(2)}` 
                : '-'}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {referral.referrer_url || 'Direct'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const StatusBadge = ({ status }: { status: Referral['status'] }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    case 'converted':
      return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Converted</Badge>;
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
