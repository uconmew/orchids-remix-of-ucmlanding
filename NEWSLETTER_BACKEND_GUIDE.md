# Newsletter Backend System - Complete Guide

## 📋 Overview

A comprehensive newsletter management system with subscriber management, analytics, import/export capabilities, and unsubscribe handling.

## 🗄️ Database Schema

### `newsletterSubscribers` Table

```sql
CREATE TABLE newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TEXT NOT NULL,
  unsubscribed_at TEXT,
  source TEXT DEFAULT 'homepage_modal',
  tags JSON,
  last_email_sent TEXT,
  emails_sent INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Fields:**
- `id`: Unique subscriber identifier
- `name`: Subscriber's full name
- `email`: Unique email address (lowercase, trimmed)
- `status`: `'active'` or `'unsubscribed'`
- `subscribedAt`: ISO timestamp of subscription
- `unsubscribedAt`: ISO timestamp of unsubscribe (null if active)
- `source`: Where they subscribed from (e.g., 'homepage_modal', 'footer_form', 'bulk_import')
- `tags`: JSON array of tags (e.g., `["website", "ldi_interested"]`)
- `lastEmailSent`: ISO timestamp of last email sent to subscriber
- `emailsSent`: Total count of emails sent
- `createdAt`: ISO timestamp of record creation
- `updatedAt`: ISO timestamp of last update

---

## 🔌 API Endpoints

### 1. **Subscribe to Newsletter**

**Endpoint:** `POST /api/newsletter`

**Description:** Subscribe a new email to the newsletter

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "source": "homepage_modal"  // optional, defaults to "homepage_modal"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter!",
  "subscriber": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (200 - Already Subscribed):**
```json
{
  "success": true,
  "message": "You are already subscribed to our newsletter!",
  "subscriber": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (200 - Reactivated):**
```json
{
  "success": true,
  "message": "Welcome back! Your subscription has been reactivated.",
  "subscriber": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing name/email or invalid email format
- `500 Internal Server Error`: Server error

---

### 2. **Get All Subscribers**

**Endpoint:** `GET /api/newsletter`

**Description:** Retrieve all newsletter subscribers (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 150,
  "subscribers": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "subscribedAt": "2025-01-15T10:30:00.000Z",
      "emailsSent": 5,
      "source": "homepage_modal"
    }
  ]
}
```

---

### 3. **Unsubscribe from Newsletter**

**Endpoint:** `POST /api/newsletter/unsubscribe`

**Description:** Unsubscribe an email from the newsletter

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "You have been successfully unsubscribed from our newsletter."
}
```

**Alternative Method:**

**Endpoint:** `GET /api/newsletter/unsubscribe?email=john@example.com`

**Description:** Unsubscribe via URL link (for email unsubscribe links)

**Error Responses:**
- `400 Bad Request`: Missing email
- `404 Not Found`: Email not found in subscriber list
- `500 Internal Server Error`: Server error

---

### 4. **Get Newsletter Statistics**

**Endpoint:** `GET /api/newsletter/stats`

**Description:** Get comprehensive newsletter statistics

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "active": 150,
    "unsubscribed": 25,
    "total": 175,
    "recentSubscribers": 42,
    "growthRate": "15.5%",
    "bySource": [
      {
        "source": "homepage_modal",
        "count": 85
      },
      {
        "source": "footer_form",
        "count": 40
      },
      {
        "source": "bulk_import",
        "count": 25
      }
    ]
  }
}
```

**Metrics Explained:**
- `active`: Total active subscribers
- `unsubscribed`: Total unsubscribed users
- `total`: All-time total subscribers
- `recentSubscribers`: New subscribers in last 30 days
- `growthRate`: Week-over-week growth percentage
- `bySource`: Breakdown of subscribers by source

---

### 5. **Get Specific Subscriber**

**Endpoint:** `GET /api/newsletter/[id]`

**Description:** Get details of a specific subscriber

**Example:** `GET /api/newsletter/1`

