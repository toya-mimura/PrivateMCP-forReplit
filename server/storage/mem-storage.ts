
import { Store } from 'express-session';
import createMemoryStore from 'memorystore';
import session from 'express-session';
import {
  User, InsertUser,
  AccessToken, InsertAccessToken,
  AIProvider, InsertAIProvider,
  Tool, InsertTool,
  ChatSession, InsertChatSession,
  ChatMessage, InsertChatMessage
} from '@shared/schema';
import { IStorage } from './interface';

const MemoryStore = createMemoryStore(session);

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

  // Rest of the implementation from the original storage.ts file...
}
