import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AIProvider, AIProviderModel } from "@/lib/mcp-types";

export interface ProviderCreateData {
  name: string;
  provider: string;
  apiKey: string;
  active: boolean;
}

export interface ProviderUpdateData extends Partial<ProviderCreateData> {
  id: number;
}

export function useProviders() {
  const { toast } = useToast();

  // Fetch all providers
  const { 
    data: providers, 
    isLoading,
    error,
    refetch 
  } = useQuery<AIProvider[]>({
    queryKey: ["/api/providers"],
    refetchOnWindowFocus: false,
  });

  // Create a new provider
  const createProviderMutation = useMutation({
    mutationFn: async (providerData: ProviderCreateData) => {
      const res = await apiRequest("POST", "/api/providers", providerData);
      return await res.json();
    },
    onSuccess: (newProvider) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "Provider created",
        description: `Provider ${newProvider.name} has been added successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create provider",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a provider
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, ...data }: ProviderUpdateData) => {
      const res = await apiRequest("PUT", `/api/providers/${id}`, data);
      return await res.json();
    },
    onSuccess: (updatedProvider) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "Provider updated",
        description: `Provider ${updatedProvider.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update provider",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a provider
  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      await apiRequest("DELETE", `/api/providers/${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "Provider deleted",
        description: "Provider has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete provider",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Test a provider connection
  const testProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      const res = await apiRequest("POST", `/api/providers/${providerId}/test`);
      return await res.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Provider connection test was successful.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Provider connection test failed.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    providers,
    isLoading,
    error,
    refetchProviders: refetch,
    createProvider: createProviderMutation.mutate,
    isCreating: createProviderMutation.isPending,
    updateProvider: updateProviderMutation.mutate,
    isUpdating: updateProviderMutation.isPending,
    deleteProvider: deleteProviderMutation.mutate,
    isDeleting: deleteProviderMutation.isPending,
    testProvider: testProviderMutation.mutate,
    isTesting: testProviderMutation.isPending,
    testResult: testProviderMutation.data,
  };
}

// Helper function to get available models for a provider
export function getAvailableModels(provider: string): AIProviderModel[] {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return [
        { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet", description: "Balanced performance and speed" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Highest capability model" },
        { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced performance and speed" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast and cost-effective" }
      ];
    case 'openai':
      return [
        { id: "gpt-4o", name: "GPT-4o", description: "Latest model with enhanced capabilities" },
        { id: "gpt-4", name: "GPT-4", description: "Advanced reasoning model" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and efficient" }
      ];
    default:
      return [];
  }
}
