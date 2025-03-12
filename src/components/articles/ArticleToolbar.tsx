
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ArticleToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCreateNew?: () => void; // Optional callback for Create New button
}

export function ArticleToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateNew,
}: ArticleToolbarProps) {
  const navigate = useNavigate();
  
  const handleCreateClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/articles/create");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search articles..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={onStatusFilterChange}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
      <Button className="md:ml-auto" onClick={handleCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create New
      </Button>
    </div>
  );
}
