// MCP Protocol Types based on MCP specification: https://github.com/anthropics/anthropic-cookbook/tree/main/mcp

// Basic MCP protocol types
export interface MCPRequest {
  data?: string | object;
  method?: string; 
  path?: string;
  headers?: Record<string, string>;
}

export interface MCPResponse {
  status: number;
  statusText: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface MCPError {
  error: string;
  message: string;
  status?: number;
}

// Resources types
export interface ResourceInfo {
  id: string;
  name: string;
  contentType: string;
  size?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ResourceContent {
  content: string;
  contentType: string;
}

// Tool types
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object; // JSON Schema
  examples?: {
    input: object;
    output: object;
  }[];
}

export interface ToolExecutionRequest {
  input: any;
}

export interface ToolExecutionResponse {
  output: any;
}

// Prompt types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface PromptUsageRequest {
  id: string;
  parameters: Record<string, any>;
}

export interface PromptUsageResponse {
  prompt: string;
}

// Sampling API types
export interface SamplingRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

export interface SamplingTokenResponse {
  token: string;
  logprob: number;
  is_end: boolean;
}

// MCP Server Discovery types
export interface ServerInfo {
  name: string;
  description: string;
  version: string;
  resources?: {
    enabled: boolean;
    description?: string;
  };
  tools?: {
    enabled: boolean;
    description?: string;
  };
  prompts?: {
    enabled: boolean;
    description?: string;
  };
  sampling?: {
    enabled: boolean;
    description?: string;
  };
}
