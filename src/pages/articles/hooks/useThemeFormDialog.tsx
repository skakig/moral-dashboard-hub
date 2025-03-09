
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ThemeForm } from "@/components/themes/ThemeForm";
import { ContentTheme } from "@/types/articles";

interface UseThemeFormDialogProps {
  onSubmit: (data: any) => Promise<void>;
}

export function useThemeFormDialog({
  onSubmit
}: UseThemeFormDialogProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ContentTheme | null>(null);

  const handleCreateTheme = () => {
    setCurrentTheme(null);
    setFormDialogOpen(true);
  };

  const handleEditTheme = (theme: ContentTheme) => {
    setCurrentTheme(theme);
    setFormDialogOpen(true);
  };

  const renderThemeFormDialog = (isSubmitting: boolean) => (
    <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
      <DialogContent>
        <ThemeForm
          initialData={currentTheme || undefined}
          onSubmit={onSubmit}
          onCancel={() => setFormDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );

  return {
    formDialogOpen,
    setFormDialogOpen,
    currentTheme,
    setCurrentTheme,
    handleCreateTheme,
    handleEditTheme,
    renderThemeFormDialog
  };
}
