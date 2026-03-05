"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2, LogIn } from "lucide-react";
import { ERROR_CODES } from "@/lib/error-codes";
import { PasswordInput } from "@/components/PasswordInput";

function showErrorWithCode(code: string, customMessage?: string) {
  const errorDef = ERROR_CODES[code];
  const message = customMessage || errorDef?.userFriendlyMessage || 'An error occurred';
  toast.error(`[${code}] ${message}`);
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

    const registered = searchParams.get("registered");
    const redirect = searchParams.get("redirect") || "/convict-portal";

    // Redirect if already logged in
    useEffect(() => {
      if (session && !isPending) {
        router.push(redirect);
      }
    }, [session, isPending, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const { data, error } = await signIn({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });

        if (error) {
          // Map error codes from better-auth to our error codes
          const errorCode = (error as any)?.code;
          if (errorCode === 'INVALID_EMAIL' || errorCode === 'USER_NOT_FOUND') {
            showErrorWithCode('A1008'); // Email not found
          } else if (errorCode === 'INVALID_PASSWORD' || errorCode === 'INVALID_CREDENTIALS') {
            showErrorWithCode('A1009'); // Incorrect password
          } else if (errorCode === 'ACCOUNT_NOT_VERIFIED' || errorCode === 'EMAIL_NOT_VERIFIED') {
            showErrorWithCode('A1010'); // Account not verified
          } else if (errorCode === 'ACCOUNT_LOCKED' || errorCode === 'TOO_MANY_REQUESTS') {
            showErrorWithCode('A1005'); // Account locked
          } else if (errorCode === 'ACCOUNT_SUSPENDED') {
            showErrorWithCode('A1011'); // Account suspended
          } else if (errorCode === 'RATE_LIMIT_EXCEEDED') {
            showErrorWithCode('A1030'); // Rate limit
          } else {
            showErrorWithCode('A1004'); // Generic invalid credentials
          }
          setIsLoading(false);
          return;
        }

        // Refetch session to update client state immediately
        await refetch();

        // Small delay to ensure localStorage is set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if user needs to change password
        try {
          const userResponse = await fetch("/api/users?me=true", {
            credentials: 'include'
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            if (userData.requiresPasswordChange) {
              toast.info("Please change your password to continue");
              router.push("/change-password");
              return;
            }
          }
        } catch (e) {
          // Ignore user fetch errors, proceed with redirect
          console.log("User check skipped:", e);
        }

          // Check if user has staff/admin roles and convict tag
          try {
            const [rolesResponse, tagsResponse] = await Promise.all([
              fetch(`/api/user-roles?userId=${data?.user?.id}`),
              fetch(`/api/role-tags?userId=${data?.user?.id}`)
            ]);
            
            if (rolesResponse.ok) {
              const roles = await rolesResponse.json();
              const userTags = tagsResponse.ok ? await tagsResponse.json() : [];
              const tagNames = userTags.map((t: any) => t.tag.toLowerCase());
              
              if (roles && roles.length > 0) {
                // Get the user's highest (lowest number) role level
                const roleLevel = Math.min(...roles.map((r: any) => r.roleLevel || 99));
                
                // Check actual tags from database
                const hasAdminTag = tagNames.includes('admin');
                const hasStaffTag = tagNames.includes('staff');
                const hasConvictTag = tagNames.includes('convict');

                // Admin (level 1 + admin tag) cannot log into regular portal
                const isAdmin = roleLevel === 1 && hasAdminTag;
                
                // Staff (level 1-4 + staff tag)
                const isStaff = roleLevel >= 1 && roleLevel <= 4 && hasStaffTag;

                // Admin cannot log into regular portal at all
                if (isAdmin && !hasConvictTag) {
                  showErrorWithCode('A1025', "Admin accounts must use the Staff Portal to login.");
                  // Sign them out since they shouldn't be logged in here
                  await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
                  router.push("/staff-login");
                  return;
                }

                // Staff without convict tag cannot log into regular portal
                if (isStaff && !hasConvictTag) {
                  showErrorWithCode('A1006', "Staff accounts without Convict status must use the Staff Portal to login.");
                  // Sign them out since they shouldn't be logged in here
                  await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
                  router.push("/staff-login");
                  return;
                }

                // Staff WITH convict tag - allow but remind about staff portal
                if (isStaff && hasConvictTag) {
                  const userName = data?.user?.name || "Staff Member";
                  toast.info(
                    `Welcome back, ${userName}! To access your Staff Portal, please login through the Staff Login Page.`,
                    {
                      duration: 8000,
                      action: {
                        label: "Staff Login",
                        onClick: () => router.push("/staff-login"),
                      },
                    }
                  );
                } else {
                  toast.success("Welcome back!");
                }
              } else {
                toast.success("Welcome back!");
              }
            } else {
              toast.success("Welcome back!");
            }
          } catch {
            // If role check fails, just show normal welcome
            toast.success("Welcome back!");
          }
          
          // Use router.push instead of full page reload for smoother UX
          router.push(redirect);
      } catch (error) {
        console.error("Login error:", error);
        showErrorWithCode('A1014'); // General authentication failure
        setIsLoading(false);
      }
    };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto">
        {registered && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Account created successfully! Please log in to continue.
            </p>
          </div>
        )}

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your UCon Ministries account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
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
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#A92FFA] hover:underline"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms-of-service" className="text-[#A92FFA] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-[#A92FFA] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Suspense fallback={
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="py-20">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#A92FFA]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <Footer />
    </div>
  );
}