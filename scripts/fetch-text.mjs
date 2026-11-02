// Haalt één pagina op als tekst (voor Claude, bijv. om een extra folderlink te bekijken).
//   node scripts/fetch-text.mjs <url> [--zoek woord1,woord2] [--max 40000]
import { pageText } from './page-text.mjs';

const [url, ...rest] = process.argv.slice(2);
const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
if (!url) { console.error('Gebruik: node scripts/fetch-text.mjs <url> [--zoek a,b] [--max 40000]'); process.exit(2); }
const max = Number(opt('--max') ?? 40000);
const r = await pageText(url, (opt('--zoek') ?? '').split(','));
if (!r.ok) { console.log(`FOUT: ${url} gaf ${r.status || r.error}. Sla deze site over.`); process.exit(0); }
const joined = r.lines.join('\n');
console.log(`BRON: ${url} (${r.lines.length} regels)\n${joined.slice(0, max)}${joined.length > max ? '\n… (afgekapt)' : ''}`);
