import express, { Express } from 'express';
import { handleMCPRequest } from './handlers';
import { toolsRegistry } from './tools-registry';
import { storage } from '../storage';
import { MCPRequest, MCPResponse, MCPError } from './protocol';

// Set up the MCP endpoints
export async function setupMCPServer(app: Express) {
  // Load active tools from the database
  const activeTools = await storage.getTools(true);
  activeTools.forEach(tool => {
    toolsRegistry.registerFromDbTool(tool);
  });

  // MCP endpoint - for direct MCP protocol implementation
  app.post('/api/mcp', async (req, res) => {
    try {
      // Extract authorization token
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.query.token as string || '';

      if (!token) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'Authorization token is required'
        });
      }

      // Parse the MCP request
      const mcpRequest: MCPRequest = req.body;
      
      // Handle the MCP request
      const response = await handleMCPRequest(mcpRequest, token);

      // Check if it's an error response
      if ('error' in response) {
        const errorResponse = response as MCPError;
        return res.status(errorResponse.status || 500).json(errorResponse);
      }

      // Send the successful response
      const mcpResponse = response as MCPResponse;
      res.status(mcpResponse.status).json(mcpResponse);
    } catch (error: any) {
      console.error('MCP request error:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  });

  // WebSocket support for MCP (future implementation)
  // For now, just define the API path for direct HTTP requests
  app.post('/api/mcp/*', async (req, res) => {
    try {
      // Extract authorization token
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.query.token as string || '';

      if (!token) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'Authorization token is required'
        });
      }

      // Convert the REST-style request to an MCP request
      const path = req.path.replace('/api/mcp', '');
      const mcpRequest: MCPRequest = {
        method: req.method,
        path,
        data: req.body,
        headers: req.headers as Record<string, string>
      };

      // Handle the MCP request
      const response = await handleMCPRequest(mcpRequest, token);

      // Check if it's an error response
      if ('error' in response) {
        const errorResponse = response as MCPError;
        return res.status(errorResponse.status || 500).json(errorResponse);
      }

      // Send the successful response
      const mcpResponse = response as MCPResponse;
      res.status(mcpResponse.status).json(mcpResponse.data);
    } catch (error: any) {
      console.error('MCP path request error:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  });
}
