# UCon Ministries Admin Dashboard

## 🎯 Overview

A comprehensive administrative dashboard for managing all aspects of UCon Ministries operations, built with Next.js 15, TypeScript, and the complete RBAC system.

## 📍 Access URL

```
http://localhost:3000/admin
```

## 🏗️ Dashboard Structure

### Main Layout (`/admin/layout.tsx`)
- **Fixed Sidebar Navigation** - Always visible on the left
- **Role-Based Navigation** - Shows sections based on user permissions
- **Responsive Design** - Optimized for desktop admin workflows

### Navigation Sections

#### 🎯 Dashboard Home (`/admin`)
- **Real-time Stats Overview**
  - Total Members (dynamically loaded)
  - Active Staff count
  - Active Roles (5 hierarchy levels)
  - Pending Approvals
- **Member Distribution Charts**
  - Workshop Participants
  - Outreach Participants
  - Volunteers
  - Newsletter Subscribers
- **Recent Activity Feed**
- **Quick Action Buttons**

#### 🛡️ RBAC Management

##### Roles & Permissions (`/admin/roles`)
- **View 5-Level Role Hierarchy**
  - Level 1: Executive Leadership (full access)
  - Level 2: Program Directors (strategic oversight)
  - Level 3: Ministry Coordinators (operational management)
  - Level 4: Staff Members (program support with titles)
  - Level 5: Volunteers (read-only access)
- **113 Permissions Across 8 Resources**
  - Members, Workshops, Outreach, Volunteers
  - Events, Content, Prayers, System
- **Visual Permission Matrix** - See which roles have which permissions
- **Resource-Based Tabs** - Organized by resource type

##### Staff Management (`/admin/staff`)
- **Assign Staff Roles** - Link users to roles
- **Set Employment Titles** - 10 predefined titles:
  - Workshop Facilitator
  - Case Manager
  - Outreach Coordinator
  - Program Assistant
  - Administrative Support
  - Community Liaison
  - Peer Counselor
  - Volunteer Coordinator
  - Communications Specialist
  - Financial Coordinator
- **Edit Staff Titles** - Update inline
- **Filter by Role Level** - View staff by hierarchy
- **Search by User ID or Title**
- **View Assignment History** - Track who assigned roles and when

#### 👥 Ministry Operations

##### Members Management (`/admin/members`)
- **30 Pre-Seeded Members** across 5 types:
  - Workshop Participants (EQUIP, AWAKEN, BRIDGE attendees)
  - Outreach Participants (NOURISH, TRANSIT, HAVEN recipients)
  - Ministry Volunteers (FRONTLINE volunteers)
  - Newsletter Subscribers (United Convicts community)
  - Registered Users (active platform members)
- **Add New Members** - Full registration form
- **Member Type Stats** - Visual breakdown by type
- **Search & Filter** - By name, email, or type
- **View Member Details**:
  - Contact information (email, phone)
  - Registration date
  - Interests (financial literacy, job training, etc.)
  - Notes and history
- **Export Member Data** (planned feature)

##### Workshops Management (`/admin/workshops`)
- **Workshop Types**:
  - UCON EQUIP - Educational workshops
  - UCON AWAKEN - Spiritual growth
  - UCON SHEPHERD - Pastoral care
  - UCON BRIDGE - Mentorship programs
- **Track Workshop Status**:
  - Scheduled
  - In Progress
  - Completed
  - Cancelled
- **Manage Capacity** - Monitor registrations vs. capacity
- **View Workshop Details**:
  - Start time and duration
  - Location and facilitator
  - Participant list
  - Materials and resources
- **Create New Workshops** - Full scheduling form

##### Events Management (`/admin/events`)
- **Event Calendar** - Visual timeline view
- **Registration Tracking**:
  - Current registrations vs. capacity
  - Color-coded capacity warnings (90%+ red, 70%+ yellow)
  - View registered participants
- **Event Status Management**:
  - Upcoming
  - Ongoing
  - Completed
  - Cancelled
- **Filter & Search** - By date, status, or location
- **Quick Stats**:
  - Total events
  - Upcoming events
  - Ongoing events
  - Total registrations

##### Prayer Wall Management (`/admin/prayers`)
- **Moderation Dashboard**:
  - Approve/Hide prayer requests
  - Delete inappropriate content
  - Bulk moderation actions
