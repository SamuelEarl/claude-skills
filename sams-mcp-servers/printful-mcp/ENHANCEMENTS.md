# Future Enhancements

This document tracks ideas for extending `printful-mcp` beyond its current read-only scope.

---

## 1. Write-mode tools (read + write)

The v0.1 server is **deliberately read-only** so that an AI client can't accidentally create orders, charge money, or modify your store while you're still experimenting. The natural next step is to add a curated set of write tools.

### Why read-only first?

While developing and testing an MCP server, the AI may call tools experimentally — often in loops, sometimes with hallucinated arguments. A read-only first version means the worst case during development is a noisy log; not a real $40 t-shirt shipped to a fake address.

Once the read-only surface feels stable and you trust the tool schemas, layering on write tools is safe.

### Proposed write tools

| Tool | Printful endpoint | Risk |
|---|---|---|
| `create_order` (draft) | `POST /orders?confirm=false` | Low — creates a draft, no charge |
| `confirm_order` | `POST /orders/{id}/confirm` | **High** — charges your account, ships product |
| `cancel_order` | `DELETE /orders/{id}` | Medium — only works before fulfillment |
| `update_order` | `PUT /orders/{id}` | Medium — only on draft orders |
| `create_store_product` | `POST /store/products` | Low — adds a sync product, no money moves |
| `update_store_product` | `PUT /store/products/{id}` | Low |
| `delete_store_product` | `DELETE /store/products/{id}` | Medium — removes a sync product |
| `estimate_order_costs` | `POST /orders/estimate-costs` | None — pure calculation |
| `calculate_shipping_rates` | `POST /shipping/rates` | None — pure calculation |

### Safety patterns to adopt before shipping write mode

1. **Two-token model.** Require a separate `PRINTFUL_WRITE_TOKEN` env var to enable write tools at all. Read-only operation continues to use `PRINTFUL_API_TOKEN`. If the write token is unset, the write tools are simply not registered.
2. **Dry-run by default.** Every write tool accepts a `confirm: boolean` argument. Without `confirm: true`, the tool returns what *would* happen (the request body, estimated cost) but doesn't hit the API.
3. **Spend cap.** Reject `confirm_order` calls where estimated total exceeds an env-configured `PRINTFUL_MAX_ORDER_USD` ceiling.
4. **Idempotency keys.** Generate and log a UUID for each confirming request so retries don't double-charge.
5. **Audit log.** Append every write attempt — confirmed or not — to a local JSONL file (`~/.printful-mcp/audit.log`) for after-the-fact review.

### Suggested rollout order

1. Pure-calculation tools first (`estimate_order_costs`, `calculate_shipping_rates`) — zero risk.
2. Draft-only mutations (`create_order` without `confirm=true`, `update_order` on drafts).
3. Store product CRUD.
4. Order confirmation and cancellation — only after the above have been used in real workflows for a while.

---

## 2. Resources (in addition to tools)

MCP supports **resources** — read-only data the client can fetch and pin into context without an explicit tool call. Good candidates:

- `printful://store` — the store metadata blob, refreshed on read.
- `printful://orders/recent` — last N orders as a JSON resource.
- `printful://catalog/categories` — the full category tree.

Resources are nicer than tools when the AI wants to "look something up" repeatedly without spamming the chat with tool-call boilerplate.

---

## 3. Prompts

MCP **prompts** are reusable templates the client can offer to the user. Useful ones for Printful:

- *"Draft a shipping delay email for order {id}"* — pulls the order, then formats a customer-facing message.
- *"Reconcile last month's orders"* — kicks off a structured analysis flow.
- *"Spec a new product"* — guided walkthrough that ends in a `create_store_product` payload.

---

## 4. Caching layer

The catalog endpoints (`/products`, `/products/{id}`) return data that changes rarely. A small in-process LRU with a 1-hour TTL would cut latency on repeated lookups during a single Claude session without risking staleness on the parts of the API that *do* change frequently (orders, store products).

---

## 5. Pagination helpers

Currently `list_orders` and `list_store_products` expose `offset` / `limit` directly. A nicer surface would be a single `list_all_orders` tool that internally paginates and streams results until exhausted, capped at some sane upper bound. Useful when the AI wants "all orders from last quarter" without orchestrating pagination itself.

---

## 6. Webhook bridge

Printful can send webhooks (order shipped, order failed, stock changed). An interesting extension is a small HTTP listener bundled with this server that receives Printful webhooks and surfaces them as MCP **notifications** — letting Claude react to store events in real time. This would change the transport story (stdio alone isn't enough) and is the biggest architectural shift on this list.

---

## 7. Migrate to Printful API v2

This server targets Printful's v1 REST API, which is the most stable and best-documented. Printful's [v2 API](https://developers.printful.com/docs/v2-beta/) is in beta and uses a different shape (catalog v2, store v2). A future major version of this server could target v2 once it's stable and the v1 endpoints are deprecated.
