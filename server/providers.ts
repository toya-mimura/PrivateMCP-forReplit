import { Express } from "express";
import { storage } from "./storage";
import { InsertAIProvider } from "@shared/schema";
import { randomUUID } from "crypto";

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function setupProviderRoutes(app: Express) {
  // Get all providers
  app.get("/api/providers", ensureAuthenticated, async (req, res) => {
    try {
      const providers = await storage.getProviders();
      
      // Mask API keys for security
      const maskedProviders = providers.map(provider => {
        const { apiKey, ...rest } = provider;
        return {
          ...rest,
          apiKey: "••••••••••••••••" + apiKey.slice(-4),
          hasKey: true
        };
      });
      
      res.json(maskedProviders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve providers" });
    }
  });

  // Get provider by ID
  app.get("/api/providers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Mask API key for security
      const { apiKey, ...rest } = provider;
      const maskedProvider = {
        ...rest,
        apiKey: "••••••••••••••••" + apiKey.slice(-4),
        hasKey: true
      };
      
      res.json(maskedProvider);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve provider" });
    }
  });

  // Create new provider
  app.post("/api/providers", ensureAuthenticated, async (req, res) => {
    try {
      const { name, provider, apiKey, active } = req.body;
      
      // Validate required fields
      if (!name || !provider || !apiKey) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check for duplicate name
      const existing = await storage.getProviderByName(name);
      if (existing) {
        return res.status(400).json({ message: "Provider with this name already exists" });
      }
      
      const newProvider: InsertAIProvider = {
        name,
        provider,
        apiKey,
        active: active !== undefined ? active : true
      };
      
      const created = await storage.createProvider(newProvider);
      
      // Mask API key in response
      const { apiKey: createdApiKey, ...rest } = created;
      res.status(201).json({
        ...rest,
        apiKey: "••••••••••••••••" + createdApiKey.slice(-4),
        hasKey: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  // Update provider
  app.put("/api/providers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, provider, apiKey, active } = req.body;
      
      // Verify provider exists
      const existingProvider = await storage.getProvider(id);
      if (!existingProvider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Only update provided fields
      const updates: Partial<InsertAIProvider> = {};
      if (name !== undefined) updates.name = name;
      if (provider !== undefined) updates.provider = provider;
      if (apiKey !== undefined) updates.apiKey = apiKey;
      if (active !== undefined) updates.active = active;
      
      const updated = await storage.updateProvider(id, updates);
      
      // Mask API key in response
      const { apiKey: updatedApiKey, ...rest } = updated!;
      res.json({
        ...rest,
        apiKey: "••••••••••••••••" + updatedApiKey.slice(-4),
        hasKey: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update provider" });
    }
  });

  // Delete provider
  app.delete("/api/providers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify provider exists
      const existingProvider = await storage.getProvider(id);
      if (!existingProvider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      await storage.deleteProvider(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete provider" });
    }
  });

  // Test connection to AI provider
  app.post("/api/providers/:id/test", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { message = "Hello, this is a test message." } = req.body;
      
      // Get provider
      const provider = await storage.getProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      if (!provider.active) {
        return res.status(400).json({
          success: false,
          message: "Provider is not active"
        });
      }
      
      if (!provider.apiKey) {
        return res.status(400).json({
          success: false,
          message: "Provider has no API key configured"
        });
      }
      
      // Get first available model for this provider
      const models = getAvailableModels(provider.provider);
      if (models.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No models available for this provider"
        });
      }
      
      // Use the first available model
      const model = models[0].id;
      
      // Import the AI module dynamically to avoid circular dependencies
      const { generateAIResponse } = await import('./ai');
      
      // Generate a test response
      const response = await generateAIResponse(
        provider.id,
        model,
        [
          { role: 'system', content: 'You are a helpful assistant responding to a test message.' },
          { role: 'user', content: message }
        ]
      );
      
      res.json({
        success: true,
        message: "Connection test successful",
        available_models: models,
        test_response: response
      });
    } catch (error) {
      console.error("Error testing provider:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed"
      });
    }
  });
}

// Helper function to return available models based on provider
function getAvailableModels(provider: string) {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return [
        { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet", description: "Balanced performance and speed" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Highest capability model" },
        { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced performance and speed" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast and cost-effective" }
      ];
    case 'openai':
      return [
        { id: "gpt-4o", name: "GPT-4o", description: "Latest model with enhanced capabilities" },
        { id: "gpt-4", name: "GPT-4", description: "Advanced reasoning model" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and efficient" }
      ];
    default:
      return [];
  }
}
