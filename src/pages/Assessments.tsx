
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, RefreshCw, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewAssessmentDialog } from "@/components/assessments/NewAssessmentDialog";
import { toast } from "sonner";

// Mock assessment data
const assessments = [
  {
    id: 1,
    title: "The Trolley Problem",
    category: "Moral Dilemma",
    level: 5,
    questions: 6,
    createdAt: "2023-05-15",
    status: "active",
  },
  {
    id: 2,
    title: "Medical Ethics Scenario",
    category: "Professional Ethics",
    level: 7,
    questions: 8,
    createdAt: "2023-06-22",
    status: "active",
  },
  {
    id: 3,
    title: "Personal vs Community Values",
    category: "Social Dynamics",
    level: 4,
    questions: 5,
    createdAt: "2023-07-10",
    status: "draft",
  },
  {
    id: 4,
    title: "Business Decision Ethics",
    category: "Professional Ethics",
    level: 6,
    questions: 7,
    createdAt: "2023-08-05",
    status: "active",
  },
  {
    id: 5,
    title: "Environmental Responsibility",
    category: "Global Ethics",
    level: 3,
    questions: 4,
    createdAt: "2023-09-18",
    status: "inactive",
  },
];

export default function Assessments() {
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [assessmentsList, setAssessmentsList] = useState(assessments);

  const handleCreateAssessment = (formData: any) => {
    // Create a new assessment with the form data
    const newAssessment = {
      id: assessmentsList.length + 1,
      title: formData.title,
      category: formData.category,
      level: parseInt(formData.level),
      questions: 0, // New assessments start with 0 questions
      createdAt: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: formData.status,
    };

    // Add to the assessments list
    setAssessmentsList([newAssessment, ...assessmentsList]);
    
    toast.success(`Assessment "${formData.title}" created successfully`);
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by level" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1-3">Level 1-3</SelectItem>
                      <SelectItem value="4-6">Level 4-6</SelectItem>
                      <SelectItem value="7-9">Level 7-9</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Moral Level</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessmentsList.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.title}</TableCell>
                        <TableCell>{assessment.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-medium">
                              {assessment.level}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{assessment.questions}</TableCell>
                        <TableCell>{assessment.createdAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assessment.status === "active"
                                ? "default"
                                : assessment.status === "draft"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
