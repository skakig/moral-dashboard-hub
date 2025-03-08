
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Star, Edit, Trash, CheckCircle, AlertCircle } from 'lucide-react';

interface APIKeyCardHeaderProps {
  title: string;
  description: string;
  isPrimary: boolean;
  isActive: boolean;
  onEdit: () => void;
  onSetPrimary: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export function APIKeyCardHeader({
  title,
  description,
  isPrimary,
  isActive,
  onEdit,
  onSetPrimary,
  onToggleStatus,
  onDelete
}: APIKeyCardHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            
            {!isPrimary && (
              <DropdownMenuItem onClick={onSetPrimary}>
                <Star className="mr-2 h-4 w-4" />
                Set as Primary
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onToggleStatus}>
              {isActive ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );
}
