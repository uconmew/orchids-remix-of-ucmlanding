# 🚀 Admin Setup Quick Start

## Create Your First Admin User (2 Methods)

### Method 1: Using the Script (Recommended)

1. **Edit the script** with your admin details:
```bash
# Open scripts/create-admin.ts and change these values:
email: 'admin@uconministries.org'
name: 'Your Name'
password: 'YourSecurePassword123!'
staffTitle: 'Founding Visionary Lead'
```

2. **Run the script**:
```bash
bun run scripts/create-admin.ts
```

3. **Login**:
- Visit: http://localhost:3000/staff-login
- Use the credentials from the script output
- Access admin dashboard at /admin

### Method 2: Using cURL

```bash
curl -X POST http://localhost:3000/api/admin/create-admin-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uconministries.org",
    "name": "Your Name",
    "password": "YourSecurePassword123!",
    "staffTitle": "Founding Visionary Lead"
  }'
```

---

## Reset Staff Password

### Option 1: Use the UI (Easiest)

1. Visit: http://localhost:3000/staff-login/reset-password
2. Enter staff member's email
3. Copy the temporary password
4. Share it securely with the staff member

### Option 2: Use API

```bash
curl -X POST http://localhost:3000/api/staff/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@uconministries.org"}'
```

---

## What You Get

### Admin User Features
✅ **Full Level 1 Access** (35 permissions)
- All members management
- All workshops management  
- All outreach coordination
- All volunteer management
- All events management
- All content management
- All prayer wall management
- **All system administration** (roles, permissions, analytics, settings)

### Password Reset Features
✅ Secure temporary password generation
✅ Automatic password change requirement
✅ Beautiful UI with copy-to-clipboard
✅ Staff role verification
✅ Bcrypt encryption

---

## Staff Login Flow

1. **New Staff Member Setup:**
   - Admin creates staff account and assigns role
   - Admin resets password at `/staff-login/reset-password`
   - Staff receives temporary password
   - Staff logs in at `/staff-login`
   - System redirects to `/change-password`
   - Staff sets permanent password
   - Access granted to admin dashboard

2. **Forgot Password:**
   - Staff clicks "Forgot password?" on login page
   - Admin processes reset request
   - Staff receives temporary password
   - Staff logs in and changes password

---

## Security Notes

🔒 **All passwords are encrypted with bcrypt**
🔒 **Temporary passwords must be changed on first login**
🔒 **Staff roles are verified before password reset**
🔒 **Admin users can login immediately (no forced password change)**

---

## Troubleshooting

**"Executive Leadership role not found"**
- Run database seeds: `bun run db:seed`

**"User already exists"**
- Email is already registered
- Use a different email or reset existing user's password

**"User is not a staff member"**
- User doesn't have a staff role assigned
- Assign a role via `/admin/staff` first

**Cannot access admin dashboard**
- Verify user has a staff role assigned
- Check `/api/user-roles?userId=YOUR_USER_ID`

---

## Complete Documentation

For full details, see: `ADMIN_USER_CREATION_GUIDE.md`

---

**🎉 You're all set! Create your admin user and start managing UCon Ministries!**
