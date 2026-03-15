"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { 
  CircleCheck, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  User, 
  Mail, 
  Shield,
  RefreshCw,
  LogOut
} from "lucide-react";

export default function AuthDiagnosticPage() {
  const { data: session, isPending, refetch } = useSession();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "Test User",
    email: "testuser@example.com",
    password: "TestPassword123!"
  });
  const [loginData, setLoginData] = useState({
    email: "testuser@example.com",
    password: "TestPassword123!"
  });

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User created successfully!");
        // Update login form with new credentials
        setLoginData({
          email: newUser.email,
          password: newUser.password
        });
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast.error(`Login failed: ${error.message || error.code}`);
        console.error("Login error:", error);
      } else {
        toast.success("Login successful!");
        refetch(); // Refresh session
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Auth System Diagnostic</h1>
          <p className="text-muted-foreground">
            Test authentication, session management, and logged-in user display
          </p>
        </div>

        {/* Session Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
              ) : session ? (
                <CircleCheck className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Current Session Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading session...</span>
              </div>
            ) : session?.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {getUserInitials(session.user.name || 'U')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                        <CircleCheck className="w-3 h-3 mr-1" />
                        Session Active
                      </Badge>
                      <Badge className="bg-[#A92FFA]/10 text-[#A92FFA] border-0">
                        10 Hours Valid
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{session.user.id}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Bearer Token</p>
                    <p className="font-mono text-xs truncate">
                      {localStorage.getItem("bearer_token")?.slice(0, 20) || "None"}...
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => refetch()} variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Session
                  </Button>
                  <Button onClick={handleSignOut} variant="destructive" className="flex-1">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">No Active Session</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You are not logged in. Create a test user and login below to see the authenticated display.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Test User */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#A92FFA]" />
                1. Create Test User
              </CardTitle>
              <CardDescription>
                Create a new user account with proper password hashing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Test User"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="testuser@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="TestPassword123!"
                  autoComplete="off"
                />
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#F28C28]" />
                2. Test Login
              </CardTitle>
              <CardDescription>
                Login with the test account to activate session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="testuser@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="TestPassword123!"
                  autoComplete="off"
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-[#F28C28] hover:bg-[#F28C28]/90"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-2 border-[#A92FFA]/20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Diagnostic Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge className="bg-[#A92FFA] text-white">1</Badge>
              <p>
                <strong>Create a test user</strong> using the form above. This ensures proper password hashing.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#F28C28] text-white">2</Badge>
              <p>
                <strong>Login with test credentials.</strong> The session should activate and show in the status card.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-500 text-white">3</Badge>
              <p>
                <strong>Check Navigation & Footer.</strong> Scroll to top/bottom to see the contemporary logged-in user display with avatar, status badge, and dropdown.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">4</Badge>
              <p>
                <strong>Session persists for 10 hours.</strong> The logged-in display will show site-wide until logout or expiration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visual Preview */}
        {session?.user && (
          <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CircleCheck className="w-5 h-5" />
                ✅ Success! Navigation Preview
              </CardTitle>
              <CardDescription>
                This is how you'll appear in the Navigation and Footer site-wide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background rounded-lg border-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {getUserInitials(session.user.name || 'U')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{session.user.name}</p>
                    <Badge className="mt-1 h-5 text-[10px] px-1.5 bg-[#A92FFA]/10 text-[#A92FFA] border-0">
                      <CircleCheck className="w-2.5 h-2.5 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                👆 Now scroll to the top or bottom of this page to see it live in the Navigation/Footer!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
