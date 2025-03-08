
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";
import { APIKeysForm } from "@/components/settings/APIKeysForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function APIKeysSection() {
  const [apiKeysLoading, setApiKeysLoading] = useState(true);

  useEffect(() => {
    fetchApiKeysStatus();
  }, []);

  const fetchApiKeysStatus = async () => {
    setApiKeysLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-api-keys-status');
      
      if (error) {
        console.error('Failed to fetch API keys status:', error);
        toast.error('Unable to load API key status');
      }
      
      setApiKeysLoading(false);
    } catch (error) {
      console.error('Failed to fetch API keys status:', error);
      toast.error('Unable to load API key status');
      setApiKeysLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
}
