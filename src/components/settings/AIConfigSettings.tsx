
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AIConfigSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Mock API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved", {
        description: "Your changes have been successfully saved",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Configuration</CardTitle>
        <CardDescription>
          Configure settings for the AI moral assessment model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-version">AI Model Version</Label>
          <Select defaultValue="gpt4">
            <SelectTrigger>
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">GPT-4o</SelectItem>
              <SelectItem value="gpt4-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="custom">Custom Model</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prompt-template">Default Prompt Template</Label>
          <Textarea
            id="prompt-template"
            rows={4}
            defaultValue="Analyze the following response to a moral dilemma and determine the moral level (1-9) of the respondent: {{response}}"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
          <Input id="confidence-threshold" type="number" defaultValue="75" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="log-predictions">Log All Predictions</Label>
            <p className="text-sm text-muted-foreground">
              Store detailed logs of AI predictions for analysis
            </p>
          </div>
          <Switch id="log-predictions" defaultChecked />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
