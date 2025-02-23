/**
 * @file Auth0 MCP Server Implementation
 * @description A Model Context Protocol server implementation for managing Auth0 users.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ManagementClient } from 'auth0';
import { z } from 'zod';

/** Configuration options for the Auth0 MCP server */
export interface Auth0Config {
  /** Auth0 domain (e.g., 'your-tenant.auth0.com') */
  domain: string;
  /** Auth0 client ID for the Management API */
  clientId: string;
  /** Auth0 client secret for the Management API */
  clientSecret: string;
}

/** Auth0 MCP Server class that provides user management functionality through MCP */
export class Auth0MCP extends McpServer {
  private readonly client: ManagementClient;

  constructor(config: Auth0Config) {
    super({
      name: 'Auth0',
      version: '1.0.0',
      description: 'Auth0 User Management API',
    });

    this.client = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    this.registerTools();
    this.registerCreateApplicationTool();
    this.registerListApplicationsTool();
    this.registerDeleteApplicationTool();
    this.registerUpdateRoleTool();
    this.registerListRolesTool();
    this.registerGetApplicationTool();
    this.registerUpdateApplicationTool();
    this.registerAssignRolesToUserTool();
    this.registerRemoveRolesFromUserTool();
  }

  private registerCreateApplicationTool(): void {
    this.tool(
      'auth0_create_application',
      {
        name: z.string().describe('Name of the application'),
        app_type: z.string().default('regular_web').describe('Type of the application'),
      },
      async (params) => {
        try {
          const response = await this.client.clients.create({
            name: params.name,
            app_type: params.app_type as 'regular_web' | 'native' | 'spa' | 'non_interactive',
          });

          const application = response.data;
          return {
            content: [{ type: 'text', text: JSON.stringify(application, null, 2) }],
          };
        } catch (error) {
          throw this.formatError('Failed to create application', error);
        }
      }
    );
  }

  private registerListApplicationsTool(): void {
    this.tool('auth0_list_applications', {}, async () => {
      try {
        const response = await this.client.clients.getAll();
        const applications = response.data;
        return {
          content: [{ type: 'text', text: JSON.stringify(applications, null, 2) }],
        };
      } catch (error) {
        throw this.formatError('Failed to list applications', error);
      }
    });
  }

  private registerListRolesTool(): void {
    this.tool('auth0_list_roles', {}, async () => {
      try {
        const roles = await this.client.roles.getAll();
        return { content: [{ type: 'text', text: JSON.stringify(roles, null, 2) }] };
      } catch (error) {
        throw this.formatError('Failed to list roles', error);
      }
    });
  }

