import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AccessToken } from "@/lib/mcp-types";

export interface TokenCreateData {
  name: string;
  expiry: string;
  permissions: string;
}

export function useTokens() {
  const { toast } = useToast();

  // Fetch all tokens
  const { 
    data: tokens, 
    isLoading,
    error,
    refetch 
  } = useQuery<AccessToken[]>({
    queryKey: ["/api/tokens"],
    refetchOnWindowFocus: false,
  });

  // Create a new token
  const createTokenMutation = useMutation({
    mutationFn: async (tokenData: TokenCreateData) => {
      const res = await apiRequest("POST", "/api/tokens", tokenData);
      return await res.json();
    },
    onSuccess: (newToken) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token created",
        description: "New access token has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create token",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Revoke a token
  const revokeTokenMutation = useMutation({
    mutationFn: async (tokenId: number) => {
      await apiRequest("POST", `/api/tokens/${tokenId}/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token revoked",
        description: "Access token has been revoked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to revoke token",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    tokens,
    isLoading,
    error,
    refetchTokens: refetch,
    createToken: createTokenMutation.mutate,
    isCreating: createTokenMutation.isPending,
    revokeToken: revokeTokenMutation.mutate,
    isRevoking: revokeTokenMutation.isPending,
    createdToken: createTokenMutation.data,
  };
}
