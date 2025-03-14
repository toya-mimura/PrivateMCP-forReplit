
import { Store } from "express-session";
import {
  User, InsertUser,
  AccessToken, InsertAccessToken,
  AIProvider, InsertAIProvider,
  Tool, InsertTool,
  ChatSession, InsertChatSession,
  ChatMessage, InsertChatMessage
} from "@shared/schema";

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
