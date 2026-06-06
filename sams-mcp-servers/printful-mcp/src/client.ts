const BASE_URL = "https://api.printful.com";

type QueryParams = Record<string, string | number | undefined>;

export class PrintfulClient {
  constructor(private readonly token: string) {}

  private async request<T>(path: string, params?: QueryParams): Promise<T> {
    const url = new URL(BASE_URL + path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(
        `Printful API ${response.status} ${response.statusText}: ${body}`,
      );
    }

    const parsed = JSON.parse(body) as { result: T; code?: number };
    return parsed.result;
  }

  getStoreInfo() {
    return this.request<unknown>("/store");
  }

  listStoreProducts(params?: { offset?: number; limit?: number; status?: string }) {
    return this.request<unknown>("/store/products", params);
  }

  getStoreProduct(id: number | string) {
    return this.request<unknown>(`/store/products/${id}`);
  }

  listCatalogProducts(params?: { category_id?: number }) {
    return this.request<unknown>("/products", params);
  }

  getCatalogProduct(id: number | string) {
    return this.request<unknown>(`/products/${id}`);
  }

  listOrders(params?: {
    status?: string;
    offset?: number;
    limit?: number;
  }) {
    return this.request<unknown>("/orders", params);
  }

  getOrder(id: number | string) {
    return this.request<unknown>(`/orders/${id}`);
  }
}
