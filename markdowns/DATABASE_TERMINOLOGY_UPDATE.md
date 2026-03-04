# Database Terminology Update - Ucon Roles

## Overview
This document explains the updated database terminology to distinguish between **Staff Roles** and **Community Member Categories**.

---

## 🎯 Key Changes

### 1. **Ucon Roles** (Staff Only)
**Table:** `ucon_roles` (formerly `user_roles`)

**Purpose:** Manages role-based access control (RBAC) for **STAFF MEMBERS ONLY**.

**Fields:**
- `userId` - References authenticated staff user
- `roleId` - References role from `roles` table
- `staffTitle` - Custom staff title (e.g., "Founding Visionary Lead", "Clinical Director")
- `permissionClearance` - Permission level (0-100)
- `dutyClearance` - Duty level (0-100)
- `assignedAt` - When role was assigned
- `assignedBy` - Who assigned the role

**Code Export:**
```typescript
// Primary name (use this in new code)
export const uconRoles = sqliteTable('ucon_roles', { ... });

// Backward compatibility alias (existing code still works)
export const userRoles = uconRoles;
```

---

### 2. **Convicts & Convict Volunteers** (Community Members)
**Table:** `convicts` (formerly `members`)

**Purpose:** Manages community members who are NOT staff.

**Categories:**
- **Convicts** - Core community members
- **Convict Volunteers** - Volunteers serving in various capacities

**Fields:**
- `convictType` - Either `'Convict'` or `'Convict Volunteer'`
- `convictRole` - Job title by category (e.g., 'Outreach Coordinator', 'Food Distribution Lead')
- `clearanceLevel` - General clearance (0-100)
- `dutyClearance` - Duty clearance (0-100)

**Example Convict Roles by Category:**
- **Outreach:** 'Outreach Coordinator', 'Transportation Driver', 'Food Distribution Lead'
- **Support:** 'Prayer Partner', 'Mentor', 'Peer Support Specialist'
- **Administration:** 'Administrative Assistant', 'Event Coordinator'

---

## 📊 Role Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UCon Ministries Users                     │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼───────┐       ┌──────▼──────┐
        │  STAFF USERS  │       │  CONVICTS   │
        │ (Ucon Roles)  │       │  (Members)  │
        └───────────────┘       └─────────────┘
                │                       │
        ┌───────┴────────┐      ┌──────┴─────────┐
        │                │      │                 │
    ┌───▼────┐    ┌─────▼──┐   │  ┌──────────┐  │
    │ Admin  │    │ Staff  │   │  │ Convict  │  │
    │ Level  │    │ Level  │   │  │ Volunteer│  │
    │ Roles  │    │ Roles  │   │  └──────────┘  │
    └────────┘    └────────┘   └─────────────────┘
        │              │                 │
    Full Access   Limited         Job Title
                  Permissions     by Category
```

---

## 🔧 Database Migration

### Apply Migration
```bash
cd /home/user/app

# Push schema to Turso (includes ucon_roles table)
npx drizzle-kit push

# Or apply migration manually
sqlite3 drizzle/db.sqlite < drizzle/migrations/0012_rename_user_roles_to_ucon_roles.sql
```

---

## 💻 Code Usage

### For Staff (Ucon Roles)
```typescript
import { uconRoles, roles } from '@/db/schema';

// Query staff roles
const staffRoles = await db
  .select()
  .from(uconRoles)
  .innerJoin(roles, eq(uconRoles.roleId, roles.id))
  .where(eq(uconRoles.userId, staffUserId));

// Assign staff role
await db.insert(uconRoles).values({
  userId: staffUser.id,
  roleId: adminRole.id,
  staffTitle: 'Founding Visionary Lead',
  permissionClearance: 100,
  dutyClearance: 100,
  assignedAt: new Date().toISOString(),
  assignedBy: currentUser.id
});
```

### For Convicts/Volunteers
```typescript
import { convicts } from '@/db/schema';

// Query convict volunteers
const volunteers = await db
  .select()
  .from(convicts)
  .where(eq(convicts.convictType, 'Convict Volunteer'));

// Add new convict volunteer
await db.insert(convicts).values({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  convictType: 'Convict Volunteer',
  convictRole: 'Outreach Coordinator', // Job title by category
  status: 'active',
  clearanceLevel: 50,
  dutyClearance: 30,
  joinedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

---

## 🎭 Role Examples

### Ucon Staff Roles (ucon_roles table)
| Staff Title                   | Permission | Duty | Access Level        |
|-------------------------------|------------|------|---------------------|
| Founding Visionary Lead       | 100        | 100  | Full Admin Access   |
| Spiritual Formation Director  | 80         | 90   | Program Management  |
| Clinical Director             | 90         | 85   | Clinical + Admin    |
| Multiplication Director       | 75         | 80   | Program Operations  |
| Outreach Coordinator          | 60         | 70   | Outreach Management |

### Convict Volunteer Roles (convicts table - convictRole field)
| Convict Role              | Category     | Clearance | Duties              |
|---------------------------|--------------|-----------|---------------------|
| Outreach Coordinator      | Track 3      | 50        | Lead outreach teams |
| Food Distribution Lead    | Track 3      | 40        | Food program        |
| Transportation Driver     | Track 3      | 35        | Transport services  |
| Prayer Partner            | Track 2      | 30        | Prayer support      |
| Event Setup Volunteer     | Track 3      | 25        | Event logistics     |
| Administrative Assistant  | Track 2      | 45        | Office support      |

---

## 📝 Important Notes

1. **Ucon Roles = Staff Only**
   - Authenticated users with `user` table accounts
   - Managed through RBAC system
   - Access to admin dashboard and staff portals

2. **Convicts/Convict Volunteers = Community Members**
   - May or may not have `user` accounts (tracked via `userId` field)
   - `convictType` determines if they're core members or volunteers
   - `convictRole` specifies their job title/function by category
   - No direct access to admin systems (unless also given Ucon Role)

3. **Dual Roles Possible**
   - A person can be BOTH a Convict Volunteer AND have a Ucon Staff Role
   - Example: Outreach Coordinator (convict) promoted to Staff (ucon_roles)
   - Track separately in both tables

4. **Backward Compatibility**
   - Existing code using `userRoles` continues to work
   - `userRoles` is an alias export pointing to `uconRoles`
   - Update code gradually to use `uconRoles` for clarity

---

## ✅ Migration Checklist

- [x] Database schema updated (`ucon_roles` table)
- [x] Migration SQL created
- [x] Code exports maintain backward compatibility
- [x] Documentation complete
- [ ] **TODO: Run `npx drizzle-kit push` to apply changes**
- [ ] **TODO: Update frontend admin pages to use new terminology**
- [ ] **TODO: Test staff role assignment**
- [ ] **TODO: Test convict volunteer management**

---

## 🚀 Next Steps

1. **Apply Migration:**
   ```bash
   npx drizzle-kit push
   ```

2. **Verify Tables:**
   ```bash
   # Check if ucon_roles table exists
   sqlite3 drizzle/db.sqlite ".tables"
   ```

3. **Test Staff Portal:**
   - Visit: http://localhost:3000/staff-login
   - Login with staff credentials
   - Verify role appears as "Ucon Role"

4. **Test Admin Dashboard:**
   - Visit: http://localhost:3000/admin
   - Check staff management page
   - Assign roles and verify terminology

---

**Last Updated:** January 2025  
**Author:** Ucon Ministries Development Team
