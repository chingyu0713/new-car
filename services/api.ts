// Single source of truth for API base URL
export const API_BASE = import.meta.env.VITE_API_BASE
  || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api');

// Backend host (without /api), used for image URLs etc.
export const API_HOST = import.meta.env.VITE_API_HOST
  || (import.meta.env.DEV ? 'http://localhost:5001' : '');
