# Workshop RBAC System - Complete Guide

## 🎯 Overview

The Workshop RBAC (Role-Based Access Control) system provides comprehensive, granular control over participant permissions in workshop sessions. It implements a sophisticated hierarchy of 6 roles with over 40 distinct permissions across 12 resource categories.

## 📊 System Architecture

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│         HOST (Level 100)                │ ← Full Control
│  Can assign: All roles                  │
├─────────────────────────────────────────┤
│       CO-HOST (Level 80)                │ ← Administrative
│  Can assign: Facilitator, Moderator,    │
│              Presenter, Participant     │
├─────────────────────────────────────────┤
│     FACILITATOR (Level 60)              │ ← Content Management
│  Can assign: Presenter, Participant     │
├─────────────────────────────────────────┤
│      MODERATOR (Level 50)               │ ← Community Management
│  Can assign: Participant                │
├─────────────────────────────────────────┤
│      PRESENTER (Level 40)               │ ← Content Delivery
│  Can assign: None                       │
├─────────────────────────────────────────┤
│     PARTICIPANT (Level 10)              │ ← Basic Access
│  Can assign: None                       │
└─────────────────────────────────────────┘
```

## 🔐 Role Definitions

### 1. Host
**Authority Level:** 100  
**Color:** Purple (`text-purple-500`)  
**Icon:** Crown 👑

**Description:** Has complete control over all workshop features and can manage all participants.

**Permissions:** ALL (Complete access to all 12 resource categories)

**Can Assign:** Host, Co-Host, Facilitator, Moderator, Presenter, Participant

**Use Cases:**
- Workshop organizer
- Primary instructor
- Session owner

---

### 2. Co-Host
**Authority Level:** 80  
**Color:** Blue (`text-blue-500`)  
**Icon:** UserCog ⚙️

**Description:** Can assist the host by managing participants, content, and session settings.

**Key Permissions:**
- ✅ Lock/unlock meeting
- ✅ Start/stop recording
- ✅ Manage all participants (mute, remove, spotlight)
- ✅ Assign roles (except Host)
- ✅ Full screen sharing control
- ✅ Manage chat, whiteboard, polls
- ✅ Create and manage breakout rooms
- ❌ Cannot end session for everyone
- ❌ Cannot assign Host role

**Can Assign:** Facilitator, Moderator, Presenter, Participant

**Use Cases:**
- Assistant instructor
- Technical support
- Session co-manager

---

### 3. Facilitator
**Authority Level:** 60  
**Color:** Green (`text-green-500`)  
**Icon:** Users 👥

**Description:** Can present content, manage discussions, and moderate participant activities.

**Key Permissions:**
- ✅ Share screen
- ✅ Manage whiteboard (draw, clear)
- ✅ Create and manage polls
- ✅ Full Q&A management
- ✅ Manage chat messages
- ✅ Upload and share files
- ✅ Control shared videos
- ✅ Mute individual participants
- ✅ Spotlight participants
- ❌ Cannot lock meeting
- ❌ Cannot record session
- ❌ Cannot remove participants

**Can Assign:** Presenter, Participant

**Use Cases:**
- Workshop facilitator
- Discussion leader
- Content manager

---

### 4. Moderator
**Authority Level:** 50  
**Color:** Yellow (`text-yellow-500`)  
**Icon:** Shield 🛡️

**Description:** Focuses on managing chat, Q&A, and ensuring productive participant interactions.

**Key Permissions:**
- ✅ Manage chat (delete messages)
- ✅ Send private messages
- ✅ Full Q&A management
- ✅ Mute individual participants
- ✅ View poll results
- ❌ Cannot share screen
- ❌ Cannot manage whiteboard
- ❌ Cannot create polls
- ❌ Cannot upload files

**Can Assign:** Participant

**Use Cases:**
- Chat moderator
- Q&A manager
- Community manager

---

### 5. Presenter
**Authority Level:** 40  
**Color:** Orange (`text-orange-500`)  
**Icon:** Monitor 🖥️

**Description:** Can share screen and present content with basic interaction features.

**Key Permissions:**
- ✅ Share screen
- ✅ Draw on whiteboard
- ✅ Send chat messages
- ✅ Ask questions
- ✅ Vote in polls
- ❌ Cannot create polls
- ❌ Cannot manage chat
- ❌ Cannot upload files
- ❌ Cannot mute others

**Can Assign:** None

**Use Cases:**
- Guest speaker
- Content presenter
- Guest instructor

---

### 6. Participant
**Authority Level:** 10  
**Color:** Gray (`text-gray-500`)  
**Icon:** User 👤

**Description:** Basic viewing and interaction permissions for workshop attendees.

**Key Permissions:**
- ✅ View content
- ✅ Send chat messages
- ✅ Ask questions
- ✅ Upvote questions
- ✅ Vote in polls
- ✅ Send reactions
- ✅ View whiteboard
- ✅ Download shared files
- ✅ Join breakout rooms
- ❌ Cannot share screen
- ❌ Cannot present
- ❌ Cannot manage anything

**Can Assign:** None

**Use Cases:**
- Workshop attendees
- Students
- General audience

---

## 📋 Permission Categories

### 1. Session Management (4 permissions)
- `session.end` - End workshop for everyone
- `session.lock` - Lock/unlock meeting
- `session.record` - Start/stop recording
- `session.settings` - Change session settings

### 2. Participant Management (6 permissions)
- `participants.view` - View participant list
- `participants.mute` - Mute individual participants
- `participants.muteAll` - Mute all participants
- `participants.remove` - Remove participants
- `participants.spotlight` - Spotlight participants
- `participants.admitWaiting` - Admit waiting participants

### 3. Role Management (4 permissions)
- `roles.view` - View participant roles
- `roles.assign` - Assign roles to participants
- `roles.assignHost` - Assign host role
- `roles.assignCoHost` - Assign co-host role

### 4. Screen Sharing (2 permissions)
- `screen.share` - Share screen
- `screen.manageSharing` - Manage who can share

### 5. Chat (4 permissions)
- `chat.send` - Send messages
- `chat.sendPrivate` - Send private messages
- `chat.manage` - Delete and manage messages
- `chat.disableForParticipants` - Disable chat

### 6. Whiteboard (4 permissions)
- `whiteboard.view` - View whiteboard
- `whiteboard.draw` - Draw on whiteboard
- `whiteboard.clear` - Clear whiteboard
- `whiteboard.manage` - Manage permissions

### 7. Polls (5 permissions)
- `polls.view` - View polls
- `polls.vote` - Vote in polls
- `polls.create` - Create polls
- `polls.manage` - Edit/delete polls
- `polls.viewResults` - View results

### 8. Questions/Q&A (4 permissions)
- `questions.ask` - Ask questions
- `questions.upvote` - Upvote questions
- `questions.answer` - Answer questions
- `questions.manage` - Manage Q&A

### 9. Files (4 permissions)
- `files.view` - View shared files
- `files.upload` - Upload files
- `files.download` - Download files
- `files.delete` - Delete files

### 10. Breakout Rooms (5 permissions)
- `breakout.view` - View breakout rooms
- `breakout.join` - Join rooms
- `breakout.create` - Create rooms
- `breakout.assign` - Assign participants
- `breakout.broadcast` - Broadcast to all rooms

### 11. Video (3 permissions)
- `video.share` - Share video
- `video.control` - Control playback
- `video.upload` - Upload videos

### 12. Reactions (2 permissions)
- `reactions.send` - Send reactions
- `reactions.disable` - Disable for all

---

## 💻 Developer Integration

### 1. Using the Permission Hook

```typescript
import { useWorkshopPermissions } from "@/hooks/useWorkshopPermissions";

