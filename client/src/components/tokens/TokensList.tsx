import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AccessToken } from "@/lib/mcp-types";

interface TokensListProps {
  tokens: AccessToken[];
  isLoading: boolean;
  onRevokeToken: (id: number) => void;
  isRevoking: boolean;
}

export default function TokensList({ 
  tokens, 
  isLoading, 
  onRevokeToken,
  isRevoking 
}: TokensListProps) {
  const [tokenToRevoke, setTokenToRevoke] = useState<number | null>(null);

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  // Get token status
  const getTokenStatus = (token: AccessToken) => {
    if (token.revoked) return "Revoked";
    
    if (token.expiresAt) {
      const expiryDate = new Date(token.expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) return "Expired";
      if (daysUntilExpiry < 7) return "Expiring Soon";
    }
    
    return "Active";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "Expiring Soon":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "Expired":
      case "Revoked":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  // Handle revoke
  const handleRevoke = () => {
    if (tokenToRevoke !== null) {
      onRevokeToken(tokenToRevoke);
      setTokenToRevoke(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Active Tokens</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Active Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                    No tokens found. Generate one using the form above.
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((token) => {
                  const status = getTokenStatus(token);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(token.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(token.expiresAt)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === "Active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => setTokenToRevoke(token.id)}
                                disabled={isRevoking}
                              >
                                {isRevoking && tokenToRevoke === token.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : null}
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Access Token</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke this token? This action cannot be undone, and
                                  any applications using this token will lose access immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setTokenToRevoke(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleRevoke}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  Revoke Token
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {status === "Expiring Soon" && (
                          <>
                            <Button 
                              variant="ghost" 
                              className="text-primary hover:text-primary/80 mr-3"
                            >
                              Renew
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => setTokenToRevoke(token.id)}
                                >
                                  Revoke
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Access Token</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to revoke this token? This action cannot be undone, and
                                    any applications using this token will lose access immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setTokenToRevoke(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleRevoke}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Revoke Token
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
