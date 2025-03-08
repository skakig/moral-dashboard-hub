
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define the type for our assessment data
interface Assessment {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
  };
  level: {
    id: number;
    level: number;
    name: string;
  };
  questions_count: number;
  created_at: string;
  status: string;
}

export default function Assessments() {
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch assessments from Supabase
  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments', filterLevel, searchTerm],
    queryFn: async () => {
      // Start with a base query
      let query = supabase
        .from('assessments')
        .select(`
          id, 
          title, 
          status, 
          questions_count, 
          created_at,
          category:category_id(id, name), 
          level:level_id(id, level, name)
        `)
        .order('created_at', { ascending: false });

      // Apply level filtering if needed
      if (filterLevel !== "all") {
        const [min, max] = filterLevel.split("-").map(Number);
        query = query.gte('level.level', min).lte('level.level', max);
      }

      // Apply search term if provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
        return [];
      }

      return data as Assessment[];
    },
  });

  const handleCreateAssessment = (formData: any) => {
    // Refetch assessments after creating a new one
    refetch();
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting assessment:", error);
        toast.error("Failed to delete assessment");
        return;
      }

      toast.success("Assessment deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("An unexpected error occurred");
    }
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select 
                    defaultValue="all"
                    onValueChange={setFilterLevel}
                  >
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
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          Loading assessments...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-red-500">
                          Error loading assessments. Please try again.
                        </TableCell>
                      </TableRow>
                    ) : assessments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No assessments found. Create your first assessment.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assessments?.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">{assessment.title}</TableCell>
                          <TableCell>{assessment.category?.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-medium text-white">
                                {assessment.level?.level}
                              </span>
                              <span className="hidden md:inline text-xs text-muted-foreground">
                                {assessment.level?.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{assessment.questions_count}</TableCell>
                          <TableCell>{new Date(assessment.created_at).toLocaleDateString()}</TableCell>
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
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(assessment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
