# Auth0 Agent Toolkit

This toolkit enables AI agent frameworks to interact with Auth0's Management API through function calling. Currently supports Model Context Protocol (MCP) implementation.

## Features

- Complete user management functionality:
  - Create users in Auth0
  - Get user details
  - Update user information
  - Delete users
- Input validation using Zod
- Comprehensive error handling with detailed responses
- Built on top of the official Auth0 Node.js SDK
- TypeScript support with full type definitions

## Installation

```bash
npm install auth0-agent-toolkit
```

## Configuration

The toolkit needs to be configured with your Auth0 credentials:

- Domain
- Client ID
- Client Secret

You can obtain these from your Auth0 dashboard. Make sure your application has the necessary permissions to manage users.

## Usage with MCP

```typescript
import { Auth0AgentToolkit } from 'auth0-agent-toolkit/modelcontextprotocol';

const auth0Toolkit = new Auth0AgentToolkit({
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Use with MCP server
const server = new MCPServer({
  functions: auth0Toolkit.getFunctions(),
});
```

### Available Functions

#### auth0_create_user

Creates a new user in Auth0:

- `email` (required): User's email address
- `password` (required): User's password (minimum 8 characters)
- `connection` (optional): Auth0 connection name (default: "Username-Password-Authentication")
- `verify_email` (optional): Whether to verify the user's email (default: false)
- `user_metadata` (optional): Additional user metadata
- `app_metadata` (optional): Additional app metadata

#### auth0_get_user

Retrieves user details:

- `id` (required): Auth0 user ID

#### auth0_update_user

Updates an existing user:

- `id` (required): Auth0 user ID
- `email` (optional): New email address
- `password` (optional): New password
- `verify_email` (optional): Whether to verify the new email
- `connection` (optional): Auth0 connection name
- `blocked` (optional): Whether the user is blocked
- `user_metadata` (optional): Additional user metadata
- `app_metadata` (optional): Additional app metadata

#### auth0_delete_user

Deletes a user:

- `id` (required): Auth0 user ID

## Environment Variables

```bash
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

## Error Handling

The toolkit provides detailed error messages for:
- Invalid parameters (with specific validation errors)
- Auth0 API errors
- Configuration issues

Each function returns a standardized response format:
```typescript
{
  content?: {
    // Success response data
  },
  error?: {
    message: string,
    details: any
  }
}
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
