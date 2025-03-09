
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function AIGenerationDialog({ open, onOpenChange, onContentGenerated }) {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');
  const [keywords, setKeywords] = useState('');
  const [contentType, setContentType] = useState('article');
  const [moralLevel, setMoralLevel] = useState(5);
  const [platform, setPlatform] = useState('');
  const [contentLength, setContentLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedMetaDescription, setGeneratedMetaDescription] = useState('');

  const handleGenerate = async () => {
    if (!theme && !keywords) {
      toast.error('Please enter a theme or keywords');
      return;
    }

    setLoading(true);
    try {
      toast.info(`Generating ${contentType} with AI...`);

      // Call the generate-article edge function
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          theme,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          contentType,
          moralLevel,
          platform,
          contentLength
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Set the generated content in the state
      setGeneratedContent(data.content);
      setGeneratedTitle(data.title);
      setGeneratedMetaDescription(data.metaDescription);

      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    onContentGenerated({
      title: generatedTitle,
      content: generatedContent,
      metaDescription: generatedMetaDescription,
      keywords
    });
    onOpenChange(false);
  };

  // Get content type options based on platform
  const getContentTypeOptions = () => {
    const defaultOptions = [
      { value: 'article', label: 'Article' },
      { value: 'blog_post', label: 'Blog Post' }
    ];
    
    const platformSpecificOptions = {
      "Instagram": [
        { value: "social_media", label: "Social Media Post" },
        { value: "carousel", label: "Carousel" },
        { value: "reels_script", label: "Reels Script" }
      ],
      "YouTube": [
        { value: "youtube_script", label: "YouTube Script" },
        { value: "youtube_shorts", label: "YouTube Shorts" },
        { value: "youtube_description", label: "YouTube Description" }
      ],
      "Twitter": [
        { value: "tweet_thread", label: "Tweet Thread" },
        { value: "social_media", label: "Social Media Post" }
      ],
      "Facebook": [
        { value: "social_media", label: "Social Media Post" },
        { value: "group_post", label: "Group Post" }
      ],
      "TikTok": [
        { value: "tiktok_script", label: "TikTok Script" },
        { value: "social_media", label: "Social Media Post" }
      ],
      "LinkedIn": [
        { value: "social_media", label: "Social Media Post" },
        { value: "article", label: "Article" }
      ]
    };
    
    return platform && platformSpecificOptions[platform] 
      ? [...platformSpecificOptions[platform], ...defaultOptions]
      : defaultOptions;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Content with AI</DialogTitle>
          <DialogDescription>
            Select a theme, type, and length to generate content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Content Theme</Label>
              <Input
                id="theme"
                placeholder="E.g., Ethical Relationships"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input
                id="keywords"
                placeholder="E.g., morality, ethics, relationships"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {getContentTypeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentLength">Content Length</Label>
              <Select value={contentLength} onValueChange={setContentLength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (300-500 words)</SelectItem>
                  <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                  <SelectItem value="long">Long (2000-3000 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moralLevel">Moral Level (1-9)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoralLevel((prev) => Math.max(1, prev - 1))}
                >
                  -
                </Button>
                <div className="flex-1 text-center font-medium">{moralLevel}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoralLevel((prev) => Math.min(9, prev + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {!generatedContent ? (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading || (!theme && !keywords)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Generated Title</Label>
                <div className="p-2 border rounded-md mt-1 bg-background">
                  {generatedTitle}
                </div>
              </div>
              
              <div>
                <Label>Generated Content</Label>
                <div className="p-4 border rounded-md mt-1 bg-background h-48 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br/>') }} />
                </div>
              </div>
              
              <div>
                <Label>Generated Meta Description</Label>
                <div className="p-2 border rounded-md mt-1 bg-background">
                  {generatedMetaDescription}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setGeneratedContent('')}>
                  Try Again
                </Button>
                <Button onClick={handleUseContent}>Use This Content</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
