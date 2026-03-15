/**
 * scripts/setup-recovery-banner.ts
 *
 * Ucon Ministries — Recovery Banner + Maintenance Mode Fix
 * ─────────────────────────────────────────────────────────
 * Run once to:
 *   1. Seed `recovery_banner_enabled` key into site_settings DB table
 *   2. Patch src/app/api/admin/settings/route.ts  (add new allowed key)
 *   3. Patch src/app/admin/settings/page.tsx      (add sub-toggle UI)
 *   4. Write src/components/RecoveryBanner.tsx     (new component)
 *   5. Patch src/app/page.tsx                      (mount banner)
 *   6. Replace src/app/maintenance/page.tsx        (full site-lock screen)
 *   7. Replace middleware.ts                       (fix DB-direct read)
 *   8. Write markdown/maintenance-and-recovery-banner.md
 *   9. git add . → git commit → git push
 *
 * Usage:
 *   npx tsx scripts/setup-recovery-banner.ts
 *
 * Safe to re-run — all DB ops are ON CONFLICT DO NOTHING,
 * file writes skip when content already matches, patches skip when
 * the marker string is already present.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Colours ──────────────────────────────────────────────────────────────────
const c = {
  purple: (s: string) => `\x1b[35m${s}\x1b[0m`,
  orange: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function ok(msg: string)      { console.log(`  ${c.green('✓')} ${msg}`); }
function skip(msg: string)    { console.log(`  ${c.dim('↩ skip')} ${c.dim(msg)}`); }
function fail(msg: string)    { console.log(`  ${c.red('✗')} ${msg}`); }
function section(msg: string) { console.log(`\n${c.purple('▸')} ${c.bold(msg)}`); }

// ─── File helpers ─────────────────────────────────────────────────────────────

/** Write a file only when it doesn't exist or the content differs. */
function writeFile(filePath: string, content: string, label: string) {
  const abs = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  if (fs.existsSync(abs)) {
    if (fs.readFileSync(abs, 'utf-8') === content) {
      skip(`${label} (unchanged)`);
      return;
    }
  }
  fs.writeFileSync(abs, content, 'utf-8');
  ok(label);
}

/**
 * Patch a file by replacing `oldStr` with `newStr`.
 * `marker` is a unique string used to detect whether the patch was already applied.
 * If `marker` is already in the file, the patch is skipped.
 */
function patchFile(
  filePath: string,
  marker: string,
  oldStr: string,
  newStr: string,
  label: string,
) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    fail(`${label} — file not found: ${filePath}`);
    return;
  }

  const src = fs.readFileSync(abs, 'utf-8');

  if (src.includes(marker)) {
    skip(`${label} (already patched)`);
    return;
  }

  if (!src.includes(oldStr)) {
    fail(`${label} — target string not found in ${filePath}. Manual patch required.`);
    return;
  }

  fs.writeFileSync(abs, src.replace(oldStr, newStr), 'utf-8');
  ok(label);
}

/** Append a block to a file only when a marker string is absent. */
function appendIfMissing(filePath: string, marker: string, toAppend: string, label: string) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    fail(`${label} — file not found: ${filePath}`);
    return;
  }
  const src = fs.readFileSync(abs, 'utf-8');
  if (src.includes(marker)) {
    skip(`${label} (already present)`);
    return;
  }
  fs.writeFileSync(abs, src + '\n' + toAppend, 'utf-8');
  ok(label);
}

// ─── DB: seed recovery_banner_enabled ────────────────────────────────────────
async function seedDB() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fail('DATABASE_URL not set in .env — skipping DB seed');
    return;
  }

  try {
    // Dynamic import so the script can still run (and report the error)
    // if postgres isn't installed, rather than crashing at the top-level.
    const postgres = (await import('postgres')).default;
    const sql = postgres(url, { max: 1, prepare: false });

    try {
      await sql`
        INSERT INTO "site_settings" ("key", "value", "updated_at")
        VALUES ('recovery_banner_enabled', 'false', ${new Date().toISOString()})
        ON CONFLICT ("key") DO NOTHING
      `;
      ok('Seeded recovery_banner_enabled = false (or already exists)');
    } finally {
      await sql.end();
    }
  } catch (err: any) {
    fail(`DB seed failed: ${err.message}`);
  }
}

