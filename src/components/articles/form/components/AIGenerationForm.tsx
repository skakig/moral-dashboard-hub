
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2 } from 'lucide-react';
import { useContentThemes } from '@/hooks/useContentThemes';
import { useContentTypeOptions } from '../hooks/useContentTypeOptions';

interface AIGenerationFormProps {
  onGenerate: (params: any) => void;
  loading: boolean;
}

export function AIGenerationForm({ onGenerate, loading }: AIGenerationFormProps) {
  const [theme, setTheme] = useState('');
  const [keywords, setKeywords] = useState('');
  const [contentType, setContentType] = useState('article');
  const [moralLevel, setMoralLevel] = useState(5);
  const [platform, setPlatform] = useState('');
  const [contentLength, setContentLength] = useState('medium');
  const { themes, isLoading: themesLoading } = useContentThemes();
  const { getContentTypeOptions } = useContentTypeOptions(platform);

  const handleGenerate = () => {
    onGenerate({
      theme,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      contentType,
      moralLevel,
      platform,
      contentLength
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Content Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {themesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading themes...
                </SelectItem>
              ) : (
                themes?.map((theme) => (
                  <SelectItem key={theme.id} value={theme.name}>
                    {theme.name}
                  </SelectItem>
                ))
              )}
              <SelectItem value="custom">Custom Theme</SelectItem>
            </SelectContent>
          </Select>
          {theme === 'custom' && (
            <Input
              placeholder="Enter custom theme..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="mt-2"
            />
          )}
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
          <Label htmlFor="moralLevel">Moral Level</Label>
          <Select value={moralLevel.toString()} onValueChange={(value) => setMoralLevel(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select moral level" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
            Generate with AI
          </>
        )}
      </Button>
    </div>
  );
}
