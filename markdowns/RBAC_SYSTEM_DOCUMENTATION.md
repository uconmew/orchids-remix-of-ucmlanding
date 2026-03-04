# UCon Ministries Role-Based Access Control System

## 📋 Overview

This document provides complete documentation for the UCon Ministries RBAC (Role-Based Access Control) system, which manages access to internal tools for ministry operations, outreach, classes, and all UCon Ministries activities.

## 🏗️ System Architecture

### Role Hierarchy (5 Levels)

The system uses a hierarchical role structure where **level 1 = highest authority** and **level 5 = lowest authority**:

| Level | Role Name | Description | Staff Title Support |
|-------|-----------|-------------|---------------------|
| 1 | Executive Leadership | Founding Visionary Lead with executive decision-making | Yes (e.g., "Founding Visionary Lead") |
| 2 | Program Directors | Clinical, Spiritual, Programs Directors with strategic oversight | Yes (e.g., "Clinical Director", "Spiritual Formation Director") |
| 3 | Ministry Coordinators | Outreach Coordinator and operational management | Yes (e.g., "Outreach Coordinator", "Programs Manager") |
| 4 | Staff Members | General staff with specific employment titles | Yes (e.g., "Workshop Facilitator", "Case Manager") |
| 5 | Volunteers | Basic access for ministry volunteers | No staff title (volunteer position) |

### Permission Structure

Permissions are defined by **resource + action** combinations:

#### Resources (8 categories)
- **members** - Member database management
- **workshops** - Workshop/class management
- **outreach** - Outreach operations
- **volunteers** - Volunteer management
- **events** - Event management
- **content** - Blog posts/news content
- **prayers** - Prayer wall moderation
- **system** - System administration

#### Actions (19 types)
- `read` - View data
- `create` - Add new records
- `update` - Edit existing records
- `delete` - Remove records
- `export` - Export data
- `manage_participants` - Manage workshop participants
- `host` - Host live workshops
- `coordinate` - Coordinate operations
- `review` - Review applications
- `approve` - Approve applications
- `assign` - Assign roles/tasks
- `manage_registrations` - Manage event registrations
- `publish` - Publish content
- `moderate` - Moderate prayers
- `reply` - Reply as ministry
- `manage_roles` - Assign/remove roles
- `manage_permissions` - Modify permissions
- `view_analytics` - View ministry analytics
- `manage_settings` - System configuration

### Complete Permission Matrix

#### Executive Leadership (Level 1) - 35 Permissions
**ALL PERMISSIONS** including:
- Full members management (read, create, update, delete, export)
- Full workshops management (all actions)
- Full outreach coordination
- Full volunteer management (including approve)
- Full events management
- Full content management (including publish)
- Full prayers management
- Full system administration (manage_roles, manage_permissions, view_analytics, manage_settings)

#### Program Directors (Level 2) - 33 Permissions
**All permissions EXCEPT:**
- ❌ system:manage_roles
- ❌ system:manage_permissions

Can manage all operations but cannot change the role/permission structure.

#### Ministry Coordinators (Level 3) - 28 Permissions
**Operational control:**
- ✅ All members management
- ✅ All workshops management
- ✅ All outreach coordination
- ✅ Volunteer read, review, assign (❌ no approve)
- ✅ All events management
- ✅ Content read, create (❌ no publish or delete)
- ✅ All prayers management
- ❌ No system administration

#### Staff Members (Level 4) - 13 Permissions
**Program support:**
- ✅ Members: read, create, update (❌ no delete or export)
- ✅ Workshops: read, host (❌ no create, update, delete)
- ✅ Outreach: read, create, update
- ✅ Volunteers: read only
- ✅ Events: read, manage_registrations
- ✅ Content: read only
- ✅ Prayers: read only

#### Volunteers (Level 5) - 4 Permissions
**Read-only access:**
- ✅ Members: read (own profile only)
- ✅ Workshops: read
- ✅ Events: read
- ✅ Prayers: read

## 👥 Members System

The members table serves as the central database for **all individuals** interacting with UCon Ministries:

### Member Types

