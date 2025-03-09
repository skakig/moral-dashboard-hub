
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Assessments() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Assessments</h1>
        <p className="text-muted-foreground mb-8">
          Manage assessment content, questions, and user responses
        </p>
        
        <div className="p-8 text-center border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">Assessment Management</h2>
          <p className="text-muted-foreground">
            This page is under development. Assessment management features will be available soon.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
