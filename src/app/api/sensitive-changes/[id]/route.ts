import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sensitiveChangeRequests, user, userRoles, ucmLevels, account, notifications, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import bcrypt from 'bcrypt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, accessCode, denialReason, adminBypass } = body;

    if (!action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (approve/deny) is required' }, { status: 400 });
    }

    const [changeRequest] = await db
      .select()
      .from(sensitiveChangeRequests)
      .where(eq(sensitiveChangeRequests.id, parseInt(id)))
      .limit(1);

    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    if (changeRequest.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 });
    }

    if (new Date(changeRequest.expiresAt) < new Date()) {
      await db
        .update(sensitiveChangeRequests)
        .set({ status: 'expired' })
        .where(eq(sensitiveChangeRequests.id, parseInt(id)));
      return NextResponse.json({ error: 'This request has expired' }, { status: 400 });
    }

    const [currentUser] = await db
      .select({ registrationNumber: user.registrationNumber })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Check if user is admin (Level 1) for bypass capability
    const [currentUserRole] = await db
      .select({ level: ucmLevels.level })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, session.user.id))
      .limit(1);

    const isAdmin = currentUserRole?.level === 1;
    const isDesignatedApprover = currentUser?.registrationNumber === changeRequest.approverStaffNumber;

    // Admin bypass: Level 1 admins can approve/deny any request without being the designated approver
    if (!isDesignatedApprover && !isAdmin) {
      return NextResponse.json({
        error: 'Only the designated approver can process this request',
        code: 'NOT_DESIGNATED_APPROVER'
      }, { status: 403 });
    }

    // Log if admin bypass was used
    const usedAdminBypass = !isDesignatedApprover && isAdmin;

    if (action === 'approve') {
      if (!accessCode) {
        return NextResponse.json({ error: 'Personal Access Code (PAC) is required to approve' }, { status: 400 });
      }

      const [approverRole] = await db
        .select({ accessCode: userRoles.accessCode })
        .from(userRoles)
        .where(eq(userRoles.userId, session.user.id))
        .limit(1);

      if (!approverRole?.accessCode) {
        return NextResponse.json({ error: 'You do not have a PAC set up' }, { status: 400 });
      }

      const isValidPAC = await bcrypt.compare(accessCode, approverRole.accessCode);
      if (!isValidPAC) {
        return NextResponse.json({ error: 'Invalid Personal Access Code' }, { status: 401 });
      }

      const changeDetails = changeRequest.changeDetails as Record<string, unknown>;
      let changeApplied = false;

      switch (changeRequest.requestType) {
        case 'password_reset':
          if (changeRequest.targetUserId && changeDetails.newPassword) {
            const hashedPassword = await bcrypt.hash(changeDetails.newPassword as string, 12);
            await db
              .update(account)
              .set({ 
                password: hashedPassword,
                requiresPasswordChange: false,
                updatedAt: new Date()
              })
              .where(and(
                eq(account.userId, changeRequest.targetUserId),
                eq(account.providerId, 'credential')
              ));
            changeApplied = true;
          }
          break;

        case 'email_change':
          if (changeRequest.targetUserId && changeDetails.newEmail) {
            await db
              .update(user)
              .set({ 
                email: changeDetails.newEmail as string,
                updatedAt: new Date()
              })
              .where(eq(user.id, changeRequest.targetUserId));
            changeApplied = true;
          }
          break;

        case 'profile_update':
        case 'staff_name_change':
          if (changeRequest.targetUserId && changeDetails.updates) {
            const updates = changeDetails.updates as Record<string, unknown>;
            await db
              .update(user)
              .set({ 
                ...updates,
                updatedAt: new Date()
              })
              .where(eq(user.id, changeRequest.targetUserId));
            changeApplied = true;
          }
          break;

        case 'audit_delete':
          if (changeRequest.targetEntityId) {
            await db
              .delete(auditLogs)
              .where(eq(auditLogs.id, parseInt(changeRequest.targetEntityId)));
            changeApplied = true;
          }
          break;

        case 'role_change':
          if (changeRequest.targetUserId && changeDetails.newRoleId) {
            await db
              .update(userRoles)
              .set({ ucmLevelId: changeDetails.newRoleId as number })
              .where(eq(userRoles.userId, changeRequest.targetUserId));
            changeApplied = true;
          }
          break;

        case 'pac_change':
          if (changeRequest.targetUserId) {
            // Generate new PAC
            const newPlainPAC = Math.floor(100000 + Math.random() * 900000).toString();
            const newHashedPAC = await bcrypt.hash(newPlainPAC, 12);
            
            await db
              .update(userRoles)
              .set({ accessCode: newHashedPAC })
              .where(eq(userRoles.userId, changeRequest.targetUserId));
            
            // Send notification to requester with the new PAC
            await db.insert(notifications).values({
              userId: changeRequest.requesterId,
              title: 'PAC Change Approved - Action Required',
              message: `PAC change was approved. New PAC: ${newPlainPAC}. Store this code securely - it will not be shown again.`,
              type: 'pac_generated',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
            
            changeApplied = true;
          }
          break;

        default:
          changeApplied = true;
      }

      await db
        .update(sensitiveChangeRequests)
        .set({
          status: 'approved',
          approvedAt: new Date().toISOString(),
        })
        .where(eq(sensitiveChangeRequests.id, parseInt(id)));

      await db.insert(notifications).values({
        userId: changeRequest.requesterId,
        title: 'Request Approved',
        message: `Your ${changeRequest.requestType.replace(/_/g, ' ')} request has been approved by ${session.user.name}`,
        type: 'approval_result',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

        await db.insert(auditLogs).values({
          category: 'sensitive_changes',
          action: 'approve',
          entityType: 'sensitive_change_request',
          entityId: id,
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          staffRegistrationNumber: currentUser?.registrationNumber,
          details: { 
            requestType: changeRequest.requestType,
            changeApplied,
            targetUserId: changeRequest.targetUserId,
            usedAdminBypass,
          },
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          message: 'Request approved successfully',
          changeApplied,
          status: 'approved',
          usedAdminBypass
        });
      } else {
      await db
        .update(sensitiveChangeRequests)
        .set({
          status: 'denied',
          deniedAt: new Date().toISOString(),
          denialReason: denialReason || null,
        })
        .where(eq(sensitiveChangeRequests.id, parseInt(id)));

      await db.insert(notifications).values({
        userId: changeRequest.requesterId,
        title: 'Request Denied',
        message: `Your ${changeRequest.requestType.replace(/_/g, ' ')} request has been denied${denialReason ? `: ${denialReason}` : ''}`,
        type: 'approval_result',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

        await db.insert(auditLogs).values({
          category: 'sensitive_changes',
          action: 'deny',
          entityType: 'sensitive_change_request',
          entityId: id,
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          staffRegistrationNumber: currentUser?.registrationNumber,
          details: { 
            requestType: changeRequest.requestType,
            denialReason,
            targetUserId: changeRequest.targetUserId,
            usedAdminBypass,
          },
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          message: 'Request denied',
          status: 'denied',
          usedAdminBypass
        });
    }
  } catch (error) {
    console.error('PATCH sensitive-changes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [changeRequest] = await db
      .select()
      .from(sensitiveChangeRequests)
      .where(eq(sensitiveChangeRequests.id, parseInt(id)))
      .limit(1);

    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    const [requester] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, changeRequest.requesterId))
      .limit(1);

    let targetUser = null;
    if (changeRequest.targetUserId) {
      const [target] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, changeRequest.targetUserId))
        .limit(1);
      targetUser = target;
    }

    return NextResponse.json({
      ...changeRequest,
      requesterName: requester?.name,
      requesterEmail: requester?.email,
      targetUserName: targetUser?.name,
      targetUserEmail: targetUser?.email,
      isExpired: new Date(changeRequest.expiresAt) < new Date(),
    });
  } catch (error) {
    console.error('GET sensitive-changes/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