1. **workshop_participant** - People attending workshops (EQUIP, AWAKEN, BRIDGE, SHEPHERD)
2. **outreach_participant** - Recipients of outreach services (NOURISH, TRANSIT, HAVEN, STEPS)
3. **ministry_volunteer** - FRONTLINE volunteers serving the ministry
4. **newsletter_subscriber** - United Convicts newsletter subscribers
5. **registered_user** - Active community members with platform accounts

### Member Data Structure

```typescript
interface Member {
  id: number;
  userId: string | null;              // Link to auth user (if registered)
  firstName: string;
  lastName: string;
  email: string;                      // Unique
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  memberType: MemberType;             // One of the 5 types above
  status: 'active' | 'inactive' | 'suspended';
  interests: string | null;           // JSON array of interests
  notes: string | null;               // Staff notes
  joinedAt: string;                   // ISO timestamp
  lastActivityAt: string | null;      // ISO timestamp
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
}
```

### Sample Data

The system includes 30 realistic members:
- 10 workshop participants (LDI, EQUIP, AWAKEN attendees)
- 5 outreach participants (receiving NOURISH, TRANSIT, HAVEN services)
- 5 ministry volunteers (FRONTLINE volunteers with background checks)
- 5 newsletter subscribers (United Convicts community)
- 5 registered users (active platform members)

## 🔌 API Reference

### Authentication

All API requests require authentication via Bearer token:

```typescript
const token = localStorage.getItem("bearer_token");

fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Roles API

#### GET /api/roles
Get all roles ordered by level (1-5).

**Query Parameters:**
- `limit` (optional) - Max results (default: 50, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 11,
    "name": "Executive Leadership",
    "description": "Founding Visionary Lead with executive decision-making authority",
    "level": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### User Roles API

#### GET /api/user-roles
Get all roles assigned to a user.

**Query Parameters:**
- `userId` (required) - User ID to query

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user_123",
    "roleId": 14,
    "staffTitle": "Workshop Facilitator",
    "assignedAt": "2024-11-14T00:00:00.000Z",
    "assignedBy": "admin_456",
    "roleName": "Staff Members",
    "roleDescription": "General staff with specific employment titles",
    "roleLevel": 4
  }
]
```

#### POST /api/user-roles
Assign a role to a user.

**Request Body:**
```json
{
  "userId": "user_123",
  "roleId": 14,
  "assignedBy": "admin_456"
}
```

**Response:** Returns the created assignment with role details.

#### PUT /api/user-roles/[id]/staff-title
Update staff title for a role assignment.

**Route Parameter:**
- `id` - User role assignment ID

**Request Body:**
```json
{
  "staffTitle": "Senior Workshop Facilitator"
}
```

#### DELETE /api/user-roles
Remove a role assignment.

**Query Parameters:**
- `id` (required) - User role assignment ID

### Role Permissions API

#### GET /api/role-permissions
Get all permissions for a role or check specific permission.

**Query Parameters:**
- `roleId` (optional) - Get all permissions for specific role
- `resource` (optional) - Filter by resource type
- `action` (optional) - Filter by action type

**Response:**
```json
[
  {
    "id": 1,
    "roleId": 14,
    "resource": "members",
    "action": "read",
    "createdAt": "2024-11-14T00:00:00.000Z",
    "roleName": "Staff Members",
    "roleLevel": 4
  }
]
```

#### GET /api/role-permissions/check
Check if a user has a specific permission.

**Query Parameters:**
- `userId` (required) - User ID to check
- `resource` (required) - Resource type (e.g., "members")
- `action` (required) - Action type (e.g., "read")

**Response:**
```json
{
  "hasPermission": true,
  "matchedRoles": [
    {
      "roleId": 14,
      "roleName": "Staff Members",
      "roleLevel": 4
    }
  ]
}
```

### Members API

#### GET /api/members
Get all members with optional filtering.

**Query Parameters:**
- `id` (optional) - Get specific member by ID
- `limit` (optional) - Max results (default: 50, max: 100)
- `offset` (optional) - Pagination offset
- `search` (optional) - Search by name or email
- `memberType` (optional) - Filter by member type
- `status` (optional) - Filter by status (active/inactive/suspended)
- `city` (optional) - Filter by city

