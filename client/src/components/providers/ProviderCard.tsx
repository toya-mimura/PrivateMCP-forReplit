import { useState } from "react";
import { AIProvider, AIProviderModel } from "@/lib/mcp-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { getAvailableModels } from "@/hooks/use-providers";
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

interface ProviderCardProps {
  provider: AIProvider;
  onUpdate: (data: any) => void;
  onDelete: (id: number) => void;
  onTest: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
}

export default function ProviderCard({ 
  provider, 
  onUpdate, 
  onDelete, 
  onTest,
  isUpdating,
  isDeleting,
  isTesting 
}: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [showUpdateKey, setShowUpdateKey] = useState(false);
  
  // Get available models for this provider
  const models = getAvailableModels(provider.provider);
  
  // Update provider active status
  const handleToggleActive = () => {
    onUpdate({
      id: provider.id,
      active: !provider.active
    });
  };
  
  // Update API key
  const handleUpdateApiKey = () => {
    if (newApiKey) {
      onUpdate({
        id: provider.id,
        apiKey: newApiKey
      });
      setNewApiKey("");
      setShowUpdateKey(false);
    }
  };
  
  // Test provider connection
  const handleTestConnection = () => {
    onTest(provider.id);
  };
  
  // Delete provider
  const handleDelete = () => {
    onDelete(provider.id);
  };
  
  // Get a display-friendly provider name
  const getProviderDisplay = (providerType: string) => {
    switch(providerType.toLowerCase()) {
      case 'anthropic': return 'Anthropic';
      case 'openai': return 'OpenAI';
      default: return providerType;
    }
  };
  
  // Get provider logo/icon
  const getProviderIcon = (providerType: string) => {
    switch(providerType.toLowerCase()) {
      case 'anthropic':
        return <span className="text-xl font-bold text-accent">A</span>;
      case 'openai':
        return <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">O</span>;
      default:
        return <span className="text-xl font-bold">?</span>;
    }
  };
  
  return (
    <Card className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg ${
            provider.provider === 'anthropic' 
              ? 'bg-purple-100 dark:bg-slate-700' 
              : 'bg-emerald-100 dark:bg-slate-700'
          } flex items-center justify-center mr-4`}>
            {getProviderIcon(provider.provider)}
          </div>
          <div>
            <h3 className="text-lg font-medium">{provider.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getProviderDisplay(provider.provider)} AI models
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            provider.active 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
          } mr-2`}>
            {provider.active ? 'Active' : 'Inactive'}
          </span>
          <button 
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? <ChevronUp className="h-5 w-5" /> 
              : <ChevronDown className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            {showUpdateKey ? (
              <div className="flex">
                <Input 
                  type="password" 
                  value={newApiKey} 
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter new API key" 
                  className="flex-1 px-3 py-2 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  onClick={handleUpdateApiKey} 
                  disabled={!newApiKey || isUpdating}
                  className="px-3 rounded-r-md"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowUpdateKey(false);
                    setNewApiKey("");
                  }} 
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex">
                <Input 
                  type="password" 
                  value={provider.apiKey || "••••••••••••••••••••••••••••••"} 
                  className="flex-1 px-3 py-2 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary" 
                  readOnly
                />
                <Button 
                  onClick={() => setShowUpdateKey(true)}
                  className="px-3 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-r-md hover:bg-slate-200 dark:hover:bg-slate-500"
                >
                  Update
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Available Models</label>
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{model.description}</p>
                  </div>
                  <div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
            <div>
              <h4 className="font-medium">Active Status</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enable or disable this provider</p>
            </div>
            <Switch 
              checked={provider.active} 
              onCheckedChange={handleToggleActive}
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !provider.active}
              className="px-4 py-2 text-sm font-medium"
            >
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Connection
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this provider? This action cannot be undone,
                    and any chat sessions using this provider will no longer work.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 text-white hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Delete Provider
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              onClick={() => setExpanded(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
