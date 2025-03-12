import { MCPRequest, MCPResponse, MCPError, ServerInfo, ToolDefinition } from "./protocol";
import { toolsRegistry } from "./tools-registry";
import { storage } from "../storage";
import { validateToken } from "../auth";

// General MCP request handler
export async function handleMCPRequest(request: MCPRequest, token: string): Promise<MCPResponse | MCPError> {
  try {
    // Validate token
    const accessToken = await validateToken(token);
    if (!accessToken) {
      return {
        error: "unauthorized",
        message: "Invalid or expired token",
        status: 401
      };
    }
    
    // Route the request based on path
    const path = request.path || "";
    if (path === "/") {
      return handleServerInfo();
    } else if (path.startsWith("/tools")) {
      return handleToolsRequest(request, path);
    } else if (path.startsWith("/resources")) {
      return handleResourcesRequest(request, path);
    } else if (path.startsWith("/prompts")) {
      return handlePromptsRequest(request, path);
    } else if (path.startsWith("/sampling")) {
      return handleSamplingRequest(request, path);
    } else {
      return {
        error: "not_found",
        message: `Path not found: ${path}`,
        status: 404
      };
    }
  } catch (error: any) {
    return {
      error: "internal_error",
      message: error.message || "An unexpected error occurred",
      status: 500
    };
  }
}

// Server info handler
async function handleServerInfo(): Promise<MCPResponse> {
  const info: ServerInfo = {
    name: "MCP Server",
    description: "Model Context Protocol server with token authentication and web interface",
    version: "1.0.0",
    tools: {
      enabled: true,
      description: "Provides access to various tools for AI models"
    },
    resources: {
      enabled: true,
      description: "Allows access to structured resources"
    },
    prompts: {
      enabled: false,
      description: "Prompt templates not currently supported"
    },
    sampling: {
      enabled: false,
      description: "Sampling API not currently supported"
    }
  };
  
  return {
    status: 200,
    statusText: "OK",
    data: info
  };
}

// Tools API handler
async function handleToolsRequest(request: MCPRequest, path: string): Promise<MCPResponse | MCPError> {
  const method = request.method || "GET";
  
  // Handle tool listing
  if (path === "/tools" && method === "GET") {
    const tools = toolsRegistry.getAllTools();
    return {
      status: 200,
      statusText: "OK",
      data: tools
    };
  }
  
  // Handle specific tool requests
  const toolMatch = path.match(/^\/tools\/([^/]+)(?:\/execute)?$/);
  if (toolMatch) {
    const toolName = toolMatch[1];
    const tool = toolsRegistry.getTool(toolName);
    
    if (!tool) {
      return {
        error: "not_found",
        message: `Tool not found: ${toolName}`,
        status: 404
      };
    }
    
    // Get tool definition
    if (method === "GET" && path === `/tools/${toolName}`) {
      return {
        status: 200,
        statusText: "OK",
        data: tool
      };
    }
    
    // Execute tool
    if (method === "POST" && path === `/tools/${toolName}/execute`) {
      return await executeToolRequest(tool, request.data);
    }
  }
  
  return {
    error: "method_not_allowed",
    message: `Method ${method} not allowed for path ${path}`,
    status: 405
  };
}

// Tool execution handler
async function executeToolRequest(tool: ToolDefinition, data: any): Promise<MCPResponse | MCPError> {
  // Get the tool from the database
  const dbTool = await storage.getToolByName(tool.name);
  
  if (!dbTool || !dbTool.active) {
    return {
      error: "tool_unavailable",
      message: `Tool ${tool.name} is not available`,
      status: 503
    };
  }
  
  // Mock tool execution - this would be replaced with actual tool implementation
  try {
    let result: any;
    
    // Handle built-in tools
    switch (tool.name) {
      case "filesystem":
        result = handleFilesystemTool(data);
        break;
      case "memory":
        result = handleMemoryTool(data);
        break;
      case "fetch":
        result = await handleFetchTool(data);
        break;
      case "sequential_thinking":
        result = handleSequentialThinkingTool(data);
        break;
      default:
        // For custom tools, we'd implement specific logic or forward to appropriate handlers
        result = {
          output: `Tool ${tool.name} executed successfully`,
          mock: true
        };
    }
    
    return {
      status: 200,
      statusText: "OK",
      data: {
        output: result
      }
    };
  } catch (error: any) {
    return {
      error: "execution_error",
      message: error.message || `Error executing tool ${tool.name}`,
      status: 500
    };
  }
}

// Resources API handler
async function handleResourcesRequest(request: MCPRequest, path: string): Promise<MCPResponse | MCPError> {
  return {
    error: "not_implemented",
    message: "Resources API not fully implemented yet",
    status: 501
  };
}

// Prompts API handler
async function handlePromptsRequest(request: MCPRequest, path: string): Promise<MCPResponse | MCPError> {
  return {
    error: "not_implemented",
    message: "Prompts API not implemented",
    status: 501
  };
}

// Sampling API handler
async function handleSamplingRequest(request: MCPRequest, path: string): Promise<MCPResponse | MCPError> {
  return {
    error: "not_implemented",
    message: "Sampling API not implemented",
    status: 501
  };
}

// Tool implementation handlers
function handleFilesystemTool(data: any) {
  const { operation, path } = data;
  
  // Simple mock implementation
  switch (operation) {
    case "list":
      return {
        files: ["example.txt", "data.json", "images/"]
      };
    case "read":
      return {
        content: "This is example content from the file system.",
        contentType: path.endsWith(".json") ? "application/json" : "text/plain"
      };
    case "exists":
      return {
        exists: true
      };
    case "info":
      return {
        size: 1024,
        modified: new Date().toISOString(),
        contentType: path.endsWith(".json") ? "application/json" : "text/plain"
      };
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

// Memory storage for the memory tool
const memoryStorage = new Map<string, string>();

function handleMemoryTool(data: any) {
  const { operation, key, value, query } = data;
  
  switch (operation) {
    case "store":
      memoryStorage.set(key, value);
      return { success: true, key };
    case "retrieve":
      if (!memoryStorage.has(key)) {
        return { error: "Key not found" };
      }
      return { value: memoryStorage.get(key) };
    case "search":
      const results: Record<string, string> = {};
      for (const [k, v] of memoryStorage.entries()) {
        if (k.includes(query) || v.includes(query)) {
          results[k] = v;
        }
      }
      return { results };
    case "delete":
      const success = memoryStorage.delete(key);
      return { success };
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

async function handleFetchTool(data: any) {
  const { url, method = "GET", headers = {}, body = null, extract = "text" } = data;
  
  // In a real implementation, we would make the actual HTTP request
  // For the demo, return mock response
  return {
    content: `Example content fetched from ${url} using ${method}`,
    status: 200,
    headers: {
      "content-type": extract === "json" ? "application/json" : "text/plain"
    }
  };
}

function handleSequentialThinkingTool(data: any) {
  const { task, context = "", steps = 3 } = data;
  
  // In a real implementation, this would use an LLM to generate step-by-step thinking
  // For the demo, return a simple mock response
  return {
    solution: `Solution for: ${task}`,
    steps: Array.from({ length: steps }, (_, i) => `Step ${i + 1}: Thinking through the problem...`)
  };
}
