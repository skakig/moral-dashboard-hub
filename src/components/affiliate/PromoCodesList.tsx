
import React from 'react';
import { PromoCode } from '@/types/affiliate';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PromoCodesListProps {
  promoCodes: PromoCode[];
}

export const PromoCodesList = ({ promoCodes }: PromoCodesListProps) => {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard');
  };
  
  if (promoCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't created any promo codes yet.</p>
        <p className="mt-2">Create a promo code to offer discounts to your referrals.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Valid Until</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {promoCodes.map((promoCode) => (
          <TableRow key={promoCode.id}>
            <TableCell className="font-medium">{promoCode.code}</TableCell>
            <TableCell>
              {promoCode.discount_percent 
                ? `${promoCode.discount_percent}%` 
                : promoCode.discount_fixed 
                  ? `$${promoCode.discount_fixed.toFixed(2)}` 
                  : '-'}
            </TableCell>
            <TableCell>
              {promoCode.usage_count}/{promoCode.usage_limit || '∞'}
            </TableCell>
            <TableCell>
              {promoCode.is_active ? (
                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {promoCode.valid_until 
                ? format(new Date(promoCode.valid_until), 'MMM d, yyyy') 
                : 'No expiration'}
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleCopyCode(promoCode.code)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
