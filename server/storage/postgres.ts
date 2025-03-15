import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Store } from 'express-session';
import session from 'express-session';
import { eq, and, or, isNull, gt, asc } from 'drizzle-orm/expressions';
import * as schema from '@shared/schema';
import { IStorage } from './interface';

// Import ESM-compatible connect-pg-simple
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';

export class PostgresStorage implements IStorage {
  private db;
  sessionStore: Store;
  private pgPool;

  constructor(connectionString: string) {
    try {
      console.log('Initializing PostgreSQL storage...');

      // Create postgres-js client for Drizzle
      const client = postgres(connectionString, { max: 10 });
      this.db = drizzle(client, { schema });

      // Create pg Pool for connect-pg-simple
      this.pgPool = new pg.Pool({ connectionString });

      // Configure session store using ESM-compatible imports
      try {
        const PgStore = connectPgSimple(session);
        this.sessionStore = new PgStore({
          pool: this.pgPool,
          tableName: 'sessions',
          createTableIfMissing: true,
        });
        console.log('Session store configured successfully');
      } catch (err) {
        console.error('Failed to initialize session store:', err);
        throw err;
      }

      console.log('PostgreSQL storage initialized successfully');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL storage:', err);
      throw err;
    }
  }

  // User methods
  async getUser(id: number) {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: schema.InsertUser) {
    const [newUser] = await this.db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Token methods
  async getToken(token: string) {
    const [accessToken] = await this.db
      .select()
      .from(schema.accessTokens)
      .where(
        and(
          eq(schema.accessTokens.token, token),
          eq(schema.accessTokens.revoked, false),
          or(
            isNull(schema.accessTokens.expiresAt),
            gt(schema.accessTokens.expiresAt, new Date())
          )
        )
      );
    return accessToken;
  }

  async getTokenById(id: number) {
    const [token] = await this.db
      .select()
      .from(schema.accessTokens)
      .where(eq(schema.accessTokens.id, id));
    return token;
  }

  async getTokensByUser(userId: number) {
    return await this.db
      .select()
      .from(schema.accessTokens)
      .where(eq(schema.accessTokens.userId, userId));
  }

  async createToken(token: schema.InsertAccessToken) {
    const [newToken] = await this.db
      .insert(schema.accessTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async updateToken(id: number, updates: Partial<schema.AccessToken>) {
    const [updatedToken] = await this.db
      .update(schema.accessTokens)
      .set(updates)
      .where(eq(schema.accessTokens.id, id))
      .returning();
    return updatedToken;
  }

  async revokeToken(id: number) {
    const [token] = await this.db
      .update(schema.accessTokens)
      .set({ revoked: true })
      .where(eq(schema.accessTokens.id, id))
      .returning();
    return !!token;
  }

  // Provider methods
  async getProvider(id: number) {
    const [provider] = await this.db
      .select()
      .from(schema.aiProviders)
      .where(eq(schema.aiProviders.id, id));
    return provider;
  }

  async getProviderByName(name: string) {
    const [provider] = await this.db
      .select()
      .from(schema.aiProviders)
      .where(eq(schema.aiProviders.name, name));
    return provider;
  }

  async getProviders() {
    return await this.db.select().from(schema.aiProviders);
  }

  async createProvider(provider: schema.InsertAIProvider) {
    const [newProvider] = await this.db
      .insert(schema.aiProviders)
      .values(provider)
      .returning();
    return newProvider;
  }

  async updateProvider(id: number, updates: Partial<schema.AIProvider>) {
    const [updatedProvider] = await this.db
      .update(schema.aiProviders)
      .set(updates)
      .where(eq(schema.aiProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async deleteProvider(id: number) {
    const [provider] = await this.db
      .delete(schema.aiProviders)
      .where(eq(schema.aiProviders.id, id))
      .returning();
    return !!provider;
  }

  // Tool methods
  async getTool(id: number) {
    const [tool] = await this.db
      .select()
      .from(schema.tools)
      .where(eq(schema.tools.id, id));
    return tool;
  }

  async getToolByName(name: string) {
    const [tool] = await this.db
      .select()
      .from(schema.tools)
      .where(eq(schema.tools.name, name));
    return tool;
  }

  async getToolByEndpoint(endpoint: string) {
    const [tool] = await this.db
      .select()
      .from(schema.tools)
      .where(eq(schema.tools.endpoint, endpoint));
    return tool;
  }

  async getTools(activeOnly = false) {
    let query = this.db.select().from(schema.tools);
    if (activeOnly) {
      query = query.where(eq(schema.tools.active, true));
    }
    return await query;
  }

  async createTool(tool: schema.InsertTool) {
    const [newTool] = await this.db.insert(schema.tools).values(tool).returning();
    return newTool;
  }

  async updateTool(id: number, updates: Partial<schema.Tool>) {
    const [updatedTool] = await this.db
      .update(schema.tools)
      .set(updates)
      .where(eq(schema.tools.id, id))
      .returning();
    return updatedTool;
  }

  async deleteTool(id: number) {
    const [tool] = await this.db
      .delete(schema.tools)
      .where(eq(schema.tools.id, id))
      .returning();
    return !!tool;
  }

  // Chat methods
  async getChatSession(id: number) {
    const [session] = await this.db
      .select()
      .from(schema.chatSessions)
      .where(eq(schema.chatSessions.id, id));
    return session;
  }

  async getChatSessionsByUser(userId: number) {
    return await this.db
      .select()
      .from(schema.chatSessions)
      .where(eq(schema.chatSessions.userId, userId));
  }

  async createChatSession(session: schema.InsertChatSession) {
    const [newSession] = await this.db
      .insert(schema.chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateChatSession(id: number, updates: Partial<schema.ChatSession>) {
    const [updatedSession] = await this.db
      .update(schema.chatSessions)
      .set(updates)
      .where(eq(schema.chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteChatSession(id: number) {
    const [session] = await this.db
      .delete(schema.chatSessions)
      .where(eq(schema.chatSessions.id, id))
      .returning();
    return !!session;
  }

  async getChatMessages(sessionId: number) {
    return await this.db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.sessionId, sessionId))
      .orderBy(asc(schema.chatMessages.timestamp));
  }

  async createChatMessage(message: schema.InsertChatMessage) {
    const [newMessage] = await this.db
      .insert(schema.chatMessages)
      .values(message)
      .returning();

    // Update session updated time
    await this.db
      .update(schema.chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.chatSessions.id, message.sessionId));

    return newMessage;
  }
}