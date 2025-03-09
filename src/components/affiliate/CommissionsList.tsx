
import React from 'react';
import { Commission } from '@/types/affiliate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface CommissionsListProps {
  commissions: Commission[];
}

export const CommissionsList = ({ commissions }: CommissionsListProps) => {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't earned any commissions yet.</p>
        <p className="mt-2">Commissions are earned when your referrals make a purchase.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((commission) => (
          <TableRow key={commission.id}>
            <TableCell>{format(new Date(commission.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>${commission.amount.toFixed(2)}</TableCell>
            <TableCell>
              <StatusBadge status={commission.status} />
            </TableCell>
            <TableCell>
              {commission.commission_type === 'one_time' ? 'One-time' : 'Recurring'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const StatusBadge = ({ status }: { status: Commission['status'] }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    case 'approved':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Approved</Badge>;
    case 'paid':
      return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
