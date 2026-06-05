import type { PrintfulClient } from "./client.js";

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (client: PrintfulClient, args: Record<string, unknown>) => Promise<unknown>;
}

export const tools: Tool[] = [
  // ─── CATALOG ────────────────────────────────────────────────────────────────
  {
    name: "list_catalog_products",
    description: "List all products in the Printful catalog. Optionally filter by category or printing technique.",
    inputSchema: {
      type: "object",
      properties: {
        category_id: { type: "string", description: "Filter by category ID" },
        technique: { type: "string", description: "Filter by technique: DTG, EMBROIDERY, SUBLIMATION, etc." },
        limit: { type: "number", description: "Results per page (default 20)" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
    handler: (client, args) =>
      client.get("/v2/catalog/products", args as Record<string, string | number>),
  },
  {
    name: "get_catalog_product",
    description: "Get details for a specific catalog product including available techniques and options.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}`),
  },
  {
    name: "get_product_variants",
    description: "Get all variants (sizes/colors) for a catalog product. Returns variant IDs needed for orders.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}/variants`),
  },
  {
    name: "get_product_prices",
    description: "Get pricing for a catalog product, including discounted pricing for Printful subscribers.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}/prices`),
  },
  {
    name: "get_product_stock",
    description: "Check stock availability for a catalog product by region (US, EU, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}/availability`),
  },
  {
    name: "get_product_size_guide",
    description: "Get size guide tables for a product (measure yourself, product measurements, international sizes).",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
        unit: { type: "string", description: "Measurement unit: 'inches', 'cm', or 'inches,cm'" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}/sizes`, {
        unit: args.unit as string,
      }),
  },
  {
    name: "get_mockup_templates",
    description: "Get available mockup templates and placements for a product. Use before creating mockups.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Printful catalog product ID" },
        technique: { type: "string", description: "Printing technique (e.g. DTG)" },
      },
      required: ["product_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/catalog/products/${args.product_id}/mockup-templates`, {
        technique: args.technique as string,
      }),
  },

  // ─── ORDERS ─────────────────────────────────────────────────────────────────
  {
    name: "list_orders",
    description: "List orders in the store. Filter by status, paginate results.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter: draft, pending, in_process, fulfilled, canceled, failed" },
        limit: { type: "number", description: "Results per page" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
    handler: (client, args) =>
      client.get("/v2/orders", args as Record<string, string | number>),
  },
  {
    name: "get_order",
    description: "Get full details of a specific order by ID.",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Printful order ID" },
      },
      required: ["order_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/orders/${args.order_id}`),
  },
  {
    name: "create_order",
    description: "Create a new draft order. Orders start as drafts and must be confirmed before fulfillment.",
    inputSchema: {
      type: "object",
      properties: {
        recipient: {
          type: "object",
          description: "Shipping recipient: { name, address1, city, state_code, country_code, zip, email?, phone? }",
        },
        items: {
          type: "array",
          description: "Array of order items. Each item needs catalog_variant_id, quantity, and files with design layers.",
        },
        packing_slip: {
          type: "object",
          description: "Optional packing slip: { email, phone, message, logo_url }",
        },
      },
      required: ["recipient"],
    },
    handler: (client, args) =>
      client.post("/v2/orders", args),
  },
  {
    name: "confirm_order",
    description: "Confirm a draft order for fulfillment. This charges the account and sends the order to production.",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Printful order ID to confirm" },
      },
      required: ["order_id"],
    },
    handler: (client, args) =>
      client.post(`/v2/orders/${args.order_id}/confirmation`),
  },
  {
    name: "cancel_order",
    description: "Cancel/delete a draft or failed order.",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Printful order ID to cancel" },
      },
      required: ["order_id"],
    },
    handler: (client, args) =>
      client.delete(`/v2/orders/${args.order_id}`),
  },
  {
    name: "estimate_order_cost",
    description: "Create an async cost estimation task for an order. Returns a task_id to poll for results.",
    inputSchema: {
      type: "object",
      properties: {
        recipient: {
          type: "object",
          description: "Shipping recipient address",
        },
        items: {
          type: "array",
          description: "Order items to estimate",
        },
      },
      required: ["recipient", "items"],
    },
    handler: (client, args) =>
      client.post("/v2/order-estimation-tasks", args),
  },
  {
    name: "get_order_estimation",
    description: "Poll the result of an order cost estimation task. Status: pending, completed, failed.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID returned by estimate_order_cost" },
      },
      required: ["task_id"],
    },
    handler: (client, args) =>
      client.get("/v2/order-estimation-tasks", { id: args.task_id as string }),
  },
  {
    name: "get_order_shipments",
    description: "Get shipment tracking info for an order (carrier, tracking number, estimated delivery).",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Printful order ID" },
      },
      required: ["order_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/orders/${args.order_id}/shipments`),
  },

  // ─── FILES ──────────────────────────────────────────────────────────────────
  {
    name: "upload_file",
    description: "Upload a design file to the Printful file library. Returns a file_id to use in orders.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Publicly accessible URL of the design file (PNG, PDF, etc.)" },
        type: { type: "string", description: "File type (default: 'default')" },
        filename: { type: "string", description: "Optional filename override" },
      },
      required: ["url"],
    },
    handler: (client, args) =>
      client.post("/v2/files", { url: args.url, type: args.type ?? "default", filename: args.filename }),
  },
  {
    name: "get_file",
    description: "Get details of a file in the Printful file library.",
    inputSchema: {
      type: "object",
      properties: {
        file_id: { type: "number", description: "File ID from the Printful file library" },
      },
      required: ["file_id"],
    },
    handler: (client, args) =>
      client.get(`/v2/files/${args.file_id}`),
  },

  // ─── MOCKUP GENERATOR ────────────────────────────────────────────────────────
  {
    name: "create_mockup_task",
    description: "Start an async mockup generation task. Returns a task_key to poll for results.",
    inputSchema: {
      type: "object",
      properties: {
        catalog_variant_ids: {
          type: "array",
          description: "Array of catalog variant IDs to generate mockups for",
          items: { type: "number" },
        },
        files: {
          type: "array",
          description: "Design files: [{ placement: 'front', url: 'https://...' }]",
        },
        format: { type: "string", description: "Output format: jpg or png (default: jpg)" },
      },
      required: ["catalog_variant_ids", "files"],
    },
    handler: (client, args) =>
      client.post("/v2/mockup-generator/tasks", args),
  },
  {
    name: "get_mockup_result",
    description: "Poll for the result of a mockup generation task. Status: waiting, processing, completed, failed.",
    inputSchema: {
      type: "object",
      properties: {
        task_key: { type: "string", description: "Task key returned by create_mockup_task" },
      },
      required: ["task_key"],
    },
    handler: (client, args) =>
      client.get("/v2/mockup-generator/tasks", { task_key: args.task_key as string }),
  },

  // ─── SHIPPING ───────────────────────────────────────────────────────────────
  {
    name: "calculate_shipping_rates",
    description: "Calculate available shipping rates for a given recipient and set of items.",
    inputSchema: {
      type: "object",
      properties: {
        recipient: {
          type: "object",
          description: "Recipient address: { address1, city, state_code, country_code, zip }",
        },
        items: {
          type: "array",
          description: "Items: [{ catalog_variant_id, quantity }]",
        },
        currency: { type: "string", description: "Currency code, e.g. USD, EUR" },
      },
      required: ["recipient", "items"],
    },
    handler: (client, args) =>
      client.post("/v2/shipping/rates", args),
  },

  // ─── STORE ───────────────────────────────────────────────────────────────────
  {
    name: "get_store_info",
    description: "Get basic information about the current store (name, currency, type, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        store_id: { type: "string", description: "Store ID (required for account-level tokens)" },
      },
    },
    handler: (client, args) =>
      args.store_id
        ? client.get(`/v2/stores/${args.store_id}`)
        : client.get("/v2/stores"),
  },

  // ─── WEBHOOKS ─────────────────────────────────────────────────────────────────
  {
    name: "get_webhook_config",
    description: "Get the current webhook configuration for the store.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: (client) => client.get("/v2/webhooks"),
  },
  {
    name: "set_webhook",
    description: "Configure a webhook endpoint to receive Printful events (order updates, shipments, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "HTTPS URL to receive webhook POST requests" },
        secret: { type: "string", description: "Secret for HMAC-SHA256 signature verification" },
      },
      required: ["url"],
    },
    handler: (client, args) =>
      client.post("/v2/webhooks", args),
  },
];
