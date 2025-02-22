#!/bin/bash

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Make the example executable
chmod +x dist/example.js

echo "Setup complete! You can now run the MCP server with:"
echo "AUTH0_DOMAIN=your-domain.auth0.com AUTH0_CLIENT_ID=your-client-id AUTH0_CLIENT_SECRET=your-client-secret node dist/example.js"
