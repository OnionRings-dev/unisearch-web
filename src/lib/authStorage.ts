export type AuthState = {
  token: string;
  userId: number;
  email: string;
};

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

let inMemoryAuth: AuthState | null = null;

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function clearStoredAuth() {
  inMemoryAuth = null;
}

export function getStoredAuth(): AuthState | null {
  if (!inMemoryAuth) return null;
  const payload = parseJwtPayload(inMemoryAuth.token);
  if (!payload || payload.id === undefined) {
    clearStoredAuth();
    return null;
  }
  if (isTokenExpired(inMemoryAuth.token)) {
    clearStoredAuth();
    return null;
  }
  return inMemoryAuth;
}

export function storeAuth(token: string, userId: number, email: string) {
  inMemoryAuth = { token, userId, email };
}
