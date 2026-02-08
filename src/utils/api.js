// API utility to handle different environments (local, Vercel, etc.)
export function getApiUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  // Check for explicit API URL in environment variables
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    // Remove trailing slash if present
    return envApiUrl.replace(/\/$/, '');
  }

  // In development, use empty string (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production on Vercel or similar platforms
  // If the API is on the same domain (serverless functions), use relative paths
  // If the API is on a different domain, you need to set VITE_API_URL
  const hostname = window.location.hostname;
  
  // For Vercel deployments, if API is on same domain, use relative paths
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    // Try relative path first (works if API is serverless functions on same domain)
    return '';
  }

  // Default to relative path
  return '';
}

export function apiFetch(endpoint, options = {}) {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
