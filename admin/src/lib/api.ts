import env from "@/config/env.config";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Track ongoing refresh promise to prevent duplicate parallel refresh requests
let isRefreshing = false;
let refreshSubscribers: ((ok: boolean) => void)[] = [];

function onTokenRefreshed(ok: boolean) {
  refreshSubscribers.forEach((cb) => cb(ok));
  refreshSubscribers = [];
}

async function performRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${env.API_URL}/admin/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const ok = res.ok;
    onTokenRefreshed(ok);
    return ok;
  } catch {
    onTokenRefreshed(false);
    return false;
  } finally {
    isRefreshing = false;
  }
}

async function request<T>(method: ApiMethod, path: string, body?: unknown, isRetry = false): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  let res = await fetch(`${env.API_URL}${path}`, options);

  // If 401 Unauthorized and not already refreshing/logging in, attempt automatic token refresh
  if (res.status === 401 && !isRetry && !path.includes("/admin/auth/login") && !path.includes("/admin/auth/refresh")) {
    const refreshed = await performRefresh();
    if (refreshed) {
      // Retry original request once with fresh token cookie
      return request<T>(method, path, body, true);
    }
  }

  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: "Failed to parse server response",
    data: null as unknown as T,
  }));

  if (!res.ok) {
    throw new ApiError(res.status, json.message || "Request failed");
  }

  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string, body?: unknown) => request<T>("DELETE", path, body),
  upload: <T>(path: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<T>("POST", path, form);
  },
};

export type { ApiResponse, PaginatedData, ApiError };
