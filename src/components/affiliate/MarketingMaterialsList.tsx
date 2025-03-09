
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useMarketingMaterials } from '@/hooks/useAffiliateSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const MarketingMaterialsList = () => {
  const { data: materials = [], isLoading } = useMarketingMaterials();
  
  const banners = materials.filter(mat => mat.material_type === 'banner');
  const socialPosts = materials.filter(mat => mat.material_type === 'social_post');
  const emailTemplates = materials.filter(mat => mat.material_type === 'email_template');
  const socialCopy = materials.filter(mat => mat.material_type === 'social_copy');
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }
  
  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No marketing materials available yet.</p>
        <p className="mt-2">Check back soon for banners, email templates, and social media content.</p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="banners">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="banners">Banners</TabsTrigger>
        <TabsTrigger value="social">Social Media</TabsTrigger>
        <TabsTrigger value="email">Email Templates</TabsTrigger>
        <TabsTrigger value="copy">Copy & Text</TabsTrigger>
      </TabsList>
      
      <TabsContent value="banners">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((material) => (
            <MarketingMaterialCard 
              key={material.id}
              title={material.title}
              description={material.description || ''}
              assetUrl={material.asset_url}
            />
          ))}
          
          {banners.length === 0 && (
            <div className="col-span-2 text-center py-6 text-muted-foreground">
              <p>No banner materials available yet.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="social">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialPosts.map((material) => (
            <MarketingMaterialCard 
              key={material.id}
              title={material.title}
              description={material.description || ''}
              assetUrl={material.asset_url}
            />
          ))}
          
          {socialPosts.length === 0 && (
            <div className="col-span-2 text-center py-6 text-muted-foreground">
              <p>No social media materials available yet.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="email">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailTemplates.map((material) => (
            <MarketingMaterialCard 
              key={material.id}
              title={material.title}
              description={material.description || ''}
              assetUrl={material.asset_url}
            />
          ))}
          
          {emailTemplates.length === 0 && (
            <div className="col-span-2 text-center py-6 text-muted-foreground">
              <p>No email templates available yet.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="copy">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialCopy.map((material) => (
            <MarketingMaterialCard 
              key={material.id}
              title={material.title}
              description={material.description || ''}
              assetUrl={material.asset_url}
            />
          ))}
          
          {socialCopy.length === 0 && (
            <div className="col-span-2 text-center py-6 text-muted-foreground">
              <p>No copy templates available yet.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

interface MarketingMaterialCardProps {
  title: string;
  description: string;
  assetUrl: string | null;
}

const MarketingMaterialCard = ({ title, description, assetUrl }: MarketingMaterialCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {assetUrl && (
          <div className="mt-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
            {assetUrl.endsWith('.png') || assetUrl.endsWith('.jpg') || assetUrl.endsWith('.jpeg') ? (
              <img 
                src={assetUrl} 
                alt={title} 
                className="w-full object-cover"
                style={{ maxHeight: '200px' }}
              />
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Download to view this asset</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
