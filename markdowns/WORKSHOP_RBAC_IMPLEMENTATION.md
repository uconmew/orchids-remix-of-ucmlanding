# Workshop RBAC Implementation Guide

## 🎯 Overview

This document provides a complete guide to the Role-Based Access Control (RBAC) system for Ucon Ministries workshops. The system provides granular permission control across 6 distinct roles with comprehensive UI and API integration.

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Roles & Permissions](#roles--permissions)
3. [Implementation Guide](#implementation-guide)
4. [API Integration](#api-integration)
5. [UI Components](#ui-components)
6. [Testing](#testing)
7. [Best Practices](#best-practices)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Workshop RBAC System                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Role Configuration Layer                 │   │
│  │  - workshop-roles-config.ts                     │   │
│  │  - Centralized role definitions                 │   │
│  │  - Permission mappings                          │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Permission Checker Layer                 │   │
│  │  - workshop-permissions.ts                      │   │
│  │  - WorkshopPermissionChecker class              │   │
│  │  - Validation utilities                         │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│         ┌──────────────┴──────────────┐                │
│         ▼                              ▼                 │
│  ┌────────────────┐           ┌────────────────┐       │
│  │   Frontend     │           │    Backend     │       │
│  │   - Hooks      │           │   - API Routes │       │
│  │   - Components │           │   - Middleware │       │
│  └────────────────┘           └────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

### Role Hierarchy

| Role | Level | Authority | Can Assign |
|------|-------|-----------|------------|
| **Host** | 100 | Complete control | All roles |
| **Co-Host** | 80 | Near-complete control | All except Host |
| **Facilitator** | 60 | Presentation & moderation | Presenter, Participant |
| **Moderator** | 50 | Interaction management | Participant |
| **Presenter** | 40 | Content presentation | None |
| **Participant** | 10 | Basic engagement | None |

### Detailed Permission Matrix

#### 🔴 Host (Complete Control)

**Session Management**
- ✅ End session for everyone
- ✅ Lock/unlock meeting
- ✅ Start/stop recording
- ✅ Change all settings

**Participant Management**
- ✅ Mute/unmute any participant
- ✅ Mute all participants
- ✅ Remove participants
- ✅ Spotlight participants
- ✅ Admit from waiting room

**Role Management**
- ✅ Assign ANY role to anyone
- ✅ View all role assignments
- ✅ Transfer host role

**Content & Presentation**
- ✅ Share screen
- ✅ Control screen sharing permissions
- ✅ Use whiteboard (draw, clear, manage)
- ✅ Upload/delete files

**Interaction**
- ✅ Create/manage/delete polls
- ✅ Answer/manage Q&A
- ✅ Moderate/manage chat
- ✅ Send broadcast messages

**Breakout Rooms**
- ✅ Create rooms
- ✅ Assign participants
- ✅ Broadcast to all rooms
- ✅ Close all rooms

---

#### 🟠 Co-Host (Near-Complete Control)

**Session Management**
- ✅ Lock/unlock meeting
- ✅ Start/stop recording
- ✅ Change session settings
- ❌ End session (Host only)

**Participant Management**
- ✅ Mute/unmute any participant
- ✅ Mute all participants
- ✅ Remove participants
- ✅ Spotlight participants
- ✅ Admit from waiting room

**Role Management**
- ✅ Assign: Facilitator, Moderator, Presenter, Participant
- ❌ Assign Host role
- ✅ View all role assignments

**Content & Presentation**
- ✅ Share screen
- ✅ Control screen sharing permissions
- ✅ Use whiteboard (draw, clear, manage)
- ✅ Upload/delete files

**Interaction**
- ✅ Create/manage/delete polls
- ✅ Answer/manage Q&A
- ✅ Moderate/manage chat
- ✅ Send broadcast messages

**Breakout Rooms**
- ✅ Create rooms
- ✅ Assign participants
- ✅ Broadcast to all rooms
- ✅ Close all rooms

---

#### 🟢 Facilitator (Presentation & Moderation)

**Participant Management**
- ✅ Mute/unmute participants
- ✅ Spotlight participants
- ❌ Remove participants
- ❌ Mute all

**Role Management**
- ✅ Assign: Presenter, Participant
- ✅ View role assignments

**Content & Presentation**
- ✅ Share screen
- ✅ Use whiteboard (draw, clear)
- ✅ Upload files
- ❌ Delete others' files

**Interaction**
- ✅ Create/manage polls
- ✅ Answer/manage Q&A
- ✅ Moderate chat
- ✅ Send broadcast messages

**Breakout Rooms**
- ✅ View rooms
- ✅ Join rooms
- ❌ Create/manage rooms

---

#### 🔵 Moderator (Interaction Management)

**Participant Management**
- ✅ Mute/unmute participants
- ❌ Remove participants
- ❌ Spotlight

**Role Management**
- ✅ Assign: Participant only
- ✅ View role assignments

**Content & Presentation**
- ❌ Share screen
- ❌ Use whiteboard (view only)
- ❌ Upload files

**Interaction**
- ✅ View polls & results
- ✅ Answer/manage Q&A
- ✅ Moderate/delete chat messages
- ✅ Send broadcast messages

**Breakout Rooms**
- ✅ View rooms
- ✅ Join rooms

---

#### 🟡 Presenter (Content Presentation)

**Content & Presentation**
- ✅ Share screen
- ✅ Use whiteboard (draw)
- ❌ Clear whiteboard

**Interaction**
- ✅ View polls
- ✅ Vote in polls
- ✅ Ask questions
- ✅ Send chat messages

**Breakout Rooms**
- ✅ View rooms
- ✅ Join rooms

---

#### ⚪ Participant (Basic Engagement)

**Interaction**
- ✅ Send chat messages
- ✅ View polls & vote
- ✅ Ask questions & upvote
- ✅ Send reactions
- ✅ Raise hand

**Breakout Rooms**
- ✅ View rooms
- ✅ Join assigned room

---

## Implementation Guide

### 1. Frontend Integration

#### Using the Permission Hook

```typescript
import { useWorkshopPermissions } from '@/hooks/useWorkshopPermissions';

function WorkshopComponent({ participant }) {
  const permissions = useWorkshopPermissions(participant?.role);
  
  return (
    <>
      {/* Check specific permission */}
      {permissions.can('screen', 'share') && (
        <Button onClick={startScreenShare}>Share Screen</Button>
      )}
      
      {/* Use convenience methods */}
      {permissions.canManageParticipants && (
        <MuteAllButton />
      )}
      
      {permissions.canAssignRoles && (
        <RoleManagementDialog />
      )}
    </>
  );
}
```

#### Permission-Based UI Rendering

```typescript
// Show/hide entire sections based on permissions
{permissions.canRecord && (
  <RecordingControls />
)}

// Conditionally enable/disable buttons
<Button 
  disabled={!permissions.canLockSession}
  onClick={toggleLock}
>
  {isLocked ? 'Unlock' : 'Lock'} Meeting
</Button>

// Role-based styling
<Badge className={getRoleConfig(role).color}>
  {getRoleConfig(role).displayName}
</Badge>
```

### 2. Backend API Integration

#### Permission Validation in API Routes

```typescript
import { validatePermission } from '@/lib/workshop-permissions';
import { getRoleConfig } from '@/lib/workshop-roles-config';

export async function POST(request: NextRequest) {
  // Get user and their role
  const user = await getCurrentUser(request);
  const participant = await getParticipant(workshopId, user.id);
  
  // Validate permission
  const validation = validatePermission(
    participant.role,
    'polls',
    'create'
  );
  
  if (!validation.allowed) {
    return NextResponse.json(
      { 
        error: validation.reason,
        code: 'INSUFFICIENT_PERMISSIONS' 
      },
      { status: 403 }
    );
  }
  
  // Proceed with action
  // ...
}
```

#### Role Assignment Validation

```typescript
import { validateRoleTransition, canAssignRole } from '@/lib/workshop-roles-config';

// Check if user can assign a role
if (!canAssignRole(requesterRole, newRole)) {
  return NextResponse.json(
    { error: 'Cannot assign this role' },
    { status: 403 }
  );
}

// Validate the role transition
const validation = validateRoleTransition(
  requesterRole,
  currentRole,
  newRole
);

if (!validation.valid) {
  return NextResponse.json(
    { error: validation.reason },
    { status: 403 }
  );
}
```

### 3. Role Management UI Component

```typescript
import { RoleManagementDialog } from '@/components/workshops/RoleManagementDialog';

<RoleManagementDialog
  open={showRoleManagement}
  onOpenChange={setShowRoleManagement}
  participants={participants}
  currentUserId={session?.user.id || ""}
  currentUserRole={currentParticipant?.role || "participant"}
  workshopId={workshopId}
  onRoleUpdate={fetchParticipants}
/>
```

---

## API Integration

### Role Assignment Endpoint

**PUT** `/api/workshops/[id]/participants/[participantId]/role`

**Request Body:**
```json
{
  "role": "facilitator"
}
```

**Success Response:**
```json
{
  "success": true,
  "participant": { /* updated participant */ },
  "message": "Role changed to Facilitator",
  "roleInfo": {
    "displayName": "Facilitator",
    "level": 60,
    "permissionCount": 25
  }
}
```

**Error Responses:**

```json
// Insufficient permissions
{
  "error": "Your role (Moderator) cannot assign the Co-Host role",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "yourRole": "moderator",
    "canAssign": ["participant"],
    "attemptedRole": "co-host"
  }
}

// Invalid transition
{
  "error": "You can only change roles of users with lower authority",
  "code": "INVALID_ROLE_TRANSITION",
  "details": {
    "currentRole": "co-host",
    "newRole": "moderator",
    "requesterRole": "facilitator"
  }
}

// Cannot change own role
{
  "error": "You cannot change your own role",
  "code": "CANNOT_CHANGE_OWN_ROLE"
}
```

---

## UI Components

### RoleManagementDialog

Comprehensive role management interface with:
- **Assign Roles Tab**: Search, filter, and assign roles to participants
- **Role Overview Tab**: View all roles, permissions, and current assignments
- Permission-based controls
- Real-time validation

**Features:**
- Visual role hierarchy display
- Permission grouping by resource
- Participant search and filtering
- Role assignment validation
- Detailed role descriptions

### Permission-Based Controls

```typescript
// Control bar with permission checks
{permissions.can('screen', 'share') && (
  <Button onClick={shareScreen}>
    <MonitorUp className="w-5 h-5" />
  </Button>
)}

// Settings with host-only controls
{permissions.canLockSession && (
  <Button onClick={toggleLock}>
    {isLocked ? <Lock /> : <Unlock />}
  </Button>
)}

// Role management button
{permissions.canAssignRoles && (
  <Button onClick={() => setShowRoleManagement(true)}>
    <UserCog className="w-5 h-5" />
  </Button>
)}
```

---

## Testing

### Testing Permission Checks

```typescript
import { hasPermission, canAssignRole } from '@/lib/workshop-roles-config';

describe('Workshop Permissions', () => {
  it('host can assign any role', () => {
    expect(canAssignRole('host', 'co-host')).toBe(true);
    expect(canAssignRole('host', 'participant')).toBe(true);
  });
  
  it('moderator cannot assign co-host', () => {
    expect(canAssignRole('moderator', 'co-host')).toBe(false);
  });
  
  it('facilitator can share screen', () => {
    expect(hasPermission('facilitator', 'screen', 'share')).toBe(true);
  });
  
  it('participant cannot end session', () => {
    expect(hasPermission('participant', 'session', 'end')).toBe(false);
  });
});
```

### Testing Role Transitions

```typescript
import { validateRoleTransition } from '@/lib/workshop-roles-config';

describe('Role Transitions', () => {
  it('co-host can promote participant to facilitator', () => {
    const result = validateRoleTransition('co-host', 'participant', 'facilitator');
    expect(result.valid).toBe(true);
  });
  
  it('facilitator cannot demote co-host', () => {
    const result = validateRoleTransition('facilitator', 'co-host', 'participant');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('lower authority');
  });
});
```

---

## Best Practices

### 1. Always Check Permissions

❌ **Don't:**
```typescript
// Showing controls without permission check
<Button onClick={endSession}>End Session</Button>
```

✅ **Do:**
```typescript
// Check permissions first
{permissions.canEndSession && (
  <Button onClick={endSession}>End Session</Button>
)}
```

### 2. Validate on Both Frontend and Backend

❌ **Don't:**
```typescript
// Only frontend validation
if (role === 'host') {
  await deleteFile();
}
```

✅ **Do:**
```typescript
// Frontend check for UX
{permissions.can('files', 'delete') && (
  <Button onClick={deleteFile}>Delete</Button>
)}

// Backend validation in API
const validation = validatePermission(role, 'files', 'delete');
if (!validation.allowed) {
  return error(403, validation.reason);
}
```

### 3. Use Centralized Configuration

❌ **Don't:**
```typescript
// Hardcoded permission checks scattered everywhere
if (role === 'host' || role === 'co-host') {
  // allow action
}
```

✅ **Do:**
```typescript
// Use centralized permission system
if (permissions.can('participants', 'mute')) {
  // allow action
}
```

### 4. Provide Clear Feedback

✅ **Do:**
```typescript
// Clear error messages
return NextResponse.json({
  error: `Your role (${getRoleConfig(role).displayName}) cannot perform this action`,
  code: 'INSUFFICIENT_PERMISSIONS',
  details: {
    requiredPermission: 'participants.mute',
    yourRole: role
  }
}, { status: 403 });
```

### 5. Handle Role Changes Gracefully

```typescript
// Listen for role changes and update UI
useEffect(() => {
  const handleRoleChange = (event: WorkshopEvent) => {
    if (event.type === 'role_changed') {
      if (event.data.participantId === currentUser.id) {
        // Update local permissions
        refetchParticipant();
        toast.info(`Your role has been changed to ${event.data.newRole}`);
      }
    }
  };
  
  subscribeToWorkshopEvents(handleRoleChange);
}, []);
```

---

## Quick Reference

### Permission Check Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `can(resource, action)` | Check specific permission | `permissions.can('screen', 'share')` |
| `canManageParticipants` | Mute/remove participants | `permissions.canManageParticipants` |
| `canAssignRoles` | Change participant roles | `permissions.canAssignRoles` |
| `canEndSession` | End workshop for all | `permissions.canEndSession` |

### Role Assignment Functions

| Function | Purpose |
|----------|---------|
| `canAssignRole(from, to)` | Check if role can be assigned |
| `getAssignableRoles(role)` | Get list of assignable roles |
| `validateRoleTransition()` | Validate role change |
| `getRoleConfig(role)` | Get complete role information |

### Common Permission Patterns

```typescript
// Check before showing UI
{permissions.can('polls', 'create') && <CreatePollButton />}

// Check before action
const handleAction = () => {
  if (!permissions.can('chat', 'manage')) {
    toast.error('You do not have permission to manage chat');
    return;
  }
  performAction();
};

// Get role info
const roleConfig = getRoleConfig(participant.role);
console.log(roleConfig.displayName); // "Facilitator"
console.log(roleConfig.level); // 60
console.log(roleConfig.permissions.length); // 25
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** Permissions not updating after role change
**Solution:** Ensure you're refetching participant data after role updates

**Issue:** User can see controls they shouldn't have access to
**Solution:** Check that you're passing the correct role to `useWorkshopPermissions()`

**Issue:** API returns 403 but UI shows button
**Solution:** Add frontend permission check before showing the button

### Debug Mode

```typescript
// Enable permission debugging
const permissions = useWorkshopPermissions(role);
console.log('Permission Summary:', getPermissionSummary(role));
console.log('Can assign roles:', getAssignableRoles(role));
```

---

## Changelog

**v1.0.0** - Initial comprehensive RBAC implementation
- 6 distinct roles with hierarchical authority
- 50+ granular permissions across 11 resource types
- Centralized configuration system
- Full UI and API integration
- Role management dialog
- Permission validation middleware

---

## License

Part of Ucon Ministries Workshop Platform
© 2024 Ucon Ministries. All rights reserved.
