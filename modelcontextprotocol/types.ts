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
  content?: any;
  error?: {
    message: string;
    details?: any;
  };
}

export type MCPFunction = (params: unknown) => Promise<MCPFunctionResponse>;

export interface MCPServer {
  functions: [MCPFunctionDefinition, MCPFunction][];
}
