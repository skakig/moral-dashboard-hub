import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getDemographicsForTargeting } from "@/services/analyticsService";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DemographicTargetingFieldProps {
  form: UseFormReturn<any>;
}

export function DemographicTargetingField({ form }: DemographicTargetingFieldProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetGroups, setTargetGroups] = useState<any[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  
  const demographicTargeting = form.watch("demographicTargeting") || false;
  
  useEffect(() => {
    if (demographicTargeting) {
      loadDemographicTargets();
    }
  }, [demographicTargeting]);
  
  const loadDemographicTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDemographicsForTargeting();
      
      if (!data) {
        throw new Error("Failed to load demographic data");
      }
      
      setTargetGroups(data.targetGroups || []);
      
      // Set initial value if form field is empty
      const currentTargets = form.watch("targetDemographics");
      if (!currentTargets || !currentTargets.length) {
        form.setValue("targetDemographics", []);
      } else {
        setSelectedTargets(currentTargets);
      }
    } catch (err: any) {
      console.error("Error loading demographic targets:", err);
      setError(err.message || "Failed to load demographic data");
      toast.error("Failed to load demographic data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleDemographicTargeting = (checked: boolean) => {
    form.setValue("demographicTargeting", checked);
    
    if (checked && targetGroups.length === 0) {
      loadDemographicTargets();
    }
  };
  
  const handleTargetSelect = (target: string) => {
    const newTargets = selectedTargets.includes(target)
      ? selectedTargets.filter(t => t !== target)
      : [...selectedTargets, target];
    
    setSelectedTargets(newTargets);
    form.setValue("targetDemographics", newTargets);
  };
  
  const getTargetGroupByValue = (value: string) => {
    return targetGroups.find(group => group.value === value);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="demographicTargeting"
          checked={demographicTargeting}
          onCheckedChange={handleToggleDemographicTargeting}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="demographicTargeting"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Enable Demographic Targeting
          </Label>
          <p className="text-sm text-muted-foreground">
            Target content toward specific demographic groups for more effective engagement
          </p>
        </div>
      </div>
      
      {demographicTargeting && (
        <div className="border rounded-md p-4 mt-2">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Target Demographics
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Loading demographic data...</span>
            </div>
          ) : error ? (
            <div className="py-2 text-sm text-red-500">{error}</div>
          ) : targetGroups.length === 0 ? (
            <div className="py-2 text-sm text-muted-foreground">No demographic data available</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedTargets.map(target => {
                  const group = getTargetGroupByValue(target);
                  return (
                    <Badge 
                      key={target} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTargetSelect(target)}
                    >
                      {group?.label || target} (×)
                    </Badge>
                  );
                })}
                {selectedTargets.length === 0 && (
                  <div className="text-sm text-muted-foreground">No demographics selected</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demographicSelect">Add Target Group</Label>
                <Select 
                  onValueChange={handleTargetSelect}
                  value=""
                >
                  <SelectTrigger id="demographicSelect">
                    <SelectValue placeholder="Select demographic group" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetGroups.length > 0 ? (
                      <>
                        <SelectItem value="" disabled>Select demographic group</SelectItem>
                        {targetGroups
                          .filter(group => !selectedTargets.includes(group.value))
                          .map(group => (
                            <SelectItem 
                              key={`${group.type}-${group.value}`} 
                              value={group.value}
                            >
                              {group.label} ({group.count} users)
                            </SelectItem>
                          ))
                        }
                      </>
                    ) : (
                      <SelectItem value="" disabled>No demographics available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Content will be optimized for these demographic groups</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
