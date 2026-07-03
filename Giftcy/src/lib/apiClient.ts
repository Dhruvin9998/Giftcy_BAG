let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api/v1";

if (BASE_URL && !BASE_URL.endsWith("/api/v1") && !BASE_URL.endsWith("/api/v1/")) {
  BASE_URL = BASE_URL.endsWith("/") ? `${BASE_URL}api/v1` : `${BASE_URL}/api/v1`;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request(method: string, endpoint: string, body?: any, options: RequestOptions = {}) {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const config: RequestInit = {
    ...options,
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);

  let data;
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const apiClient = {
  get: (endpoint: string, options?: RequestOptions) => request("GET", endpoint, undefined, options),
  post: (endpoint: string, body: any, options?: RequestOptions) => request("POST", endpoint, body, options),
  put: (endpoint: string, body: any, options?: RequestOptions) => request("PUT", endpoint, body, options),
  delete: (endpoint: string, options?: RequestOptions) => request("DELETE", endpoint, undefined, options),
};
