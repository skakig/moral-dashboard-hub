
import * as z from 'zod';

// Define the schema for rate limit
export const rateLimitSchema = z.object({
  serviceName: z.string().min(1, { message: 'Service name is required' }),
  requestLimit: z.coerce.number().min(1, { message: 'Request limit must be at least 1' }),
  resetDate: z.string().min(1, { message: 'Reset date is required' }),
});

export type RateLimitFormValues = z.infer<typeof rateLimitSchema>;

export interface RateLimit {
  id: string;
  service_name: string;
  requests_used: number;
  request_limit: number;
  reset_date: string;
}
