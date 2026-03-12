// API Client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('autocdb_jwt');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || '請求失敗');
  }

  return response.json();
}

// API client methods
export const apiClient = {
  // Auth endpoints
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    googleAuth: (data: { email: string; name: string; picture?: string }) =>
      apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Cars endpoints
  cars: {
    getAll: (filters?: {
      brand?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const queryString = params.toString();
      return apiRequest(`/cars${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id: number | string) => apiRequest(`/cars/${id}`),

    create: (data: any) =>
      apiRequest('/cars', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number | string, data: any) =>
      apiRequest(`/cars/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number | string) =>
      apiRequest(`/cars/${id}`, {
        method: 'DELETE',
      }),
  },

  // AI endpoints
  ai: {
    search: (query: string) =>
      apiRequest('/ai/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },

  // Favorites endpoints
  favorites: {
    getAll: () => apiRequest('/favorites'),

    add: (carId: number | string) =>
      apiRequest(`/favorites/${carId}`, {
        method: 'POST',
      }),

    remove: (carId: number | string) =>
      apiRequest(`/favorites/${carId}`, {
        method: 'DELETE',
      }),
  },

  // Comparisons endpoints
  comparisons: {
    getAll: () => apiRequest('/comparisons'),

    create: (data: { name?: string; carIds?: number[] }) =>
      apiRequest('/comparisons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    addCar: (listId: number | string, carId: number | string) =>
      apiRequest(`/comparisons/${listId}/cars/${carId}`, {
        method: 'POST',
      }),

    removeCar: (listId: number | string, carId: number | string) =>
      apiRequest(`/comparisons/${listId}/cars/${carId}`, {
        method: 'DELETE',
      }),

    delete: (listId: number | string) =>
      apiRequest(`/comparisons/${listId}`, {
        method: 'DELETE',
      }),
  },
};

export default apiClient;
