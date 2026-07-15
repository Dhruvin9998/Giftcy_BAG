let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api/v1";

if (BASE_URL && !BASE_URL.endsWith("/api/v1") && !BASE_URL.endsWith("/api/v1/")) {
  BASE_URL = BASE_URL.endsWith("/") ? `${BASE_URL}api/v1` : `${BASE_URL}/api/v1`;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

function cleanUrls(obj: any): any {
  if (!obj) return obj;
  
  if (typeof obj === "string") {
    let cleaned = obj;
    const isProduction = typeof window !== "undefined" && 
      !window.location.hostname.includes("localhost") && 
      !window.location.hostname.includes("127.0.0.1");
      
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const backendBase = apiUrl ? apiUrl.replace(/\/api\/v1\/?$/, "") : "";

    // 1. If we are on a production domain, rewrite localhost URLs to point to the active backend domain
    if (isProduction && (cleaned.includes("localhost:5098") || cleaned.includes("127.0.0.1:5098"))) {
      if (backendBase) {
        cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5098/, backendBase);
      }
    }
    
    // 2. If the current site is loaded over HTTPS, upgrade our backend's HTTP URLs to HTTPS
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (backendBase && cleaned.startsWith("http://") && cleaned.includes(backendBase.replace(/^https?:\/\//, ""))) {
        cleaned = cleaned.replace(/^http:\/\//, "https://");
      }
    }
    return cleaned;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUrls);
  }
  
  if (typeof obj === "object") {
    const cleanedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleanedObj[key] = cleanUrls(obj[key]);
      }
    }
    return cleanedObj;
  }
  
  return obj;
}

async function request(method: string, endpoint: string, body?: any, options: RequestOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  // Set up request timeout (4s for GET to prevent SSR timeout, 60s for other methods like uploads)
  const isGet = method.toUpperCase() === "GET";
  const timeoutMs = isGet ? 4000 : 60000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config: RequestInit = {
    ...options,
    method,
    headers,
    signal: controller.signal,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    data = cleanUrls(data);

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export const apiClient = {
  get: (endpoint: string, options?: RequestOptions) => request("GET", endpoint, undefined, options),
  post: (endpoint: string, body: any, options?: RequestOptions) => request("POST", endpoint, body, options),
  put: (endpoint: string, body: any, options?: RequestOptions) => request("PUT", endpoint, body, options),
  delete: (endpoint: string, options?: RequestOptions) => request("DELETE", endpoint, undefined, options),
};
