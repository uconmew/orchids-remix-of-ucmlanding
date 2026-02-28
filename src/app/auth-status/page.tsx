"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  CircleCheck, 
  XCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  Lock,
  RefreshCw,
  LogIn,
  UserPlus,
  Shield,
  Search,
  Clock
} from "lucide-react";

export default function AuthStatusPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "Test User",
    email: "test@uconministries.org",
    password: "TestPassword123!"
  });

  // User lookup state
  const [lookupEmail, setLookupEmail] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("bearer_token");
      setBearerToken(token);
    }
  }, []);

  const handleCreateTestUser = async () => {
    setIsCreatingUser(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: newUserData.email,
        password: newUserData.password,
        name: newUserData.name,
      });

      if (error) {
        toast.error(`Failed to create user: ${error.message || error.code}`);
        return;
      }

      toast.success("Test user created successfully! Now logging in...");
      
      // Auto-login after creation
      const { data: loginData, error: loginError } = await authClient.signIn.email({
        email: newUserData.email,
        password: newUserData.password,
      });

      if (loginError) {
        toast.error(`Login failed: ${loginError.message || loginError.code}`);
        return;
      }

      toast.success("Logged in successfully!");
      refetch();
      setTimeout(() => router.push("/"), 1000);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: newUserData.email,
        password: newUserData.password,
      });

      if (error) {
        toast.error(`Login failed: ${error.message || error.code}`);
        return;
      }

      toast.success("Login successful!");
      refetch();
      setTimeout(() => router.push("/"), 1000);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(`Sign out failed: ${error.message || error.code}`);
    } else {
      localStorage.removeItem("bearer_token");
      setBearerToken(null);
      refetch();
      toast.success("Signed out successfully");
    }
  };

  const handleLookupUser = async () => {
    if (!lookupEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLookingUp(true);
    setLookupResult(null);

    try {
      const response = await fetch("/api/users/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: lookupEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to lookup user");
        setLookupResult(null);
        return;
      }

      setLookupResult(data);
      toast.success("User found!");
    } catch (error: any) {
      toast.error("Failed to lookup user");
      setLookupResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get clearance badge color
  const getClearanceBadgeColor = (clearance: number) => {
    if (clearance >= 75) return "bg-green-500";
    if (clearance >= 50) return "bg-yellow-500";
    if (clearance >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 Authentication Status Checker</h1>
          <p className="text-muted-foreground">
            Diagnose auth issues, create test accounts, and check user status
          </p>
        </div>

        {/* User Lookup Tool - Enhanced with Clearance Display */}
        <Card className="mb-6 border-2 border-[#A92FFA]/20 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6 text-[#A92FFA]" />
              User Lookup Tool
            </CardTitle>
            <CardDescription>
              Check any user's authentication status by entering their email (Convict Wide & Staff Wide)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lookupEmail">User Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="lookupEmail"
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLookupUser();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleLookupUser} 
                  disabled={isLookingUp}
                  className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28]"
                >
                  {isLookingUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Lookup User
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Lookup Results - Enhanced with Clearance */}
            {lookupResult && (
              <div className="mt-4 p-4 bg-background rounded-lg border-2 border-[#A92FFA]/20 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {getUserInitials(lookupResult.user.name || 'U')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{lookupResult.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{lookupResult.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        ID: {lookupResult.user.id}
                      </Badge>
                      {lookupResult.user.emailVerified && (
                        <Badge className="bg-green-500 text-xs">
                          <CircleCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Auth Status Indicator */}
                  <div>
                    {lookupResult.hasActiveSession ? (
                      <Badge className="bg-green-500 text-white">
                        <CircleCheck className="w-4 h-4 mr-1" />
                        Authenticated
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        Not Authenticated
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Clearance Levels Display */}
                {lookupResult.userRole && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-[#A92FFA]/10 to-[#F28C28]/10 rounded-lg border border-[#A92FFA]/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Permission Clearance</span>
                        <Badge className={getClearanceBadgeColor(lookupResult.userRole.permissionClearance || 0)}>
                          {lookupResult.userRole.permissionClearance || 0}/100
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getClearanceBadgeColor(lookupResult.userRole.permissionClearance || 0)}`}
                          style={{ width: `${lookupResult.userRole.permissionClearance || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Duty Clearance</span>
                        <Badge className={getClearanceBadgeColor(lookupResult.userRole.dutyClearance || 0)}>
                          {lookupResult.userRole.dutyClearance || 0}/100
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getClearanceBadgeColor(lookupResult.userRole.dutyClearance || 0)}`}
                          style={{ width: `${lookupResult.userRole.dutyClearance || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total Sessions</span>
                    </div>
                    <p className="text-2xl font-bold">{lookupResult.sessions.total}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CircleCheck className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Active Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{lookupResult.sessions.active}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-muted-foreground">Expired Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{lookupResult.sessions.expired}</p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Account Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2 font-mono">
                        {new Date(lookupResult.user.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email Verified:</span>
                      <span className="ml-2">
                        {lookupResult.user.emailVerified ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {session?.user ? (
                <CircleCheck className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              Your Current Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Session Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Session Status</span>
              </div>
              {isPending ? (
                <Badge variant="secondary">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Checking...
                </Badge>
              ) : session?.user ? (
                <Badge className="bg-green-500">
                  <CircleCheck className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Authenticated
                </Badge>
              )}
            </div>

            {/* Bearer Token */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Bearer Token</span>
              </div>
              {bearerToken ? (
                <Badge className="bg-green-500">
                  <CircleCheck className="w-3 h-3 mr-1" />
                  Present
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>

            {/* User Info */}
            {session?.user && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg border-2 border-purple-500/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white font-bold">
                    {getUserInitials(session.user.name || 'U')}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    ID: {session.user.id}
                  </Badge>
                  {session.user.emailVerified && (
                    <Badge className="bg-green-500 text-xs">
                      <CircleCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
              {session?.user && (
                <Button onClick={handleSignOut} variant="destructive" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Test User */}
        {!session?.user && (
          <Card className="mb-6 border-2 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-orange-500" />
                Create Test Account
              </CardTitle>
              <CardDescription>
                Create a test user account to verify authentication is working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="test@uconministries.org"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Strong password"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters recommended
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTestUser} 
                  disabled={isCreatingUser}
                  className="flex-1 bg-gradient-to-r from-[#A92FFA] to-[#F28C28]"
                >
                  {isCreatingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create & Login
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleTestLogin} 
                  variant="outline"
                  className="flex-1"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login Existing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostics Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Login returns 500 error
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                • User account doesn't exist - Create test account above<br/>
                • Password hash invalid - Create new account with fresh password<br/>
                • Database connection issues - Check server logs
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Not seeing logged-in UI
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                • Session is null (not logged in) - Login first<br/>
                • Bearer token missing - Check localStorage after login<br/>
                • useSession() not updating - Refresh status button above
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CircleCheck className="w-4 h-4 text-green-500" />
                What should happen after successful login
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                1. Bearer token saved to localStorage<br/>
                2. Session object populated with user data<br/>
                3. Navigation shows user avatar and dropdown<br/>
                4. Footer shows user info<br/>
                5. useSession() returns data.user object
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm font-mono">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                isPending,
                hasSession: !!session,
                hasUser: !!session?.user,
                hasBearerToken: !!bearerToken,
                bearerTokenLength: bearerToken?.length || 0,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
                userName: session?.user?.name,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}