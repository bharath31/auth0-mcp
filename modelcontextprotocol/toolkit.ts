import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ManagementClient } from 'auth0';
import { z } from 'zod';

// Auth0 Configuration type
interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
}

// Auth0 response types
interface Auth0User {
  user_id: string;
  email: string;
  email_verified: boolean;
  username?: string;
  created_at: string;
  updated_at: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  blocked?: boolean;
  [key: string]: any;
}

export class Auth0AgentToolkit extends McpServer {
  private readonly client: ManagementClient;

  constructor(config: Auth0Config) {
    super({
      name: 'Auth0',
      version: '0.1.0',
      description: 'Auth0 User Management API'
    });

    this.client = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    // List Users Tool
    this.tool(
      'auth0_list_users',
      {
        page: z.number().default(0),
        per_page: z.number().default(50),
        include_totals: z.boolean().default(true),
      },
      async (params) => {
        const users = await this.client.users.getAll(params);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(users)
          }]
        };
      }
    );

    // Create User Tool
    this.tool(
      'auth0_create_user',
      {
        email: z.string().email(),
        password: z.string().min(8),
        connection: z.string().default('Username-Password-Authentication'),
        verify_email: z.boolean().default(false),
        user_metadata: z.record(z.any()).optional(),
        app_metadata: z.record(z.any()).optional(),
      },
      async (params) => {
        // Check for existing user first
        const existingUsers = await this.client.users.getAll({
          q: `email:"${params.email}"`,
          per_page: 1,
        });

        let response;
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          response = {
            ...existingUser,
            _note: 'User already existed'
          };
        } else {
          response = await this.client.users.create(params);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response)
          }]
        };
      }
    );

    // Get User Tool
    this.tool(
      'auth0_get_user',
      {
        id: z.string().min(1),
      },
      async (params) => {
        const user = await this.client.users.get({ id: params.id });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(user)
          }]
        };
      }
    );

    // Update User Tool
    this.tool(
      'auth0_update_user',
      {
        id: z.string().min(1),
        email: z.string().email().optional(),
        verify_email: z.boolean().optional(),
        password: z.string().min(8).optional(),
        connection: z.string().optional(),
        blocked: z.boolean().optional(),
        user_metadata: z.record(z.any()).optional(),
        app_metadata: z.record(z.any()).optional(),
      },
      async (params) => {
        const { id, ...updateData } = params;
        const user = await this.client.users.update({ id }, updateData);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(user)
          }]
        };
      }
    );

    // Delete User Tool
    this.tool(
      'auth0_delete_user',
      {
        id: z.string().min(1),
      },
      async (params) => {
        await this.client.users.delete({ id: params.id });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'User deleted successfully'
            })
          }]
        };
      }
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.connect(transport);
    console.log('Auth0 MCP Server initialized and ready to accept commands');
  }
}