  private registerUpdateRoleTool(): void {
    this.tool(
      'auth0_update_role',
      {
        id: z.string().describe('Role ID'),
        name: z.string().optional().describe('New name of the role'),
        description: z.string().optional().describe('New description of the role'),
      },
      async (params) => {
        try {
          const { id, ...updateData } = params;
          const role = await this.client.roles.update({ id }, updateData);
          return { content: [{ type: 'text', text: JSON.stringify(role, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to update role', error);
        }
      }
    );
  }

  private registerGetApplicationTool(): void {
    this.tool(
      'auth0_get_application',
      {
        client_id: z.string().describe('Client ID of the application'),
      },
      async (params) => {
        try {
          const application = await this.client.clients.get({ client_id: params.client_id });
          return { content: [{ type: 'text', text: JSON.stringify(application, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to get application details', error);
        }
      }
    );
  }

  private registerUpdateApplicationTool(): void {
    this.tool(
      'auth0_update_application',
      {
        client_id: z.string().describe('Client ID of the application'),
        name: z.string().optional().describe('New name of the application'),
        app_type: z.string().optional().describe('New type of the application'),
      },
      async (params) => {
        try {
          const { client_id, ...updateData } = params;
          const application = await this.client.clients.update(
            { client_id },
            {
              ...updateData,
              app_type: updateData.app_type as 'regular_web' | 'native' | 'spa' | 'non_interactive',
            }
          );
          return { content: [{ type: 'text', text: JSON.stringify(application, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to update application', error);
        }
      }
    );
  }

  private registerDeleteApplicationTool(): void {
    this.tool(
      'auth0_delete_application',
      {
        client_id: z.string().describe('Client ID of the application'),
      },
      async (params) => {
        try {
          await this.client.clients.delete({ client_id: params.client_id });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { success: true, message: 'Application deleted successfully' },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw this.formatError('Failed to delete application', error);
        }
      }
    );
  }
  private registerTools(): void {
    this.registerListUsersTools();
    this.registerCreateUserTool();
    this.registerGetUserTool();
    this.registerUpdateUserTool();
    this.registerDeleteUserTool();
  }

  private registerListUsersTools(): void {
    this.tool(
      'auth0_list_users',
      {
        page: z.number().describe('Page number for pagination').default(0),
        per_page: z.number().min(1).max(100).describe('Number of users per page').default(50),
        include_totals: z.boolean().describe('Include total count in response').default(true),
      },
      async (params) => {
        try {
          // Explicitly type and cast the parameters
          const requestParams: {
            page: number;
            per_page: number;
            include_totals: true;
          } = {
            page: Number(params.page),
            per_page: Number(params.per_page),
            include_totals: true,
          };

          const users = await this.client.users.getAll(requestParams);
          return { content: [{ type: 'text', text: JSON.stringify(users, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to list users', error);
        }
      }
    );
  }

  private registerCreateUserTool(): void {
    this.tool(
      'auth0_create_user',
      {
        email: z.string().email().describe("User's email address"),
        password: z.string().min(8).describe("User's password (min 8 characters)"),
        connection: z.string().default('Username-Password-Authentication'),
        verify_email: z.boolean().default(false),
        user_metadata: z.record(z.any()).optional(),
      },
      async (params) => {
        try {
          const existingUsers = await this.client.users.getAll({
            q: `email:"${params.email}"`,
            per_page: 1,
          });

          if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    { ...existingUsers[0], _note: 'User already exists' },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          const user = await this.client.users.create(params);
          return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to create user', error);
        }
      }
    );
  }

  private registerGetUserTool(): void {
    this.tool(
      'auth0_get_user',
      {
        id: z.string().min(1).describe('Auth0 user ID'),
      },
      async (params) => {
        try {
          const user = await this.client.users.get({ id: params.id });
          return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to get user', error);
        }
      }
    );
  }

  private registerUpdateUserTool(): void {
    this.tool(
      'auth0_update_user',
      {
        id: z.string().min(1).describe('Auth0 user ID'),
        email: z.string().email().optional(),
        verify_email: z.boolean().optional(),
        password: z.string().min(8).optional(),
        blocked: z.boolean().optional(),
        user_metadata: z.record(z.any()).optional(),
      },
      async (params) => {
        try {
          const { id, ...updateData } = params;
          const user = await this.client.users.update({ id }, updateData);
          return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
        } catch (error) {
          throw this.formatError('Failed to update user', error);
        }
      }
    );
  }

  private registerDeleteUserTool(): void {
    this.tool(
      'auth0_delete_user',
      {
        id: z.string().min(1).describe('Auth0 user ID'),
      },
      async (params) => {
        try {
          await this.client.users.delete({ id: params.id });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { success: true, message: 'User deleted successfully' },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw this.formatError('Failed to delete user', error);
        }
      }
    );
  }

  private registerAssignRolesToUserTool(): void {
    this.tool(
      'auth0_assign_roles_to_user',
      {
        user_id: z.string().describe('User ID'),
        roles: z.array(z.string()).describe('Array of role IDs to assign'),
      },
      async (params) => {
        try {
          await this.client.users.assignRoles({ id: params.user_id }, { roles: params.roles });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { success: true, message: 'Roles assigned to user successfully' },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw this.formatError('Failed to assign roles to user', error);
        }
      }
    );
  }

  private registerRemoveRolesFromUserTool(): void {
    this.tool(
      'auth0_remove_roles_from_user',
      {
        user_id: z.string().describe('User ID'),
        roles: z.array(z.string()).describe('Array of role IDs to remove'),
      },
      async (params) => {
        try {
          await this.client.users.deleteRoles({ id: params.user_id }, { roles: params.roles });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { success: true, message: 'Roles removed from user successfully' },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw this.formatError('Failed to remove roles from user', error);
        }
      }
    );
  }

  private formatError(message: string, error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`${message}: ${error.message}`);
    }
    return new Error(`${message}: ${String(error)}`);
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.connect(transport);
    // Remove console.log to avoid interfering with MCP protocol
  }
}