// ─── Git helpers ──────────────────────────────────────────────────────────────
function git(cmd: string): string {
  try {
    return execSync(cmd, { cwd: process.cwd(), stdio: 'pipe' }).toString().trim();
  } catch (err: any) {
    throw new Error(err.stderr?.toString().trim() ?? err.message);
  }
}

async function runGit() {
  try { git('git rev-parse --is-inside-work-tree'); }
  catch { fail('Not inside a git repository — skipping git steps'); return; }

  const status = git('git status --short');
  if (!status) { skip('Nothing to commit (working tree clean)'); return; }

  console.log(c.dim('\n  Changed files:'));
  status.split('\n').forEach(l => console.log(c.dim(`    ${l}`)));

  try { git('git add .'); ok('git add .'); }
  catch (err: any) { fail(`git add failed: ${err.message}`); return; }

  const msg = 'feat: recovery banner + fix maintenance mode redirect';
  try { git(`git commit -m "${msg}"`); ok(`git commit — "${msg}"`); }
  catch (err: any) { fail(`git commit failed: ${err.message}`); return; }

  let branch = 'main';
  try { branch = git('git rev-parse --abbrev-ref HEAD'); } catch {}

  try { git(`git push origin ${branch}`); ok(`git push origin ${branch}`); }
  catch (err: any) {
    fail(`git push failed: ${err.message}`);
    console.log(c.dim(`\n  To push manually: git push origin ${branch}`));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE CONTENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. RecoveryBanner component ─────────────────────────────────────────────
const RECOVERY_BANNER = `"use client";

import { useEffect, useState } from "react";
import { X, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";

const SESSION_KEY = "ucon-recovery-dismissed";

export default function RecoveryBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;

    const check = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (data.recovery_banner_enabled === "true") setVisible(true);
        else setVisible(false);
      } catch {}
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-500"
      style={{
        background:
          "linear-gradient(90deg, rgba(15,10,28,0.97) 0%, rgba(25,12,40,0.97) 50%, rgba(15,10,28,0.97) 100%)",
        borderTop: "1px solid rgba(169,47,250,0.35)",
        boxShadow: "0 -8px 40px rgba(169,47,250,0.15), 0 -2px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28, #A92FFA)" }}
      />
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start sm:items-center gap-3">
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 sm:mt-0"
          style={{ background: "rgba(242,140,40,0.12)", border: "1px solid rgba(242,140,40,0.3)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "#F28C28" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
            <span className="font-semibold mr-1.5" style={{ color: "#F28C28" }}>
              We&apos;re still getting back on our feet.
            </span>
            We&apos;re sorry for the inconvenience — our systems are recovering, and{" "}
            <span className="font-medium" style={{ color: "#A92FFA" }}>
              our transit booking system is still affected.
            </span>{" "}
            If you need help right now, please{" "}
            <Link
              href="/contact"
              className="underline underline-offset-2 transition-opacity hover:opacity-80 font-medium"
              style={{ color: "#F28C28" }}
            >
              reach us through our contact form
            </Link>{" "}
            or call us at{" "}
            <a
              href="tel:7206639243"
              className="font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{ color: "#A92FFA" }}
            >
              <Phone className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              720.663.9243
            </a>
            . You matter to us — we haven&apos;t forgotten you.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss recovery notice"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 mt-0.5 sm:mt-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
`;

// ─── 2. Maintenance page ──────────────────────────────────────────────────────
const MAINTENANCE_PAGE = `"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const LOGO =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png";

interface TimeLeft { hours: number; minutes: number; seconds: number; }

function getTimeLeft(end: string): TimeLeft | null {
  const diff = new Date(end).getTime() - Date.now();
  if (!end || diff <= 0) return null;
  return {
    hours:   Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function MaintenancePage() {
  const [estimatedEnd, setEstimatedEnd]   = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [timeLeft, setTimeLeft]           = useState<TimeLeft | null>(null);

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
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 0%, rgba(169,47,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(242,140,40,0.15) 0%, transparent 55%), #0d0d14",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #A92FFA 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F28C28 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <div className="relative w-24 h-24 drop-shadow-[0_0_40px_rgba(169,47,250,0.5)]">
          <Image src={LOGO} alt="Ucon Ministries Logo" fill className="object-contain" priority />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-semibold tracking-widest text-xs uppercase" style={{ color: "#A92FFA" }}>
            Ucon Ministries
          </p>
          <div className="w-24 h-px" style={{ background: "linear-gradient(90deg, #A92FFA, #F28C28)" }} />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight"
          style={{
            background: "linear-gradient(135deg, #ffffff 40%, #F28C28 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          We&apos;ll be right back.
        </h1>

        <div
          className="rounded-2xl p-6 text-left space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(169,47,250,0.2)" }}
        >
          {customMessage ? (
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
              {customMessage}
            </p>
          ) : (
            <>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                Hey. We see you showing up, and that means something. We&apos;re in
                the middle of some necessary work on our end — the kind that makes
                everything stronger on the other side. We haven&apos;t gone anywhere.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Sit tight. Come back soon. And if you need us right now — we mean
                it — reach out. We&apos;re still here.
              </p>
            </>
          )}
        </div>

        {timeLeft && (
          <div className="flex items-center gap-4">
            {[
              { label: "HRS", val: timeLeft.hours },
              { label: "MIN", val: timeLeft.minutes },
              { label: "SEC", val: timeLeft.seconds },
            ].map(({ label, val }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold font-mono"
                    style={{ background: "rgba(169,47,250,0.12)", border: "1px solid rgba(169,47,250,0.3)", color: "#A92FFA" }}
                  >
                    {pad(val)}
                  </div>
                  <span className="text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <span className="text-2xl font-bold -mt-5" style={{ color: "rgba(255,255,255,0.25)" }}>:</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/contact"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #A92FFA, #7c1fd4)", color: "#fff" }}
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </Link>
          <a
            href="tel:7206639243"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "rgba(242,140,40,0.12)", border: "1px solid rgba(242,140,40,0.35)", color: "#F28C28" }}
          >
            <Phone className="w-4 h-4" />
            720.663.9243
          </a>
        </div>

        <Link
          href="/staff-login"
          className="text-xs transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Staff login →
        </Link>
      </div>
    </div>
  );
}
`;

// ─── 3. Fixed middleware ──────────────────────────────────────────────────────
const MIDDLEWARE = `import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Routes that bypass maintenance mode entirely
const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/staff-login",
  "/api/admin/settings",
  "/api/auth/",
  "/_next/",
  "/favicon",
  "/public/",
];

function isBypass(pathname: string): boolean {
  return MAINTENANCE_BYPASS.some(b => pathname.startsWith(b));
}

// Read maintenance state directly from DB.
// We do NOT use fetch() here — middleware runs in the Edge Runtime and a
// self-referencing fetch() is unreliable in that context, causing the toggle
// to silently always return false (the original bug).
async function maintenanceActive(): Promise<boolean> {
  try {
    const { db } = await import("@/db");
    const { siteSettings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "maintenance_mode"))
      .limit(1);

    return rows[0]?.value === "true";
  } catch (err) {
    console.error("[middleware] maintenanceActive DB read failed:", err);
    return false; // fail open — never lock out visitors due to a DB error
  }
}

function hasStaffAccess(request: NextRequest): boolean {
  const staffCookie = request.cookies.get("staff-session")?.value;
  const adminCookie = request.cookies.get("admin-session")?.value;
  return staffCookie === "true" || adminCookie === "true";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode gate ────────────────────────────────────────────────
  if (!isBypass(pathname)) {
    const maintenance = await maintenanceActive();
    if (maintenance) {
      if (!hasStaffAccess(request)) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
      const response = NextResponse.next();
      response.headers.set("x-maintenance-active", "true");
      return response;
    }
  }

  // ── Auth-protected route guard ───────────────────────────────────────────
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    console.log("[middleware] Session check failed, deferring to page-level auth");
  }

  const isStaffSession = hasStaffAccess(request);
  const isProtectedRoute =
    pathname.startsWith("/convict-portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff/tools") ||
    pathname.startsWith("/staff/dashboard") ||
    pathname.startsWith("/ldi-waitlist");

  if (!session && isProtectedRoute) {
    if (isStaffSession) return NextResponse.next();
    const url = request.nextUrl.clone();
    const isStaffRoute = pathname.startsWith("/admin") || pathname.startsWith("/staff/");
    url.pathname = isStaffRoute ? "/staff-login" : "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
`;

// ─── 4. Settings API patch strings ───────────────────────────────────────────
// Patch: add recovery_banner_enabled to ALLOWED_KEYS array
const API_ALLOWED_KEYS_OLD = `  "maintenance_estimated_end",
  "public_prayer_wall",`;

const API_ALLOWED_KEYS_NEW = `  "maintenance_estimated_end",
  "recovery_banner_enabled",
  "public_prayer_wall",`;

// Patch: add recovery_banner_enabled to defaults in GET handler
const API_DEFAULTS_OLD = `      maintenance_estimated_end: "",
      public_prayer_wall: "true",`;

const API_DEFAULTS_NEW = `      maintenance_estimated_end: "",
      recovery_banner_enabled: "false",
      public_prayer_wall: "true",`;

// ─── 5. Settings page patch strings ──────────────────────────────────────────
// Marker: we look for this string to know if it's already patched
const SETTINGS_PAGE_MARKER = 'recovery_banner_enabled';

// The existing "Enable Maintenance Mode" toggle closing tag — we insert after it
const SETTINGS_PAGE_OLD = `            <Switch checked={isOn} onCheckedChange={v => update("maintenance_mode", v ? "true" : "false")} />
          </div>`;

const SETTINGS_PAGE_NEW = `            <Switch checked={isOn} onCheckedChange={v => update("maintenance_mode", v ? "true" : "false")} />
          </div>

          {/* Recovery Banner sub-toggle */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-[#A92FFA]/5">
            <div>
              <p className="font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#A92FFA" }} />
                Recovery Banner
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Shows a sticky banner on the homepage telling visitors systems are recovering and transit booking is affected.
              </p>
            </div>
            <Switch
              checked={settings.recovery_banner_enabled === "true"}
              onCheckedChange={v => update("recovery_banner_enabled", v ? "true" : "false")}
            />
          </div>`;

// ─── 6. Homepage patch string ─────────────────────────────────────────────────
const HOMEPAGE_IMPORT_MARKER = 'RecoveryBanner';

// We append the import + usage. Finding the last import line is fragile so we
// instead append to a known landmark that exists in page.tsx.
const HOMEPAGE_IMPORT_APPEND = `
// Recovery Banner — auto-injected by setup-recovery-banner.ts
import RecoveryBanner from "@/components/RecoveryBanner";
`;

// We add <RecoveryBanner /> before the closing </> or </div> of the root return.
// The safest anchor is the BackgroundMusic / Toaster area in layout — but since
// the banner is homepage-only it belongs in page.tsx. We append to the bottom
// of the file's default export return by finding a reliable closing marker.
// Strategy: append RecoveryBanner just before the final export line as a comment
// so the dev can place it manually if the auto-patch fails.
const HOMEPAGE_USAGE_APPEND = `
// ── RecoveryBanner — place this inside your page return, e.g. before </> ──
// <RecoveryBanner />
// ─────────────────────────────────────────────────────────────────────────────
`;

// ─── 7. Markdown doc ─────────────────────────────────────────────────────────
const MARKDOWN_DOC = `# Maintenance Mode & Recovery Banner — Architecture Reference

> Ucon Ministries · Auto-generated by scripts/setup-recovery-banner.ts

---

## Overview

Two distinct systems — don't mix them up.

| System | Purpose | Setting Key |
|--------|---------|-------------|
| **Recovery Banner** | Sticky footer on homepage — systems recovering, transit affected | \`recovery_banner_enabled\` |
| **Maintenance Page** | Full site lockdown — all public routes redirect to /maintenance | \`maintenance_mode\` |

---

## Files Changed

| File | Change |
|------|--------|
| \`src/components/RecoveryBanner.tsx\` | NEW — sticky bottom banner |
| \`src/app/page.tsx\` | PATCH — mount RecoveryBanner |
| \`src/app/maintenance/page.tsx\` | REPLACED — full site-lock screen |
| \`src/app/admin/settings/page.tsx\` | PATCH — recovery_banner sub-toggle |
| \`src/app/api/admin/settings/route.ts\` | PATCH — new allowed key + default |
| \`middleware.ts\` | REPLACED — direct DB read (bug fix) |

---

## The Middleware Bug

**Root cause**: The old \`maintenanceActive()\` called \`fetch("/api/admin/settings")\`
with a \`next: { revalidate: 30 }\` cache hint. Middleware runs in the **Edge Runtime**
where this hint is silently ignored, and self-referencing fetches can fail entirely.
Result: the function always returned \`false\`, so the toggle did nothing.

**Fix**: Import the Drizzle client and query the DB directly inside middleware.

---

## Recovery Banner

- Fetches settings on mount, polls every 60s
- Fixed bottom of screen, z-50
- X button stores dismissal in \`sessionStorage\` key \`ucon-recovery-dismissed\`
- Dismissal is per-session (intentional — refreshing shows it again if still on)
- Safe for SSR — renders nothing until mounted

---

## Maintenance Page Bypass Routes

\`\`\`
/maintenance          ← the page itself
/staff-login          ← staff must be able to log in
/api/admin/settings   ← maintenance page reads this
/api/auth/            ← auth must stay live
/_next/               ← static assets
/favicon
\`\`\`

---

## Staff Bypass

Staff and admins with \`staff-session=true\` or \`admin-session=true\` cookies
pass through maintenance mode. They see the site normally plus the admin
warning banner in \`MaintenanceBanner.tsx\`.

If a staff member clears cookies, they'll hit the maintenance page until
they log in again at \`/staff-login\`.
`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log();
  console.log(c.bold(c.purple('  ╔═════════════════════════════════════════════════╗')));
  console.log(c.bold(c.purple('  ║  Ucon Ministries — Recovery Banner + Middleware  ║')));
  console.log(c.bold(c.purple('  ╚═════════════════════════════════════════════════╝')));
  console.log();

  // 1. DB seed
  section('Step 1 — Seed recovery_banner_enabled into site_settings');
  await seedDB();

  // 2. Patch settings API route
  section('Step 2 — Patch settings API (add recovery_banner_enabled to ALLOWED_KEYS)');
  patchFile(
    'src/app/api/admin/settings/route.ts',
    'recovery_banner_enabled',
    API_ALLOWED_KEYS_OLD,
    API_ALLOWED_KEYS_NEW,
    'ALLOWED_KEYS array patched',
  );
  patchFile(
    'src/app/api/admin/settings/route.ts',
    'recovery_banner_enabled: "false"',
    API_DEFAULTS_OLD,
    API_DEFAULTS_NEW,
    'GET defaults object patched',
  );

  // 3. Patch settings page (sub-toggle UI)
  section('Step 3 — Patch admin settings page (recovery banner sub-toggle)');
  patchFile(
    'src/app/admin/settings/page.tsx',
    SETTINGS_PAGE_MARKER,
    SETTINGS_PAGE_OLD,
    SETTINGS_PAGE_NEW,
    'Recovery banner sub-toggle added to Maintenance card',
  );

  // 4. Write RecoveryBanner component
  section('Step 4 — Write src/components/RecoveryBanner.tsx');
  writeFile('src/components/RecoveryBanner.tsx', RECOVERY_BANNER, 'RecoveryBanner.tsx');

  // 5. Patch homepage — add import
  section('Step 5 — Patch homepage (import + usage hint)');
  appendIfMissing(
    'src/app/page.tsx',
    HOMEPAGE_IMPORT_MARKER,
    HOMEPAGE_IMPORT_APPEND + HOMEPAGE_USAGE_APPEND,
    'RecoveryBanner import added to page.tsx',
  );

  // 6. Write maintenance page
  section('Step 6 — Replace src/app/maintenance/page.tsx');
  writeFile('src/app/maintenance/page.tsx', MAINTENANCE_PAGE, 'maintenance/page.tsx');

  // 7. Replace middleware
  section('Step 7 — Replace middleware.ts (fix DB-direct read)');
  writeFile('middleware.ts', MIDDLEWARE, 'middleware.ts');

  // 8. Markdown reference doc
  section('Step 8 — Write markdown reference doc');
  writeFile(
    'markdown/maintenance-and-recovery-banner.md',
    MARKDOWN_DOC,
    'markdown/maintenance-and-recovery-banner.md',
  );

  // 9. Git
  section('Step 9 — git add → commit → push');
  await runGit();

  // ── Final notes ────────────────────────────────────────────────────────────
  console.log();
  console.log(c.bold(c.green('  ✅  Done. One manual step remaining:')));
  console.log();
  console.log(c.orange('  In src/app/page.tsx, place <RecoveryBanner /> inside your JSX return.'));
  console.log(c.dim('  A comment hint was added at the bottom of the file to remind you.'));
  console.log(c.dim('  E.g. just before your final closing tag:'));
  console.log(c.dim('    <>'));
  console.log(c.dim('      ... all your existing sections ...'));
  console.log(c.dim('      <RecoveryBanner />'));
  console.log(c.dim('    </>'));
  console.log();
}

main().catch(err => {
  console.error(c.red('\n  Fatal error:'), err);
  process.exit(1);
});
