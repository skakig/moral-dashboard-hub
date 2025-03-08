
import { useFunctionMapping } from './useFunctionMapping';
import { FunctionMappingRow } from './FunctionMappingRow';

// Pre-defined TMH functions - moved from FunctionMappingTable
export const TMH_FUNCTIONS = [
  { name: "AI Text Generation", description: "Generate AI content for articles and responses" },
  { name: "AI Image Creation", description: "Create images for social media and content" },
  { name: "AI Video Generation", description: "Create short videos for social media" },
  { name: "Voice Generation", description: "Generate voiceovers for videos and content" },
  { name: "Social Media Post Creation", description: "Create and schedule social media posts" },
  { name: "Moral Analysis", description: "Analyze moral levels and provide insights" },
];

interface PredefinedFunctionsSectionProps {
  functionMappings: any[];
  availableServices: string[];
  onSuccess?: () => void;
}

export function PredefinedFunctionsSection({ 
  functionMappings, 
  availableServices, 
  onSuccess 
}: PredefinedFunctionsSectionProps) {
  const { updatingFunction, updateFunctionMapping } = useFunctionMapping({ onSuccess });

  return (
    <>
      {TMH_FUNCTIONS.map(({ name, description }) => {
        // Find if there's a mapping for this function
        const mapping = functionMappings?.find(m => m.function_name === name);
        return (
          <FunctionMappingRow 
            key={name}
            functionName={name} 
            description={description}
            preferredService={mapping?.preferred_service || null}
            fallbackService={mapping?.fallback_service || null}
            availableServices={availableServices}
            isUpdating={updatingFunction === name}
            onUpdate={updateFunctionMapping}
          />
        );
      })}
    </>
  );
}
