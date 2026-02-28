import { pgTable, serial, text, integer, boolean, timestamp, varchar, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const prayers = pgTable('prayers', {
  id: serial('id').primaryKey(),
  name: text('name'),
  userId: text('user_id'), // Optional - for logged in users to edit their own prayers
  prayerRequest: text('prayer_request').notNull(),
  category: text('category').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  prayCount: integer('pray_count').default(0),
  isAnswered: boolean('is_answered').default(false),
  prayers: jsonb('prayers'),
  opReply: text('op_reply'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const chatConversations = pgTable('chat_conversations', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  message: text('message').notNull(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
});

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  author: text('author').notNull(),
  category: text('category').notNull(),
  featuredImageUrl: text('featured_image_url'),
  published: boolean('published').default(false),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  eventType: text('event_type').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  location: text('location'),
  maxAttendees: integer('max_attendees'),
  requiresAuth: boolean('requires_auth').default(false),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  userPhone: text('user_phone'),
  notes: text('notes'),
  status: text('status').notNull().default('confirmed'),
  registeredAt: text('registered_at').notNull(),
});

export const volunteerApplications = pgTable('volunteer_applications', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  availability: text('availability'),
  interests: jsonb('interests'),
  experience: text('experience'),
  whyVolunteer: text('why_volunteer').notNull(),
  backgroundCheckConsent: boolean('background_check_consent').default(false),
  status: text('status').notNull().default('pending'),
  submittedAt: text('submitted_at').notNull(),
  reviewedAt: text('reviewed_at'),
  notes: text('notes'),
});

export const volunteerStats = pgTable('volunteer_stats', {
  id: serial('id').primaryKey(),
  activeVolunteers: integer('active_volunteers').notNull().default(0),
  hoursDonated: integer('hours_donated').notNull().default(0),
  partnerChurches: integer('partner_churches').notNull().default(0),
  lastUpdated: text('last_updated').notNull(),
});

export const volunteerTimeEntries = pgTable('volunteer_time_entries', {
  id: serial('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull(),
  volunteerName: text('volunteer_name').notNull(),
  clockIn: text('clock_in').notNull(),
  clockOut: text('clock_out'),
  totalHours: integer('total_hours'),
  activityType: text('activity_type').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const workshops = pgTable('workshops', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  hostUserId: text('host_user_id').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  durationMinutes: integer('duration_minutes'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  status: text('status').notNull().default('scheduled'),
  meetingRoomId: text('meeting_room_id'),
  category: text('category'),
  programType: text('program_type').notNull().default('equip'),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const workshopRegistrations = pgTable('workshop_registrations', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull().references(() => user.id),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  status: text('status').notNull().default('registered'),
  notes: text('notes'),
  registeredAt: text('registered_at').notNull(),
  attendedAt: text('attended_at'),
});

export const workshopParticipants = pgTable('workshop_participants', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  peerId: text('peer_id'),
  isHost: boolean('is_host').default(false),
  isMuted: boolean('is_muted').default(false),
  isVideoOff: boolean('is_video_off').default(false),
  joinedAt: text('joined_at').notNull(),
  leftAt: text('left_at'),
  status: text('status').notNull().default('active'),
});

export const workshopTypes = pgTable('workshop_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  defaultMaxParticipants: integer('default_max_participants').default(10),
  defaultDuration: integer('default_duration').default(60),
  category: text('category'),
  createdAt: text('created_at').notNull(),
});

export const workshopRecurringPatterns = pgTable('workshop_recurring_patterns', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  frequency: text('frequency').notNull(),
  daysOfWeek: jsonb('days_of_week'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull(),
});

export const workshopFiles = pgTable('workshop_files', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  uploadedBy: text('uploaded_by').notNull().references(() => user.id),
  uploadedAt: text('uploaded_at').notNull(),
});

export const workshopChatMessages = pgTable('workshop_chat_messages', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull().references(() => user.id),
  message: text('message').notNull(),
  messageType: text('message_type').notNull().default('public'),
  recipientId: text('recipient_id').references(() => user.id),
  sentAt: text('sent_at').notNull(),
});

export const workshopPolls = pgTable('workshop_polls', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  question: text('question').notNull(),
  options: jsonb('options').notNull(),
  createdBy: text('created_by').notNull().references(() => user.id),
  createdAt: text('created_at').notNull(),
  endsAt: text('ends_at'),
  isActive: boolean('is_active').default(true),
});

