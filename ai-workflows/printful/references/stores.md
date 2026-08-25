# Printful v2 Stores API Reference

Base path: `https://api.printful.com/v2/stores`

---

## Get a single store

`GET /v2/stores/{store_id}`

```json
{
  "data": {
    "id": 12345678,
    "name": "My Print Store",
    "type": "native",
    "currency": "USD",
    "created": "2023-01-15T10:00:00Z"
  }
}
```

---

## List all stores (account-level token only)

`GET /v2/stores`

Use this when you have an Account-level token and need to discover store IDs.
Requires `X-PF-Store-Id` header on all subsequent store-scoped requests.

---

## Get store statistics

`GET /v2/stores/{store_id}/statistics`

Returns order counts, revenue, and fulfillment metrics.

Query params:
- `date_from` — ISO 8601 start date
- `date_to` — ISO 8601 end date

---

## Packing slip

Customize the packing slip included with shipments:

`POST /v2/stores/{store_id}/packing-slip` (v1: `POST /stores/packing-slip`)

```json
{
  "email": "support@yourstore.com",
  "phone": "+1-800-000-0000",
  "message": "Thank you for your order! Visit us at yourstore.com",
  "logo_url": "https://yourcdn.com/logo.png",
  "store_name": "Your Store Name"
}
```

You can also set packing slip per-order in the order body:
```json
{
  "recipient": { ... },
  "packing_slip": {
    "email": "support@yourstore.com",
    "message": "Custom thank-you message for this order"
  }
}
```

---

## Store ID discovery

If you only have a Store-level token, the store ID is embedded in your token — you don't need to pass `X-PF-Store-Id`. If you have an Account-level token, call `GET /v2/stores` to find the IDs of all stores you manage, then pass the relevant one via header.
