
# MCP Server

A Model Context Protocol (MCP) server implementation that enables Large Language Models (LLMs) to securely access tools and data sources through a standardized API.

## Overview

This project implements a server that adheres to the [Model Context Protocol](https://modelcontextprotocol.io/) specification, allowing AI models like Claude to interact with tools, access data, and perform actions through a defined API.

## Features

- **Authentication System**: Secure user account management with session persistence
- **API Token Management**: Create and manage access tokens for secure API access
- **MCP Protocol Support**: Full implementation of the MCP protocol for AI tools
- **Chat Session Management**: Persistent chat sessions with message history
- **WebSocket Support**: Real-time communication capabilities
- **Provider Management**: Integration with various AI providers

## Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will be accessible at http://localhost:5000.

## Usage with Claude Desktop App

To use this MCP server with the Claude Desktop app:

1. **Start the Server**: Ensure your MCP server is running on port 5000
2. **Create an Access Token**:
   - Log in to the web interface at http://localhost:5000
   - Navigate to the tokens management section
   - Create a new token with appropriate permissions (read, execute)
   - Save the token value (shown only once)
3. **Configure Claude Desktop**:
   - Open Claude Desktop app
   - Go to Settings
   - In the "MCP Servers" section, add a new server with:
     - Name: Your custom name (e.g., "My MCP Server")
     - URL: http://localhost:5000/api/mcp
     - Token: Paste your access token
4. **Using the Tools**:
   - In a Claude conversation, type "@" to access available tools
   - Select a tool from the dropdown and follow the prompts

## Development

### Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express server
  - `/mcp`: MCP protocol implementation
  - `/auth.ts`: Authentication system
  - `/routes.ts`: API route definitions
  - `/tools.ts`: Tool management
- `/shared`: Shared types and schemas

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Update database schema

## License

[MIT](https://opensource.org/licenses/MIT)
