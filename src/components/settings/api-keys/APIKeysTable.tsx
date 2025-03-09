
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Star, MoreVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAPIStatusToggle } from './hooks/useAPIStatusToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DeleteAPIKeyDialog } from './components/DeleteAPIKeyDialog';

interface APIKeysTableProps {
  apiKeys: any[];
  category: string;
  onEdit: (keyData: any) => void;
  onSuccess: () => void;
}

export function APIKeysTable({ apiKeys, category, onEdit, onSuccess }: APIKeysTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [updatingPrimary, setUpdatingPrimary] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleSetPrimary = async (id: string) => {
    setUpdatingPrimary(id);
    try {
      const { error } = await supabase.functions.invoke('update-api-key-primary', {
        body: {
          id,
          category,
        },
      });
      
      if (error) {
        console.error('Error setting primary API key:', error);
        toast.error('Failed to set primary API key');
        return;
      }
      
      toast.success('Primary API key updated successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Exception setting primary API key:', err);
      toast.error('Failed to set primary API key');
    } finally {
      setUpdatingPrimary(null);
    }
  };
  
  const handleEditKey = (keyData: any) => {
    onEdit(keyData);
  };
  
  const handleDeleteKey = (keyData: any) => {
    setSelectedKey(keyData);
    setIsDeleteDialogOpen(true);
  };
  
  if (apiKeys.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No API keys configured</div>;
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Validated</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => {
              // Set up toggle functionality for each key
              const { isToggling, toggleActiveStatus } = useAPIStatusToggle({
                id: key.id,
                serviceName: key.serviceName,
                category: category,
                isConfigured: key.isConfigured,
                isActive: key.isActive, 
                onSuccess
              });
              
              return (
                <TableRow key={key.id} className={key.isPrimary ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {key.serviceName}
                      {key.isPrimary && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-1 bg-primary/10">
                              <Star className="h-3 w-3 text-primary fill-primary mr-1" />
                              Primary
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Primary API key for {category}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={key.isActive} 
                        onCheckedChange={toggleActiveStatus}
                        disabled={isToggling}
                      />
                      <span className="text-sm">
                        {key.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.lastValidated ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm cursor-help">
                            {formatDate(key.lastValidated)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{new Date(key.lastValidated).toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {key.createdAt ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm cursor-help">
                            {formatDate(key.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{new Date(key.createdAt).toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditKey(key)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditKey(key)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          
                          {!key.isPrimary && (
                            <DropdownMenuItem 
                              onClick={() => handleSetPrimary(key.id)}
                              disabled={updatingPrimary === key.id}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={toggleActiveStatus}>
                            {key.isActive ? (
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
                            onClick={() => handleDeleteKey(key)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {selectedKey && (
        <DeleteAPIKeyDialog
          id={selectedKey.id}
          title={selectedKey.serviceName}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
