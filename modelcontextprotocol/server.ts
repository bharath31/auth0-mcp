import express from 'express';
import cors from 'cors';

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}

export abstract class McpServer {
  private tools: Map<string, Tool> = new Map();
  protected app: express.Application;
  protected server: any;
  private clients: Map<string, express.Response> = new Map();

  constructor() {
    this.app = express();
    this.setupExpress();
  }

  private setupExpress() {
    this.app.use(cors());
    this.app.use(express.json());

    // SSE endpoint
    this.app.get('/events', (req, res) => {
      const clientId = Math.random().toString(36).substring(7);

      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Register client
      this.clients.set(clientId, res);

      // Handle client disconnect
      req.on('close', () => {
        this.clients.delete(clientId);
      });

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    });

    // RPC endpoint
    this.app.post('/rpc', async (req, res) => {
      try {
        const { method, params } = req.body;
        console.error(`Handling RPC method: ${method}`);
        
        switch (method) {
          case 'initialize': {
            res.json({
              result: {
                protocolVersion: 1,
                capabilities: {
                  tools: {
                    discovery: true,
                    execution: true
                  },
                  streaming: true
                },
                serverInfo: {
                  name: 'auth0-mcp',
                  version: '1.0.0'
                }
              }
            });
            break;
          }

          case 'tools/list': {
            const tools = this.getToolDefinitions().map(tool => ({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }));
            res.json({ result: { tools } });
            break;
          }

          case 'tools/call': {
            const { name, arguments: args } = params;
            const tool = this.getTool(name);
            if (!tool) {
              res.status(404).json({
                error: `Tool not found: ${name}`
              });
              break;
            }

            try {
              const result = await tool.handler(args || {});
              res.json({ result });
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Unknown error';
              res.status(500).json({ error: message });
            }
            break;
          }

          case 'executeQuery': {
            const result = await this.executeQuery(params.query);
            res.json({ result });
            break;
          }

          default: {
            res.status(404).json({
              error: `Unknown method: ${method}`
            });
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
      }
    });
  }

  protected registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  protected getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public getToolDefinitions(): Tool[] {
    return Array.from(this.tools.values());
  }

  protected abstract executeQuery(query: string): Promise<any>;

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

  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server.close((err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  protected async initialize(): Promise<void> {
    // Override in child class if needed
  }

  protected broadcast(event: string, data: any) {
    const message = `data: ${JSON.stringify({ event, data })}\n\n`;
    for (const client of this.clients.values()) {
      client.write(message);
    }
  }
}
