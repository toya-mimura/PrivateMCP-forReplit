import { Tool } from "@shared/schema";
import { ToolDefinition } from "./protocol";

// Default MCP tools that are always available
export const DefaultTools: Record<string, ToolDefinition> = {
  // Filesystem tool for read-only file access
  "filesystem": {
    name: "filesystem",
    description: "Access local files with permissions",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["list", "read", "exists", "info"],
          description: "The operation to perform"
        },
        path: {
          type: "string",
          description: "Path to file or directory"
        }
      },
      required: ["operation", "path"]
    },
    examples: [
      {
        input: { operation: "list", path: "/data" },
        output: { files: ["file1.txt", "file2.md", "subdirectory/"] }
      },
      {
        input: { operation: "read", path: "/data/file1.txt" },
        output: { content: "Content of the file...", contentType: "text/plain" }
      }
    ]
  },
  
  // Memory tool for storing and retrieving information
  "memory": {
    name: "memory",
    description: "Knowledge graph-based persistent memory system",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["store", "retrieve", "search", "delete"],
          description: "The operation to perform"
        },
        key: {
          type: "string",
          description: "Key for storing or retrieving"
        },
        value: {
          type: "string",
          description: "Value to store (for store operation)"
        },
        query: {
          type: "string",
          description: "Search query (for search operation)"
        }
      },
      required: ["operation"]
    },
    examples: [
      {
        input: { operation: "store", key: "user_preferences", value: "Prefers dark mode." },
        output: { success: true, key: "user_preferences" }
      },
      {
        input: { operation: "retrieve", key: "user_preferences" },
        output: { value: "Prefers dark mode." }
      }
    ]
  },
  
  // Web fetch tool for retrieving content from URLs
  "fetch": {
    name: "fetch",
    description: "Web content fetching and processing",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to fetch content from"
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE"],
          default: "GET",
          description: "HTTP method"
        },
        headers: {
          type: "object",
          description: "HTTP headers"
        },
        body: {
          type: "string",
          description: "Request body for POST/PUT methods"
        },
        extract: {
          type: "string",
          enum: ["text", "html", "markdown", "json"],
          default: "text",
          description: "Content extraction format"
        }
      },
      required: ["url"]
    },
    examples: [
      {
        input: { url: "https://example.com", extract: "text" },
        output: { content: "Example Domain\nThis domain is...", status: 200 }
      }
    ]
  },
  
  // Sequential thinking tool
  "sequential_thinking": {
    name: "sequential_thinking",
    description: "Dynamic problem-solving through thought sequences",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "Problem or task to solve"
        },
        context: {
          type: "string",
          description: "Relevant context for the problem"
        },
        steps: {
          type: "number",
          description: "Maximum number of thinking steps",
          default: 5
        }
      },
      required: ["task"]
    },
    examples: [
      {
        input: { 
          task: "Solve: If 3x + 2 = 11, what is x?", 
          steps: 3 
        },
        output: { 
          solution: "x = 3",
          steps: [
            "Starting with 3x + 2 = 11",
            "Subtract 2 from both sides: 3x = 9",
            "Divide both sides by 3: x = 3"
          ]
        }
      }
    ]
  }
};

// Custom tool registry
export class ToolsRegistry {
  private tools: Map<string, ToolDefinition>;
  
  constructor() {
    this.tools = new Map();
    
    // Register default tools
    Object.entries(DefaultTools).forEach(([name, definition]) => {
      this.registerTool(definition);
    });
  }
  
  public registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
  }
  
  public deregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }
  
  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }
  
  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  // Register a tool from the database
  public registerFromDbTool(dbTool: Tool): void {
    try {
      // Parse the config if it's a JSON string
      let inputSchema = {};
      let examples = undefined;
      
      if (dbTool.config) {
        const config = JSON.parse(dbTool.config);
        inputSchema = config.inputSchema || {};
        examples = config.examples;
      }
      
      const toolDef: ToolDefinition = {
        name: dbTool.name,
        description: dbTool.description,
        inputSchema: inputSchema,
        examples: examples
      };
      
      this.registerTool(toolDef);
    } catch (error) {
      console.error(`Failed to register tool ${dbTool.name}:`, error);
    }
  }
}

export const toolsRegistry = new ToolsRegistry();
