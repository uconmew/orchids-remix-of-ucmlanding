import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitBookings, convicts, notifications, user, overrideCodes, transitConstraints, transitSuspensions } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, or, isNull, sql } from 'drizzle-orm';
import { createErrorResponse, ERROR_CODES } from '@/lib/error-codes';

// Default transit operating parameters
const DEFAULT_START_TIME = "04:00"; // 4 AM
const DEFAULT_END_TIME = "22:00";   // 10 PM
const DEFAULT_CAPACITY = 20;

// Check if requested time is within open hours and not constrained
async function checkAvailability(requestedTime: Date): Promise<{ 
  isOpen: boolean; 
  openHours: { start: string; end: string }; 
  dayOfWeek: number;
  constraint?: any;
  availableCapacity: number;
}> {
  // Convert to Denver timezone (Mountain Time) for consistent business hours
  // Use Intl.DateTimeFormat for proper timezone conversion
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short'
  };
  
  const denverFormatter = new Intl.DateTimeFormat('en-US', options);
  const parts = denverFormatter.formatToParts(requestedTime);
  
  const dayPart = parts.find(p => p.type === 'weekday')?.value;
  const hourPart = parts.find(p => p.type === 'hour')?.value || '00';
  const minutePart = parts.find(p => p.type === 'minute')?.value || '00';
  const yearPart = parts.find(p => p.type === 'year')?.value;
  const monthPart = parts.find(p => p.type === 'month')?.value;
  const dayNumPart = parts.find(p => p.type === 'day')?.value;
  
  // Map weekday names to numbers
  const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  const dayOfWeek = dayMap[dayPart || 'Sun'] ?? new Date(requestedTime).getDay();
  
  const requestedHour = parseInt(hourPart, 10);
  const requestedMinutes = parseInt(minutePart, 10);
  const requestedTimeStr = `${hourPart}:${minutePart}`;
  const requestedDateStr = `${yearPart}-${monthPart}-${dayNumPart}`;

  // Check for constraints on this day/date
  const constraints = await db
    .select()
    .from(transitConstraints)
    .where(or(
      // Recurring day constraint
      eq(transitConstraints.dayOfWeek, dayOfWeek),
      // Specific date constraint
      eq(transitConstraints.specificDate, requestedDateStr)
    ));

  // Check if there's a "closed" or "unavailable" constraint for this day
  const closedConstraint = constraints.find(c => 
    (c.constraintType === 'closed' || c.constraintType === 'unavailable') &&
    (!c.startTime || (requestedTimeStr >= c.startTime && (!c.endTime || requestedTimeStr <= c.endTime)))
  );

  if (closedConstraint) {
    return {
      isOpen: false,
      openHours: { start: DEFAULT_START_TIME, end: DEFAULT_END_TIME },
      dayOfWeek,
      constraint: closedConstraint,
      availableCapacity: 0
    };
  }

  // Check if time is within default hours OR within adjusted hours from constraint
  const reducedHoursConstraint = constraints.find(c => c.constraintType === 'reduced_hours');
  const effectiveStart = reducedHoursConstraint?.startTime || DEFAULT_START_TIME;
  const effectiveEnd = reducedHoursConstraint?.endTime || DEFAULT_END_TIME;
  
  const isWithinHours = requestedTimeStr >= effectiveStart && requestedTimeStr <= effectiveEnd;

  // Calculate available capacity (only count APPROVED bookings)
  const startOfDay = new Date(requestedTime);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedTime);
  endOfDay.setHours(23, 59, 59, 999);

  const approvedBookingsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transitBookings)
    .where(and(
      eq(transitBookings.status, 'approved'),
      sql`${transitBookings.requestedTime}::timestamp >= ${startOfDay.toISOString()}::timestamp`,
      sql`${transitBookings.requestedTime}::timestamp <= ${endOfDay.toISOString()}::timestamp`
    ));

  const bookedCount = approvedBookingsCount[0]?.count || 0;
  const capacityConstraint = constraints.find(c => c.constraintType === 'reduced_capacity');
  const effectiveCapacity = capacityConstraint?.maxCapacity || DEFAULT_CAPACITY;
  const availableCapacity = effectiveCapacity - bookedCount;

  return {
    isOpen: isWithinHours,
    openHours: { start: effectiveStart, end: effectiveEnd },
    dayOfWeek,
    constraint: reducedHoursConstraint || capacityConstraint,
    availableCapacity
  };
}

