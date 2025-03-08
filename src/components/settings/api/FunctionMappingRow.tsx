
import { TableCell, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface FunctionMappingRowProps {
  functionName: string;
  description?: string;
  preferredService: string | null;
  fallbackService: string | null;
  availableServices: string[];
  isUpdating: boolean;
  isCustom?: boolean;
  onUpdate: (functionName: string, preferredService: string, fallbackService?: string) => void;
}

export function FunctionMappingRow({
  functionName,
  description,
  preferredService,
  fallbackService,
  availableServices,
  isUpdating,
  isCustom = false,
  onUpdate
}: FunctionMappingRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {functionName}
        <p className="text-xs text-muted-foreground">
          {isCustom ? 'Custom function' : description}
        </p>
      </TableCell>
      <TableCell>
        <Select 
          defaultValue={preferredService || ''}
          disabled={isUpdating}
          onValueChange={(value) => onUpdate(
            functionName, 
            value, 
            fallbackService || undefined
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
          defaultValue={fallbackService || ''}
          disabled={isUpdating}
          onValueChange={(value) => onUpdate(
            functionName, 
            preferredService || availableServices[0], 
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
        {isUpdating ? (
          <Loader2 className="h-4 w-4 ml-auto animate-spin" />
        ) : preferredService ? (
          <span className="text-green-500 text-sm font-medium">Configured</span>
        ) : (
          <span className="text-amber-500 text-sm font-medium">Not configured</span>
        )}
      </TableCell>
    </TableRow>
  );
}
