# UCon Ministries Careers Board System

**Complete Career Management Solution** - From job posting to hiring

---

## 🎯 System Overview

The careers board system provides a comprehensive, end-to-end solution for managing job postings and applications at UCon Ministries. Built with modern UI/UX, search capabilities, and automated workflows.

---

## 🗂️ System Components

### 1. **Admin Career Management** (`/admin/careers`)
Full-featured dashboard for managing the entire careers workflow.

**Features:**
- ✅ Create, edit, and delete job postings
- ✅ Publish/unpublish jobs with one click
- ✅ Feature important positions
- ✅ View application stats per position
- ✅ Manage application pipeline
- ✅ Dual tabs: Job Postings & Applications

**Job Creation Includes:**
- Title, department, location
- Employment type (full-time, part-time, contract, volunteer, internship)
- Salary range (optional)
- Detailed description
- Dynamic lists: Responsibilities, Qualifications, Benefits
- Application deadline
- Publish/feature toggles

---

### 2. **Public Careers Page** (`/careers`)
Beautiful, user-friendly job board for applicants.

**Features:**
- ✅ Hero section with live stats
- ✅ Advanced search and filters
  - Search by keyword/title
  - Filter by department, type, location
  - Real-time filtering
- ✅ Featured job highlighting
- ✅ Responsive grid layout
- ✅ Job cards with key info
- ✅ "Why Join Us" section

---

### 3. **Job Detail Page** (`/careers/[slug]`)
Comprehensive job details with embedded application form.

**Features:**
- ✅ Full job description
- ✅ Responsibilities, qualifications, benefits
- ✅ Application stats (view count, applicant count)
- ✅ Sticky "Apply Now" sidebar
- ✅ Application timeline preview
- ✅ Contact information

**Application Form Includes:**
- Personal information (name, email, phone)
- Address (optional)
- Professional details (resume URL, LinkedIn, portfolio)
- Experience level, current employer
- Expected salary, start date
- Cover letter
- Required: "Why interested" essay
- Additional information

---

### 4. **Application Detail View** (`/admin/careers/applications/[id]`)
Detailed applicant review interface for hiring team.

**Features:**
- ✅ Full applicant profile
- ✅ Contact information with click-to-call/email
- ✅ Professional background
- ✅ Cover letter & motivation essays
- ✅ External links (resume, LinkedIn, portfolio)
- ✅ Status management (submitted → reviewing → interview → hired/rejected)
- ✅ Interview scheduling
- ✅ Internal notes field
- ✅ Review timestamp tracking

---

### 5. **Email Notifications**
Automated confirmation emails for applicants.

**Features:**
- ✅ Beautiful HTML email template
- ✅ Gradient header with UCon branding
- ✅ What's Next timeline
- ✅ Links to ministry resources
- ✅ Contact information
- ✅ Powered by Resend API

---

## 📊 Database Schema

### Job Postings Table
```sql
- id (integer, primary key)
- title (text)
- slug (text, unique)
- department (text)
- location (text)
- employmentType (text)
- salaryRange (text, optional)
- description (text)
- responsibilities (JSON array)
- qualifications (JSON array)
- benefits (JSON array, optional)
- applicationDeadline (text, optional)
- isPublished (boolean)
- isFeatured (boolean)
- viewCount (integer)
- applicationCount (integer)
- postedBy (user reference)
- publishedAt, createdAt, updatedAt (timestamps)
```

### Job Applications Table
```sql
- id (integer, primary key)
- jobPostingId (foreign key)
- firstName, lastName, email, phone (required)
- address, city, state, zipCode (optional)
- resumeUrl, coverLetter, linkedinUrl, portfolioUrl (optional)
- yearsOfExperience, currentEmployer (optional)
- expectedSalary, availableStartDate (optional)
- howDidYouHear, whyInterested (text)
- additionalInfo (optional)
- status (submitted/reviewing/interview/hired/rejected)
- reviewedBy, reviewedAt (admin tracking)
- interviewDate, notes (admin fields)
- submittedAt, createdAt, updatedAt (timestamps)
```

---

## 🔗 API Endpoints

### Job Postings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/job-postings` | GET | List all published jobs (filters: department, type, location, search) |
| `/api/job-postings` | POST | Create new job posting (admin) |
| `/api/job-postings/[id]` | GET | Get single job + increment view count |
| `/api/job-postings/[id]` | PUT | Update job posting (admin) |
| `/api/job-postings/[id]` | DELETE | Delete job posting (admin) |

### Job Applications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/job-applications` | GET | List all applications (filters: jobPostingId, status) |
| `/api/job-applications` | POST | Submit new application |
| `/api/job-applications/[id]` | GET | Get single application (admin) |
| `/api/job-applications/[id]` | PUT | Update application status/notes (admin) |
| `/api/job-applications/[id]` | DELETE | Delete application (admin) |
| `/api/job-applications/send-confirmation` | POST | Send confirmation email |

---

