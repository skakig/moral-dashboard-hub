
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Users() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Users Management</h1>
        <p className="text-muted-foreground mb-8">
          Manage users, view profiles, and monitor user activity
        </p>
        
        <div className="p-8 text-center border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-muted-foreground">
            This page is under development. User management features will be available soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
