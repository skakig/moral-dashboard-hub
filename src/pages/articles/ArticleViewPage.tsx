
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleViewer } from "@/components/articles/ArticleViewer";

export default function ArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <AppLayout>
      <ArticleViewer />
    </AppLayout>
  );
}
