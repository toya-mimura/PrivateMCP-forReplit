# MCP Server

A Model Context Protocol (MCP) server implementation based on the [Model Context Protocol](https://modelcontextprotocol.io/) specification.

## Overview

This project implements a basic MCP server that can be used with compatible AI applications. It's primarily designed to be deployed on Replit.

## Features

- Authentication system
- API token management
- MCP protocol implementation
- Chat session management
- WebSocket support
- Provider integrations

## Setup on Replit

### Prerequisites

- A Replit account
- Replit Core subscription (recommended)
- API Key(s) of AI providers (such as Anthropic API, xAI API, etc)

### Installation

1. Fork/Clone/Remix this project on Replit
2. The dependencies will automatically install
3. Configure required environment variables in Replit Secrets:
   - `JWT_SECRET`: Secret for JWT token generation
   - `ANTHROPIC_API_KEY`: For Claude API access (if using Anthropic provider)
   - `OPENAI_API_KEY`: For OpenAI API access (if using OpenAI provider)

### Running the Server

Press the Run button in Replit to start the server. The server will be accessible at the URL provided by Replit.

## Usage with Claude Desktop App

To use this MCP server with the Claude Desktop app:

1. **Start the Server**: 
   - Ensure your MCP server is running on Replit
   - Verify it's accessible at your Replit project URL

2. **Create an Access Token**:
   - Log in to the web interface at your Replit project URL
   - Navigate to the tokens management section
   - Create a new access token with appropriate permissions (read, execute)
   - Save the full token value that is displayed (this is only shown once)

3. **Configure Claude Desktop**:
   - Open Claude Desktop app
   - Go to Settings
   - In the "MCP Servers" section, add a new server with:
     - Name: Your custom name (e.g., "My MCP Server")
     - URL: Your Replit project URL + `/api/mcp`
     - Token: Paste the access token you created in step 2

4. **Using MCP Server Tools**:
   - In a conversation with Claude, type "@" to access tools offered by your MCP server
   - The available tools should appear in a dropdown menu
   - Select a tool and follow the prompts to use it in your conversation

## Project Structure

- `/client`: Frontend application
- `/server`: Backend server implementation
- `/shared`: Shared types and utilities

## License

[MIT](https://opensource.org/licenses/MIT)