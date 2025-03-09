
import { Button } from "@/components/ui/button";
import { ThemesTable } from "@/components/themes/ThemesTable";
import { Loader2 } from "lucide-react";
import { ContentTheme } from "@/types/articles";

interface ThemesTabProps {
  themes: ContentTheme[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (theme: ContentTheme) => void;
  onDelete: (themeId: string) => void;
}

export function ThemesTab({
  themes,
  isLoading,
  onCreateNew,
  onEdit,
  onDelete
}: ThemesTabProps) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onCreateNew}>
          Add New Theme
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ThemesTable
          themes={themes}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
