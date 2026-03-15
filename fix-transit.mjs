#!/usr/bin/env node
// fix-transit.mjs
// Run from repo root: node fix-transit.mjs

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const FILE = resolve('src/components/outreach/TransitBookingForm.tsx');

let src = readFileSync(FILE, 'utf8');
let changed = 0;

// ── Fix 1: Add credentials: 'include' to the booking fetch ──────────────────
const authBefore = `const response = await fetch('/api/outreach/transit/book', {
        method: 'POST',
        headers: {`;

const authAfter = `const response = await fetch('/api/outreach/transit/book', {
        method: 'POST',
        credentials: 'include',
        headers: {`;

if (src.includes(authBefore)) {
  src = src.replace(authBefore, authAfter);
  changed++;
  console.log('✅ Fix 1 applied — credentials: include added to booking fetch');
} else if (src.includes('credentials: \'include\'')) {
  console.log('⏭️  Fix 1 already applied — skipping');
} else {
  console.error('❌ Fix 1 failed — could not find fetch block. Check the file manually.');
}

// ── Fix 2: Remove min={getMinDate()} from the date input ─────────────────────
const dateBefore = `type="date"
                min={getMinDate()}
                value={formData.requestedDate}`;

const dateAfter = `type="date"
                value={formData.requestedDate}`;

if (src.includes(dateBefore)) {
  src = src.replace(dateBefore, dateAfter);
  changed++;
  console.log('✅ Fix 2 applied — min date restriction removed from date picker');
} else if (!src.includes('min={getMinDate()}')) {
  console.log('⏭️  Fix 2 already applied — skipping');
} else {
  console.error('❌ Fix 2 failed — could not find date input block. Check the file manually.');
}

if (changed > 0) {
  writeFileSync(FILE, src, 'utf8');
  console.log(`\n✅ ${changed} fix(es) written to ${FILE}`);
  console.log('\nNext steps:');
  console.log('  git add src/components/outreach/TransitBookingForm.tsx');
  console.log('  git commit -m "fix: transit auth cookie + remove 24h date picker restriction"');
  console.log('  git push origin main');
} else {
  console.log('\nNo changes written.');
}
