
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RateLimit } from './schema';

interface RateLimitsTableProps {
  rateLimits: RateLimit[];
  onSuccess: () => void;
}

export function RateLimitsTable({ rateLimits, onSuccess }: RateLimitsTableProps) {
  const [resettingLimit, setResettingLimit] = useState<string | null>(null);

  const resetRateLimit = async (limitId: string) => {
    setResettingLimit(limitId);
    
    try {
      const { data, error } = await supabase.functions.invoke('reset-rate-limits', {
        body: {
          rateLimitId: limitId,
        },
      });
      
      if (error) {
        console.error('Error resetting rate limit:', error);
        toast.error(`Failed to reset rate limit`);
        return;
      }
      
      if (!data.success) {
        toast.error(data.error || `Failed to reset rate limit`);
        return;
      }
      
      toast.success(`Rate limit reset successfully`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during rate limit reset:', err);
      toast.error(`Failed to reset rate limit`);
    } finally {
      setResettingLimit(null);
    }
  };

  if (rateLimits.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No rate limits configured</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add rate limits to track API usage and prevent overages
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Service</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Limit</TableHead>
          <TableHead>Reset Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rateLimits.map((limit) => {
          const usagePercent = (limit.requests_used / limit.request_limit) * 100;
          let statusColor = "bg-green-500";
          if (usagePercent > 90) statusColor = "bg-red-500";
          else if (usagePercent > 75) statusColor = "bg-amber-500";
          
          return (
            <TableRow key={limit.id}>
              <TableCell className="font-medium">
                {limit.service_name}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{limit.requests_used} / {limit.request_limit}</span>
                    <span>{usagePercent.toFixed(1)}%</span>
                  </div>
                  <Progress className="h-2" value={usagePercent} indicatorClassName={statusColor} />
                </div>
              </TableCell>
              <TableCell>{limit.request_limit.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(limit.reset_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resetRateLimit(limit.id)}
                  disabled={resettingLimit === limit.id}
                >
                  {resettingLimit === limit.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reset Counter"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
