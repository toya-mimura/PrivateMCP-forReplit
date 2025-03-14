
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

### Required Secrets Configuration

Before running the server, you must configure the following secrets in Replit's Secrets tab:

**Required in all environments:**
- `SESSION_SECRET`: A secure random string for session encryption
- `JWT_SECRET`: A secure random string for JWT token generation
- `DATABASE_URL`: PostgreSQL connection string (get this from the Database tab in Replit)

**Note:** If `DATABASE_URL` is not set, the server will fall back to in-memory storage (not recommended for production).

**Required in production:**


## Database Management

### Setting up PostgreSQL

1. Open the Database tab in Replit
2. Click "Create Database" to provision a new PostgreSQL database
3. Copy the connection URL from the Database tab
4. Add it as `DATABASE_URL` in your project secrets

### Database Setup

1. Go to the "Database" tab in your Replit project
2. Click "Create Database" to create a new PostgreSQL database
3. The database connection URL will be automatically added to your project secrets as `DATABASE_URL`

### Running Migrations

The project uses Drizzle ORM for database management. When you make changes to the schema in `shared/schema.ts`, follow these steps:

1. Make your changes to the schema
2. Run the migration command:
   ```bash
   npm run db:push
   ```
3. Verify the changes in the Database tab

### Troubleshooting

- If you see "DATABASE_URL not set" in the logs, check that your database was created properly in the Database tab
- If you encounter connection errors, try:
  1. Refreshing the Replit environment
  2. Checking the Database tab to ensure the database is running
  3. Verifying the DATABASE_URL secret is set correctly

### Database Structure

The database schema includes the following tables:
- `users`: User accounts and authentication
- `access_tokens`: API access tokens
- `ai_providers`: AI provider configurations
- `tools`: Available MCP tools
- `chat_sessions`: User chat sessions
- `chat_messages`: Individual chat messages
- `sessions`: Express session storage

### Schema Migrations

Schema changes are managed using Drizzle ORM migrations:

1. Make changes to the schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes to the database
3. Review the changes in the Database tab

**Note:** Always backup your data before running migrations in production.

- `ADMIN_USERNAME`: Admin account username
- `ADMIN_PASSWORD`: Admin account password

**Optional Provider API Keys:**
- `ANTHROPIC_API_KEY`: For Claude API access
- `OPENAI_API_KEY`: For OpenAI API access
- Add other provider API keys as needed

To configure secrets:
1. Open your Repl
2. Go to the "Tools" tab
3. Select "Secrets"
4. Click "New Secret" for each required secret
5. Enter the key name and value
6. Click "Add Secret"

### Installation

1. Fork/Clone/Remix this project on Replit
2. Configure the required secrets as described above
3. The dependencies will automatically install

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