export const workshopPollVotes = pgTable('workshop_poll_votes', {
  id: serial('id').primaryKey(),
  pollId: integer('poll_id').notNull().references(() => workshopPolls.id),
  userId: text('user_id').notNull().references(() => user.id),
  optionIndex: integer('option_index').notNull(),
  votedAt: text('voted_at').notNull(),
});

export const workshopQuestions = pgTable('workshop_questions', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull().references(() => user.id),
  question: text('question').notNull(),
  upvotes: integer('upvotes').default(0),
  isAnswered: boolean('is_answered').default(false),
  askedAt: text('asked_at').notNull(),
});

export const workshopReactions = pgTable('workshop_reactions', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull().references(() => user.id),
  reactionType: text('reaction_type').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
});

export const workshopRecordings = pgTable('workshop_recordings', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  recordingUrl: text('recording_url').notNull(),
  duration: integer('duration'),
  transcriptUrl: text('transcript_url'),
  createdAt: text('created_at').notNull(),
});

export const workshopTimeSlots = pgTable('workshop_time_slots', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  isAvailable: boolean('is_available').default(true),
  capacity: integer('capacity'),
  bookedCount: integer('booked_count').default(0),
  createdAt: text('created_at').notNull(),
});

export const workshopWhiteboardStrokes = pgTable('workshop_whiteboard_strokes', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull(),
  strokeData: jsonb('stroke_data').notNull(),
  createdAt: text('created_at').notNull(),
});

export const workshopWhiteboardShapes = pgTable('workshop_whiteboard_shapes', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  userId: text('user_id').notNull(),
  shapeType: text('shape_type').notNull(),
  shapeData: jsonb('shape_data').notNull(),
  createdAt: text('created_at').notNull(),
});

export const workshopBreakoutRooms = pgTable('workshop_breakout_rooms', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  roomName: text('room_name').notNull(),
  roomNumber: integer('room_number').notNull(),
  maxParticipants: integer('max_participants'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
});

export const workshopBreakoutAssignments = pgTable('workshop_breakout_assignments', {
  id: serial('id').primaryKey(),
  breakoutRoomId: integer('breakout_room_id').notNull().references(() => workshopBreakoutRooms.id),
  userId: text('user_id').notNull(),
  assignedAt: text('assigned_at').notNull(),
  leftAt: text('left_at'),
});

export const workshopVideos = pgTable('workshop_videos', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  title: text('title').notNull(),
  videoUrl: text('video_url').notNull(),
  durationSeconds: integer('duration_seconds'),
  uploadedBy: text('uploaded_by').notNull(),
  currentTime: integer('current_time').default(0),
  isPlaying: boolean('is_playing').default(false),
  uploadedAt: text('uploaded_at').notNull(),
});

export const ucmLevels = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  level: integer('level').notNull(),
  createdAt: text('created_at').notNull(),
});

export const roles = ucmLevels;

export const uconRoles = pgTable('ucon_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  ucmLevelId: integer('role_id').notNull().references(() => ucmLevels.id, { onDelete: 'cascade' }),
  staffTitle: text('staff_title'),
  permissionClearance: integer('permission_clearance').default(0),
  dutyClearance: integer('duty_clearance').default(0),
  assignedAt: text('assigned_at').notNull(),
  assignedBy: text('assigned_by').references(() => user.id),
  accessCode: text('access_code'),
  isAdmin: boolean('is_admin').default(false),
});

export const userRoles = uconRoles;

export const programWebPermissions = pgTable('program_web_permissions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  programTag: text('program_tag').notNull(), // e.g., 'transit', 'awaken'
  permissionKey: text('permission_key').notNull(), // e.g., 'transit:request_ride'
  isGranted: boolean('is_granted').default(true),
  grantedBy: text('granted_by').references(() => user.id),
  grantedAt: text('granted_at').notNull(),
  expiresAt: text('expires_at'),
});

export const ucmLevelPermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  ucmLevelId: integer('role_id').notNull().references(() => ucmLevels.id, { onDelete: 'cascade' }),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: text('created_at').notNull(),
});

export const rolePermissions = ucmLevelPermissions;

