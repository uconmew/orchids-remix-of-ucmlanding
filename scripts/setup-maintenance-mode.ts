/**
 * scripts/setup-maintenance-mode.ts
 *
 * Ucon Ministries — Maintenance Mode Setup Script
 * ─────────────────────────────────────────────────
 * Run once to wire up real maintenance mode.
 *
 * What this does:
 *   1. Creates the site_settings table in the database
 *   2. Seeds the four maintenance mode keys with safe defaults
 *   3. Patches src/db/schema.ts to include the siteSettings export
 *   4. Writes all new source files to their correct locations
 *   5. Updates middleware.ts
 *   6. Creates the markdown reference doc
 *   7. git add . → git commit → git push
 *
 * Usage:
 *   npx tsx scripts/setup-maintenance-mode.ts
 *
 * Safe to re-run — all DB ops are IF NOT EXISTS / ON CONFLICT DO NOTHING,
 * and file writes skip if contents already match.
 */

import 'dotenv/config';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Colors ───────────────────────────────────────────────────────────────────
const c = {
  purple: (s: string) => `\x1b[35m${s}\x1b[0m`,
  orange: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function log(msg: string)    { console.log(msg); }
function ok(msg: string)     { console.log(`  ${c.green('✓')} ${msg}`); }
function skip(msg: string)   { console.log(`  ${c.dim('↩ skip')} ${c.dim(msg)}`); }
function fail(msg: string)   { console.log(`  ${c.red('✗')} ${msg}`); }
function section(msg: string){ console.log(`\n${c.purple('▸')} ${c.bold(msg)}`); }

// ─── Write a file only if it doesn't exist or content differs ─────────────────
function writeFile(filePath: string, content: string, description: string) {
  const abs = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(abs);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(abs)) {
    const existing = fs.readFileSync(abs, 'utf-8');
    if (existing === content) {
      skip(`${description} (unchanged)`);
      return;
    }
  }

  fs.writeFileSync(abs, content, 'utf-8');
  ok(description);
}

// ─── Patch a file: append a block if a marker string isn't already present ────
function appendIfMissing(filePath: string, marker: string, toAppend: string, description: string) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    fail(`${description} — file not found: ${filePath}`);
    return;
  }
  const current = fs.readFileSync(abs, 'utf-8');
  if (current.includes(marker)) {
    skip(`${description} (already present)`);
    return;
  }
  fs.writeFileSync(abs, current + '\n' + toAppend, 'utf-8');
  ok(description);
}

// ─── DB: create table + seed defaults ─────────────────────────────────────────
async function runMigration() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fail('DATABASE_URL is not set in .env — skipping DB migration');
    return;
  }

  const sql = postgres(url, { max: 1, prepare: false });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id"         SERIAL PRIMARY KEY,
        "key"        TEXT NOT NULL UNIQUE,
        "value"      TEXT NOT NULL,
        "updated_by" TEXT REFERENCES "user"("id"),
        "updated_at" TEXT NOT NULL
      )
    `;
    ok('site_settings table created (or already exists)');

    const defaults = [
      ['maintenance_mode',          'false'],
      ['maintenance_message',       ''],
      ['maintenance_reason',        'scheduled'],
      ['maintenance_estimated_end', ''],
      ['public_prayer_wall',        'true'],
      ['online_registrations',      'true'],
    ];

    for (const [key, value] of defaults) {
      await sql`
        INSERT INTO "site_settings" ("key", "value", "updated_at")
        VALUES (${key}, ${value}, ${new Date().toISOString()})
        ON CONFLICT ("key") DO NOTHING
      `;
    }
    ok(`Seeded ${defaults.length} default settings`);
  } catch (err: any) {
    fail(`DB migration failed: ${err.message}`);
  } finally {
    await sql.end();
  }
}

// ─── FILE CONTENTS ─────────────────────────────────────────────────────────────

const SCHEMA_ADDITION = `
// ─── Site Settings ──────────────────────────────────────────────────────────
// Admin-controlled key/value config. Powers maintenance mode + future toggles.
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedBy: text('updated_by').references(() => user.id),
  updatedAt: text('updated_at').notNull(),
});
`;

const SETTINGS_API = `import { NextRequest, NextResponse } from "next/server";
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
`;

const MAINTENANCE_PAGE = `"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOGO = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png";

