# Printful v2 Catalog API Reference

Base path: `GET https://api.printful.com/v2/catalog/...`

Catalog endpoints are public (no auth required) up to 30 req/min. Auth raises limit to 120/min.

---

## Products

### List catalog products
`GET /v2/catalog/products`

Query params:
- `category_id` — filter by category
- `technique` — e.g. `DTG`, `EMBROIDERY`, `SUBLIMATION`
- `limit` / `offset` — pagination
- `sort_by`, `sort_direction`

```json
{
  "data": [
    {
      "id": 71,
      "main_category_id": 24,
      "type": "T-SHIRT",
      "type_name": "T-Shirt",
      "title": "Unisex Staple T-Shirt | Bella + Canvas 3001",
      "brand": "Bella + Canvas",
      "model": "3001",
      "image": "https://files.cdn.printful.com/...",
      "variant_count": 63,
      "is_discontinued": false,
      "avg_fulfillment_time": 3.5,
      "techniques": [{ "key": "DTG", "display_name": "DTG printing", "is_default": true }],
      "origin_country": "Nicaragua"
    }
  ],
  "paging": { "total": 412, "offset": 0, "limit": 20 }
}
```

### Get single product
`GET /v2/catalog/products/{id}`

### Get product variants
`GET /v2/catalog/products/{id}/variants`

Returns all size/color combinations. Each variant has:
- `id` — **use this as `catalog_variant_id` in orders**
- `name`, `size`, `color`, `color_code`, `image`, `price`, `in_stock`
- `availability_regions` — which regions stock this variant
- `material`

### Get product prices
`GET /v2/catalog/products/{id}/prices`

Includes base price AND discounted pricing for Printful subscription holders.

### Get variant prices
`GET /v2/catalog/variants/{variant_id}/prices`

### Get size guide
`GET /v2/catalog/products/{id}/sizes?unit=inches,cm`

Returns `measure_yourself`, `product_measure`, and `international` size tables.

### Get product stock availability
`GET /v2/catalog/products/{id}/availability`

### Get variant stock availability
`GET /v2/catalog/variants/{variant_id}/availability`

```json
{
  "data": {
    "catalog_variant_id": 4011,
    "availability_status": [
      { "region": "US", "status": "in_stock" },
      { "region": "EU", "status": "in_stock" }
    ]
  }
}
```

### Get product images (blank product photos)
`GET /v2/catalog/products/{id}/images`

### Get variant images
`GET /v2/catalog/variants/{variant_id}/images`

### Get mockup styles for a product
`GET /v2/catalog/products/{id}/mockup-styles`

### Get mockup templates for a product
`GET /v2/catalog/products/{id}/mockup-templates`

Returns placement options and template metadata for use with the Mockup Generator.

Query param: `technique` — e.g. `DTG`

### Get shipping countries
`GET /v2/catalog/products/{id}/shipping-countries`

---

## Categories

### List categories
`GET /v2/catalog/categories`

### Get single category
`GET /v2/catalog/categories/{id}`

### Get categories for a product
`GET /v2/catalog/products/{id}/categories`

---

## Important Notes

- The catalog is the **master list of blank products Printful stocks**.
- When creating orders or sync products, always reference `catalog_variant_id` (not product ID).
- Discontinued products (`is_discontinued: true`) should not be used for new products.
- `avg_fulfillment_time` is in business days.