export const roleTags = pgTable('role_tags', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  tagCategory: text('tag_category').default('base_role'), // 'base_role', 'position', 'program'
  assignedAt: text('assigned_at').notNull(),
  assignedBy: text('assigned_by'),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phone: text("phone"),
  registrationNumber: text("registration_number").unique(),
  bio: text("bio"),
  expertise: jsonb("expertise"),
  linkedin: text("linkedin"),
  vehicle: text("vehicle"),
  gender: text("gender"),
  race: text("race"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
    ucmEmployeeNumber: text("ucm_employee_number").unique(), // Format: UCMYYRRRR (e.g., UCM260001)
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zipCode: text("zip_code"),
    department: text("department"),
    ministryPhone: text("ministry_phone"),
    hasDevice: boolean("has_device").default(false),
    compensationType: text("compensation_type"),
    backgroundCheckDate: text("background_check_date"),
    referencesInfo: jsonb("references_info"),
    enrollmentDate: text("enrollment_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  });

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  requiresPasswordChange: boolean("requires_password_change").default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const convicts = pgTable('convicts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  convictType: text('convict_type').notNull(),
  convictRole: text('convict_role'),
  status: text('status').notNull().default('active'),
  interests: jsonb('interests'),
  notes: text('notes'),
  clearanceLevel: integer('clearance_level').default(0),
  dutyClearance: integer('duty_clearance').default(0),
  joinedAt: text('joined_at').notNull(),
  lastActivityAt: text('last_activity_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const workshopCategories = pgTable('workshop_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  skills: jsonb('skills'),
  programType: text('program_type').notNull().default('equip'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  upcomingDate: text('upcoming_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const awakenStudies = pgTable('awaken_studies', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description').notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  targetAudience: text('target_audience'),
  programType: text('program_type').notNull().default('awaken'),
  isRecurring: boolean('is_recurring').default(true),
  isActive: boolean('is_active').default(true),
  upcomingDate: text('upcoming_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const individualPermissions = pgTable('individual_permissions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  isGranted: boolean('is_granted').default(true),
  grantedBy: text('granted_by').references(() => user.id),
  grantedAt: text('granted_at').notNull(),
  expiresAt: text('expires_at'),
});

export const convictPermissions = pgTable('convict_permissions', {
  id: serial('id').primaryKey(),
  convictId: integer('convict_id').notNull().references(() => convicts.id, { onDelete: 'cascade' }),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  isGranted: boolean('is_granted').default(true),
  grantedBy: text('granted_by').references(() => user.id),
  grantedAt: text('granted_at').notNull(),
  expiresAt: text('expires_at'),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  status: text('status').notNull().default('active'),
  subscribedAt: text('subscribed_at').notNull(),
  unsubscribedAt: text('unsubscribed_at'),
  source: text('source').default('homepage_modal'),
  tags: jsonb('tags'),
  lastEmailSent: text('last_email_sent'),
  emailsSent: integer('emails_sent').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const stripeCustomers = pgTable('stripe_customers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  donorEmail: text('donor_email').notNull(),
  donorName: text('donor_name'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  donationType: text('donation_type').notNull(),
  tier: text('tier'),
  status: text('status').notNull().default('pending'),
  isAnonymous: boolean('is_anonymous').default(false),
  message: text('message'),
  taxReceiptSent: boolean('tax_receipt_sent').default(false),
  taxReceiptUrl: text('tax_receipt_url'),
  metadata: jsonb('metadata'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const donationSubscriptions = pgTable('donation_subscriptions', {
  id: serial('id').primaryKey(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  donorEmail: text('donor_email').notNull(),
  donorName: text('donor_name'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  interval: text('interval').notNull(),
  tier: text('tier'),
  status: text('status').notNull().default('active'),
  isAnonymous: boolean('is_anonymous').default(false),
  currentPeriodStart: text('current_period_start'),
  currentPeriodEnd: text('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: text('canceled_at'),
  metadata: jsonb('metadata'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const jobPostings = pgTable('job_postings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  department: text('department').notNull(),
  location: text('location').notNull(),
  employmentType: text('employment_type').notNull(),
  salaryRange: text('salary_range'),
  description: text('description').notNull(),
  responsibilities: jsonb('responsibilities').notNull(),
  qualifications: jsonb('qualifications').notNull(),
  benefits: jsonb('benefits'),
  applicationDeadline: text('application_deadline'),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  viewCount: integer('view_count').default(0),
  applicationCount: integer('application_count').default(0),
  postedBy: text('posted_by').references(() => user.id),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const partnerOrganizations = pgTable('partner_organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  partnershipType: text('partnership_type'),
  servicesProvided: jsonb('services_provided'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  partnershipStartDate: text('partnership_start_date'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobPostingId: integer('job_posting_id').notNull().references(() => jobPostings.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  resumeUrl: text('resume_url'),
  coverLetter: text('cover_letter'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),
  yearsOfExperience: integer('years_of_experience'),
  currentEmployer: text('current_employer'),
  expectedSalary: text('expected_salary'),
  availableStartDate: text('available_start_date'),
  howDidYouHear: text('how_did_you_hear'),
  whyInterested: text('why_interested').notNull(),
  additionalInfo: text('additional_info'),
  status: text('status').notNull().default('submitted'),
  reviewedBy: text('reviewed_by').references(() => user.id),
  reviewedAt: text('reviewed_at'),
  interviewDate: text('interview_date'),
  notes: text('notes'),
  submittedAt: text('submitted_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  image: text('image'),
  quote: text('quote').notNull(),
  badge: text('badge'),
  rating: integer('rating').default(5),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const outreachServiceStats = pgTable('outreach_service_stats', {
  id: serial('id').primaryKey(),
  serviceId: text('service_id').notNull().unique(),
  stat1Label: text('stat1_label').notNull(),
  stat1Value: integer('stat1_value').notNull().default(0),
  stat2Label: text('stat2_label').notNull(),
  stat2Value: integer('stat2_value').notNull().default(0),
  stat3Label: text('stat3_label').notNull(),
  stat3Value: integer('stat3_value').notNull().default(0),
  stat4Label: text('stat4_label').notNull(),
  stat4Value: integer('stat4_value').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const transitActivityLog = pgTable('transit_activity_log', {
  id: serial('id').primaryKey(),
  driverId: text('driver_id').references(() => user.id),
  driverName: text('driver_name').notNull(),
  recipientName: text('recipient_name').notNull(),
  rideType: text('ride_type').notNull(),
  pickupLocation: text('pickup_location'),
  dropoffLocation: text('dropoff_location'),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const nourishActivityLog = pgTable('nourish_activity_log', {
  id: serial('id').primaryKey(),
  volunteerId: text('volunteer_id').references(() => user.id),
  volunteerName: text('volunteer_name').notNull(),
  distributionType: text('distribution_type').notNull(),
  familiesServed: integer('families_served').notNull().default(1),
  mealsDistributed: integer('meals_distributed').notNull().default(0),
  poundsDistributed: integer('pounds_distributed').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const neighborsActivityLog = pgTable('neighbors_activity_log', {
  id: serial('id').primaryKey(),
  organizerId: text('organizer_id').references(() => user.id),
  organizerName: text('organizer_name').notNull(),
  eventType: text('event_type').notNull(),
  eventName: text('event_name').notNull(),
  volunteersEngaged: integer('volunteers_engaged').notNull().default(1),
  peopleReached: integer('people_reached').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const voiceActivityLog = pgTable('voice_activity_log', {
  id: serial('id').primaryKey(),
  advocateId: text('advocate_id').references(() => user.id),
  advocateName: text('advocate_name').notNull(),
  advocacyType: text('advocacy_type').notNull(),
  caseName: text('case_name'),
  rightsProtected: integer('rights_protected').notNull().default(0),
  meetingsHeld: integer('meetings_held').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const havenActivityLog = pgTable('haven_activity_log', {
  id: serial('id').primaryKey(),
  staffId: text('staff_id').references(() => user.id),
  staffName: text('staff_name').notNull(),
  assistanceType: text('assistance_type').notNull(),
  recipientName: text('recipient_name').notNull(),
  shelteredCount: integer('sheltered_count').notNull().default(0),
  housedPermanently: integer('housed_permanently').notNull().default(0),
  vouchersSecured: integer('vouchers_secured').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const stepsActivityLog = pgTable('steps_activity_log', {
  id: serial('id').primaryKey(),
  staffId: text('staff_id').references(() => user.id),
  staffName: text('staff_name').notNull(),
  supportType: text('support_type').notNull(),
  recipientName: text('recipient_name'),
  crisisCalls: integer('crisis_calls').notNull().default(0),
  rehabPlacements: integer('rehab_placements').notNull().default(0),
  recoverySupportSessions: integer('recovery_support_sessions').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const equipActivityLog = pgTable('equip_activity_log', {
  id: serial('id').primaryKey(),
  facilitatorId: text('facilitator_id').references(() => user.id),
  facilitatorName: text('facilitator_name').notNull(),
  workshopType: text('workshop_type').notNull(),
  workshopName: text('workshop_name').notNull(),
  participantsCount: integer('participants_count').notNull().default(0),
  skillsTaught: integer('skills_taught').notNull().default(1),
  jobPlacements: integer('job_placements').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const awakenActivityLog = pgTable('awaken_activity_log', {
  id: serial('id').primaryKey(),
  leaderId: text('leader_id').references(() => user.id),
  leaderName: text('leader_name').notNull(),
  studyType: text('study_type').notNull(),
  studyName: text('study_name').notNull(),
  participantsCount: integer('participants_count').notNull().default(0),
  topicsCovered: integer('topics_covered').notNull().default(1),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const shepherdActivityLog = pgTable('shepherd_activity_log', {
  id: serial('id').primaryKey(),
  counselorId: text('counselor_id').references(() => user.id),
  counselorName: text('counselor_name').notNull(),
  careType: text('care_type').notNull(),
  recipientName: text('recipient_name'),
  counselingSessions: integer('counseling_sessions').notNull().default(0),
  prayerRequests: integer('prayer_requests').notNull().default(0),
  crisisCalls: integer('crisis_calls').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const bridgeActivityLog = pgTable('bridge_activity_log', {
  id: serial('id').primaryKey(),
  mentorId: text('mentor_id').references(() => user.id),
  mentorName: text('mentor_name').notNull(),
  mentorshipType: text('mentorship_type').notNull(),
  menteeName: text('mentee_name'),
  menteesCount: integer('mentees_count').notNull().default(0),
  supportGroupSessions: integer('support_group_sessions').notNull().default(0),
  hoursServed: integer('hours_served').notNull().default(1),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const transitBookings = pgTable('transit_bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  convictId: integer('convict_id').references(() => convicts.id),
  riderName: text('rider_name'),
  riderPhone: text('rider_phone'),
  riderEmail: text('rider_email'),
  pickupLocation: text('pickup_location').notNull(),
  destination: text('destination').notNull(),
  ridePurpose: text('ride_purpose'),
  specialNeeds: text('special_needs'),
  requestedTime: text('requested_time').notNull(),
  scheduledTime: text('scheduled_time'),
  status: text('status').notNull().default('pending'),
  isHiddenFromUser: boolean('is_hidden_from_user').default(false),
  termsAccepted: boolean('terms_accepted').default(false),
  coComplianceAccepted: boolean('co_compliance_accepted').default(false),
  staffNotes: text('staff_notes'),
  userNotes: text('user_notes'),
  approvedBy: text('approved_by').references(() => user.id),
  assignedDriverId: text('assigned_driver_id').references(() => user.id),
  deniedReason: text('denied_reason'),
  completedAt: text('completed_at'),
  staffRequirements: text('staff_requirements'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const outreachRegistrations = pgTable('outreach_registrations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  convictId: integer('convict_id').references(() => convicts.id),
  serviceId: text('service_id').notNull(),
  registrantName: text('registrant_name'),
  registrantEmail: text('registrant_email'),
  registrantPhone: text('registrant_phone'),
  status: text('status').notNull().default('pending'),
  termsAccepted: boolean('terms_accepted').default(false),
  coComplianceAccepted: boolean('co_compliance_accepted').default(false),
  additionalInfo: jsonb('additional_info'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const transitAvailability = pgTable('transit_availability', {
  id: serial('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  maxCapacity: integer('max_capacity').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Comprehensive availability table for all outreach services
export const outreachAvailability = pgTable('outreach_availability', {
  id: serial('id').primaryKey(),
  serviceType: text('service_type').notNull(), // 'transit', 'nourish', 'haven', 'neighbors', 'voice', 'steps'
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: text('start_time').notNull(), // HH:mm format (24h)
  endTime: text('end_time').notNull(), // HH:mm format (24h)
  maxCapacity: integer('max_capacity').default(10),
  isActive: boolean('is_active').default(true),
  requiresOverrideOutsideHours: boolean('requires_override_outside_hours').default(true),
  notes: text('notes'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'),
  isRead: boolean('is_read').default(false),
  createdAt: text('created_at').notNull(),
});

export const overrideCodes = pgTable('override_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 4 }).notNull().unique(),
  generatedBy: text('generated_by').notNull().references(() => user.id),
  generatedByStaffNumber: text('generated_by_staff_number'), // UCM Staff registration number
  usedBy: text('used_by').references(() => user.id),
  usedAt: text('used_at'),
  isUsed: boolean('is_used').default(false),
  expiresAt: text('expires_at'),
  purpose: text('purpose').default('transit_24h_bypass'),
  createdAt: text('created_at').notNull(),
});

// User saved addresses for quick selection in forms
export const userAddresses = pgTable('user_addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // e.g., "Home", "Work", "Doctor's Office"
  streetNumber: text('street_number').notNull(),
  streetName: text('street_name').notNull(),
  unit: text('unit'), // Apt, Suite, etc.
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  fullAddress: text('full_address').notNull(), // Formatted complete address
  isVerified: boolean('is_verified').default(false),
  isDefault: boolean('is_default').default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// User Alerts - Site-wide alert system
export const userAlerts = pgTable('user_alerts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'more_info_needed', 'booking_approved', 'booking_denied', 'system', 'workshop', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'), // URL to redirect when user clicks the alert
  actionLabel: text('action_label'), // Button text for action
  referenceId: text('reference_id'), // ID of related entity (booking ID, workshop ID, etc.)
  referenceType: text('reference_type'), // 'transit_booking', 'workshop', 'donation', etc.
  priority: text('priority').default('normal'), // 'low', 'normal', 'high', 'urgent'
  isRead: boolean('is_read').default(false),
  isDismissed: boolean('is_dismissed').default(false),
  metadata: jsonb('metadata'), // Additional data like staffRequirements, etc.
  expiresAt: text('expires_at'), // Optional expiration for time-sensitive alerts
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Transit Constraints - Exceptions to default 4am-10pm operating hours
// Default: Transit operates daily 4am-10pm with capacity 20
// This table stores ONLY constraints/exceptions that restrict the default
export const transitConstraints = pgTable('transit_constraints', {
  id: serial('id').primaryKey(),
  constraintType: text('constraint_type').notNull(), // 'unavailable', 'reduced_hours', 'reduced_capacity', 'closed'
  dayOfWeek: integer('day_of_week'), // null = specific date only, 0-6 = recurring day constraint
  specificDate: text('specific_date'), // ISO date string for one-time constraints (e.g., holidays)
  startTime: text('start_time'), // null = constraint applies all day
  endTime: text('end_time'),
  maxCapacity: integer('max_capacity'), // override capacity for this period (null = use default 20)
  reason: text('reason'), // e.g., "Holiday", "Staff shortage", "Maintenance"
  requiresOverride: boolean('requires_override').default(true), // Can be bypassed with override code
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Sitewide Audit Logs - Logs ALL production activity (excluding errors)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(), // 'transit', 'bookings', 'users', 'donations', 'workshops', 'admin', 'auth', 'outreach', 'override_codes', 'settings', 'roles', 'permissions'
  action: text('action').notNull(), // 'create', 'update', 'delete', 'view', 'approve', 'deny', 'login', 'logout', 'generate', 'use', etc.
  entityType: text('entity_type'), // 'transit_booking', 'user', 'donation', 'workshop', 'override_code', etc.
  entityId: text('entity_id'), // ID of the affected entity
  userId: text('user_id').references(() => user.id), // Who performed the action (null for system actions)
  userEmail: text('user_email'), // Denormalized for quick lookup
  userName: text('user_name'), // Denormalized for quick lookup
  staffRegistrationNumber: text('staff_registration_number'), // UCM Staff number if applicable
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  details: jsonb('details'), // Additional context (old values, new values, metadata)
  metadata: jsonb('metadata'), // Request metadata, headers, etc.
  createdAt: text('created_at').notNull(),
});

export const convictGroups = pgTable('convict_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  groupType: text('group_type').notNull().default('study'),
  maxMembers: integer('max_members'),
  isActive: boolean('is_active').default(true),
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const convictGroupMembers = pgTable('convict_group_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => convictGroups.id, { onDelete: 'cascade' }),
  convictId: integer('convict_id').notNull().references(() => convicts.id, { onDelete: 'cascade' }),
  role: text('role').default('member'),
  joinedAt: text('joined_at').notNull(),
  notes: text('notes'),
});

export const bookRequests = pgTable('book_requests', {
  id: serial('id').primaryKey(),
  convictId: integer('convict_id').notNull().references(() => convicts.id, { onDelete: 'cascade' }),
  requestedBy: text('requested_by').references(() => user.id),
  bookTitle: text('book_title').notNull(),
  bookAuthor: text('book_author'),
  resourceType: text('resource_type').notNull().default('book'),
  reason: text('reason'),
  status: text('status').notNull().default('pending'),
  fulfilledAt: text('fulfilled_at'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Sensitive Change Requests - For staff profile changes requiring dual authorization
export const sensitiveChangeRequests = pgTable('sensitive_change_requests', {
  id: serial('id').primaryKey(),
  requestType: text('request_type').notNull(), // 'password_reset', 'email_change', 'profile_update', 'audit_delete', 'role_change', 'credential_change'
  requesterId: text('requester_id').notNull().references(() => user.id),
  requesterStaffNumber: text('requester_staff_number'), // UCM-YYYY-##### format
  targetUserId: text('target_user_id').references(() => user.id),
  targetEntityType: text('target_entity_type'), // 'user', 'audit_log', 'staff_profile', 'role'
  targetEntityId: text('target_entity_id'),
  changeDetails: jsonb('change_details').notNull(), // What changes are being requested
  approverStaffNumber: text('approver_staff_number').notNull(), // UCM-YYYY-##### format of requested approver
  approverId: text('approver_id').references(() => user.id), // Populated when approver is identified
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'denied', 'expired'
  approvedAt: text('approved_at'),
  deniedAt: text('denied_at'),
  denialReason: text('denial_reason'),
  expiresAt: text('expires_at').notNull(), // 30 minutes from creation
  createdAt: text('created_at').notNull(),
});

// Role tag constants for easy reference
export const ROLE_TAGS = {
  DIRECTOR: 'director',       // Level 1-2, can approve audit-level changes
  COORDINATOR: 'coordinator', // Level 3
  EXECUTIVE: 'executive',     // Level 1, highest approval authority
  MENTOR: 'mentor',           // Assigned to mentors
  VOLUNTEER: 'volunteer',     // Assigned to volunteers
  FACILITATOR: 'facilitator', // Assigned to workshop facilitators
  ADMIN: 'admin',             // System admin
  STAFF: 'staff',             // General staff
  CONVICT: 'convict',         // Community member/participant
  
  // NEW POSITION TAGS
  COUNSELOR: 'counselor',
  CHAPLAIN: 'chaplain',
  GREETER: 'greeter',
  PRAYER_PARTNER: 'prayer_partner',
  SMALL_GROUP_LEADER: 'small_group_leader',
  SPONSOR: 'sponsor',
  DRIVER: 'driver',
  
  // NEW PROGRAM TAGS
  AWAKEN: 'awaken',
  TRANSIT: 'transit',
  NOURISH: 'nourish',
  HAVEN: 'haven',
  VOICE: 'voice',
  NEIGHBORS: 'neighbors',
  STEPS: 'steps',
  SHEPHERD: 'shepherd',
  EQUIP: 'equip',
  BRIDGE: 'bridge',
} as const;

// Sensitive change types that require approval
export const SENSITIVE_CHANGE_TYPES = {
  PASSWORD_RESET: 'password_reset',
  EMAIL_CHANGE: 'email_change',
  PROFILE_UPDATE: 'profile_update',
  AUDIT_DELETE: 'audit_delete',
  ROLE_CHANGE: 'role_change',
  CREDENTIAL_CHANGE: 'credential_change',
  STAFF_NAME_CHANGE: 'staff_name_change',
  OPERATIONAL_CHANGE: 'operational_change',
  PAC_CHANGE: 'pac_change', // PAC changes require 2-person approval, staff cannot change their own PAC
} as const;

// PAC change rules:
// - All staff members receive a permanent PAC during account creation
// - PAC changes require 2-person approval (dual authorization)
// - Staff cannot change their own PAC
// - Only Level 1 (Executive) can access PAC management tools

// Program Tags - 10 program-specific tags for web service access control
export const programTags = pgTable('program_tags', {
  id: serial('id').primaryKey(),
  tagId: text('tag_id').notNull().unique(), // e.g., "web:transit", "inperson:nourish"
  name: text('name').notNull(), // e.g., "UCON TRANSIT"
  track: text('track').notNull(), // "outreach" | "open_services"
  tagType: text('tag_type').notNull().default('web'), // "web" | "inperson"
  description: text('description'),
  isActive: boolean('is_active').default(true),
  publicAccess: boolean('public_access').default(false), // For AWAKEN public features
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Program Permissions - defines permissions available per program tag
export const programPermissions = pgTable('program_permissions', {
  id: serial('id').primaryKey(),
  programTagId: text('program_tag_id').notNull(), // References programTags.tagId
  permissionKey: text('permission_key').notNull(), // e.g., "transit:request_ride"
  displayName: text('display_name').notNull(),
  description: text('description'),
  baseRole: text('base_role').notNull(), // "convict" | "volunteer" | "staff"
  minClearance: integer('min_clearance').default(0),
  requiredDuty: text('required_duty'), // NULL if no specific duty needed
  apiEndpoint: text('api_endpoint'), // Associated API endpoint
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
});

// User Program Tags - assigns program tags to users
export const userProgramTags = pgTable('user_program_tags', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  programTagId: text('program_tag_id').notNull(), // References programTags.tagId
  assignedAt: text('assigned_at').notNull(),
  assignedBy: text('assigned_by').references(() => user.id),
  expiresAt: text('expires_at'), // NULL = permanent
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
});

// User Program Duties - specific roles within programs
export const userProgramDuties = pgTable('user_program_duties', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  programTagId: text('program_tag_id').notNull(), // References programTags.tagId
  dutyKey: text('duty_key').notNull(), // e.g., "driver", "facilitator"
  assignedAt: text('assigned_at').notNull(),
  assignedBy: text('assigned_by').references(() => user.id),
  expiresAt: text('expires_at'),
  isActive: boolean('is_active').default(true),
});

// In-Person Activity Logs - for analytics, audits, metrics (soft tracking)
export const inPersonActivityLogs = pgTable('in_person_activity_logs', {
  id: serial('id').primaryKey(),
  staffUserId: text('staff_user_id').notNull().references(() => user.id),
  staffName: text('staff_name').notNull(),
  programTag: text('program_tag').notNull(), // e.g., "inperson:transit"
  activityType: text('activity_type').notNull(), // e.g., "ride_completed", "meal_served"
  activityDate: text('activity_date').notNull(),
  participantId: text('participant_id'), // Can be null for anonymous
  participantName: text('participant_name'),
  isAnonymous: boolean('is_anonymous').default(false),
  quantityServed: integer('quantity_served').default(1),
  hoursSpent: text('hours_spent'), // Stored as text to avoid decimal issues
  milesDriven: text('miles_driven'),
  location: text('location'),
  notes: text('notes'),
  outcome: text('outcome'), // "completed", "referred", "ongoing"
  volunteerIds: jsonb('volunteer_ids'), // Array of volunteer user IDs
  volunteerCount: integer('volunteer_count').default(0),
  logMethod: text('log_method').notNull().default('electronic'), // "electronic" | "paper_transcribed"
  paperFormId: text('paper_form_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Password change history - tracks password resets for 1/month limit
export const passwordChangeHistory = pgTable('password_change_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  changeType: text('change_type').notNull().default('self_reset'), // 'self_reset', 'admin_reset', 'approved_reset'
  changedAt: text('changed_at').notNull(),
  changedBy: text('changed_by').references(() => user.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

// Address verification/correction error codes in errors
export const ADDRESS_ERRORS = {
  MISSING_STREET_NUMBER: 'L0001',
  MISSING_STREET_NAME: 'L0002',
  MISSING_CITY: 'L0003',
  MISSING_STATE: 'L0004',
  MISSING_ZIP: 'L0005',
  INVALID_ZIP_FORMAT: 'L0006',
  ADDRESS_NOT_FOUND: 'L0007',
  MULTIPLE_MATCHES: 'L0008',
} as const;


// ─── Site Settings ──────────────────────────────────────────────────────────
// Admin-controlled key/value config. Powers maintenance mode + future toggles.
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedBy: text('updated_by').references(() => user.id),
  updatedAt: text('updated_at').notNull(),
});
