
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AIContent() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">AI Content Management</h1>
        <p className="text-muted-foreground mb-8">
          Generate, manage, and publish AI-powered content for different platforms
        </p>
        
        <div className="p-8 text-center border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">AI Content Generation</h2>
          <p className="text-muted-foreground">
            This page is under development. AI content generation features will be available soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