function MyComponent({ currentUserRole }: { currentUserRole: WorkshopRole }) {
  const permissions = useWorkshopPermissions(currentUserRole);

  return (
    <>
      {/* Check specific permission */}
      {permissions.can('screen', 'share') && (
        <Button onClick={handleScreenShare}>
          <MonitorUp className="w-4 h-4" />
          Share Screen
        </Button>
      )}

      {/* Check role-based features */}
      {permissions.canManageParticipants && (
        <ParticipantManagementPanel />
      )}

      {permissions.canAssignRoles && (
        <Button onClick={() => setShowRoleDialog(true)}>
          <UserCog className="w-4 h-4" />
          Manage Roles
        </Button>
      )}

      {/* Check if can end session */}
      {permissions.canEndSession ? (
        <DropdownMenu>
          <DropdownMenuTrigger>End</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Leave Meeting</DropdownMenuItem>
            <DropdownMenuItem>End for Everyone</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleLeave}>Leave</Button>
      )}
    </>
  );
}
```

### 2. Role Configuration Access

```typescript
import {
  getRoleConfig,
  canAssignRole,
  getAssignableRoles,
  hasPermission,
  compareRoles,
} from "@/lib/workshop-roles-config";

// Get role configuration
const hostConfig = getRoleConfig("host");
console.log(hostConfig.displayName); // "Host"
console.log(hostConfig.level); // 100
console.log(hostConfig.color); // "text-purple-500 border-purple-500 bg-purple-500/10"

