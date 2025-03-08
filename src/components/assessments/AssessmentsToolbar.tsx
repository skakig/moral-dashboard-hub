
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RefreshCw, Search, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssessmentsToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterLevel: string;
  setFilterLevel: (value: string) => void;
  isLoading: boolean;
  refetch: () => void;
  totalCount?: number;
}

export function AssessmentsToolbar({
  searchTerm,
  setSearchTerm,
  filterLevel,
  setFilterLevel,
  isLoading,
  refetch,
  totalCount
}: AssessmentsToolbarProps) {
  return (
    <div className="space-y-4">
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
            defaultValue={filterLevel}
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
      
      {totalCount !== undefined && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal">{totalCount} Assessment{totalCount !== 1 ? 's' : ''}</Badge>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last updated just now</span>
          </div>
        </div>
      )}
    </div>
  );
}
