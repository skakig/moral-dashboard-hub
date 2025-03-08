
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Check, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SchedulePlanner() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  
  // Mocked scheduled content
  const scheduledContent = [
    { id: 1, time: "09:00 AM", type: "Meme", platform: "Instagram", title: "Level 3 vs Level 7 Response" },
    { id: 2, time: "12:30 PM", type: "Video", platform: "TikTok", title: "Why Moral Growth Matters" },
    { id: 3, time: "3:00 PM", type: "Meme", platform: "Twitter", title: "When Level 2 Thinking Backfires" },
    { id: 4, time: "5:45 PM", type: "Video", platform: "Instagram", title: "3 Signs You're Growing Morally" },
  ];
  
  const bestTimesPerPlatform = [
    { platform: "Instagram", times: ["9:00 AM", "12:00 PM", "5:00 PM"] },
    { platform: "TikTok", times: ["10:30 AM", "1:30 PM", "8:00 PM"] },
    { platform: "Twitter", times: ["8:00 AM", "12:00 PM", "6:00 PM"] },
    { platform: "YouTube", times: ["2:00 PM", "6:00 PM", "9:00 PM"] },
  ];
  
  const optimizeSchedule = () => {
    setLoading(true);
    toast.info("Analyzing optimal posting times...");
    
    // Simulate API delay
    setTimeout(() => {
      toast.success("Schedule optimized based on platform engagement patterns!");
      setLoading(false);
    }, 2000);
  };
  
  const platformColor = (platform: string) => {
    switch (platform) {
      case "Instagram": return "bg-pink-100 text-pink-800";
      case "TikTok": return "bg-cyan-100 text-cyan-800";
      case "Twitter": return "bg-blue-100 text-blue-800";
      case "YouTube": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const typeIcon = (type: string) => {
    switch (type) {
      case "Meme": return "🖼️";
      case "Video": return "🎬";
      default: return "📄";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="mr-2 h-5 w-5" />
              <h3 className="text-lg font-medium">Select Date</h3>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Button 
              onClick={optimizeSchedule} 
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Optimize Schedule
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Scheduled Content</h3>
              <p className="text-sm text-muted-foreground">
                {date?.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="space-y-3">
              {scheduledContent.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center p-3 border rounded-md hover:bg-slate-50 transition-colors"
                >
                  <div className="mr-3 text-lg">{typeIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {item.time}
                    </div>
                  </div>
                  <Badge className={platformColor(item.platform)}>
                    {item.platform}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              Add More Content
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">AI-Recommended Posting Times</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {bestTimesPerPlatform.map((platform) => (
              <div key={platform.platform} className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">{platform.platform}</h4>
                <div className="space-y-1">
                  {platform.times.map((time, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="mr-1 h-3 w-3 text-green-500" />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            These times are generated based on AI analysis of engagement patterns for your target audience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
