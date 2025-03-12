import { useState } from "react";
import { useTools, getToolTypes, ToolCreateData, ToolUpdateData } from "@/hooks/use-tools";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolsList from "./ToolsList";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogTrigger
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const toolFormSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  endpoint: z.string().min(1, "Endpoint is required"),
  active: z.boolean().default(true),
  config: z.string().optional(),
});

export default function ToolRegistry() {
  const { 
    tools, 
    isLoading, 
    createTool, 
    isCreating,
    updateTool,
    isUpdating,
    deleteTool,
    isDeleting
  } = useTools();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toolTypes = getToolTypes();

  const form = useForm<z.infer<typeof toolFormSchema>>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      endpoint: "/api/tools/",
      active: true,
      config: "{}",
    },
  });

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof toolFormSchema>) => {
    // If endpoint doesn't start with /api/tools/, add it
    let endpoint = values.endpoint;
    if (!endpoint.startsWith('/api/tools/')) {
      endpoint = `/api/tools/${endpoint.replace(/^\/+/, '')}`;
    }
    
    const toolData: ToolCreateData = {
      ...values,
      endpoint
    };
    
    createTool(toolData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  // Handle tool update
  const handleToolUpdate = (data: ToolUpdateData) => {
    updateTool(data);
  };

  // Handle tool deletion
  const handleToolDelete = (id: number) => {
    deleteTool(id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Tool Registry</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and configure MCP tools</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Tool</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tool Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. GitHub Repository" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what this tool does" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tool type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {toolTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endpoint</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="/api/tools/my-tool" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="config"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Configuration (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"inputSchema": {"type": "object", "properties": {...}}}'
                              className="font-mono text-sm h-32 resize-none"
                              {...field} 
                            />
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
                              Enable this tool for use with MCP clients
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
                        Add Tool
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tools List */}
        <ToolsList 
          tools={tools || []} 
          isLoading={isLoading}
          onUpdateTool={handleToolUpdate}
          onDeleteTool={handleToolDelete}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
