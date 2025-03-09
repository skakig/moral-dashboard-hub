
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreatePromoCode } from '@/hooks/useAffiliateSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PromoCodeFormProps {
  affiliateId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(15, 'Code must be 15 characters or less'),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.coerce.number().min(1, 'Discount must be at least 1').max(100, 'Maximum discount is 100'),
  usage_limit: z.coerce.number().min(1, 'Usage limit must be at least 1').max(1000, 'Maximum usage limit is 1000').optional().nullable(),
  is_limited: z.boolean().default(false),
  has_expiration: z.boolean().default(false),
  valid_until: z.string().optional().nullable(),
});

export const PromoCodeForm = ({ 
  affiliateId, 
  onSuccess, 
  onCancel 
}: PromoCodeFormProps) => {
  const createPromoCode = useCreatePromoCode();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      is_limited: false,
      has_expiration: false,
      usage_limit: null,
      valid_until: null,
    },
  });
  
  const discountType = form.watch('discount_type');
  const isLimited = form.watch('is_limited');
  const hasExpiration = form.watch('has_expiration');
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const promoCode: any = {
      affiliate_id: affiliateId,
      code: values.code.toUpperCase(),
      is_active: true,
    };
    
    // Set the right discount type
    if (values.discount_type === 'percent') {
      promoCode.discount_percent = values.discount_value;
    } else {
      promoCode.discount_fixed = values.discount_value;
    }
    
    // Add usage limit if enabled
    if (values.is_limited && values.usage_limit) {
      promoCode.usage_limit = values.usage_limit;
    }
    
    // Add expiration date if enabled
    if (values.has_expiration && values.valid_until) {
      promoCode.valid_until = new Date(values.valid_until).toISOString();
    }
    
    await createPromoCode.mutateAsync(promoCode);
    onSuccess();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Promo Code</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onBlur={(e) => {
                        field.onBlur();
                        form.setValue('code', e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a memorable code for your customers to use.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="discount_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Discount Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="percent" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Percentage (%)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fixed" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Fixed Amount ($)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="discount_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      min={1} 
                      max={discountType === 'percent' ? 100 : 1000} 
                    />
                  </FormControl>
                  <FormDescription>
                    {discountType === 'percent' 
                      ? 'Enter a percentage discount (1-100%).' 
                      : 'Enter a fixed amount discount in dollars.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_limited"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Limit Usage
                    </FormLabel>
                    <FormDescription>
                      Set a maximum number of times this code can be used.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isLimited && (
              <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                        min={1} 
                        max={1000} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="has_expiration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Set Expiration Date
                    </FormLabel>
                    <FormDescription>
                      Make this code expire after a certain date.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {hasExpiration && (
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPromoCode.isPending}
            >
              {createPromoCode.isPending ? 'Creating...' : 'Create Promo Code'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
