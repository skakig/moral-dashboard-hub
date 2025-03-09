
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleFormValues } from "../types";
import { DemographicTargetingField } from "../../components/DemographicTargetingField";

interface ConfigStepProps {
  form: UseFormReturn<ArticleFormValues>;
  setContentLength: (value: string) => void;
}

export function ConfigStep({ form, setContentLength }: ConfigStepProps) {
  const contentLength = form.watch("contentLength") || "medium";
  const tone = form.watch("tone") || "informative";
  
  const moralLevelValue = form.watch("moralLevel") || 5;
  
  const handleMoralLevelChange = (value: number[]) => {
    form.setValue("moralLevel", value[0]);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contentLength">Content Length</Label>
        <Select
          value={contentLength}
          onValueChange={(value) => {
            form.setValue("contentLength", value);
            setContentLength(value);
          }}
        >
          <SelectTrigger id="contentLength">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (250 words)</SelectItem>
            <SelectItem value="medium">Medium (500 words)</SelectItem>
            <SelectItem value="long">Long (1000+ words)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tone">Content Tone</Label>
        <Select
          value={tone}
          onValueChange={(value) => form.setValue("tone", value)}
        >
          <SelectTrigger id="tone">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informative">Informative</SelectItem>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="persuasive">Persuasive</SelectItem>
            <SelectItem value="motivational">Motivational</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="moralLevel">Moral Level (1-9)</Label>
          <span className="text-sm font-medium">{moralLevelValue}</span>
        </div>
        <Slider
          id="moralLevel"
          min={1}
          max={9}
          step={1}
          value={[moralLevelValue]}
          onValueChange={handleMoralLevelChange}
        />
        <p className="text-xs text-muted-foreground">
          {moralLevelValue <= 3 && "Level 1-3: Focus on survival, self-interest, and social conformity."}
          {moralLevelValue > 3 && moralLevelValue <= 6 && "Level 4-6: Focus on fairness, empathy, and altruism."}
          {moralLevelValue > 6 && "Level 7-9: Focus on integrity, virtue, and self-actualization."}
        </p>
      </div>
      
      <DemographicTargetingField form={form} />
    </div>
  );
}
