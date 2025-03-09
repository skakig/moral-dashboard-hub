
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Referral } from '@/types/affiliate';

interface ReferralsListProps {
  referrals: Referral[];
}

export const ReferralsList: React.FC<ReferralsListProps> = ({ referrals }) => {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No referrals yet. Share your referral link to start earning commissions!
      </div>
    );
  }

  // Helper function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'converted':
        return 'default'; // Using 'default' instead of 'success'
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper function to format timestamp
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Converted</TableHead>
            <TableHead>Commission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>{formatDate(referral.created_at)}</TableCell>
              <TableCell>{referral.referral_code}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(referral.status)}>
                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(referral.converted_at)}</TableCell>
              <TableCell>${referral.commission_earned.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
