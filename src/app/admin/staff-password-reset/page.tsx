"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, Mail, ArrowLeft, Copy, CircleCheck, AlertTriangle } from "lucide-react";
import { ERROR_CODES } from "@/lib/error-codes";

function showErrorWithCode(code: string, reason?: string) {
  const errorDef = ERROR_CODES[code];
  const baseMessage = errorDef?.userFriendlyMessage || 'An error occurred';
  const fullMessage = reason 
    ? `${baseMessage} (Reason: ${reason})`
    : baseMessage;
  toast.error(`[${code}] ${fullMessage}`);
}

export default function StaffResetPasswordPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [email, setEmail] = useState("");
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    temporaryPassword?: string;
    userName?: string;
    resetBy?: { name: string; email: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Check authentication and permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (isPending) return;

      if (!session?.user) {
        toast.error("Authentication required");
        router.push("/staff-login");
        return;
      }

      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/role-permissions/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            permissionName: "Manage Staff",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasPermission) {
            setHasPermission(true);
            setIsChecking(false);
          } else {
            toast.error("Access denied. 'Manage Staff' permission required.");
            router.push("/staff-login");
          }
        } else {
          toast.error("Failed to verify permissions");
          router.push("/staff-login");
        }
      } catch (error) {
        console.error("Permission check error:", error);
        toast.error("Error verifying permissions");
        router.push("/staff-login");
      }
    };

    checkPermissions();
  }, [session, isPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetResult(null);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/staff/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetResult({
          success: true,
          temporaryPassword: data.temporaryPassword,
          userName: data.user.name,
            resetBy: data.resetBy,
          });
          toast.success("Password reset successfully!");
        } else {
          // Handle specific error codes
            switch (data.code) {
              case "UNAUTHORIZED":
                showErrorWithCode('A1001', 'No active session found');
                router.push("/staff-login");
                break;
              case "INSUFFICIENT_PERMISSIONS":
                showErrorWithCode('A1003', "'Manage Staff' permission required");
                break;
              case "INSUFFICIENT_AUTHORITY":
                showErrorWithCode('A1020', "Target staff has higher authority level than you");
                break;
              case "USER_NOT_FOUND":
                showErrorWithCode('A1008', 'No account found with this email address');
                break;
              case "NOT_STAFF":
                showErrorWithCode('A1015', 'This user is not a staff member');
                break;
              default:
                showErrorWithCode('S1001', data.error || "Failed to reset password");
            }
          setIsLoading(false);
        }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (resetResult?.temporaryPassword) {
      navigator.clipboard.writeText(resetResult.temporaryPassword);
      setCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (isChecking || isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A92FFA]" />
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
      <div className="absolute inset-0 overlay-gradient opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Staff Password Reset</h1>
          <p className="text-muted-foreground">Secure password reset for staff accounts</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Administrator Action
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This action will reset the staff member's password and require them to change it on next login. This action is logged for security purposes.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Reset Staff Password
            </CardTitle>
            <CardDescription className="text-center">
              {resetResult?.success 
                ? "Temporary password generated" 
                : "Enter staff email to generate new temporary password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetResult ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#A92FFA]" />
                    Staff Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@uconministries.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a registered staff account
                  </p>
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
                      Generating Password...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Success Message */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Password Reset Successful
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        A temporary password has been generated for {resetResult.userName}
                      </p>
                      {resetResult.resetBy && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Reset by: {resetResult.resetBy.name} ({resetResult.resetBy.email})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Temporary Password Display */}
                <div className="space-y-2">
                  <Label>Temporary Password</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={resetResult.temporaryPassword || ""}
                      readOnly
                      className="border-2 font-mono text-lg pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={handleCopyPassword}
                    >
                      {copied ? (
                        <CircleCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the copy icon to copy the password
                  </p>
                </div>

                {/* Important Notice */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Important Notice
                      </p>
                      <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                        <li>• This password is temporary and must be changed on first login</li>
                        <li>• Share this password securely with the staff member</li>
                        <li>• The staff member will be required to set a new password</li>
                        <li>• This action has been logged for security audit</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setResetResult(null);
                      setEmail("");
                      setIsLoading(false);
                    }}
                  >
                    Reset Another Password
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28]"
                    asChild
                  >
                    <Link href="/admin/staff">
                      Go to Staff Management
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            {!resetResult && (
              <div className="mt-6 p-4 bg-[#A92FFA]/10 rounded-lg border border-[#A92FFA]/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#A92FFA] mb-1">Security Features</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Requires "Manage Staff" permission</li>
                      <li>✓ Cannot reset higher authority passwords</li>
                      <li>✓ Secure temporary password generation</li>
                      <li>✓ Requires password change on first login</li>
                      <li>✓ All actions are logged for audit</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-2 text-sm text-[#A92FFA] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Management
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Secure Staff Password Reset • UCon Ministries
          </p>
        </div>
      </div>
    </div>
  );
}