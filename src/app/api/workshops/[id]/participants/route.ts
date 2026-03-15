import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workshopParticipants, workshops, workshopRegistrations } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { diagnoseError, logErrorDiagnostics, type ErrorContext } from "@/lib/error-diagnostics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const workshopId = idParam;

    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json({ 
        error: "Valid workshop ID is required",
        code: "INVALID_WORKSHOP_ID" 
      }, { status: 400 });
    }

    const id = parseInt(workshopId);

    // Check if workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json({ 
        error: 'Workshop not found',
        code: "WORKSHOP_NOT_FOUND" 
      }, { status: 404 });
    }

    // Get all active participants (leftAt IS NULL)
    const activeParticipants = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.workshopId, id),
          isNull(workshopParticipants.leftAt)
        )
      )
      .orderBy(workshopParticipants.joinedAt);

    return NextResponse.json(activeParticipants);
  } catch (error) {
    // Log error with full diagnostics
    const errorContext: ErrorContext = {
      error: error as Error,
      timestamp: new Date(),
      request: {
        method: 'GET',
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
    logErrorDiagnostics(errorContext);

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { userId, isGuest = false, status = 'active' } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'waiting', 'left'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: active, waiting, left" },
        { status: 400 }
      );
    }

    // Get workshop details to check program type
    const workshop = await db.query.workshops.findFirst({
      where: eq(workshops.id, id),
    });

    if (!workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 }
      );
    }

    // Determine if this is an Awaken workshop (open to all) or Equip (registration required)
    const isAwakenWorkshop = 
      workshop.programType === 'awaken' ||
      workshop.category?.toLowerCase().includes('bible') ||
      workshop.category?.toLowerCase().includes('ministerial') ||
      workshop.title?.toLowerCase().includes('bible') ||
      workshop.title?.toLowerCase().includes('ministerial');

    // For EQUIP workshops: Block guests and require registration
    if (!isAwakenWorkshop) {
      // Block guests completely for Equip workshops
      if (isGuest) {
        return NextResponse.json(
          { 
            error: "Registration required for Equip workshops. Please create an account to join.",
            requiresAccount: true 
          },
          { status: 403 }
        );
      }

      // For authenticated users: Check if registered for Equip workshops
      const registration = await db.query.workshopRegistrations.findFirst({
        where: and(
          eq(workshopRegistrations.workshopId, id),
          eq(workshopRegistrations.userId, userId)
        ),
      });

      if (!registration) {
        return NextResponse.json(
          { 
            error: "You must be registered to join this Equip workshop. Please register first.",
            requiresRegistration: true 
          },
          { status: 403 }
        );
      }
    }

    // For AWAKEN workshops: Allow both guests and authenticated users to join
    if (isAwakenWorkshop) {
      // Guests can join but attendance is not tracked
      if (isGuest) {
        return NextResponse.json(
          { 
            success: true, 
            isGuest: true,
            message: "Joined as guest - attendance not tracked" 
          },
          { status: 200 }
        );
      }

      // Authenticated users in Awaken: Try to track attendance if registered, otherwise allow without tracking
      const registration = await db.query.workshopRegistrations.findFirst({
        where: and(
          eq(workshopRegistrations.workshopId, id),
          eq(workshopRegistrations.userId, userId)
        ),
      });

      // If user is registered, track their attendance
      if (registration) {
        // Check if already a participant
        const existingParticipant = await db.query.workshopParticipants.findFirst({
          where: and(
            eq(workshopParticipants.workshopId, id),
            eq(workshopParticipants.userId, userId),
            isNull(workshopParticipants.leftAt)
          ),
        });

        if (existingParticipant) {
          return NextResponse.json(
            { 
              success: true, 
              participant: existingParticipant,
              message: "Already joined" 
            },
            { status: 200 }
          );
        }

        try {
          const [newParticipant] = await db
            .insert(workshopParticipants)
            .values({
              workshopId: id,
              userId,
              status: status,
              joinedAt: new Date(),
            })
            .returning();

          return NextResponse.json(
            { success: true, participant: newParticipant },
            { status: 201 }
          );
        } catch (dbError) {
          // If DB insert fails, still allow them to join
          console.error("Failed to track attendance for registered Awaken user:", dbError);
          return NextResponse.json(
            { 
              success: true, 
              message: "Joined successfully - attendance tracking failed" 
            },
            { status: 200 }
          );
        }
      }

      // Not registered but authenticated in Awaken workshop: Allow without tracking
      return NextResponse.json(
        { 
          success: true, 
          message: "Joined successfully - register to track attendance" 
        },
        { status: 200 }
      );
    }

    // For registered EQUIP users: Track attendance
    // Check if already a participant
    const existingParticipant = await db.query.workshopParticipants.findFirst({
      where: and(
        eq(workshopParticipants.workshopId, id),
        eq(workshopParticipants.userId, userId),
        isNull(workshopParticipants.leftAt)
      ),
    });

    if (existingParticipant) {
      return NextResponse.json(
        { 
          success: true, 
          participant: existingParticipant,
          message: "Already joined" 
        },
        { status: 200 }
      );
    }

    const [newParticipant] = await db
      .insert(workshopParticipants)
      .values({
        workshopId: id,
        userId,
        status: status,
        joinedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, participant: newParticipant },
      { status: 201 }
    );

  } catch (error) {
    // Enhanced error diagnostics
    const errorContext: ErrorContext = {
      error: error instanceof Error ? error : new Error(String(error)),
      timestamp: new Date(),
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.clone().json().catch(() => null),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        platform: 'server',
        nodeVersion: process.version,
      },
    };

    // Log detailed diagnostics
    logErrorDiagnostics(errorContext);

    console.error("Error in POST /api/workshops/[id]/participants:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to join workshop",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const workshopId = idParam;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate workshop ID
    if (!workshopId || isNaN(parseInt(workshopId))) {
      return NextResponse.json({ 
        error: "Valid workshop ID is required",
        code: "INVALID_WORKSHOP_ID" 
      }, { status: 400 });
    }

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const id = parseInt(workshopId);

    // Check if workshop exists
    const workshop = await db.select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return NextResponse.json({ 
        error: 'Workshop not found',
        code: "WORKSHOP_NOT_FOUND" 
      }, { status: 404 });
    }

    // Find active participant
    const activeParticipant = await db.select()
      .from(workshopParticipants)
      .where(
        and(
          eq(workshopParticipants.workshopId, id),
          eq(workshopParticipants.userId, userId),
          isNull(workshopParticipants.leftAt)
        )
      )
      .limit(1);

    if (activeParticipant.length === 0) {
      return NextResponse.json({ 
        error: 'Not in workshop session',
        code: "NOT_IN_SESSION" 
      }, { status: 404 });
    }

    // Update participant leftAt and status
    const updated = await db.update(workshopParticipants)
      .set({
        leftAt: new Date().toISOString(),
        status: 'left'
      })
      .where(eq(workshopParticipants.id, activeParticipant[0].id))
      .returning();

    return NextResponse.json({
      message: 'Successfully left workshop session',
      participant: updated[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}