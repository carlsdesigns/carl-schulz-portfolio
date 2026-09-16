#!/usr/bin/env node
/* Set the portfolio passcodes.
 *
 *   node tools/set-passcode.js "carl2025" "lightafire"
 *
 * Pass every passcode you want to be valid; the list is replaced wholesale.
 * Each one gets its own random salt and an iterated SHA-256 verifier, then
 * js/portfolio-config.js is rewritten. The passcodes themselves are never
 * written to disk, so keep your own note of them.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITERATIONS = 250000;
const CONFIG = path.join(__dirname, '..', 'js', 'portfolio-config.js');

const passcodes = process.argv.slice(2).filter(function (p) { return p && p.trim(); });
if (!passcodes.length) {
  console.error('Usage: node tools/set-passcode.js "first passcode" ["second passcode" ...]');
  process.exit(1);
}

// Must match normalize() in js/portfolio-auth.js
function normalize(pw) {
  return String(pw).trim().toLowerCase();
}

const seen = new Set();
const entries = passcodes.map(function (pw) {
  const norm = normalize(pw);
  if (seen.has(norm)) {
    console.error('Duplicate passcode (after normalization): ' + JSON.stringify(pw));
    process.exit(1);
  }
  seen.add(norm);

  const salt = crypto.randomBytes(16).toString('hex');
  let h = crypto.createHash('sha256').update(salt + norm, 'utf8').digest();
  for (let i = 1; i < ITERATIONS; i++) h = crypto.createHash('sha256').update(h).digest();
  return { salt: salt, hash: h.toString('hex') };
});

const rows = entries
  .map(function (e) { return "    { salt: '" + e.salt + "', hash: '" + e.hash + "' }"; })
  .join(',\n');

const out = `/* Gate configuration.

   No passcode is stored here. Each entry in VERIFIERS is a salted SHA-256
   digest of a passcode, re-hashed ITERATIONS times, so reading this file does
   not reveal any passcode. Every listed verifier grants the same access.
   Unlock persists in localStorage until cleared.

   To change the passcodes, run this from the repo root with the full set you
   want valid; it rewrites the list below in place:

     node tools/set-passcode.js "first passcode" "second passcode"

   Note: this is a client-side gate. It keeps casual visitors out and no longer
   leaks passcodes in plain text, but anyone determined can still brute-force a
   short passcode offline. Use server-side auth for genuinely sensitive work.
*/
window.__PORTFOLIO_CONFIG = {
  STORAGE_KEY: 'portfolioUnlocked',
  ITERATIONS: ${ITERATIONS},
  VERIFIERS: [
${rows}
  ]
};
`;

fs.writeFileSync(CONFIG, out);
console.log('Updated ' + path.relative(process.cwd(), CONFIG));
console.log('  ' + entries.length + ' passcode(s) active, ' + ITERATIONS + ' iterations each');
entries.forEach(function (e, i) {
  console.log('  [' + (i + 1) + '] salt ' + e.salt + '  verifier ' + e.hash.slice(0, 16) + '…');
});
console.log('\nPasscodes are not stored anywhere — keep your own note of them.');