- **8 Prayer Categories**:
  - Healing, Guidance, Thanksgiving
  - Protection, Provision, Relationships
  - Ministry, Other
- **Track Prayer Engagement**:
  - Total prayers offered by community
  - Most prayed-for requests
  - Anonymous vs. public prayers
- **Pending Review Queue** - New prayers awaiting approval
- **Filter by Category or Status**
- **Community Prayer Stats**:
  - Total prayers submitted
  - Approved prayers (public)
  - Pending review
  - Total prayers offered by community

#### ⚙️ System Configuration

##### Settings Management (`/admin/settings`)
- **General Settings**:
  - Ministry name and contact info
  - Physical address
  - Mission statement
- **Database Settings**:
  - Automatic backups (daily at 2 AM)
  - Database encryption
  - Backup schedule configuration
- **Notification Settings**:
  - New member notifications
  - Prayer request alerts
  - Workshop registration notifications
  - Event reminders
- **Email Settings**:
  - SMTP configuration
  - Email templates
  - From address configuration
- **Security Settings**:
  - Two-factor authentication
  - Session timeout (30 min default)
  - IP whitelisting
  - Password policy (8 char minimum)
- **Website Settings**:
  - Maintenance mode toggle
  - Public prayer wall visibility
  - Online registrations enable/disable

## 🔐 Access Control Integration

### How to Use RBAC in Admin Dashboard

#### 1. Check User Permissions (Client-Side)
```typescript
import { checkPermission } from '@/lib/permissions';

// Example: Check if user can update members
const canEditMembers = await checkPermission(
  userId,
  'members',
  'update',
  bearerToken
);

if (!canEditMembers) {
  // Hide edit button or show access denied
  return <AccessDenied />;
}
```

#### 2. Protect Admin Routes (Middleware)
The `middleware.ts` already protects `/admin/*` routes:
```typescript
// Only authenticated users can access admin
if (pathname.startsWith('/admin')) {
  // Check if user has admin role
  const hasAdminRole = await hasAnyRole(userId, [
    'Executive Leadership',
    'Program Directors',
    'Ministry Coordinators'
  ]);
  
  if (!hasAdminRole) {
    return redirectToLogin();
  }
}
```

#### 3. API Route Protection (Server-Side)
```typescript
// In API routes
import { checkPermission } from '@/lib/permissions';

export async function POST(request: Request) {
  const session = await getSession();
  const canCreate = await checkPermission(
    session.userId,
    'members',
    'create',
    session.token
  );
  
  if (!canCreate) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Proceed with creation...
}
```

## 📊 Data Integration

### API Endpoints Used

#### RBAC Endpoints
- `GET /api/roles` - Fetch all roles
- `GET /api/user-roles` - Get user role assignments
- `POST /api/user-roles` - Assign role to user
- `PUT /api/user-roles/[id]/staff-title` - Update staff title
- `GET /api/role-permissions?roleId=X` - Get permissions for role
- `GET /api/role-permissions/check` - Check specific permission

#### Members Endpoints
- `GET /api/members` - List all members
- `GET /api/members/stats` - Member statistics by type
- `POST /api/members` - Create new member
- `PUT /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Delete member

#### Workshops Endpoints
- `GET /api/workshops` - List all workshops
- `POST /api/workshops` - Create workshop
- `GET /api/workshops/[id]` - Workshop details
- `PUT /api/workshops/[id]` - Update workshop
- `GET /api/workshops/[id]/participants` - Get participants

#### Events Endpoints
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Event details
- `PUT /api/events/[id]` - Update event
- `GET /api/event-registrations?eventId=X` - Get registrations

#### Prayers Endpoints
- `GET /api/prayers` - List all prayers
- `POST /api/prayers` - Create prayer
- `PATCH /api/prayers/[id]` - Approve/hide prayer
- `DELETE /api/prayers/[id]` - Delete prayer

## 🎨 Design System

### Color Scheme
- **Primary Purple**: `#A92FFA` - Executive actions, primary CTAs
- **Secondary Orange**: `#F28C28` - Ministry services, highlights
- **Status Colors**:
  - Green: Active/Approved/Ongoing
  - Yellow: Pending/Warning
  - Red: Cancelled/Critical
  - Blue: Scheduled/Upcoming
  - Gray: Completed/Inactive

