"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath: string;
  onSuccess?: () => void;
  allowGuest?: boolean;
}

export function AuthDialog({ open, onOpenChange, redirectPath, onSuccess, allowGuest = true }: AuthDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Sign In State
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Sign Up State
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Guest State
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: signInData.email,
        password: signInData.password,
        rememberMe: signInData.rememberMe,
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please try again.");
        setSignInLoading(false);
        return;
      }

      toast.success("Welcome back!");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred. Please try again.");
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signUpData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSignUpLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: signUpData.email,
        name: signUpData.name,
        password: signUpData.password,
      });

      if (error?.code) {
        if (error.code === "USER_ALREADY_EXISTS") {
          toast.error("Email already registered. Please sign in instead.");
          setActiveTab("signin");
        } else {
          toast.error("Registration failed. Please try again.");
        }
        setSignUpLoading(false);
        return;
      }

      toast.success("Account created! Signing you in...");
      
      // Auto sign in after registration
      const signInResult = await authClient.signIn.email({
        email: signUpData.email,
        password: signUpData.password,
      });

      if (!signInResult.error) {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectPath);
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred. Please try again.");
      setSignUpLoading(false);
    }
  };

  const handleGuestContinue = () => {
    if (!guestName.trim()) {
      toast.error("Please enter your name to continue as guest");
      return;
    }

    if (guestName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setGuestLoading(true);

    // Store guest info in localStorage
    localStorage.setItem("guest_user", JSON.stringify({
      name: guestName.trim(),
      isGuest: true,
      joinedAt: new Date().toISOString()
    }));

    toast.success(`Welcome, ${guestName}!`);
    onOpenChange(false);
    
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Join Workshop</DialogTitle>
          <DialogDescription className="text-center">
            {allowGuest ? "Sign in or continue as guest to join this workshop" : "Sign in or create an account to join this workshop"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                  disabled={signInLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                  disabled={signInLoading}
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="signin-remember"
                  checked={signInData.rememberMe}
                  onCheckedChange={(checked) =>
                    setSignInData({ ...signInData, rememberMe: checked as boolean })
                  }
                  disabled={signInLoading}
                />
                <Label htmlFor="signin-remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                disabled={signInLoading}
              >
                {signInLoading ? (
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
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  required
                  disabled={signUpLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                  disabled={signUpLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                  disabled={signUpLoading}
                  autoComplete="off"
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Re-enter password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  required
                  disabled={signUpLoading}
                  autoComplete="off"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                disabled={signUpLoading}
              >
                {signUpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
            or
          </span>
        </div>

        {allowGuest && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="text-center mb-3">
              <h3 className="font-semibold text-sm flex items-center justify-center gap-2">
                <UserCircle className="w-4 h-4" />
                Continue as Guest
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Join without an account (limited features)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-name" className="text-sm">
                Your Name
              </Label>
              <Input
                id="guest-name"
                type="text"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={guestLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGuestContinue();
                  }
                }}
                maxLength={50}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestContinue}
              disabled={guestLoading || !guestName.trim()}
            >
              {guestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Join as Guest
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-service" className="text-[#A92FFA] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-[#A92FFA] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}