// Draait op de Mac. Haalt de folders op die GitHub-servers niet mogen ophalen en zet ze in één keer in
// bron/folders.json. Die commit start op GitHub een volledige scan.
//   node scripts/mac-bron.mjs           -> nu ophalen en naar GitHub sturen
//   node scripts/mac-bron.mjs --auto    -> alleen als het tijd is (zo draait launchd hem elk kwartier):
//        - op werkdagen het eerste moment na 9:30 dat de Mac aanstaat, één keer per dag
//        - of als iemand in de app op "Nu zoeken" tikte en de laatste keer al een paar uur geleden is
//        - of elk uur opnieuw (8 tot 22 uur) zolang een folder nog die van vorige week is, tot de nieuwe er is
//   node scripts/mac-bron.mjs --droog   -> alleen ophalen en laten zien, niets versturen
// De sleutel staat in de sleutelhanger van de Mac (dienst "skwirl-github"), nooit in een bestand.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { pageText } from './page-text.mjs';
import { SOURCES, VIA_MAC, folderStale } from './sources.mjs';

// welke repository? Uit SKWIRL_REPO, anders uit de git-remote van deze map (bijv. github.com/naam/skwirl-data)
const REPO = process.env.SKWIRL_REPO || (() => {
  try {
    const url = execFileSync('git', ['-C', new URL('..', import.meta.url).pathname, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return url.replace(/^.*github\.com[/:]/, '').replace(/\.git$/, '');
  } catch { return ''; }
})();
if (!REPO) { console.log('Onbekende repository: zet SKWIRL_REPO=naam/skwirl-data of clone deze map met GitHub Desktop.'); process.exit(1); }
const API = `https://api.github.com/repos/${REPO}/contents`;
const dry = process.argv.includes('--droog');
const auto = process.argv.includes('--auto');
const STATE_DIR = `${homedir()}/Library/Application Support/skwirl`;
const STATE = `${STATE_DIR}/mac-bron.json`;
const state = { lastUpload: 0, stale: [], lastTry: 0, ...(existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {}) };
const saveState = (patch) => { mkdirSync(STATE_DIR, { recursive: true }); writeFileSync(STATE, JSON.stringify({ ...state, ...patch })); };
const log = (m) => console.log(`[${new Date().toLocaleString('nl-NL')}] ${m}`);

let token = '';
if (!dry) {
  try { token = execFileSync('/usr/bin/security', ['find-generic-password', '-s', 'skwirl-github', '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { if (auto) process.exit(0); log('Geen sleutel gevonden in de sleutelhanger (dienst "skwirl-github"). Zie DEALS-TASK.md.'); process.exit(1); }
}
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

// welke ketens volg je? Uit de gegevens op GitHub (lokaal bij --droog)
let household;
if (dry) household = JSON.parse((await import('node:fs')).readFileSync(new URL('../household.json', import.meta.url), 'utf8'));
else {
  const r = await fetch(`${API}/household.json?ref=main`, { headers });
  if (!r.ok) { log(`household.json ophalen mislukt (${r.status})`); process.exit(1); }
  household = JSON.parse(Buffer.from((await r.json()).content, 'base64').toString('utf8'));
}
const chains = [...new Set(household.stores.filter((s) => s.follow).map((s) => s.chain))];

let retryOnly = false; // alleen opnieuw kijken of een oude folder vernieuwd is
if (auto) {
  const now = new Date(), H = 36e5;
  const nine30 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).getTime();
  const weekday = now.getDay() >= 1 && now.getDay() <= 5;
  const daily = weekday && now.getTime() >= nine30 && state.lastUpload < nine30;
  const asked = household.scanAllAt ?? 0; // "Nu zoeken" in de app
  const onRequest = asked > state.lastUpload && now.getTime() - asked < 6 * H && now.getTime() - state.lastUpload > 3 * H;
  // was een folder bij de vorige keer nog oud? Dan elk uur opnieuw kijken, hooguit 4 dagen lang
  const retry = state.stale.length > 0 && now.getHours() >= 8 && now.getHours() < 22 && now.getTime() - state.lastTry > H && now.getTime() - state.lastUpload < 4 * 24 * H;
  if (!daily && !onRequest && !retry) process.exit(0); // nog niet aan de beurt; stil stoppen
  log(daily ? 'Eerste moment na 9:30 vandaag: folders ophalen' : onRequest ? '"Nu zoeken" in de app: folders ophalen' : `Opnieuw kijken of de nieuwe folder er is (${state.stale.join(', ')})`);
  retryOnly = !daily && !onRequest;
}

const out = { fetchedAt: new Date().toISOString(), chains: {} };
for (const c of chains) {
  const urls = (SOURCES[c] ?? []).filter(VIA_MAC);
  for (const url of urls) {
    const r = await pageText(url);
    log(`${c}: ${url} → ${r.ok ? `${r.lines.length} regels` : `FOUT ${r.status || r.error}`}`);
    if (r.ok && r.lines.length) {
      const stale = folderStale(r.lines);
      if (stale) log(`${c}: dit is nog de folder van vorige week; Claude zoekt deze keten via de zoekmachine, de Mac kijkt elk uur opnieuw`);
      out.chains[c] = { url, lines: r.lines.slice(0, 3000), ...(stale ? { stale: true } : {}) };
    }
    await new Promise((res) => setTimeout(res, 1500)); // rustig aan: één pagina tegelijk
  }
}
const n = Object.keys(out.chains).length;
if (!n) { log('Niets opgehaald; niets verstuurd.'); process.exit(dry ? 0 : 1); }
if (dry) { log(`Droog: ${n} ketens opgehaald, niets verstuurd.`); process.exit(0); }
const staleNow = Object.keys(out.chains).filter((c) => out.chains[c].stale);
// bij opnieuw kijken alleen versturen als er echt een nieuwe folder is (anders geen onnodige scan)
if (retryOnly && state.stale.every((c) => staleNow.includes(c))) {
  log('Nog geen nieuwe folder; over een uur opnieuw.'); saveState({ lastTry: Date.now() }); process.exit(0);
}

const cur = await fetch(`${API}/bron/folders.json?ref=main`, { headers });
const sha = cur.ok ? (await cur.json()).sha : undefined;
const body = { message: `Folders van de Mac (${Object.keys(out.chains).join(', ')})`, content: Buffer.from(JSON.stringify(out)).toString('base64'), branch: 'main', ...(sha ? { sha } : {}) };
const put = await fetch(`${API}/bron/folders.json`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
log(put.ok ? `Verstuurd: ${n} ketens. GitHub start nu de scan.` : `Versturen mislukt (${put.status}): ${await put.text()}`);
if (put.ok) saveState({ lastUpload: Date.now(), lastTry: Date.now(), stale: staleNow });
process.exit(put.ok ? 0 : 1);
