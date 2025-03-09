
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { MemeGenerator } from "@/components/content/MemeGenerator";
import { VideoGenerator } from "@/components/content/VideoGenerator";
import { SchedulePlanner } from "@/components/content/SchedulePlanner";

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
            {activeTab === "memes" ? (
              <MemeGenerator />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>AI Meme Generator</CardTitle>
                  <CardDescription>
                    Create viral memes with AI-powered image and text generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Select this tab to load the meme generator</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="videos">
            {activeTab === "videos" ? (
              <VideoGenerator />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>AI Video Generator</CardTitle>
                  <CardDescription>
                    Create engaging video content with AI-powered tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Select this tab to load the video generator</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="scheduler">
            {activeTab === "scheduler" ? (
              <SchedulePlanner />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Content Scheduler</CardTitle>
                  <CardDescription>
                    Plan and schedule your content across multiple platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Select this tab to load the content scheduler</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
