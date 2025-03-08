
import { useFunctionMapping } from './useFunctionMapping';
import { FunctionMappingRow } from './FunctionMappingRow';
import { TMH_FUNCTIONS } from './PredefinedFunctionsSection';

interface CustomFunctionsSectionProps {
  functionMappings: any[];
  availableServices: string[];
  onSuccess?: () => void;
}

export function CustomFunctionsSection({ 
  functionMappings, 
  availableServices, 
  onSuccess 
}: CustomFunctionsSectionProps) {
  const { updatingFunction, updateFunctionMapping } = useFunctionMapping({ onSuccess });

  // Get only custom mappings (not in predefined list)
  const customMappings = functionMappings?.filter(
    m => !TMH_FUNCTIONS.some(f => f.name === m.function_name)
  );

  if (!customMappings?.length) {
    return null;
  }

  return (
    <>
      {customMappings.map((mapping) => (
        <FunctionMappingRow 
          key={mapping.id || mapping.function_name}
          functionName={mapping.function_name}
          preferredService={mapping.preferred_service || null}
          fallbackService={mapping.fallback_service || null}
          availableServices={availableServices}
          isUpdating={updatingFunction === mapping.function_name}
          isCustom={true}
          onUpdate={updateFunctionMapping}
        />
      ))}
    </>
  );
}
