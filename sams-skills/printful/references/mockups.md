# Printful v2 Mockup Generator API Reference

Mockup generation is **asynchronous**. The pattern is always: create task → poll for result.

Base path: `https://api.printful.com/v2/mockup-generator/`

Requires scope: `file_library` (uses the file library internally)

---

## Before generating mockups

First, get valid placements and styles for your product:

```
GET /v2/catalog/products/{id}/mockup-styles    → available mockup styles
GET /v2/catalog/products/{id}/mockup-templates → placement templates with dimensions
```

Pass `?technique=DTG` (or other technique) to filter templates.

---

## Create a mockup task

`POST /v2/mockup-generator/tasks`

```json
{
  "catalog_variant_ids": [4011, 4012, 4013],
  "files": [
    {
      "placement": "front",
      "url": "https://yourcdn.com/design.png"
    },
    {
      "placement": "back",
      "url": "https://yourcdn.com/design-back.png"
    }
  ],
  "format": "jpg"
}
```

| Field | Description |
|---|---|
| `catalog_variant_ids` | Array of variant IDs to generate mockups for |
| `files[].placement` | Placement name — check mockup-templates for valid values |
| `files[].url` | Public URL of your design file OR use `file_id` from file library |
| `format` | `jpg` (default) or `png` |

Response:
```json
{
  "data": {
    "task_key": "gt_1234567890abcdef",
    "status": "waiting"
  }
}
```

---

## Poll for result

`GET /v2/mockup-generator/tasks?task_key={key}`

Status values: `waiting` → `processing` → `completed` / `failed`

Poll every 2–3 seconds until status is `completed`.

Completed response:
```json
{
  "data": {
    "task_key": "gt_1234567890abcdef",
    "status": "completed",
    "mockups": [
      {
        "catalog_variant_ids": [4011],
        "placement": "front",
        "mockup_url": "https://files.cdn.printful.com/mockup-generator/cache/..."
      }
    ],
    "printfiles": [
      {
        "catalog_variant_id": 4011,
        "placement": "front",
        "url": "https://files.cdn.printful.com/..."
      }
    ]
  }
}
```

---

## Rate limiting & daily limits

- The mockup generator has a **lower rate limit** than other endpoints — space out task creation requests
- There is a **daily file generation limit** — cache mockup URLs instead of regenerating every time
- Mockup URLs are CDN-cached and remain valid — store them in your database

---

## Typical integration pattern

```
1. User selects product + uploads design
2. GET /v2/catalog/products/{id}/mockup-templates  → get valid placements
3. POST /v2/mockup-generator/tasks                 → start task, get task_key
4. Poll GET /v2/mockup-generator/tasks?task_key=X  → every 2s until completed
5. Store mockup_url in your database
6. Display mockup to user
```
