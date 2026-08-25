# Printful v2 Orders API Reference

Base path: `https://api.printful.com/v2/orders`

Requires scope: `orders` (write) or `orders/read` (read only).

---

## Order Lifecycle

```
draft → pending → in_process → fulfilled
                             ↘ canceled
                             ↘ failed
```

- `draft` — created but not confirmed; no charge, not sent to fulfillment
- `pending` — confirmed, awaiting processing
- `in_process` — being fulfilled
- `fulfilled` — shipped

**Orders must be confirmed** via `POST /v2/orders/{id}/confirmation` before they are charged and fulfilled.

---

## Endpoints

### List orders
`GET /v2/orders`

Query params: `status`, `limit`, `offset`, `sort_by`, `sort_direction`

### Create order
`POST /v2/orders`

Minimal body (recipient only — add items separately):
```json
{
  "recipient": {
    "name": "Jane Smith",
    "address1": "123 Main St",
    "city": "Los Angeles",
    "state_code": "CA",
    "country_code": "US",
    "zip": "90001"
  }
}
```

Full body with items inline:
```json
{
  "recipient": { ... },
  "items": [
    {
      "catalog_variant_id": 4011,
      "quantity": 1,
      "retail_price": "29.99",
      "name": "Custom T-Shirt",
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
  ],
  "packing_slip": {
    "email": "support@yourstore.com",
    "phone": "+1-800-000-0000",
    "message": "Thank you for your order!"
  }
}
```

Response includes order `id` and status `draft`.

### Get order
`GET /v2/orders/{id}`

### Update order (PATCH — partial update)
`PATCH /v2/orders/{id}`

Only draft orders can be updated. Send only the fields to change.

### Delete/cancel order
`DELETE /v2/orders/{id}`

Only draft or failed orders can be deleted.

### Confirm order
`POST /v2/orders/{id}/confirmation`

Moves status from `draft` → `pending`. Order is now charged and queued for fulfillment.

---

## Order Items

### List items
`GET /v2/orders/{id}/items`

### Add item to order
`POST /v2/orders/{id}/items`

Useful for building the order incrementally. Body is a single item object (same structure as inline items above).

### Get single item
`GET /v2/orders/{id}/items/{item_id}`

### Update item
`PATCH /v2/orders/{id}/items/{item_id}`

### Delete item
`DELETE /v2/orders/{id}/items/{item_id}`

---

## Order Estimation (Async)

### Create estimation task
`POST /v2/order-estimation-tasks`

Body is same structure as create order. Returns task ID immediately.

```json
{
  "data": {
    "id": "fc959efb-b3a0-4c12-9cc6-f54d3158291d",
    "status": "pending"
  }
}
```

### Poll estimation result
`GET /v2/order-estimation-tasks?id={task_id}`

Status values: `pending`, `completed`, `failed`

Completed response includes:
```json
{
  "data": {
    "status": "completed",
    "costs": {
      "currency": "USD",
      "subtotal": "24.95",
      "discount": "0.00",
      "shipping": "4.79",
      "tax": "0.00",
      "total": "29.74"
    }
  }
}
```

---

## Shipments

### List shipments for an order
`GET /v2/orders/{id}/shipments`

Returns carrier, tracking number, tracking URL, estimated delivery, departure country.

### Get invoice
`GET /v2/orders/{id}/invoice`

---

## Design Files in Orders

Each item's `files` array defines print placements. Each placement has `layers`:

### Layer types
- `"type": "file"` — image from file library (use `file_id`)
- `"type": "text"` — text layer with font/color/size settings

### Placements
Common placement values: `front`, `back`, `label_outside`, `label_inside`, `sleeve_left`, `sleeve_right`

Check `GET /v2/catalog/products/{id}/mockup-templates` for valid placements per product.

### Position object
```json
{
  "area_width": 1800,    // print area width in pixels
  "area_height": 2400,   // print area height in pixels
  "width": 1200,         // design width
  "height": 1200,        // design height
  "top": 300,            // offset from top of print area
  "left": 300,           // offset from left of print area
  "limit_to_print_area": true
}
```

Origin (0,0) is top-left of the print area.