// Format time to AM/PM
function formatTimeToAMPM(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await db
      .select({
        id: transitBookings.id,
        userId: transitBookings.userId,
        convictId: transitBookings.convictId,
        riderName: transitBookings.riderName,
        riderPhone: transitBookings.riderPhone,
        riderEmail: transitBookings.riderEmail,
        pickupLocation: transitBookings.pickupLocation,
        destination: transitBookings.destination,
        ridePurpose: transitBookings.ridePurpose,
        specialNeeds: transitBookings.specialNeeds,
        requestedTime: transitBookings.requestedTime,
        scheduledTime: transitBookings.scheduledTime,
        status: transitBookings.status,
        isHiddenFromUser: transitBookings.isHiddenFromUser,
        termsAccepted: transitBookings.termsAccepted,
        coComplianceAccepted: transitBookings.coComplianceAccepted,
        staffNotes: transitBookings.staffNotes,
        userNotes: transitBookings.userNotes,
        approvedBy: transitBookings.approvedBy,
        assignedDriverId: transitBookings.assignedDriverId,
        deniedReason: transitBookings.deniedReason,
        completedAt: transitBookings.completedAt,
        staffRequirements: transitBookings.staffRequirements,
        createdAt: transitBookings.createdAt,
        updatedAt: transitBookings.updatedAt,
        driverName: sql<string>`(SELECT name FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
        driverVehicle: sql<string>`(SELECT vehicle FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
        driverGender: sql<string>`(SELECT gender FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
        driverPhone: sql<string>`(SELECT phone FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
      })
      .from(transitBookings)
      .where(and(
        eq(transitBookings.userId, currentUser.id),
        eq(transitBookings.isHiddenFromUser, false)
      ))
      .orderBy(desc(transitBookings.createdAt));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching transit bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const currentUser = await getCurrentUser(request);
      if (!currentUser) {
        return NextResponse.json({ 
          ...createErrorResponse('A1001'),
          error: 'Please log in to request a ride'
        }, { status: 401 });
      }

      try {
        // 1. Check for 'loss' history
        const hasLossHistory = await db.select()
          .from(transitBookings)
          .where(and(eq(transitBookings.userId, currentUser.id), eq(transitBookings.status, 'loss')))
          .limit(1);

        if (hasLossHistory.length > 0) {
          return NextResponse.json({ 
            error: 'Transit privileges revoked due to prior loss of privilege status.',
            code: 'PRIVILEGE_REVOKED'
          }, { status: 403 });
        }

        // 2. Check for active suspension (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeSuspension = await db.select()
          .from(transitSuspensions)
          .where(and(
              eq(transitSuspensions.userId, currentUser.id),
              sql`${transitSuspensions.suspendedAt} > ${thirtyDaysAgo.toISOString()}`
          ))
          .limit(1);

        if (activeSuspension.length > 0) {
          return NextResponse.json({ 
            error: 'Your transit access is currently suspended. Suspensions last for 30 days.',
            code: 'ACCESS_SUSPENDED'
          }, { status: 403 });
        }

        const body = await request.json();
      const { 
        pickupLocation, 
        destination, 
        requestedTime, 
        ridePurpose,
        specialNeeds,
        termsAccepted,
        coComplianceAccepted,
        userNotes,
        riderPhone,
        overrideCode,
      } = body;

      if (!pickupLocation || !destination || !requestedTime) {
          return NextResponse.json({ 
            ...createErrorResponse('I1001', 'Pickup location, destination, and requested time are required'),
            error: 'Missing required fields: pickup location, destination, and requested time are required'
          }, { status: 400 });
        }

      // Enforce 24-hour rule
      const requestedDate = new Date(requestedTime);
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

      let bypassedWith24hRule = false;

      if (requestedDate < twentyFourHoursFromNow) {
          // Check if override code is provided
          if (overrideCode) {
            // ADMIN OVERRIDE: Code "1111" works only in development with unlimited uses
            const ADMIN_OVERRIDE_CODE = "1111";
            const isDevelopment = process.env.NODE_ENV === "development";
            
            if (isDevelopment && overrideCode === ADMIN_OVERRIDE_CODE) {
              // Admin override in development - unlimited uses, no database lookup
              bypassedWith24hRule = true;
            } else {
              // Normal override code flow - check database
              const validCode = await db
                .select()
                .from(overrideCodes)
                .where(and(
                  eq(overrideCodes.code, overrideCode),
                  eq(overrideCodes.isUsed, false)
                ))
                .limit(1);

              if (validCode.length === 0) {
                  return NextResponse.json({ 
                    ...createErrorResponse('O1002', 'The override code entered is invalid or has already been used'),
                    error: 'Invalid or already used override code.',
                    code: 'O1002'
                  }, { status: 400 });
                }

                // Check expiration
                if (validCode[0].expiresAt && new Date(validCode[0].expiresAt) < now) {
                  const expiredTime = new Date(validCode[0].expiresAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  });
                  return NextResponse.json({ 
                    ...createErrorResponse('O1003', `This override code expired at ${expiredTime}`),
                    error: `Override code expired at ${expiredTime}.`,
                    code: 'O1003',
                    expiredAt: expiredTime
                  }, { status: 400 });
                }

              // Mark code as used
              await db
                .update(overrideCodes)
                .set({
                  isUsed: true,
                  usedBy: currentUser.id,
                  usedAt: new Date().toISOString(),
                })
                .where(eq(overrideCodes.id, validCode[0].id));

              bypassedWith24hRule = true;
            }
          } else {
            return NextResponse.json({ 
              ...createErrorResponse('T1001', 'Transit requests must be booked at least 24 hours in advance'),
              error: 'Transit requests must be booked at least 24 hours in advance. Enter an override code to bypass this requirement.',
              code: 'T1001',
              requires24hOverride: true
            }, { status: 400 });
          }
        }

        // Check availability (hours and capacity) with new constraint system
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const availabilityCheck = await checkAvailability(requestedDate);
        
        if (!availabilityCheck.isOpen) {
          // Check if already has override code (bypass both 24h and open hours)
          if (!bypassedWith24hRule) {
            const startFormatted = formatTimeToAMPM(availabilityCheck.openHours.start);
            const endFormatted = formatTimeToAMPM(availabilityCheck.openHours.end);
            
            if (availabilityCheck.constraint?.reason) {
              return NextResponse.json({ 
                ...createErrorResponse('R1003', `Transit unavailable: ${availabilityCheck.constraint.reason}`),
                error: `Transit service is unavailable at this time: ${availabilityCheck.constraint.reason}. Enter an override code to book anyway.`,
                code: 'R1003',
                requiresOpenHoursOverride: true,
                constraint: availabilityCheck.constraint
              }, { status: 400 });
            }
            
            return NextResponse.json({ 
              ...createErrorResponse('R1002', `Transit service hours: ${startFormatted} - ${endFormatted} on ${dayNames[availabilityCheck.dayOfWeek]}`),
              error: `Transit service is only available ${startFormatted} - ${endFormatted} on ${dayNames[availabilityCheck.dayOfWeek]}. Enter an override code to book outside open hours.`,
              code: 'R1002',
              requiresOpenHoursOverride: true,
              openHours: {
                start: startFormatted,
                end: endFormatted,
                dayOfWeek: availabilityCheck.dayOfWeek,
                dayName: dayNames[availabilityCheck.dayOfWeek]
              }
            }, { status: 400 });
          }
          // If bypassed with code, allow it through
        }

        // Check capacity (only APPROVED bookings count against capacity)
        if (availabilityCheck.availableCapacity <= 0 && !bypassedWith24hRule) {
          return NextResponse.json({ 
            ...createErrorResponse('R1004', 'Transit capacity reached for this day'),
            error: 'Transit service has reached maximum capacity for this day. Enter an override code to book anyway.',
            code: 'R1004',
            requiresOpenHoursOverride: true,
            capacityFull: true
          }, { status: 400 });
        }
      
        if (!termsAccepted) {
          return NextResponse.json({ 
            ...createErrorResponse('I1006', 'Terms of service must be accepted'),
            error: 'You must accept the terms of service'
          }, { status: 400 });
        }
    
        if (!coComplianceAccepted) {
          return NextResponse.json({ 
            ...createErrorResponse('I1006', 'Colorado compliance must be acknowledged'),
            error: 'You must acknowledge Colorado compliance requirements'
          }, { status: 400 });
        }
    
        const convictRecord = await db
          .select()
          .from(convicts)
          .where(eq(convicts.userId, currentUser.id))
          .limit(1);
    
        const convictId = convictRecord.length > 0 ? convictRecord[0].id : null;
    
        const newBooking = await db.insert(transitBookings).values({
          userId: currentUser.id,
          convictId,
          riderName: currentUser.name, // Force from logged in user
          riderPhone: riderPhone || '',
          riderEmail: currentUser.email, // Force from logged in user
          pickupLocation,
          destination,
          ridePurpose: ridePurpose || 'general',
          specialNeeds: specialNeeds || '',
          requestedTime,
          termsAccepted: true,
          coComplianceAccepted: true,
          userNotes: userNotes || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning();
    
        await db.insert(notifications).values({
          userId: currentUser.id,
          title: 'Ride Request Submitted',
          message: `Your ride request has been successfully submitted. A transit staff member will review it and either approve or deny it based on availability.`,
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
    
        return NextResponse.json(newBooking[0]);
      } catch (error) {
      console.error('Error creating transit booking:', error);
      return NextResponse.json({ 
        ...createErrorResponse('S1001', 'Failed to create booking'),
        error: 'Failed to create booking' 
      }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(transitBookings)
      .where(and(
        eq(transitBookings.id, parseInt(bookingId)),
        eq(transitBookings.userId, currentUser.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Booking not found or not authorized' }, { status: 404 });
    }

    if (['completed', 'cancelled', 'denied', 'ineligible', 'loss'].includes(existing[0].status || '')) {
      return NextResponse.json({ error: `Cannot cancel booking with status: ${existing[0].status}` }, { status: 400 });
    }

    await db
      .update(transitBookings)
      .set({ 
        status: 'cancelled',
        isHiddenFromUser: true,
        updatedAt: new Date().toISOString()
      })
      .where(eq(transitBookings.id, parseInt(bookingId)));

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling transit booking:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, pickupLocation, destination, requestedTime, ridePurpose, specialNeeds, userNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(transitBookings)
      .where(and(
        eq(transitBookings.id, parseInt(id)),
        eq(transitBookings.userId, currentUser.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Booking not found or not authorized' }, { status: 404 });
    }

    if (existing[0].status !== 'pending' && existing[0].status !== 'approved' && existing[0].status !== 'more_info_needed') {
      return NextResponse.json({ error: 'Can only edit pending, approved, or more_info_needed bookings' }, { status: 400 });
    }

    // When user responds to a more_info_needed request, flip back to pending
    // so staff knows there is a new response to review
    if (existing[0].status === 'more_info_needed' && userNotes) {
      updateFields.status = 'pending';
      updateFields.staffRequirements = null; // clear the requirement — it's been addressed
    }

    // If changing time, re-enforce 24-hour rule
    if (requestedTime && existing[0].status === 'pending') {
      const requestedDate = new Date(requestedTime);
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      if (requestedDate < twentyFourHoursFromNow) {
        return NextResponse.json({ error: 'Transit requests must be booked at least 24 hours in advance.' }, { status: 400 });
      }
    }

    const { status: newStatus, ...otherFields } = body;

    const updated = await db
      .update(transitBookings)
      .set({
        pickupLocation: pickupLocation || existing[0].pickupLocation,
        destination: destination || existing[0].destination,
        requestedTime: requestedTime || existing[0].requestedTime,
        ridePurpose: ridePurpose || existing[0].ridePurpose,
        specialNeeds: specialNeeds || existing[0].specialNeeds,
        userNotes: userNotes || existing[0].userNotes,
        status: newStatus || existing[0].status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(transitBookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating transit booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
