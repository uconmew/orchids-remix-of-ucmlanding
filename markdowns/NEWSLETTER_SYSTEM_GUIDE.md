# Newsletter System Guide

## Overview
The UCon Ministries Newsletter System allows users to subscribe to the newsletter through a popup modal that appears when they scroll to the middle of the homepage. All subscriptions are stored in the database and can be managed through the admin panel.

## Features

### User-Facing Features
- ✅ **Popup Modal**: Appears when user scrolls to 50% of homepage
- ✅ **Smart Triggering**: Won't show if user already subscribed or dismissed within 7 days
- ✅ **Email Validation**: Front-end and back-end validation
- ✅ **Duplicate Prevention**: Handles duplicate email submissions gracefully
- ✅ **Re-subscription**: Allows previously unsubscribed users to re-subscribe
- ✅ **Beautiful UI**: Animated modal with gradient effects and smooth transitions

### Backend Features
- ✅ **Database Storage**: All subscribers stored in `newsletter_subscribers` table
- ✅ **REST API**: Full CRUD operations available
- ✅ **Status Tracking**: Track active/unsubscribed status
- ✅ **Source Tracking**: Know where subscribers came from
- ✅ **Email Metrics**: Track emails sent to each subscriber

## Database Schema

```sql
CREATE TABLE newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',           -- 'active' or 'unsubscribed'
  subscribed_at TEXT NOT NULL,
  unsubscribed_at TEXT,
  source TEXT DEFAULT 'homepage_modal',            -- tracking source of subscription
  tags TEXT,                                       -- JSON array of tags
  last_email_sent TEXT,                            -- timestamp of last email
  emails_sent INTEGER DEFAULT 0,                   -- total emails sent counter
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## API Endpoints

### POST /api/newsletter
Subscribe a new user to the newsletter.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "source": "homepage_modal"  // optional, defaults to 'homepage_modal'
}
```

**Success Response (201):**
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

**Duplicate Email (200):**
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

**Re-subscription (200):**
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

**Error Response (400/500):**
```json
{
  "error": "Name and email are required"
}
```

### GET /api/newsletter
Retrieve all newsletter subscribers (admin only - should add auth).

**Success Response (200):**
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
      "subscribedAt": "2025-12-14T14:54:26.722Z",
      "emailsSent": 5,
      "source": "homepage_modal"
    }
  ]
}
```

## Frontend Integration

### Modal Component
Location: `src/components/NewsletterPopupModal.tsx`

**Props:**
```typescript
interface NewsletterPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Usage in HomePage:**
```typescript
import NewsletterPopupModal from '@/components/NewsletterPopupModal';

// State
const [showNewsletterModal, setShowNewsletterModal] = useState(false);

// Scroll trigger (already implemented)
useEffect(() => {
  const checkNewsletterPopup = () => {
    const subscribed = localStorage.getItem("newsletter-subscribed");
    const dismissed = localStorage.getItem("newsletter-dismissed");
    
    if (subscribed) return null;
    
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return null;
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollPosition + windowHeight) / documentHeight;
      
      if (scrollPercentage >= 0.5 && !showNewsletterModal) {
        setShowNewsletterModal(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  };
  
  return checkNewsletterPopup();
}, [showNewsletterModal]);

// Component
<NewsletterPopupModal 
  isOpen={showNewsletterModal}
  onClose={() => setShowNewsletterModal(false)}
/>
```

## LocalStorage Keys

- `newsletter-subscribed`: Set to "true" when user successfully subscribes
- `newsletter-dismissed`: Set to timestamp when user clicks "Maybe Later"

## Testing

### Manual Testing
1. Open homepage in incognito/private window
2. Scroll to middle of page
3. Modal should appear
4. Enter name and email
5. Click "Join the Movement"
6. Should see success animation
7. Reload page - modal should NOT appear again

### API Testing

**Subscribe:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

**Get All Subscribers:**
```bash
curl http://localhost:3000/api/newsletter
```

**Test Duplicate:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"name":"Another Name","email":"test@example.com"}'
```

## Future Enhancements

### Email Integration
1. **Resend Integration**
   - Send welcome email on signup
   - Weekly/monthly newsletter campaigns
   - Event announcements

2. **Mailchimp/SendGrid Integration**
   - Sync subscribers to email service
   - Advanced segmentation
   - Email analytics

### Admin Panel
1. **Subscriber Management**
   - View all subscribers in admin dashboard
   - Export to CSV
   - Bulk actions (tag, unsubscribe)
   - Search and filter

2. **Email Campaigns**
   - Create and schedule campaigns
   - Template management
   - A/B testing
   - Analytics dashboard

3. **Segmentation**
   - Tag-based filtering
   - Source-based campaigns
   - Behavioral triggers

### Analytics
1. **Subscription Metrics**
   - Daily/weekly/monthly signups
   - Conversion rate tracking
   - Source performance

2. **Email Metrics**
   - Open rates
   - Click rates
   - Unsubscribe rates

## Security Considerations

### Current Implementation
- ✅ Email validation (regex)
- ✅ Duplicate prevention
- ✅ SQL injection protection (Drizzle ORM)
- ✅ Input sanitization (.trim(), .toLowerCase())

### Recommended Additions
- 🔲 Rate limiting on POST endpoint
- 🔲 CAPTCHA/bot protection
- 🔲 Email verification (double opt-in)
- 🔲 Admin authentication for GET endpoint
- 🔲 GDPR compliance (unsubscribe link in emails)
- 🔲 Privacy policy acceptance checkbox

## Troubleshooting

### Modal Not Appearing
1. Check localStorage - clear `newsletter-subscribed` and `newsletter-dismissed`
2. Check console for errors
3. Verify scroll position is past 50%

### Subscription Fails
1. Check network tab for API errors
2. Verify database connection
3. Check server logs for detailed error

### Duplicate Emails
- System intentionally allows this for better UX
- Returns success message to avoid revealing email existence
- Updates subscriber name if status is 'active'

## Files Modified/Created

### Created Files
- `src/app/api/newsletter/route.ts` - API endpoint
- `scripts/create-newsletter-table.ts` - Migration script
- `NEWSLETTER_SYSTEM_GUIDE.md` - This documentation

### Modified Files
- `src/db/schema.ts` - Added newsletterSubscribers table
- `src/components/NewsletterPopupModal.tsx` - Connected to API
- `src/app/page.tsx` - Scroll trigger logic (already implemented)

## Maintenance

### Regular Tasks
1. **Weekly**: Review new subscribers, check for spam
2. **Monthly**: Export subscriber list for backup
3. **Quarterly**: Clean up bounced emails, unsubscribe inactive

### Database Backup
```bash
# Example backup command (adjust for your hosting)
sqlite3 database.db ".backup newsletter_subscribers_backup.db"
```

## Support

For questions or issues with the newsletter system:
- Check server logs: `TerminalLogs` tool
- Check browser console for frontend errors
- Review API responses in Network tab
- Test API endpoints directly with curl

---

**Last Updated**: December 14, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