## 🚀 Quick Start Guide

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin/careers`
   - Requires admin authentication

2. **Create a Job Posting**
   - Click "Create Job Posting" button
   - Fill in all required fields:
     - Title, Department, Location
     - Employment Type
     - Job Description
   - Add responsibilities (one at a time, click "Add")
   - Add qualifications (one at a time, click "Add")
   - Optional: Add benefits, salary range, deadline
   - Toggle "Publish immediately" to make live
   - Toggle "Feature this job" for homepage highlighting

3. **Manage Applications**
   - Switch to "Applications" tab
   - Click "View Details" on any application
   - Update status through lifecycle
   - Schedule interviews
   - Add internal notes

4. **Edit/Delete Jobs**
   - Click pencil icon to edit
   - Click eye icon to publish/unpublish
   - Click star icon to feature/unfeature
   - Click trash icon to delete

---

### For Applicants

1. **Browse Jobs**
   - Visit `/careers`
   - Use search bar for keywords
   - Filter by department, type, or location
   - Featured jobs appear at top

2. **View Job Details**
   - Click "View Details" on any job card
   - Read full description, responsibilities, qualifications
   - Check application deadline and stats

3. **Apply**
   - Click "Apply Now" button
   - Fill out application form (all required fields marked with *)
   - **Required:** First name, last name, email, phone, "Why interested?"
   - **Optional:** Resume URL, LinkedIn, portfolio, etc.
   - Click "Submit Application"
   - Receive confirmation email immediately

---

## 🎨 Design Features

### Color Theme
- **Primary Purple:** `#A92FFA` - Featured badges, CTAs
- **Secondary Orange:** `#F28C28` - Highlights, featured jobs
- **Gradient:** Purple → Orange for headers

### UI Components
- Shadcn/UI component library
- Lucide React icons
- Responsive grid layouts
- Sticky sidebars
- Hover lift effects on cards
- Badge status indicators
- Loading states
- Empty states

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- High contrast text
- Responsive breakpoints

---

## 🔐 Security & Permissions

### Public Access
- View published job postings
- Search and filter jobs
- Submit applications
- No authentication required

### Admin Access
- Create/edit/delete job postings
- Manage application pipeline
- Update application status
- View applicant details
- Access internal notes
- **Requires:** Admin role via RBAC system

---

## 📧 Email Notifications

### Applicant Confirmation Email
**Trigger:** Application submission

**Contents:**
- Thank you message
- Job title applied for
- What's next timeline (5 business days review)
- Links to ministry resources
- Contact information

**Powered by:** Resend API
**Configuration:** Set `RESEND_API_KEY` in environment variables

---

## 🧪 Testing Workflow

### Manual Test Checklist

1. **Job Creation**
   - [ ] Create new job posting
   - [ ] Add responsibilities, qualifications, benefits
   - [ ] Save as draft
   - [ ] Publish job
   - [ ] Feature job
   - [ ] Edit job details
   - [ ] Unpublish job

2. **Public View**
   - [ ] View jobs list at `/careers`
   - [ ] Test search functionality
   - [ ] Test department filter
   - [ ] Test employment type filter
   - [ ] Test location filter
   - [ ] View featured jobs section
   - [ ] Click job card → detail page

3. **Application Submission**
   - [ ] Open job detail page
   - [ ] Click "Apply Now"
   - [ ] Fill required fields
   - [ ] Add optional fields (resume URL, LinkedIn)
   - [ ] Submit application
   - [ ] Verify success message
   - [ ] Check confirmation email

4. **Admin Review**
   - [ ] View applications tab
   - [ ] Click "View Details" on application
   - [ ] Update status to "Reviewing"
   - [ ] Schedule interview date
   - [ ] Add internal notes
   - [ ] Save changes
   - [ ] Update status to "Hired"

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for email notifications
RESEND_API_KEY=re_xxxxx

# Database (already configured via Turso)
DATABASE_URL=...
DATABASE_AUTH_TOKEN=...
```

---

## 📦 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Turso (SQLite)
- **ORM:** Drizzle ORM
- **UI:** Shadcn/UI + Tailwind CSS
- **Icons:** Lucide React
- **Email:** Resend API
- **Deployment:** Vercel

---

## 🎯 Success Metrics

Track these KPIs in admin dashboard:
- Total active job postings
- Total applications received
- Applications per position
- Time-to-review average
- Hire conversion rate
- Most popular departments
- Application source tracking

---

## 🚧 Future Enhancements

### Phase 2 Ideas
- [ ] Applicant portal (check application status)
- [ ] Resume file upload integration
- [ ] Video interview scheduling (Calendly integration)
- [ ] Automated email campaigns (status updates)
- [ ] Application scoring/ranking system
- [ ] Referral tracking
- [ ] Job alerts/subscriptions
- [ ] Social media sharing
- [ ] Analytics dashboard
- [ ] Export applications to CSV
- [ ] Bulk status updates
- [ ] Email templates for different stages

---

## 📞 Support

**For Technical Issues:**
- Check terminal logs for API errors
- Verify database schema is up to date
- Ensure RESEND_API_KEY is configured
- Check browser console for frontend errors

**For Feature Requests:**
- Document desired functionality
- Include use case examples
- Submit to development team

---

## 📄 License & Credits

**Built for:** UCon Ministries
**Developed:** 2025
**Version:** 1.0.0

---

**🎉 The careers board system is now fully operational!**

Admins can post jobs, candidates can apply, and the hiring team can manage the entire pipeline from one comprehensive system.
