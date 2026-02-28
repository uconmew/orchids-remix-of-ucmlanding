"use client";

const TOKEN_KEY = "ucon-auth-token";
const USER_KEY = "ucon-auth-user";
const EXPIRY_KEY = "ucon-auth-expiry";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export function setAuthToken(token: string, user: AuthUser, expiresInDays = 7) {
  if (typeof window === "undefined") return;
  
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearAuthToken();
    return null;
  }
  
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearAuthToken();
    return null;
  }
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  const token = getAuthToken();
  const user = getAuthUser();
  const expiryStr = localStorage.getItem(EXPIRY_KEY);
  
  if (!token || !user || !expiryStr) return null;
  
  return {
    token,
    user,
    expiresAt: parseInt(expiryStr, 10),
  };
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function refreshAuthExpiry(expiresInDays = 7) {
  if (typeof window === "undefined") return;
  
  const token = getAuthToken();
  if (!token) return;
  
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
}
