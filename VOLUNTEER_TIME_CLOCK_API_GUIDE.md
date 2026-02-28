# Volunteer Time Clock API Integration Guide

This guide explains how to integrate your future time clock system with the volunteer stats tracking.

## Overview

The system tracks volunteer hours through a `volunteer_time_entries` table and aggregates stats in the `volunteer_stats` table. Live data is displayed on the About page automatically.

## Database Tables

### `volunteer_stats`
Stores aggregated volunteer statistics:
- `active_volunteers` - Total number of active volunteers
- `hours_donated` - Cumulative hours donated (monthly or total)
- `partner_churches` - Number of partner churches
- `last_updated` - Last update timestamp

### `volunteer_time_entries`
Stores individual time clock entries:
- `volunteer_id` - Unique volunteer identifier
- `volunteer_name` - Volunteer's full name
- `clock_in` - Clock-in timestamp (ISO 8601)
- `clock_out` - Clock-out timestamp (ISO 8601, nullable)
- `total_hours` - Calculated hours worked
- `activity_type` - Type of volunteer activity (e.g., "outreach", "ministry", "ldi_support")
- `notes` - Optional notes about the volunteer session
- `created_at` / `updated_at` - Timestamps

---

## API Endpoints

### 1. Clock In (Create Time Entry)

**Endpoint:** `POST /api/admin/volunteer-stats`

**Purpose:** Record when a volunteer clocks in

**Request Body:**
```json
{
  "volunteerId": "volunteer_123",
  "volunteerName": "John Doe",
  "activityType": "outreach",
  "notes": "Food distribution shift",
  "clockIn": "2025-01-15T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Time entry created",
  "data": {
    "id": 1,
    "volunteerId": "volunteer_123",
    "volunteerName": "John Doe",
    "clockIn": "2025-01-15T09:00:00Z",
    "clockOut": null,
    "totalHours": null,
    "activityType": "outreach",
    "notes": "Food distribution shift",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-15T09:00:00Z"
  }
}
```

### 2. Clock Out (Update Time Entry)

**Endpoint:** `PATCH /api/admin/volunteer-stats/clock-out`

**Purpose:** Record when a volunteer clocks out and calculate hours

**Request Body:**
```json
{
  "entryId": 1,
  "clockOut": "2025-01-15T13:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clocked out successfully",
  "data": {
    "id": 1,
    "volunteerId": "volunteer_123",
    "volunteerName": "John Doe",
    "clockIn": "2025-01-15T09:00:00Z",
    "clockOut": "2025-01-15T13:00:00Z",
    "totalHours": 4.0,
    "activityType": "outreach",
    "notes": "Food distribution shift",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-15T13:00:05Z"
  }
}
```

### 3. Get Active Clock-Ins

**Endpoint:** `GET /api/admin/volunteer-stats/clock-out`

**Purpose:** Get all volunteers currently clocked in (no clock-out recorded)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 5,
      "volunteerId": "volunteer_456",
      "volunteerName": "Jane Smith",
      "clockIn": "2025-01-15T10:00:00Z",
      "clockOut": null,
      "totalHours": null,
      "activityType": "ministry",
      "notes": "Workshop facilitation"
    }
  ]
}
```

### 4. Update Aggregate Stats (Manual)

**Endpoint:** `PATCH /api/admin/volunteer-stats`

**Purpose:** Manually update aggregate volunteer statistics

**Request Body:**
```json
{
  "activeVolunteers": 275,
  "hoursDonated": 6200,
  "partnerChurches": 48
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stats updated successfully",
  "data": {
    "id": 1,
    "activeVolunteers": 275,
    "hoursDonated": 6200,
    "partnerChurches": 48,
    "lastUpdated": "2025-01-15T14:30:00Z"
  }
}
```

### 5. Get Current Stats

**Endpoint:** `GET /api/admin/volunteer-stats`

**Purpose:** Retrieve current volunteer statistics

**Response:**
```json
{
  "id": 1,
  "activeVolunteers": 250,
  "hoursDonated": 5000,
  "partnerChurches": 45,
  "lastUpdated": "2025-01-15T00:00:00Z"
}
```

### 6. Get Live Stats (Public)

**Endpoint:** `GET /api/stats`

**Purpose:** Get all live stats including volunteer data (used by About page)

**Response:**
```json
{
  "livesTransformed": 150,
  "ldiApplicants": 45,
  "communityTouchPoints": 1294,
  "prayersCount": 84,
  "communityPrayers": 1294,
  "activeMentors": 8,
  "activeVolunteers": 250,
  "hoursDonated": 5000,
  "partnerChurches": 45,
  "workshops": {
    "total": 12,
    "active": 3,
    "completed": 9,
    "registrations": 45,
    "attended": 38
  }
}
```

---

## Integration Workflow

### For Your Time Clock System:

1. **Clock In Flow:**
   ```
   User clocks in → POST /api/admin/volunteer-stats
   → Store returned entry ID for clock-out
   ```

2. **Clock Out Flow:**
   ```
   User clocks out → PATCH /api/admin/volunteer-stats/clock-out with entry ID
   → Hours automatically calculated and stored
   ```

3. **Dashboard Display:**
   ```
   Load active clock-ins → GET /api/admin/volunteer-stats/clock-out
   → Display list of currently clocked-in volunteers
   ```

---

## Automatic Stats Calculation

The `/api/stats` endpoint automatically:

1. **Calculates monthly hours** from `volunteer_time_entries` for the current month
2. **Counts unique active volunteers** from time entries in the current month
3. **Falls back to stored aggregate stats** if no time entries exist yet
4. **Uses the greater value** between calculated monthly volunteers and stored active volunteers

### How It Works:

```typescript
// Current month hours calculation
const currentMonthStart = new Date();
currentMonthStart.setDate(1);
currentMonthStart.setHours(0, 0, 0, 0);

