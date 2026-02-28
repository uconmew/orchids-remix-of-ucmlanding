# 🔐 Staff Login Portal - Complete Guide

## ✅ What Was Created

A **secure staff-only login portal** with industry-standard password encryption and role-based access control (RBAC) for UCon Ministries administration.

---

## 🎯 Key Features

### **1. Dedicated Staff Login Page** (`/staff-login`)
- **Separate from public login** - Clear distinction between staff and community members
- **Beautiful UI** - Gradient design matching ministry branding (Purple #A92FFA & Orange #F28C28)
- **Security indicators** - Visual badges and notices about encryption and security measures

### **2. Password Encryption** 🔒
- **Bcrypt encryption** - Industry-standard password hashing automatically handled by better-auth
- **No plaintext storage** - Passwords are NEVER stored in plain text
- **Secure authentication** - All password verification happens server-side with encrypted comparison

### **3. Role-Based Access Control (RBAC)**
- **Staff verification** - Checks if user has assigned staff roles before granting access
- **Automatic redirection** - Non-staff users are redirected with error message
- **Session management** - Secure bearer token authentication

### **4. Admin Dashboard Protection**
- **Authorization checks** - Verifies staff role before rendering dashboard
- **Loading states** - Shows verification progress
- **Graceful errors** - Clear error messages for unauthorized access

### **5. Navigation Integration**
- **Staff login button** - Accessible from main navigation
- **Staff dashboard link** - Available in user menu after login
- **Mobile responsive** - Works on all devices

---

## 🚀 How to Use

### **For Administrators:**

#### **Step 1: Create a Staff Account**
```bash
# User must first register a regular account at /register
# Then assign them a staff role using the admin dashboard
```

#### **Step 2: Assign Staff Role**
1. Go to `/admin/staff`
2. Click "Assign Staff Role"
3. Enter the user's ID
4. Select a role (Staff Members, Ministry Coordinators, etc.)
5. Choose an employment title (Workshop Facilitator, Case Manager, etc.)
6. Click "Assign Role"

#### **Step 3: Staff Can Now Login**
1. Navigate to `/staff-login`
2. Enter email and password
3. System verifies credentials AND staff role
4. Redirects to `/admin` dashboard if authorized

---

### **For Staff Members:**

#### **Login Process:**
1. Visit `https://yoursite.com/staff-login`
2. Enter your staff email
3. Enter your password (encrypted automatically)
4. Check "Keep me signed in" if desired
5. Click "Access Staff Portal"

#### **What Happens During Login:**
```
1. Email & password validated (bcrypt encryption)
2. Session token generated
3. Staff role verification
4. Bearer token stored in localStorage
5. Redirect to admin dashboard
```

#### **If Login Fails:**
- ❌ **Invalid credentials** → "Invalid email or password" message
- ❌ **No staff role** → "Access denied. You do not have staff privileges"
- ❌ **System error** → "An error occurred during login"

---

## 🔐 Security Features

### **Password Encryption Details**

#### **How It Works:**
```javascript
// User Registration (handled by better-auth):
1. User enters password: "MySecurePass123"
2. Better-auth hashes with bcrypt: "$2a$10$..."
3. Only hash stored in database
4. Original password never stored

// User Login:
1. User enters password: "MySecurePass123"
2. Better-auth retrieves hash from database
3. Compares entered password to hash
4. Grants access only if match
```

#### **Security Specifications:**
- ✅ **Algorithm**: Bcrypt (industry standard)
- ✅ **Salt rounds**: 10 (configurable in better-auth)
- ✅ **One-way encryption**: Cannot be decrypted
- ✅ **Rainbow table resistant**: Each password gets unique salt
- ✅ **Timing attack resistant**: Constant-time comparison

### **Role-Based Access Control (RBAC)**

#### **Authorization Flow:**
```
User Login → Session Created → Role Check → Access Granted/Denied
                                    ↓
                            /api/user-roles?userId=X
                                    ↓
                    Check if user has staff roles assigned
                                    ↓
                    ✅ Has roles → Allow access to /admin
                    ❌ No roles → Redirect to home
```

#### **Protected Routes:**
- `/admin/*` - All admin pages require staff role
- Authorization checked on:
  - Page load
  - API requests
  - Navigation

---

## 📋 API Endpoints Used

### **1. Authentication** (handled by better-auth)
```
POST /api/auth/sign-in/email
Body: { email, password, rememberMe }
Response: { user, session }
```

### **2. Role Verification**
```
GET /api/user-roles?userId={userId}
Headers: { Authorization: Bearer {token} }
Response: [{ roleId, roleName, staffTitle, ... }]
```

### **3. Role Assignment** (for admins)
```
POST /api/user-roles
Body: { userId, roleId, assignedBy }
Response: { id, userId, roleId, roleName, ... }
```

---

## 🎨 UI Components

### **Staff Login Page Features:**
- 🔒 **Security badge** - Shield icon with gradient colors
- 📝 **Form fields** - Email and password with proper validation
- ☑️ **Remember me** - Optional persistent session
- 🛡️ **Security notice** - Lists all security features
- 🔗 **Alternative links** - Regular login and contact admin
- 📱 **Responsive design** - Works on mobile and desktop

### **Visual Elements:**
```tsx
- Gradient background: from-[#A92FFA]/5 to-[#F28C28]/5
- Shield icon: 16x16 rounded gradient badge
- Lock icons: On email and password fields
- Security notice: Purple-tinted info box
- Loading state: Animated spinner during auth
```

---

## 🛠️ Configuration

### **Customize Authentication Settings:**

Edit `src/lib/auth.ts`:
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {    
    enabled: true,
    // Customize password requirements:
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  // Add more providers:
  plugins: [bearer()]
});
```

### **Customize Staff Titles:**

Edit `src/app/admin/staff/page.tsx`:
```typescript
const staffTitles = [
  "Workshop Facilitator",
  "Case Manager",
  "Outreach Coordinator",
  // Add more titles here
];
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. "Access denied" after successful login**
**Cause:** User doesn't have a staff role assigned  
**Solution:** Administrator must assign a role via `/admin/staff`

