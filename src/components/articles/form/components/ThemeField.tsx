
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";

interface ThemeFieldProps {
  form: any;
  onGenerate?: () => void;
  autoGenerate?: boolean;
  onBlur?: () => void;
}

export function ThemeField({ form, onGenerate, autoGenerate = false, onBlur }: ThemeFieldProps) {
  const [isTypingTimer, setIsTypingTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Function to handle input blur for auto-generation
  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What do you want to make?</FormLabel>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FormControl>
                <Input 
                  placeholder="E.g., A blog post about ethical travel" 
                  {...field} 
                  onBlur={handleBlur}
                />
              </FormControl>
              <FormMessage />
            </div>
            {onGenerate && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsGenerating(true);
                  onGenerate();
                  setTimeout(() => setIsGenerating(false), 300);
                }}
                disabled={isGenerating}
                className="mt-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            )}
          </div>
          {autoGenerate && (
            <p className="text-xs text-muted-foreground mt-1">
              Content will be automatically generated when you finish typing.
            </p>
          )}
        </FormItem>
      )}
    />
  );
}
