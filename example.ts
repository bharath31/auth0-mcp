/**
 * @file Example usage of Auth0 MCP Server
 * @description Demonstrates how to initialize and use the Auth0 MCP server
 */

import { Auth0MCP } from './modelcontextprotocol';
import { config } from 'dotenv';

// Load environment variables
config();

// Enable debug logging
process.env.DEBUG = '1';

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
    console.error('Starting Auth0 MCP server...');
    const server = new Auth0MCP({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!
    });
    
    // Handle process signals
    process.on('SIGINT', () => {
      console.error('Received SIGINT. Shutting down...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Received SIGTERM. Shutting down...');
      process.exit(0);
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Log environment variables
    console.error('Environment variables:');
    console.error('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
    console.error('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
    console.error('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET);

    console.error('Starting server...');
    await server.start();
    console.error('Server started successfully on port 3000')

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
console.error('Initializing...');
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