// Check if a role can assign another role
const canCoHostAssignModerator = canAssignRole("co-host", "moderator");
// Returns: true

// Get all roles a role can assign
const moderatorCanAssign = getAssignableRoles("moderator");
// Returns: ["participant"]

// Check specific permission
const canModeratorShareScreen = hasPermission("moderator", "screen", "share");
// Returns: false

// Compare role levels
const comparison = compareRoles("host", "participant");
// Returns: 1 (host > participant)
```

### 3. Role Management Component

```typescript
import { RoleManagementDialog } from "@/components/workshops/RoleManagementDialog";

function WorkshopControls() {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const permissions = useWorkshopPermissions(currentUserRole);

  if (!permissions.canAssignRoles) return null;

  return (
    <>
      <Button onClick={() => setShowRoleDialog(true)}>
        <UserCog className="w-4 h-4 mr-2" />
        Manage Roles
      </Button>

      <RoleManagementDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        participants={activeParticipants}
        currentUserId={session.user.id}
        currentUserRole={currentParticipant.role}
        workshopId={workshopId}
        onRoleUpdate={fetchParticipants}
      />
    </>
  );
}
```

### 4. API Integration

#### Change Participant Role

```typescript
// PUT /api/workshops/[id]/participants/[participantId]/role
const response = await fetch(
  `/api/workshops/${workshopId}/participants/${participantId}/role`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role: "co-host" }),
  }
);

const data = await response.json();
// Returns: { success: true, participant: {...}, message: "Role changed to Co-Host" }
```

#### Permission Validation (Server-Side)

```typescript
// In your API route
import { hasPermission } from "@/lib/workshop-roles-config";

// Check if user has permission
const userRole = currentParticipant.role;
if (!hasPermission(userRole, "session", "lock")) {
  return NextResponse.json(
    { error: "Insufficient permissions", code: "INSUFFICIENT_PERMISSIONS" },
    { status: 403 }
  );
}
```

---

## 🎨 UI Components

### 1. Role Badge Display

```typescript
import { getRoleConfig } from "@/lib/workshop-roles-config";

function ParticipantCard({ participant }) {
  const roleConfig = getRoleConfig(participant.role);
  
  return (
    <Badge className={roleConfig.color}>
      <Crown className="w-3 h-3 mr-1" />
      {roleConfig.displayName}
    </Badge>
  );
}
```

### 2. Permissions Matrix View

```typescript
import { PermissionsMatrixView } from "@/components/workshops/PermissionsMatrixView";

// Shows a complete table of all permissions across all roles
<PermissionsMatrixView />
```

### 3. Role Comparison View

```typescript
import { RoleComparisonView } from "@/components/workshops/RoleComparisonView";

// Side-by-side comparison of two roles
<RoleComparisonView />
```

---

## 🔄 Database Schema

### Workshop Participants Table

```sql
CREATE TABLE workshop_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workshop_id INTEGER NOT NULL REFERENCES workshops(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  user_name TEXT NOT NULL,
  peer_id TEXT,
  is_host INTEGER DEFAULT 0,
  is_muted INTEGER DEFAULT 0,
  is_video_off INTEGER DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'participant', -- New field
  joined_at TEXT NOT NULL,
  left_at TEXT
);
```

**Valid role values:** `'host'`, `'co-host'`, `'facilitator'`, `'moderator'`, `'presenter'`, `'participant'`

---

## ✅ Best Practices

### 1. Permission Checks

- **Always check permissions on both client and server**
- Client-side for UI/UX
- Server-side for security

```typescript
// Client-side
if (permissions.can('screen', 'share')) {
  // Show button
}

