
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { MemeGenerator } from "@/components/content/MemeGenerator";
import { VideoGenerator } from "@/components/content/VideoGenerator";
import { SchedulePlanner } from "@/components/content/SchedulePlanner";
import { Suspense } from "react";

// Lazy loading components for better performance
const LazyComponent = ({ component: Component, isActive }: { component: React.ComponentType<any>, isActive: boolean }) => {
  if (!isActive) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Select this tab to load the content</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    }>
      <Component />
    </Suspense>
  );
};

export default function AIContent() {
  const [activeTab, setActiveTab] = useState("memes");
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Content Management</h1>
          <p className="text-muted-foreground">
            Generate, manage, and publish AI-powered content for different platforms
          </p>
        </div>
        
        <Tabs defaultValue="memes" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="memes">Meme Generator</TabsTrigger>
            <TabsTrigger value="videos">Video Content</TabsTrigger>
            <TabsTrigger value="scheduler">Content Scheduler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="memes">
            <LazyComponent component={MemeGenerator} isActive={activeTab === "memes"} />
          </TabsContent>
          
          <TabsContent value="videos">
            <LazyComponent component={VideoGenerator} isActive={activeTab === "videos"} />
          </TabsContent>
          
          <TabsContent value="scheduler">
            <LazyComponent component={SchedulePlanner} isActive={activeTab === "scheduler"} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
