import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ALLOWED_KEYS = [
  "maintenance_mode",
  "maintenance_message",
  "maintenance_reason",
  "maintenance_estimated_end",
  "public_prayer_wall",
  "online_registrations",
] as const;

type SettingKey = (typeof ALLOWED_KEYS)[number];

export const MAINTENANCE_DURATIONS: Record<string, number> = {
  scheduled:  120,
  database:    60,
  server:      90,
  security:   240,
  deployment:  30,
  emergency:    0,
  unknown:      0,
};

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  try {
    const rows = await db.select().from(siteSettings);
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (ALLOWED_KEYS.includes(row.key as SettingKey)) {
        settings[row.key] = row.value;
      }
    }
    const defaults: Record<SettingKey, string> = {
      maintenance_mode: "false",
      maintenance_message: "",
      maintenance_reason: "scheduled",
      maintenance_estimated_end: "",
      public_prayer_wall: "true",
      online_registrations: "true",
    };
    return NextResponse.json({ ...defaults, ...settings });
  } catch (err) {
    console.error("[settings/GET]", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.includes(key as SettingKey)) continue;
      const stringValue = String(value);

      if (key === "maintenance_mode" && stringValue === "true") {
        const reason = (body.maintenance_reason as string) ?? "scheduled";
        const duration = MAINTENANCE_DURATIONS[reason] ?? 0;
        const end = duration > 0
          ? new Date(Date.now() + duration * 60000).toISOString()
          : "";
        await upsert("maintenance_estimated_end", end, user.id, now);
      }

      await upsert(key, stringValue, user.id, now);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings/PATCH]", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

async function upsert(key: string, value: string, updatedBy: string, updatedAt: string) {
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value, updatedBy, updatedAt }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value, updatedBy, updatedAt });
  }
}
