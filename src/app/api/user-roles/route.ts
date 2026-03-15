import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, ucmLevels, user, account, auditLogs } from '@/db/schema';
import { eq, and, asc, desc, like } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { sendWelcomeStaffEmail } from '@/lib/email-service';
import { generatePassword } from '@/lib/password-utils';
import { assignRoleTagsForUser } from '@/lib/role-tags';

function generatePAC(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const ACTION_CLEARANCE = {
  addStaff: 75,
  editStaffClearance: 75,
  deleteStaff: 90,
  viewAllStaff: 25,
};

async function verifyCallerAuthorization(request: NextRequest, requiredClearance: number): Promise<{
  authorized: boolean;
  callerClearance: number;
  callerId: string | null;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let callerId: string | null = null;
    
    if (request.method === 'POST') {
      try {
        const bodyClone = request.clone();
        const body = await bodyClone.json();
        callerId = body.assignedBy || null;
      } catch {
      }
    }
    
    if (!callerId) {
      const { searchParams } = new URL(request.url);
      callerId = searchParams.get('callerId');
    }

    if (!callerId) {
      return {
        authorized: false,
        callerClearance: 0,
        callerId: null,
        error: 'Caller identification required for this action'
      };
    }

    const callerRoles = await db
      .select({
        permissionClearance: userRoles.permissionClearance,
        dutyClearance: userRoles.dutyClearance,
        ucmLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, callerId));

    if (callerRoles.length === 0) {
      return {
        authorized: false,
        callerClearance: 0,
        callerId,
        error: 'Caller has no staff role assigned'
      };
    }

    const maxClearance = Math.max(...callerRoles.map(r => r.permissionClearance || 0));

    return {
      authorized: maxClearance >= requiredClearance,
      callerClearance: maxClearance,
      callerId,
      error: maxClearance >= requiredClearance ? undefined : 
        `Insufficient clearance. Required: ${requiredClearance}, Your clearance: ${maxClearance}`
    };
  } catch (error) {
    console.error('Authorization verification error:', error);
    return {
      authorized: false,
      callerClearance: 0,
      callerId: null,
      error: 'Authorization verification failed'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (userId === 'all') {
      const allUserRoles = await db
          .select({
            id: userRoles.id,
            userId: userRoles.userId,
            ucmLevelId: userRoles.ucmLevelId,
            staffTitle: userRoles.staffTitle,
            permissionClearance: userRoles.permissionClearance,
            dutyClearance: userRoles.dutyClearance,
            assignedAt: userRoles.assignedAt,
            assignedBy: userRoles.assignedBy,
            isAdmin: userRoles.isAdmin,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            registrationNumber: user.registrationNumber,
            userImage: user.image,
            userGender: user.gender,
            userRace: user.race,
            userEmergencyContactName: user.emergencyContactName,
            userEmergencyContactPhone: user.emergencyContactPhone,
            userEmergencyContactRelation: user.emergencyContactRelation,
            userUcmEmployeeNumber: user.ucmEmployeeNumber,
            userAddress: user.address,
            userCity: user.city,
            userState: user.state,
            userZipCode: user.zipCode,
            userDepartment: user.department,
            userMinistryPhone: user.ministryPhone,
            userHasDevice: user.hasDevice,
            userCompensationType: user.compensationType,
            userBackgroundCheckDate: user.backgroundCheckDate,
            userReferencesInfo: user.referencesInfo,
            userEnrollmentDate: user.enrollmentDate,
            userCreatedAt: user.createdAt,
          })
          .from(userRoles)
          .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
          .innerJoin(user, eq(userRoles.userId, user.id))
          .orderBy(asc(user.name));

        const allLevels = await db.select().from(ucmLevels);
        const levelsById = new Map(allLevels.map(r => [r.id, r]));

        const result = allUserRoles.map(ur => ({
          id: ur.id,
          userId: ur.userId,
          ucmLevelId: ur.ucmLevelId,
          roleId: ur.ucmLevelId,
          staffTitle: ur.staffTitle,
          permissionClearance: ur.permissionClearance,
          dutyClearance: ur.dutyClearance,
          assignedAt: ur.assignedAt,
          assignedBy: ur.assignedBy,
          isAdmin: ur.isAdmin,
          userName: ur.userName,
          userEmail: ur.userEmail,
          userPhone: ur.userPhone,
          registrationNumber: ur.registrationNumber,
          userImage: ur.userImage,
          userGender: ur.userGender,
          userRace: ur.userRace,
          userEmergencyContactName: ur.userEmergencyContactName,
          userEmergencyContactPhone: ur.userEmergencyContactPhone,
          userEmergencyContactRelation: ur.userEmergencyContactRelation,
          userUcmEmployeeNumber: ur.userUcmEmployeeNumber,
          userAddress: ur.userAddress,
          userCity: ur.userCity,
          userState: ur.userState,
          userZipCode: ur.userZipCode,
          userDepartment: ur.userDepartment,
          userMinistryPhone: ur.userMinistryPhone,
          userHasDevice: ur.userHasDevice,
          userCompensationType: ur.userCompensationType,
          userBackgroundCheckDate: ur.userBackgroundCheckDate,
          userReferencesInfo: ur.userReferencesInfo,
          userEnrollmentDate: ur.userEnrollmentDate,
          userCreatedAt: ur.userCreatedAt,
          role: levelsById.get(ur.ucmLevelId) || { id: ur.ucmLevelId, name: 'Unknown', level: 0 }
        }));

      return NextResponse.json(result, { status: 200 });
    }

    const userRoleAssignments = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        ucmLevelId: userRoles.ucmLevelId,
        staffTitle: userRoles.staffTitle,
        permissionClearance: userRoles.permissionClearance,
        dutyClearance: userRoles.dutyClearance,
        assignedAt: userRoles.assignedAt,
        assignedBy: userRoles.assignedBy,
        roleName: ucmLevels.name,
        roleDescription: ucmLevels.description,
        roleLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(ucmLevels.level));

    return NextResponse.json(userRoleAssignments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { assignedBy } = body;
    
    if (assignedBy) {
      const callerRoles = await db
        .select({
          permissionClearance: userRoles.permissionClearance,
          dutyClearance: userRoles.dutyClearance,
        })
        .from(userRoles)
        .where(eq(userRoles.userId, assignedBy));

      if (callerRoles.length === 0) {
        return NextResponse.json({ 
          error: "You don't have staff authorization to add new staff members",
          code: "UNAUTHORIZED_CALLER",
          requiredClearance: ACTION_CLEARANCE.addStaff
        }, { status: 403 });
      }

      const maxClearance = Math.max(...callerRoles.map(r => r.permissionClearance || 0));
      
      if (maxClearance < ACTION_CLEARANCE.addStaff) {
        return NextResponse.json({ 
          error: `Insufficient clearance to add staff members. Required: ${ACTION_CLEARANCE.addStaff}, Your clearance: ${maxClearance}`,
          code: "INSUFFICIENT_CLEARANCE",
          requiredClearance: ACTION_CLEARANCE.addStaff,
          yourClearance: maxClearance
        }, { status: 403 });
      }

      const requestedPermissionClearance = body.permissionClearance || 0;
      const requestedDutyClearance = body.dutyClearance || 0;
      
      if (requestedPermissionClearance > maxClearance || requestedDutyClearance > maxClearance) {
        return NextResponse.json({ 
          error: `Cannot assign clearance level higher than your own. Your max clearance: ${maxClearance}`,
          code: "CLEARANCE_EXCEEDED",
          yourClearance: maxClearance,
          requestedPermissionClearance,
          requestedDutyClearance
        }, { status: 403 });
      }
    }
    
    if (body.firstName && body.lastName) {
      const { firstName, lastName, email, phone, roleId, ucmLevelId, staffTitle, initialPassword, permissionClearance, dutyClearance } = body;
      const levelId = ucmLevelId || roleId;

      if (!firstName || !lastName || !email || !levelId) {
        return NextResponse.json({ 
          error: "Missing required fields for new user creation",
          code: "MISSING_REQUIRED_FIELDS" 
        }, { status: 400 });
      }

      const password = initialPassword || generatePassword();

      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json({ 
          error: "Email already registered",
          code: "EMAIL_EXISTS" 
        }, { status: 400 });
      }

      const existingLevel = await db
        .select()
        .from(ucmLevels)
        .where(eq(ucmLevels.id, parseInt(levelId)))
        .limit(1);

      if (existingLevel.length === 0) {
        return NextResponse.json({ 
          error: "UCM Level not found",
          code: "UCM_LEVEL_NOT_FOUND" 
        }, { status: 404 });
      }

      const year = new Date().getFullYear();
      const lastUser = await db
        .select({ registrationNumber: user.registrationNumber })
        .from(user)
        .where(like(user.registrationNumber, `UCM-${year}-%`))
        .orderBy(desc(user.registrationNumber))
        .limit(1);

      let sequentialNumber = 1;
      if (lastUser.length > 0 && lastUser[0].registrationNumber) {
        const lastNumber = parseInt(lastUser[0].registrationNumber.split('-')[2]);
        sequentialNumber = lastNumber + 1;
      }

      const registrationNumber = `UCM-${year}-${sequentialNumber.toString().padStart(5, '0')}`;

      const odUserId = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const hashedPassword = await hash(password, 10);

      try {
        const [newUser] = await db.insert(user).values({
          id: odUserId,
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          phone: phone || null,
          registrationNumber,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        await db.insert(account).values({
          id: `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          accountId: odUserId,
          providerId: 'credential',
          userId: odUserId,
          password: hashedPassword,
          requiresPasswordChange: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

          const roleValues: any = {
            userId: odUserId,
            ucmLevelId: parseInt(levelId),
            staffTitle: staffTitle || null,
            permissionClearance: permissionClearance !== undefined ? permissionClearance : 0,
            dutyClearance: dutyClearance !== undefined ? dutyClearance : 0,
            assignedAt: new Date().toISOString(),
          };

          if (assignedBy) {
            roleValues.assignedBy = assignedBy;
          }

          // Generate PAC for all new staff members automatically
          const plainPAC = generatePAC();
          const hashedPAC = await hash(plainPAC, 12);
          roleValues.accessCode = hashedPAC;

          const newAssignment = await db
            .insert(userRoles)
            .values(roleValues)
            .returning();

          const roleTagResult = await assignRoleTagsForUser(odUserId, existingLevel[0].level, assignedBy);
          if (!roleTagResult.success) {
            console.error('Failed to assign role tags:', roleTagResult.error);
          }

          // Log PAC generation in audit logs
          await db.insert(auditLogs).values({
            category: 'security',
            action: 'generate_pac',
            entityType: 'user_role',
            entityId: odUserId,
            userId: assignedBy || null,
            userEmail: null,
            userName: null,
            details: {
              targetUserId: odUserId,
              targetUserName: `${firstName} ${lastName}`,
              isInitialGeneration: true,
            },
            createdAt: new Date().toISOString(),
          });

          const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/staff-login`;
        
        const emailResult = await sendWelcomeStaffEmail(
          `${firstName} ${lastName}`,
          email.toLowerCase(),
          registrationNumber,
          password,
          existingLevel[0].name,
          staffTitle,
          loginUrl
        );

        if (!emailResult.success) {
          console.error('Failed to send welcome email:', emailResult.error);
        }

        const assignmentWithDetails = await db
          .select({
            id: userRoles.id,
            userId: userRoles.userId,
            ucmLevelId: userRoles.ucmLevelId,
            staffTitle: userRoles.staffTitle,
            permissionClearance: userRoles.permissionClearance,
            dutyClearance: userRoles.dutyClearance,
            assignedAt: userRoles.assignedAt,
            assignedBy: userRoles.assignedBy,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            registrationNumber: user.registrationNumber,
            roleName: ucmLevels.name,
            roleDescription: ucmLevels.description,
            roleLevel: ucmLevels.level,
          })
          .from(userRoles)
          .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
          .innerJoin(user, eq(userRoles.userId, user.id))
          .where(eq(userRoles.id, newAssignment[0].id))
          .limit(1);

          return NextResponse.json({
            message: "Staff member created and role assigned successfully",
            assignment: assignmentWithDetails[0],
            initialPassword: password,
            initialPAC: plainPAC,
            pacWarning: "IMPORTANT: This PAC will only be shown once. Store it securely and share with the staff member.",
            emailSent: emailResult.success,
            emailError: emailResult.error || null
          }, { status: 201 });
      } catch (dbError) {
        console.error('Database error during staff creation:', dbError);
        try {
          await db.delete(account).where(eq(account.userId, odUserId));
          await db.delete(user).where(eq(user.id, odUserId));
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw dbError;
      }
    }

    const { userId, roleId, ucmLevelId, staffTitle, permissionClearance, dutyClearance } = body;
    const levelId = ucmLevelId || roleId;

    if (!userId || !levelId) {
      return NextResponse.json({ 
        error: "Missing required fields: userId and ucmLevelId (or roleId) are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const existingLevel = await db
      .select()
      .from(ucmLevels)
      .where(eq(ucmLevels.id, parseInt(levelId)))
      .limit(1);

    if (existingLevel.length === 0) {
      return NextResponse.json({ 
        error: "UCM Level not found",
        code: "UCM_LEVEL_NOT_FOUND" 
      }, { status: 404 });
    }

    const existingAssignment = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.ucmLevelId, parseInt(levelId))
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json({ 
        error: "User already has this level assigned",
        code: "DUPLICATE_LEVEL_ASSIGNMENT" 
      }, { status: 400 });
    }

    if (assignedBy) {
      const assigningUser = await db
        .select()
        .from(user)
        .where(eq(user.id, assignedBy))
        .limit(1);

      if (assigningUser.length === 0) {
        return NextResponse.json({ 
          error: "Assigning user not found",
          code: "ASSIGNING_USER_NOT_FOUND" 
        }, { status: 404 });
      }
    }

    const newAssignment = await db
      .insert(userRoles)
      .values({
        userId,
        ucmLevelId: parseInt(levelId),
        staffTitle: staffTitle || null,
        permissionClearance: permissionClearance !== undefined ? permissionClearance : 0,
        dutyClearance: dutyClearance !== undefined ? dutyClearance : 0,
        assignedBy: assignedBy || null,
        assignedAt: new Date().toISOString(),
      })
      .returning();

    const roleTagResult = await assignRoleTagsForUser(userId, existingLevel[0].level, assignedBy);
    if (!roleTagResult.success) {
      console.error('Failed to assign role tags:', roleTagResult.error);
    }

    const assignmentWithDetails = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        ucmLevelId: userRoles.ucmLevelId,
        staffTitle: userRoles.staffTitle,
        permissionClearance: userRoles.permissionClearance,
        dutyClearance: userRoles.dutyClearance,
        assignedAt: userRoles.assignedAt,
        assignedBy: userRoles.assignedBy,
        roleName: ucmLevels.name,
        roleDescription: ucmLevels.description,
        roleLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.id, newAssignment[0].id))
      .limit(1);

    return NextResponse.json(assignmentWithDetails[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const callerId = searchParams.get('callerId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    if (callerId) {
      const callerRoles = await db
        .select({
          permissionClearance: userRoles.permissionClearance,
        })
        .from(userRoles)
        .where(eq(userRoles.userId, callerId));

      if (callerRoles.length === 0) {
        return NextResponse.json({ 
          error: "You don't have staff authorization to delete staff members",
          code: "UNAUTHORIZED_CALLER",
          requiredClearance: ACTION_CLEARANCE.deleteStaff
        }, { status: 403 });
      }

      const maxClearance = Math.max(...callerRoles.map(r => r.permissionClearance || 0));
      
      if (maxClearance < ACTION_CLEARANCE.deleteStaff) {
        return NextResponse.json({ 
          error: `Insufficient clearance to delete staff members. Required: ${ACTION_CLEARANCE.deleteStaff}, Your clearance: ${maxClearance}`,
          code: "INSUFFICIENT_CLEARANCE",
          requiredClearance: ACTION_CLEARANCE.deleteStaff,
          yourClearance: maxClearance
        }, { status: 403 });
      }
    }

    const existingAssignment = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        ucmLevelId: userRoles.ucmLevelId,
        assignedAt: userRoles.assignedAt,
        assignedBy: userRoles.assignedBy,
        roleName: ucmLevels.name,
        roleDescription: ucmLevels.description,
        roleLevel: ucmLevels.level,
      })
      .from(userRoles)
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(eq(userRoles.id, parseInt(id)))
      .limit(1);

    if (existingAssignment.length === 0) {
      return NextResponse.json({ 
        error: "Role assignment not found",
        code: "ASSIGNMENT_NOT_FOUND" 
      }, { status: 404 });
    }

    await db
      .delete(userRoles)
      .where(eq(userRoles.id, parseInt(id)));

    return NextResponse.json({
      message: "Role assignment deleted successfully",
      deletedAssignment: existingAssignment[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
