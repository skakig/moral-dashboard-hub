
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleViewer } from "@/components/articles/ArticleViewer";

export default function ArticleViewPage() {
  return (
    <AppLayout>
      <ArticleViewer />
    </AppLayout>
  );
}
