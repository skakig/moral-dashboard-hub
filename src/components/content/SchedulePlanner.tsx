
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export function SchedulePlanner() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Content Calendar</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Content
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
                <p className="text-muted-foreground mb-4">No upcoming content scheduled</p>
                <Button variant="outline">Schedule Content Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="min-h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No past scheduled content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drafts" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="min-h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No draft content found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Strategy Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">1</span>
              <span>Schedule content consistently to maintain audience engagement</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">2</span>
              <span>Use AI to generate content ideas when you're feeling stuck</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">3</span>
              <span>Analyze past performance to inform your future content strategy</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2">4</span>
              <span>Batch create content to save time and maintain consistency</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
