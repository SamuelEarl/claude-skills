# Printful v2 Shipping Rates API Reference

Base path: `https://api.printful.com/v2/shipping/`

---

## Calculate shipping rates

`POST /v2/shipping/rates`

```json
{
  "recipient": {
    "address1": "123 Main St",
    "city": "Los Angeles",
    "state_code": "CA",
    "country_code": "US",
    "zip": "90001"
  },
  "items": [
    {
      "catalog_variant_id": 4011,
      "quantity": 2
    }
  ],
  "currency": "USD",
  "locale": "en_US"
}
```

### Recipient fields

| Field | Required | Description |
|---|---|---|
| `address1` | Yes | Street address |
| `city` | Yes | City |
| `country_code` | Yes | ISO 2-letter code, e.g. `US`, `GB`, `DE` |
| `state_code` | For US/CA | State/province code |
| `zip` | Yes | Postal code |

### Item fields

Either `catalog_variant_id` or `variant_id` (sync variant) per item.

---

## Response

```json
{
  "data": [
    {
      "shipping": "STANDARD",
      "shipping_method_name": "Flat Rate (Estimated delivery: Jun 10–14)",
      "rate": "4.79",
      "currency": "USD",
      "min_delivery_days": 3,
      "max_delivery_days": 7,
      "min_delivery_date": "2024-06-10",
      "max_delivery_date": "2024-06-14",
      "shipments": [
        {
          "departure_country": "US",
          "shipment_items": [
            { "catalog_variant_id": 4011, "quantity": 2 }
          ],
          "customs_fees_possible": false
        }
      ]
    },
    {
      "shipping": "EXPRESS",
      "shipping_method_name": "Express (1-3 business days)",
      "rate": "14.99",
      "currency": "USD",
      "min_delivery_days": 1,
      "max_delivery_days": 3,
      ...
    }
  ]
}
```

---

## Customs fees

Check `customs_fees_possible` in each shipment to warn international customers:

```json
"shipments": [{ "departure_country": "US", "customs_fees_possible": true }]
```

This is common for shipments from US → EU, UK post-Brexit, etc.

---

## Getting available countries

`GET /v2/countries`

Returns the full list of countries Printful ships to, with state/province lists for countries that require them.

---

## Typical integration pattern

```
1. Customer enters shipping address at checkout
2. POST /v2/shipping/rates with address + cart items
3. Display returned shipping options + prices to customer
4. Customer selects method
5. Pass selected shipping method to POST /v2/orders as shipping field
6. Confirm order
```
