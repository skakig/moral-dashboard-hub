
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FunctionMappingTableProps {
  functionMappings: any[];
  availableServices: string[];
  onSuccess?: () => void;
}

export function FunctionMappingTable({ 
  functionMappings, 
  availableServices, 
  onSuccess 
}: FunctionMappingTableProps) {
  const [updatingFunction, setUpdatingFunction] = useState<string | null>(null);

  const handleServiceChange = async (functionName: string, serviceName: string) => {
    setUpdatingFunction(functionName);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-api-function-mapping', {
        body: {
          functionName,
          serviceName
        },
      });
      
      if (error) {
        console.error('Error updating function mapping:', error);
        toast.error(`Failed to update ${functionName} mapping`);
        return;
      }
      
      toast.success(`${functionName} now uses ${serviceName}`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception during mapping update:', err);
      toast.error(`Failed to update ${functionName} mapping: ${err.message}`);
    } finally {
      setUpdatingFunction(null);
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Function Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Preferred Service</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {functionMappings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No function mappings found
              </TableCell>
            </TableRow>
          ) : (
            functionMappings.map((mapping) => (
              <TableRow key={mapping.function_name}>
                <TableCell className="font-medium">{mapping.function_name}</TableCell>
                <TableCell>{mapping.category}</TableCell>
                <TableCell>{mapping.description || 'No description'}</TableCell>
                <TableCell>
                  <Select
                    value={mapping.preferred_service || ''}
                    onValueChange={(value) => handleServiceChange(mapping.function_name, value)}
                    disabled={updatingFunction === mapping.function_name || availableServices.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not configured</SelectItem>
                      {availableServices.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
