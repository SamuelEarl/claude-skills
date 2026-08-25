# Printful v2 Webhooks API Reference

Webhooks let Printful push real-time events to your server instead of you polling for updates.

Base path: `https://api.printful.com/v2/webhooks`

Requires scope: `webhooks` (write) or `webhooks/read`

**HTTPS is required** for all webhook endpoints in v2.

---

## Setup

### Get current webhook config
`GET /v2/webhooks`

### Configure webhook endpoint
`POST /v2/webhooks`

```json
{
  "url": "https://yourstore.com/api/webhooks/printful",
  "secret": "your-random-secret-string"
}
```

### Disable webhooks
`DELETE /v2/webhooks`

---

## Per-event configuration

You can enable/disable individual event types:

```
GET    /v2/webhooks/events/{event_type}   → get config for event
POST   /v2/webhooks/events/{event_type}   → enable event
DELETE /v2/webhooks/events/{event_type}   → disable event
```

---

## All webhook events

| Event type | Trigger |
|---|---|
| `shipment_sent` | Order shipped, tracking available |
| `shipment_delivered` | Delivery confirmed |
| `shipment_returned` | Package returned |
| `shipment_out_of_stock` | Item out of stock during fulfillment |
| `shipment_canceled` | Shipment canceled |
| `order_created` | New order created |
| `order_updated` | Order changed |
| `order_failed` | Fulfillment failure |
| `order_canceled` | Order canceled |
| `order_put_hold` | Order put on hold |
| `order_put_hold_approval` | Order awaiting approval |
| `order_remove_hold` | Hold removed |
| `order_refunded` | Refund processed |
| `catalog_stock_updated` | Stock change (real-time, ~5min refresh) |
| `catalog_price_changed` | Catalog price update |
| `mockup_task_finished` | Async mockup generation complete |
| `shipment_put_hold` | Shipment on hold |
| `shipment_put_hold_approval` | Shipment awaiting approval |
| `shipment_remove_hold` | Shipment hold removed |

---

## Webhook payload structure

```json
{
  "type": "order_updated",
  "created": "2024-06-04T12:00:00Z",
  "store": 12345678,
  "data": {
    "order": { ... }
  }
}
```

---

## Signature verification

Every webhook request includes an `X-Printful-Signature` header. Always verify it before processing:

```typescript
import crypto from "crypto";

export function verifyPrintfulWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

**Important:** Use the raw request body (before JSON parsing) for signature verification. In Next.js, disable body parsing for the webhook route:

```typescript
// app/api/webhooks/printful/route.ts (Next.js App Router)
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-printful-signature") ?? "";

  if (!verifyPrintfulWebhook(rawBody, signature, process.env.PRINTFUL_WEBHOOK_SECRET!)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  switch (event.type) {
    case "shipment_sent":
      // update order status, send tracking email to customer
      break;
    case "order_failed":
      // alert merchant, notify customer
      break;
    case "catalog_stock_updated":
      // update your local stock cache
      break;
  }

  return Response.json({ received: true });
}
```

---

## Recommended events for a typical ecommerce store

| Priority | Event | Why |
|---|---|---|
| High | `shipment_sent` | Send tracking email to customer |
| High | `order_failed` | Alert you + customer immediately |
| High | `order_canceled` | Trigger refund logic |
| Medium | `shipment_delivered` | Send delivery confirmation |
| Medium | `order_refunded` | Update order state |
| Low | `catalog_stock_updated` | Sync local inventory cache |
| Low | `catalog_price_changed` | Update displayed prices |