### Component Library
All components use Shadcn/UI:
- `Card` - Content containers
- `Button` - Actions and CTAs
- `Input` - Form fields
- `Select` - Dropdowns
- `Badge` - Status indicators
- `Dialog` - Modals
- `Tabs` - Content organization
- `Switch` - Toggle settings

## 🚀 Getting Started

### 1. Access the Admin Dashboard
```bash
# Start the dev server
bun run dev

# Navigate to
http://localhost:3000/admin
```

### 2. Initial Setup Checklist
- [ ] Create an admin user account
- [ ] Assign Executive Leadership role
- [ ] Configure SMTP settings for email notifications
- [ ] Set up database backup schedule
- [ ] Review and approve pending prayer requests
- [ ] Test member registration flow
- [ ] Create first workshop/event

### 3. Daily Admin Workflow
1. **Check Dashboard** - Review stats and recent activity
2. **Moderate Prayers** - Approve new prayer requests
3. **Review Members** - Process new registrations
4. **Manage Events** - Monitor upcoming events and capacity
5. **Staff Management** - Assign roles as needed

## 🔧 Customization

### Adding New Admin Pages
1. Create new page in `/admin/your-page/page.tsx`
2. Add navigation link in `/admin/layout.tsx`
3. Add permission check for the new page
4. Create corresponding API routes if needed

### Extending RBAC
1. Add new permissions in database seeder
2. Assign permissions to appropriate roles
3. Update `permissions.ts` helper functions
4. Add permission checks in UI components

### Custom Member Fields
1. Update `members` table schema
2. Add fields to member registration form
3. Update API routes to handle new fields
4. Display new fields in member cards

## 📱 Responsive Design

### Desktop (Primary)
- Full sidebar navigation
- Multi-column layouts
- All features accessible

### Tablet (1024px - 768px)
- Collapsible sidebar
- 2-column layouts
- Touch-optimized buttons

### Mobile (< 768px)
- Hidden sidebar (hamburger menu)
- Single-column layouts
- Stacked cards

## 🔒 Security Features

### Authentication
- Session-based authentication via better-auth
- Bearer token for API requests
- Automatic session timeout (30 min)

### Authorization
- Role-based access control (5 levels)
- 113 granular permissions
- Resource-level permission checks

### Data Protection
- Input validation on all forms
- SQL injection prevention (Drizzle ORM)
- XSS protection (React escaping)
- CSRF protection (tokens)

## 📈 Performance

### Optimization Strategies
- Client-side data caching
- Lazy loading for large lists
- Pagination for member/prayer lists
- Debounced search inputs
- Optimistic UI updates

### Loading States
- Skeleton screens during data fetch
- Loading spinners for actions
- Toast notifications for feedback

## 🐛 Troubleshooting

### Common Issues

#### Can't Access Admin Dashboard
- Check if user has admin role assigned
- Verify session token is valid
- Check middleware configuration

#### Permissions Not Working
- Verify role is assigned to user
- Check permission is assigned to role
- Clear browser cache and reload

#### Stats Not Loading
- Check API endpoints are responding
- Verify database connection
- Check browser console for errors

## 📚 Additional Resources

- [RBAC System Documentation](./RBAC_SYSTEM_DOCUMENTATION.md)
- [RBAC Quick Start Guide](./RBAC_QUICK_START.md)
- [Database Schema](./src/db/schema.ts)
- [API Routes](./src/app/api/)

## 🎯 Next Steps

1. **Implement Full CRUD** - Complete edit/delete operations for all resources
2. **Add Bulk Actions** - Select multiple items for batch operations
3. **Enhanced Reporting** - Generate PDF reports and analytics
4. **Audit Logging** - Track all admin actions
5. **Advanced Filters** - Date ranges, custom queries
6. **Export Features** - CSV/Excel export for all data
7. **Mobile Admin App** - Native mobile interface

---

## 🎉 You're Ready!

Your comprehensive admin dashboard is now complete with:
✅ 5-level RBAC system with 113 permissions
✅ Members management (30 pre-seeded)
✅ Staff management with employment titles
✅ Workshops & Events coordination
✅ Prayer wall moderation
✅ System settings configuration
✅ Real-time statistics
✅ Beautiful, responsive UI

**Start managing UCon Ministries operations at: http://localhost:3000/admin**
