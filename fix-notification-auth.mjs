#!/usr/bin/env node
// fix-notification-auth.mjs
// Run from repo root: node fix-notification-auth.mjs

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

let totalFixed = 0;

function patch(filePath, label, before, after) {
  const full = resolve(filePath);
  let src;
  try { src = readFileSync(full, 'utf8'); } catch {
    console.error(`❌ Cannot read ${filePath}`); return;
  }
  if (src.includes(after.trim().slice(0, 80))) {
    console.log(`⏭️  ${label} — already applied`); return;
  }
  if (!src.includes(before.trim().slice(0, 80))) {
    console.error(`❌ ${label} — target not found in ${filePath}`); return;
  }
  writeFileSync(full, src.replace(before, after), 'utf8');
  console.log(`✅ ${label}`);
  totalFixed++;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1 — AlertCenter: add credentials + bearer token to fetchAlerts
// FILE: src/components/AlertCenter.tsx
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/components/AlertCenter.tsx',
  'AlertCenter fetchAlerts — add credentials + bearer token',

  `      const response = await fetch('/api/alerts?includeRead=true');`,

  `      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('bearer_token') || localStorage.getItem('ucon-auth-token'))
        : null;
      const response = await fetch('/api/alerts?includeRead=true', {
        credentials: 'include',
        headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      });`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2 — AlertCenter: markAsRead — add credentials + bearer token
// FILE: src/components/AlertCenter.tsx
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/components/AlertCenter.tsx',
  'AlertCenter markAsRead — add credentials + bearer token',

  `      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action: 'read' }),
      });`,

  `      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('bearer_token') || localStorage.getItem('ucon-auth-token'))
        : null;
      await fetch('/api/alerts', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
        },
        body: JSON.stringify({ id: alertId, action: 'read' }),
      });`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3 — AlertCenter: dismissAlert — add credentials + bearer token
// FILE: src/components/AlertCenter.tsx
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/components/AlertCenter.tsx',
  'AlertCenter dismissAlert — add credentials + bearer token',

  `      await fetch(\`/api/alerts?id=\${alertId}\`, { method: 'DELETE' });`,

  `      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('bearer_token') || localStorage.getItem('ucon-auth-token'))
        : null;
      await fetch(\`/api/alerts?id=\${alertId}\`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      });`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4 — AlertCenter: dismissAllAlerts — add credentials + bearer token
// FILE: src/components/AlertCenter.tsx
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/components/AlertCenter.tsx',
  'AlertCenter dismissAllAlerts — add credentials + bearer token',

  `      await fetch('/api/alerts?dismissAll=true', { method: 'DELETE' });`,

  `      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('bearer_token') || localStorage.getItem('ucon-auth-token'))
        : null;
      await fetch('/api/alerts?dismissAll=true', {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      });`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 5 — NotificationCenter: fetchNotifications — add credentials + bearer token
// FILE: src/components/NotificationCenter.tsx
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/components/NotificationCenter.tsx',
  'NotificationCenter fetchNotifications — add credentials + bearer token',

  `      const response = await fetch("/api/notifications");`,

  `      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('bearer_token') || localStorage.getItem('ucon-auth-token'))
        : null;
      const response = await fetch("/api/notifications", {
        credentials: 'include',
        headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      });`
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 6 — also fix /api/alerts route: getCurrentUser needs to read bearer token
// from the Authorization header as a fallback when the session cookie is absent.
// FILE: src/lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
patch(
  'src/lib/auth.ts',
  'getCurrentUser — fall back to bearer token when session cookie is absent',

  `export async function getCurrentUser(_request?: NextRequest) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  return session?.user || null;
}`,

  `export async function getCurrentUser(request?: NextRequest) {
  // Try better-auth session cookie first (works for same-origin / SSR)
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    if (session?.user) return session.user;
  } catch {}

  // Fall back to bearer token from Authorization header
  // (needed in cross-origin / iframe environments where cookies are blocked)
  const authHeader = request?.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      // Look up the session by token in the better-auth sessions table
      const sessionRecord = await db.query.session?.findFirst({
        where: (s: any, { eq }: any) => eq(s.token, token),
      });
      if (sessionRecord && new Date(sessionRecord.expiresAt) > new Date()) {
        const userRecord = await db.query.user?.findFirst({
          where: (u: any, { eq }: any) => eq(u.id, sessionRecord.userId),
        });
        if (userRecord) return userRecord;
      }
    } catch (tokenError) {
      console.error('Bearer token lookup failed:', tokenError);
    }
  }

  return null;
}`
);

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${totalFixed} fix(es) applied.`);
if (totalFixed > 0) {
  console.log('\nNext steps:');
  console.log('  git add src/components/AlertCenter.tsx src/components/NotificationCenter.tsx src/lib/auth.ts');
  console.log('  git commit -m "fix: notification auth — credentials + bearer token fallback in getCurrentUser"');
  console.log('  git push origin main');
}
