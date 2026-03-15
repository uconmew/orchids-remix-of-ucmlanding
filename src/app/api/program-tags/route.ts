import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userProgramTags, userProgramDuties, roleTags, user, uconRoles } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { PROGRAM_TAGS, PROGRAM_TAG_IDS, POSITION_TAGS } from "@/lib/program-tags";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      const userTags = await db.select().from(userProgramTags).where(
        and(eq(userProgramTags.userId, userId), eq(userProgramTags.isActive, true))
      );

      const userDuties = await db.select().from(userProgramDuties).where(
        and(eq(userProgramDuties.userId, userId), eq(userProgramDuties.isActive, true))
      );

      return NextResponse.json({
        tags: userTags,
        duties: userDuties,
        programDefinitions: PROGRAM_TAGS,
        positionDefinitions: POSITION_TAGS,
      });
    }

    const eligibleUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
      })
      .from(user)
      .innerJoin(roleTags, eq(roleTags.userId, user.id))
      .where(inArray(roleTags.tag, ['volunteer', 'staff', 'mentor', 'admin']));

    const uniqueUsers = Array.from(
      new Map(eligibleUsers.map((u) => [u.id, u])).values()
    );

    const userIds = uniqueUsers.map((u) => u.id);

    let allUserTags: any[] = [];
    let allUserDuties: any[] = [];
    let allUserRoles: any[] = [];

    if (userIds.length > 0) {
      allUserTags = await db.select().from(userProgramTags).where(
        and(
          inArray(userProgramTags.userId, userIds),
          eq(userProgramTags.isActive, true)
        )
      );

      allUserDuties = await db.select().from(userProgramDuties).where(
        and(
          inArray(userProgramDuties.userId, userIds),
          eq(userProgramDuties.isActive, true)
        )
      );

      allUserRoles = await db.select().from(uconRoles).where(
        inArray(uconRoles.userId, userIds)
      );
    }

    const usersWithDetails = uniqueUsers.map((u) => ({
      ...u,
      programTags: allUserTags.filter((t) => t.userId === u.id),
      programDuties: allUserDuties.filter((d) => d.userId === u.id),
      role: allUserRoles.find((r) => r.userId === u.id),
    }));

    return NextResponse.json({
      users: usersWithDetails,
      programDefinitions: PROGRAM_TAGS,
      positionDefinitions: POSITION_TAGS,
      allProgramTagIds: Object.values(PROGRAM_TAG_IDS),
    });
  } catch (error) {
    console.error("Error fetching program tags:", error);
    return NextResponse.json({ error: "Failed to fetch program tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, programTagId, assignedBy, notes, expiresAt } = body;

    if (!userId || !programTagId) {
      return NextResponse.json(
        { error: "userId and programTagId are required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(userProgramTags)
      .where(
        and(
          eq(userProgramTags.userId, userId),
          eq(userProgramTags.programTagId, programTagId)
        )
      );

    if (existing.length > 0) {
      await db
        .update(userProgramTags)
        .set({
          isActive: true,
          assignedBy,
          notes,
          expiresAt,
          assignedAt: new Date().toISOString(),
        })
        .where(eq(userProgramTags.id, existing[0].id));

      return NextResponse.json({ success: true, updated: true });
    }

    await db.insert(userProgramTags).values({
      userId,
      programTagId,
      assignedBy,
      notes,
      expiresAt,
      assignedAt: new Date().toISOString(),
      isActive: true,
    });

    return NextResponse.json({ success: true, created: true });
  } catch (error) {
    console.error("Error creating program tag:", error);
    return NextResponse.json({ error: "Failed to create program tag" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, programTagId } = body;

    if (!userId || !programTagId) {
      return NextResponse.json(
        { error: "userId and programTagId are required" },
        { status: 400 }
      );
    }

    await db
      .update(userProgramTags)
      .set({ isActive: false })
      .where(
        and(
          eq(userProgramTags.userId, userId),
          eq(userProgramTags.programTagId, programTagId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing program tag:", error);
    return NextResponse.json({ error: "Failed to remove program tag" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dutyKey, programTagId, action, assignedBy } = body;

    if (!userId || !dutyKey) {
      return NextResponse.json(
        { error: "userId and dutyKey are required" },
        { status: 400 }
      );
    }

    if (action === "add") {
      const existing = await db
        .select()
        .from(userProgramDuties)
        .where(
          and(
            eq(userProgramDuties.userId, userId),
            eq(userProgramDuties.dutyKey, dutyKey),
            programTagId ? eq(userProgramDuties.programTagId, programTagId) : undefined
          )
        );

      if (existing.length > 0) {
        await db
          .update(userProgramDuties)
          .set({
            isActive: true,
            assignedBy,
            assignedAt: new Date().toISOString(),
          })
          .where(eq(userProgramDuties.id, existing[0].id));
      } else {
        await db.insert(userProgramDuties).values({
          userId,
          dutyKey,
          programTagId: programTagId || "global",
          assignedBy,
          assignedAt: new Date().toISOString(),
          isActive: true,
        });
      }

      return NextResponse.json({ success: true, action: "added" });
    } else if (action === "remove") {
      await db
        .update(userProgramDuties)
        .set({ isActive: false })
        .where(
          and(
            eq(userProgramDuties.userId, userId),
            eq(userProgramDuties.dutyKey, dutyKey),
            programTagId ? eq(userProgramDuties.programTagId, programTagId) : undefined
          )
        );

      return NextResponse.json({ success: true, action: "removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing duty:", error);
    return NextResponse.json({ error: "Failed to manage duty" }, { status: 500 });
  }
}
