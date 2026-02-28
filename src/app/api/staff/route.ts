import { db } from "@/db";
import { userRoles, user, ucmLevels } from "@/db/schema";
import { eq, isNotNull, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const staffMembers = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        ucmLevelId: userRoles.ucmLevelId,
        roleName: ucmLevels.name,
        roleLevel: ucmLevels.level,
        staffTitle: userRoles.staffTitle,
        permissionClearance: userRoles.permissionClearance,
        dutyClearance: userRoles.dutyClearance,
        assignedAt: userRoles.assignedAt,
      })
      .from(userRoles)
      .innerJoin(user, eq(userRoles.userId, user.id))
      .innerJoin(ucmLevels, eq(userRoles.ucmLevelId, ucmLevels.id))
      .where(
        and(
          isNotNull(userRoles.staffTitle),
          ne(userRoles.staffTitle, '')
        )
      )
      .orderBy(userRoles.assignedAt);

    const formattedStaff = staffMembers.map((staff) => ({
      id: staff.id,
      name: staff.name,
      role: staff.staffTitle || '',
      bio: `${staff.name} serves as ${staff.staffTitle} at Ucon Ministries.`,
      expertise: [staff.roleName],
      image: staff.image || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop`,
      email: staff.email,
      linkedin: "#",
      phone: staff.phone || "",
      department: categorizeDepartment(staff.staffTitle),
    }));

    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json([]);
  }
}

function categorizeDepartment(staffTitle: string | null): string {
  if (!staffTitle) return "ministry";

  const title = staffTitle.toLowerCase();

  if (
    title.includes("executive") ||
    title.includes("director") ||
    title.includes("founder") ||
    title.includes("ceo") ||
    title.includes("president") ||
    title.includes("hr manager") ||
    title.includes("hiring")
  ) {
    return "leadership";
  }

  if (
    title.includes("outreach") ||
    title.includes("advocacy") ||
    title.includes("ambassador") ||
    title.includes("transportation") ||
    title.includes("logistics")
  ) {
    return "outreach";
  }

  if (
    title.includes("worship") ||
    title.includes("music") ||
    title.includes("creative") ||
    title.includes("arts") ||
    title.includes("prayer")
  ) {
    return "worship";
  }

  return "ministry";
}