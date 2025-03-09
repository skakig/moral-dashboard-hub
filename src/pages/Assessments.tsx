
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentsTable } from "@/components/assessments/AssessmentsTable";
import { AssessmentsToolbar } from "@/components/assessments/AssessmentsToolbar";
import { NewAssessmentDialog } from "@/components/assessments/NewAssessmentDialog";
import { PlusCircle, FileText, Users, BarChart } from "lucide-react";

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Placeholder data for demonstration
  const assessments = [
    {
      id: "1",
      title: "Moral Level 1 Assessment",
      description: "Basic assessment for Level 1 moral development",
      status: "active",
      questions_count: 12,
      created_at: new Date().toISOString(),
      level_id: 1
    },
    {
      id: "2",
      title: "Moral Level 2 Assessment",
      description: "Self-Interest and Pragmatic Morality Assessment",
      status: "active",
      questions_count: 15,
      created_at: new Date().toISOString(),
      level_id: 2
    },
    {
      id: "3",
      title: "Moral Level 3 Assessment (Draft)",
      description: "Social Contract and Cooperative Morality Assessment",
      status: "draft",
      questions_count: 10,
      created_at: new Date().toISOString(),
      level_id: 3
    }
  ];

  const handleCreateAssessment = () => {
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage assessment content, questions, and user responses
          </p>
        </div>

        <Tabs defaultValue="assessments">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="responses">User Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessments" className="mt-6">
            <AssessmentsToolbar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onCreateNew={handleCreateAssessment}
            />
            
            <div className="mt-6">
              <AssessmentsTable 
                assessments={assessments}
                onEdit={(assessment) => console.log("Edit assessment", assessment)}
                onDelete={(id) => console.log("Delete assessment", id)}
                onView={(assessment) => console.log("View assessment", assessment)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Bank</CardTitle>
                <CardDescription>
                  Create and manage assessment questions by moral level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <Card key={level} className="bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Level {level} Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span>{Math.floor(Math.random() * 20) + 5} questions</span>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Question
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="responses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Responses</CardTitle>
                <CardDescription>
                  View and analyze user responses to assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Responses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">1,248</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <BarChart className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">74.3%</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">89.7%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button variant="outline">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <NewAssessmentDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={(data) => {
            console.log("New assessment data:", data);
            setIsDialogOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
}
