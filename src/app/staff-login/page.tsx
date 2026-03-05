"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Shield, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { ERROR_CODES, getUserMessage } from "@/lib/error-codes";
import { PasswordInput } from "@/components/PasswordInput";

function showErrorWithCode(code: string, customMessage?: string) {
  const errorDef = ERROR_CODES[code];
  const message = customMessage || errorDef?.userFriendlyMessage || 'An error occurred';
  toast.error(`[${code}] ${message}`);
}

function setStaffSessionCookie() {
  // Use both cookie AND localStorage for iframe compatibility
  // Cookies may be blocked as third-party in iframe contexts
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const sameSite = isSecure ? 'None' : 'Lax';
  const secure = isSecure ? '; Secure' : '';
  document.cookie = `staff-session=true; path=/; max-age=86400; SameSite=${sameSite}${secure}`;
  // Also store in localStorage as backup
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('staff-session', 'true');
  }
}

function setAdminSessionCookie() {
  // Use both cookie AND localStorage for iframe compatibility
  // Cookies may be blocked as third-party in iframe contexts
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const sameSite = isSecure ? 'None' : 'Lax';
  const secure = isSecure ? '; Secure' : '';
  document.cookie = `admin-session=true; path=/; max-age=86400; SameSite=${sameSite}${secure}`;
  // Also store in localStorage as backup
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('admin-session', 'true');
  }
}

function clearStaffSessionCookie() {
  document.cookie = "staff-session=; path=/; max-age=0";
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('staff-session');
  }
}

function clearAdminSessionCookie() {
  document.cookie = "admin-session=; path=/; max-age=0";
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('admin-session');
  }
}

function StaffLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const { data: session, refetch } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const redirect = searchParams.get("redirect");
  const reason = searchParams.get("reason");
  
  // If user was sent here due to missing session cookies, skip auto-redirect
  const shouldSkipAutoRedirect = reason === 'staff-login-required';

