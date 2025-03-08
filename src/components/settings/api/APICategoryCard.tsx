
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { APIKeysForm } from "@/components/settings/api/APIKeysForm";

interface APICategoryCardProps {
  category: string;
  apiKeys: any[];
  onAddKey: (category: string) => void;
  onSuccess: () => void;
}

export function APICategoryCard({ category, apiKeys, onAddKey, onSuccess }: APICategoryCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{category}</CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onAddKey(category)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add API Key
          </Button>
        </div>
        <CardDescription>
          Configure API keys for {category.toLowerCase()} services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apiKeys?.map((keyData: any) => (
            <APIKeysForm
              key={keyData.id}
              title={keyData.serviceName}
              description={`${category} service`}
              serviceName={keyData.serviceName}
              category={category}
              baseUrl={keyData.baseUrl}
              isConfigured={keyData.isConfigured}
              isActive={keyData.isActive}
              lastValidated={keyData.lastValidated}
              onSuccess={onSuccess}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
