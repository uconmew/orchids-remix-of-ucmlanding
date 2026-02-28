# 🔐 Admin User Creation & Automated Password Reset Guide

## Overview

This guide covers two critical features for UCon Ministries staff management:
1. **Creating a new admin user with full access** (Executive Leadership role)
2. **Automated password reset system** for staff login

---

## 🎯 Feature 1: Create Admin User with Full Access

### API Endpoint

**POST** `/api/admin/create-admin-user`

Creates a new user with **Executive Leadership role (Level 1)** - the highest level with all 35 permissions including system administration.

### Request Format

```bash
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uconministries.org",
    "name": "Administrator Name",
    "password": "SecurePassword123!",
    "staffTitle": "Founding Visionary Lead"
  }'
```

### Request Body

```typescript
{
  email: string;       // Required - Must be unique and valid email format
  name: string;        // Required - Full name of the admin user
  password: string;    // Required - Min 8 characters (will be bcrypt encrypted)
  staffTitle?: string; // Optional - Defaults to "Founding Visionary Lead"
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Admin user created successfully with full access",
  "user": {
    "id": "user_1234567890_abc123",
    "name": "Administrator Name",
    "email": "admin@uconministries.org",
    "role": "Executive Leadership",
    "roleLevel": 1,
    "staffTitle": "Founding Visionary Lead"
  },
  "credentials": {
    "email": "admin@uconministries.org",
    "note": "Please save these credentials securely. The password cannot be retrieved later."
  }
}
```

### Response (Error)

```json
{
  "error": "User with this email already exists"
}
```

### What This Creates

1. **User Account** in `user` table
2. **Encrypted Password** in `account` table (bcrypt hashed)
3. **Role Assignment** with Executive Leadership (Level 1)
4. **Staff Title** (e.g., "Founding Visionary Lead")
5. **requiresPasswordChange = false** (admin can login immediately)

### Admin User Permissions (Level 1)

✅ **All 35 Permissions Including:**

**Members Management:**
- members:read, members:create, members:update, members:delete, members:export

**Workshop Management:**
- workshops:read, workshops:create, workshops:update, workshops:delete
- workshops:manage_participants, workshops:host

**Outreach Coordination:**
- outreach:read, outreach:create, outreach:update, outreach:coordinate

**Volunteer Management:**
- volunteers:read, volunteers:review, volunteers:approve, volunteers:assign

**Events Management:**
- events:read, events:create, events:update, events:delete, events:manage_registrations

**Content Management:**
- content:read, content:create, content:publish, content:delete

**Prayer Wall:**
- prayers:read, prayers:moderate, prayers:reply

**System Administration:**
- system:manage_roles ⭐
- system:manage_permissions ⭐
- system:view_analytics
- system:manage_settings

---

## 🔄 Feature 2: Automated Password Reset for Staff

### Overview

Automated password reset system that generates secure temporary passwords and enforces password change on first login.

### Password Reset Page

**URL:** `/staff-login/reset-password`

A dedicated page for authorized personnel to reset staff passwords with a beautiful UI.

### Features

✅ **Secure temporary password generation** (12 characters + complexity)  
✅ **Automatic requiresPasswordChange flag** (forces password change on login)  
✅ **Copy to clipboard functionality**  
✅ **Staff role verification** (only resets staff accounts)  
✅ **Beautiful, branded UI**

### API Endpoint

**POST** `/api/staff/reset-password`

Generates a temporary password and sets the account to require password change.

### Request Format

```bash
curl -X POST http://localhost:3000/api/staff/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@uconministries.org"
  }'
```

### Request Body

```typescript
{
  email: string;    // Required - Staff member's email
  adminKey?: string; // Optional - For production security (currently commented out)
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Password reset successfully",
  "user": {
    "name": "Staff Member Name",
    "email": "staff@uconministries.org"
  },
  "temporaryPassword": "Xy7$aB9mK2pL",
  "note": "User must change this password on first login. In production, send this via email."
}
```

### Response (Error)

```json
{
  "error": "User not found"
}
// OR
{
  "error": "User is not a staff member"
}
```

### How It Works

1. **Admin visits** `/staff-login/reset-password`
2. **Enters staff email** address
3. **System validates** staff role exists
4. **Generates secure temporary password** (crypto.randomBytes + complexity)
5. **Updates database:**
   - Hashes password with bcrypt
   - Sets `requiresPasswordChange = true`
6. **Displays temporary password** with copy button
7. **Staff member receives** temporary password (currently manual, will be automated via email)
8. **Staff logs in** with temporary password
9. **System redirects** to `/change-password` page
10. **Staff sets new password** meeting all requirements

### Temporary Password Format

- **Length:** 12 characters minimum
- **Complexity:** Letters, numbers, and special characters
- **Example:** `Xy7$aB9mK2pL`
- **Encryption:** Bcrypt hashed before storage

### Password Change Flow

When staff logs in with temporary password:

