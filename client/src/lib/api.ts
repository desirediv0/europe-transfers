import env from "@/config/env.config";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  const text = await res.text();
  return { success: res.ok, message: text || res.statusText, data: null };
}

async function request<T>(method: ApiMethod, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${env.API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Network error. Please check your connection.");
  }

  const json: ApiResponse<T> = await parseResponse(res);

  if (!res.ok) {
    throw new ApiError(res.status, json.message || res.statusText || "Request failed");
  }

  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<T>("POST", path, form);
  },
};

export type { ApiResponse };