**Response (200 OK):**
```json
{
  "success": true,
  "subscriber": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "subscribedAt": "2025-01-15T10:30:00.000Z",
    "unsubscribedAt": null,
    "source": "homepage_modal",
    "tags": "[\"website\"]",
    "lastEmailSent": null,
    "emailsSent": 0,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `404 Not Found`: Subscriber not found
- `500 Internal Server Error`: Server error

---

### 6. **Update Subscriber**

**Endpoint:** `PATCH /api/newsletter/[id]`

**Description:** Update subscriber information

**Example:** `PATCH /api/newsletter/1`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "status": "active",
  "tags": ["website", "ldi_interested"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscriber updated successfully",
  "subscriber": {
    "id": 1,
    "name": "John Updated",
    "email": "newemail@example.com",
    "status": "active",
    // ... full subscriber object
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID, email format, or status value
- `404 Not Found`: Subscriber not found
- `409 Conflict`: Email already in use by another subscriber
- `500 Internal Server Error`: Server error

---

### 7. **Delete Subscriber**

**Endpoint:** `DELETE /api/newsletter/[id]`

**Description:** Permanently delete a subscriber (GDPR compliance)

**Example:** `DELETE /api/newsletter/1`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscriber deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `404 Not Found`: Subscriber not found
- `500 Internal Server Error`: Server error

---

### 8. **Export Subscribers (CSV)**

**Endpoint:** `GET /api/newsletter/export?status=active`

**Description:** Export subscribers as CSV file

**Query Parameters:**
- `status`: Filter by status (`'active'`, `'unsubscribed'`, or `'all'`). Default: `'active'`

**Example:** `GET /api/newsletter/export?status=all`

**Response (200 OK):**
- **Content-Type:** `text/csv`
- **File Download:** `newsletter-subscribers-2025-01-15.csv`

**CSV Format:**
```csv
ID,Name,Email,Status,Source,Subscribed At,Unsubscribed At,Emails Sent
1,"John Doe",john@example.com,active,homepage_modal,2025-01-15T10:30:00.000Z,,0
2,"Jane Smith",jane@example.com,unsubscribed,footer_form,2025-01-10T08:15:00.000Z,2025-01-14T12:00:00.000Z,3
```

---

### 9. **Bulk Import Subscribers**

**Endpoint:** `POST /api/newsletter/bulk-import`

**Description:** Import multiple subscribers from CSV data

**Request Body:**
```json
{
  "subscribers": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "source": "bulk_import"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "source": "bulk_import"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk import completed",
  "results": {
    "total": 100,
    "success": 85,
    "failed": 5,
    "skipped": 10,
    "errors": [
      "Invalid email: notanemail",
      "Missing name or email for entry: {...}"
    ]
  }
}
```

**Import Logic:**
- Validates name and email for each subscriber
- Skips existing emails (no duplicates)
- Tags all imported subscribers with `["bulk_import"]`
- Returns detailed results with errors

---

## 🔧 Frontend Integration

### **Subscribe Form Example**

```typescript
async function handleNewsletterSubscribe(name: string, email: string) {
  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        source: 'homepage_modal',
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      console.log(data.message);
      // Store in localStorage to prevent re-prompting
      localStorage.setItem('newsletter-subscribed', 'true');
    } else {
      // Show error message
      console.error(data.error);
    }
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
  }
}
```

### **Unsubscribe Form Example**

```typescript
async function handleNewsletterUnsubscribe(email: string) {
  try {
    const response = await fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(data.message);
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Unsubscribe failed:', error);
  }
}
```

### **Fetch Statistics Example**

```typescript
async function fetchNewsletterStats() {
  try {
    const response = await fetch('/api/newsletter/stats');
    const data = await response.json();

    if (data.success) {
      const { active, growthRate, recentSubscribers } = data.stats;
      console.log(`Active: ${active}, Growth: ${growthRate}, Recent: ${recentSubscribers}`);
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}
```

---

## 📊 Admin Dashboard Features

### **Dashboard Component Ideas**

1. **Statistics Cards**
   - Total Active Subscribers
   - Growth Rate (%)
   - Recent Subscribers (30 days)
   - Unsubscribe Rate

2. **Subscriber Management Table**
   - Sortable columns (name, email, date)
   - Filter by status (active/unsubscribed)
   - Search functionality
   - Edit/Delete actions

3. **Export Controls**
   - Download CSV (active, unsubscribed, or all)
   - Date range filtering
   - Custom field selection

4. **Bulk Import**
   - CSV file upload
   - Preview before import
   - Validation feedback
   - Import results summary

5. **Analytics Charts**
   - Subscription growth over time
   - Source breakdown (pie chart)
   - Engagement metrics

---

## 🔐 Security Considerations

### **Email Validation**
- Uses regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Converts all emails to lowercase
- Trims whitespace

### **Data Protection**
- Unique email constraint prevents duplicates
- Soft delete option (status: 'unsubscribed')
- Hard delete available for GDPR compliance

### **Admin Access Control**
- **TODO:** Implement RBAC for admin endpoints
- Recommended: Check user role before allowing:
  - GET /api/newsletter (view all)
  - PATCH /api/newsletter/[id] (edit)
  - DELETE /api/newsletter/[id] (delete)
  - GET /api/newsletter/export (export)
  - POST /api/newsletter/bulk-import (import)

---

## 📧 Email Integration (Future Enhancement)

### **Recommended Email Service Providers**
- **Resend** (modern, developer-friendly)
- **SendGrid** (enterprise-grade)
- **Mailgun** (reliable, affordable)
- **Amazon SES** (scalable, low-cost)

### **Email Templates Needed**
1. **Welcome Email** - Sent immediately after subscription
2. **Newsletter** - Regular updates and content
3. **Unsubscribe Confirmation** - Confirm unsubscribe action
4. **Re-engagement** - Win back inactive subscribers

### **Email Tracking**
- Update `lastEmailSent` after sending
- Increment `emailsSent` counter
- Track open rates and click-through rates (requires email service integration)

---

## 🧪 Testing

### **Manual Testing Checklist**

✅ **Subscribe Flow:**
1. Subscribe with valid name/email → Success
2. Subscribe with same email again → Already subscribed message
3. Subscribe with invalid email → Validation error
4. Subscribe with missing fields → Error message

✅ **Unsubscribe Flow:**
1. Unsubscribe with valid email → Success
2. Unsubscribe with non-existent email → Not found error
3. Unsubscribe twice → Already unsubscribed message
4. Unsubscribe via GET link → Success

✅ **Admin Operations:**
1. Get all subscribers → Returns list
2. Get subscriber stats → Returns metrics
3. Update subscriber → Success
4. Delete subscriber → Permanently removed
5. Export CSV → Downloads file
6. Bulk import → Processes and returns results

### **Test with cURL**

**Subscribe:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "source": "test"}'
```

**Unsubscribe:**
```bash
curl -X POST http://localhost:3000/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Get Stats:**
```bash
curl http://localhost:3000/api/newsletter/stats
```

**Export CSV:**
```bash
curl http://localhost:3000/api/newsletter/export?status=active -o subscribers.csv
```

---

## 📈 Future Enhancements

### **Priority 1 (Essential)**
- [ ] Email integration (Resend/SendGrid)
- [ ] Admin authentication and RBAC
- [ ] Welcome email automation
- [ ] Unsubscribe confirmation email

### **Priority 2 (Important)**
- [ ] Email template builder
- [ ] Scheduled newsletter campaigns
- [ ] Subscriber segmentation
- [ ] A/B testing for emails

### **Priority 3 (Nice-to-have)**
- [ ] Analytics dashboard with charts
- [ ] Automated re-engagement campaigns
- [ ] Email open/click tracking
- [ ] Custom field management
- [ ] Advanced filtering and search
- [ ] Webhook notifications

---

## 🚀 Quick Start

### **1. Database is Ready**
The schema is already in place. No migration needed.

### **2. Test the API**
```bash
# Subscribe test
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Check stats
curl http://localhost:3000/api/newsletter/stats
```

### **3. Build Admin Dashboard**
Create a page at `/admin/newsletter` to manage subscribers using the API endpoints.

### **4. Add Email Integration**
Connect to Resend or SendGrid to send actual emails.

---

## 📞 Support

For questions or issues:
- Check API responses for detailed error messages
- Review server logs for backend errors
- Test with cURL before implementing in frontend
- Ensure database is properly migrated

---

## ✅ Summary

**What's Working:**
✅ Subscribe/Unsubscribe
✅ Subscriber management (CRUD)
✅ Statistics and analytics
✅ CSV export
✅ Bulk import
✅ Email validation
✅ Duplicate prevention
✅ Status tracking

**What's Next:**
🔜 Email integration
🔜 Admin authentication
🔜 Welcome emails
🔜 Campaign scheduling

The backend is **fully functional** and ready for frontend integration! 🎉
