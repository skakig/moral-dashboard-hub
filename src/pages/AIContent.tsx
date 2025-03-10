
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Video, Image, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemeGenerator } from "@/components/content/MemeGenerator";
import { VideoGenerator } from "@/components/content/VideoGenerator";
import { SchedulePlanner } from "@/components/content/SchedulePlanner";

export default function AIContent() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Content Creation</h1>
            <p className="text-muted-foreground">
              Generate and manage AI-driven content for social media platforms
            </p>
          </div>
        </div>

        <Tabs defaultValue="memes" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="memes" className="flex items-center">
              <Image className="mr-2 h-4 w-4" />
              Meme Generator
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              Video Creator
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Scheduler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memes">
            <Card>
              <CardHeader>
                <CardTitle>AI Meme Generator</CardTitle>
                <CardDescription>
                  Create engaging memes for social media using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemeGenerator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>AI Video Creator</CardTitle>
                <CardDescription>
                  Generate short-form videos with AI voice narration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoGenerator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Content Schedule Planner</CardTitle>
                <CardDescription>
                  Plan and schedule your AI-generated content across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchedulePlanner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
