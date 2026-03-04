# Workshop RBAC Testing Guide

## 🧪 Complete Testing Strategy

This guide provides comprehensive testing procedures for the Workshop RBAC system.

---

## Quick Test Scenarios

### Scenario 1: Host Creating Workshop & Assigning Roles

**Steps:**
1. Login as user A (will become Host)
2. Create a new workshop
3. Start the workshop (go live)
4. Join the workshop → Should see "Host" badge
5. Wait for user B to join → Should see them as "Participant"
6. Click Role Management button (UserCog icon)
7. Select user B and change their role to "Facilitator"
8. Verify user B can now share screen

**Expected Results:**
- ✅ Host sees Role Management button
- ✅ Can assign any role to participants
- ✅ Role change reflected immediately
- ✅ User B's controls update based on new role

---

### Scenario 2: Co-Host Permissions

**Steps:**
1. Host assigns user C as "Co-Host"
2. User C should see:
   - Lock/Unlock meeting button
   - Mute participants button
   - Screen share button
   - Role management button (limited)
3. User C tries to assign "Co-Host" to user D
4. User C tries to end meeting for everyone

**Expected Results:**
- ✅ Co-Host can lock meeting
- ✅ Co-Host can mute participants
- ✅ Co-Host can share screen
- ✅ Co-Host can assign Facilitator/Moderator/Presenter
- ❌ Co-Host CANNOT end meeting (Host only)

---

### Scenario 3: Facilitator Presenting

**Steps:**
1. Host assigns user D as "Facilitator"
2. User D should see:
   - Screen share button (enabled)
   - Whiteboard access
   - Create polls button
   - Mute participant button
3. User D tries to:
   - Share screen → Should work
   - Create breakout rooms → Should work
   - End meeting → Button should not appear
   - Assign "Co-Host" role → Should fail

**Expected Results:**
- ✅ Can present and share content
- ✅ Can moderate discussions
- ✅ Can create polls and manage breakout
- ❌ Cannot end session
- ❌ Cannot assign high-level roles

---

### Scenario 4: Moderator Managing Chat

**Steps:**
1. Host assigns user E as "Moderator"
2. User E should see:
   - Chat management controls
   - Q&A answer button
   - Mute participant button
3. User E tries to:
   - Delete chat messages → Should work
   - Answer Q&A questions → Should work
   - Share screen → Button disabled/not visible
   - Create breakout rooms → Should fail

**Expected Results:**
- ✅ Can moderate chat
- ✅ Can answer questions
- ✅ Can mute disruptive participants
- ❌ Cannot share screen
- ❌ Cannot create breakout rooms

---

### Scenario 5: Presenter Screen Share

**Steps:**
1. Host assigns user F as "Presenter"
2. User F should see:
   - Screen share button (enabled)
   - Whiteboard access (drawing only)
3. User F tries to:
   - Share screen → Should work
   - Draw on whiteboard → Should work
   - Mute participants → Button disabled
   - Create polls → Should work
   - Assign roles → Button not visible

**Expected Results:**
- ✅ Can share screen
- ✅ Can use whiteboard
- ✅ Can create polls
- ❌ Cannot mute participants
- ❌ Cannot assign roles

---

### Scenario 6: Participant Basic Access

**Steps:**
1. User G joins as "Participant" (default)
2. User G should see:
   - Video/audio controls (enabled)
   - Raise hand button
   - Chat send access
   - View-only for polls
3. User G tries to:
   - Share screen → Button disabled with tooltip
   - Mute another participant → No button visible
   - Create poll → Button not visible

**Expected Results:**
- ✅ Can participate in chat
- ✅ Can vote in polls
- ✅ Can raise hand
- ✅ Sees permission tooltips on disabled features
- ❌ Cannot access management features

---

## API Testing

### Test 1: Role Assignment API

