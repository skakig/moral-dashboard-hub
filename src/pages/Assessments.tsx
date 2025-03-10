
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { NewAssessmentDialog } from "@/components/assessments/NewAssessmentDialog";
import { AssessmentsTable } from "@/components/assessments/AssessmentsTable";
import { AssessmentsToolbar } from "@/components/assessments/AssessmentsToolbar";
import { useAssessments } from "@/hooks/useAssessments";

export default function Assessments() {
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const {
    assessments,
    isLoading,
    error,
    refetch,
    handleDelete,
    filterLevel,
    setFilterLevel,
    searchTerm,
    setSearchTerm
  } = useAssessments();

  const handleCreateAssessment = () => {
    refetch();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
            <p className="text-muted-foreground">
              Manage moral assessment questions and scenarios
            </p>
          </div>
          <Button onClick={() => setIsNewAssessmentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Assessment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Management</CardTitle>
            <CardDescription>Create, edit and manage moral assessment questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <AssessmentsToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterLevel={filterLevel}
                setFilterLevel={setFilterLevel}
                isLoading={isLoading}
                refetch={refetch}
              />

              <AssessmentsTable
                assessments={assessments}
                isLoading={isLoading}
                error={error}
                onDelete={handleDelete}
                refetch={refetch}
              />

              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Assessment Dialog */}
      <NewAssessmentDialog 
        open={isNewAssessmentOpen} 
        onOpenChange={setIsNewAssessmentOpen}
        onSubmit={handleCreateAssessment}
      />
    </AppLayout>
  );
}
