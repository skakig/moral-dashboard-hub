
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { getDemographicTargeting } from "@/services/analyticsService";

interface DemographicTargetingFieldProps {
  value: any;
  onChange: (value: any) => void;
}

export function DemographicTargetingField({ value, onChange }: DemographicTargetingFieldProps) {
  const [demographics, setDemographics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const data = getDemographicTargeting();
        setDemographics(data);
      } catch (error) {
        console.error("Error fetching demographics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDemographics();
  }, []);
  
  const handleSelection = (category: string, id: string) => {
    const newValue = { ...value };
    
    if (!newValue[category]) {
      newValue[category] = [];
    }
    
    const index = newValue[category].indexOf(id);
    if (index > -1) {
      newValue[category].splice(index, 1);
    } else {
      newValue[category].push(id);
    }
    
    onChange(newValue);
  };
  
  if (loading) {
    return <div>Loading demographic targeting options...</div>;
  }
  
  if (!demographics) {
    return <div>Unable to load demographic options.</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Age Ranges</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {demographics.ageRanges.map((range: any) => (
            <div key={range.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`age-${range.id}`} 
                checked={value?.ageRanges?.includes(range.id)} 
                onCheckedChange={() => handleSelection('ageRanges', range.id)}
              />
              <Label htmlFor={`age-${range.id}`} className="text-sm">{range.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label className="mb-2 block">Gender</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {demographics.genders.map((gender: any) => (
            <div key={gender.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`gender-${gender.id}`} 
                checked={value?.genders?.includes(gender.id)} 
                onCheckedChange={() => handleSelection('genders', gender.id)}
              />
              <Label htmlFor={`gender-${gender.id}`} className="text-sm">{gender.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label className="mb-2 block">Regions</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {demographics.regions.map((region: any) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`region-${region.id}`} 
                checked={value?.regions?.includes(region.id)} 
                onCheckedChange={() => handleSelection('regions', region.id)}
              />
              <Label htmlFor={`region-${region.id}`} className="text-sm">{region.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label className="mb-2 block">Interests</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {demographics.interests.map((interest: any) => (
            <div key={interest.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`interest-${interest.id}`} 
                checked={value?.interests?.includes(interest.id)} 
                onCheckedChange={() => handleSelection('interests', interest.id)}
              />
              <Label htmlFor={`interest-${interest.id}`} className="text-sm">{interest.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Card className="mt-4 bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm">
            <p>Targeting will help optimize your content for specific audiences. You can select multiple options in each category.</p>
            <p className="mt-2 italic text-muted-foreground">Note: This will affect AI-generated content but won't restrict visibility.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
