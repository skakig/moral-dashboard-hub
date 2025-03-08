
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Define the schema for function mapping
const functionMappingSchema = z.object({
  functionName: z.string().min(1, { message: 'Function name is required' }),
  preferredService: z.string().min(1, { message: 'Preferred service is required' }),
  fallbackService: z.string().optional(),
});

// Pre-defined TMH functions
const TMH_FUNCTIONS = [
  { name: "AI Text Generation", description: "Generate AI content for articles and responses" },
  { name: "AI Image Creation", description: "Create images for social media and content" },
  { name: "AI Video Generation", description: "Create short videos for social media" },
  { name: "Voice Generation", description: "Generate voiceovers for videos and content" },
  { name: "Social Media Post Creation", description: "Create and schedule social media posts" },
  { name: "Moral Analysis", description: "Analyze moral levels and provide insights" },
];

interface APIFunctionMappingProps {
  functionMappings: any[];
  apiKeys: Record<string, any[]>;
  onSuccess?: () => void;
}

export function APIFunctionMapping({ functionMappings, apiKeys, onSuccess }: APIFunctionMappingProps) {
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingFunction, setUpdatingFunction] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof functionMappingSchema>>({
    resolver: zodResolver(functionMappingSchema),
    defaultValues: {
      functionName: '',
      preferredService: '',
      fallbackService: '',
    },
  });

  // Create a flat list of all available services from all categories
  const availableServices = Object.values(apiKeys).flat().map(key => key.serviceName);
  
  const updateFunctionMapping = async (functionName: string, preferredService: string, fallbackService?: string) => {
    setUpdatingFunction(functionName);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName,
          preferredService,
          fallbackService: fallbackService || null,
        },
      });
      
      if (error) {
        console.error('Error updating function mapping:', error);
        toast.error(`Failed to update function mapping`);
        return;
      }
      
      if (!data.success) {
        toast.error(data.error || `Failed to update function mapping`);
        return;
      }
      
      toast.success(`Function mapping updated successfully`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during function mapping update:', err);
      toast.error(`Failed to update function mapping`);
    } finally {
      setUpdatingFunction(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof functionMappingSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName: values.functionName,
          preferredService: values.preferredService,
          fallbackService: values.fallbackService || null,
        },
      });
      
      if (error) {
        console.error('Error adding function mapping:', error);
        setError(error.message || `Failed to add function mapping`);
        setIsLoading(false);
        return;
      }
      
      if (!data.success) {
        setError(data.error || `Failed to add function mapping`);
        setIsLoading(false);
        return;
      }
      
      toast.success(`Function mapping added successfully`);
      form.reset();
      setIsAddMappingOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during function mapping creation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">API Function Mapping</h3>
        <div className="space-x-2">
          <Button onClick={onSuccess} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddMappingOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Function to API Service Mapping</CardTitle>
          <CardDescription>
            Configure which API service to use for each TMH function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Function</TableHead>
                <TableHead>Preferred Service</TableHead>
                <TableHead>Fallback Service</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Show all pre-defined TMH functions, mapped with data if available */}
              {TMH_FUNCTIONS.map(({ name, description }) => {
                // Find if there's a mapping for this function
                const mapping = functionMappings?.find(m => m.function_name === name);
                return (
                  <TableRow key={name}>
                    <TableCell className="font-medium">
                      {name}
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={mapping?.preferred_service || ''}
                        disabled={updatingFunction === name}
                        onValueChange={(value) => updateFunctionMapping(
                          name, 
                          value, 
                          mapping?.fallback_service
                        )}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select service..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={mapping?.fallback_service || ''}
                        disabled={updatingFunction === name}
                        onValueChange={(value) => updateFunctionMapping(
                          name, 
                          mapping?.preferred_service || availableServices[0], 
                          value
                        )}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select fallback..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {availableServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {updatingFunction === name ? (
                        <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                      ) : mapping?.preferred_service ? (
                        <span className="text-green-500 text-sm font-medium">Configured</span>
                      ) : (
                        <span className="text-amber-500 text-sm font-medium">Not configured</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Show any other mappings that are not in the pre-defined list */}
              {functionMappings?.filter(m => !TMH_FUNCTIONS.some(f => f.name === m.function_name))
                .map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">
                      {mapping.function_name}
                      <p className="text-xs text-muted-foreground">Custom function</p>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={mapping.preferred_service || ''}
                        disabled={updatingFunction === mapping.function_name}
                        onValueChange={(value) => updateFunctionMapping(
                          mapping.function_name, 
                          value, 
                          mapping.fallback_service
                        )}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select service..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={mapping.fallback_service || ''}
                        disabled={updatingFunction === mapping.function_name}
                        onValueChange={(value) => updateFunctionMapping(
                          mapping.function_name, 
                          mapping.preferred_service, 
                          value
                        )}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select fallback..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {availableServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {updatingFunction === mapping.function_name ? (
                        <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                      ) : (
                        <span className="text-green-500 text-sm font-medium">Configured</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isAddMappingOpen} onOpenChange={setIsAddMappingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Function Mapping</DialogTitle>
            <DialogDescription>
              Map a custom function to an API service
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="functionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Function Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Custom AI Analysis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Service</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableServices.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fallbackService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fallback Service (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fallback service..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availableServices.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <>Add Mapping</>
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
