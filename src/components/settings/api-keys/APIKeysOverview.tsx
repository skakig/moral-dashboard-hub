
import { useState, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, RefreshCw, Info } from 'lucide-react';
import { APIKeyFormDialog } from './APIKeyFormDialog';
import { CategoryView } from './CategoryView';
import { APIKeyFilters } from './APIKeyFilters';
import { API_CATEGORIES } from './constants';

interface APIKeysOverviewProps {
  apiKeysByCategory: Record<string, any[]>;
  onRefresh: () => void;
}

export function APIKeysOverview({ apiKeysByCategory, onRefresh }: APIKeysOverviewProps) {
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'lastValidated',
    sortOrder: 'desc' as 'asc' | 'desc',
    status: 'all'
  });

  const openAddKeyDialog = (category: string) => {
    setSelectedCategory(category);
    setIsAddKeyDialogOpen(true);
  };

  const allCategories = useMemo(() => {
    return Object.keys(API_CATEGORIES);
  }, []);

  const filteredApiKeys = useMemo(() => {
    // Apply filters to apiKeysByCategory
    const result: Record<string, any[]> = {};
    
    Object.entries(apiKeysByCategory).forEach(([category, keys]) => {
      // Filter by category if selected
      if (filters.category !== 'all' && category !== filters.category) {
        return;
      }
      
      // Filter keys by search, status, etc.
      const filteredKeys = keys.filter(key => {
        // Search filter
        const searchMatch = !filters.search || 
          key.serviceName.toLowerCase().includes(filters.search.toLowerCase());
        
        // Status filter
        const statusMatch = filters.status === 'all' || 
          (filters.status === 'active' && key.isActive) || 
          (filters.status === 'inactive' && !key.isActive);
        
        return searchMatch && statusMatch;
      });
      
      // Sort keys
      const sortedKeys = [...filteredKeys].sort((a, b) => {
        const propA = a[filters.sortBy];
        const propB = b[filters.sortBy];
        
        // Handle null values
        if (propA === null && propB === null) return 0;
        if (propA === null) return 1;
        if (propB === null) return -1;
        
        // Compare dates or strings
        const comparison = 
          typeof propA === 'string' ? 
            propA.localeCompare(propB) : 
            new Date(propA).getTime() - new Date(propB).getTime();
        
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      if (sortedKeys.length > 0) {
        result[category] = sortedKeys;
      }
    });
    
    return result;
  }, [apiKeysByCategory, filters]);

  const hasAnyApiKeys = Object.values(apiKeysByCategory).some(keys => keys && keys.length > 0);
  const hasFilteredKeys = Object.values(filteredApiKeys).some(keys => keys && keys.length > 0);
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">API Key Management</h3>
        <div className="flex space-x-2">
          <Button onClick={() => openAddKeyDialog("Text Generation")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {hasAnyApiKeys ? (
        <APIKeyFilters 
          categories={allCategories}
          onFilterChange={handleFilterChange}
        />
      ) : (
        <Alert className="mb-4 bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p>No API keys configured yet. Add your first API key to get started.</p>
            <p className="text-sm mt-1">
              <strong>Tip:</strong> For testing, you can use a key with the format "TEST_your-key" 
              which will validate without making actual API calls.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {hasAnyApiKeys && !hasFilteredKeys && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No API keys match your current filters.
          </AlertDescription>
        </Alert>
      )}

      {Object.entries(filteredApiKeys).map(([category, keys]) => (
        <CategoryView 
          key={category}
          category={category}
          apiKeys={keys}
          onAddKey={openAddKeyDialog}
          onSuccess={onRefresh}
        />
      ))}
      
      <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New {selectedCategory} API Key</DialogTitle>
          </DialogHeader>
          <APIKeyFormDialog 
            category={selectedCategory}
            onSuccess={() => {
              onRefresh();
              setIsAddKeyDialogOpen(false);
            }}
            onCancel={() => setIsAddKeyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
