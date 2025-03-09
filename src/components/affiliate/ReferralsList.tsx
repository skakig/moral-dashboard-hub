
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, User2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Referral } from "@/types/affiliate";

interface ReferralsListProps {
  affiliateId?: string;
}

export function ReferralsList({ affiliateId }: ReferralsListProps) {
  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', affiliateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!affiliateId,
  });

  // Get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return { variant: "default" as const, label: "Converted" };
      case 'pending':
        return { variant: "secondary" as const, label: "Pending" };
      case 'expired':
        return { variant: "outline" as const, label: "Expired" };
      default:
        return { variant: "secondary" as const, label: status };
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading referrals...</div>;
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No referrals found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Share your referral link to start earning commissions
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => {
            const statusBadge = getStatusBadge(referral.status);
            
            return (
              <TableRow key={referral.id}>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(referral.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{referral.referral_code}</TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {referral.commission_earned > 0 
                    ? `$${referral.commission_earned.toFixed(2)}` 
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User2 className="mr-1 h-3 w-3" />
                    {referral.referrer_url ? new URL(referral.referrer_url).hostname : 'Direct'}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
