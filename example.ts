/**
 * @file Example usage of Auth0 MCP Server
 * @description Demonstrates how to initialize and use the Auth0 MCP server
 */

import { config } from 'dotenv';
import { Auth0MCP } from './modelcontextprotocol/index.js';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    process.stderr.write(`Missing required environment variable: ${envVar}\n`);
    process.exit(1);
  }
}

/**
 * Initialize and start the Auth0 MCP server
 */
async function main() {
  try {
    // Create Auth0 MCP server instance
    const auth0Server = new Auth0MCP({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });

    // Start the server
    await auth0Server.start().catch((error) => {
      process.stderr.write(`Error starting server: ${error}\n`);
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));

    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    process.stderr.write(`Failed to start Auth0 MCP server: ${error}\n`);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  process.stderr.write(`Unhandled error: ${error}\n`);
  process.exit(1);
});
