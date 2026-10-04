/**
 * Centralized API Configuration
 * 
 * IMPORTANT:
 * All backend URLs come strictly from environment variables defined in .env.
 * The backend microservices run on a DIFFERENT laptop on the local network.
 * NEVER hardcode localhost or IP addresses here or in components!
 */

export const API = {
  AUTH: import.meta.env.VITE_AUTH_API_URL,
  PRODUCT: import.meta.env.VITE_PRODUCT_API_URL,
  ORDER: import.meta.env.VITE_ORDER_API_URL,
  PAYMENT: import.meta.env.VITE_PAYMENT_API_URL
};

/**
 * Reusable HTTP fetch helper for microservices
 * Handles:
 * - JWT Authorization header injection
 * - Network failures / backend unreachable
 * - 400, 401, 404, 500 HTTP errors
 * - Friendly beginner-oriented error messages
 * 
 * @param {string} baseUrl - Base URL from API config (e.g., API.AUTH)
 * @param {string} endpoint - Path relative to base URL (e.g., '/api/auth/login')
 * @param {RequestInit} [options={}] - Standard fetch options (method, body, headers, etc.)
 */
export async function apiRequest(baseUrl, endpoint, options = {}) {
  // Validate that the base URL has been configured in .env
  if (!baseUrl || baseUrl.includes('BACKEND_IP')) {
    throw new Error(
      'Backend URL is not configured. Please set the actual IP address in your .env file.'
    );
  }

  // Construct full URL cleanly without duplicate slashes
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${cleanBase}${cleanPath}`;

  // Retrieve JWT token from localStorage if available
  const token = localStorage.getItem('token');

  // Prepare standard headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // If body is FormData or doesn't need Content-Type, allow override
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response;
  try {
    // Normal fetch call (CORS mode is standard 'cors' by default in browsers)
    response = await fetch(fullUrl, {
      ...options,
      headers
    });
  } catch (networkError) {
    // Network errors trigger when backend is offline, firewall blocks port, or IP is wrong
    console.error(`[Network Error] Failed to reach ${fullUrl}:`, networkError);
    throw new Error(
      `Unable to connect to the backend at ${baseUrl}. Please make sure the backend laptop is running and on the same Wi-Fi/LAN network.`
    );
  }

  // Handle HTTP error responses
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Response body wasn't JSON
    }

    let message = errorData?.message || errorData?.error || response.statusText;

    if (response.status === 401) {
      message = 'Your session has expired. Please login again.';
      // Trigger event so AuthContext can clean up state if necessary
      window.dispatchEvent(new CustomEvent('auth:expired'));
    } else if (response.status === 404) {
      message = message || 'Requested item or endpoint was not found.';
    } else if (response.status >= 500) {
      message = message || 'Backend server encountered an error. Please try again later.';
    } else if (response.status === 400) {
      message = message || 'Bad request. Please verify your submitted information.';
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // 204 No Content response
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
