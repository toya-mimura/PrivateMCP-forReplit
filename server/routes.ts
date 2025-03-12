import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupMCPServer } from "./mcp";
import { setupProviderRoutes } from "./providers";
import { setupToolRoutes } from "./tools";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up provider management routes
  setupProviderRoutes(app);
  
  // Set up tool management routes
  setupToolRoutes(app);
  
  // Set up MCP server endpoints
  await setupMCPServer(app);
  
  // Access tokens management
  app.get("/api/tokens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const tokens = await storage.getTokensByUser(req.user.id);
      
      // Mask actual tokens for security
      const maskedTokens = tokens.map(token => {
        const { token: actualToken, ...rest } = token;
        return {
          ...rest,
          token: actualToken.substring(0, 8) + "..." + actualToken.substring(actualToken.length - 4)
        };
      });
      
      res.json(maskedTokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tokens" });
    }
  });
  
  app.post("/api/tokens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { name, expiry, permissions } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Token name is required" });
      }
      
      // Generate a token
      const tokenValue = randomUUID().replace(/-/g, "");
      
      // Calculate expiry date
      let expiresAt = null;
      if (expiry && parseInt(expiry) > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));
      }
      
      const newToken = await storage.createToken({
        userId: req.user.id,
        name,
        token: tokenValue,
        permissions: permissions || "read,execute",
        expiresAt
      });
      
      // Return the newly created token (including the actual token value)
      res.status(201).json({
        ...newToken,
        token: tokenValue // Return the full token only when first created
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create token" });
    }
  });
  
  app.post("/api/tokens/:id/revoke", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const token = await storage.getTokenById(id);
      
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }
      
      // Ensure user owns the token
      if (token.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.revokeToken(id);
      res.status(200).json({ message: "Token revoked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to revoke token" });
    }
  });
  
  // Chat session management
  app.get("/api/chats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const sessions = await storage.getChatSessionsByUser(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve chat sessions" });
    }
  });
  
  app.post("/api/chats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { title, providerId, model } = req.body;
      
      if (!providerId || !model) {
        return res.status(400).json({ message: "Provider ID and model are required" });
      }
      
      // Verify the provider exists
      const provider = await storage.getProvider(providerId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      const session = await storage.createChatSession({
        userId: req.user.id,
        title: title || "New Chat",
        providerId,
        model
      });
      
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });
  
  app.get("/api/chats/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getChatSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      // Ensure user owns the session
      if (session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get messages for this session
      const messages = await storage.getChatMessages(id);
      
      res.json({
        session,
        messages
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve chat session" });
    }
  });
  
  app.delete("/api/chats/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getChatSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      // Ensure user owns the session
      if (session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteChatSession(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chat session" });
    }
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle chat messages and other real-time events
        if (data.type === 'chat_message') {
          // Process chat message
          // For implementation later
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return httpServer;
}