**Response:**
```json
[
  {
    "id": 1,
    "userId": null,
    "firstName": "Marcus",
    "lastName": "Thompson",
    "email": "marcus.thompson@gmail.com",
    "phone": "(303) 555-0142",
    "address": "1245 Federal Blvd",
    "city": "Denver",
    "state": "CO",
    "zipCode": "80204",
    "memberType": "workshop_participant",
    "status": "active",
    "interests": "[\"leadership_development\",\"trauma_recovery\"]",
    "notes": "LDI Tier 1 participant. Completed 3 workshops.",
    "joinedAt": "2024-03-15T00:00:00.000Z",
    "lastActivityAt": "2024-12-20T00:00:00.000Z",
    "createdAt": "2024-03-15T00:00:00.000Z",
    "updatedAt": "2024-12-20T00:00:00.000Z"
  }
]
```

#### POST /api/members
Create a new member.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "720.663.9243",
  "address": "123 Main St",
  "city": "Denver",
  "state": "CO",
  "zipCode": "80202",
  "memberType": "workshop_participant",
  "status": "active",
  "interests": ["financial_literacy", "job_training"],
  "notes": "New workshop participant"
}
```

#### PUT /api/members
Update an existing member.

**Query Parameters:**
- `id` (required) - Member ID to update

**Request Body:** Same as POST (all fields optional)

#### DELETE /api/members
Delete a member.

**Query Parameters:**
- `id` (required) - Member ID to delete

#### GET /api/members/stats
Get member statistics by type and status.

## 💻 Frontend Integration

### Using the Permission Helper

```typescript
import { 
  checkPermission, 
  getUserRoles, 
  hasAnyRole,
  meetsRoleLevel,
  ROLES,
  ROLE_LEVELS 
} from '@/lib/permissions';
import { useSession } from '@/lib/auth-client';

function MyComponent() {
  const { data: session } = useSession();
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    async function checkAccess() {
      if (!session?.user?.id) return;
      
      const token = localStorage.getItem("bearer_token");
      if (!token) return;
      
      // Check specific permission
      const hasPermission = await checkPermission(
        session.user.id,
        'members',
        'update',
        token
      );
      setCanEdit(hasPermission);
    }
    
    checkAccess();
  }, [session]);
  
  return (
    <div>
      {canEdit && <button>Edit Member</button>}
    </div>
  );
}
```

### Check Multiple Permissions

```typescript
// Check if user is coordinator or higher
const isCoordinator = await meetsRoleLevel(
  userId,
  ROLE_LEVELS.MINISTRY_COORDINATORS,
  token
);

// Check if user has specific role
const isStaff = await hasAnyRole(
  userId,
  [ROLES.STAFF_MEMBERS, ROLES.MINISTRY_COORDINATORS],
  token
);
```

### Protected Route Pattern

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { checkPermission } from '@/lib/permissions';

export default function ProtectedPage() {
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
      
      // Check required permission
      const hasPermission = await checkPermission(
        session.user.id,
        'system',
        'view_analytics',
        token
      );
      
      if (!hasPermission) {
        router.push('/'); // Redirect to home if not authorized
        return;
      }
      
      setAuthorized(true);
    }
    
    checkAccess();
  }, [session, isPending, router]);
  
  if (isPending || !authorized) {
    return <div>Loading...</div>;
  }
  
  return <div>Protected Content</div>;
}
```

## 🔧 Common Use Cases

### 1. Assign Staff Role with Title

```typescript
async function assignStaffRole(userId: string, staffTitle: string) {
  const token = localStorage.getItem("bearer_token");
  
  // First, assign the Staff Members role
  const response = await fetch('/api/user-roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      roleId: 14, // Staff Members role ID
      assignedBy: session.user.id
    })
  });
  
  const assignment = await response.json();
  
  // Then, update the staff title
  await fetch(`/api/user-roles/${assignment.id}/staff-title`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      staffTitle: staffTitle // e.g., "Workshop Facilitator"
    })
  });
}
```

### 2. Register Workshop Participant

```typescript
async function registerWorkshopParticipant(formData: any) {
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
      notes: `Registered for ${formData.workshopName}`
    })
  });
  
  return await response.json();
}
```

### 3. Check Admin Access

