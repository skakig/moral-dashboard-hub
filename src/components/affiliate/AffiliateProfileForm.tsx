
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { AffiliateProfile } from '@/types/affiliate';
import { useCreateAffiliateProfile, useUpdateAffiliateProfile } from '@/hooks/useAffiliateSystem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface AffiliateProfileFormProps {
  userId: string | null;
  profile?: AffiliateProfile | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AffiliateProfileForm: React.FC<AffiliateProfileFormProps> = ({ 
  userId, 
  profile, 
  onSuccess,
  onCancel 
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Partial<AffiliateProfile>>({
    defaultValues: profile || {
      user_id: userId || undefined,
      name: '',
      email: '',
      preferred_payout_method: 'stripe',
      payout_details: {},
      social_profiles: {}
    }
  });

  const createMutation = useCreateAffiliateProfile();
  const updateMutation = useUpdateAffiliateProfile();

  const onSubmit = async (data: Partial<AffiliateProfile>) => {
    if (profile) {
      updateMutation.mutate({ ...data, id: profile.id }, {
        onSuccess: () => onSuccess()
      });
    } else {
      createMutation.mutate({ ...data, user_id: userId || undefined }, {
        onSuccess: () => onSuccess()
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{profile ? 'Edit Profile' : 'Create Affiliate Profile'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              {...register('name', { required: 'Name is required' })} 
              placeholder="Your Name"
              error={errors.name?.message} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email', { required: 'Email is required' })} 
              placeholder="Your Email"
              error={errors.email?.message}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferred_payout_method">Preferred Payout Method</Label>
            <Select 
              defaultValue={profile?.preferred_payout_method || 'stripe'} 
              onValueChange={(value) => setValue('preferred_payout_method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social_profiles">Social Media Profiles (Optional)</Label>
            <Textarea 
              id="social_profiles"
              placeholder="Instagram: @username, Twitter: @username, YouTube: channel URL"
              {...register('social_profiles')}
            />
          </div>
          
          {profile && (
            <div className="space-y-2">
              <Label>Referral Code</Label>
              <Input value={profile.referral_code} readOnly />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {profile ? 'Save Changes' : 'Submit Application'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
