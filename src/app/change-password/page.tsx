"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, CircleCheck, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [requiresChange, setRequiresChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const checkPasswordChangeRequired = async () => {
      if (isPending) return;
      
      if (!session?.user) {
        router.push("/login");
        return;
      }

      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/users?me=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.requiresPasswordChange) {
            setRequiresChange(true);
            setChecking(false);
          } else {
            // User doesn't need to change password, redirect to home
            router.push("/");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking password change requirement:", error);
        router.push("/login");
      }
    };

    checkPasswordChangeRequired();
  }, [session, isPending, router]);

  useEffect(() => {
    // Validate password in real-time
    const password = formData.newPassword;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    });
  }, [formData.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields are filled
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    if (!Object.values(passwordValidation).every(Boolean)) {
      toast.error("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully! You can now access the system.");
        
        // Refetch session to update any state
        await refetch();
        
        // Redirect to home page
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // Handle specific error codes
        switch (data.code) {
          case "INVALID_CURRENT_PASSWORD":
            toast.error("Current password is incorrect");
            break;
          case "PASSWORDS_MISMATCH":
            toast.error("New passwords do not match");
            break;
          case "PASSWORD_TOO_SHORT":
          case "PASSWORD_NO_UPPERCASE":
          case "PASSWORD_NO_LOWERCASE":
          case "PASSWORD_NO_NUMBER":
          case "PASSWORD_NO_SPECIAL_CHAR":
            toast.error(data.error || "Password does not meet requirements");
            break;
          default:
            toast.error(data.error || "Failed to change password");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred while changing password");
      setIsLoading(false);
    }
  };

  if (checking || isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A92FFA]" />
          <p className="text-muted-foreground">Verifying account status...</p>
        </div>
      </div>
    );
  }

  if (!requiresChange) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Password Change Required
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                For security reasons, you must change your initial password before accessing the system.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Change Your Password</CardTitle>
            <CardDescription className="text-center">
              Create a strong, unique password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isLoading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium mb-2">Password must contain:</p>
                <div className="space-y-1.5">
                  <PasswordRequirement
                    met={passwordValidation.minLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasUppercase}
                    text="One uppercase letter (A-Z)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasLowercase}
                    text="One lowercase letter (a-z)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasNumber}
                    text="One number (0-9)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasSpecialChar}
                    text="One special character (@$!%*?&)"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                disabled={isLoading || !Object.values(passwordValidation).every(Boolean)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble? Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CircleCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
      )}
      <span className={met ? "text-foreground" : "text-muted-foreground"}>{text}</span>
    </div>
  );
}