```typescript
async function isAdmin(userId: string): Promise<boolean> {
  const token = localStorage.getItem("bearer_token");
  
  return await meetsRoleLevel(
    userId,
    ROLE_LEVELS.PROGRAM_DIRECTORS, // Level 2 or higher
    token
  );
}
```

### 4. Display Role-Based UI

```tsx
function DashboardMenu() {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState({
    canManageMembers: false,
    canCoordinateOutreach: false,
    canManageSystem: false
  });
  
  useEffect(() => {
    async function loadPermissions() {
      if (!session?.user?.id) return;
      const token = localStorage.getItem("bearer_token");
      if (!token) return;
      
      setPermissions({
        canManageMembers: await checkPermission(
          session.user.id, 'members', 'update', token
        ),
        canCoordinateOutreach: await checkPermission(
          session.user.id, 'outreach', 'coordinate', token
        ),
        canManageSystem: await checkPermission(
          session.user.id, 'system', 'manage_settings', token
        )
      });
    }
    
    loadPermissions();
  }, [session]);
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      {permissions.canManageMembers && (
        <Link href="/members">Members</Link>
      )}
      {permissions.canCoordinateOutreach && (
        <Link href="/outreach">Outreach</Link>
      )}
      {permissions.canManageSystem && (
        <Link href="/admin">Admin</Link>
      )}
    </nav>
  );
}
```

## 🎯 Best Practices

### 1. Always Check Permissions Server-Side
Frontend permission checks are for UI only. Always verify permissions in API routes:

```typescript
// In your API route
import { db } from '@/db';
import { userRoles, rolePermissions, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  // Get user from session/token
  const userId = await getUserIdFromToken(request);
  
  // Check permission server-side
  const hasPermission = await checkUserPermission(
    userId,
    'members',
    'create'
  );
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Proceed with operation...
}
```

### 2. Use Role Levels for Hierarchical Access

```typescript
// Check if user is coordinator level or higher
const canApprove = await meetsRoleLevel(
  userId,
  ROLE_LEVELS.MINISTRY_COORDINATORS, // Level 3
  token
);
```

### 3. Cache Permission Checks

```typescript
// Cache user permissions in React context
const PermissionsContext = createContext<PermissionsState>({});

function PermissionsProvider({ children }) {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState({});
  
  useEffect(() => {
    // Load all user permissions once
    async function loadPermissions() {
      // Load and cache...
    }
    loadPermissions();
  }, [session]);
  
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}
```

### 4. Staff Titles for Staff Members Role

The Staff Members role (level 4) should always include a staffTitle describing their employment position:

```typescript
// Good: Specific staff titles
"Workshop Facilitator"
"Case Manager"
"Administrative Assistant"
"Outreach Coordinator"

// Bad: Generic or missing titles
"Staff"
null
""
```

## 📊 Database Schema

### Roles Table
```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
```

### User Roles Table
```sql
CREATE TABLE user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  staff_title TEXT,
  assigned_at TEXT NOT NULL,
  assigned_by TEXT REFERENCES user(id)
);
```

### Role Permissions Table
```sql
CREATE TABLE role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### Members Table
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  member_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  interests TEXT, -- JSON
  notes TEXT,
  joined_at TEXT NOT NULL,
  last_activity_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 🚀 Next Steps

1. **Create Admin Dashboard** - Build UI for managing roles and permissions
2. **Member Management Portal** - Create interface for tracking all member types
3. **Workshop Registration Integration** - Link workshop registrations to members
4. **Outreach Tracking** - Track outreach services provided to participants
5. **Volunteer Approval Workflow** - Build approval process for volunteer applications
6. **Analytics Dashboard** - Display ministry impact metrics by member type
7. **Staff Directory** - Display staff with their roles and titles

## 📝 Summary

You now have a complete RBAC system with:

✅ **5 hierarchical roles** with clear authority levels
✅ **113 permissions** across 8 resource categories
✅ **Members system** tracking all 5 member types (30 sample members)
✅ **Staff title support** for employment positions
✅ **Complete API suite** for roles, permissions, and members
✅ **TypeScript utilities** for frontend permission checking
✅ **Seeded data** ready for testing and development

The system is production-ready and can be extended as the ministry grows!
