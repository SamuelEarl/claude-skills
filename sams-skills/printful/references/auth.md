# Printful Authentication Reference

---

## Private Token (recommended for personal/single-store projects)

Best for: your own ecommerce store where only your code calls the API.

### Getting a token
1. Go to https://developers.printful.com/tokens
2. Click **Create token**
3. Choose client type:
   - **Store** — scoped to one specific store (simpler, recommended for single-store)
   - **Account** — manages all stores on your account (requires `X-PF-Store-Id` header)
4. Select scopes (see table below)
5. Set expiry date
6. Copy the token immediately — it is **not shown again**

### Using a Store-level token
```http
GET https://api.printful.com/v2/orders
Authorization: Bearer YOUR_TOKEN
```

### Using an Account-level token
```http
GET https://api.printful.com/v2/orders
Authorization: Bearer YOUR_TOKEN
X-PF-Store-Id: 12345678
```

### Token expiry
Private tokens have an expiry date you set at creation. They do **not** auto-refresh — you must manually generate a new token before the old one expires and update your environment variables.

---

## Available Scopes

| Scope | Type | Access |
|---|---|---|
| `orders` | Store & Account | Read + write orders |
| `orders/read` | Store & Account | Read orders only |
| `sync_products` | Store & Account | Read + write sync products |
| `sync_products/read` | Store & Account | Read sync products only |
| `file_library` | Store & Account | Upload + read files |
| `file_library/read` | Store & Account | Read files only |
| `webhooks` | Store & Account | Configure webhooks |
| `webhooks/read` | Store & Account | Read webhook config |
| `product_templates` | Account only | Read + write product templates |
| `product_templates/read` | Account only | Read product templates |

Recommended minimum set for a full ecommerce integration:
`orders`, `file_library`, `webhooks`

---

## OAuth / Public App (for multi-merchant SaaS)

Best for: building an app that connects to many different merchants' Printful stores.

### 1. Create app
Go to https://developers.printful.com/apps → Create app.
You'll get a `client_id` and `client_secret`.

### 2. Redirect merchant to auth URL
```
https://www.printful.com/oauth/authorize
  ?client_id={YOUR_CLIENT_ID}
  &state={RANDOM_STATE_VALUE}
  &redirect_url={YOUR_REDIRECT_URL}
```

### 3. Handle callback
On approval, Printful redirects to your `redirect_url` with:
```
?code={AUTH_CODE}&state={STATE}&success=1
```
Verify `state` matches what you sent to prevent CSRF.

### 4. Exchange code for tokens
```http
POST https://www.printful.com/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_FROM_CALLBACK"
}
```

Response:
```json
{
  "access_token": "smk_...",
  "expires_at": "1749123456",
  "token_type": "bearer",
  "refresh_token": "902LmW0s..."
}
```

### 5. Use access token
```http
Authorization: Bearer ACCESS_TOKEN
```

### 6. Refresh before expiry
`access_token` expires in **1 hour**. `refresh_token` expires in **90 days** if unused.

```http
POST https://www.printful.com/oauth/token

{
  "grant_type": "refresh_token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "REFRESH_TOKEN"
}
```

Returns a new `access_token` + `refresh_token` pair. Store both.

### Token storage for multi-merchant apps
Store per-merchant in your database:
```typescript
interface PrintfulCredentials {
  merchant_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
}
```
Before each API call, check `expires_at` and refresh proactively (e.g. if expiry is within 5 minutes).

---

## Environment variables

```env
# .env (never commit this file)
PRINTFUL_TOKEN=your_private_token_here

# Only for account-level tokens managing multiple stores:
PRINTFUL_STORE_ID=12345678

# For OAuth apps:
PRINTFUL_CLIENT_ID=your_client_id
PRINTFUL_CLIENT_SECRET=your_client_secret
PRINTFUL_WEBHOOK_SECRET=your_webhook_signing_secret
```
