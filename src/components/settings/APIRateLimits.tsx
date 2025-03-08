
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Plus, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Progress } from '@/components/ui/progress';

// Define the schema for rate limit
const rateLimitSchema = z.object({
  serviceName: z.string().min(1, { message: 'Service name is required' }),
  requestLimit: z.coerce.number().min(1, { message: 'Request limit must be at least 1' }),
  resetDate: z.string().min(1, { message: 'Reset date is required' }),
});

interface APIRateLimitsProps {
  rateLimits: any[];
  onSuccess?: () => void;
}

export function APIRateLimits({ rateLimits, onSuccess }: APIRateLimitsProps) {
  const [isAddRateLimitOpen, setIsAddRateLimitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resettingLimit, setResettingLimit] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof rateLimitSchema>>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues: {
      serviceName: '',
      requestLimit: 1000,
      resetDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
    },
  });

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

  const onSubmit = async (values: z.infer<typeof rateLimitSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call to create/update rate limit would go here
      // For now, we'll just show a success toast
      toast.success(`Rate limit for ${values.serviceName} added successfully`);
      form.reset();
      setIsAddRateLimitOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during rate limit creation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">API Rate Limits</h3>
        <div className="space-x-2">
          <Button onClick={onSuccess} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddRateLimitOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rate Limit
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>API Service Rate Limits</CardTitle>
          <CardDescription>
            Monitor and manage API usage limits to avoid overages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rateLimits && rateLimits.length > 0 ? (
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
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No rate limits configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add rate limits to track API usage and prevent overages
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isAddRateLimitOpen} onOpenChange={setIsAddRateLimitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add API Rate Limit</DialogTitle>
            <DialogDescription>
              Set usage limits for your API services
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., OpenAI"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requestLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="e.g., 1000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Add Rate Limit</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
