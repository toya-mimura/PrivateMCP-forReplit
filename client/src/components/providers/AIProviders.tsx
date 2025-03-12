import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useProviders, ProviderCreateData, ProviderUpdateData } from "@/hooks/use-providers";
import ProviderCard from "./ProviderCard";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const providerFormSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  provider: z.string().min(1, "Provider type is required"),
  apiKey: z.string().min(1, "API key is required"),
  active: z.boolean().default(true),
});

export default function AIProviders() {
  const { 
    providers, 
    isLoading, 
    createProvider, 
    isCreating,
    updateProvider,
    isUpdating,
    deleteProvider,
    isDeleting,
    testProvider,
    isTesting
  } = useProviders();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof providerFormSchema>>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      provider: "",
      apiKey: "",
      active: true,
    },
  });

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof providerFormSchema>) => {
    createProvider(values as ProviderCreateData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  // Handle provider update
  const handleProviderUpdate = (data: ProviderUpdateData) => {
    updateProvider(data);
  };

  // Handle provider deletion
  const handleProviderDelete = (id: number) => {
    deleteProvider(id);
  };

  // Handle provider test
  const handleProviderTest = (id: number) => {
    testProvider(id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">AI Providers</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure and manage AI service providers</p>
        </div>

        {/* Provider Cards */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Provider cards */}
              {providers?.map((provider) => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider}
                  onUpdate={handleProviderUpdate}
                  onDelete={handleProviderDelete}
                  onTest={handleProviderTest}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                  isTesting={isTesting}
                />
              ))}

              {/* Add New Provider */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-dashed hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Button variant="outline" size="icon" className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-slate-700 mb-3">
                        <PlusIcon className="h-6 w-6 text-primary" />
                      </Button>
                      <h3 className="text-lg font-medium">Add New Provider</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure another AI service provider</p>
                      <Button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md">
                        Add Provider
                      </Button>
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New AI Provider</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. My Anthropic Account" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select provider type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                                  <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your API key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Enable or disable this provider
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Add Provider
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
