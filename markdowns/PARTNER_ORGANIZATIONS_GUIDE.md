# Partner Organizations System Guide

## 🎯 Overview

The Partner Organizations System tracks and displays all ministry partnerships across 6 categories:
- **Faith Partners** - Churches and religious organizations
- **Social Services** - Non-profit service providers
- **Business Partners** - Employers and training providers
- **Healthcare Partners** - Medical and mental health providers
- **Justice Partners** - Legal aid and reentry programs
- **Educational Partners** - Schools and training programs

---

## 📊 Database Schema

### `partnerOrganizations` Table

```typescript
{
  id: integer (primary key, auto-increment)
  name: text (required) - Organization name
  category: text (required) - 'faith', 'social_services', 'business', 'healthcare', 'justice', 'educational'
  description: text (required) - Organization description
  logoUrl: text (optional) - Organization logo image URL
  websiteUrl: text (optional) - Organization website
  contactName: text (optional) - Primary contact person
  contactEmail: text (optional) - Contact email
  contactPhone: text (optional) - Contact phone
  address: text (optional) - Street address
  city: text (optional) - City
  state: text (optional) - State
  zipCode: text (optional) - ZIP code
  partnershipType: text (optional) - 'service_provider', 'employer', 'referral', 'collaborative', 'donor'
  servicesProvided: json (optional) - Array of services provided
  isActive: boolean (default: true) - Whether partnership is currently active
  isFeatured: boolean (default: false) - Whether to feature prominently
  partnershipStartDate: text (optional) - ISO date string
  notes: text (optional) - Internal notes
  createdAt: text (required) - ISO date string
  updatedAt: text (required) - ISO date string
}
```

### Categories
- `faith` - Faith-based organizations
- `social_services` - Social service non-profits
- `business` - Business and employer partners
- `healthcare` - Medical and mental health providers
- `justice` - Legal aid and justice system partners
- `educational` - Educational institutions

### Partnership Types
- `service_provider` - Provides direct services to participants
- `employer` - Offers employment opportunities
- `referral` - Refers clients/participants
- `collaborative` - Joint programming/initiatives
- `donor` - Financial support

---

## 🔌 API Endpoints

### **GET /api/stats**

Returns live statistics including partner organization counts by category.

**Response:**
```json
{
  "partners": {
    "total": 50,
    "faith": 12,
    "socialServices": 8,
    "business": 15,
    "healthcare": 6,
    "justice": 4,
    "educational": 5
  },
  ... other stats
}
```

### **GET /api/partners** (Planned)

Retrieve all partner organizations or filter by category.

**Query Parameters:**
- `category` - Filter by category
- `isActive` - Filter by active status
- `isFeatured` - Show only featured partners

---

## 🎨 Homepage Integration

### Partner Count Display

The homepage **Community & Partners** section displays live partner counts:

```tsx
// State
const [partnerCounts, setPartnerCounts] = useState({
  faith: 12,
  socialServices: 8,
  business: 15,
  healthcare: 6,
  justice: 4,
  educational: 5,
  total: 50
});

// Fetching
useEffect(() => {
  const fetchStats = async () => {
    const response = await fetch('/api/stats');
    const data = await response.json();
    if (data.partners) {
      setPartnerCounts(data.partners);
    }
  };
  fetchStats();
}, []);

// Display
<Badge>{partnerCounts.faith} Religious Partners</Badge>
<Badge>{partnerCounts.business} Employers</Badge>
// ... etc
```

---

## 🌱 Seeding Partner Data

### Initialize Database

Run the seed script to populate initial partner organizations:

```bash
npm run seed:partners
```

This will create sample partners across all 6 categories.

### Seed File Location

`src/db/seeds/init-partners.ts`

---

## ⚙️ Admin Management (Future)

### Planned Features

1. **Admin Dashboard Page** (`/admin/partners`)
   - View all partner organizations
   - Filter by category, status, partnership type
   - Search by name/location

