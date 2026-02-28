import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitBookings, user, notifications, convicts, transitActivityLog } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';
import { createMoreInfoNeededAlert, createBookingApprovedAlert, createBookingDeniedAlert } from '@/lib/alerts';

const TERMINAL_STATUSES = ['denied', 'ineligible', 'suspended', 'canceled', 'cancelled', 'complete', 'completed'];

async function isStaffUser(userId: string) {
  const staffRole = await db.query.userRoles.findFirst({
    where: (roles, { eq }) => eq(roles.userId, userId)
  });
  return !!staffRole;
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const search = searchParams.get('search');
  
      let query = db
        .select({
          id: transitBookings.id,
          userId: transitBookings.userId,
          convictId: transitBookings.convictId,
          userName: user.name,
          userEmail: user.email,
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
          termsAccepted: transitBookings.termsAccepted,
          coComplianceAccepted: transitBookings.coComplianceAccepted,
          userNotes: transitBookings.userNotes,
            staffNotes: transitBookings.staffNotes,
            staffRequirements: transitBookings.staffRequirements,
            deniedReason: transitBookings.deniedReason,
          approvedBy: transitBookings.approvedBy,
          assignedDriverId: transitBookings.assignedDriverId,
          completedAt: transitBookings.completedAt,
          createdAt: transitBookings.createdAt,
          updatedAt: transitBookings.updatedAt,
          driverName: sql<string>`(SELECT name FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
          driverVehicle: sql<string>`(SELECT vehicle FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
          driverGender: sql<string>`(SELECT gender FROM "user" WHERE id = ${transitBookings.assignedDriverId})`,
        })
        .from(transitBookings)
        .innerJoin(user, eq(transitBookings.userId, user.id))
        .orderBy(desc(transitBookings.createdAt));

    let bookings = await query;

    if (status && status !== 'all') {
      bookings = bookings.filter(b => b.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(b => 
        b.userName?.toLowerCase().includes(searchLower) ||
        b.riderName?.toLowerCase().includes(searchLower) ||
        b.pickupLocation?.toLowerCase().includes(searchLower) ||
        b.destination?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching all transit bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const body = await request.json();
      const { id, status, staffNotes, deniedReason, scheduledTime, assignedDriverId, staffRequirements } = body;

      if (!id) {
        return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (status) updateData.status = status;
      if (staffNotes !== undefined) updateData.staffNotes = staffNotes;
      if (deniedReason !== undefined) updateData.deniedReason = deniedReason;
      if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
      if (assignedDriverId !== undefined) updateData.assignedDriverId = assignedDriverId;
      if (staffRequirements !== undefined) updateData.staffRequirements = staffRequirements;
    
    if (status === 'approved') {
      updateData.approvedBy = currentUser.id;
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date().toISOString();
    }

    const updatedBooking = await db
      .update(transitBookings)
      .set(updateData)
      .where(eq(transitBookings.id, id))
      .returning();

      if (updatedBooking.length > 0) {
        const booking = updatedBooking[0];
        let title = '';
        let message = '';
        let type: 'success' | 'error' | 'info' = 'info';

          switch (status) {
            case 'approved':
              title = 'Ride Request Approved!';
              message = `Great news! Your ride from ${booking.pickupLocation} to ${booking.destination} has been approved.${scheduledTime ? ` Scheduled for: ${new Date(scheduledTime).toLocaleString()}` : ''}`;
              type = 'success';
              try {
                await createBookingApprovedAlert(booking.userId, booking.id, scheduledTime || booking.requestedTime);
              } catch (alertError) {
                console.error('Error creating booking approved alert:', alertError);
              }
              break;
            case 'denied':
              title = 'Ride Request Denied';
              message = `We're sorry, your ride request has been denied.${deniedReason ? ` Reason: ${deniedReason}` : ''} Please contact us if you have questions.`;
              type = 'error';
              try {
                await createBookingDeniedAlert(booking.userId, booking.id, deniedReason);
              } catch (alertError) {
                console.error('Error creating booking denied alert:', alertError);
              }
              break;
            case 'more_info_needed':
              title = 'Additional Information Needed';
              message = `Staff has requested additional information for your ride request.${staffRequirements ? ` Requirements: ${staffRequirements}` : ''} Please update your request.`;
              type = 'info';
              try {
                await createMoreInfoNeededAlert(booking.userId, booking.id, staffRequirements || 'Please provide additional details.');
              } catch (alertError) {
                console.error('Error creating more info needed alert:', alertError);
              }
              break;
            case 'in_progress':
              title = 'Your Ride is In Progress';
              message = `Your driver is on the way! Ride from ${booking.pickupLocation} to ${booking.destination}.`;
              type = 'info';
              break;
            case 'completed':
            case 'complete':
              title = 'Ride Completed';
              message = `Your ride to ${booking.destination} has been completed. Thank you for using UCON Transit!`;
              type = 'success';
              break;
            case 'ineligible':
              title = 'Ride Request - Ineligible';
              message = `Unfortunately, your ride request did not meet eligibility requirements.${deniedReason ? ` Details: ${deniedReason}` : ''} Please contact us for more information.`;
              type = 'error';
              break;
            case 'suspended':
              title = 'Transit Service Suspended';
              message = `Your transit service has been temporarily suspended.${deniedReason ? ` Reason: ${deniedReason}` : ''} Please contact staff for resolution.`;
              type = 'error';
              break;
            case 'canceled':
            case 'cancelled':
              title = 'Ride Request Canceled';
              message = `Your ride request has been canceled.${deniedReason ? ` Reason: ${deniedReason}` : ''}`;
              type = 'info';
              break;
          }

        if (title && message) {
          await db.insert(notifications).values({
            userId: booking.userId,
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Finalize booking: If terminal status, move to activity log and hide from user
        if (status && TERMINAL_STATUSES.includes(status)) {
          try {
            // Get driver info if assigned
            let driverName = 'Unassigned';
            if (booking.assignedDriverId) {
              const driver = await db.select({ name: user.name }).from(user).where(eq(user.id, booking.assignedDriverId)).limit(1);
              if (driver.length > 0) {
                driverName = driver[0].name;
              }
            }

            // Get requester name
            const requesterUser = await db.select({ name: user.name }).from(user).where(eq(user.id, booking.userId)).limit(1);
            const recipientName = booking.riderName || requesterUser[0]?.name || 'Unknown';

            // Insert into activity log
            await db.insert(transitActivityLog).values({
              driverId: booking.assignedDriverId,
              driverName: driverName,
              recipientName: recipientName,
              rideType: booking.ridePurpose || 'general',
              pickupLocation: booking.pickupLocation,
              dropoffLocation: booking.destination,
              hoursServed: status === 'completed' || status === 'complete' ? 1 : 0,
              notes: `Status: ${status}. ${staffNotes || ''} ${deniedReason ? `Reason: ${deniedReason}` : ''}`.trim(),
              createdAt: new Date().toISOString(),
            });

            // Hide booking from user's active list
            await db.update(transitBookings)
              .set({ isHiddenFromUser: true, updatedAt: new Date().toISOString() })
              .where(eq(transitBookings.id, id));
          } catch (activityError) {
            console.error('Error moving booking to activity log:', activityError);
          }
        }
      }

    return NextResponse.json(updatedBooking[0]);
  } catch (error) {
    console.error('Error updating transit booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !(await isStaffUser(currentUser.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    const booking = await db
      .select()
      .from(transitBookings)
      .where(eq(transitBookings.id, parseInt(id)))
      .limit(1);

    if (booking.length > 0) {
      await db.insert(notifications).values({
        userId: booking[0].userId,
        title: 'Ride Request Removed',
        message: 'Your ride request has been removed by administrative staff.',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    await db
      .update(transitBookings)
      .set({ 
        status: 'cancelled',
        isHiddenFromUser: true,
        updatedAt: new Date().toISOString()
      })
      .where(eq(transitBookings.id, parseInt(id)));

    return NextResponse.json({ success: true, message: 'Booking soft-deleted for compliance' });
  } catch (error) {
    console.error('Error deleting transit booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
