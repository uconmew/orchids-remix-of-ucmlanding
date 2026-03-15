import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transitBookings, transitSuspensions, volunteerApplications, userProgramTags, userRoles, roles } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Check Transit Status
        // Check for 'loss'
        const lossHistory = await db.select()
            .from(transitBookings)
            .where(and(eq(transitBookings.userId, currentUser.id), eq(transitBookings.status, 'loss')))
            .limit(1);

        // Check for active suspension
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeSuspension = await db.select()
            .from(transitSuspensions)
            .where(and(
                eq(transitSuspensions.userId, currentUser.id),
                sql`${transitSuspensions.suspendedAt} > ${thirtyDaysAgo.toISOString()}`
            ))
            .orderBy(desc(transitSuspensions.suspendedAt))
            .limit(1);

        let transitStatus = 'active';
        let transitReason = null;
        let transitExpiresAt = null;

        if (lossHistory.length > 0) {
            transitStatus = 'loss';
            transitReason = 'Transit privileges revoked due to prior loss of privilege status.';
        } else if (activeSuspension.length > 0) {
            transitStatus = 'suspended';
            transitReason = activeSuspension[0].reason || 'Your transit access is currently suspended. Suspensions last for 30 days.';
            
            const expiresDate = new Date(activeSuspension[0].suspendedAt);
            expiresDate.setDate(expiresDate.getDate() + 30);
            transitExpiresAt = expiresDate.toISOString();
        }

        // 2. Check Volunteer Status
        // Check volunteer applications by email
        const volunteerApp = await db.select()
            .from(volunteerApplications)
            .where(eq(volunteerApplications.email, currentUser.email))
            .orderBy(desc(volunteerApplications.submittedAt))
            .limit(1);

        // Check user roles for volunteer tag
        const userVolunteerRole = await db.select()
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.ucmLevelId, roles.id))
            .where(and(
                eq(userRoles.userId, currentUser.id),
                eq(roles.name, 'volunteer')
            ))
            .limit(1);

        let volunteerStatus = 'inactive';
        if (userVolunteerRole.length > 0) {
            volunteerStatus = 'active';
        } else if (volunteerApp.length > 0) {
            volunteerStatus = volunteerApp[0].status; // 'pending', 'approved', 'denied'
        }

        // 3. Get Program Tags
        const tags = await db.select({
            tagId: userProgramTags.programTagId
        })
        .from(userProgramTags)
        .where(and(
            eq(userProgramTags.userId, currentUser.id),
            eq(userProgramTags.isActive, true)
        ));

        const programs = tags.map(t => t.tagId.replace('web:', '').replace('inperson:', ''));

        return NextResponse.json({
            transit: {
                status: transitStatus,
                reason: transitReason,
                expiresAt: transitExpiresAt
            },
            volunteer: {
                status: volunteerStatus
            },
            programs: Array.from(new Set(programs)) // Unique program tags
        });
    } catch (error) {
        console.error('Error fetching portal status:', error);
        return NextResponse.json({ error: 'Failed to fetch portal status' }, { status: 500 });
    }
}
