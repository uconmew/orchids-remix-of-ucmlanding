"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Lock, CircleCheck, Eye, EyeOff, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";
import { ERROR_CODES } from "@/lib/error-codes";

function showErrorWithCode(code: string, customMessage?: string) {
  const errorDef = ERROR_CODES[code];
  const message = customMessage || errorDef?.userFriendlyMessage || 'An error occurred';
  toast.error(`[${code}] ${message}`);
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [formData, setFormData] = useState({
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

  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("No reset token provided. Please request a new password reset link.");
        setIsValidating(false);
        return;
      }

      setTokenValid(true);
      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    const password = formData.newPassword;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@$!%*?&#^()_+\-=\[\]{}|;:'"<>,./`~]/.test(password),
    });
  }, [formData.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      showErrorWithCode('I1001');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      showErrorWithCode('A1024');
      return;
    }

    setIsLoading(true);

      try {
        const { error } = await authClient.resetPassword({
          newPassword: formData.newPassword,
          token: token!,
        });

        if (error) {
          const errorCode = (error.code || '').toUpperCase();
          const errorMessage = (error.message || '').toLowerCase();

          // Token-related errors
          if (errorCode === 'INVALID_TOKEN' || 
              errorCode === 'TOKEN_EXPIRED' ||
              errorCode === 'TOKEN_NOT_FOUND' ||
              errorMessage.includes('invalid token') ||
              errorMessage.includes('expired') ||
              errorMessage.includes('token')) {
            setTokenError("This reset link has expired or is invalid. Please request a new password reset.");
            setTokenValid(false);
          // Password strength errors
          } else if (errorCode === 'PASSWORD_TOO_WEAK' ||
                     errorMessage.includes('weak') ||
                     errorMessage.includes('requirements')) {
            showErrorWithCode('A1024');
          // Auth-related errors that shouldn't block password reset (no login required)
          } else if (errorCode === 'UNAUTHORIZED' ||
                     errorCode === 'NOT_AUTHENTICATED' ||
                     errorMessage.includes('auth') ||
                     errorMessage.includes('login') ||
                     errorMessage.includes('session')) {
            // This is a false positive - password reset doesn't require auth
            // The token itself IS the authentication
            setTokenError("Reset link authentication failed. The link may have expired. Please request a new password reset.");
            setTokenValid(false);
          } else {
            showErrorWithCode('S1001', error.message || 'Failed to reset password');
          }
          setIsLoading(false);
          return;
        }

      setResetComplete(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      console.error("Password reset error:", error);
      showErrorWithCode('S1001');
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenError || !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="absolute inset-0 overlay-gradient opacity-30" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground">This password reset link is invalid or has expired</p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {tokenError || "The reset link is invalid or has expired."}
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">This can happen if:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The link has already been used</li>
                  <li>The link has expired (links are valid for 1 hour)</li>
                  <li>The link was copied incorrectly</li>
                </ul>
              </div>

              <div className="pt-4 space-y-3">
                <Button className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28]" asChild>
                  <Link href="/staff-login/forgot-password">
                    Request New Reset Link
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/staff-login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="absolute inset-0 overlay-gradient opacity-30" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
              <CircleCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Reset Complete!</h1>
            <p className="text-muted-foreground">Your password has been changed successfully</p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CircleCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your password has been updated. You can now log in with your new password.
                </AlertDescription>
              </Alert>

              <div className="pt-4">
                <Button className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28]" asChild>
                  <Link href="/staff-login">
                    <Lock className="mr-2 h-4 w-4" />
                    Go to Staff Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
      <div className="absolute inset-0 overlay-gradient opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card className="border-2 hover-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-[#A92FFA]" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#A92FFA]" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    disabled={isLoading}
                    className="border-2 pr-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#A92FFA]" />
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                    className="border-2 pr-10"
                    autoComplete="new-password"
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

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium mb-2">Password must contain:</p>
                <div className="space-y-1.5">
                  <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter (A-Z)" />
                  <PasswordRequirement met={passwordValidation.hasLowercase} text="One lowercase letter (a-z)" />
                  <PasswordRequirement met={passwordValidation.hasNumber} text="One number (0-9)" />
                  <PasswordRequirement met={passwordValidation.hasSpecialChar} text="One special character" />
                </div>
              </div>

              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                    Passwords do not match
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90"
                disabled={isLoading || !Object.values(passwordValidation).every(Boolean) || formData.newPassword !== formData.confirmPassword}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/staff-login"
                className="inline-flex items-center gap-2 text-sm text-[#A92FFA] hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
