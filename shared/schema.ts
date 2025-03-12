import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Access tokens for API authentication
export const accessTokens = pgTable("access_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  token: text("token").notNull().unique(),
  permissions: text("permissions").notNull().default("read,execute"), // Comma-separated list of permissions: read,execute,manage
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastUsed: timestamp("last_used"),
  revoked: boolean("revoked").notNull().default(false),
});

export const insertTokenSchema = createInsertSchema(accessTokens).pick({
  userId: true,
  name: true,
  token: true,
  permissions: true,
  expiresAt: true,
});

// AI Providers configuration
export const aiProviders = pgTable("ai_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // e.g., "anthropic", "openai"
  apiKey: text("api_key").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertProviderSchema = createInsertSchema(aiProviders).pick({
  name: true,
  provider: true,
  apiKey: true,
  active: true,
});

// Tool registry
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  type: text("type").notNull(), // e.g., "System", "Web", "Development"
  endpoint: text("endpoint").notNull().unique(), // URL path to the tool handler
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  config: text("config"), // JSON string with tool-specific configuration
});

export const insertToolSchema = createInsertSchema(tools).pick({
  name: true,
  description: true,
  type: true,
  endpoint: true,
  active: true,
  config: true,
});

// Chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull().default("New Chat"),
  providerId: integer("provider_id").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  title: true,
  providerId: true,
  model: true,
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // user, assistant, system, tool
  content: text("content").notNull(),
  toolName: text("tool_name"), // If message is from a tool
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
  toolName: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AccessToken = typeof accessTokens.$inferSelect;
export type InsertAccessToken = z.infer<typeof insertTokenSchema>;

export type AIProvider = typeof aiProviders.$inferSelect;
export type InsertAIProvider = z.infer<typeof insertProviderSchema>;

export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
