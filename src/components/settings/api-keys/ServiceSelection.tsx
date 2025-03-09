
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ServiceSelectionProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  ref?: React.Ref<HTMLButtonElement>;
  category: string; // Added this prop to fix the type error
}

export function ServiceSelection(props: ServiceSelectionProps) {
  // Determine suggested services based on category
  const suggestedServices = getSuggestedServicesForCategory(props.category);
  
  return (
    <Select
      value={props.value}
      onValueChange={props.onChange}
      disabled={props.disabled}
    >
      <FormControl>
        <SelectTrigger ref={props.ref}>
          <SelectValue placeholder="Select API service" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {suggestedServices.map((service) => (
          <SelectItem key={service} value={service}>
            {service}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Helper function to get suggested services based on category
function getSuggestedServicesForCategory(category: string): string[] {
  switch (category) {
    case "Text Generation":
      return ["OpenAI", "Anthropic", "Cohere", "Custom API"];
    case "Image Generation":
      return ["OpenAI", "Stability AI", "Midjourney API", "Custom API"];
    case "Video Generation":
      return ["Runway ML", "Synthesia", "Custom API"];
    case "Audio Generation":
      return ["ElevenLabs", "Play.ht", "Custom API"];
    case "Voice Generation":
      return ["ElevenLabs", "Play.ht", "Custom API"];
    case "Embeddings":
      return ["OpenAI", "Cohere", "Custom API"];
    default:
      return ["OpenAI", "Anthropic", "Custom API"];
  }
}
