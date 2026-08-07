const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE}/auth/google/login`,
    REFRESH: `${API_BASE}/auth/refresh`,
    LOGOUT: `${API_BASE}/auth/logout`,
  },
  USER: {
    PROFILE: `${API_BASE}/auth/user/me/profile`,
    DELETE: `${API_BASE}/auth/user/me`,
  },
  QUERY: `${API_BASE}/query`,
  // end_point GET /collections
  COLLECTIONS: `${API_BASE}/collections`,
} as const;
