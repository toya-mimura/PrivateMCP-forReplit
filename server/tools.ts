import { Express } from "express";
import { storage } from "./storage";
import { InsertTool } from "@shared/schema";

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function setupToolRoutes(app: Express) {
  // Get all tools
  app.get("/api/tools", ensureAuthenticated, async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const tools = await storage.getTools(activeOnly);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tools" });
    }
  });

  // Get tool by ID
  app.get("/api/tools/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getTool(id);
      
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tool" });
    }
  });

  // Create new tool
  app.post("/api/tools", ensureAuthenticated, async (req, res) => {
    try {
      const { name, description, type, endpoint, active, config } = req.body;
      
      // Validate required fields
      if (!name || !description || !type || !endpoint) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check for duplicate name
      const existingByName = await storage.getToolByName(name);
      if (existingByName) {
        return res.status(400).json({ message: "Tool with this name already exists" });
      }
      
      // Check for duplicate endpoint
      const existingByEndpoint = await storage.getToolByEndpoint(endpoint);
      if (existingByEndpoint) {
        return res.status(400).json({ message: "Tool with this endpoint already exists" });
      }
      
      const newTool: InsertTool = {
        name,
        description,
        type,
        endpoint,
        active: active !== undefined ? active : true,
        config: config || null
      };
      
      const created = await storage.createTool(newTool);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  // Update tool
  app.put("/api/tools/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, type, endpoint, active, config } = req.body;
      
      // Verify tool exists
      const existingTool = await storage.getTool(id);
      if (!existingTool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      // Only update provided fields
      const updates: Partial<InsertTool> = {};
      if (name !== undefined) {
        // Check for duplicate name if changing
        if (name !== existingTool.name) {
          const existingByName = await storage.getToolByName(name);
          if (existingByName) {
            return res.status(400).json({ message: "Tool with this name already exists" });
          }
        }
        updates.name = name;
      }
      
      if (endpoint !== undefined) {
        // Check for duplicate endpoint if changing
        if (endpoint !== existingTool.endpoint) {
          const existingByEndpoint = await storage.getToolByEndpoint(endpoint);
          if (existingByEndpoint) {
            return res.status(400).json({ message: "Tool with this endpoint already exists" });
          }
        }
        updates.endpoint = endpoint;
      }
      
      if (description !== undefined) updates.description = description;
      if (type !== undefined) updates.type = type;
      if (active !== undefined) updates.active = active;
      if (config !== undefined) updates.config = config;
      
      const updated = await storage.updateTool(id, updates);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  // Delete tool
  app.delete("/api/tools/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify tool exists
      const existingTool = await storage.getTool(id);
      if (!existingTool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      await storage.deleteTool(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });
}