```bash
# As Host - Assign facilitator role
curl -X PUT http://localhost:3000/api/workshops/1/participants/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"role": "facilitator"}'

# Expected: 200 OK with success message

# As Moderator - Try to assign co-host
curl -X PUT http://localhost:3000/api/workshops/1/participants/3/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MODERATOR_TOKEN" \
  -d '{"role": "co-host"}'

# Expected: 403 Forbidden - Insufficient permissions
```

### Test 2: Permission Validation

```bash
# Try to change own role
curl -X PUT http://localhost:3000/api/workshops/1/participants/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_2_TOKEN" \
  -d '{"role": "host"}'

# Expected: 403 Forbidden - Cannot change own role

# Try invalid role
curl -X PUT http://localhost:3000/api/workshops/1/participants/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HOST_TOKEN" \
  -d '{"role": "superadmin"}'

# Expected: 400 Bad Request - Invalid role
```

---

## Frontend Testing

### Test Permission Hook

```typescript
import { useWorkshopPermissions } from '@/hooks/useWorkshopPermissions';

function TestComponent() {
  const permissions = useWorkshopPermissions('facilitator');
  
  console.log('Can present:', permissions.canPresent); // true
  console.log('Can end session:', permissions.canEndSession); // false
  console.log('Can moderate:', permissions.canModerate); // true
  console.log('Role level:', permissions.roleLevel); // 60
  
  // Test specific permission
  const canShareScreen = permissions.can('screen', 'share');
  console.log('Can share screen:', canShareScreen); // true
  
  return <div>Check console</div>;
}
```

### Test Permission Validation

```typescript
import { validatePermission } from '@/lib/workshop-permissions';
import { canAssignRole } from '@/lib/workshop-roles-config';

// Test permission validation
const result1 = validatePermission('moderator', 'screen', 'share');
console.log(result1); // { allowed: false, reason: "..." }

const result2 = validatePermission('facilitator', 'screen', 'share');
console.log(result2); // { allowed: true }

// Test role assignment
const canAssign1 = canAssignRole('co-host', 'facilitator');
console.log(canAssign1); // true

const canAssign2 = canAssignRole('moderator', 'co-host');
console.log(canAssign2); // false
```

---

## Integration Testing

### Test 1: Complete Role Lifecycle

```typescript
describe('Workshop Role Lifecycle', () => {
  it('should handle complete role lifecycle', async () => {
    // 1. User joins as participant
    const { participant } = await joinWorkshop(userId);
    expect(participant.role).toBe('participant');
    
    // 2. Host promotes to facilitator
    const updated = await changeRole(participant.id, 'facilitator');
    expect(updated.role).toBe('facilitator');
    
    // 3. Facilitator can now share screen
    const canShare = hasPermission('facilitator', 'screen', 'share');
    expect(canShare).toBe(true);
    
    // 4. Demote back to participant
    const demoted = await changeRole(participant.id, 'participant');
    expect(demoted.role).toBe('participant');
    
    // 5. Can no longer share screen
    const canShareNow = hasPermission('participant', 'screen', 'share');
    expect(canShareNow).toBe(false);
  });
});
```

### Test 2: Permission Boundary Testing

```typescript
describe('Permission Boundaries', () => {
  it('should respect role hierarchy', () => {
    // Moderator cannot remove co-host
    const result = validateRoleTransition('moderator', 'co-host', 'participant');
    expect(result.valid).toBe(false);
    
    // Co-host can remove facilitator
    const result2 = validateRoleTransition('co-host', 'facilitator', 'participant');
    expect(result2.valid).toBe(true);
  });
  
  it('should prevent privilege escalation', () => {
    // Facilitator cannot assign co-host
    const canAssign = canAssignRole('facilitator', 'co-host');
    expect(canAssign).toBe(false);
    
    // Only host can assign host
    const canAssignHost = canAssignRole('co-host', 'host');
    expect(canAssignHost).toBe(false);
  });
});
```

---

