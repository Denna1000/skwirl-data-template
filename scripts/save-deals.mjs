// Zet deals.json op GitHub via de Contents API, zonder git push.
// De app schrijft intussen vaak naar list.json en household.json; een git push botste daardoor steeds.
// - mode=volledig: deze scan vervangt de acties (verlopen acties eruit)
// - mode=snel:     deze acties worden samengevoegd met wat er al staat (op id)
//   GH_TOKEN=... GITHUB_REPOSITORY=eigenaar/repo node scripts/save-deals.mjs <snel|volledig> [bestand]
// Claude roept dit ook tussendoor aan (snel, samenvoegen), zodat acties per winkel al in de app staan.
import { readFileSync } from 'node:fs';

const mode = process.argv[2] === 'volledig' ? 'volledig' : 'snel';
const repo = process.env.GITHUB_REPOSITORY, token = process.env.GH_TOKEN;
if (!repo || !token) { console.error('GITHUB_REPOSITORY en GH_TOKEN zijn nodig'); process.exit(1); }
const api = `${process.env.GITHUB_API_URL ?? 'https://api.github.com'}/repos/${repo}/contents/deals.json`;
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
const today = new Date().toISOString().slice(0, 10);
const live = (d) => !d.until || !/^\d{4}-\d{2}-\d{2}$/.test(d.until) || d.until >= today;

let mine;
const file = process.argv[3] ?? 'deals.json';
try { mine = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error(`deals.json is geen geldige JSON: ${e.message}`); process.exit(1); }
if (!Array.isArray(mine.deals)) { console.error('deals.json mist een lijst "deals"'); process.exit(1); }

for (let attempt = 1; attempt <= 5; attempt++) {
  const res = await fetch(`${api}?ref=main`, { headers });
  const remote = res.ok ? await res.json() : null;
  const theirs = remote ? JSON.parse(Buffer.from(remote.content, 'base64').toString('utf8')) : { deals: [], folders: [] };
  let out;
  if (mode === 'volledig') {
    out = { ...mine, updatedAt: new Date().toISOString(), deals: mine.deals.filter(live) };
  } else {
    // voorlopige "snel"-koppelingen van dezelfde keten vervangen zodra Claude die keten heeft gedaan
    const doneChains = new Set(mine.deals.filter((d) => !String(d.id).startsWith('snel-')).map((d) => d.chain));
    const byId = new Map(theirs.deals.filter(live).filter((d) => !(String(d.id).startsWith('snel-') && doneChains.has(d.chain))).map((d) => [d.id, d]));
    for (const d of mine.deals.filter(live)) byId.set(d.id, d);
    const folders = new Map([...(theirs.folders ?? []), ...(mine.folders ?? [])].map((f) => [`${f.chain}|${f.from}`, f]));
    out = { ...theirs, updatedAt: new Date().toISOString(), source: mine.source ?? theirs.source, deals: [...byId.values()], folders: [...folders.values()] };
  }
  const body = { message: `Aanbiedingen ${today} (${mode}, ${out.deals.length} acties)`, content: Buffer.from(JSON.stringify(out, null, 2) + '\n').toString('base64'), branch: 'main', ...(remote ? { sha: remote.sha } : {}) };
  const put = await fetch(api, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (put.ok) { console.log(`Opgeslagen: ${out.deals.length} acties (${mode})`); process.exit(0); }
  console.log(`Poging ${attempt}: GitHub gaf ${put.status}${put.status === 409 || put.status === 422 ? ' (iemand anders schreef tegelijk), opnieuw' : ''}`);
  if (put.status !== 409 && put.status !== 422) { console.error(await put.text()); process.exit(1); }
  await new Promise((r) => setTimeout(r, 2000 * attempt));
}
process.exit(1);
