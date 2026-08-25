---
name: printful
description: >
  Deep knowledge of the Printful 2.0 API for ecommerce integrations. Use this skill
  whenever the user is working on anything related to Printful — including writing API
  integration code, building or debugging an MCP server for Printful, creating orders,
  managing products, generating mockups, handling webhooks, calculating shipping rates,
  authentication, or migrating from v1 to v2. Trigger even for casual questions like
  "how do I create a Printful order?" or "what's the Printful webhook payload?" or
  "why is my Printful API call failing?". If the user mentions Printful at all,
  use this skill.
---

# Printful 2.0 API Skill

## Quick Reference

- **Base URL (v2):** `https://api.printful.com/v2/`
- **Base URL (v1):** `https://api.printful.com/` (still supported, not recommended for new work)
- **Auth:** `Authorization: Bearer {token}` on every request
- **Content-Type:** `application/json`
- **Docs:** https://developers.printful.com/docs/v2-beta/
- **Postman:** https://developers.printful.com/docs/v2-beta/postman/printful_postman_collection.json

---

## Authentication

### Private Token (recommended for personal stores)
Generate at https://developers.printful.com/tokens

```http
GET https://api.printful.com/v2/orders
Authorization: Bearer YOUR_PRIVATE_TOKEN
```

### Account-level token (manages multiple stores)
Requires `X-PF-Store-Id` header on store-scoped endpoints:

```http
GET https://api.printful.com/v2/orders
Authorization: Bearer YOUR_ACCOUNT_TOKEN
X-PF-Store-Id: 12345678
```

### OAuth (Public Apps — for multi-merchant SaaS)
- Auth URL: `https://www.printful.com/oauth/authorize?client_id={id}&state={s}&redirect_url={url}`
- Token exchange: `POST https://www.printful.com/oauth/token`
- Access token expires in **1 hour**; refresh token expires in **90 days** if unused
- See: [references/auth.md](references/auth.md) for full OAuth flow

### Token Scopes
| Scope | Access |
|---|---|
| `orders` / `orders/read` | Create/read orders |
| `sync_products` / `sync_products/read` | Sync products |
| `file_library` / `file_library/read` | Upload/read design files |
| `webhooks` / `webhooks/read` | Configure webhooks |
| `product_templates` / `product_templates/read` | Account-level only |

---

## Response Format

**Success:**
```json
{ "data": { ... } }
```

**Error (RFC 9457):**
```json
{
  "type": "https://developers.printful.com/docs/v2-beta/#errors/not-found",
  "status": 404,
  "title": "Not Found",
  "detail": "The resource that you tried to access does not exist.",
  "instance": "abc-123"
}
```

**Pagination:** All list endpoints use `offset` + `limit` query params. Response includes paging object.

---

## Rate Limiting

V2 uses a **leaky bucket** algorithm (120 requests/minute by default).

Response headers: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, `X-Ratelimit-Reset`, `X-Ratelimit-Policy`

On 429: use `Retry-After` header to schedule the next request.

---

## Core API Groups

For detailed endpoint references, read the relevant file in `references/`:

| Area | File | Key operations |
|---|---|---|
| Catalog | [references/catalog.md](references/catalog.md) | Browse products, variants, pricing, size guides, stock, mockup templates |
| Orders | [references/orders.md](references/orders.md) | Create, confirm, update, estimate, track orders |
| Files | [references/files.md](references/files.md) | Upload design files to library |
| Mockups | [references/mockups.md](references/mockups.md) | Generate product mockup images |
| Shipping | [references/shipping.md](references/shipping.md) | Calculate shipping rates |
| Webhooks | [references/webhooks.md](references/webhooks.md) | Configure real-time event notifications |
| Stores | [references/stores.md](references/stores.md) | Store info, packing slips, statistics |

---

## Critical "Gotchas"

1. **Always use Variant IDs, not Product IDs** when creating orders or sync products. Using a Product ID by mistake creates a completely different item.

2. **Orders start as drafts.** A newly created order has status `draft` and will NOT be fulfilled or charged until you call the confirm endpoint: `POST /v2/orders/{id}/confirmation`.

3. **Sync products vs Catalog products.** The Printful catalog is the master list of blank items. Sync products are YOUR store's products that reference catalog variants. In v2, sync product management is NOT yet available — use v1 endpoints for that (`/sync/products`).

