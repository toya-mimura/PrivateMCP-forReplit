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

1. **Start the Server**: Ensure your MCP server is running on Replit
2. **Create an Access Token**:
   - Log in to the web interface
   - Navigate to the tokens management section
   - Create a new token with appropriate permissions
3. **Configure Claude Desktop**:
   - Open Claude Desktop app
   - Go to Settings
   - In the "MCP Servers" section, add a new server with:
     - Name: Your custom name
     - URL: Your Replit project URL + `/api/mcp`
     - Token: Your access token

## Project Structure

- `/client`: Frontend application
- `/server`: Backend server implementation
- `/shared`: Shared types and utilities

## License

[MIT](https://opensource.org/licenses/MIT)