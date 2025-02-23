import { ManagementClient } from 'auth0';
import { McpServer } from './server';

export class Auth0McpServer extends McpServer {
  private auth0: ManagementClient | null = null;

  protected async initialize(): Promise<void> {
    try {
      // Call parent class's initialize method
      await super.initialize();
      
      console.error('Initializing Auth0 MCP server...');
      // Register Auth0 tools
      this.registerTool({
        name: 'auth0_auth0_list_users',
        description: 'List users in Auth0',
        parameters: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number' },
            per_page: { type: 'number', description: 'Number of users per page' },
            include_totals: { type: 'boolean', description: 'Include total count' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['domain', 'token']
        },
        handler: async (params: any) => {
          try {
            // Create a new client for each request
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const response: any = await this.auth0.users.getAll({
              page: params.page || 0,
              per_page: params.per_page || 50,
              include_totals: params.include_totals || true
            });
            
            // Handle response structure
            const users = response?.data?.users;
            if (!users || !Array.isArray(users)) {
              throw new Error('Invalid response from Auth0 API');
            }
            
            // Extract just the fields we need
            const formattedUsers = users.map((user: any) => ({
              user_id: user.user_id,
              email: user.email,
              name: user.name,
              created_at: user.created_at,
              last_login: user.last_login
            }));

            // Clean up Auth0 client
            this.auth0 = null;

            return {
              users: formattedUsers,
              total: response.data.total || users.length
            };
          } catch (error) {
            throw error;
          }
        }
      });

      // User Management Tools
      this.registerTool({
        name: 'auth0_list_users',
        description: 'List users in Auth0',
        parameters: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number' },
            per_page: { type: 'number', description: 'Number of users per page' },
            include_totals: { type: 'boolean', description: 'Include total count' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const response = await this.auth0.users.getAll({
              page: params.page || 0,
              per_page: params.per_page || 50,
              include_totals: params.include_totals || true
            });
            
            const users = response?.data?.users;
            if (!users || !Array.isArray(users)) {
              throw new Error('Invalid response from Auth0 API');
            }
            
            const formattedUsers = users.map((user: any) => ({
              user_id: user.user_id,
              email: user.email,
              name: user.name,
              created_at: user.created_at,
              last_login: user.last_login,
              logins_count: user.logins_count
            }));

            this.auth0 = null;
            return { users: formattedUsers, total: response.data.total || users.length };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_create_user',
        description: 'Create a new user in Auth0',
        parameters: {
          type: 'object',
          properties: {
            email: { type: 'string', description: "User's email address" },
            password: { type: 'string', description: "User's password (min 8 characters)" },
            connection: { type: 'string', description: 'Auth0 connection name' },
            verify_email: { type: 'boolean', description: 'Whether to verify email' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['email', 'password', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const existingUsers = await this.auth0.users.getAll({
              q: `email:"${params.email}"`,
              per_page: 1,
            });

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
              return { user: existingUsers[0], message: 'User already exists' };
            }

            const user = await this.auth0.users.create({
              email: params.email,
              password: params.password,
              connection: params.connection || 'Username-Password-Authentication',
              verify_email: params.verify_email || false
            });

            this.auth0 = null;
            return { user };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_get_user',
        description: 'Get user details by ID',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Auth0 user ID' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['id', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const user = await this.auth0.users.get({ id: params.id });
            this.auth0 = null;
            return { user };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_update_user',
        description: 'Update user properties',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Auth0 user ID' },
            email: { type: 'string', description: 'New email address' },
            verify_email: { type: 'boolean', description: 'Whether to verify new email' },
            password: { type: 'string', description: 'New password (min 8 characters)' },
            blocked: { type: 'boolean', description: 'Whether to block the user' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['id', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const { id, domain, token, ...updateData } = params;
            const user = await this.auth0.users.update({ id }, updateData);
            this.auth0 = null;
            return { user };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_delete_user',
        description: 'Delete a user',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Auth0 user ID' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['id', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            await this.auth0.users.delete({ id: params.id });
            this.auth0 = null;
            return { message: 'User deleted successfully' };
          } catch (error) {
            throw error;
          }
        }
      });

      // Application Management Tools
      this.registerTool({
        name: 'auth0_create_application',
        description: 'Create a new application',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the application' },
            app_type: { type: 'string', description: 'Type of the application' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['name', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const response = await this.auth0.clients.create({
              name: params.name,
              app_type: params.app_type || 'regular_web'
            });

            this.auth0 = null;
            return { application: response.data };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_list_applications',
        description: 'List all applications',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const response = await this.auth0.clients.getAll();
            this.auth0 = null;
            return { applications: response.data };
          } catch (error) {
            throw error;
          }
        }
      });

      // Role Management Tools
      this.registerTool({
        name: 'auth0_list_roles',
        description: 'List all roles',
        parameters: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            const roles = await this.auth0.roles.getAll();
            this.auth0 = null;
            return { roles };
          } catch (error) {
            throw error;
          }
        }
      });

      this.registerTool({
        name: 'auth0_assign_roles_to_user',
        description: 'Assign roles to a user',
        parameters: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'Auth0 user ID' },
            roles: { type: 'array', description: 'Array of role IDs to assign' },
            domain: { type: 'string', description: 'Auth0 domain' },
            token: { type: 'string', description: 'Auth0 management API token' }
          },
          required: ['user_id', 'roles', 'domain', 'token']
        },
        handler: async (params: any) => {
          try {
            this.auth0 = new ManagementClient({
              domain: params.domain,
              token: params.token
            });

            await this.auth0.users.assignRoles(
              { id: params.user_id },
              { roles: params.roles }
            );

            this.auth0 = null;
            return { message: 'Roles assigned successfully' };
          } catch (error) {
            throw error;
          }
        }
      });
    } catch (error) {
      console.error('Error initializing server:', error);
      throw error;
    }
  }

  public async start(port: number = 3000): Promise<void> {
    // Initialize server
    await this.initialize();

    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.error(`Server listening on port ${port}`);
        resolve();
      });
    });
  }

  protected async executeQuery(_query: string): Promise<any> {
    throw new Error('Direct query execution is not supported');
  }
}
