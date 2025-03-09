
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ArticleAudioPlayer } from './ArticleAudioPlayer';

interface ArticleContentProps {
  content: string;
  excerpt?: string;
  voiceUrl?: string;
  keywords?: string[];
}

export function ArticleContent({ content, excerpt, voiceUrl, keywords }: ArticleContentProps) {
  return (
    <div className="space-y-6">
      {excerpt && (
        <div>
          <p className="text-lg font-medium italic">{excerpt}</p>
          <Separator className="my-4" />
        </div>
      )}
      
      {voiceUrl && <ArticleAudioPlayer voiceUrl={voiceUrl} />}
      
      <div className="prose dark:prose-invert max-w-none">
        {content?.split('\n').map((paragraph, index) => (
          paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
        ))}
      </div>
      
      {keywords && keywords.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-semibold mb-2">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(keywords) ? keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-secondary/20 rounded text-sm"
              >
                {keyword}
              </span>
            )) : null}
          </div>
        </div>
      )}
    </div>
  );
}