// When user is already logged in, check their role TAGS (Staff/Admin) and redirect appropriately
    useEffect(() => {
      const checkRoleAndRedirect = async () => {
        if (!session?.user?.id) return;
        
        // CRITICAL: If user was redirected here due to missing staff/admin session,
        // don't auto-redirect them back - they need to re-authenticate through the form
        // This prevents endless redirect loops
        if (shouldSkipAutoRedirect) {
          // Show the form - user was sent here because they lack proper session cookies
          // They may be logged in with a regular session but need staff/admin cookies
          setIsCheckingRole(false);
          return;
        }
        
        setIsCheckingRole(true);
        
        try {
// Check if user is system admin (admin@ucon.* pattern gets automatic access)
            const userEmail = session.user.email?.toLowerCase() || '';
            const isSystemAdmin = userEmail.startsWith('admin@ucon') || userEmail === 'admin@uconministries.org';
            
            // Check user's role assignments AND actual tags from database
            const [rolesResponse, tagsResponse] = await Promise.all([
              fetch(`/api/user-roles?userId=${session.user.id}`),
              fetch(`/api/role-tags?userId=${session.user.id}`)
            ]);
            
            if (!rolesResponse.ok && !isSystemAdmin) {
              showErrorWithCode('A1015');
              router.push("/");
              return;
            }

            const roles = await rolesResponse.json();
            const userTags = tagsResponse.ok ? await tagsResponse.json() : [];
            const tagNames = userTags.map((t: any) => t.tag.toLowerCase());
            
            // Get the user's highest (lowest number) role level
            const roleLevel = roles.length > 0 
              ? Math.min(...roles.map((r: any) => r.roleLevel || 99))
              : 99;
            
            if (roles.length > 0 || isSystemAdmin) {
              // Check for actual tags in database
              const hasAdminTag = tagNames.includes('admin');
              const hasStaffTag = tagNames.includes('staff');
              const hasConvictTagOnly = tagNames.length === 1 && tagNames.includes('convict');
              
              // Staff login page CANNOT issue cookies for users who only have Convict tag
              if (hasConvictTagOnly && !isSystemAdmin) {
                showErrorWithCode('A1018');
                router.push("/login");
                return;
              }
              
              // SYSTEM ADMIN: admin@ucon.* users always get both cookies
              if (isSystemAdmin) {
                setStaffSessionCookie();
                setAdminSessionCookie();
                setTimeout(() => {
                  window.location.href = redirect || "/admin";
                }, 100);
                return;
              }
              
                // CRITICAL: Cookie issuance based on BOTH role level AND tag presence
                // Admin cookie: Only if roleLevel === 1 AND has admin tag
                // Staff cookie: Only if roleLevel <= 4 AND has staff tag
                // REDIRECT: Admin tag users go to /admin, staff-only users go to /staff/tools
                
                const shouldGetAdminCookie = roleLevel === 1 && hasAdminTag;
                const shouldGetStaffCookie = roleLevel >= 1 && roleLevel <= 4 && hasStaffTag;
                
                if (shouldGetAdminCookie) {
                  // User has Admin tag → always redirect to admin tools
                  if (shouldGetStaffCookie) {
                    setStaffSessionCookie();
                  }
                  setAdminSessionCookie();
                  setTimeout(() => {
                    window.location.href = redirect || "/admin";
                  }, 100);
                  return;
                }
                
                if (shouldGetStaffCookie && !shouldGetAdminCookie) {
                  // Staff only - set staff cookie only, go to staff tools
                  setStaffSessionCookie();
                  clearAdminSessionCookie();
                  setTimeout(() => {
                    window.location.href = redirect || "/staff/tools";
                  }, 100);
                  return;
                }
              
              // User has role but missing required tags - deny access
              // e.g., Level 2 user without admin tag cannot get admin cookie
              if (roleLevel <= 4 && !hasStaffTag) {
                showErrorWithCode('A1016');
                router.push("/");
                return;
              }
              
              // No Staff or Admin tag found - deny access
              showErrorWithCode('A1015');
              router.push("/");
              return;
            }
            
            // No roles found and not a system admin - deny access to staff portal
            showErrorWithCode('A1015');
            router.push("/");
          } catch (error) {
          console.error("Error checking role:", error);
          showErrorWithCode('A1019');
          router.push("/");
        } finally {
          setIsCheckingRole(false);
        }
      };

      if (session?.user?.id) {
          checkRoleAndRedirect();
        }
      }, [session?.user?.id, redirect, router, shouldSkipAutoRedirect]);

  // Show loading while checking role - BUT NOT if user was redirected here due to missing session
  if ((session?.user?.id || isCheckingRole) && !shouldSkipAutoRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access level...</p>
        </div>
      </div>
    );
  }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        // Step 1: Authenticate with better-auth AND store token/user in localStorage
        const { data, error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });
        
        // Also set auth token in localStorage for session persistence
        if (data?.user) {
          const { setAuthToken } = await import("@/lib/auth-token");
          setAuthToken(
            data.token || `session-${Date.now()}`,
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || undefined,
              image: data.user.image || undefined,
            },
            formData.rememberMe ? 30 : 7
          );
        }

      if (error) {
          // Map better-auth error codes to our comprehensive error codes
          const errorCode = error.code?.toUpperCase() || '';
          const errorMessage = (error.message || '').toLowerCase();
          
          // User not found / Email not in system
          if (errorCode === 'USER_NOT_FOUND' || 
              errorCode === 'INVALID_EMAIL' || 
              errorMessage.includes('user not found') ||
              errorMessage.includes('no user') ||
              errorMessage.includes('does not exist') ||
              errorMessage.includes('email not found')) {
            showErrorWithCode('A1008'); // No account found with this email
          } 
          // Incorrect password
          else if (errorCode === 'INVALID_PASSWORD' || 
                   errorCode === 'WRONG_PASSWORD' ||
                   errorCode === 'INCORRECT_PASSWORD' ||
                   errorMessage.includes('invalid password') ||
                   errorMessage.includes('wrong password') ||
                   errorMessage.includes('incorrect password') ||
                   errorMessage.includes('password is incorrect')) {
            showErrorWithCode('A1009'); // Incorrect password
          }
          // Generic invalid credentials (could be either email or password)
          else if (errorCode === 'INVALID_CREDENTIALS' ||
                   errorCode === 'CREDENTIALS_INVALID' ||
                   errorMessage.includes('invalid credentials') ||
                   errorMessage.includes('credentials')) {
            showErrorWithCode('A1004'); // Invalid email or password
          }
          // Email not verified
          else if (errorCode === 'ACCOUNT_NOT_VERIFIED' || 
                   errorCode === 'EMAIL_NOT_VERIFIED' ||
                   errorCode === 'UNVERIFIED_EMAIL' ||
                   errorMessage.includes('not verified') ||
                   errorMessage.includes('verify your email')) {
            showErrorWithCode('A1010'); // Account not verified
          }
          // Account locked due to too many attempts
          else if (errorCode === 'ACCOUNT_LOCKED' || 
                   errorCode === 'LOCKED' ||
                   errorMessage.includes('locked') ||
                   errorMessage.includes('too many failed')) {
            showErrorWithCode('A1005'); // Account locked
          }
          // Account suspended by admin
          else if (errorCode === 'ACCOUNT_SUSPENDED' ||
                   errorCode === 'SUSPENDED' ||
                   errorMessage.includes('suspended')) {
            showErrorWithCode('A1011'); // Account suspended
          }
          // Account deactivated
          else if (errorCode === 'ACCOUNT_DEACTIVATED' ||
                   errorCode === 'DEACTIVATED' ||
                   errorCode === 'DISABLED' ||
                   errorMessage.includes('deactivated') ||
                   errorMessage.includes('disabled')) {
            showErrorWithCode('A1012'); // Account deactivated
          }
          // Rate limiting
          else if (errorCode === 'RATE_LIMIT_EXCEEDED' ||
                   errorCode === 'TOO_MANY_REQUESTS' ||
                   errorCode === 'RATE_LIMITED' ||
                   errorMessage.includes('rate limit') ||
                   errorMessage.includes('too many requests') ||
                   errorMessage.includes('try again later')) {
            showErrorWithCode('A1030'); // Rate limit exceeded
          }
          // Password expired
          else if (errorCode === 'PASSWORD_EXPIRED' ||
                   errorMessage.includes('password expired') ||
                   errorMessage.includes('password has expired')) {
            showErrorWithCode('A1013'); // Password expired
          }
          // Generic authentication failure
          else {
            showErrorWithCode('A1014', error.message || 'Authentication failed');
          }
          setIsLoading(false);
          return;
        }

      // Step 2: Verify user ID exists
      if (!data?.user?.id) {
        showErrorWithCode('A1029'); // User ID missing
        setIsLoading(false);
        return;
      }

      const userId = data.user.id;

        // Refetch session to update client state immediately
        await refetch();

          // Check if user is system admin (admin@ucon.* pattern gets automatic access)
          const userEmail = data.user.email?.toLowerCase() || '';
          const isSystemAdmin = userEmail.startsWith('admin@ucon') || userEmail === 'admin@uconministries.org';

          // Check user's roles AND actual tags from database
          const [rolesResponse, tagsResponse] = await Promise.all([
            fetch(`/api/user-roles?userId=${userId}`),
            fetch(`/api/role-tags?userId=${userId}`)
          ]);

          if (!rolesResponse.ok && !isSystemAdmin) {
            showErrorWithCode('A1015'); // No staff role found
            await authClient.signOut();
            setIsLoading(false);
            return;
          }

          const userRoles = await rolesResponse.json();
          const userTags = tagsResponse.ok ? await tagsResponse.json() : [];
          const tagNames = userTags.map((t: any) => t.tag.toLowerCase());

          if ((!userRoles || userRoles.length === 0) && !isSystemAdmin) {
            showErrorWithCode('A1015'); // No staff role found
            await authClient.signOut();
            setIsLoading(false);
            return;
          }

          // Get the user's highest (lowest number) role level
          const roleLevel = userRoles.length > 0 
            ? Math.min(...userRoles.map((r: any) => r.roleLevel || 99))
            : 99;

          // Check for actual tags in database
          const hasAdminTag = tagNames.includes('admin');
          const hasStaffTag = tagNames.includes('staff');
          const hasConvictTagOnly = tagNames.length === 1 && tagNames.includes('convict');

          // Deny access if user only has Convict tag (no Staff or Admin)
          if (hasConvictTagOnly && !isSystemAdmin) {
            showErrorWithCode('A1018'); // Convict-only account
            await authClient.signOut();
            setIsLoading(false);
            return;
          }

          // Deny access if user has no Staff or Admin tag
          if (!hasStaffTag && !hasAdminTag && !isSystemAdmin) {
            showErrorWithCode('A1015'); // No staff role found
            await authClient.signOut();
            setIsLoading(false);
            return;
          }

            // CRITICAL: Cookie issuance based on BOTH role level AND tag presence
            // Admin cookie: Only if roleLevel === 1 AND has admin tag
            // Staff cookie: Only if roleLevel <= 4 AND has staff tag
            // REDIRECT: Admin tag users go to /admin, staff-only users go to /staff/tools
            let targetRedirect = redirect || "/staff/tools";
            
            const shouldGetAdminCookie = roleLevel === 1 && hasAdminTag;
            const shouldGetStaffCookie = roleLevel >= 1 && roleLevel <= 4 && hasStaffTag;
            
            if (isSystemAdmin) {
              setAdminSessionCookie();
              setStaffSessionCookie();
              targetRedirect = redirect || "/admin";
            } else if (shouldGetAdminCookie) {
              // User has Admin tag → always redirect to admin tools, set both cookies if also has staff tag
              if (shouldGetStaffCookie) {
                setStaffSessionCookie();
              }
              setAdminSessionCookie();
              targetRedirect = redirect || "/admin";
            } else if (shouldGetStaffCookie && !shouldGetAdminCookie) {
              // User has Staff tag only (no Admin) → set staff session cookie only, go to staff tools
              setStaffSessionCookie();
              clearAdminSessionCookie();
              targetRedirect = redirect || "/staff/tools";
            } else {
            // User has role level but missing required tags
            // e.g., Level 2 but no admin tag - should not get admin cookie
            // e.g., Level 3 but no staff tag - should not get staff cookie
            if (roleLevel <= 4 && !hasStaffTag) {
              showErrorWithCode('A1016'); // Missing staff tag
              await authClient.signOut();
              setIsLoading(false);
              return;
            }
            showErrorWithCode('A1015'); // No staff role found
            await authClient.signOut();
            setIsLoading(false);
            return;
          }

      // Step 5: Success - redirect using full page navigation to ensure cookies are sent
      toast.success(`Welcome back, ${data.user.name || 'Staff Member'}!`);
      
      // Use window.location for full page navigation - this ensures cookies are properly sent
      // router.push() uses client-side navigation which may not include newly set cookies
      setTimeout(() => {
        window.location.href = targetRedirect;
      }, 300);
    } catch (error) {
      console.error("Staff login error:", error);
      showErrorWithCode('A1014'); // General authentication failure
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
      <div className="absolute inset-0 overlay-gradient opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
          <p className="text-muted-foreground">UCon Ministries Internal Access</p>
        </div>

        {reason === "staff-login-required" && (
          <Alert className="mb-6 border-[#F28C28]/30 bg-[#F28C28]/5">
            <AlertTriangle className="h-4 w-4 text-[#F28C28]" />
            <AlertDescription className="text-sm">
              Admin and Staff Tools require logging in through the Staff Portal. 
              Please sign in below to access these features.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 hover-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-[#A92FFA]" />
              Secure Staff Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access staff tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#A92FFA]" />
                  Staff Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@uconministries.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#A92FFA]" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  className="border-2"
                />
                <p className="text-xs text-muted-foreground">
                  All passwords are encrypted with industry-standard bcrypt encryption
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Keep me signed in
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Access Staff Portal
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
              <div className="mt-4 text-center">
                <Link
                  href="/staff-login/forgot-password"
                  className="text-sm text-[#F28C28] hover:underline font-medium"
                >
                  Forgot password? Reset it here
                </Link>
              </div>

{/* Security Notice */}
              <div className="mt-6 p-4 bg-[#A92FFA]/10 rounded-lg border border-[#A92FFA]/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#A92FFA] mb-1">Security & Compliance Notice</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• All access attempts are logged and audited</li>
                      <li>• Passwords encrypted with industry-standard bcrypt</li>
                      <li>• Role-based access control (RBAC) enforced</li>
                      <li>• Staff session required for internal tools access</li>
                      <li>• Unauthorized access attempts are reported</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Compliance Warning */}
              <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-500 mb-1">Authorized Personnel Only</p>
                    <p className="text-xs text-muted-foreground">
                      This portal is restricted to authorized UCon Ministries staff members. 
                      Access to internal operations, compliance tools, and sensitive data requires 
                      authentication through this secure staff portal. Regular user login does not 
                      grant access to staff tools.
                    </p>
                  </div>
                </div>
              </div>

            {/* Alternative Login */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Not a staff member?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#A92FFA] hover:underline"
                >
                  Use regular login
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Need staff access?{" "}
                <Link
                  href="/contact"
                  className="text-[#F28C28] hover:underline"
                >
                  Contact administrator
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Staff Portal v1.0 • UCon Ministries Internal System
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            By logging in, you agree to our{" "}
            <Link href="/terms-of-service" className="text-[#A92FFA] hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <StaffLoginContent />
    </Suspense>
  );
}
