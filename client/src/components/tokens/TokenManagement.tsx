import { useState } from "react";
import GenerateTokenForm from "./GenerateTokenForm";
import TokensList from "./TokensList";
import { useTokens } from "@/hooks/use-tokens";

export default function TokenManagement() {
  const { 
    tokens, 
    isLoading, 
    createToken, 
    isCreating,
    revokeToken,
    isRevoking,
    createdToken 
  } = useTokens();
  
  const [showToken, setShowToken] = useState<string | null>(null);

  // When a new token is created, show it to the user
  const handleTokenCreated = (newToken: any) => {
    if (newToken?.token) {
      setShowToken(newToken.token);
    }
  };

  // Clear the shown token when it's closed
  const handleCloseTokenDisplay = () => {
    setShowToken(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Access Tokens</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage authentication tokens for MCP clients</p>
        </div>

        {/* Token Generation Form */}
        <GenerateTokenForm 
          onSubmit={createToken} 
          isSubmitting={isCreating}
          onTokenCreated={handleTokenCreated}
          createdToken={createdToken}
          showToken={showToken}
          onCloseTokenDisplay={handleCloseTokenDisplay}
        />

        {/* Active Tokens List */}
        <TokensList 
          tokens={tokens || []} 
          isLoading={isLoading}
          onRevokeToken={revokeToken}
          isRevoking={isRevoking}
        />
      </div>
    </div>
  );
}
