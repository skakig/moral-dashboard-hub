
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Wand2, RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useContentThemes } from "@/hooks/useContentThemes";
import { Article } from "@/types/articles";
import { toast } from "sonner";

interface ArticleFormProps {
  initialData?: Partial<Article>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  generateArticle?: (params: any) => Promise<any>;
}

export function ArticleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  generateArticle
}: ArticleFormProps) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number>(5);
  const [contentType, setContentType] = useState("article");
  const { themes, isLoading: themesLoading } = useContentThemes();

  const defaultValues = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    status: initialData?.status || "draft",
    seo_keywords: initialData?.seo_keywords?.join(", ") || "",
    meta_description: initialData?.meta_description || "",
    featured_image: initialData?.featured_image || "",
    publish_date: initialData?.publish_date ? new Date(initialData.publish_date) : undefined,
  };

  const form = useForm({ defaultValues });

  const handleGenerateAI = async () => {
    if (!generateArticle) {
      toast.error("AI generation not available");
      return;
    }

    if (!selectedTheme) {
      toast.error("Please select a content theme");
      return;
    }

    try {
      setAiGenerating(true);
      const theme = themes?.find(t => t.id === selectedTheme);
      
      if (!theme) {
        toast.error("Selected theme not found");
        return;
      }

      const result = await generateArticle({
        theme: theme.name,
        keywords: theme.keywords || [],
        contentType,
        moralLevel: selectedLevel
      });

      if (result) {
        form.setValue("title", result.title);
        form.setValue("content", result.content);
        form.setValue("meta_description", result.metaDescription);
        form.setValue("seo_keywords", result.keywords.join(", "));
        form.setValue("category", theme.name);
        setAiDialogOpen(false);
        toast.success("Content generated successfully");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">{initialData?.id ? "Edit Article" : "Create Article"}</h2>
            
            {generateArticle && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAiDialogOpen(true)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Article title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!themesLoading && themes?.map((theme) => (
                        <SelectItem key={theme.id} value={theme.name}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Article content" 
                    className="min-h-[300px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="SEO meta description" 
                      className="resize-none h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Keywords (comma separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="moral hierarchy, ethics, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="featured_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.watch("status") === "scheduled" && (
            <FormField
              control={form.control}
              name="publish_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Publish Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? "Update" : "Create"} Article
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Content with AI</DialogTitle>
            <DialogDescription>
              Select a theme and level to generate content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="theme">Content Theme</label>
              <Select 
                onValueChange={setSelectedTheme} 
                value={selectedTheme}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {!themesLoading && themes?.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="content-type">Content Type</label>
              <Select 
                onValueChange={setContentType} 
                value={contentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="blog post">Blog Post</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="moral-level">Moral Level (1-9)</label>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLevel(Math.max(1, selectedLevel - 1))}
                  disabled={selectedLevel <= 1}
                >
                  -
                </Button>
                <span className="font-medium text-center w-8">{selectedLevel}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedLevel(Math.min(9, selectedLevel + 1))}
                  disabled={selectedLevel >= 9}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateAI} 
              disabled={aiGenerating || !selectedTheme}
            >
              {aiGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {aiGenerating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
