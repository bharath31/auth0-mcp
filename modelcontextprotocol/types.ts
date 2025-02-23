// Basic MCP types
export interface MCPFunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPFunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
  query?: string;
}

export type MCPFunction = (params: unknown) => Promise<MCPFunctionResponse>;

export interface MCPServer {
  functions: [MCPFunctionDefinition, MCPFunction][];
  start(): Promise<void>;
  stop(): Promise<void>;
}
