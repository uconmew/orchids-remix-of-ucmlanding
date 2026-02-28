'use client';

/**
 * Example: Members Management Component with RBAC
 * 
 * This component demonstrates how to integrate the RBAC system
 * for managing UCon Ministries members with proper permission checks.
 */

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { checkPermission, getUserRoles, ROLES } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  memberType: string;
  status: string;
  city: string | null;
  state: string | null;
  interests: string | null;
  notes: string | null;
  joinedAt: string;
  lastActivityAt: string | null;
}

interface UserPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export default function MembersManagementExample() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false
  });
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and permissions
  useEffect(() => {
    async function checkAccess() {
      if (isPending) return;

      // Redirect if not logged in
      if (!session?.user) {
        router.push('/login?redirect=/members');
        return;
      }

      const token = localStorage.getItem('bearer_token');
      if (!token) {
        router.push('/login?redirect=/members');
        return;
      }

      try {
        // Load user roles
        const roles = await getUserRoles(session.user.id, token);
        setUserRoles(roles.map(r => r.roleName));

        // Check all permissions for members resource
        const [canRead, canCreate, canUpdate, canDelete, canExport] = await Promise.all([
          checkPermission(session.user.id, 'members', 'read', token),
          checkPermission(session.user.id, 'members', 'create', token),
          checkPermission(session.user.id, 'members', 'update', token),
          checkPermission(session.user.id, 'members', 'delete', token),
          checkPermission(session.user.id, 'members', 'export', token)
        ]);

        setPermissions({ canRead, canCreate, canUpdate, canDelete, canExport });

        // If user doesn't have read permission, redirect
        if (!canRead) {
          router.push('/');
          return;
        }

        // Load members if user has read permission
        await loadMembers(token);
        
      } catch (err) {
        console.error('Error checking permissions:', err);
        setError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [session, isPending, router]);

  // Load members from API
  async function loadMembers(token: string) {
    try {
      const response = await fetch('/api/members?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load members');
    }
  }

  // Handle create member
  async function handleCreateMember() {
    if (!permissions.canCreate) return;
    
    // In real implementation, open a form dialog
    alert('Create member form would open here');
  }

  // Handle edit member
  async function handleEditMember(memberId: number) {
    if (!permissions.canUpdate) return;
    
    // In real implementation, open edit form
    alert(`Edit member ${memberId} form would open here`);
  }

  // Handle delete member
  async function handleDeleteMember(memberId: number) {
    if (!permissions.canDelete) return;
    
    const token = localStorage.getItem('bearer_token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await fetch(`/api/members?id=${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      // Reload members
      await loadMembers(token);
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Failed to delete member');
    }
  }

  // Handle export members
  async function handleExport() {
    if (!permissions.canExport) return;
    
    alert('Export functionality would be implemented here');
  }

  // Get badge color for member type
  function getMemberTypeBadge(type: string) {
    const colors: Record<string, string> = {
      workshop_participant: 'bg-purple-100 text-purple-800',
      outreach_participant: 'bg-orange-100 text-orange-800',
      ministry_volunteer: 'bg-green-100 text-green-800',
      newsletter_subscriber: 'bg-blue-100 text-blue-800',
      registered_user: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get badge color for status
  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A92FFA] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Members Management</h1>
        <p className="text-muted-foreground">
          Manage all UCon Ministries community members
        </p>
        
        {/* User Roles Display */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your Roles:</span>
          {userRoles.map(role => (
            <Badge key={role} variant="outline">{role}</Badge>
          ))}
        </div>
      </div>

      {/* Permissions Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>Actions you can perform on members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {permissions.canRead && <Badge variant="outline">✓ Read</Badge>}
            {permissions.canCreate && <Badge variant="outline">✓ Create</Badge>}
            {permissions.canUpdate && <Badge variant="outline">✓ Update</Badge>}
            {permissions.canDelete && <Badge variant="outline">✓ Delete</Badge>}
            {permissions.canExport && <Badge variant="outline">✓ Export</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {permissions.canCreate && (
            <Button onClick={handleCreateMember}>
              + Add Member
            </Button>
          )}
          {permissions.canExport && (
            <Button variant="outline" onClick={handleExport}>
              Export Data
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total Members: {members.length}
        </div>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="pt-6">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  {(permissions.canUpdate || permissions.canDelete) && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge className={getMemberTypeBadge(member.memberType)}>
                        {member.memberType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.city && member.state 
                        ? `${member.city}, ${member.state}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {(permissions.canUpdate || permissions.canDelete) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member.id)}
                            >
                              Edit
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Member Type Legend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Member Types</CardTitle>
          <CardDescription>Understanding different member categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Badge className="mb-2 bg-purple-100 text-purple-800">workshop_participant</Badge>
              <p className="text-sm text-muted-foreground">
                Attending EQUIP, AWAKEN, BRIDGE, SHEPHERD workshops
              </p>
            </div>
            <div>
              <Badge className="mb-2 bg-orange-100 text-orange-800">outreach_participant</Badge>
              <p className="text-sm text-muted-foreground">
                Receiving NOURISH, TRANSIT, HAVEN, STEPS services
              </p>
            </div>
            <div>
              <Badge className="mb-2 bg-green-100 text-green-800">ministry_volunteer</Badge>
              <p className="text-sm text-muted-foreground">
                FRONTLINE volunteers serving the ministry
              </p>
            </div>
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-800">newsletter_subscriber</Badge>
              <p className="text-sm text-muted-foreground">
                United Convicts newsletter subscribers
              </p>
            </div>
            <div>
              <Badge className="mb-2 bg-indigo-100 text-indigo-800">registered_user</Badge>
              <p className="text-sm text-muted-foreground">
                Active community members with platform accounts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