## Manual Testing Checklist

### Host Permissions ✅

- [ ] Can end meeting for everyone
- [ ] Can lock/unlock meeting
- [ ] Can start/stop recording
- [ ] Can mute any participant
- [ ] Can remove participants
- [ ] Can assign any role
- [ ] Can share screen
- [ ] Can create breakout rooms
- [ ] Can create/delete polls
- [ ] Can manage chat
- [ ] Can spotlight participants

### Co-Host Permissions ✅

- [ ] Can lock/unlock meeting
- [ ] Can start/stop recording
- [ ] Can mute participants
- [ ] Can remove participants
- [ ] Can assign (facilitator, moderator, presenter)
- [ ] Can share screen
- [ ] Can create breakout rooms
- [ ] CANNOT end meeting
- [ ] CANNOT assign host role

### Facilitator Permissions ✅

- [ ] Can share screen
- [ ] Can use whiteboard
- [ ] Can create polls
- [ ] Can moderate chat
- [ ] Can create breakout rooms
- [ ] Can mute participants
- [ ] CANNOT remove participants
- [ ] CANNOT lock meeting
- [ ] CANNOT end session

### Moderator Permissions ✅

- [ ] Can manage chat
- [ ] Can answer Q&A
- [ ] Can mute participants
- [ ] Can view polls
- [ ] CANNOT share screen
- [ ] CANNOT create breakout rooms
- [ ] CANNOT assign high-level roles

### Presenter Permissions ✅

- [ ] Can share screen
- [ ] Can use whiteboard (draw)
- [ ] Can create polls
- [ ] CANNOT mute participants
- [ ] CANNOT manage chat
- [ ] CANNOT assign roles

### Participant Permissions ✅

- [ ] Can send chat messages
- [ ] Can vote in polls
- [ ] Can raise hand
- [ ] Can ask questions
- [ ] CANNOT share screen (see tooltip)
- [ ] CANNOT mute others
- [ ] CANNOT assign roles

---

## Edge Case Testing

### Edge Case 1: Multiple Role Changes

**Test:** Change a user's role multiple times rapidly

**Expected:** Each change validates correctly, no race conditions

### Edge Case 2: Self-Role Change Attempt

**Test:** Try to change your own role via API

**Expected:** 403 Error - "Cannot change own role"

### Edge Case 3: Host Role Protection

**Test:** Try to demote the host

**Expected:** 403 Error - "Host role cannot be changed"

### Edge Case 4: Invalid Role Name

