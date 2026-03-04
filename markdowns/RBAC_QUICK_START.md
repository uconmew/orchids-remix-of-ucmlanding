# UCon Ministries RBAC Quick Start Guide

## 🎯 What You Have Now

Your UCon Ministries platform now has a **complete Role-Based Access Control (RBAC) system** for managing all ministry operations, outreach, workshops, and community members.

### ✅ System Components

1. **5 Hierarchical Roles** (already seeded in database)
   - Executive Leadership (Level 1) - Full system access
   - Program Directors (Level 2) - Strategic management
   - Ministry Coordinators (Level 3) - Operations management
   - Staff Members (Level 4) - Program support with employment titles
   - Volunteers (Level 5) - Basic read-only access

2. **113 Permissions** (already configured)
   - Granular control over 8 resource categories
   - 19 different action types
   - Pre-assigned to all 5 roles

3. **Members Database** (30 sample members seeded)
   - 10 workshop participants
   - 5 outreach participants  
   - 5 ministry volunteers
   - 5 newsletter subscribers
   - 5 registered users

4. **Complete API Suite**
   - `/api/roles` - Manage roles
   - `/api/user-roles` - Assign roles to users
   - `/api/role-permissions` - Query and check permissions
   - `/api/members` - Manage all member types

5. **TypeScript Helper Library** (`src/lib/permissions.ts`)
   - `checkPermission()` - Check if user has permission
   - `getUserRoles()` - Get user's assigned roles
   - `hasAnyRole()` - Check if user has specific role
   - `meetsRoleLevel()` - Check role hierarchy level
   - And more...

## 🚀 How to Use

### 1. Assign Roles to Users

**For Staff Members (with employment title):**

```typescript
// In your admin interface
async function assignStaffMember(userId: string) {
  const token = localStorage.getItem("bearer_token");
  
  // Step 1: Assign Staff Members role (ID: 14)
  const response = await fetch('/api/user-roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      roleId: 14, // Staff Members
      assignedBy: session.user.id
    })
  });
  
  const assignment = await response.json();
  
  // Step 2: Set their employment title
  await fetch(`/api/user-roles/${assignment.id}/staff-title`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      staffTitle: "Workshop Facilitator" // Or "Case Manager", "Outreach Coordinator", etc.
    })
  });
}
```

**For Other Roles:**

```typescript
// Assign Executive Leadership (ID: 11)
// Assign Program Directors (ID: 12)
// Assign Ministry Coordinators (ID: 13)
// Assign Volunteers (ID: 15)

await fetch('/api/user-roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId,
    roleId: 12, // Change to desired role ID
    assignedBy: session.user.id
  })
});
```

### 2. Check Permissions in Your Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { checkPermission } from '@/lib/permissions';

export default function MyComponent() {
  const { data: session } = useSession();
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    async function loadPermissions() {
      if (!session?.user?.id) return;
      
      const token = localStorage.getItem("bearer_token");
      if (!token) return;
      
      // Check if user can update members
      const hasPermission = await checkPermission(
        session.user.id,
        'members',
        'update',
        token
      );
      
      setCanEdit(hasPermission);
    }
    
    loadPermissions();
  }, [session]);
  
  return (
    <div>
      {canEdit && <button>Edit Member</button>}
    </div>
  );
}
```

### 3. Protect Entire Pages

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { checkPermission } from '@/lib/permissions';

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    async function checkAccess() {
      if (isPending) return;
      
      if (!session?.user) {
        router.push('/login');
        return;
      }
      
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Check if user has system admin permissions
      const hasPermission = await checkPermission(
        session.user.id,
        'system',
        'manage_settings',
        token
      );
      
      if (!hasPermission) {
        router.push('/'); // Redirect unauthorized users
        return;
      }
      
      setAuthorized(true);
    }
    
    checkAccess();
  }, [session, isPending, router]);
  
  if (isPending || !authorized) {
    return <div>Loading...</div>;
  }
  
  return <div>Admin Content Here</div>;
}
```

### 4. Manage Members (All Types)

```typescript
// Create a workshop participant
async function registerForWorkshop(formData) {
  const token = localStorage.getItem("bearer_token");
  
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      memberType: 'workshop_participant',
      status: 'active',
      interests: ['financial_literacy', 'job_training'],
      notes: 'Registered for Financial Literacy workshop'
    })
  });
  
  return await response.json();
}

// Create an outreach participant
async function addOutreachRecipient(formData) {
  const token = localStorage.getItem("bearer_token");
  
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: 'CO',
      zipCode: formData.zipCode,
      memberType: 'outreach_participant',
      status: 'active',
      interests: ['housing_support', 'food_assistance'],
      notes: 'Receiving NOURISH food assistance weekly'
    })
  });
  
  return await response.json();
}
```

### 5. Query Members by Type

```typescript
const token = localStorage.getItem("bearer_token");

// Get all workshop participants
const workshopParticipants = await fetch(
  '/api/members?memberType=workshop_participant&status=active',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());

// Get all volunteers
const volunteers = await fetch(
  '/api/members?memberType=ministry_volunteer',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());

// Search members
const searchResults = await fetch(
  '/api/members?search=John',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());
```

