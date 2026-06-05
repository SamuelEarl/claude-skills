export class PrintfulClient {
  private readonly baseUrl = "https://api.printful.com";
  private readonly token: string;
  private readonly storeId?: string;

  constructor(token: string, storeId?: string) {
    this.token = token;
    this.storeId = storeId;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
    if (this.storeId) {
      headers["X-PF-Store-Id"] = this.storeId;
    }
    return headers;
  }

  async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    if (!res.ok) {
      const err = data as Record<string, unknown>;
      const detail = err.detail ?? err.result ?? err.error ?? text;
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(detail)}`);
    }

    return data as T;
  }
}
