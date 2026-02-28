"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useErrorDiagnostics } from "@/hooks/useErrorDiagnostics";
import { AlertTriangle, Bug, Database, Shield, Code } from "lucide-react";

export default function TestDiagnosticsPage() {
  const { showError } = useErrorDiagnostics();
  const [result, setResult] = useState<string>("");

  // Example 1: Type Error
  const triggerTypeError = () => {
    try {
      // @ts-ignore - intentionally causing error for demo
      const data = undefined;
      data.map((item) => item); // This will throw TypeError
    } catch (error) {
      showError(error as Error, {
        user: { id: "demo_user", email: "demo@ucon.org" },
        request: {
          method: "GET",
          url: "/test-diagnostics",
          headers: {},
        },
      });
    }
  };

  // Example 2: Reference Error
  const triggerReferenceError = () => {
    try {
      // @ts-ignore
      console.log(nonExistentVariable);
    } catch (error) {
      showError(error as Error, {
        user: { id: "demo_user" },
      });
    }
  };

  // Example 3: Custom Error with Context
  const triggerDatabaseError = () => {
    const error = new Error("SQLITE_CONSTRAINT: FOREIGN KEY constraint failed");
    error.name = "SQLiteError";
    
    showError(error, {
      user: { id: "user_123", role: "guest" },
      request: {
        method: "POST",
        url: "/api/workshops/1/participants",
        headers: { "Content-Type": "application/json" },
        body: { userId: "guest_123", isGuest: true },
      },
    });
  };

  // Example 4: Validation Error
  const triggerValidationError = () => {
    const error = new Error("Invalid email format");
    error.name = "ValidationError";
    
    showError(error, {
      user: { id: "user_456" },
      request: {
        method: "POST",
        url: "/api/users",
        body: { email: "invalid-email" },
      },
    });
  };

  // Example 5: Auth Error
  const triggerAuthError = () => {
    const error = new Error("User session expired. Please login again.");
    error.name = "AuthenticationError";
    
    showError(error, {
      user: { id: "user_789", email: "user@example.com" },
      request: {
        method: "GET",
        url: "/api/protected-resource",
        headers: { Authorization: "Bearer expired_token" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Error Diagnostics Utility</h1>
          <p className="text-muted-foreground">
            Click any button below to trigger the visual error diagnostics overlay. 
            It will show detailed analysis, root cause, and copy-paste fixes!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Type Error */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Bug className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle>Type Error</CardTitle>
              <CardDescription>
                Accessing property on undefined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerTypeError}
                variant="outline"
                className="w-full"
              >
                Trigger Type Error
              </Button>
            </CardContent>
          </Card>

          {/* Reference Error */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle>Reference Error</CardTitle>
              <CardDescription>
                Variable not defined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerReferenceError}
                variant="outline"
                className="w-full"
              >
                Trigger Reference Error
              </Button>
            </CardContent>
          </Card>

          {/* Database Error */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>Database Error</CardTitle>
              <CardDescription>
                Foreign key constraint failed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerDatabaseError}
                variant="outline"
                className="w-full"
              >
                Trigger Database Error
              </Button>
            </CardContent>
          </Card>

          {/* Validation Error */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle>Validation Error</CardTitle>
              <CardDescription>
                Invalid input format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerValidationError}
                variant="outline"
                className="w-full"
              >
                Trigger Validation Error
              </Button>
            </CardContent>
          </Card>

          {/* Auth Error */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Auth Error</CardTitle>
              <CardDescription>
                Session expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerAuthError}
                variant="outline"
                className="w-full"
              >
                Trigger Auth Error
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-orange-500/10">
          <CardHeader>
            <CardTitle>✨ What You'll See</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">📊 Error Analysis</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Error type and severity level</li>
                  <li>• Category classification</li>
                  <li>• Root cause identification</li>
                  <li>• Timestamp and context</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">📁 Source Context</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Exact file and line number</li>
                  <li>• Code snippet with highlighting</li>
                  <li>• 5 lines before/after context</li>
                  <li>• Copy file location button</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">💡 Smart Fixes</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Priority-ranked solutions</li>
                  <li>• Copy-paste code snippets</li>
                  <li>• Context-aware suggestions</li>
                  <li>• Best practice recommendations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔍 Stack Trace</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Full error stack trace</li>
                  <li>• Filtered to project files</li>
                  <li>• Collapsible sections</li>
                  <li>• Easy navigation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 How to Use in Your Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="text-green-600">// In your React components:</div>
              <div className="mt-2">
                <span className="text-blue-600">import</span> {'{ useErrorDiagnostics }'} <span className="text-blue-600">from</span> <span className="text-orange-600">"@/hooks/useErrorDiagnostics"</span>;
              </div>
              <div className="mt-4">
                <span className="text-blue-600">const</span> {'{ showError }'} = useErrorDiagnostics();
              </div>
              <div className="mt-4">
                <span className="text-blue-600">try</span> {'{'}
                <div className="ml-4">{'// Your code'}</div>
                {'}'} <span className="text-blue-600">catch</span> (error) {'{'}
                <div className="ml-4">showError(error <span className="text-blue-600">as</span> Error);</div>
                {'}'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