## 📊 Role Permission Matrix

### What Each Role Can Do:

**Executive Leadership (Level 1):**
- ✅ Everything (all 35 permissions)

**Program Directors (Level 2):**
- ✅ Manage all members, workshops, outreach, volunteers, events
- ✅ Publish content, moderate prayers
- ✅ View analytics, manage settings
- ❌ Cannot change roles or permissions

**Ministry Coordinators (Level 3):**
- ✅ Full member and workshop management
- ✅ Coordinate outreach operations
- ✅ Review and assign volunteers (but can't approve)
- ✅ Manage events and registrations
- ✅ Create content (but can't publish)
- ✅ Moderate prayer wall

**Staff Members (Level 4):**
- ✅ Read, create, update members
- ✅ Host workshops
- ✅ Record outreach activities
- ✅ View volunteer applications
- ✅ Manage event registrations
- ✅ Read content and prayers

**Volunteers (Level 5):**
- ✅ View members (own profile)
- ✅ View workshops schedule
- ✅ View events
- ✅ Read prayer wall

## 🔍 Finding Things

### Database Tables
- **roles** - Role definitions
- **user_roles** - User role assignments
- **role_permissions** - Permission mappings
- **members** - All member types

### API Routes
- `src/app/api/roles/route.ts`
- `src/app/api/user-roles/route.ts`
- `src/app/api/user-roles/[id]/staff-title/route.ts`
- `src/app/api/role-permissions/route.ts`
- `src/app/api/role-permissions/check/route.ts`
- `src/app/api/members/route.ts`
- `src/app/api/members/stats/route.ts`

### Seeders
- `src/db/seeds/roles.ts` - Role seeder
- `src/db/seeds/rolePermissions.ts` - Permission seeder
- `src/db/seeds/members.ts` - Member seeder

### Helper Library
- `src/lib/permissions.ts` - TypeScript utilities

### Examples
- `src/components/examples/MembersManagementExample.tsx` - Full working example

## 📝 Common Tasks

### Task: Make someone a Workshop Facilitator
```typescript
// 1. Assign Staff Members role (ID: 14)
POST /api/user-roles
{ userId: "user_123", roleId: 14, assignedBy: "admin_id" }

// 2. Set staff title
PUT /api/user-roles/{assignmentId}/staff-title
{ staffTitle: "Workshop Facilitator" }
```

### Task: Check if user can approve volunteers
```typescript
import { checkPermission } from '@/lib/permissions';

const canApprove = await checkPermission(
  userId,
  'volunteers',
  'approve',
  token
);
```

### Task: Get all outreach participants in Denver
```typescript
const recipients = await fetch(
  '/api/members?memberType=outreach_participant&city=Denver&status=active',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());
```

### Task: Display user's role badges
```typescript
import { getUserRoles } from '@/lib/permissions';

const roles = await getUserRoles(userId, token);
// roles = [{ roleName: "Staff Members", roleLevel: 4, staffTitle: "Workshop Facilitator" }]
```

## 🎨 Next Steps: Build Your UI

Now that the backend is ready, build your admin interfaces:

1. **Admin Dashboard** - `/admin`
   - Display user roles and permissions
   - Assign roles to users
   - Update staff titles

2. **Members Directory** - `/members`
   - List all members with filters
   - Create/edit/delete members
   - Export member data
   - See example: `src/components/examples/MembersManagementExample.tsx`

3. **Staff Directory** - `/staff`
   - Show all staff with their titles
   - Display role hierarchy
   - Contact information

4. **Volunteer Portal** - `/volunteers`
   - Review applications
   - Approve/reject volunteers
   - Assign volunteer roles
   - Background check tracking

5. **Workshop Management** - `/workshops`
   - Create workshops
   - Manage participants (from members table)
   - Track attendance
   - Host live sessions

6. **Outreach Tracking** - `/outreach`
   - Record service delivery
   - Track participants (from members table)
   - Coordinate NOURISH, TRANSIT, HAVEN services
   - Generate reports

## ⚠️ Important Notes

1. **Always check permissions server-side** in API routes - frontend checks are for UI only
2. **Staff Members role always needs a staffTitle** - their employment position
3. **Members table is for ALL community members** - workshops, outreach, volunteers, newsletters, registered users
4. **Authentication is required** - All APIs need Bearer token in Authorization header
5. **Roles are hierarchical** - Level 1 = highest authority, Level 5 = lowest

## 📚 Full Documentation

See `RBAC_SYSTEM_DOCUMENTATION.md` for complete technical documentation.

## 🎉 You're Ready!

Your RBAC system is fully configured and ready to use. Start by:
1. Assigning roles to your staff and volunteers
2. Building admin UI to manage roles and members
3. Adding permission checks to your existing features
4. Tracking all community members in the members table

The system is production-ready and will scale with your ministry! 🚀
