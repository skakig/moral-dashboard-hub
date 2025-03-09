
import { Article } from "@/types/articles";
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
import { 
  CalendarClock, 
  Eye, 
  FileEdit, 
  MoreHorizontal, 
  Trash, 
  Calendar, 
  Share2,
  ExternalLink,
  Download 
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ArticlesTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
  onPublish?: (article: Article) => void;
  onView?: (article: Article) => void;
  onDownload?: (article: Article) => void;
}

export function ArticlesTable({ 
  articles, 
  onEdit, 
  onDelete, 
  onPublish, 
  onView, 
  onDownload 
}: ArticlesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      onDelete(articleToDelete.id);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleViewClick = (article: Article) => {
    if (onView) {
      onView(article);
    } else {
      toast.info(`View functionality not implemented for: ${article.title}`);
    }
  };

  const handlePublishClick = (article: Article) => {
    if (onPublish) {
      onPublish(article);
    } else {
      toast.info(`Article would be published: ${article.title}`);
    }
  };

  const handleDownloadClick = (article: Article) => {
    if (onDownload) {
      onDownload(article);
    } else {
      toast.info(`Download functionality not implemented for: ${article.title}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <CalendarClock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Eye className="mr-1 h-3 w-3" />
            Published
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Publish Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No articles found
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Views: {article.view_count || 0}
                  </div>
                </TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{getStatusBadge(article.status)}</TableCell>
                <TableCell>
                  {article.created_at
                    ? format(new Date(article.created_at), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {article.publish_date
                    ? format(new Date(article.publish_date), "MMM d, yyyy")
                    : "—"}
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
                      <DropdownMenuItem onClick={() => onEdit(article)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewClick(article)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {article.status !== "published" && (
                        <DropdownMenuItem onClick={() => handlePublishClick(article)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownloadClick(article)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Content
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Social Media
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(article)}
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
            Are you sure you want to delete the article "{articleToDelete?.title}"? This action cannot be undone.
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
