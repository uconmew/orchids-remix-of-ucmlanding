"use client"
import { createAuthClient } from "better-auth/react"
import * as React from "react"
import { 
    setAuthToken, 
    getAuthToken, 
    getAuthUser, 
    clearAuthToken, 
    isAuthenticated,
    type AuthUser 
} from "./auth-token"

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
    fetchOptions: {
        credentials: "include",
    }
});

export const { signIn: betterAuthSignIn, signOut: betterAuthSignOut, signUp: betterAuthSignUp } = authClient;

export function useSession() {
    const [data, setData] = React.useState<{ user: AuthUser } | null>(null);
    const [isPending, setIsPending] = React.useState(true);
    
    const checkSession = React.useCallback(() => {
        const user = getAuthUser();
        if (user) {
            setData({ user });
        } else {
            setData(null);
        }
        setIsPending(false);
    }, []);
    
    React.useEffect(() => {
        checkSession();
        
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "ucon-auth-token" || e.key === "ucon-auth-user") {
                checkSession();
            }
        };
        
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [checkSession]);
    
    const refetch = React.useCallback(async () => {
        checkSession();
    }, [checkSession]);
    
    return { data, isPending, refetch };
}

export async function signIn(options: { email: string; password: string; rememberMe?: boolean }) {
    try {
        const result = await betterAuthSignIn.email({
            email: options.email,
            password: options.password,
            rememberMe: options.rememberMe,
        });
        
        if (result.error) {
            return { data: null, error: result.error };
        }
        
        if (result.data?.user) {
            const token = result.data.token || `session-${Date.now()}`;
            setAuthToken(token, {
                id: result.data.user.id,
                email: result.data.user.email,
                name: result.data.user.name || undefined,
                image: result.data.user.image || undefined,
            }, options.rememberMe ? 30 : 7);
        }
        
        return { data: result.data, error: null };
    } catch (error) {
        return { data: null, error: { code: "UNKNOWN_ERROR", message: String(error) } };
    }
}

export async function signOut() {
    try {
        await betterAuthSignOut();
    } catch {
        // Ignore signOut errors
    }
    clearAuthToken();
}

export async function signUp(options: { email: string; password: string; name: string }) {
    try {
        const result = await betterAuthSignUp.email({
            email: options.email,
            password: options.password,
            name: options.name,
        });
        
        if (result.error) {
            return { data: null, error: result.error };
        }
        
        if (result.data?.user) {
            const token = result.data.token || `session-${Date.now()}`;
            setAuthToken(token, {
                id: result.data.user.id,
                email: result.data.user.email,
                name: result.data.user.name || undefined,
                image: result.data.user.image || undefined,
            });
        }
        
        return { data: result.data, error: null };
    } catch (error) {
        return { data: null, error: { code: "UNKNOWN_ERROR", message: String(error) } };
    }
}

export { getAuthToken, getAuthUser, isAuthenticated, clearAuthToken, setAuthToken } from "./auth-token";

export function hasStaffSession(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes('staff-session=true');
}

export function setStaffSession(): void {
    if (typeof document === 'undefined') return;
    document.cookie = "staff-session=true; path=/; max-age=86400; SameSite=Lax";
}

export function clearStaffSession(): void {
    if (typeof document === 'undefined') return;
    document.cookie = "staff-session=; path=/; max-age=0";
}
