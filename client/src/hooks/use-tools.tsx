import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tool } from "@/lib/mcp-types";

export interface ToolCreateData {
  name: string;
  description: string;
  type: string;
  endpoint: string;
  active: boolean;
  config?: string;
}

export interface ToolUpdateData extends Partial<ToolCreateData> {
  id: number;
}

export function useTools() {
  const { toast } = useToast();

  // Fetch all tools
  const { 
    data: tools, 
    isLoading,
    error,
    refetch 
  } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
    refetchOnWindowFocus: false,
  });

  // Create a new tool
  const createToolMutation = useMutation({
    mutationFn: async (toolData: ToolCreateData) => {
      const res = await apiRequest("POST", "/api/tools", toolData);
      return await res.json();
    },
    onSuccess: (newTool) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Tool created",
        description: `Tool ${newTool.name} has been added successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create tool",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a tool
  const updateToolMutation = useMutation({
    mutationFn: async ({ id, ...data }: ToolUpdateData) => {
      const res = await apiRequest("PUT", `/api/tools/${id}`, data);
      return await res.json();
    },
    onSuccess: (updatedTool) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Tool updated",
        description: `Tool ${updatedTool.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update tool",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a tool
  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: number) => {
      await apiRequest("DELETE", `/api/tools/${toolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Tool deleted",
        description: "Tool has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete tool",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    tools,
    isLoading,
    error,
    refetchTools: refetch,
    createTool: createToolMutation.mutate,
    isCreating: createToolMutation.isPending,
    updateTool: updateToolMutation.mutate,
    isUpdating: updateToolMutation.isPending,
    deleteTool: deleteToolMutation.mutate,
    isDeleting: deleteToolMutation.isPending,
  };
}

// Helper function to get tool type options
export function getToolTypes(): string[] {
  return [
    "System",
    "Web",
    "Development",
    "Storage",
    "AI",
    "Communication",
    "Other"
  ];
}
