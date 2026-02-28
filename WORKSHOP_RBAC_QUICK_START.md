# Workshop RBAC Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the Workshop RBAC system quickly.

---

## Step 1: Understanding the Basics

### The 6 Roles

1. **Host** 👑 - Complete control (Level 100)
2. **Co-Host** 🛡️ - Assists host (Level 80)
3. **Facilitator** 👥 - Presents & moderates (Level 60)
4. **Moderator** 🔒 - Manages interactions (Level 50)
5. **Presenter** 📺 - Shares content (Level 40)
6. **Participant** 👤 - Basic engagement (Level 10)

### Key Principle

**Higher level = More authority**

---

## Step 2: Frontend - Check Permissions

### Import the Hook

```typescript
import { useWorkshopPermissions } from '@/hooks/useWorkshopPermissions';
```

### Use in Your Component

```typescript
function MyWorkshopComponent({ participant }) {
  // Get permissions for this participant's role
  const permissions = useWorkshopPermissions(participant?.role);
  
  return (
    <div>
      {/* Method 1: Use convenience methods */}
      {permissions.canManageParticipants && (
        <Button onClick={muteAll}>Mute All</Button>
      )}
      
      {/* Method 2: Check specific permissions */}
      {permissions.can('screen', 'share') && (
        <Button onClick={shareScreen}>Share Screen</Button>
      )}
      
      {/* Method 3: Use boolean flags */}
      <Button disabled={!permissions.canRecord}>
        Start Recording
      </Button>
    </div>
  );
}
```

### Available Convenience Methods

```typescript
permissions.canManageParticipants  // Mute, remove participants
permissions.canPresent             // Share screen
permissions.canModerate            // Manage chat, Q&A
permissions.canManagePolls         // Create/manage polls
permissions.canManageBreakout      // Breakout rooms
permissions.canRecord              // Start/stop recording
permissions.canEndSession          // End for everyone
permissions.canAssignRoles         // Change participant roles
permissions.canLockSession         // Lock meeting
permissions.canChangeSettings      // Modify settings
```

---

## Step 3: Backend - Validate Permissions

### In Your API Route

```typescript
import { getCurrentUser } from '@/lib/auth';
import { validatePermission } from '@/lib/workshop-permissions';
import { db } from '@/db';
import { workshopParticipants } from '@/db/schema';

export async function POST(request: NextRequest) {
  // 1. Get authenticated user
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // 2. Get participant record (includes role)
  const participant = await db
    .select()
    .from(workshopParticipants)
    .where(/* ... */)
    .limit(1);
  
  const role = participant[0]?.role || 'participant';
  
  // 3. Validate permission
  const validation = validatePermission(role, 'polls', 'create');
  if (!validation.allowed) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 403 }
    );
  }
  
  // 4. Proceed with action
  // ...
}
```

---

## Step 4: Role Management UI

### Add the Role Management Dialog

```typescript
import { RoleManagementDialog } from '@/components/workshops/RoleManagementDialog';

function WorkshopLiveView() {
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const permissions = useWorkshopPermissions(currentParticipant?.role);
  
  return (
    <>
      {/* Show button only if user can assign roles */}
      {permissions.canAssignRoles && (
        <Button onClick={() => setShowRoleManagement(true)}>
          <UserCog className="w-5 h-5" />
          Manage Roles
        </Button>
      )}
      
      {/* Role management dialog */}
      <RoleManagementDialog
        open={showRoleManagement}
        onOpenChange={setShowRoleManagement}
        participants={participants}
        currentUserId={session?.user.id || ""}
        currentUserRole={currentParticipant?.role || "participant"}
        workshopId={workshopId}
        onRoleUpdate={fetchParticipants}
      />
    </>
  );
}
```

---

## Step 5: Common Patterns

### Pattern 1: Show/Hide Features

```typescript
{permissions.can('screen', 'share') && (
  <ScreenShareButton />
)}

{permissions.canRecord && (
  <RecordingControls />
)}

{permissions.canAssignRoles && (
  <RoleManagementButton />
)}
```

### Pattern 2: Enable/Disable Controls

```typescript
<Button 
  disabled={!permissions.canLockSession}
  onClick={toggleLock}
>
  {isLocked ? 'Unlock' : 'Lock'} Meeting
</Button>

<IconButton
  disabled={!permissions.canManageParticipants}
  onClick={muteParticipant}
>
  <MicOff />
</IconButton>
```

### Pattern 3: Conditional Actions

```typescript
const handleDelete = async () => {
  if (!permissions.can('files', 'delete')) {
    toast.error('You do not have permission to delete files');
    return;
  }
  
  await deleteFile();
  toast.success('File deleted');
};
```

### Pattern 4: Role-Based Styling

```typescript
import { getRoleConfig } from '@/lib/workshop-roles-config';

const roleConfig = getRoleConfig(participant.role);

<Badge className={roleConfig.color}>
  {roleConfig.displayName}
</Badge>
```

---

## Step 6: Testing

### Test Permission Checks

