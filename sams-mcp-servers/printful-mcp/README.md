# Printful MCP Server

An MCP (Model Context Protocol) server that gives Claude direct access to the Printful 2.0 API — so you can ask Claude to look up products, create orders, generate mockups, calculate shipping rates, and more, all during a development session.

---

## What it does

Claude gains tools to:
- Browse the Printful product catalog (products, variants, pricing, stock, size guides)
- Create, confirm, estimate, and track orders
- Upload design files and generate product mockups (async)
- Calculate shipping rates
- Configure webhooks
- Inspect store info

---

## Installation

### Option A — Inside a Next.js / monorepo project (recommended)

Place the server inside your project so it lives alongside your store code:

```
your-store/
├── src/               ← your storefront
├── printful-mcp/      ← MCP server lives here
│   ├── src/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── tools.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── .env
```

From the `printful-mcp/` directory:
```bash
npm install
npm run build
```

### Option B — Standalone (global install)

```bash
cd printful-mcp
npm install
npm run build
npm link        # makes `printful-mcp` available globally
```

---

## Configuration

### 1. Get a Printful API token

1. Go to https://developers.printful.com/tokens
2. Click **Create token**
3. Select scopes you need (at minimum: `orders`, `file_library`, `webhooks`)
4. Set an expiry date
5. Copy the token — it won't be shown again

### 2. Set environment variables

Add to your project's `.env` file:
```env
PRINTFUL_TOKEN=your_private_token_here

# Only needed if using an account-level token with multiple stores:
# PRINTFUL_STORE_ID=12345678
```

> ⚠️ Never commit your `.env` file. Ensure `.env` is in your `.gitignore`.

---

## Connecting to Claude

### Claude Desktop App

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "printful": {
      "command": "node",
      "args": ["/absolute/path/to/your-store/printful-mcp/build/index.js"],
      "env": {
        "PRINTFUL_TOKEN": "your_token_here"
      }
    }
  }
}
```

**Or** if your `.env` is already set and you have `dotenv-cli` installed:
```json
{
  "mcpServers": {
    "printful": {
      "command": "npx",
      "args": ["dotenv", "-e", "/path/to/your-store/.env", "--", "node", "/path/to/printful-mcp/build/index.js"]
    }
  }
}
```

Restart Claude Desktop after editing this file.

### Claude Code

Add to your project's `.mcp.json` (creates one if it doesn't exist):
```json
{
  "mcpServers": {
    "printful": {
      "command": "node",
      "args": ["./printful-mcp/build/index.js"],
      "env": {
        "PRINTFUL_TOKEN": "${PRINTFUL_TOKEN}"
      }
    }
  }
}
```

Claude Code reads `PRINTFUL_TOKEN` from your shell environment or `.env` automatically.

---

## Verifying it works

Once connected, ask Claude:
> "Use the Printful MCP to list the first 5 catalog products"

Or:
> "What Printful tools do you have available?"

---

## Available Tools

| Tool | What it does |
|---|---|
| `list_catalog_products` | Browse all Printful products (with filters) |
| `get_catalog_product` | Get a single product's details |
| `get_product_variants` | Get all sizes/colors for a product |
| `get_product_prices` | Get pricing including subscriber discounts |
| `get_product_stock` | Check stock by region |
| `get_product_size_guide` | Get size tables |
| `get_mockup_templates` | List available mockup placements |
| `list_orders` | List store orders |
| `get_order` | Get a specific order |
| `create_order` | Create a new draft order |
| `confirm_order` | Confirm draft → triggers fulfillment |
| `cancel_order` | Cancel/delete a draft order |
| `estimate_order_cost` | Async cost estimation (returns task ID) |
| `get_order_estimation` | Poll estimation task result |
| `get_order_shipments` | Get tracking info |
| `upload_file` | Upload a design to the file library |
| `get_file` | Get a file from the library |
| `create_mockup_task` | Start async mockup generation |
| `get_mockup_result` | Poll mockup task result |
| `calculate_shipping_rates` | Get available shipping rates |
| `get_store_info` | Get store details |
| `get_webhook_config` | Get webhook settings |
| `set_webhook` | Configure a webhook endpoint |

---

## Development

```bash
# Watch mode — recompile on save
npx tsc --watch

# Test the server directly (check it starts without errors)
PRINTFUL_TOKEN=your_token node build/index.js
```

---

## Notes

- Orders created via `create_order` are **drafts** — they won't be charged or fulfilled until you call `confirm_order`
- Mockup generation and order estimation are **async** — create the task, then poll for results
- This server uses Printful **API v2**. Sync products (v1 only) are not included
- Rate limit: 120 requests/minute. The server surfaces rate limit errors — handle them in your store code
