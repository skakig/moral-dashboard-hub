
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreatePayoutRequest } from '@/hooks/useAffiliateSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PayoutRequestFormProps {
  affiliateId: string;
  maxAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  amount: z.coerce.number().min(50, 'Minimum payout amount is $50').max(10000, 'Maximum payout amount is $10,000'),
  payout_method: z.enum(['stripe', 'paypal', 'crypto', 'bank']),
  payout_details: z.object({
    account: z.string().optional(),
    email: z.string().email().optional(),
    wallet_address: z.string().optional(),
    bank_account: z.string().optional(),
    routing_number: z.string().optional(),
    swift_code: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export function PayoutRequestForm({ 
  affiliateId, 
  maxAmount, 
  onSuccess, 
  onCancel 
}: PayoutRequestFormProps) {
  const createPayoutRequest = useCreatePayoutRequest();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Math.min(maxAmount, 50),
      payout_method: 'stripe',
      notes: '',
    },
  });
  
  const selectedMethod = form.watch('payout_method');
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createPayoutRequest.mutateAsync({
      affiliate_id: affiliateId,
      amount: values.amount,
      payout_method: values.payout_method,
      payout_details: values.payout_details || {},
      notes: values.notes,
    });
    
    onSuccess();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      min={50} 
                      max={maxAmount} 
                    />
                  </FormControl>
                  <FormDescription>
                    Available balance: ${maxAmount.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="payout_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payout Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payout method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedMethod === 'paypal' && (
              <FormField
                control={form.control}
                name="payout_details.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PayPal Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {selectedMethod === 'crypto' && (
              <FormField
                control={form.control}
                name="payout_details.wallet_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      We support USDT, BTC, and ETH payments.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {selectedMethod === 'bank' && (
              <>
                <FormField
                  control={form.control}
                  name="payout_details.account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payout_details.routing_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payout_details.swift_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT Code (for international)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPayoutRequest.isPending || maxAmount < 50}
            >
              {createPayoutRequest.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
