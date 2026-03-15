"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleCheck, AlertCircle, Loader2 } from "lucide-react";

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    email: "admin@uconministries.org",
    name: "UCon Admin",
    password: "Admin2025!Secure",
    staffTitle: "Founding Visionary Lead"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; credentials?: any } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Admin user created successfully!',
          credentials: data.credentials
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to create admin user'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please check if the server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Admin User</CardTitle>
          <CardDescription>
            Set up your first admin account with Level 1 access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffTitle">Staff Title</Label>
              <Input
                id="staffTitle"
                value={formData.staffTitle}
                onChange={(e) => setFormData({ ...formData, staffTitle: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin User'
              )}
            </Button>
          </form>

          {result && (
            <Alert className={`mt-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {result.success ? (
                <CircleCheck className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                <div className="space-y-2">
                  <p className="font-semibold">{result.message}</p>
                  {result.success && result.credentials && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border space-y-2">
                      <p className="text-sm font-medium">Your Login Credentials:</p>
                      <div className="space-y-1 text-xs">
                        <p><strong>Email:</strong> {result.credentials.email}</p>
                        <p><strong>Password:</strong> (the one you entered above)</p>
                        <p className="mt-2 text-purple-600 dark:text-purple-400">
                          <a href="/staff-login" className="underline hover:text-purple-800">
                            → Go to Staff Login Portal
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-300">What You'll Get:</p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Executive Leadership Role</strong> with Level 1 clearance</span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>All 35 Permissions</strong> across 7 resource categories</span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Full Admin Access</strong> to all management tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Role Management</strong> capabilities</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
