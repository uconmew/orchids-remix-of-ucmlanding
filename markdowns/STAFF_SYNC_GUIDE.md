# Staff Synchronization Between Admin Panel and About Page

## Overview

The staff management system now automatically syncs between the Admin Staff Management panel and the public-facing About page. When you add new staff members through the admin panel, they will automatically appear on the About page organized by department.

## How It Works

### 1. **Admin Panel: Adding Staff** (`/admin/staff`)

When you add a new staff member through the admin panel at `/admin/staff`, you provide:
- Name, email, phone
- Role (from predefined roles)
- **Staff Title** (e.g., "Executive Director", "Outreach Coordinator", "Worship Director")
- Clearance levels

### 2. **Database Storage**

Staff information is stored in the `user_roles` table with:
```sql
- userId (reference to user table)
- roleId (reference to roles table)
- staffTitle (nullable text field - KEY FIELD)
- permissionClearance
- dutyClearance
- assignedAt
```

### 3. **API Endpoint: `/api/staff`**

A dedicated API endpoint fetches all staff members who have a staff title:
- Queries the database for user_roles where staffTitle IS NOT NULL
- Joins with user table to get name, email, phone, image
- Joins with roles table to get role information
- Automatically categorizes staff into departments based on their title

### 4. **Department Categorization**

Staff are automatically assigned to departments based on keywords in their staff title:

**Leadership:**
- executive, director, founder, ceo, president, hr manager, hiring

**Outreach:**
- outreach, advocacy, ambassador, transportation, logistics

**Worship:**
- worship, music, creative, arts, prayer

**Ministry (default):**
- All other titles

### 5. **About Page Display**

The About page (`/about`) automatically:
1. Fetches live staff from `/api/staff` on page load
2. Merges them with existing hardcoded staff profiles
3. Displays staff organized by department sections
4. Prevents duplicates (checks by name)

## Adding New Staff Members

### Step 1: Access Admin Panel
1. Log in to the admin portal
2. Navigate to `/admin/staff`
3. Ensure you have sufficient clearance (Level 75+ required)

### Step 2: Add Staff Member
1. Click "Add Staff Member"
2. Choose "Create New Staff" or "Assign to Existing User"
3. Fill in all required fields
4. **IMPORTANT:** Select a Staff Title from the dropdown
5. Set initial clearance levels
6. Click "Create Staff" or "Assign Role"

### Step 3: Automatic Sync
- The new staff member is immediately added to the database
- The About page will show them on next page load/refresh
- They are automatically placed in the correct department section

## Staff Titles Available

The system includes these predefined staff titles:
- Executive Director
- HR Manager
- Hiring Manager
- Workshop Facilitator
- Case Manager
- Outreach Coordinator
- Program Director
- Program Assistant
- Administrative Support
- Community Liaison
- Peer Counselor
- Volunteer Coordinator
- Communications Specialist
- Financial Coordinator

## Technical Details

### API Response Format
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "role": "Executive Director",
    "bio": "John Doe serves as Executive Director at Ucon Ministries.",
    "expertise": ["Leadership"],
    "image": "https://...",
    "email": "john@uconministries.org",
    "phone": "720.663.9243",
    "registrationNumber": "UCM-2025-00001",
    "department": "leadership"
  }
]
```

### About Page Implementation

```typescript
// Fetches live staff and merges with static profiles
useEffect(() => {
  const fetchLiveStaff = async () => {
    const response = await fetch('/api/staff');
    const liveStaff = await response.json();
    
    // Merges with existing staff, avoiding duplicates
    const merged = mergeDepartments(staticStaff, liveStaff);
    setStaffByDepartment(merged);
  };
  
  fetchLiveStaff();
}, []);
```

## Benefits

1. **No Manual Updates:** About page updates automatically when staff are added/removed
2. **Single Source of Truth:** Database is the authoritative source
3. **Consistency:** Staff information stays synchronized across admin and public views
4. **Flexibility:** New staff can be added without code changes
5. **Department Organization:** Automatic categorization keeps the About page organized

## Troubleshooting

### Staff Not Appearing on About Page

1. **Check Staff Title:** Ensure the staff member has a staff title assigned (not null or empty)
2. **Refresh Page:** The About page fetches staff on load, so refresh to see changes
3. **Check Console:** Open browser dev tools and check console for errors
4. **Verify Database:** Check that the staff member exists in user_roles table with a valid staffTitle

### Staff in Wrong Department

The department is determined by keywords in the staff title. To change:
1. Edit the staff title in admin panel to include appropriate keywords
2. Or modify the `categorizeDepartment()` function in `/api/staff/route.ts`

### Duplicate Staff Members

The system prevents duplicates by checking names (case-insensitive). If you see duplicates:
1. One is likely hardcoded in `staticStaffByDepartment`
2. Remove the hardcoded version if the person exists in the database
3. Or rename one to avoid exact name matches

## Future Enhancements

Potential improvements:
- Add bio/description field to user_roles table for custom bios
- Add profile image upload capability
- Add expertise/specialties array field
- Add social media links (LinkedIn, etc.)
- Add "Featured Staff" flag for homepage display
- Add staff ordering/priority for department displays

## Files Involved

- **API Route:** `src/app/api/staff/route.ts`
- **About Page Component:** `src/components/about/AboutPage.tsx`
- **Admin Staff Panel:** `src/app/admin/staff/page.tsx`
- **Database Schema:** `src/db/schema.ts` (userRoles table)
- **Database Connection:** `src/db/index.ts`

## Summary

The staff synchronization system creates a seamless connection between the admin panel and the public-facing About page. Simply add staff members through the admin interface with appropriate staff titles, and they will automatically appear on the About page in the correct department section. No code changes or manual updates required!
