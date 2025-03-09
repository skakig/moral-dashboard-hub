
import React from 'react';
import { PayoutRequest } from '@/types/affiliate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface PayoutRequestsListProps {
  payoutRequests: PayoutRequest[];
}

export const PayoutRequestsList = ({ payoutRequests }: PayoutRequestsListProps) => {
  if (payoutRequests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't requested any payouts yet.</p>
        <p className="mt-2">Once you've earned at least $50, you can request a payout.</p>
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
          <TableHead>Method</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payoutRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{format(new Date(request.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>${request.amount.toFixed(2)}</TableCell>
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
            <TableCell className="capitalize">
              {request.payout_method}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const StatusBadge = ({ status }: { status: PayoutRequest['status'] }) => {
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
