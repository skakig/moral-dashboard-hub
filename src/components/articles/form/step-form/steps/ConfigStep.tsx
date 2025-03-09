
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StepHeader } from "../StepHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConfigStep({ data, onDataChange, onNext, onBack }: any) {
  const [level, setLevel] = useState<number>(data?.moralLevel || 5);
  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [tag, setTag] = useState("");
  
  const handleLevelChange = (value: string) => {
    const newLevel = parseInt(value, 10);
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
            
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Next: Content
        </Button>
      </div>
    </div>
  );
}
