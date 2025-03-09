
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StepHeader } from "../StepHeader";
import { StepControls } from "../StepControls";

export function ConfigStep({ data, onDataChange, onNext, onBack }: any) {
  const [level, setLevel] = useState<number>(data?.moralLevel || 5);
  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [tag, setTag] = useState("");
  
  const handleSliderChange = (value: number[]) => {
    // Convert to a number explicitly
    const newLevel = Number(value[0]);
    setLevel(newLevel);
    onDataChange({ ...data, moralLevel: newLevel });
  };
  
  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onDataChange({ ...data, tags: newTags });
      setTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    onDataChange({ ...data, tags: newTags });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // When we interpret the moral level with levels
  const getMoralLevelText = (level: number): string => {
    if (level <= 1) return "Level 1: Survival Morality";
    if (level > 1 && level <= 2) return "Level 2: Self-Interest";
    if (level > 2 && level <= 3) return "Level 3: Social Contract";
    if (level > 3 && level <= 4) return "Level 4: Fairness";
    if (level > 4 && level <= 5) return "Level 5: Empathy";
    if (level > 5 && level <= 6) return "Level 6: Altruism";
    if (level > 6 && level <= 7) return "Level 7: Integrity";
    if (level > 7 && level <= 8) return "Level 8: Virtue";
    return "Level 9: Self-Actualization"; 
  };

  return (
    <div className="space-y-6">
      <StepHeader 
        title="Content Configuration" 
        description="Customize your content settings"
      />
      
      <div>
        <Label htmlFor="moral-level" className="block mb-2">
          Moral Level: <span className="font-medium">{getMoralLevelText(level)}</span>
        </Label>
        <Slider 
          id="moral-level"
          min={1} 
          max={9} 
          step={1} 
          value={[level]} 
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Level 1</span>
          <span>Level 9</span>
        </div>
        
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm">
              The moral level affects the perspective and ethical foundation of your content. Higher levels create content with greater moral complexity and depth.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <div>
        <Label htmlFor="tags" className="block mb-2">Tags (Optional)</Label>
        <div className="flex">
          <Input 
            id="tags"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add keywords or tags and press Enter"
            className="flex-grow"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={addTag}
            className="ml-2"
          >
            Add
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
        
        <p className="mt-2 text-sm text-gray-500">
          Tags help categorize your content and improve searchability.
        </p>
      </div>
            
      <StepControls 
        onNext={onNext} 
        onBack={onBack}
        nextLabel="Next: Content" 
      />
    </div>
  );
}