**Test:** Submit role="superadmin" (doesn't exist)

**Expected:** 400 Error - "Invalid role"

### Edge Case 5: Concurrent Role Assignments

**Test:** Two hosts try to assign different roles to same user simultaneously

**Expected:** Last write wins, both changes validate correctly

---

## Performance Testing

### Load Test: Permission Checks

```typescript
// Test 1000 permission checks
const startTime = performance.now();

for (let i = 0; i < 1000; i++) {
  hasPermission('facilitator', 'screen', 'share');
}

const endTime = performance.now();
console.log(`1000 checks took ${endTime - startTime}ms`);

// Expected: < 10ms (should be very fast)
```

### Load Test: Role Config Lookups

```typescript
// Test 1000 role config lookups
const startTime = performance.now();

for (let i = 0; i < 1000; i++) {
  getRoleConfig('moderator');
}

const endTime = performance.now();
console.log(`1000 lookups took ${endTime - startTime}ms`);

// Expected: < 5ms (direct object lookup)
```

---

## Automated Test Suite

### Unit Tests

```typescript
// src/__tests__/workshop-permissions.test.ts

import { 
  hasPermission, 
  canAssignRole, 
  validateRoleTransition,
  getRoleConfig
} from '@/lib/workshop-roles-config';

describe('Workshop RBAC Unit Tests', () => {
  describe('Permission Checks', () => {
    it('host has all permissions', () => {
      expect(hasPermission('host', 'session', 'end')).toBe(true);
      expect(hasPermission('host', 'participants', 'remove')).toBe(true);
      expect(hasPermission('host', 'screen', 'share')).toBe(true);
    });
    
    it('participant has limited permissions', () => {
      expect(hasPermission('participant', 'chat', 'send')).toBe(true);
      expect(hasPermission('participant', 'screen', 'share')).toBe(false);
      expect(hasPermission('participant', 'session', 'end')).toBe(false);
    });
    
    it('facilitator can present', () => {
      expect(hasPermission('facilitator', 'screen', 'share')).toBe(true);
      expect(hasPermission('facilitator', 'whiteboard', 'draw')).toBe(true);
      expect(hasPermission('facilitator', 'polls', 'create')).toBe(true);
    });
  });
  
  describe('Role Assignment', () => {
    it('host can assign any role', () => {
      expect(canAssignRole('host', 'co-host')).toBe(true);
      expect(canAssignRole('host', 'facilitator')).toBe(true);
      expect(canAssignRole('host', 'participant')).toBe(true);
    });
    
    it('co-host cannot assign host', () => {
      expect(canAssignRole('co-host', 'host')).toBe(false);
    });
    
    it('moderator can only assign participant', () => {
      expect(canAssignRole('moderator', 'participant')).toBe(true);
      expect(canAssignRole('moderator', 'facilitator')).toBe(false);
    });
    
    it('participant cannot assign any role', () => {
      expect(canAssignRole('participant', 'participant')).toBe(false);
    });
  });
  
  describe('Role Transitions', () => {
    it('validates valid transitions', () => {
      const result = validateRoleTransition('co-host', 'participant', 'facilitator');
      expect(result.valid).toBe(true);
    });
    
    it('rejects invalid transitions', () => {
      const result = validateRoleTransition('facilitator', 'co-host', 'participant');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });
    
    it('protects host role', () => {
      const result = validateRoleTransition('co-host', 'host', 'participant');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('Role Configuration', () => {
    it('returns correct config for each role', () => {
      const hostConfig = getRoleConfig('host');
      expect(hostConfig.level).toBe(100);
      expect(hostConfig.canAssign.length).toBeGreaterThan(0);
      
      const participantConfig = getRoleConfig('participant');
      expect(participantConfig.level).toBe(10);
      expect(participantConfig.canAssign.length).toBe(0);
    });
  });
});
```

---

## Visual Testing Checklist

### UI Elements to Verify

#### Control Bar
- [ ] Screen share button visible only for presenters+
- [ ] Role management button visible only for assigners
- [ ] Raise hand button visible only for non-managers
- [ ] Permission tooltips show on disabled buttons

#### Settings Modal
- [ ] Host tab only visible to managers
- [ ] Lock meeting control only for co-host+
- [ ] Recording control only for co-host+
- [ ] Role info displayed correctly

#### Role Management Dialog
- [ ] Shows current user's role prominently
- [ ] Lists assignable roles correctly
- [ ] Disables unassignable options
- [ ] Updates real-time on role change

#### Permission Tooltips
- [ ] Show on hover for disabled features
- [ ] Display current role
- [ ] Display required role
- [ ] Clear actionable message

---

## Browser Testing

### Browsers to Test
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Testing
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile responsiveness
- ✅ Touch interactions

---

## Security Testing

### Security Test 1: API Bypass Attempt

```bash
# Try to assign role without authentication
curl -X PUT http://localhost:3000/api/workshops/1/participants/2/role \
  -H "Content-Type: application/json" \
  -d '{"role": "host"}'

# Expected: 401 Unauthorized
```

### Security Test 2: Permission Escalation

```bash
# As participant, try to assign host via direct API call
curl -X PUT http://localhost:3000/api/workshops/1/participants/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PARTICIPANT_TOKEN" \
  -d '{"role": "host"}'

# Expected: 403 Forbidden with detailed error
```

### Security Test 3: Cross-Workshop Permission

```bash
# Try to change role in different workshop
curl -X PUT http://localhost:3000/api/workshops/99/participants/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"role": "facilitator"}'

# Expected: 403 Forbidden - Not in workshop
```

---

## Debugging Tools

### Enable Permission Debugger

In development mode, the Permission Debugger button appears in the header:

1. Click the Bug icon
2. Select any role to inspect
3. View all permissions
4. Compare two roles
5. See full permission matrix

### Console Debugging

```typescript
// Log all permissions for a role
import { getRoleConfig } from '@/lib/workshop-roles-config';

const config = getRoleConfig('facilitator');
console.table(config.permissions);

// Log role hierarchy
import { getAllRolesSorted } from '@/lib/workshop-roles-config';

const roles = getAllRolesSorted();
console.table(roles.map(r => ({ 
  role: r.displayName, 
  level: r.level,
  permissions: r.permissions.length 
})));

// Test permission check
import { hasPermission } from '@/lib/workshop-roles-config';

console.log('Moderator can share screen:', 
  hasPermission('moderator', 'screen', 'share')
);
```

---

## Regression Testing

After any changes to the permission system, run through:

1. ✅ All 6 role scenarios above
2. ✅ API security tests
3. ✅ UI rendering tests
4. ✅ Permission boundary tests
5. ✅ Role transition validation

---

## Test Data Setup

### Create Test Users

```sql
-- User 1: Host
INSERT INTO user (id, name, email) VALUES ('user1', 'Alice Host', 'alice@test.com');

-- User 2: Co-Host
INSERT INTO user (id, name, email) VALUES ('user2', 'Bob CoHost', 'bob@test.com');

-- User 3: Facilitator
INSERT INTO user (id, name, email) VALUES ('user3', 'Carol Facilitator', 'carol@test.com');

-- User 4: Moderator
INSERT INTO user (id, name, email) VALUES ('user4', 'Dave Moderator', 'dave@test.com');

-- User 5: Presenter
INSERT INTO user (id, name, email) VALUES ('user5', 'Eve Presenter', 'eve@test.com');

-- User 6: Participant
INSERT INTO user (id, name, email) VALUES ('user6', 'Frank Participant', 'frank@test.com');
```

### Create Test Workshop

```sql
INSERT INTO workshops (title, description, host_user_id, start_time, end_time, status)
VALUES (
  'RBAC Test Workshop',
  'Testing role-based access control',
  'user1',
  datetime('now'),
  datetime('now', '+2 hours'),
  'live'
);
```

---

## Success Criteria

### All Tests Pass When:

✅ **Permissions**
- Each role has correct permission set
- Permission checks are fast (< 1ms)
- Validation prevents unauthorized actions

✅ **UI/UX**
- Controls only visible when permitted
- Disabled features show helpful tooltips
- Role badges display correctly
- Real-time updates on role changes

✅ **API Security**
- All endpoints validate permissions
- Clear error messages returned
- No permission bypass possible
- Audit trail maintained

✅ **User Experience**
- Role changes are instant
- UI updates without page reload
- Clear feedback on permission errors
- Help text guides users

---

## Maintenance

### Regular Checks

**Weekly:**
- Review permission audit logs
- Check for unauthorized access attempts
- Verify all roles functioning correctly

**Monthly:**
- Review and update role descriptions
- Evaluate new permission requests
- Update documentation

**Quarterly:**
- Full security audit
- Performance optimization review
- User feedback integration

---

## Support

For issues or questions:
- 📖 Full documentation: `WORKSHOP_RBAC_IMPLEMENTATION.md`
- 🚀 Quick start: `WORKSHOP_RBAC_QUICK_START.md`
- 🔧 Configuration: `src/lib/workshop-roles-config.ts`

---

**Happy Testing! 🎉**
