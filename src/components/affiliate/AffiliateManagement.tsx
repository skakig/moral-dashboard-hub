
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AffiliateProfile } from "@/types/affiliate";
import { toast } from "sonner";

export function AffiliateManagement() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateProfile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all affiliate profiles
  const { data: affiliates, isLoading } = useQuery({
    queryKey: ['affiliates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as AffiliateProfile[];
    }
  });

  // Mutation to update affiliate status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      approved_at = status === 'approved' ? new Date().toISOString() : null 
    }: { 
      id: string; 
      status: string; 
      approved_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .update({ status, approved_at })
        .eq('id', id);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
      toast.success("Affiliate status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update affiliate status");
      console.error("Error updating affiliate status:", error);
    }
  });

  // Handler for approving an affiliate
  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  // Handler for rejecting an affiliate
  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  // Handler for suspending an affiliate
  const handleSuspend = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'suspended' });
  };

  // Handler for viewing affiliate details
  const handleViewDetails = (affiliate: AffiliateProfile) => {
    setSelectedAffiliate(affiliate);
    setIsDetailsOpen(true);
  };

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return "success";
      case 'pending':
        return "warning";
      case 'rejected':
        return "destructive";
      case 'suspended':
        return "outline";
      default:
        return "secondary";
    }
  };

  // Custom styles for status badges
  const statusStyles = {
    approved: "bg-green-100 text-green-800 hover:bg-green-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    suspended: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Affiliate Management</h2>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading affiliates...</div>
      ) : !affiliates || affiliates.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No affiliates found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.name}</TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={statusStyles[affiliate.status as keyof typeof statusStyles]}
                    >
                      {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{affiliate.tier}</TableCell>
                  <TableCell>${affiliate.earnings_total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(affiliate.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(affiliate)}
                    >
                      View
                    </Button>
                    {affiliate.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                          onClick={() => handleApprove(affiliate.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          onClick={() => handleReject(affiliate.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {affiliate.status === 'approved' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                        onClick={() => handleSuspend(affiliate.id)}
                      >
                        Suspend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Affiliate Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Affiliate Details</DialogTitle>
            <DialogDescription>
              View detailed information about this affiliate.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAffiliate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedAffiliate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedAffiliate.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant="outline"
                      className={statusStyles[selectedAffiliate.status as keyof typeof statusStyles]}
                    >
                      {selectedAffiliate.status.charAt(0).toUpperCase() + selectedAffiliate.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className="font-medium">{selectedAffiliate.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(selectedAffiliate.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedAffiliate.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved:</span>
                      <span className="font-medium">{new Date(selectedAffiliate.approved_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referral Code:</span>
                    <span className="font-medium">{selectedAffiliate.referral_code}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Financial Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission Rate:</span>
                    <span className="font-medium">{selectedAffiliate.commission_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earnings:</span>
                    <span className="font-medium">${selectedAffiliate.earnings_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Earnings:</span>
                    <span className="font-medium">${selectedAffiliate.earnings_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Earnings:</span>
                    <span className="font-medium">${selectedAffiliate.earnings_pending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payout Method:</span>
                    <span className="font-medium">{selectedAffiliate.preferred_payout_method}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mt-6 mb-2">Payout Details</h3>
                <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedAffiliate.payout_details, null, 2)}
                </pre>

                <h3 className="font-semibold text-lg mt-6 mb-2">Social Profiles</h3>
                <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedAffiliate.social_profiles, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