1. System detects `requiresPasswordChange = true`
2. Redirects to `/change-password`
3. Staff must enter:
   - Current password (temporary)
   - New password (meets requirements)
   - Confirm new password
4. New password requirements:
   - ✓ At least 8 characters
   - ✓ One uppercase letter (A-Z)
   - ✓ One lowercase letter (a-z)
   - ✓ One number (0-9)
   - ✓ One special character (@$!%*?&)
5. System updates password and sets `requiresPasswordChange = false`
6. Staff can now access the system normally

---

## 📋 Usage Scenarios

### Scenario 1: Create First Admin User

**When:** Initial system setup, no admins exist

```bash
# Create the first admin with full access
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "founder@uconministries.org",
    "name": "Ministry Founder",
    "password": "SecureInitialPass123!",
    "staffTitle": "Founding Visionary Lead"
  }'

# Response will include login credentials
# Founder can immediately login at /staff-login
```

### Scenario 2: Staff Member Forgot Password

**When:** Staff member cannot login, needs password reset

**Steps:**
1. Admin visits `/staff-login/reset-password`
2. Enters staff member's email
3. Copies temporary password
4. Shares password securely with staff member (text, secure messaging, etc.)
5. Staff member logs in at `/staff-login`
6. System redirects to `/change-password`
7. Staff member sets new secure password
8. Staff member can now access system

### Scenario 3: New Staff Onboarding

**When:** Hiring new staff member

**Steps:**
1. Admin creates staff account (using existing admin UI or API)
2. Admin assigns appropriate role (Staff Members, Coordinator, etc.)
3. Admin visits `/staff-login/reset-password`
4. Enters new staff member's email
5. System generates temporary password
6. Admin shares credentials with new staff member
7. New staff logs in and sets their own password
8. New staff completes onboarding

### Scenario 4: Security Incident - Force Password Reset

**When:** Security breach detected, need to reset all staff passwords

**Steps:**
1. Admin has list of all staff emails
2. For each staff member:
   ```bash
   curl -X POST http://localhost:3000/api/staff/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "staff@uconministries.org"}'
   ```
3. Collect all temporary passwords
4. Email each staff member their temporary password
5. All staff forced to change passwords on next login
6. Security restored

---

## 🔒 Security Features

### Password Reset Security

1. **Staff Verification:** Only resets accounts with assigned staff roles
2. **Secure Generation:** Uses crypto.randomBytes for randomness
3. **Bcrypt Encryption:** Temporary passwords encrypted before storage
4. **Forced Change:** Staff must change password immediately
5. **No Password Retrieval:** Cannot retrieve original password
6. **Optional Admin Key:** Can enable admin key requirement in production

### Admin Creation Security

1. **Email Validation:** Prevents invalid email formats
2. **Duplicate Prevention:** Checks if user already exists
3. **Password Encryption:** Bcrypt hashing with 10 salt rounds
4. **Role Verification:** Ensures Executive Leadership role exists
5. **Audit Trail:** Records who assigned the role
6. **Optional Setup Key:** Can enable one-time setup key in production

### Production Security Enhancements

**Uncomment in production files:**

**Admin Creation** (`src/app/api/admin/create-admin-user/route.ts`):
```typescript
// Line 15-18: Uncomment to require setup key
const setupKey = request.headers.get('x-setup-key');
if (setupKey !== process.env.ADMIN_SETUP_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Password Reset** (`src/app/api/staff/reset-password/route.ts`):
```typescript
// Line 23-27: Uncomment to require admin key
if (adminKey !== process.env.STAFF_RESET_KEY) {
  return NextResponse.json(
    { error: 'Unauthorized. Admin key required.' },
    { status: 401 }
  );
}
```

**Environment Variables to Add:**
```bash
ADMIN_SETUP_KEY=your_secure_setup_key_here
STAFF_RESET_KEY=your_admin_reset_key_here
```

---

## 🎨 UI Components

### Password Reset Page Features

✅ **Gradient Background** - Matches ministry branding (Purple #A92FFA & Orange #F28C28)  
✅ **Shield Icon** - Security visualization  
✅ **Email Input** - Staff email validation  
✅ **Copy Button** - One-click password copy  
✅ **Success Display** - Shows temporary password clearly  
✅ **Important Notices** - User guidance and security info  
✅ **Back Navigation** - Returns to staff login  
✅ **Responsive Design** - Works on all devices  

### Staff Login Page Updates

✅ **Forgot Password Link** - Prominent "Forgot password? Reset it here" link  
✅ **Consistent Branding** - Matches existing staff portal design  
✅ **Security Indicators** - Shows encryption and RBAC features  

---

## 📊 Database Changes

### Account Table Field

```sql
account
├── requiresPasswordChange (boolean, default: false)
```

**Usage:**
- `false` - User can login normally (admin users, users who changed password)
- `true` - User must change password before accessing system (after reset)

---

## 🚀 Testing Guide

### Test 1: Create Admin User

```bash
# Test successful admin creation
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@uconministries.org",
    "name": "Test Administrator",
    "password": "TestPass123!",
    "staffTitle": "Test Executive"
  }'

