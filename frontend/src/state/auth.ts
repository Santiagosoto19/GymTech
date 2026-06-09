import type { AuthUser } from '../lib/api';

const TOKEN_KEY = 'gymtech_token';
const USER_KEY = 'gymtech_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateUserInSession(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  receptionist: '/reception',
  trainer: '/trainer',
  client: '/client/home',
};

export function getDefaultRoute(role: string): string {
  return ROLE_ROUTES[role] || '/login';
}