4. **Mockup generation is async.** Create a task → poll for result. Don't expect an instant response.

5. **Order estimation is async.** Same pattern as mockups — create task, poll with the returned task ID.

6. **Timestamps are ISO 8601 UTC** in v2 (not Unix timestamps like v1).

7. **Prices are strings** with up to 2 decimal places in v2 (e.g. `"9.85"`), not numbers.

8. **Webhooks require HTTPS** in v2 and support request signing for verification.

---

## Common Workflows

### 1. Display a product catalog
```
GET /v2/catalog/products              → list all products (supports filtering/sorting)
GET /v2/catalog/products/{id}         → product detail
GET /v2/catalog/products/{id}/variants → all variants (sizes/colors)
GET /v2/catalog/products/{id}/prices  → pricing (includes discounted pricing)
GET /v2/catalog/products/{id}/availability → stock by region
GET /v2/catalog/products/{id}/mockup-templates → available mockup styles
```

### 2. Create and submit an order
```
POST /v2/orders                       → create draft order
POST /v2/orders/{id}/items            → add item(s) to the order
POST /v2/order-estimation-tasks       → estimate cost (async)
GET  /v2/order-estimation-tasks?id=X  → poll for estimate result
POST /v2/orders/{id}/confirmation     → confirm → triggers fulfillment
GET  /v2/orders/{id}/shipments        → track shipment
```

### 3. Generate a product mockup
```
GET  /v2/catalog/products/{id}/mockup-templates  → available styles
POST /v2/mockup-generator/tasks                  → create task with variant_id + files
GET  /v2/mockup-generator/tasks?task_key={key}   → poll until status = completed
```

### 4. Upload a design file
```
POST /v2/files
Body: { "url": "https://yourcdn.com/design.png", "type": "default" }
→ returns file_id to reference in orders
```

### 5. Calculate shipping rates
```
POST /v2/shipping/rates
Body: { "recipient": {...}, "items": [{ "catalog_variant_id": 4011, "quantity": 1 }], "currency": "USD" }
```

---

## Order Item Design Specification (v2)

V2 supports multi-layer designs with explicit positioning:

```json
{
  "catalog_variant_id": 4011,
  "quantity": 1,
  "files": [
    {
      "placement": "front",
      "layers": [
        {
          "type": "file",
          "file_id": 123456,
          "position": {
            "area_width": 1800,
            "area_height": 2400,
            "width": 1200,
            "height": 1200,
            "top": 300,
            "left": 300,
            "limit_to_print_area": true
          }
        }
      ]
    }
  ]
}
```

---

## Webhook Events (v2)

Configure with `POST /v2/webhooks`. All require HTTPS endpoints.

| Event | Trigger |
|---|---|
| `shipment_sent` | Order shipped |
| `shipment_delivered` | Delivery confirmed |
| `shipment_returned` | Return received |
| `shipment_out_of_stock` | Item out of stock during fulfillment |
| `shipment_canceled` | Shipment canceled |
| `shipment_put_hold` | Shipment on hold |
| `shipment_put_hold_approval` | Shipment awaiting approval |
| `shipment_remove_hold` | Shipment hold removed |
| `order_created` | New order |
| `order_updated` | Order changed |
| `order_failed` | Fulfillment failure |
| `order_canceled` | Cancellation |
| `order_put_hold` | Order put on hold |
| `order_put_hold_approval` | Order awaiting approval |
| `order_remove_hold` | Hold removed |
| `order_refunded` | Refund processed |
| `catalog_stock_updated` | Stock change (real-time, ~5min) |
| `catalog_price_changed` | Price update |
| `mockup_task_finished` | Async mockup complete |

Webhooks include a signature for verification — validate using HMAC-SHA256 with your webhook secret.

---

## Localisation

Add `X-PF-Language` header to get translated product names:
`en_US` (default), `en_GB`, `en_CA`, `es_ES`, `fr_FR`, `de_DE`, `it_IT`, `ja_JP`

---

## V1 → V2 Migration Notes

- Change base path from `https://api.printful.com/` to `https://api.printful.com/v2/`
- Same Bearer token auth, no token changes needed
- Timestamps: Unix → ISO 8601 UTC
- Prices: numbers → strings
- Error format: custom → RFC 9457
- Pagination: now uniform across all endpoints
- Rate limiting: simple counter → leaky bucket
- Sync products / product templates: **NOT in v2 yet** — keep using v1 for those
