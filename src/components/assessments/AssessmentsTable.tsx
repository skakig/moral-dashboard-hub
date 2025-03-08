
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, Shuffle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define the type for our assessment data
export interface Assessment {
  id: string;
  title: string;
  description?: string;
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
  time_limit_seconds: number;
  sequential_logic_enabled: boolean;
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
            <TableHead>Settings</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                Loading assessments...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-red-500">
                Error loading assessments. Please try again.
              </TableCell>
            </TableRow>
          ) : assessments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No assessments found. Create your first assessment.
              </TableCell>
            </TableRow>
          ) : (
            assessments?.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{assessment.title}</div>
                    {assessment.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{assessment.description}</div>
                    )}
                  </div>
                </TableCell>
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
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {assessment.time_limit_seconds}s
                    </div>
                    <div className="flex items-center text-xs">
                      <Shuffle className="h-3 w-3 mr-1" />
                      {assessment.sequential_logic_enabled ? "Sequential" : "Fixed"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                </TableCell>
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