```typescript
import { hasPermission, canAssignRole } from '@/lib/workshop-roles-config';

// Test specific permission
const canShare = hasPermission('facilitator', 'screen', 'share');
console.log(canShare); // true

// Test role assignment
const canAssign = canAssignRole('co-host', 'facilitator');
console.log(canAssign); // true

// Test invalid assignment
const canAssignHost = canAssignRole('moderator', 'host');
console.log(canAssignHost); // false
```

---

## Common Use Cases

### Use Case 1: Host/Co-Host Only Controls

```typescript
{(permissions.can('session', 'end') || permissions.canLockSession) && (
  <SettingsPanel>
    {permissions.can('session', 'end') && (
      <Button variant="destructive" onClick={endSession}>
        End for Everyone
      </Button>
    )}
    {permissions.canLockSession && (
      <Button onClick={toggleLock}>
        {isLocked ? 'Unlock' : 'Lock'} Meeting
      </Button>
    )}
  </SettingsPanel>
)}
```

### Use Case 2: Presenter Controls

```typescript
function PresenterTools({ role }) {
  const permissions = useWorkshopPermissions(role);
  
  if (!permissions.canPresent) return null;
  
  return (
    <div className="presenter-tools">
      <Button onClick={shareScreen}>
        <MonitorUp /> Share Screen
      </Button>
      <Button onClick={openWhiteboard}>
        <Palette /> Whiteboard
      </Button>
      <Button onClick={uploadFile}>
        <FileText /> Upload File
      </Button>
    </div>
  );
}
```

### Use Case 3: Moderator Panel

```typescript
function ModeratorPanel({ role }) {
  const permissions = useWorkshopPermissions(role);
  
  if (!permissions.canModerate) return null;
  
  return (
    <Panel>
      <ChatModeration 
        canDelete={permissions.can('chat', 'manage')}
      />
      <QAManagement 
        canAnswer={permissions.can('questions', 'answer')}
        canManage={permissions.can('questions', 'manage')}
      />
    </Panel>
  );
}
```

---

## API Endpoints

### Change Participant Role

**Endpoint:** `PUT /api/workshops/[id]/participants/[participantId]/role`

**Request:**
```json
{
  "role": "facilitator"
}
```

**Response:**
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

**Error Response:**
```json
{
  "error": "Your role (Moderator) cannot assign the Co-Host role",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "yourRole": "moderator",
    "canAssign": ["participant"],
    "attemptedRole": "co-host"
  }
}
```

---

## Troubleshooting

### Problem: Permissions not working

**Check:**
1. Is the role correctly set in the participant record?
2. Are you passing the role to `useWorkshopPermissions()`?
3. Is the participant data being refreshed after role changes?

**Debug:**
```typescript
console.log('Current role:', participant?.role);
console.log('Permissions:', useWorkshopPermissions(participant?.role));
```

### Problem: User sees controls they shouldn't

**Solution:** Add permission checks before rendering

```typescript
// ❌ Wrong
<Button onClick={dangerousAction}>Delete All</Button>

// ✅ Correct
{permissions.can('files', 'delete') && (
  <Button onClick={dangerousAction}>Delete All</Button>
)}
```

### Problem: API returns 403 but UI shows button

**Solution:** Check permissions on both frontend and backend

```typescript
// Frontend
{permissions.can('polls', 'create') && (
  <CreatePollButton />
)}

// Backend API route
const validation = validatePermission(role, 'polls', 'create');
if (!validation.allowed) {
  return error(403, validation.reason);
}
```

---

## Cheat Sheet

### Quick Permission Checks

| Action | Permission Check | Who Can Do It |
|--------|------------------|---------------|
| Share screen | `can('screen', 'share')` | Presenter+ |
| Mute participant | `can('participants', 'mute')` | Moderator+ |
| Create poll | `can('polls', 'create')` | Facilitator+ |
| Assign roles | `can('roles', 'assign')` | Varies by role |
| End session | `can('session', 'end')` | Host only |
| Record | `can('session', 'record')` | Co-Host+ |

### Role Assignment Rules

| Your Role | Can Assign |
|-----------|------------|
| Host | All roles |
| Co-Host | Facilitator, Moderator, Presenter, Participant |
| Facilitator | Presenter, Participant |
| Moderator | Participant |
| Presenter | None |
| Participant | None |

---

## Next Steps

1. ✅ **Implement permission checks** in your components
2. ✅ **Validate on backend** in API routes
3. ✅ **Test role transitions** with different user roles
4. ✅ **Add role management UI** for hosts/co-hosts
5. ✅ **Monitor and debug** with console logs

## Need Help?

- 📖 Full documentation: `WORKSHOP_RBAC_IMPLEMENTATION.md`
- 🔧 Configuration: `src/lib/workshop-roles-config.ts`
- 🎣 Hooks: `src/hooks/useWorkshopPermissions.ts`
- 🔒 Validation: `src/lib/workshop-permissions.ts`

---

**You're all set! Start building permission-aware workshop features! 🚀**