// Server-side API route
if (!hasPermission(userRole, 'screen', 'share')) {
  return res.status(403).json({ error: "Insufficient permissions" });
}
```

### 2. Role Assignment

- Only allow role assignment by authorized users
- Never let users change their own role
- Validate role hierarchy

```typescript
// Check if user can assign this role
if (!canAssignRole(currentUserRole, targetRole)) {
  toast.error("You don't have permission to assign this role");
  return;
}

// Prevent self-assignment
if (targetUserId === currentUserId) {
  toast.error("You cannot change your own role");
  return;
}
```

### 3. UI/UX Guidelines

- **Display role badges** prominently so users understand authority
- **Show permission tooltips** when controls are disabled
- **Use consistent colors** for each role across the UI
- **Provide clear feedback** when permission checks fail

### 4. Error Handling

```typescript
// Graceful degradation
{permissions.canManageParticipants ? (
  <FullManagementPanel />
) : permissions.can('participants', 'mute') ? (
  <LimitedManagementPanel />
) : null}

// Clear error messages
if (!hasPermission) {
  toast.error("Only hosts and co-hosts can perform this action");
}
```

---

## 🚀 Quick Start Checklist

- [ ] Import permission hook: `useWorkshopPermissions`
- [ ] Get user's current role from participant data
- [ ] Check permissions before showing UI controls
- [ ] Add role management button for authorized users
- [ ] Implement role badges in participant list
- [ ] Validate permissions on server-side API routes
- [ ] Test with different roles
- [ ] Update documentation for your team

---

## 📞 API Endpoints Reference

### Role Management

```typescript
// Update participant role
PUT /api/workshops/[id]/participants/[participantId]/role
Body: { role: WorkshopRole }
Returns: { success: boolean, participant: Participant, message: string }

// Get participants (includes roles)
GET /api/workshops/[id]/participants
Returns: Participant[]
```

---

## 🎓 Training Scenarios

### Scenario 1: Workshop Instructor Setup
**Roles Needed:** 1 Host, 1-2 Co-Hosts, Multiple Participants

1. **Host** creates workshop and starts session
2. **Host** assigns **Co-Host** to assistant instructor
3. **Co-Host** manages participant admissions
4. **Host** presents main content
5. **Co-Host** monitors chat and Q&A

### Scenario 2: Panel Discussion
**Roles Needed:** 1 Host, 3-4 Presenters, 1 Moderator, Participants

1. **Host** assigns **Presenter** roles to panelists
2. **Moderator** manages Q&A from audience
3. **Presenters** share screens for their sections
4. **Moderator** curates and highlights top questions

### Scenario 3: Interactive Workshop
**Roles Needed:** 1 Host, 2 Facilitators, Participants

1. **Host** starts session and introduces facilitators
2. **Facilitators** manage breakout rooms
3. **Facilitators** run polls and collect feedback
4. **Host** synthesizes results

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial RBAC system implementation
- 6 roles with hierarchical structure
- 47 granular permissions across 12 categories
- React hooks for permission checking
- Role management UI components
- Complete documentation

---

## 🤝 Contributing

When adding new permissions:

1. Add to `ALL_PERMISSIONS` in `workshop-roles-config.ts`
2. Assign to appropriate roles
3. Update documentation
4. Add UI controls with permission checks
5. Test with all role levels

---

## 📚 Additional Resources

- **Permission Hook:** `/src/hooks/useWorkshopPermissions.ts`
- **Role Configuration:** `/src/lib/workshop-roles-config.ts`
- **Role Management UI:** `/src/components/workshops/RoleManagementDialog.tsx`
- **Admin Dashboard:** `/src/app/admin/workshops/roles/page.tsx`
- **API Routes:** `/src/app/api/workshops/[id]/participants/[participantId]/role/route.ts`

---

**Need Help?** Check the admin dashboard at `/admin/workshops/roles` for visual tools and reference materials.
