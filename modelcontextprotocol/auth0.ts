import { ManagementClient } from 'auth0';
import { z } from 'zod';
import { MCPFunction, MCPFunctionDefinition, MCPFunctionResponse } from './types';
import { Auth0User } from './auth0-types';

// Schema for Auth0 configuration
const Auth0ConfigSchema = z.object({
  domain: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
});

// Schema for user creation parameters
const CreateUserParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  connection: z.string().default('Username-Password-Authentication'),
  verify_email: z.boolean().default(false),
  user_metadata: z.record(z.any()).optional(),
  app_metadata: z.record(z.any()).optional(),
});

// Schema for user update parameters
const UpdateUserParamsSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  verify_email: z.boolean().optional(),
  user_metadata: z.record(z.any()).optional(),
  app_metadata: z.record(z.any()).optional(),
  connection: z.string().optional(),
  password: z.string().min(8).optional(),
  blocked: z.boolean().optional(),
});

const CreateRoleParamsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const AssignRoleParamsSchema = z.object({
  user_id: z.string(),
  roles: z.array(z.string()),
});

// Schema for get user parameters
const GetUserParamsSchema = z.object({
  id: z.string(),
});

// Schema for delete user parameters
const DeleteUserParamsSchema = z.object({
  id: z.string(),
});

export class Auth0AgentToolkit {
  private managementClient: ManagementClient;

  constructor(config: z.infer<typeof Auth0ConfigSchema>) {
    const validatedConfig = Auth0ConfigSchema.parse(config);

    this.managementClient = new ManagementClient({
      domain: validatedConfig.domain,
      clientId: validatedConfig.clientId,
      clientSecret: validatedConfig.clientSecret,
    });
  }

  // Function to create a new user
  public createUser: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = CreateUserParamsSchema.parse(params);

      const user = (await this.managementClient.users.create(
        validatedParams
      )) as unknown as Auth0User;

      return {
        content: {
          user_id: user.user_id,
          email: user.email,
          created_at: user.created_at,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to create user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to get a user
  public getUser: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = GetUserParamsSchema.parse(params);

      const user = (await this.managementClient.users.get({
        id: validatedParams.id,
      })) as unknown as Auth0User;

      return {
        content: {
          user_id: user.user_id,
          email: user.email,
          created_at: user.created_at,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
          blocked: user.blocked,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to get user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to update a user
  public updateUser: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = UpdateUserParamsSchema.parse(params);
      const { id, ...updateData } = validatedParams;

      const user = (await this.managementClient.users.update(
        { id },
        updateData
      )) as unknown as Auth0User;

      return {
        content: {
          user_id: user.user_id,
          email: user.email,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to update user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to delete a user
  public deleteUser: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = DeleteUserParamsSchema.parse(params);

      await this.managementClient.users.delete({ id: validatedParams.id });

      return {
        content: {
          success: true,
          message: 'User deleted successfully',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to delete user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to create a new role
  public createRole: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = CreateRoleParamsSchema.parse(params);

      const response = await this.managementClient.roles.create(validatedParams);
      const role = response.data;

      return {
        content: {
          id: role.id,
          name: role.name,
          description: role.description,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to create role',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to list roles
  public listRoles: MCPFunction = async (): Promise<MCPFunctionResponse> => {
    try {
      const response = await this.managementClient.roles.getAll();
      const roles = response.data;
      return {
        content: roles.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
        })),
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to list roles',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to delete a role
  public deleteRole: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = z.object({ id: z.string() }).parse(params);

      await this.managementClient.roles.delete({ id: validatedParams.id });

      return {
        content: {
          success: true,
          message: 'Role deleted successfully',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to delete role',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to assign roles to a user
  public assignRolesToUser: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = AssignRoleParamsSchema.parse(params);

      await this.managementClient.users.assignRoles(
        { id: validatedParams.user_id },
        { roles: validatedParams.roles }
      );

      return {
        content: {
          success: true,
          message: 'Roles assigned to user successfully',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to assign roles to user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to remove roles from a user
  public removeRolesFromUser: MCPFunction = async (
    params: unknown
  ): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = AssignRoleParamsSchema.parse(params);

      await this.managementClient.users.deleteRoles(
        { id: validatedParams.user_id },
        { roles: validatedParams.roles }
      );

      return {
        content: {
          success: true,
          message: 'Roles removed from user successfully',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to remove roles from user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function definitions
  public createUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_create_user',
    description: 'Create a new user in Auth0',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the user',
        },
        password: {
          type: 'string',
          description: 'Password for the user (minimum 8 characters)',
        },
        connection: {
          type: 'string',
          description: 'Name of the connection to use for the user',
          default: 'Username-Password-Authentication',
        },
        verify_email: {
          type: 'boolean',
          description: "Whether to verify the user's email",
          default: false,
        },
        user_metadata: {
          type: 'object',
          description: 'Additional user metadata',
          additionalProperties: true,
        },
        app_metadata: {
          type: 'object',
          description: 'Additional app metadata',
          additionalProperties: true,
        },
      },
      required: ['email', 'password'],
    },
  };

  public getUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_get_user',
    description: 'Get user details from Auth0',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Auth0 user ID',
        },
      },
      required: ['id'],
    },
  };

  public updateUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_update_user',
    description: 'Update an existing user in Auth0',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Auth0 user ID',
        },
        email: {
          type: 'string',
          description: 'New email address',
        },
        verify_email: {
          type: 'boolean',
          description: 'Whether to verify the new email',
        },
        password: {
          type: 'string',
          description: 'New password (minimum 8 characters)',
        },
        connection: {
          type: 'string',
          description: 'Name of the connection',
        },
        blocked: {
          type: 'boolean',
          description: 'Whether the user is blocked',
        },
        user_metadata: {
          type: 'object',
          description: 'Additional user metadata',
          additionalProperties: true,
        },
        app_metadata: {
          type: 'object',
          description: 'Additional app metadata',
          additionalProperties: true,
        },
      },
      required: ['id'],
    },
  };

  public deleteUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_delete_user',
    description: 'Delete a user from Auth0',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Auth0 user ID',
        },
      },
      required: ['id'],
    },
  };

