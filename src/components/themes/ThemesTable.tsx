
import { ContentTheme } from "@/types/articles";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileEdit, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ThemesTableProps {
  themes: ContentTheme[];
  onEdit: (theme: ContentTheme) => void;
  onDelete: (themeId: string) => void;
}

export function ThemesTable({ themes, onEdit, onDelete }: ThemesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<ContentTheme | null>(null);

  const handleDeleteClick = (theme: ContentTheme) => {
    setThemeToDelete(theme);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (themeToDelete) {
      onDelete(themeToDelete.id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Target Audience</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {themes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No themes found
              </TableCell>
            </TableRow>
          ) : (
            themes.map((theme) => (
              <TableRow key={theme.id}>
                <TableCell>
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                    {theme.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {theme.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {theme.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{theme.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{theme.target_audience || "—"}</TableCell>
                <TableCell>{theme.recommended_frequency}/month</TableCell>
                <TableCell>
                  {theme.is_active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(theme)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(theme)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete the theme "{themeToDelete?.name}"? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
