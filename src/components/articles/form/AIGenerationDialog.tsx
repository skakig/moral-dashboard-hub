
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AIGenerationForm } from './components/AIGenerationForm';
import { GeneratedContentPreview } from './components/GeneratedContentPreview';
import { useAIGeneration } from './hooks/useAIGeneration';

interface AIGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentGenerated: (content: any) => void;
}

export function AIGenerationDialog({ 
  open, 
  onOpenChange, 
  onContentGenerated 
}: AIGenerationDialogProps) {
  const { 
    loading,
    generatedContent,
    generateContent,
    resetGeneratedContent
  } = useAIGeneration();

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated({
        title: generatedContent.title,
        content: generatedContent.content,
        metaDescription: generatedContent.metaDescription
      });
      onOpenChange(false);
    }
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
          {!generatedContent ? (
            <AIGenerationForm 
              onGenerate={generateContent}
              loading={loading}
            />
          ) : (
            <GeneratedContentPreview
              title={generatedContent.title}
              content={generatedContent.content}
              metaDescription={generatedContent.metaDescription}
              onUse={handleUseContent}
              onTryAgain={resetGeneratedContent}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
