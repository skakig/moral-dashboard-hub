
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { APIKeyCard } from './APIKeyCard';
import { Plus, ChevronDown, ChevronRight, AlertCircle, Server } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

// Map of categories to icons and colors
const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'Text Generation': { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>, 
    color: 'bg-blue-100 text-blue-800'
  },
  'Image Generation': { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 8h.01"></path><rect width="16" height="16" x="4" y="4" rx="3"></rect><path d="M4 15l4-4 12 12"></path><path d="M14 14l-1.97-1.97L16 8l4 4-3.5 3.5"></path></svg>, 
    color: 'bg-green-100 text-green-800'
  },
  'Video Generation': { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg>, 
    color: 'bg-purple-100 text-purple-800'
  },
  'Audio Generation': { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>, 
    color: 'bg-orange-100 text-orange-800'
  },
  'Embeddings': { 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>, 
    color: 'bg-pink-100 text-pink-800'
  }
};

// Default fallback
const DEFAULT_CATEGORY_ICON = { 
  icon: <Server className="h-5 w-5" />, 
  color: 'bg-gray-100 text-gray-800'
};

interface CategoryViewProps {
  category: string;
  apiKeys: any[];
  onAddKey: (category: string) => void;
  onSuccess: () => void;
}

export function CategoryView({ category, apiKeys, onAddKey, onSuccess }: CategoryViewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [updatingPrimary, setUpdatingPrimary] = useState<string | null>(null);
  
  const sortedKeys = useMemo(() => {
    // Sort by primary keys first, then by service name
    return [...apiKeys].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.serviceName.localeCompare(b.serviceName);
    });
  }, [apiKeys]);
  
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
  
  // Get the icon and color for this category
  const { icon, color } = CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-between items-center">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                )}
                <div className="flex items-center">
                  <Badge className={`mr-2 ${color}`}>
                    {icon}
                  </Badge>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </div>
                <div className="ml-2 text-xs text-muted-foreground">
                  ({apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'})
                </div>
              </Button>
            </CollapsibleTrigger>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onAddKey(category)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add API Key
            </Button>
          </div>
          <CardDescription className="mt-2 pl-7">
            Configure API keys for {category.toLowerCase()} services
          </CardDescription>
          
          <CollapsibleContent>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="flex items-center justify-center py-8 border border-dashed rounded-lg bg-muted/30">
                  <div className="flex flex-col items-center text-center max-w-xs">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No API Keys</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't added any {category.toLowerCase()} API keys yet
                    </p>
                    <Button 
                      onClick={() => onAddKey(category)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {category} Key
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedKeys.map((keyData: any) => (
                    <APIKeyCard
                      key={keyData.id}
                      id={keyData.id}
                      title={keyData.serviceName}
                      description={`${category} service`}
                      serviceName={keyData.serviceName}
                      category={category}
                      baseUrl={keyData.baseUrl}
                      isConfigured={keyData.isConfigured}
                      isActive={keyData.isActive}
                      isPrimary={keyData.isPrimary}
                      lastValidated={keyData.lastValidated}
                      createdAt={keyData.createdAt}
                      validationErrors={keyData.validationErrors}
                      onSuccess={onSuccess}
                      onSetPrimary={handleSetPrimary}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
