
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Plus } from 'lucide-react';
import { RateLimitsTable } from './rate-limits/RateLimitsTable';
import { AddRateLimitForm } from './rate-limits/AddRateLimitForm';
import { RateLimit as SchemaRateLimit } from './rate-limits/schema';

// The API might return a different shape compared to our schema
interface APIRateLimit {
  id: string;
  service_name: string;
  requests_used: number;
  request_limit: number;
  reset_date: string;
  [key: string]: any;
}

interface APIRateLimitsProps {
  rateLimits: APIRateLimit[];
  onSuccess?: () => void;
}

export function APIRateLimits({ rateLimits, onSuccess }: APIRateLimitsProps) {
  const [isAddRateLimitOpen, setIsAddRateLimitOpen] = useState(false);
  
  const handleSuccess = () => {
    setIsAddRateLimitOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  // Convert API rate limits to schema rate limits
  const mappedRateLimits: SchemaRateLimit[] = rateLimits.map(limit => ({
    id: limit.id,
    service_name: limit.service_name,
    requests_used: limit.requests_used,
    request_limit: limit.request_limit,
    reset_date: limit.reset_date
  }));

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
          <RateLimitsTable 
            rateLimits={mappedRateLimits} 
            onSuccess={onSuccess || (() => {})}
          />
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
          <AddRateLimitForm 
            onSuccess={handleSuccess}
            onCancel={() => setIsAddRateLimitOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
