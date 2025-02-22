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

  // Get all available functions
  public getFunctions(): [MCPFunctionDefinition, MCPFunction][] {
    return [
      [this.createUserDefinition, this.createUser],
      [this.getUserDefinition, this.getUser],
      [this.updateUserDefinition, this.updateUser],
      [this.deleteUserDefinition, this.deleteUser],
    ];
  }
}
