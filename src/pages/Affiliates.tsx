
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";
import { AffiliateManagement } from "@/components/affiliate/AffiliateManagement";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, isAdmin, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Affiliate Program</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Affiliate Dashboard</TabsTrigger>
          {isAdmin && <TabsTrigger value="management">Affiliate Management</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          {user?.id && <AffiliateDashboard userId={user.id} />}
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="management" className="mt-0">
            <AffiliateManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