#### **2. "Invalid email or password"**
**Cause:** Wrong credentials or account doesn't exist  
**Solution:** 
- Verify email is correct
- Reset password (if feature enabled)
- Register account first at `/register`

#### **3. Redirects to home instead of admin**
**Cause:** Role verification failed  
**Solution:** Check that:
- User has an assigned role in database
- `/api/user-roles` endpoint is working
- Bearer token is properly stored

#### **4. "Authorization check failed"**
**Cause:** API endpoint error or network issue  
**Solution:**
- Check browser console for errors
- Verify API routes are deployed
- Check database connection

---

## 📊 Database Schema

### **User Table** (better-auth)
```sql
user
├── id (text, primary key)
├── name (text)
├── email (text, unique)
├── emailVerified (boolean)
└── ...
```

### **Account Table** (passwords stored here)
```sql
account
├── id (text, primary key)
├── userId (text, foreign key)
├── password (text) -- BCRYPT HASHED
└── ...
```

### **User Roles Table** (RBAC)
```sql
user_roles
├── id (integer, primary key)
├── userId (text, foreign key)
├── roleId (integer, foreign key)
├── staffTitle (text)
├── assignedAt (text)
└── assignedBy (text)
```

---

## ✅ Security Checklist

Before going to production, ensure:

- ✅ **HTTPS enabled** - SSL certificate installed
- ✅ **Environment variables secure** - Never commit secrets
- ✅ **Database backups** - Regular automated backups
- ✅ **Rate limiting** - Prevent brute force attacks
- ✅ **Session timeout** - Configure appropriate expiry
- ✅ **Audit logging** - Track admin actions
- ✅ **Two-factor auth** - Consider enabling 2FA (optional)

---

## 🎓 Best Practices

### **For Administrators:**
1. **Assign roles carefully** - Only grant staff access to trusted individuals
2. **Review access regularly** - Audit staff roles quarterly
3. **Use strong passwords** - Require 12+ characters with complexity
4. **Revoke access promptly** - Remove roles when staff leave
5. **Monitor activity** - Check dashboard for suspicious actions

### **For Staff Members:**
1. **Never share credentials** - Each staff member needs own account
2. **Use unique passwords** - Don't reuse passwords from other sites
3. **Log out when done** - Especially on shared computers
4. **Report suspicious activity** - Contact admin immediately
5. **Keep credentials secure** - Use password manager

---

## 📞 Support

### **Need Help?**

- **Technical issues**: Contact your system administrator
- **Account access**: Use "Contact administrator" link on login page
- **Role assignment**: Request via `/contact` page
- **Bug reports**: Submit to development team

### **Quick Links:**
- Staff Login: `/staff-login`
- Admin Dashboard: `/admin`
- Staff Management: `/admin/staff`
- Roles & Permissions: `/admin/roles`

---

## 🎉 Summary

**You now have a complete staff login portal with:**

✅ Dedicated staff login page (`/staff-login`)  
✅ Bcrypt password encryption (automatic)  
✅ Role-based access control (RBAC)  
✅ Protected admin dashboard  
✅ Secure session management  
✅ Beautiful, branded UI  
✅ Mobile responsive design  
✅ Complete error handling  
✅ Navigation integration  
✅ Documentation & security guide  

**Your ministry's internal operations are now secure and professionally managed!** 🎊
