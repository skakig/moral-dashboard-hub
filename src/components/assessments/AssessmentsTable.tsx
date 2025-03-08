
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the type for our assessment data
export interface Assessment {
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

interface AssessmentsTableProps {
  assessments?: Assessment[];
  isLoading: boolean;
  error: unknown;
  onDelete: (id: string) => Promise<void>;
  refetch: () => void;
}

export function AssessmentsTable({ 
  assessments, 
  isLoading, 
  error, 
  onDelete,
  refetch 
}: AssessmentsTableProps) {
  return (
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
                      onClick={() => onDelete(assessment.id)}
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
  );
}
