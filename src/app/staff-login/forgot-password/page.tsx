"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Shield, Mail, ArrowLeft, CircleCheck, KeyRound, Hash, UserCheck, Copy, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [staffUcm, setStaffUcm] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!accessCode.trim()) {
      toast.error("Please enter your 4-digit access code");
      return;
    }

    if (!staffUcm.trim()) {
      toast.error("Please enter your Staff UCM (e.g., UCM250001)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!/^\d{4}$/.test(accessCode)) {
      toast.error("Access code must be exactly 4 digits");
      return;
    }

    const ucmRegex = /^UCM\d{2}\d{4}$/i;
    if (!ucmRegex.test(staffUcm)) {
      toast.error("Staff UCM must be in format UCMYY#### (e.g., UCM250001)");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/staff/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          accessCode: accessCode.trim(),
          staffUcm: staffUcm.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setTemporaryPassword(data.temporaryPassword);
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(temporaryPassword);
    toast.success("Password copied to clipboard!");
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5 flex items-center justify-center px-4">
        <div className="absolute inset-0 overlay-gradient opacity-30" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
              <CircleCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Reset Successful</h1>
            <p className="text-muted-foreground">Your temporary password has been generated</p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CircleCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your password has been reset. Use the temporary password below to log in.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                <Label className="text-sm text-muted-foreground mb-2 block">Your Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-mono bg-background px-3 py-2 rounded border">
                    {showPassword ? temporaryPassword : '••••••••••••'}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> You will be required to change this password after logging in.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Next steps:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Copy the temporary password above</li>
                  <li>Go to the Staff Login page</li>
                  <li>Enter your email and temporary password</li>
                  <li>Create a new secure password when prompted</li>
                </ol>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28]" asChild>
                  <Link href="/staff-login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
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
          <h1 className="text-3xl font-bold mb-2">Staff Password Reset</h1>
          <p className="text-muted-foreground">Verify your identity to reset your password</p>
        </div>

        <Card className="border-2 hover-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-[#A92FFA]" />
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to generate a new temporary password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#A92FFA]" />
                  Email Address
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
                  autoComplete="email"
                />
              </div>

                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#F28C28]" />
                    Access Code (4 digits)
                  </Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="1234"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    disabled={isLoading}
                    className="border-2 font-mono text-center text-lg tracking-widest"
                    maxLength={4}
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    The 4-digit code assigned when your staff account was created
                  </p>
                </div>

              <div className="space-y-2">
                <Label htmlFor="staffUcm" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#A92FFA]" />
                  Staff UCM (Employee ID)
                </Label>
                <Input
                  id="staffUcm"
                  type="text"
                  placeholder="UCM250001"
                  value={staffUcm}
                  onChange={(e) => setStaffUcm(e.target.value.toUpperCase())}
                  required
                  disabled={isLoading}
                  className="border-2 font-mono"
                  maxLength={9}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Your staff registration number (format: UCMYY####)
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
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

              <div className="mt-6 p-4 bg-[#A92FFA]/10 rounded-lg border border-[#A92FFA]/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#A92FFA] mb-1">How It Works</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>1. Enter your email address</li>
                      <li>2. Enter your 4-digit access code (assigned at account creation)</li>
                      <li>3. Enter your Staff UCM (employee ID: UCMYY####)</li>
                      <li>4. A temporary password will be generated</li>
                      <li>5. Log in and create a new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center space-y-2">
                <Link
                  href="/staff-login"
                  className="inline-flex items-center gap-2 text-sm text-[#A92FFA] hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Staff Login
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Don't remember your access code?{" "}
              <span className="text-foreground">Contact your administrator</span>
            </p>
          </div>
      </div>
    </div>
  );
}
