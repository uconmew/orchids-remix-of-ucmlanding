
import { db } from "../src/db";
import { user, account, uconRoles, roles } from "../src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function main() {
  console.log("🚀 Starting staff population...");

  // 1. Get roles
  const allRoles = await db.select().from(roles);
  const roleMap = {
    executive: allRoles.find(r => r.name === "Executive Leadership")?.id || 1,
    director: allRoles.find(r => r.name === "Program Directors")?.id || 2,
    coordinator: allRoles.find(r => r.name === "Ministry Coordinators")?.id || 3,
    staff: allRoles.find(r => r.name === "Staff Members")?.id || 4,
  };

  const staffData = [
    {
      name: "Troy Salazar",
      email: "t.salazar@uconministries.org",
      role: "Founding Visionary Lead",
      roleType: "executive",
      permission: 100,
      duty: 100,
    },
    {
      name: "Brittany Joseph",
      email: "b.joseph@uconministries.org",
      role: "Ministry Programs Multiplication Director",
      roleType: "director",
      permission: 80,
      duty: 90,
    },
    {
      name: "Pastor Cassie Adams",
      email: "c.adams@uconministries.org",
      role: "Spiritual Formation Director",
      roleType: "director",
      permission: 80,
      duty: 90,
    },
    {
      name: "Clinical Director",
      email: "clinical@uconministries.org",
      role: "Mental Health & Clinical Excellence",
      roleType: "director",
      permission: 90,
      duty: 85,
    },
    {
      name: "Niko Owens",
      email: "n.owens@uconministries.org",
      role: "Programs Coordinator",
      roleType: "coordinator",
      permission: 60,
      duty: 70,
    },
    {
      name: "Nicole Hedges",
      email: "n.hedges@uconministries.org",
      role: "Outreach Director",
      roleType: "coordinator",
      permission: 60,
      duty: 70,
    },
    {
      name: "Shandale Spiller",
      email: "shandale@uconministries.org",
      role: "Ucon Ambassador",
      roleType: "staff",
      permission: 40,
      duty: 50,
    },
    {
      name: "Robert Taylor",
      email: "rtaylor@uconministries.org",
      role: "Transportation & Logistics Manager",
      roleType: "staff",
      permission: 40,
      duty: 50,
    },
    {
      name: "Minister Elijah Washington",
      email: "ewashington@uconministries.org",
      role: "Worship Director",
      roleType: "staff",
      permission: 40,
      duty: 50,
    },
    {
      name: "Grace Thompson",
      email: "gthompson@uconministries.org",
      role: "Creative Arts Coordinator",
      roleType: "staff",
      permission: 40,
      duty: 50,
    },
    {
      name: "Deacon Thomas Brown",
      email: "tbrown@uconministries.org",
      role: "Prayer Ministry Lead",
      roleType: "staff",
      permission: 40,
      duty: 50,
    },
  ];

  for (const staff of staffData) {
    // Check if user exists
    const existingUser = await db.select().from(user).where(eq(user.email, staff.email)).limit(1);
    let userId: string;

    if (existingUser.length === 0) {
      userId = crypto.randomUUID();
      const regNumber = `UCN-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await db.insert(user).values({
        id: userId,
        name: staff.name,
        email: staff.email,
        registrationNumber: regNumber,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        userId: userId,
        providerId: "credentials",
        password: "hashed_ucon123", // Placeholder for actual hashed password
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ Created user and account for: ${staff.name}`);
    } else {
      userId = existingUser[0].id;
      console.log(`ℹ️ User already exists: ${staff.name}`);
    }

    // Check if role exists for user
    const existingRole = await db.select().from(uconRoles).where(eq(uconRoles.userId, userId)).limit(1);
    
    if (existingRole.length === 0) {
      await db.insert(uconRoles).values({
        userId: userId,
        roleId: roleMap[staff.roleType as keyof typeof roleMap],
        staffTitle: staff.role,
        permissionClearance: staff.permission,
        dutyClearance: staff.duty,
        assignedAt: new Date().toISOString(),
      });
      console.log(`✅ Assigned staff role to: ${staff.name}`);
    } else {
      await db.update(uconRoles).set({
        staffTitle: staff.role,
        permissionClearance: staff.permission,
        dutyClearance: staff.duty,
      }).where(eq(uconRoles.userId, userId));
      console.log(`✅ Updated staff role for: ${staff.name}`);
    }
  }

  console.log("🏁 Staff population complete!");
}

main().catch(console.error);
