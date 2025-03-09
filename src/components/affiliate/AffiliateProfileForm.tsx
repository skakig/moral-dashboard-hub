
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AffiliateProfile } from "@/types/affiliate";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  preferredPayoutMethod: z.enum(["stripe", "paypal", "crypto", "bank"]),
  payoutDetails: z.string().optional(),
  socialProfiles: z.string().optional(),
});

export interface AffiliateProfileFormProps {
  initialData?: Partial<AffiliateProfile>;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AffiliateProfileForm({ 
  initialData, 
  userId, 
  onSuccess,
  onCancel 
}: AffiliateProfileFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      preferredPayoutMethod: (initialData?.preferred_payout_method as "stripe" | "paypal" | "crypto" | "bank") || "stripe",
      payoutDetails: initialData?.payout_details ? JSON.stringify(initialData.payout_details) : "",
      socialProfiles: initialData?.social_profiles ? JSON.stringify(initialData.social_profiles) : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format data for API
      const formattedData = {
        name: values.name,
        email: values.email,
        user_id: userId,
        preferred_payout_method: values.preferredPayoutMethod,
        payout_details: values.payoutDetails ? JSON.parse(values.payoutDetails) : {},
        social_profiles: values.socialProfiles ? JSON.parse(values.socialProfiles) : {},
      };
      
      console.log("Submitting affiliate profile:", formattedData);
      
      // Here we would submit to the API
      // For now just call onSuccess
      onSuccess();
    } catch (error) {
      console.error("Error submitting affiliate profile:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="preferredPayoutMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Payout Method</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payout method" />
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
        
        <FormField
          control={form.control}
          name="payoutDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payout Details (JSON format)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder='{"paypal_email": "email@example.com"}'
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="socialProfiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Social Profiles (JSON format)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder='{"twitter": "@username", "instagram": "username"}'
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