2. **Add/Edit Partner Form**
   - Required: name, category, description
   - Optional: contact info, logo, services
   - Upload logos via Supabase Storage

3. **Partner Detail View**
   - Full organization information
   - Partnership history
   - Services tracking
   - Contact management

4. **Bulk Operations**
   - Export partner list to CSV
   - Import partners from spreadsheet
   - Update multiple partners at once

---

## 📈 Statistics & Reporting

### Live Statistics

Partner counts automatically update on homepage via `/api/stats`:

- **Total Partners**: Sum of all active partners
- **Category Breakdown**: Count per category
- **Active vs Inactive**: Status tracking
- **Featured Partners**: Highlighted partnerships

### Future Reporting

- Partnership growth over time
- Services provided by category
- Geographic distribution map
- Partnership impact metrics

---

## 🔗 Integration Points

### Homepage Sections

1. **Community & Partners Section**
   - Partner category cards with live counts
   - Partner logos displayed in grid
   - Category badges updated in real-time

2. **Impact Stats Section**
   - "15 Partner Organizations" stat card
   - Can be expanded to show category breakdown

3. **Footer** (Optional)
   - Featured partner logos
   - Link to partners page

### Other Pages

- **About Page**: Partnership overview
- **Contact Page**: Partner referral information
- **Services Page**: Services provided by partners

---

## 🚀 Next Steps

### Phase 1: Current (Complete)
✅ Database schema created
✅ Seed file with sample data
✅ API endpoint for statistics
✅ Homepage integration with live counts

### Phase 2: Admin Interface (To Do)
- [ ] Create `/admin/partners` page
- [ ] Add/Edit partner forms
- [ ] Partner detail view
- [ ] Logo upload functionality

### Phase 3: Public Partners Page (To Do)
- [ ] Create `/partners` page
- [ ] Partner directory with filtering
- [ ] Partner detail pages
- [ ] Interactive map of partners

### Phase 4: Advanced Features (To Do)
- [ ] Partnership impact tracking
- [ ] Referral tracking system
- [ ] Service overlap analysis
- [ ] Partnership renewal reminders

---

## 📝 Example Usage

### Adding a New Partner (Code)

```typescript
import { db } from '@/db';
import { partnerOrganizations } from '@/db/schema';

await db.insert(partnerOrganizations).values({
  name: 'New Hope Church',
  category: 'faith',
  description: 'Community church providing volunteers and support',
  contactEmail: 'contact@newhope.org',
  city: 'Denver',
  state: 'CO',
  partnershipType: 'collaborative',
  servicesProvided: ['Volunteers', 'Facility Space'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Querying Partners by Category

```typescript
import { eq } from 'drizzle-orm';

const faithPartners = await db
  .select()
  .from(partnerOrganizations)
  .where(
    and(
      eq(partnerOrganizations.category, 'faith'),
      eq(partnerOrganizations.isActive, true)
    )
  );
```

---

## 🐛 Troubleshooting

### Partner counts not updating on homepage
1. Check `/api/stats` endpoint is returning partner data
2. Verify `partnerOrganizations` table exists in database
3. Check browser console for fetch errors
4. Ensure state update in `useEffect` is working

### Seed script failing
1. Ensure database connection is configured
2. Check if `partnerOrganizations` table already has data
3. Verify all required fields are provided
4. Check for unique constraint violations

### Admin forms not saving
1. Verify API route permissions
2. Check form validation rules
3. Ensure database write permissions
4. Review server logs for errors

---

## 📞 Support

For questions or issues with the partner organizations system:
- Check this guide first
- Review database schema in `src/db/schema.ts`
- Check API implementation in `src/app/api/stats/route.ts`
- Review homepage integration in `src/app/page.tsx`

---

## 🎉 Success!

You now have a fully functional partner organizations system that:
- ✅ Tracks partners across 6 categories
- ✅ Displays live counts on homepage
- ✅ Provides flexible data model for expansion
- ✅ Includes seed data for testing
- ✅ Ready for admin interface development

Next: Build the admin dashboard to manage partners easily!
