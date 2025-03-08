
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { APIKeyFormDialog } from "@/components/settings/api/APIKeyFormDialog";
import { APICategoryCard } from "@/components/settings/api/APICategoryCard";
import { APISecurityCard } from "@/components/settings/api/APISecurityCard";
import { API_CATEGORIES } from "@/components/settings/api/constants";

interface APIKeysTabContentProps {
  apiKeysByCategory: Record<string, any[]>;
  onRefresh: () => void;
}

export function APIKeysTabContent({ apiKeysByCategory, onRefresh }: APIKeysTabContentProps) {
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const openAddKeyDialog = (category: string) => {
    setSelectedCategory(category);
    setIsAddKeyDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">AI & Social Media API Keys</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {Object.entries(API_CATEGORIES).map(([category, services]) => (
        <APICategoryCard 
          key={category}
          category={category}
          apiKeys={apiKeysByCategory[category] || []}
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
          />
        </DialogContent>
      </Dialog>
      
      <APISecurityCard />
    </>
  );
}
