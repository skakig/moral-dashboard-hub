
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PredefinedFunctionsSection } from './PredefinedFunctionsSection';
import { CustomFunctionsSection } from './CustomFunctionsSection';

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
        {/* Predefined TMH functions section */}
        <PredefinedFunctionsSection 
          functionMappings={functionMappings} 
          availableServices={availableServices} 
          onSuccess={onSuccess} 
        />
        
        {/* Custom functions section */}
        <CustomFunctionsSection 
          functionMappings={functionMappings} 
          availableServices={availableServices} 
          onSuccess={onSuccess} 
        />
      </TableBody>
    </Table>
  );
}
