
import React, { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";

interface ThemeFieldProps {
  form: any;
  onGenerate?: () => void;
  autoGenerate?: boolean;
  onBlur?: () => void;
}

export function ThemeField({ form, onGenerate, autoGenerate = true, onBlur }: ThemeFieldProps) {
  const [isTypingTimer, setIsTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [typingPaused, setTypingPaused] = useState(false);

  // Reset typing paused status when theme changes
  useEffect(() => {
    const subscription = form.watch((value: any, { name }: { name: string }) => {
      if (name === "theme") {
        setTypingPaused(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Function to handle auto-generation after user stops typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTypingTimer) {
      clearTimeout(isTypingTimer);
    }
    
    if (autoGenerate && e.target.value.length > 5) {
      setIsTypingTimer(
        setTimeout(() => {
          if (!typingPaused && onGenerate) {
            setIsGenerating(true);
            onGenerate();
            setTimeout(() => setIsGenerating(false), 300);
            setTypingPaused(true); // Prevent repeated auto-generation until theme changes again
          }
        }, 1500)
      );
    }
  };

  // Function to handle input blur for auto-generation
  const handleBlur = () => {
    const themeValue = form.getValues("theme");
    
    if (autoGenerate && themeValue && themeValue.length > 5 && !typingPaused && onGenerate) {
      setIsGenerating(true);
      onGenerate();
      setTimeout(() => setIsGenerating(false), 300);
      setTypingPaused(true);
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  const handleCopy = () => {
    const value = form.getValues("theme");
    if (value) {
      navigator.clipboard.writeText(String(value));
      toast.success("Theme copied to clipboard");
    } else {
      toast.error("No theme to copy");
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
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange(e);
                  }}
                  onBlur={handleBlur}
                />
              </FormControl>
              <FormMessage />
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="h-9 px-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
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
                className="h-9 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : typingPaused ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Revise Content
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate
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
