
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface GeneratedContentPreviewProps {
  title: string;
  content: string;
  metaDescription: string;
  onUse: () => void;
  onTryAgain: () => void;
}

export function GeneratedContentPreview({
  title,
  content,
  metaDescription,
  onUse,
  onTryAgain
}: GeneratedContentPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Generated Title</Label>
        <div className="p-2 border rounded-md mt-1 bg-background">
          {title}
        </div>
      </div>
      
      <div>
        <Label>Generated Content</Label>
        <div className="p-4 border rounded-md mt-1 bg-background h-48 overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
      
      <div>
        <Label>Generated Meta Description</Label>
        <div className="p-2 border rounded-md mt-1 bg-background">
          {metaDescription}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onTryAgain}>
          Try Again
        </Button>
        <Button onClick={onUse}>Use This Content</Button>
      </div>
    </div>
  );
}
