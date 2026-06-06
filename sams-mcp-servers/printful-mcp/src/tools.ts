import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrintfulClient } from "./client.js";

function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerTools(server: McpServer, client: PrintfulClient) {
  server.tool(
    "get_store_info",
    "Get metadata for the connected Printful store (name, ID, currency, etc.).",
    {},
    async () => {
      try {
        return jsonResult(await client.getStoreInfo());
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "list_store_products",
    "List sync products in the connected Printful store. Supports pagination.",
    {
      offset: z.number().int().min(0).optional().describe("Pagination offset."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Page size (max 100)."),
      status: z
        .enum(["all", "synced", "unsynced", "ignored"])
        .optional()
        .describe("Filter by sync status."),
    },
    async ({ offset, limit, status }) => {
      try {
        return jsonResult(
          await client.listStoreProducts({ offset, limit, status }),
        );
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "get_store_product",
    "Get full details (including variants) for one sync product in the store.",
    {
      id: z
        .union([z.number().int(), z.string()])
        .describe("Sync product ID or external ID."),
    },
    async ({ id }) => {
      try {
        return jsonResult(await client.getStoreProduct(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "list_catalog_products",
    "Browse Printful's global product catalog. Optionally filter by category.",
    {
      category_id: z
        .number()
        .int()
        .optional()
        .describe("Restrict results to a single catalog category."),
    },
    async ({ category_id }) => {
      try {
        return jsonResult(await client.listCatalogProducts({ category_id }));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "get_catalog_product",
    "Get full details for one catalog product, including all variants.",
    {
      id: z.number().int().describe("Catalog product ID."),
    },
    async ({ id }) => {
      try {
        return jsonResult(await client.getCatalogProduct(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "list_orders",
    "List orders for the connected store. Supports status filter and pagination.",
    {
      status: z
        .enum([
          "draft",
          "pending",
          "failed",
          "canceled",
          "inprocess",
          "onhold",
          "partial",
          "fulfilled",
          "archived",
        ])
        .optional()
        .describe("Filter by order status."),
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ status, offset, limit }) => {
      try {
        return jsonResult(await client.listOrders({ status, offset, limit }));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.tool(
    "get_order",
    "Get full details for a single order (items, shipping, costs, status).",
    {
      id: z
        .union([z.number().int(), z.string()])
        .describe("Order ID or external order ID."),
    },
    async ({ id }) => {
      try {
        return jsonResult(await client.getOrder(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
