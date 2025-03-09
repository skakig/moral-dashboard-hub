
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Edit, Trash2, Plus, HelpCircle } from "lucide-react";
import { 
  getFunctionMappings, 
  updateFunctionMapping, 
  deleteFunctionMapping,
  FunctionMapping
} from "@/services/functionMappingService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FunctionMappingSection() {
  const [functionMappings, setFunctionMappings] = useState<FunctionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<Partial<FunctionMapping> | null>(null);
  
  // Available AI services
  const availableServices = ["OpenAI", "Anthropic", "ElevenLabs", "StableDiffusion"];
  
  useEffect(() => {
    loadFunctionMappings();
  }, []);
  
  const loadFunctionMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mappings = await getFunctionMappings();
      setFunctionMappings(mappings);
    } catch (err: any) {
      console.error("Error loading function mappings:", err);
      setError(err.message || "Failed to load function mappings");
      toast.error("Failed to load function mappings");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditMapping = (mapping: FunctionMapping) => {
    setCurrentMapping(mapping);
    setDialogOpen(true);
  };
  
  const handleCreateMapping = () => {
    setCurrentMapping({
      function_name: "",
      preferred_service: availableServices[0],
      fallback_service: null,
      description: ""
    });
    setDialogOpen(true);
  };
  
  const handleDeleteMapping = async (id: string) => {
    if (!confirm("Are you sure you want to delete this function mapping?")) {
      return;
    }
    
    try {
      const success = await deleteFunctionMapping(id);
      
      if (success) {
        toast.success("Function mapping deleted successfully");
        loadFunctionMappings();
      } else {
        throw new Error("Failed to delete function mapping");
      }
    } catch (err: any) {
      console.error("Error deleting function mapping:", err);
      toast.error("Failed to delete function mapping");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMapping || !currentMapping.function_name || !currentMapping.preferred_service) {
      toast.error("Function name and preferred service are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updateFunctionMapping({
        id: currentMapping.id,
        function_name: currentMapping.function_name,
        preferred_service: currentMapping.preferred_service,
        fallback_service: currentMapping.fallback_service,
        description: currentMapping.description
      });
      
      toast.success("Function mapping saved successfully");
      setDialogOpen(false);
      loadFunctionMappings();
    } catch (err: any) {
      console.error("Error saving function mapping:", err);
      toast.error("Failed to save function mapping");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Function Mappings</CardTitle>
          <CardDescription>Loading function mappings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            <div className="flex items-center gap-2">
              Function Mappings
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setHelpDialogOpen(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Configure which AI service to use for specific functions
          </CardDescription>
        </div>
        <Button onClick={handleCreateMapping}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {functionMappings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No function mappings configured yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Function Name</TableHead>
                <TableHead>Preferred Service</TableHead>
                <TableHead>Fallback Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {functionMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">{mapping.function_name}</TableCell>
                  <TableCell>{mapping.preferred_service}</TableCell>
                  <TableCell>{mapping.fallback_service || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{mapping.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditMapping(mapping)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteMapping(mapping.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentMapping?.id ? "Edit Function Mapping" : "Add Function Mapping"}
              </DialogTitle>
              <DialogDescription>
                Configure which AI service to use for a specific function
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="function_name">Function Name</Label>
                <Input
                  id="function_name"
                  placeholder="generate-article"
                  value={currentMapping?.function_name || ""}
                  onChange={(e) =>
                    setCurrentMapping({
                      ...currentMapping,
                      function_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred_service">Preferred Service</Label>
                <Select
                  value={currentMapping?.preferred_service || ""}
                  onValueChange={(value) =>
                    setCurrentMapping({
                      ...currentMapping,
                      preferred_service: value,
                    })
                  }
                >
                  <SelectTrigger id="preferred_service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fallback_service">Fallback Service (Optional)</Label>
                <Select
                  value={currentMapping?.fallback_service || ""}
                  onValueChange={(value) =>
                    setCurrentMapping({
                      ...currentMapping,
                      fallback_service: value,
                    })
                  }
                >
                  <SelectTrigger id="fallback_service">
                    <SelectValue placeholder="Select a fallback service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availableServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What this function does and why a specific service is preferred"
                  value={currentMapping?.description || ""}
                  onChange={(e) =>
                    setCurrentMapping({
                      ...currentMapping,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What are Function Mappings?</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>
                Function Mappings allow you to determine which AI service is used for specific functions in The Moral Hierarchy system.
              </p>
              
              <h3 className="font-semibold">Key Benefits:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use different AI services for specific tasks based on their strengths</li>
                <li>Set fallback services in case your preferred service is unavailable</li>
                <li>Optimize costs by routing certain tasks to less expensive providers</li>
                <li>Ensure consistency in the tone and quality of content generation</li>
              </ul>
              
              <h3 className="font-semibold">Examples:</h3>
              <div className="space-y-2">
                <p>
                  <strong>generate-article</strong>: Using OpenAI for general article generation
                </p>
                <p>
                  <strong>generate-voice</strong>: Using ElevenLabs for voice content generation
                </p>
                <p>
                  <strong>generate-image</strong>: Using StableDiffusion for image generation
                </p>
                <p>
                  <strong>analyze-morality</strong>: Using Anthropic for sensitive moral analysis
                </p>
              </div>
              
              <p>
                By configuring these mappings, you ensure that each specialized task uses the most appropriate AI model or service.
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setHelpDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
