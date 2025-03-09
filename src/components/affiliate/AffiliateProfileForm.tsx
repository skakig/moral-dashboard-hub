
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateAffiliateProfile, useUpdateAffiliateProfile } from '@/hooks/useAffiliateSystem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AffiliateProfile } from '@/types/affiliate';

interface AffiliateProfileFormProps {
  userId: string | null;
  profile?: AffiliateProfile | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  preferred_payout_method: z.enum(['stripe', 'paypal', 'crypto', 'bank']),
  social_profiles: z.object({
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  }),
});

export const AffiliateProfileForm = ({ 
  userId, 
  profile,
  onSuccess, 
  onCancel 
}: AffiliateProfileFormProps) => {
  const createProfile = useCreateAffiliateProfile();
  const updateProfile = useUpdateAffiliateProfile();
  
  const isEditing = !!profile;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      preferred_payout_method: profile?.preferred_payout_method || 'stripe',
      social_profiles: {
        website: profile?.social_profiles?.website || '',
        twitter: profile?.social_profiles?.twitter || '',
        instagram: profile?.social_profiles?.instagram || '',
        facebook: profile?.social_profiles?.facebook || '',
        tiktok: profile?.social_profiles?.tiktok || '',
        youtube: profile?.social_profiles?.youtube || '',
      },
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isEditing && profile) {
      // Update existing profile
      await updateProfile.mutateAsync({
        id: profile.id,
        ...values,
      });
    } else if (userId) {
      // Create new profile
      await createProfile.mutateAsync({
        user_id: userId,
        ...values,
      });
    }
    
    onSuccess();
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Affiliate Profile' : 'Become an Affiliate'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Your name will be displayed on your affiliate profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>
                    We'll use this email for communication about your affiliate account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferred_payout_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Payout Method</FormLabel>
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
                  <FormDescription>
                    How you'd like to receive your affiliate commissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="text-base font-medium mb-2">Social Media Profiles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your social media profiles to help us understand your audience and reach.
              </p>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="social_profiles.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website/Blog</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="social_profiles.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter/X</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="@username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="social_profiles.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="social_profiles.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="username or page" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="social_profiles.tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="social_profiles.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="channel name or URL" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProfile.isPending || updateProfile.isPending}
              >
                {isEditing 
                  ? (updateProfile.isPending ? 'Saving...' : 'Save Changes') 
                  : (createProfile.isPending ? 'Submitting...' : 'Submit Application')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
