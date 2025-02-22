# Auth0 MCP

[![NPM Version](https://img.shields.io/npm/v/auth0-mcp.svg)](https://www.npmjs.com/package/auth0-mcp)
[![License](https://img.shields.io/npm/l/auth0-mcp.svg)](https://github.com/yourusername/auth0-mcp/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A robust Model Context Protocol (MCP) server implementation for managing Auth0 users. This package provides a seamless integration between Auth0's Management API and MCP-compatible clients, making it perfect for AI agents and automation tools.

## 🌟 Features

- **Complete User Management**
  - List users with pagination
  - Create new users with validation
  - Get detailed user information
  - Update user profiles
  - Delete users
  
- **Enterprise-Ready**
  - Full TypeScript support
  - Comprehensive error handling
  - Input validation using Zod
  - Detailed logging and debugging
  - Production-ready security

## 📦 Installation

```bash
npm install auth0-mcp
```

## 🔧 Configuration

1. Create a `.env` file with your Auth0 credentials:

```env
# Required: Your Auth0 domain (e.g., your-tenant.auth0.com)
AUTH0_DOMAIN=your-domain.auth0.com

# Required: Your Auth0 Management API Client ID
AUTH0_CLIENT_ID=your-client-id

# Required: Your Auth0 Management API Client Secret
AUTH0_CLIENT_SECRET=your-client-secret

# Optional: Log level (debug, info, warn, error)
LOG_LEVEL=info

# Optional: Port number for HTTP server (default: 3000)
PORT=3000
```

2. Set up your Auth0 application:
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new Machine-to-Machine Application
   - Grant it the necessary permissions under APIs > Auth0 Management API:
     - `read:users`
     - `create:users`
     - `update:users`
     - `delete:users`

## 🚀 Quick Start

```typescript
import { Auth0MCP } from 'auth0-mcp';

const auth0Server = new Auth0MCP({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

auth0Server.start();
```

## 🤖 Using with AI Assistants

### Using with Claude in Windsurf

1. Install the MCP server:
```bash
npm install auth0-mcp
```

2. Create a new TypeScript file (e.g., `auth0-server.ts`):
```typescript
import { Auth0MCP } from 'auth0-mcp';
import { config } from 'dotenv';

config();

const server = new Auth0MCP({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

server.start().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
```

3. Start the server:
```bash
ts-node auth0-server.ts
```

4. In Windsurf, Claude can now use these tools:

```typescript
// List Users
{
  "tool": "auth0_list_users",
  "params": {
    "page": 0,
    "per_page": 10
  }
}

// Create User
{
  "tool": "auth0_create_user",
  "params": {
    "email": "user@example.com",
    "password": "securePassword123"
  }
}

// Get User
{
  "tool": "auth0_get_user",
  "params": {
    "id": "auth0|user_id"
  }
}
```

### Using with Other AI Assistants

The Auth0 MCP server follows the Model Context Protocol specification, making it compatible with any AI assistant that supports MCP. The tools and their parameters remain the same across different assistants.

Key points when using with AI assistants:

1. **Authentication**: Always use environment variables for Auth0 credentials
2. **Error Handling**: AI assistants will receive formatted error messages
3. **Rate Limiting**: The server handles Auth0 API rate limits
4. **Validation**: All inputs are validated before making API calls
5. **Logging**: Set `LOG_LEVEL` in .env for detailed debugging

## 📚 Available Tools

See [API Documentation](./docs/API.md) for detailed information about all available tools and their parameters.

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secrets management
   - Rotate credentials regularly
   - Use different credentials per environment

2. **Auth0 Configuration**
   - Use least privilege access
   - Enable MFA for dashboard access
   - Monitor API usage
   - Set up IP allowlisting

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT © [Auth0 MCP Contributors](LICENSE)