  // Function to create a new application
  public createApplication: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = z
        .object({
          name: z.string(),
          app_type: z.string().default('regular_web'),
        })
        .parse(params);

      const response = await this.managementClient.clients.create({
        name: validatedParams.name,
        app_type: validatedParams.app_type as 'regular_web' | 'native' | 'spa' | 'non_interactive',
      });

      const application = response.data;
      return {
        content: {
          client_id: application.client_id,
          name: application.name,
          app_type: application.app_type,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to create application',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to list applications
  public listApplications: MCPFunction = async (): Promise<MCPFunctionResponse> => {
    try {
      const response = await this.managementClient.clients.getAll();
      const applications = response.data;
      return {
        content: applications.map((app) => ({
          client_id: app.client_id,
          name: app.name,
          app_type: app.app_type,
        })),
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to list applications',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function to delete an application
  public deleteApplication: MCPFunction = async (params: unknown): Promise<MCPFunctionResponse> => {
    try {
      const validatedParams = z
        .object({
          client_id: z.string(),
        })
        .parse(params);

      await this.managementClient.clients.delete({ client_id: validatedParams.client_id });

      return {
        content: {
          success: true,
          message: 'Application deleted successfully',
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            message: 'Invalid parameters provided',
            details: error.errors,
          },
        };
      }

      return {
        error: {
          message: 'Failed to delete application',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

  // Function definitions for applications
  public createApplicationDefinition: MCPFunctionDefinition = {
    name: 'auth0_create_application',
    description: 'Create a new Auth0 application',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the application',
        },
        app_type: {
          type: 'string',
          description: 'Type of the application',
          default: 'regular_web',
        },
      },
      required: ['name'],
    },
  };

  public listApplicationsDefinition: MCPFunctionDefinition = {
    name: 'auth0_list_applications',
    description: 'List all Auth0 applications',
    parameters: {
      type: 'object',
      properties: {},
    },
  };

  public deleteApplicationDefinition: MCPFunctionDefinition = {
    name: 'auth0_delete_application',
    description: 'Delete an Auth0 application',
    parameters: {
      type: 'object',
      properties: {
        client_id: {
          type: 'string',
          description: 'Client ID of the application',
        },
      },
      required: ['client_id'],
    },
  };

  public createRoleDefinition: MCPFunctionDefinition = {
    name: 'auth0_create_role',
    description: 'Create a new role in Auth0',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the role',
        },
        description: {
          type: 'string',
          description: 'Description of the role',
        },
      },
      required: ['name'],
    },
  };

  public listRolesDefinition: MCPFunctionDefinition = {
    name: 'auth0_list_roles',
    description: 'List all roles in Auth0',
    parameters: {
      type: 'object',
      properties: {},
    },
  };

  public deleteRoleDefinition: MCPFunctionDefinition = {
    name: 'auth0_delete_role',
    description: 'Delete a role from Auth0',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Role ID',
        },
      },
      required: ['id'],
    },
  };

  public assignRolesToUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_assign_roles_to_user',
    description: 'Assign roles to a user in Auth0',
    parameters: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID',
        },
        roles: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of role IDs to assign',
        },
      },
      required: ['user_id', 'roles'],
    },
  };

  public removeRolesFromUserDefinition: MCPFunctionDefinition = {
    name: 'auth0_remove_roles_from_user',
    description: 'Remove roles from a user in Auth0',
    parameters: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID',
        },
        roles: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of role IDs to remove',
        },
      },
      required: ['user_id', 'roles'],
    },
  };

  public getFunctions(): [MCPFunctionDefinition, MCPFunction][] {
    return [
      [this.createUserDefinition, this.createUser],
      [this.getUserDefinition, this.getUser],
      [this.updateUserDefinition, this.updateUser],
      [this.deleteUserDefinition, this.deleteUser],
      [this.createRoleDefinition, this.createRole],
      [this.listRolesDefinition, this.listRoles],
      [this.deleteRoleDefinition, this.deleteRole],
      [this.assignRolesToUserDefinition, this.assignRolesToUser],
      [this.removeRolesFromUserDefinition, this.removeRolesFromUser],
      [this.createApplicationDefinition, this.createApplication],
      [this.listApplicationsDefinition, this.listApplications],
      [this.deleteApplicationDefinition, this.deleteApplication],
    ];
  }

  public getTools(): MCPFunctionDefinition[] {
    return [
      this.createUserDefinition,
      this.getUserDefinition,
      this.updateUserDefinition,
      this.deleteUserDefinition,
      this.createRoleDefinition,
      this.listRolesDefinition,
      this.deleteRoleDefinition,
      this.assignRolesToUserDefinition,
      this.removeRolesFromUserDefinition,
      this.createApplicationDefinition,
      this.listApplicationsDefinition,
      this.deleteApplicationDefinition,
    ];
  }
}
