
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { FunctionMappingTable } from './FunctionMappingTable';
import { AddFunctionMappingDialog } from './AddFunctionMappingDialog';
import { useFunctionMapping } from './hooks/useFunctionMapping';
import { Badge } from '@/components/ui/badge';

interface APIFunctionMappingProps {
  functionMappings: any[];
  apiKeys: Record<string, any[]>;
  onSuccess?: () => void;
}

export function APIFunctionMapping({ functionMappings, apiKeys, onSuccess }: APIFunctionMappingProps) {
  const { isAddMappingOpen, setIsAddMappingOpen } = useFunctionMapping({ onSuccess });
  
  // Create a flat list of all available services from all categories
  const availableServices = Object.values(apiKeys).flat().map(key => key.serviceName);
  const configuredFunctions = functionMappings.filter(fm => fm.preferred_service).length;
  const totalFunctions = functionMappings.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">API Function Mapping</h3>
          <Badge variant="outline">
            {configuredFunctions}/{totalFunctions} Configured
          </Badge>
        </div>
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
          <FunctionMappingTable 
            functionMappings={functionMappings}
            availableServices={availableServices}
            onSuccess={onSuccess}
          />
        </CardContent>
      </Card>
      
      <AddFunctionMappingDialog
        isOpen={isAddMappingOpen}
        onOpenChange={setIsAddMappingOpen}
        availableServices={availableServices}
        onSuccess={onSuccess}
      />
    </div>
  );
}