# Expected: Success response with user details

# Test duplicate email
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@uconministries.org",
    "name": "Another Admin",
    "password": "TestPass123!"
  }'

# Expected: Error "User with this email already exists"

# Test login
# Visit /staff-login
# Login with test.admin@uconministries.org / TestPass123!
# Should access /admin dashboard immediately
```

### Test 2: Password Reset Flow

```bash
# First, create a staff member (using existing admin UI or API)
# Then test password reset

# Reset password
curl -X POST http://localhost:3000/api/staff/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff.member@uconministries.org"
  }'

# Expected: Success with temporary password

# Test login with temporary password
# Visit /staff-login
# Login with temporary password
# Should redirect to /change-password
# Set new password meeting requirements
# Should login successfully with new password
```

### Test 3: Security Validations

```bash
# Test reset for non-existent user
curl -X POST http://localhost:3000/api/staff/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@test.com"}'

# Expected: Error "User not found"

# Test reset for non-staff user
# (Create regular user without staff role first)
curl -X POST http://localhost:3000/api/staff/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "regular.user@test.com"}'

# Expected: Error "User is not a staff member"

# Test admin creation with weak password
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@test.com",
    "name": "Weak Password",
    "password": "short"
  }'

# Expected: Error "Password must be at least 8 characters long"
```

---

## 📝 Best Practices

### For Administrators

1. **Secure Admin Creation:**
   - Use strong initial password (12+ characters)
   - Store credentials securely (password manager)
   - Change password after first login
   - Enable setup key in production

2. **Password Reset Procedures:**
   - Verify staff identity before resetting
   - Share temporary passwords securely (not via public channels)
   - Document password resets in security log
   - Use time-sensitive sharing (e.g., expiring links in production)

3. **Staff Onboarding:**
   - Create account with appropriate role first
   - Generate temporary password
   - Share via secure channel (encrypted email, secure messaging)
   - Verify staff completed password change
   - Document completion

4. **Security Audits:**
   - Regular review of staff access
   - Remove access for departed staff promptly
   - Periodic forced password resets (quarterly)
   - Monitor failed login attempts

### For Staff Members

1. **Password Management:**
   - Change temporary password immediately
   - Use unique, strong passwords
   - Never share passwords
   - Use password manager

2. **Security Awareness:**
   - Report suspicious activity
   - Log out from shared computers
   - Don't save passwords in browsers
   - Report lost access immediately

---

## 🔄 Future Enhancements

### Production Email Integration

Replace manual password sharing with automated emails:

```typescript
// In src/app/api/staff/reset-password/route.ts
// After generating temporary password:

import { sendPasswordResetEmail } from '@/lib/email';

await sendPasswordResetEmail({
  to: email,
  userName: existingUser[0].name,
  temporaryPassword: tempPassword,
  resetUrl: `${process.env.NEXT_PUBLIC_URL}/staff-login`,
});

// Don't return password in response in production
return NextResponse.json({
  success: true,
  message: 'Password reset email sent successfully',
  user: {
    name: existingUser[0].name,
    email: existingUser[0].email,
  }
});
```

### Two-Factor Authentication

Add 2FA for enhanced security:
- SMS verification
- Authenticator app (TOTP)
- Email verification codes

### Password Reset Expiry

Make temporary passwords expire after 24 hours:
```typescript
{
  temporaryPasswordExpiry: Date.now() + (24 * 60 * 60 * 1000),
}
```

### Audit Logging

Track all security events:
- Admin user creations
- Password resets
- Login attempts (success/failure)
- Role assignments
- Permission changes

---

## ✅ Summary

You now have a complete admin management system with:

✅ **Admin User Creation**
- API endpoint for creating Executive Leadership users
- Full Level 1 permissions (all 35 permissions)
- Secure bcrypt password encryption
- Immediate admin access (no password change required)

✅ **Automated Password Reset**
- Dedicated reset page at `/staff-login/reset-password`
- Secure temporary password generation
- Staff role verification
- Copy-to-clipboard functionality
- Beautiful, branded UI

✅ **Password Change Flow**
- Automatic detection of requiresPasswordChange flag
- Forced password change page with requirements
- Real-time validation
- Secure password updates

✅ **Security Features**
- Bcrypt encryption for all passwords
- Role-based access control
- Staff verification
- Optional admin keys for production
- Audit trail support

✅ **Complete Integration**
- Staff login page with forgot password link
- Change password page with requirement indicators
- Responsive design across all pages
- Consistent ministry branding

---

## 📞 Support

For questions or assistance:
- Technical issues: Contact system administrator
- Account access: Use password reset at `/staff-login/reset-password`
- Security concerns: Report immediately to IT team
- Feature requests: Submit via internal channels

---

**UCon Ministries Staff Management System v1.0**
