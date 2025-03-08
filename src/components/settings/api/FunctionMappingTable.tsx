
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useFunctionMapping } from './useFunctionMapping';

// Pre-defined TMH functions
export const TMH_FUNCTIONS = [
  { name: "AI Text Generation", description: "Generate AI content for articles and responses" },
  { name: "AI Image Creation", description: "Create images for social media and content" },
  { name: "AI Video Generation", description: "Create short videos for social media" },
  { name: "Voice Generation", description: "Generate voiceovers for videos and content" },
  { name: "Social Media Post Creation", description: "Create and schedule social media posts" },
  { name: "Moral Analysis", description: "Analyze moral levels and provide insights" },
];

interface FunctionMappingTableProps {
  functionMappings: any[];
  availableServices: string[];
  onSuccess?: () => void;
}

export function FunctionMappingTable({ functionMappings, availableServices, onSuccess }: FunctionMappingTableProps) {
  const { updatingFunction, updateFunctionMapping } = useFunctionMapping({ onSuccess });

  return (
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
  );
}
