# Staff Profile Sync System

## Overview
Staff members added through the Admin panel now automatically appear on both the **Homepage** and **About page** with full profile support including bio, expertise, and LinkedIn links.

## How It Works

### 1. **Database Schema** (`src/db/schema.ts`)
Added profile fields to the `user` table:
- `bio` (TEXT) - Staff member's biography
- `expertise` (TEXT, JSON array) - List of expertise areas
- `linkedin` (TEXT) - LinkedIn profile URL

### 2. **API Endpoint** (`src/app/api/staff/route.ts`)
- **GET /api/staff** - Fetches all staff members from the database
- Returns formatted staff profiles with:
  - Name, role (staffTitle), bio, expertise, image
  - Email, LinkedIn, phone, registration number
  - Department categorization (leadership, ministry, outreach, worship)

### 3. **Homepage Integration** (`src/app/page.tsx`)
- Fetches staff dynamically from `/api/staff` on mount
- Falls back to static defaults if API fails
- Maps API response to homepage staff card format
- Used in the animated "Meet Our Leadership" section

### 4. **About Page Integration** (`src/components/about/AboutPage.tsx`)
- Already implemented! Fetches from `/api/staff` and merges with static profiles
- Organizes staff by department (leadership, ministry, outreach, worship)
- Shows full profiles with bio, expertise badges, and contact info

## Adding New Staff

### Through Admin Panel (`/admin/staff`)
1. Go to **Admin Dashboard → Staff Management**
2. Click **"Add Staff Member"**
3. Fill in required fields:
   - Name, email, phone
   - Role (from roles table)
   - Staff Title (e.g., "Executive Director", "Outreach Coordinator")
   - Clearance levels
4. **Optional profile fields** (to add via database update):
   - Bio - Rich text biography
   - Expertise - JSON array of skills/areas (e.g., `["Clinical Psychology", "Trauma-Informed Care"]`)
   - LinkedIn - Profile URL

### Staff Appears Automatically On:
- ✅ **Homepage** - "Meet Our Leadership" section
- ✅ **About Page** - Organized by department
- ✅ **Admin Staff Directory** - Management interface

## Updating Staff Profiles

### Method 1: Admin Panel (Basic Info)
- Update staff title, clearance levels, contact info
- Changes reflect immediately on all pages

### Method 2: Database Update (Rich Profiles)
For bio, expertise, LinkedIn - update the `user` table directly:

```sql
UPDATE user 
SET 
  bio = 'Your detailed biography here...',
  expertise = '["Expertise 1", "Expertise 2", "Expertise 3"]',
  linkedin = 'https://linkedin.com/in/username'
WHERE email = 'staff@uconministries.org';
```

### Method 3: Future Enhancement
Add bio/expertise/LinkedIn fields to the Admin Staff Management UI for direct editing.

## Department Categorization
Staff are automatically categorized based on their title keywords:

### **Leadership**
- executive, director, founder, ceo, president, hr manager, hiring

### **Outreach** 
- outreach, advocacy, ambassador, transportation, logistics

### **Worship**
- worship, music, creative, arts, prayer

### **Ministry** (default)
- All other roles fall into ministry/programs

## Benefits

1. **Single Source of Truth** - All staff info in one database
2. **Automatic Sync** - Changes in admin panel appear everywhere
3. **No Code Changes** - Add/remove staff without touching code
4. **Rich Profiles** - Full bios, expertise, professional links
5. **Scalable** - Supports unlimited staff members
6. **Organized** - Auto-categorized by department

## Technical Details

### Static Fallbacks
Both pages maintain static staff arrays as fallbacks:
- If API fails, shows default staff
- Ensures page always displays content
- Provides smooth UX during load

### Performance
- Fetched once on page mount
- Cached in component state
- No polling or real-time updates needed

### Data Flow
```
Admin Panel → Database (user + userRoles tables)
                    ↓
            GET /api/staff
                    ↓
     ┌──────────────┴───────────────┐
     ↓                              ↓
Homepage (teamMembers)    About Page (staffByDepartment)
```

## Future Enhancements

### Phase 1 (Completed ✅)
- [x] Add bio/expertise/linkedin to schema
- [x] Update API endpoint to return rich profiles
- [x] Sync homepage to fetch dynamically
- [x] About page already synced

### Phase 2 (Planned)
- [ ] Add bio/expertise editor to Admin UI
- [ ] Upload custom profile photos
- [ ] Social media links (Twitter, Instagram)
- [ ] Staff achievements/certifications
- [ ] Video introductions

### Phase 3 (Future)
- [ ] Public staff directory page
- [ ] Staff blog/articles
- [ ] Calendar of staff events
- [ ] Contact form per staff member

## Testing

### Verify Staff Sync:
1. Add a new staff member in `/admin/staff`
2. Visit homepage - should see new staff in "Meet Our Leadership"
3. Visit `/about` - should see in appropriate department section
4. Update staff title - should reflect on all pages

### Update Rich Profile:
1. Update user's bio/expertise/linkedin in database
2. Refresh homepage/about page
3. Verify new info displays correctly
4. Check expertise badges render properly

## Questions?
Contact the development team or check:
- Admin Dashboard: `/admin/staff`
- API Docs: Review `/api/staff/route.ts`
- Schema: `src/db/schema.ts`
