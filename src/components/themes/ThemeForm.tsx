
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ContentTheme } from "@/types/articles";

interface ThemeFormProps {
  initialData?: Partial<ContentTheme>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ThemeForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ThemeFormProps) {
  const defaultValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    keywords: initialData?.keywords?.join(", ") || "",
    target_audience: initialData?.target_audience || "",
    recommended_frequency: initialData?.recommended_frequency || 4,
    is_active: initialData?.is_active ?? true,
  };

  const form = useForm({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold">{initialData?.id ? "Edit Theme" : "Create Theme"}</h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Leadership Ethics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this theme..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords (comma separated)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="leadership, ethics, business" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Business professionals" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recommended_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Frequency (articles per month)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    max={30}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormMessage />
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
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update" : "Create"} Theme
          </Button>
        </div>
      </form>
    </Form>
  );
}
