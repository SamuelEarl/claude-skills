#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PrintfulClient } from "./client.js";
import { registerTools } from "./tools.js";

async function main() {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) {
    console.error(
      "Error: PRINTFUL_API_TOKEN environment variable is required.",
    );
    process.exit(1);
  }

  const client = new PrintfulClient(token);

  const server = new McpServer({
    name: "printful-mcp",
    version: "0.1.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting printful-mcp:", err);
  process.exit(1);
});