interface TimeLeft { hours: number; minutes: number; seconds: number; }

function getTimeLeft(end: string): TimeLeft | null {
  const diff = new Date(end).getTime() - Date.now();
  if (!end || diff <= 0) return null;
  return {
    hours:   Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

export default function MaintenancePage() {
  const [estimatedEnd, setEstimatedEnd] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        setEstimatedEnd(d.maintenance_estimated_end ?? "");
        setCustomMessage(d.maintenance_message ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!estimatedEnd) return;
    const tick = () => setTimeLeft(getTimeLeft(estimatedEnd));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 60% 0%, rgba(169,47,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(242,140,40,0.15) 0%, transparent 55%), #0d0d14",
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #A92FFA 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20"
        style={{ background: "radial-gradient(circle, #F28C28 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <div className="relative w-28 h-28 drop-shadow-[0_0_40px_rgba(169,47,250,0.5)]">
          <Image src={LOGO} alt="Ucon Ministries Logo" fill className="object-contain" priority />
        </div>

        <div>
          <p className="text-[#A92FFA] font-semibold tracking-widest text-xs uppercase mb-2">Ucon Ministries</p>
          <div className="w-24 h-px mx-auto" style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28)" }} />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{ background: "linear-gradient(135deg, #ffffff 40%, #F28C28 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          We&apos;ll be right back.
        </h1>

        <div className="space-y-4 text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
          {customMessage ? (
            <p>{customMessage}</p>
          ) : (
            <>
              <p>Sometimes the most sacred thing you can do is stop. Breathe. Let something be tended to.</p>
              <p>We&apos;re behind the scenes right now — quiet hands doing quiet work — so that when you come back, this place is a little more ready to hold you.</p>
              <p className="text-gray-400 text-sm">Your story isn&apos;t on pause. We&apos;re just making space for the next chapter to open well.</p>
            </>
          )}
        </div>

        {timeLeft ? (
          <div className="w-full">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Estimated time remaining</p>
            <div className="flex items-center justify-center gap-4">
              {[{ label: "HRS", value: timeLeft.hours }, { label: "MIN", value: timeLeft.minutes }, { label: "SEC", value: timeLeft.seconds }]
                .map(({ label, value }, i) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold text-white"
                        style={{ background: "linear-gradient(135deg, rgba(169,47,250,0.25), rgba(242,140,40,0.15))", border: "1px solid rgba(169,47,250,0.3)" }}>
                        {pad(value)}
                      </div>
                      <p className="text-[10px] text-gray-500 tracking-widest mt-2">{label}</p>
                    </div>
                    {i < 2 && <span className="text-2xl font-bold text-[#A92FFA] mb-4 opacity-60">:</span>}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 rounded-full text-sm text-gray-400"
            style={{ background: "rgba(169,47,250,0.08)", border: "1px solid rgba(169,47,250,0.2)" }}>
            ✦ Duration unknown — we&apos;re working as fast as love allows
          </div>
        )}

        <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(169,47,250,0.4), rgba(242,140,40,0.4), transparent)" }} />
        <p className="text-xs text-gray-600">United Convict Ministries Inc. &nbsp;·&nbsp; Where Your Past Becomes Your Purpose</p>
      </div>
    </div>
  );
}
`;

const MAINTENANCE_BANNER = `"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function MaintenanceBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () =>
      fetch("/api/admin/settings")
        .then(r => r.json())
        .then(d => setActive(d.maintenance_mode === "true"))
        .catch(() => {});
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium"
      style={{ background: "linear-gradient(90deg, rgba(242,140,40,0.15), rgba(242,140,40,0.08), rgba(242,140,40,0.15))", borderBottom: "1px solid rgba(242,140,40,0.35)", color: "#F28C28" }}>
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Maintenance mode is <strong>active</strong> — the public site is blocked for visitors.{" "}
        <Link href="/admin/settings" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Turn it off in Settings
        </Link>
      </span>
    </div>
  );
}
`;

const ADMIN_SETTINGS_PAGE = `"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Save, Loader2, AlertTriangle, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  { value: "scheduled",  label: "Scheduled Maintenance",   estimate: "~2 hours"   },
  { value: "database",   label: "Database Issue",           estimate: "~1 hour"    },
  { value: "server",     label: "Server Trouble",           estimate: "~1.5 hours" },
  { value: "security",   label: "Security Update",          estimate: "~4 hours"   },
  { value: "deployment", label: "New Deployment",           estimate: "~30 minutes"},
  { value: "emergency",  label: "Emergency (Unknown)",      estimate: "Unknown"    },
  { value: "unknown",    label: "Unknown Issue",            estimate: "Unknown"    },
];

const DEFAULTS = {
  maintenance_mode: "false", maintenance_message: "", maintenance_reason: "scheduled",
  maintenance_estimated_end: "", public_prayer_wall: "true", online_registrations: "true",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [dirty, setDirty]       = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { setSettings({ ...DEFAULTS, ...d }); setLoading(false); })
      .catch(() => { toast.error("Couldn't load settings."); setLoading(false); });
  }, []);

  function update(key: string, value: string) {
    setSettings(p => ({ ...p, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved. Changes are live.");
      setDirty(false);
    } catch {
      toast.error("Save failed. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  const isOn = settings.maintenance_mode === "true";
  const reasonMeta = REASONS.find(r => r.value === settings.maintenance_reason);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#A92FFA] mx-auto" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Every save reaches the database — nothing here is fake.</p>
        {dirty && <Badge className="mt-3 bg-[#F28C28]/20 text-[#F28C28] border-[#F28C28]/30">Unsaved changes</Badge>}
      </div>

      <Card className={\`border-2 transition-all duration-300 \${isOn ? "border-[#F28C28] bg-[#F28C28]/5" : "border-border"}\`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F28C28]/10 rounded-lg flex items-center justify-center">
              <WrenchIcon className="w-5 h-5 text-[#F28C28]" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                Maintenance Mode
                {isOn && <Badge className="bg-[#F28C28] text-white text-xs">ACTIVE</Badge>}
              </CardTitle>
              <CardDescription>When active, every visitor sees the maintenance page. Admins see a warning banner.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Enable Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">{isOn ? "Site is currently locked to visitors" : "Site is publicly accessible"}</p>
            </div>
            <Switch checked={isOn} onCheckedChange={v => update("maintenance_mode", v ? "true" : "false")} />
          </div>
          <div className="space-y-2">
            <Label>Reason for Maintenance</Label>
            <Select value={settings.maintenance_reason} onValueChange={v => update("maintenance_reason", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label} <span className="text-xs text-muted-foreground ml-1">({r.estimate})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reasonMeta && (
              <p className="text-xs text-muted-foreground">
                Estimated duration: <span className="text-[#F28C28] font-medium">{reasonMeta.estimate}</span> — auto-sets the countdown timer.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Custom Message <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <Textarea placeholder="Leave blank for the default Ucon pastoral message..." value={settings.maintenance_message}
              onChange={e => update("maintenance_message", e.target.value)} rows={3} className="resize-none" />
          </div>
          {isOn && (
            <div className="flex items-start gap-3 p-3 bg-[#F28C28]/10 border border-[#F28C28]/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#F28C28] mt-0.5 shrink-0" />
              <p className="text-sm text-[#F28C28]">Maintenance mode is <strong>ON</strong>. Save to apply.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F28C28]/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#F28C28]" />
            </div>
            <div>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Public website configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "public_prayer_wall",  label: "Public Prayer Wall",   desc: "Allow public viewing of prayer requests" },
            { key: "online_registrations", label: "Online Registrations", desc: "Enable online event and workshop registrations" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              <Switch checked={settings[key as keyof typeof settings] === "true"}
                onCheckedChange={v => update(key, v ? "true" : "false")} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" size="lg" onClick={() => { setSettings(DEFAULTS); setDirty(true); }}>Reset to Defaults</Button>
        <Button size="lg" className="bg-[#A92FFA] hover:bg-[#A92FFA]/90" onClick={save} disabled={saving || !dirty}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
`;

const MIDDLEWARE = `import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/api/admin/settings",
  "/staff-login",
  "/admin/",
  "/staff/",
  "/_next/",
  "/api/auth/",
  "/favicon",
];

function isBypass(p: string) {
  return MAINTENANCE_BYPASS.some(b => p.startsWith(b));
}

async function maintenanceActive(): Promise<boolean> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(\`\${base}/api/admin/settings\`, { next: { revalidate: 30 } });
    if (!res.ok) return false;
    const data = await res.json();
    return data.maintenance_mode === "true";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isBypass(pathname)) {
    const maintenance = await maintenanceActive();
    if (maintenance) {
      const staffCookie  = request.cookies.get("staff-session")?.value;
      const adminCookie  = request.cookies.get("admin-session")?.value;
      const isStaff = staffCookie === "true" || adminCookie === "true";

      if (!isStaff) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
      const response = NextResponse.next();
      response.headers.set("x-maintenance-active", "true");
      return response;
    }
  }

  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    console.log("Middleware: Session check failed, allowing page-level auth");
  }

  const staffCookie = request.cookies.get("staff-session")?.value;
  const adminCookie = request.cookies.get("admin-session")?.value;
  const isStaffSession = staffCookie === "true";
  const isAdminSession = adminCookie === "true";

  if (!session && (
    pathname.startsWith("/convict-portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff/tools") ||
    pathname.startsWith("/staff/dashboard") ||
    pathname.startsWith("/ldi-waitlist")
  )) {
    if (isStaffSession || isAdminSession) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") || pathname.startsWith("/staff/") ? "/staff-login" : "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
`;

const MARKDOWN_DOC = `# Maintenance Mode — Architecture Reference

> Ucon Ministries · Auto-generated by scripts/setup-maintenance-mode.ts

---

## What it does

When an admin flips **Maintenance Mode ON** in \`/admin/settings\`, the entire public-facing
site is replaced with a full-screen maintenance page. Staff and admins can still access
their dashboards but see a persistent orange warning banner.

---

## Files

| File | Purpose |
|------|---------|
| \`drizzle/migrations/0013_add_site_settings.sql\` | Creates \`site_settings\` table |
| \`src/db/schema.ts\` | \`siteSettings\` Drizzle export (appended) |
| \`src/app/api/admin/settings/route.ts\` | GET + PATCH settings API |
| \`src/app/admin/settings/page.tsx\` | Admin UI with real switches |
| \`src/app/maintenance/page.tsx\` | Public maintenance page |
| \`src/components/MaintenanceBanner.tsx\` | Admin/staff warning banner |
| \`middleware.ts\` | Route interception |

---

## Maintenance Reasons → Auto Durations

| Reason | Duration |
|--------|----------|
| scheduled | 120 min |
| database | 60 min |
| server | 90 min |
| security | 240 min |
| deployment | 30 min |
| emergency | Unknown |
| unknown | Unknown |

---

## Middleware Flow

\`\`\`
Request → bypass route? → skip
         ↓ no
         fetch /api/admin/settings (30s cache)
         maintenance_mode === "true"?
         ↓ yes
         has staff/admin cookie?
         no → redirect /maintenance
         yes → pass through + x-maintenance-active header → banner shown
\`\`\`

---

## Add Banner to Admin Layout

\`\`\`tsx
// src/app/admin/layout.tsx
import { MaintenanceBanner } from "@/components/MaintenanceBanner";
// render as first child
<MaintenanceBanner />
\`\`\`

---

## Gotchas

1. \`NEXT_PUBLIC_APP_URL\` must be set in production \`.env\`
2. 30s cache on maintenance check — small window after toggling OFF
3. GET /api/admin/settings is public (maintenance page reads it without auth)
4. Staff bypass is cookie-based — cleared cookies = maintenance page until re-login
`;

// ─── Git: stage, commit, push ─────────────────────────────────────────────────
function git(cmd: string): string {
  try {
    return execSync(cmd, { cwd: process.cwd(), stdio: 'pipe' }).toString().trim();
  } catch (err: any) {
    throw new Error(err.stderr?.toString().trim() ?? err.message);
  }
}

async function runGit() {
  // Make sure we're actually inside a git repo
  try {
    git('git rev-parse --is-inside-work-tree');
  } catch {
    fail('Not inside a git repository — skipping git steps');
    return;
  }

  // Show what changed
  const status = git('git status --short');
  if (!status) {
    skip('Nothing to commit (working tree clean)');
    return;
  }

  console.log(c.dim('\n  Changed files:'));
  status.split('\n').forEach(line => console.log(c.dim(`    ${line}`)));
  console.log();

  // Stage everything
  try {
    git('git add .');
    ok('git add .');
  } catch (err: any) {
    fail(`git add failed: ${err.message}`);
    return;
  }

  // Commit
  const msg = 'feat: real maintenance mode with DB, countdown timer, and banner';
  try {
    git(`git commit -m "${msg}"`);
    ok(`git commit — "${msg}"`);
  } catch (err: any) {
    fail(`git commit failed: ${err.message}`);
    return;
  }

  // Push — detect current branch first
  let branch = 'main';
  try {
    branch = git('git rev-parse --abbrev-ref HEAD');
  } catch {
    // fallback to main
  }

  try {
    git(`git push origin ${branch}`);
    ok(`git push origin ${branch}`);
  } catch (err: any) {
    // Push can fail for legit reasons (no remote, SSH keys, etc.)
    // Don't hard-fail — just report and let the dev handle it
    fail(`git push failed: ${err.message}`);
    console.log(c.dim(`\n  To push manually: git push origin ${branch}`));
  }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log();
  console.log(c.bold(c.purple('  ╔══════════════════════════════════════════╗')));
  console.log(c.bold(c.purple('  ║  Ucon Ministries — Maintenance Mode Setup ║')));
  console.log(c.bold(c.purple('  ╚══════════════════════════════════════════╝')));
  console.log();

  // 1. Database
  section('Step 1 — Database migration');
  await runMigration();

  // 2. Schema
  section('Step 2 — Patch src/db/schema.ts');
  appendIfMissing(
    'src/db/schema.ts',
    "site_settings",
    SCHEMA_ADDITION,
    'Added siteSettings export to schema.ts'
  );

  // 3. API route
  section('Step 3 — Settings API route');
  writeFile('src/app/api/admin/settings/route.ts', SETTINGS_API, 'src/app/api/admin/settings/route.ts');

  // 4. Admin settings page
  section('Step 4 — Admin settings page');
  writeFile('src/app/admin/settings/page.tsx', ADMIN_SETTINGS_PAGE, 'src/app/admin/settings/page.tsx');

  // 5. Maintenance page
  section('Step 5 — Maintenance page');
  writeFile('src/app/maintenance/page.tsx', MAINTENANCE_PAGE, 'src/app/maintenance/page.tsx');

  // 6. Banner component
  section('Step 6 — Maintenance banner component');
  writeFile('src/components/MaintenanceBanner.tsx', MAINTENANCE_BANNER, 'src/components/MaintenanceBanner.tsx');

  // 7. Middleware
  section('Step 7 — Middleware');
  writeFile('middleware.ts', MIDDLEWARE, 'middleware.ts');

  // 8. Markdown doc
  section('Step 8 — Markdown reference doc');
  writeFile('markdown/maintenance-mode.md', MARKDOWN_DOC, 'markdown/maintenance-mode.md');

  // 9. Git
  section('Step 9 — Git commit & push');
  await runGit();

  // ─── Final note ──────────────────────────────────────────────────────────────
  console.log();
  console.log(c.bold(c.green('  ✅  All done. One manual step remaining:')));
  console.log();
  console.log(c.orange('  Add <MaintenanceBanner /> to src/app/admin/layout.tsx'));
  console.log(c.dim('  import { MaintenanceBanner } from "@/components/MaintenanceBanner"'));
  console.log(c.dim('  Render it as the very first child inside your layout wrapper.'));
  console.log();
  console.log(c.dim('  Also confirm NEXT_PUBLIC_APP_URL is set in .env for production.'));
  console.log();
}

main().catch(err => {
  console.error(c.red('\n  Fatal error:'), err);
  process.exit(1);
});
