import { db } from '@/db';
import { userAlerts } from '@/db/schema';

export type AlertType = 
  | 'more_info_needed'
  | 'booking_approved'
  | 'booking_denied'
  | 'booking_cancelled'
  | 'workshop_reminder'
  | 'workshop_cancelled'
  | 'donation_received'
  | 'system'
  | 'welcome'
  | 'account'
  | 'custom';

export type AlertPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CreateAlertParams {
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  referenceId?: string;
  referenceType?: string;
  priority?: AlertPriority;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export async function createAlert(params: CreateAlertParams) {
  const {
    userId,
    type,
    title,
    message,
    actionUrl,
    actionLabel,
    referenceId,
    referenceType,
    priority = 'normal',
    metadata,
    expiresAt,
  } = params;

  const now = new Date().toISOString();

  try {
    const newAlert = await db.insert(userAlerts).values({
      userId,
      type,
      title,
      message,
      actionUrl,
      actionLabel,
      referenceId,
      referenceType,
      priority,
      metadata: metadata ? metadata : null,
      expiresAt,
      isRead: false,
      isDismissed: false,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return newAlert[0];
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

export async function createMoreInfoNeededAlert(
  userId: string,
  bookingId: number,
  staffRequirements: string
) {
  return createAlert({
    userId,
    type: 'more_info_needed',
    title: 'Action Required: Additional Information Needed',
    message: `Staff has requested additional information for your ride request. Please review and provide the requested details.`,
    actionUrl: '/convict-portal',
    actionLabel: 'Provide Information',
    referenceId: String(bookingId),
    referenceType: 'transit_booking',
    priority: 'high',
    metadata: { staffRequirements },
  });
}

export async function createBookingApprovedAlert(
  userId: string,
  bookingId: number,
  scheduledTime: string
) {
  return createAlert({
    userId,
    type: 'booking_approved',
    title: 'Ride Request Approved',
    message: `Your ride request has been approved for ${new Date(scheduledTime).toLocaleString()}.`,
    actionUrl: '/convict-portal',
    actionLabel: 'View Details',
    referenceId: String(bookingId),
    referenceType: 'transit_booking',
    priority: 'normal',
  });
}

export async function createBookingDeniedAlert(
  userId: string,
  bookingId: number,
  reason?: string
) {
  return createAlert({
    userId,
    type: 'booking_denied',
    title: 'Ride Request Denied',
    message: reason 
      ? `Your ride request was denied. Reason: ${reason}` 
      : 'Your ride request was denied. Please contact staff for more information.',
    actionUrl: '/convict-portal',
    actionLabel: 'View Details',
    referenceId: String(bookingId),
    referenceType: 'transit_booking',
    priority: 'normal',
  });
}

export async function createWorkshopReminderAlert(
  userId: string,
  workshopId: number,
  workshopTitle: string,
  startTime: string
) {
  return createAlert({
    userId,
    type: 'workshop_reminder',
    title: `Workshop Reminder: ${workshopTitle}`,
    message: `Your workshop "${workshopTitle}" starts at ${new Date(startTime).toLocaleString()}.`,
    actionUrl: `/workshops/${workshopId}`,
    actionLabel: 'Join Workshop',
    referenceId: String(workshopId),
    referenceType: 'workshop',
    priority: 'high',
    expiresAt: startTime,
  });
}

export async function createSystemAlert(
  userId: string,
  title: string,
  message: string,
  priority: AlertPriority = 'normal'
) {
  return createAlert({
    userId,
    type: 'system',
    title,
    message,
    priority,
  });
}

export async function createWelcomeAlert(userId: string, userName: string) {
  return createAlert({
    userId,
    type: 'welcome',
    title: 'Welcome to Ucon Ministries!',
    message: `Welcome, ${userName}! We're so glad you've joined our community. Explore our services and let us know how we can support your journey.`,
    actionUrl: '/services',
    actionLabel: 'Explore Services',
    priority: 'normal',
  });
}
