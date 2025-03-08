
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function APISecurityCard() {
  return (
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
            <li>For testing, you can use "TEST_" prefixed keys</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