// Sum hours from time entries this month
SELECT SUM(total_hours), COUNT(DISTINCT volunteer_id)
FROM volunteer_time_entries
WHERE clock_in >= currentMonthStart
```

---

## Activity Types

Recommended activity types for categorization:

- `"outreach"` - Track 3 outreach activities
- `"ministry"` - Track 2 open ministry services
- `"ldi_support"` - Track 1 LDI program support
- `"admin"` - Administrative volunteer work
- `"event"` - Special events and community gatherings
- `"transportation"` - Transportation services
- `"food_distribution"` - Food pantry and distribution
- `"shelter_support"` - Shelter and housing support

---

## Frontend Display

The About page (`/about`) automatically displays live volunteer stats:

```tsx
// Stats are fetched on page load
useEffect(() => {
  const fetchStats = async () => {
    const response = await fetch('/api/stats');
    const data = await response.json();
    setVolunteerStats({
      activeVolunteers: data.activeVolunteers,
      hoursDonated: data.hoursDonated,
      partnerChurches: data.partnerChurches,
    });
  };
  fetchStats();
}, []);
```

Statistics cards show:
- **Active Volunteers** - Current month unique volunteers or stored value
- **Hours Donated** - Current month total hours
- **Partner Churches** - Total partner churches

---

## Testing Examples

### Test Clock In:
```bash
curl -X POST http://localhost:3000/api/admin/volunteer-stats \
  -H "Content-Type: application/json" \
  -d '{
    "volunteerId": "test_volunteer_1",
    "volunteerName": "Test Volunteer",
    "activityType": "outreach",
    "notes": "Testing time clock system"
  }'
```

### Test Clock Out (replace entryId with returned ID):
```bash
curl -X PATCH http://localhost:3000/api/admin/volunteer-stats/clock-out \
  -H "Content-Type: application/json" \
  -d '{
    "entryId": 1
  }'
```

### Check Stats:
```bash
curl http://localhost:3000/api/stats
```

---

## Future Enhancements

When you build your time clock system, consider adding:

1. **Volunteer authentication** - Integrate with Better Auth for secure clock in/out
2. **QR code check-in** - Generate QR codes for quick clock-in
3. **Biometric verification** - Fingerprint or face recognition
4. **Automatic reminders** - Notify volunteers who forgot to clock out
5. **Reports dashboard** - Generate volunteer activity reports
6. **Shift scheduling** - Schedule volunteer shifts and track attendance
7. **Gamification** - Badges, milestones, and recognition for hours served

---

## Database Indexes

The following indexes are created for performance:
- `idx_volunteer_time_entries_volunteer_id` - Fast volunteer lookup
- `idx_volunteer_time_entries_clock_in` - Fast date range queries

---

## Notes

- All timestamps use ISO 8601 format (e.g., `"2025-01-15T09:00:00Z"`)
- Hours are calculated automatically on clock-out
- Stats update in real-time based on time entries
- The system gracefully falls back to stored aggregate stats if no time entries exist
- Monthly calculations reset on the 1st of each month

---

## Support

For questions or issues with the volunteer time tracking system:
- Email: tech@uconministries.org
- Check logs at `/api/stats` for current data
- Verify database tables exist: `volunteer_stats`, `volunteer_time_entries`
