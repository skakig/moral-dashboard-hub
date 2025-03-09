
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AIGenerationDialog } from "../AIGenerationDialog";
import { Wand2 } from "lucide-react";

interface ContentFieldProps {
  form: UseFormReturn<any>;
}

export function ContentField({ form }: ContentFieldProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleContentGenerated = (content: any) => {
    form.setValue("content", content.content);
    if (content.title && !form.getValues("title")) {
      form.setValue("title", content.title);
    }
    if (content.metaDescription) {
      form.setValue("metaDescription", content.metaDescription);
    }
  };

  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>Content</FormLabel>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <AIGenerationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onContentGenerated={handleContentGenerated}
              />
            </Dialog>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter content here..."
              className="min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
