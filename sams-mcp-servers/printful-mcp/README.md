# printful-mcp

A **Model Context Protocol (MCP) server** that lets Claude (and other MCP-compatible AI clients) read data from your Printful store: products, orders, the global catalog, and store info.

This server is **read-only** by design. See [`ENHANCEMENTS.md`](./ENHANCEMENTS.md) for the plan to add write operations (creating orders, updating products) in a future version.

---

## What is an MCP server?

**MCP** stands for **Model Context Protocol** — an open standard introduced by Anthropic in late 2024 for connecting AI assistants (like Claude) to external tools, data sources, and services.

### The problem it solves

Before MCP, every AI app that wanted to talk to (say) GitHub, a database, or Slack needed a custom integration. Each tool needed bespoke glue code. MCP standardizes this — write the integration **once** as an MCP server, and any MCP-compatible client (Claude Desktop, Claude Code, Cursor, etc.) can use it.

Think of it like **USB for AI tools**: one protocol, many devices.

### What an MCP server does

An MCP server exposes some combination of:

| Primitive | What it is | Printful example |
|-----------|-----------|------------------|
| **Tools** | Functions the AI can call | `get_orders`, `create_order`, `list_products` |
| **Resources** | Read-only data the AI can fetch | A product catalog, an order's details |
| **Prompts** | Reusable prompt templates | "Draft a shipping delay email for order X" |

The server speaks the MCP protocol (JSON-RPC over stdio or HTTP). The client (Claude) discovers what the server offers and calls into it as needed during a conversation.

### What this Printful MCP server lets you do

Once connected to Claude, you can ask things like:

- *"What orders shipped this week?"*
- *"Which of my store products are unsynced?"*
- *"Show me the variants for catalog product 71."*
- *"Get the shipping cost on order 12345."*

Claude calls this MCP server, which calls the Printful API, and returns the result inline.

---

## Tools exposed

| Tool | Purpose |
|---|---|
| `get_store_info` | Metadata for the connected store (name, ID, currency) |
| `list_store_products` | List sync products in your store (with pagination + status filter) |
| `get_store_product` | Full details + variants for one sync product |
| `list_catalog_products` | Browse Printful's global catalog (optionally by category) |
| `get_catalog_product` | Full details + variants for a catalog product |
| `list_orders` | List orders (with status filter + pagination) |
| `get_order` | Full details for a single order |

---

## Setup

### 1. Get a Printful API token

1. Log in at [printful.com](https://www.printful.com).
2. Go to your dashboard → **Stores** → select a store → **API**, **or** visit the [Printful Developer Portal](https://developers.printful.com/) and create a private token for your store.
3. Copy the token. You'll set it as `PRINTFUL_API_TOKEN` below.

### 2. Install and build

```bash
cd sams-mcp-servers/printful-mcp
npm install
npm run build
```

### 3. Configure your token

Copy the example env file and fill in your token:

```bash
cp .env.example .env
# then edit .env and set PRINTFUL_API_TOKEN=...
```

`.env` is gitignored. It's used when you run the server directly (`npm run dev`, `node dist/index.js`) for local testing.

> **Note:** When the server is launched by Claude Desktop or Claude Code, those clients pass env vars through their own config (the `"env"` block below) — they do **not** read your `.env`. The `.env` is for local development.

### 4. Connect to Claude

Add an entry to your MCP client config. For **Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or the equivalent on your OS):

```json
{
  "mcpServers": {
    "printful": {
      "command": "node",
      "args": ["/absolute/path/to/sams-mcp-servers/printful-mcp/dist/index.js"],
      "env": {
        "PRINTFUL_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

For **Claude Code**, register the server with:

```bash
claude mcp add printful \
  --env PRINTFUL_API_TOKEN=your_token_here \
  -- node /absolute/path/to/sams-mcp-servers/printful-mcp/dist/index.js
```

Restart your client and the `printful` tools will appear.

---

## Development

```bash
npm run dev        # run from source with tsx (no build step)
npm run typecheck  # verify types without emitting
npm run build      # compile to dist/
```

The server uses stdio transport — it reads JSON-RPC on stdin and writes responses on stdout. Anything written to `stderr` is for logging only and won't interfere with the protocol.

### Testing manually

You can drive the server by hand for quick sanity checks:

```bash
PRINTFUL_API_TOKEN=xxx npm run dev
```

…then paste a JSON-RPC `initialize` message followed by `tools/list`. For richer interactive testing, use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Project layout

```
src/
├── index.ts     # entry point: reads env, wires up server + transport
├── client.ts    # thin wrapper around Printful's REST API
└── tools.ts     # MCP tool registrations (schemas + handlers)
```

---

## License

MIT
