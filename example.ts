import { config } from 'dotenv';
import { Auth0AgentToolkit } from './modelcontextprotocol/index.js';

// Load environment variables from .env file
config();

// Load environment variables
const domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;

if (!domain || !clientId || !clientSecret) {
  console.error('Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET environment variables in .env file');
  process.exit(1);
}

// Initialize the toolkit
const auth0Toolkit = new Auth0AgentToolkit({
  domain,
  clientId,
  clientSecret,
});

// Start the server
console.log('Starting Auth0 MCP server...');
auth0Toolkit.start().catch((err: Error) => {
  console.error('Server error:', err);
  process.exit(1);
});
