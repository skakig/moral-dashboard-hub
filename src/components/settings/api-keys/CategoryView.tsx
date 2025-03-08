
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { APIKeyCard } from './APIKeyCard';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  if (!apiKeys || apiKeys.length === 0) {
    return null;
  }

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
                <CardTitle>{category}</CardTitle>
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
        </Collapsible>
      </CardHeader>
      <CollapsibleContent>
        <CardContent>
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
        </CardContent>
      </CollapsibleContent>
    </Card>
  );
}
