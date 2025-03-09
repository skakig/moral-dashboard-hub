
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StepHeader } from "../StepHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConfigStep({ data, onDataChange, onNext, onBack }: any) {
  const [level, setLevel] = useState<number>(data?.moralLevel || 5);
  const [contentLength, setContentLength] = useState<string>(data?.contentLength || "medium");
  
  const handleLevelChange = (value: string) => {
    const newLevel = parseInt(value, 10);
    setLevel(newLevel);
    onDataChange({ ...data, moralLevel: newLevel });
  };
  
  const handleContentLengthChange = (value: string) => {
    setContentLength(value);
    onDataChange({ ...data, contentLength: value });
  };

  // When we interpret the moral level with levels
  const getMoralLevelText = (level: number): string => {
    const levelTexts = {
      1: "Level 1: Survival Morality",
      2: "Level 2: Self-Interest",
      3: "Level 3: Social Contract",
      4: "Level 4: Fairness",
      5: "Level 5: Empathy",
      6: "Level 6: Altruism",
      7: "Level 7: Integrity",
      8: "Level 8: Virtue",
      9: "Level 9: Self-Actualization"
    };
    
    return levelTexts[level as keyof typeof levelTexts] || "Level 5: Empathy";
  };

  // Determine next step name
  const nextStepName = "Content";

  return (
    <div className="space-y-6">
      <StepHeader 
        title="Content Configuration" 
        description="Customize your content settings"
        progress={50}
      />
      
      <div>
        <Label htmlFor="moral-level" className="block mb-2">
          Moral Level
        </Label>
        <Select
          value={String(level)}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a moral level">
              {getMoralLevelText(level)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
              <SelectItem key={l} value={String(l)}>
                {getMoralLevelText(l)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm">
              The moral level affects the perspective and ethical foundation of your content. Higher levels create content with greater moral complexity and depth.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Label htmlFor="content-length" className="block mb-2">
          Content Length
        </Label>
        <Select
          value={contentLength}
          onValueChange={handleContentLengthChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select content length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (300-500 words)</SelectItem>
            <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
            <SelectItem value="long">Long (2000-3000 words)</SelectItem>
          </SelectContent>
        </Select>
        
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm">
              Content length should match your chosen platform. Longer content works better for blogs and YouTube, while shorter formats are ideal for social media.
            </p>
          </CardContent>
        </Card>
      </div>
            
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Next: {nextStepName}
        </Button>
      </div>
    </div>
  );
}
