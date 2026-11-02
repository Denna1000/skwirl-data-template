// Haalt vooraf, zonder Claude, de acties op van alle gevolgde ketens met een bekende bron.
// Schrijft scan/<keten>.txt en scan/overzicht.md. Claude hoeft daarna alleen nog te lezen en te koppelen.
//   node scripts/collect.mjs            -> hele folders (volledige scan)
//   node scripts/collect.mjs id1,id2    -> alleen regels over die producten (snelle scan)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pageText } from './page-text.mjs';
import { SOURCES, VIA_MAC } from './sources.mjs';

// Folders die de Mac ophaalde (sites die GitHub-servers weigeren); gebruiken als ze minder dan 4 dagen oud zijn
const mac = existsSync('bron/folders.json') ? JSON.parse(readFileSync('bron/folders.json', 'utf8')) : null;
const macFresh = mac && Date.now() - Date.parse(mac.fetchedAt) < 4 * 864e5;

const h = JSON.parse(readFileSync('household.json', 'utf8'));
const chains = [...new Set(h.stores.filter((s) => s.follow).map((s) => s.chain))];
const ids = (process.argv[2] ?? '').split(',').filter(Boolean);
const products = ids.length ? h.products.filter((p) => ids.includes(p.id)) : [];
// zoekwoorden: naam, eerste woord van de naam en varianten (bijv. "kipfilet", "biologisch")
const words = products.flatMap((p) => [p.name, p.name.split(' ')[0], ...(p.variants ?? [])]).map((w) => w.toLowerCase()).filter((w) => w.length >= 3);

mkdirSync('scan', { recursive: true });
const summary = [];
await Promise.all(chains.map(async (c) => {
  const urls = SOURCES[c];
  if (!urls) { summary.push(`- ${c}: geen vaste bron (zoek zo nodig met WebSearch)`); return; }
  const parts = await Promise.all(urls.map(async (u) => {
    if (VIA_MAC(u)) { // deze site weigert GitHub: gebruik wat de Mac ophaalde
      const m = macFresh && mac.chains[c] && mac.chains[c].url === u ? mac.chains[c] : null;
      if (!m) return { u, r: { ok: false, status: 'geen verse folder van de Mac', lines: [] } };
      const ws = words; let lines = m.lines;
      if (ws.length) { const keep = new Set(); lines.forEach((l, i) => { if (ws.some((w) => l.toLowerCase().includes(w))) for (let j = i - 2; j <= i + 2; j++) if (j >= 0 && j < lines.length) keep.add(j); }); lines = [...keep].sort((a, b) => a - b).map((i) => m.lines[i]); }
      return { u: `${u} (via de Mac, ${new Date(mac.fetchedAt).toLocaleString('nl-NL')})`, r: { ok: true, status: 200, lines } };
    }
    return { u, r: await pageText(u, words) };
  }));
  const text = parts.map(({ u, r }) => r.ok ? `### BRON: ${u}\n${r.lines.join('\n')}` : `### BRON: ${u}\nFOUT ${r.status || r.error}`).join('\n\n');
  writeFileSync(`scan/${c}.txt`, text.slice(0, 120000));
  summary.push(`- ${c}: ${parts.map(({ u, r }) => `${u} → ${r.ok ? `${r.lines.length} regels` : `FOUT ${r.status || r.error}`}`).join('; ')}`);
}));
const head = `# Opgehaald ${new Date().toISOString()}\n\nModus: ${ids.length ? `snel (${products.map((p) => p.name).join(', ')}; zoekwoorden: ${words.join(', ')})` : 'volledig'}\n\n`;
writeFileSync('scan/overzicht.md', head + summary.sort().join('\n') + '\n');
console.log(head + summary.sort().join('\n'));
