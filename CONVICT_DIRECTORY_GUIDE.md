# Convict Directory System Documentation

## Overview

The **Convict Directory** is a comprehensive admin tool that allows staff to search, view, and manage all Convicts in the UCM system. This includes:

- All registered users (self-registrations default to "Convict" role level 7)
- Workshop participants
- Outreach participants
- Ministry volunteers
- Newsletter subscribers
- Staff members (displayed with their convict profile for holistic management)

## Terminology

| Term | Definition |
|------|------------|
| **Convict** | UCM's unique term for community members. All registered users are "Convicts" - this represents the journey of transformation, not a negative label. |
| **Convict Type** | The category of engagement (workshop_participant, outreach_participant, ministry_volunteer, newsletter_subscriber, registered_user) |
| **Convict Role** | The assigned ministerial role (pastoral, outreach, volunteer, staff) |
| **Clearance Level** | Permission clearance value (0-100) mapped to UCM Levels 1-7 |
| **Duty Clearance** | Separate clearance for operational duties |

## Access Location

**Admin Panel → Authorization → Convict Directory**
- URL: `/admin/convicts`
- Required Clearance: Level 3 (Ministry Coordinators) or higher

## Features

### 1. Search & Filtering

The directory supports comprehensive search capabilities:

| Filter | Description |
|--------|-------------|
| **General Search** | Searches across name, email, phone, address, and ID |
| **Email Filter** | Filter by email address (partial match) |
| **Phone Filter** | Filter by phone number (partial match) |
| **Address Filter** | Filter by street address (partial match) |
| **User ID Filter** | Filter by linked Supabase user ID |
| **Convict Type** | Filter by engagement category |
| **Status** | Filter by account status (active, inactive, suspended) |

### 2. Convict Profile View

When viewing a convict, you see:

- **Profile Tab**: Contact information, account details, staff notes, interests
- **Activity Tab**: Comprehensive activity log across all UCM programs
- **Books Tab**: Book/resource requests for this convict
- **Groups Tab**: Group memberships and management
- **Actions Tab**: Quick administrative actions

### 3. Administrative Actions

#### Book Request
Create a book or resource request for a convict:
- Book title (required)
- Author
- Resource type (book, bible, workbook, devotional, study guide, other)
- Reason for request
- Notes

#### Group Management
- View current group memberships
- Add convict to available groups
- Remove from groups
- View member role and join date

#### Transit Request
Submit a transit booking on behalf of a convict:
- Pickup location
- Destination
- Requested date/time
- Ride purpose (medical appointment, court, job interview, housing, workshop, general)
- Special needs (wheelchair, etc.)
- Notes

#### Profile Updates
Edit convict information:
- Name, email, phone
- Full address (street, city, state, ZIP)
- Convict type
- Account status
- Staff notes

#### Quick Status Updates
One-click status changes:
- **Active**: Normal account access
- **Inactive**: Account disabled but not punitive
- **Suspended**: Account suspended for policy violations

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Convict Directory                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoints                            │
├─────────────────────────────────────────────────────────────┤
│ GET  /api/convicts          │ Search & list convicts       │
│ GET  /api/convicts/:id      │ Get single convict           │
│ PUT  /api/convicts/:id      │ Update convict profile       │
│ GET  /api/convicts/:id/activity │ Get activity log         │
│ GET  /api/book-requests     │ Get book requests            │
│ POST /api/book-requests     │ Create book request          │
│ GET  /api/convict-groups    │ Get groups/memberships       │
│ PUT  /api/convict-groups    │ Add/remove from groups       │
│ POST /api/admin/outreach/transit/bookings │ Admin transit  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Tables                          │
├─────────────────────────────────────────────────────────────┤
│ convicts             │ Main convict records                 │
│ book_requests        │ Book/resource requests               │
│ convict_groups       │ Group definitions                    │
│ convict_group_members│ Group memberships                    │
│ transit_bookings     │ Transit ride bookings                │
│ transit_activity_log │ Transit activity records             │
│ workshop_registrations │ Workshop participation             │
│ (other activity logs)│ Nourish, Haven, Shepherd, Bridge, etc│
└─────────────────────────────────────────────────────────────┘
```

## Activity Log Sources

The activity log aggregates data from multiple UCM programs:

| Program | Activity Type | Description |
|---------|---------------|-------------|
| TRANSIT | Transit rides | Completed transportation services |
| TRANSIT_BOOKING | Ride bookings | Pending/approved/completed bookings |
| WORKSHOP | Workshop registration | Workshop participation records |
| NOURISH | Food distribution | Food assistance records |
| HAVEN | Shelter services | Housing/shelter assistance |
| SHEPHERD | Pastoral care | Counseling and spiritual care |
| BRIDGE | Mentorship | Mentor-mentee interactions |

## Convict Types

| Type | Description |
|------|-------------|
| `workshop_participant` | Attended UCM workshops |
| `outreach_participant` | Received outreach services |
| `ministry_volunteer` | Volunteers with the ministry |
| `newsletter_subscriber` | Newsletter subscribers |
| `registered_user` | Self-registered accounts (default) |

## Status Values

| Status | Description | Impact |
|--------|-------------|--------|
| `active` | Normal active account | Full access |
| `inactive` | Account disabled | No access, non-punitive |
| `suspended` | Account suspended | No access, policy violation |

## UCM Clearance Levels (7-Level System)

| Level | Name | Description |
|-------|------|-------------|
| 1 | Executive Leadership | Full system access |
| 2 | Program Directors | Department oversight |
| 3 | Ministry Coordinators | Program management |
| 4 | Staff Members | Day-to-day operations |
| 5 | Volunteers | Limited supervised access |
| 6 | Mentors | LDI graduates mentoring convicts |
| 7 | Convicts | Base level for all self-registrations |

## Best Practices

### For Staff Using the Directory

1. **Always verify identity** before making changes to convict profiles
2. **Document changes** in the staff notes field
3. **Use appropriate status** - only suspend for policy violations
4. **Check activity log** before making decisions about convict engagement
5. **Coordinate with team** before removing from groups

### For Developers

1. **API queries** should always include pagination (`limit`, `offset`)
2. **Search filters** use SQL LIKE with wildcards for flexibility
3. **Activity logs** are aggregated in-memory - consider caching for performance
4. **Status changes** should trigger appropriate notifications
5. **Profile updates** automatically set `updatedAt` timestamp

## Related Documentation

- [RBAC System Documentation](./RBAC_SYSTEM_DOCUMENTATION.md)
- [Staff Management Guide](./STAFF_LOGIN_PORTAL_GUIDE.md)
- [Workshop System Guide](./WORKSHOP_SYSTEM_GUIDE.md)
- [Transit Booking Guide](./VOLUNTEER_TIME_CLOCK_API_GUIDE.md)

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Search returns no results | Filters too restrictive | Clear filters and try broader search |
| Activity log empty | No linked activities | Check if convict has userId linked |
| Can't add to group | Already a member | Check existing memberships |
| Transit request fails | Missing required fields | Fill in pickup, destination, and time |
| Profile update fails | Invalid data | Check email format and required fields |

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Invalid request data |
| 404 | Convict not found |
| 409 | Conflict (e.g., duplicate group membership) |
| 500 | Server error - check logs |

## Changelog

| Date | Change |
|------|--------|
| 2024-01 | Initial Convict Directory implementation |
| 2024-01 | Added 7-level clearance system (Levels 6 & 7: Mentors, Convicts) |
| 2024-01 | Added book requests, group management, transit booking |
| 2024-01 | Added comprehensive activity log aggregation |
