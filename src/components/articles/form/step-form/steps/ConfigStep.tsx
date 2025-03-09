
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArticleFormValues } from "../types";

interface ConfigStepProps {
  form: UseFormReturn<ArticleFormValues>;
  setContentLength: (value: string) => void;
}

export function ConfigStep({ form, setContentLength }: ConfigStepProps) {
  const handleSliderChange = (value: number[]) => {
    form.setValue("moralLevel", value[0], { shouldDirty: true });
  };

  const getMoralLevelColor = (value: number | string): string => {
    const level = Number(value);
    
    if (level <= 3) {
      return "bg-red-500"; // Low moral level
    } else if (level > 3 && level <= 6) {
      return "bg-yellow-500"; // Medium moral level
    } else {
      return "bg-green-500"; // High moral level
    }
  };

  const getMoralLevelLabel = (value: number | string): string => {
    const level = Number(value);

    switch (level) {
      case 1:
        return "Survival Ethics";
      case 2:
        return "Self-Interest";
      case 3:
        return "Social Conformity";
      case 4:
        return "Law & Order";
      case 5:
        return "Human Rights";
      case 6:
        return "Empathetic Morality";
      case 7:
        return "Universal Ethics";
      case 8:
        return "Holistic Morality";
      case 9:
        return "Transcendent Morality";
      default:
        return `Level ${level}`;
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tone of Voice</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                form.trigger("tone");
              }}
              value={field.value}
              defaultValue="informative"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose the tone for your content
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contentLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Length</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setContentLength(value);
                form.trigger("contentLength");
              }}
              value={field.value}
              defaultValue="medium"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a length" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="short">Short (~250 words)</SelectItem>
                <SelectItem value="medium">Medium (~500 words)</SelectItem>
                <SelectItem value="long">Long (~1000 words)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (1500+ words)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose how detailed your content should be
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="moralLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex justify-between items-center">
                <span>Moral Complexity Level</span>
                <Badge variant="secondary" className={getMoralLevelColor(field.value)}>
                  {getMoralLevelLabel(field.value)}
                </Badge>
              </div>
            </FormLabel>
            <FormControl>
              <Slider
                defaultValue={[Number(field.value) || 5]}
                max={9}
                min={1}
                step={1}
                onValueChange={handleSliderChange}
                value={[Number(field.value) || 5]}
              />
            </FormControl>
            <FormDescription>
              Select the moral level of the content (1-9)
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
