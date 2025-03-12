import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Copy, Check } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TokenCreateData } from "@/hooks/use-tokens";
import { AccessToken } from "@/lib/mcp-types";

const formSchema = z.object({
  name: z.string().min(1, "Token name is required"),
  expiry: z.string(),
  permissions: z.string().default("read,execute"),
});

interface GenerateTokenFormProps {
  onSubmit: (data: TokenCreateData) => void;
  isSubmitting: boolean;
  onTokenCreated: (token: AccessToken) => void;
  createdToken?: AccessToken;
  showToken: string | null;
  onCloseTokenDisplay: () => void;
}

export default function GenerateTokenForm({ 
  onSubmit, 
  isSubmitting,
  onTokenCreated,
  createdToken,
  showToken,
  onCloseTokenDisplay
}: GenerateTokenFormProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({
    read: true,
    execute: true,
    manage: false
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      expiry: "30",
      permissions: "read,execute"
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert permissions checkboxes to comma-separated string
    const permissionsArray = Object.entries(selectedPermissions)
      .filter(([_, selected]) => selected)
      .map(([permission]) => permission);
    
    const data = {
      ...values,
      permissions: permissionsArray.join(',')
    };
    
    onSubmit(data);
    
    if (createdToken) {
      onTokenCreated(createdToken);
    }
    
    // Reset form
    form.reset();
  };

  const handlePermissionChange = (permission: 'read' | 'execute' | 'manage', checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
    
    // Update form value
    const updatedPermissions = {
      ...selectedPermissions,
      [permission]: checked
    };
    
    const permissionsArray = Object.entries(updatedPermissions)
      .filter(([_, selected]) => selected)
      .map(([perm]) => perm);
    
    form.setValue('permissions', permissionsArray.join(','));
  };

  const copyToClipboard = () => {
    if (showToken) {
      navigator.clipboard.writeText(showToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Generate New Token</CardTitle>
      </CardHeader>
      <CardContent>
        {showToken ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription>
                <p className="mb-2 font-medium text-green-800 dark:text-green-300">
                  Your token has been generated successfully
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                  Make sure to copy your token now. You won't be able to see it again!
                </p>
                <div className="relative">
                  <Input
                    value={showToken}
                    readOnly
                    className="pr-10 font-mono bg-white dark:bg-slate-800"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onCloseTokenDisplay}
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Claude Desktop App" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="0">Never expires</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="perm-read" 
                          checked={selectedPermissions.read}
                          onCheckedChange={(checked) => 
                            handlePermissionChange('read', checked as boolean)
                          }
                        />
                        <label htmlFor="perm-read" className="ml-2 text-sm">Read Resources</label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="perm-execute" 
                          checked={selectedPermissions.execute}
                          onCheckedChange={(checked) => 
                            handlePermissionChange('execute', checked as boolean)
                          }
                        />
                        <label htmlFor="perm-execute" className="ml-2 text-sm">Execute Tools</label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="perm-manage" 
                          checked={selectedPermissions.manage}
                          onCheckedChange={(checked) => 
                            handlePermissionChange('manage', checked as boolean)
                          }
                        />
                        <label htmlFor="perm-manage" className="ml-2 text-sm">Manage Configuration</label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate Token
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
