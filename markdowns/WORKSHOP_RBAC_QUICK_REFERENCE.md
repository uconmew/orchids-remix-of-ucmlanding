# Workshop RBAC - Quick Reference Card

## 🎯 6 Roles at a Glance

| Role | Level | Key Powers | Can Assign |
|------|-------|------------|------------|
| 👑 **Host** | 100 | Everything | All roles |
| ⚙️ **Co-Host** | 80 | Manage participants, lock/record | All except Host |
| 👥 **Facilitator** | 60 | Present, moderate, manage content | Presenter, Participant |
| 🛡️ **Moderator** | 50 | Manage chat/Q&A, mute users | Participant |
| 🖥️ **Presenter** | 40 | Share screen only | None |
| 👤 **Participant** | 10 | View and interact | None |

---

## 📊 Permission Matrix (Quick View)

| Permission | Host | Co-Host | Facilitator | Moderator | Presenter | Participant |
|------------|------|---------|-------------|-----------|-----------|-------------|
| **End Session** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Lock Meeting** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Record** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Remove Participants** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mute All** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mute Individual** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Assign Roles** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Share Screen** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Manage Chat** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Send Messages** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Polls** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Vote in Polls** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage Q&A** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ask Questions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload Files** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Download Files** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Breakout** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Join Breakout** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage Whiteboard** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Draw on Whiteboard** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 💻 Code Snippets

### Check Permission
```typescript
const permissions = useWorkshopPermissions(currentUserRole);

if (permissions.can('screen', 'share')) {
  // Show screen share button
}
```

### Check Role Feature
```typescript
if (permissions.canManageParticipants) {
  // Show participant management
}

if (permissions.canAssignRoles) {
  // Show role management
}
```

### Display Role Badge
```typescript
const roleConfig = getRoleConfig(participant.role);

<Badge className={roleConfig.color}>
  {roleConfig.displayName}
</Badge>
```

### Change Role (API)
```typescript
PUT /api/workshops/[id]/participants/[participantId]/role
Body: { role: "co-host" }
```

---

## 🎨 Role Colors

- 👑 **Host:** Purple (`text-purple-500`)
- ⚙️ **Co-Host:** Blue (`text-blue-500`)
- 👥 **Facilitator:** Green (`text-green-500`)
- 🛡️ **Moderator:** Yellow (`text-yellow-500`)
- 🖥️ **Presenter:** Orange (`text-orange-500`)
- 👤 **Participant:** Gray (`text-gray-500`)

---

## 🔒 Security Rules

1. ✅ Always validate permissions server-side
2. ✅ Users cannot change their own role
3. ✅ Can only assign roles with sufficient authority
4. ✅ Role hierarchy must be respected
5. ❌ Never trust client-side permission checks alone

---

## 📍 Key Files

- **Config:** `/src/lib/workshop-roles-config.ts`
- **Hook:** `/src/hooks/useWorkshopPermissions.ts`
- **UI:** `/src/components/workshops/RoleManagementDialog.tsx`
- **API:** `/src/app/api/workshops/[id]/participants/[participantId]/role/route.ts`
- **Admin:** `/src/app/admin/workshops/roles/page.tsx`

---

## 🚀 Common Use Cases

### Setup Workshop
```typescript
// 1. Host creates session
// 2. Assign Co-Host to assistant
// 3. Participants join
// 4. Assign special roles as needed
```

### Panel Discussion
```typescript
// 1. Assign Presenter to panelists
// 2. Assign Moderator for Q&A
// 3. Participants ask questions
```

### Interactive Session
```typescript
// 1. Assign Facilitators
// 2. Create breakout rooms
// 3. Run polls
// 4. Collect feedback
```

---

## ⚡ Quick Tips

- **Display role badges** to show authority levels
- **Use tooltips** when permissions prevent actions
- **Provide clear feedback** on permission failures
- **Test with all roles** before deployment
- **Document role assignments** for your team

---

## 📊 12 Permission Categories

1. 🎯 **Session** - Control session lifecycle
2. 👥 **Participants** - Manage participants
3. 🔐 **Roles** - Assign roles
4. 🖥️ **Screen** - Share screen
5. 💬 **Chat** - Messaging
6. 🎨 **Whiteboard** - Collaborative drawing
7. 📊 **Polls** - Create/manage polls
8. ❓ **Questions** - Q&A system
9. 📁 **Files** - File sharing
10. 🚪 **Breakout** - Breakout rooms
11. 🎥 **Video** - Video playback
12. 😊 **Reactions** - Emoji reactions

---

**View Full Documentation:** `WORKSHOP_RBAC_COMPLETE_GUIDE.md`  
**Admin Dashboard:** `/admin/workshops/roles`
