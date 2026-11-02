// Wat moet er gescand worden na de laatste commit van de app?
// - "Nu zoeken" voor alles (scanAllAt veranderd)            -> mode=volledig
// - nieuw/gewijzigd product of "Zoek nu" bij een product   -> mode=snel, ids=...
// - anders (bijv. een afgetikte boodschap)                   -> ids leeg, niets te doen
import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';

const sig = (p) => JSON.stringify([p.name, p.brand ?? null, p.wants ?? null, p.avoid ?? null, [...(p.where ?? [])].sort(), !!p.loose, [...(p.variants ?? [])], p.scanAt ?? null]);
const now = JSON.parse(readFileSync('household.json', 'utf8'));
let before = { products: [] };
try { before = JSON.parse(execFileSync('git', ['show', 'HEAD^:household.json'], { encoding: 'utf8' })); } catch { /* eerste commit */ }

const out = (k, v) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };
if ((now.scanAllAt ?? null) !== (before.scanAllAt ?? null)) {
  console.log('Alles nu zoeken gevraagd');
  out('mode', 'volledig'); out('ids', '');
} else {
  const old = new Map((before.products ?? []).map((p) => [p.id, sig(p)]));
  const ids = (now.products ?? []).filter((p) => old.get(p.id) !== sig(p)).map((p) => p.id);
  console.log(ids.length ? `Nieuw, gewijzigd of gevraagd: ${ids.join(', ')}` : 'Niets te scannen');
  out('mode', 'snel'); out('ids', ids.join(','));
}
