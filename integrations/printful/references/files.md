# Printful v2 File Library API Reference

Base path: `https://api.printful.com/v2/files`

Requires scope: `file_library` (write) or `file_library/read`

---

## Upload a file

`POST /v2/files`

```json
{
  "url": "https://yourcdn.com/designs/front-print.png",
  "type": "default",
  "filename": "front-print.png"
}
```

| Field | Required | Description |
|---|---|---|
| `url` | Yes | Publicly accessible URL of the design file |
| `type` | No | File type — use `"default"` for most cases |
| `filename` | No | Override filename shown in the file library |

Response:
```json
{
  "data": {
    "id": 123456,
    "type": "default",
    "hash": "abc123...",
    "url": "https://files.cdn.printful.com/...",
    "filename": "front-print.png",
    "mime_type": "image/png",
    "size": 204800,
    "width": 4500,
    "height": 5400,
    "status": "ok"
  }
}
```

Use the returned `id` as `file_id` when building order item layers.

---

## Get a file

`GET /v2/files/{id}`

---

## Supported file formats

| Format | Use case |
|---|---|
| PNG | Recommended — supports transparency |
| PDF | Vector — best for crisp prints |
| JPEG | Photos without transparency |
| SVG | Vector (limited support) |

---

## File requirements

- **Minimum DPI:** 150 dpi at print size (300 dpi recommended)
- **Color mode:** RGB (CMYK files are converted automatically)
- Printful stores uploaded files permanently — you can reuse `file_id` across multiple orders and products
- Files uploaded via URL are fetched by Printful's servers — the URL must be publicly accessible at upload time

---

## Referencing files in orders

Once uploaded, reference files in order item layers:

```json
{
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

See [orders.md](orders.md) for full order item structure.
