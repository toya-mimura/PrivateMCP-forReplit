import {
  User, InsertUser,
  AccessToken, InsertAccessToken,
  AIProvider, InsertAIProvider,
  Tool, InsertTool,
  ChatSession, InsertChatSession,
  ChatMessage, InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";
import { Store } from "express-session";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Access token management
  getToken(token: string): Promise<AccessToken | undefined>;
  getTokenById(id: number): Promise<AccessToken | undefined>;
  getTokensByUser(userId: number): Promise<AccessToken[]>;
  createToken(token: InsertAccessToken): Promise<AccessToken>;
  updateToken(id: number, updates: Partial<AccessToken>): Promise<AccessToken | undefined>;
  revokeToken(id: number): Promise<boolean>;

  // AI Provider management
  getProvider(id: number): Promise<AIProvider | undefined>;
  getProviderByName(name: string): Promise<AIProvider | undefined>;
  getProviders(): Promise<AIProvider[]>;
  createProvider(provider: InsertAIProvider): Promise<AIProvider>;
  updateProvider(id: number, updates: Partial<AIProvider>): Promise<AIProvider | undefined>;
  deleteProvider(id: number): Promise<boolean>;

  // Tool management
  getTool(id: number): Promise<Tool | undefined>;
  getToolByName(name: string): Promise<Tool | undefined>;
  getToolByEndpoint(endpoint: string): Promise<Tool | undefined>;
  getTools(activeOnly?: boolean): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, updates: Partial<Tool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;

  // Chat management
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: number): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(id: number): Promise<boolean>;

  // Chat messages
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Session store for authentication
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<number, AccessToken>;
  private providers: Map<number, AIProvider>;
  private tools: Map<number, Tool>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  
  sessionStore: Store;
  
  currentUserId: number;
  currentTokenId: number;
  currentProviderId: number;
  currentToolId: number;
  currentSessionId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.providers = new Map();
    this.tools = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.currentUserId = 1;
    this.currentTokenId = 1;
    this.currentProviderId = 1;
    this.currentToolId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      updatedAt: null
    };
    this.users.set(id, user);
    return user;
  }

  // Token methods
  async getToken(token: string): Promise<AccessToken | undefined> {
    return Array.from(this.tokens.values()).find(
      (t) => t.token === token && !t.revoked && (t.expiresAt === null || new Date(t.expiresAt) > new Date()),
    );
  }

  async getTokenById(id: number): Promise<AccessToken | undefined> {
    return this.tokens.get(id);
  }

  async getTokensByUser(userId: number): Promise<AccessToken[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.userId === userId
    );
  }

  async createToken(insertToken: InsertAccessToken): Promise<AccessToken> {
    const id = this.currentTokenId++;
    const now = new Date();
    const token: AccessToken = {
      ...insertToken,
      id,
      createdAt: now,
      lastUsed: null,
      revoked: false,
      permissions: insertToken.permissions || "read,execute",
      expiresAt: insertToken.expiresAt || null
    };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id: number, updates: Partial<AccessToken>): Promise<AccessToken | undefined> {
    const token = this.tokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  async revokeToken(id: number): Promise<boolean> {
    const token = this.tokens.get(id);
    if (!token) return false;
    
    token.revoked = true;
    this.tokens.set(id, token);
    return true;
  }

  // Provider methods
  async getProvider(id: number): Promise<AIProvider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByName(name: string): Promise<AIProvider | undefined> {
    return Array.from(this.providers.values()).find(
      (provider) => provider.name === name
    );
  }

  async getProviders(): Promise<AIProvider[]> {
    return Array.from(this.providers.values());
  }

  async createProvider(insertProvider: InsertAIProvider): Promise<AIProvider> {
    const id = this.currentProviderId++;
    const now = new Date();
    const provider: AIProvider = {
      ...insertProvider,
      id,
      createdAt: now,
      updatedAt: null,
      active: insertProvider.active ?? true
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: number, updates: Partial<AIProvider>): Promise<AIProvider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;
    
    const updatedProvider = { 
      ...provider, 
      ...updates,
      updatedAt: new Date()
    };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }

  async deleteProvider(id: number): Promise<boolean> {
    return this.providers.delete(id);
  }

  // Tool methods
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async getToolByName(name: string): Promise<Tool | undefined> {
    return Array.from(this.tools.values()).find(
      (tool) => tool.name === name
    );
  }

  async getToolByEndpoint(endpoint: string): Promise<Tool | undefined> {
    return Array.from(this.tools.values()).find(
      (tool) => tool.endpoint === endpoint
    );
  }

  async getTools(activeOnly: boolean = false): Promise<Tool[]> {
    const tools = Array.from(this.tools.values());
    if (activeOnly) {
      return tools.filter(tool => tool.active);
    }
    return tools;
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.currentToolId++;
    const now = new Date();
    const tool: Tool = {
      ...insertTool,
      id,
      createdAt: now,
      active: insertTool.active ?? true,
      config: insertTool.config ?? null
    };
    this.tools.set(id, tool);
    return tool;
  }

  async updateTool(id: number, updates: Partial<Tool>): Promise<Tool | undefined> {
    const tool = this.tools.get(id);
    if (!tool) return undefined;
    
    const updatedTool = { ...tool, ...updates };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  async deleteTool(id: number): Promise<boolean> {
    return this.tools.delete(id);
  }

  // Chat session methods
  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsByUser(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const now = new Date();
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: now,
      updatedAt: null,
      title: insertSession.title || "New Chat"
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { 
      ...session, 
      ...updates,
      updatedAt: new Date()
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: number): Promise<boolean> {
    return this.chatSessions.delete(id);
  }

  // Chat message methods
  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: now,
      toolName: insertMessage.toolName ?? null
    };
    this.chatMessages.set(id, message);
    
    // Update the last updated time of the chat session
    const session = this.chatSessions.get(insertMessage.sessionId);
    if (session) {
      session.updatedAt = now;
      this.chatSessions.set(insertMessage.sessionId, session);
    }
    
    return message;
  }
}

export const storage = new MemStorage();
