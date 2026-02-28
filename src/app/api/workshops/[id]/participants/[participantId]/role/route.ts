import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workshopParticipants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { WorkshopRole } from '@/types/workshop';
import { validateRoleTransition, canAssignRole, getRoleConfig } from '@/lib/workshop-roles-config';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const workshopId = params.id;
    const participantId = params.participantId;

    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json(
        { error: 'Valid workshop ID is required', code: 'INVALID_WORKSHOP_ID' },
        { status: 400 }
      );
    }

    if (!participantId || isNaN(parseInt(participantId))) {
      return NextResponse.json(
        { error: 'Valid participant ID is required', code: 'INVALID_PARTICIPANT_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required', code: 'ROLE_REQUIRED' },
        { status: 400 }
      );
    }

    const validRoles: WorkshopRole[] = ['host', 'co-host', 'facilitator', 'moderator', 'presenter', 'participant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Get requester's participant record
    const requester = await db
      .select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.workshopId, parseInt(workshopId)),
          eq(workshopParticipants.userId, user.id),
          eq(workshopParticipants.leftAt, null)
        )
      )
      .limit(1);

    if (requester.length === 0) {
      return NextResponse.json(
        { error: 'You are not in this workshop', code: 'NOT_IN_WORKSHOP' },
        { status: 403 }
      );
    }

    const requesterRole = (requester[0] as any).role as WorkshopRole || 'participant';

    // Get target participant's current role
    const targetParticipant = await db
      .select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId))
        )
      )
      .limit(1);

    if (targetParticipant.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found', code: 'PARTICIPANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentRole = (targetParticipant[0] as any).role as WorkshopRole || 'participant';
    const targetUserId = targetParticipant[0].userId;

    // Check if trying to change own role
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role', code: 'CANNOT_CHANGE_OWN_ROLE' },
        { status: 403 }
      );
    }

    // Comprehensive permission check using centralized config
    if (!canAssignRole(requesterRole, role)) {
      const requesterConfig = getRoleConfig(requesterRole);
      return NextResponse.json(
        { 
          error: `Your role (${requesterConfig.displayName}) cannot assign the ${getRoleConfig(role).displayName} role`,
          code: 'INSUFFICIENT_PERMISSIONS',
          details: {
            yourRole: requesterRole,
            canAssign: requesterConfig.canAssign,
            attemptedRole: role
          }
        },
        { status: 403 }
      );
    }

    // Validate role transition
    const validation = validateRoleTransition(requesterRole, currentRole, role);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.reason || 'Invalid role transition',
          code: 'INVALID_ROLE_TRANSITION',
          details: {
            currentRole,
            newRole: role,
            requesterRole
          }
        },
        { status: 403 }
      );
    }

    // Update participant role
    const updated = await db
      .update(workshopParticipants)
      .set({ 
        role,
        updatedAt: new Date().toISOString()
      } as any)
      .where(
        and(
          eq(workshopParticipants.id, parseInt(participantId)),
          eq(workshopParticipants.workshopId, parseInt(workshopId))
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update role', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const newRoleConfig = getRoleConfig(role);

    return NextResponse.json(
      { 
        success: true, 
        participant: updated[0],
        message: `Role changed to ${newRoleConfig.displayName}`,
        roleInfo: {
          displayName: newRoleConfig.displayName,
          level: newRoleConfig.level,
          permissionCount: newRoleConfig.permissions.length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/workshops/[id]/participants/[participantId]/role error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}