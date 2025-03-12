// Types for MCP (Model Context Protocol)

// MCP interface types
export interface MCPServerInfo {
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

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: object; // JSON Schema
  examples?: {
    input: object;
    output: object;
  }[];
}

export interface MCPToolExecutionRequest {
  input: any;
}

export interface MCPToolExecutionResponse {
  output: any;
}

export interface MCPResourceInfo {
  id: string;
  name: string;
  contentType: string;
  size?: number;
  description?: string;
  metadata?: Record<string, any>;
}

// Models and providers
export interface AIProviderModel {
  id: string;
  name: string;
  description?: string;
}

export interface AIProvider {
  id: number;
  name: string;
  provider: string;
  apiKey?: string;
  hasKey?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Chat and message types
export interface ChatMessage {
  id: number;
  sessionId: number;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: string;
  timestamp: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  title: string;
  providerId: number;
  model: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatWithMessages {
  session: ChatSession;
  messages: ChatMessage[];
}

// Token types
export interface AccessToken {
  id: number;
  userId: number;
  name: string;
  token: string;
  permissions: string;
  createdAt: string;
  expiresAt?: string | null;
  lastUsed?: string | null;
  revoked: boolean;
}

// Tool types
export interface Tool {
  id: number;
  name: string;
  description: string;
  type: string;
  endpoint: string;
  active: boolean;
  createdAt: string;
  config?: string | null;
}
