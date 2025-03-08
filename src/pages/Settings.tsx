
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { APIKeysForm } from "@/components/settings/APIKeysForm";
import { Loader2, ShieldAlert } from "lucide-react";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [apiKeysConfigured, setApiKeysConfigured] = useState<{[key: string]: boolean}>({
    OpenAI: false,
    ElevenLabs: false,
    StableDiffusion: false
  });

  useEffect(() => {
    fetchApiKeysStatus();
  }, []);

  const fetchApiKeysStatus = async () => {
    setApiKeysLoading(true);
    try {
      const { data: response } = await fetch('/api/settings/api-keys').then(res => res.json());
      const configuredKeys: {[key: string]: boolean} = {};
      
      if (response?.data) {
        response.data.forEach((key: {serviceName: string, isConfigured: boolean}) => {
          configuredKeys[key.serviceName] = key.isConfigured;
        });
        setApiKeysConfigured(configuredKeys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys status:', error);
    } finally {
      setApiKeysLoading(false);
    }
  };

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
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure The Moral Hierarchy system settings
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage system-wide settings for TMH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="The Moral Hierarchy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" defaultValue="admin@tmh.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the site in maintenance mode
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="api-keys" className="space-y-4">
            {apiKeysLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <APIKeysForm 
                  title="OpenAI API"
                  description="Required for AI-generated content, assessments, and chat features"
                  serviceName="OpenAI"
                  onSuccess={fetchApiKeysStatus}
                />
                <APIKeysForm 
                  title="ElevenLabs API"
                  description="Required for AI-generated voices in TMH content"
                  serviceName="ElevenLabs"
                  onSuccess={fetchApiKeysStatus}
                />
                <APIKeysForm 
                  title="Stable Diffusion API"
                  description="Required for AI-generated images and social media visuals"
                  serviceName="StableDiffusion"
                  onSuccess={fetchApiKeysStatus}
                />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  API Key Security
                </CardTitle>
                <CardDescription>
                  Information about how your API keys are stored and used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
                  <p className="font-medium mb-2">API Key Security Information</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>API keys are stored securely in your Supabase database</li>
                    <li>Keys are never exposed to the client-side code</li>
                    <li>All API requests are made through secure Edge Functions</li>
                    <li>Keys can be rotated or revoked at any time</li>
                    <li>Access is restricted to admin users only</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure admin notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-user">New User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when new users register
                    </p>
                  </div>
                  <Switch id="new-user" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="completed-assessment">Completed Assessments</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when users complete moral assessments
                    </p>
                  </div>
                  <Switch id="completed-assessment" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-errors">AI Model Errors</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerted for AI prediction errors or anomalies
                    </p>
                  </div>
                  <Switch id="ai-errors" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about system updates and maintenance
                    </p>
                  </div>
                  <Switch id="system-updates" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
