// Voorlopige koppeling zonder Claude: zoekt in de opgehaalde folders (scan/*.txt) naar de namen van je
// vaste producten en schrijft die als "twijfel" weg. Zo staan ze binnen een minuut in de app;
// Claude controleert ze daarna en vervangt ze door de echte koppeling.
//   node scripts/quick-match.mjs > quick.json
import { existsSync, readFileSync } from 'node:fs';

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const iso = (d, m, y) => `${y}-${String(MONTHS.indexOf(m.toLowerCase()) + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const PRICE_LINE = /(voor\s*\d|korting|gratis|halve prijs|\d+\s*voor|\d+[.,]\d{2}|1\+1|2\+1|bonus|actie)/i;

const h = JSON.parse(readFileSync('household.json', 'utf8'));
const kindOf = (c) => h.chains?.[c]?.kind ?? 'overig';
const chains = [...new Set(h.stores.filter((s) => s.follow).map((s) => s.chain))];
const deals = [];

for (const c of chains) {
  const file = `scan/${c}.txt`;
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  const joined = lines.join(' ');
  // geldigheid uit de kop van de folder, bijv. "26 oktober 2026 t/m 02 november 2026"
  const m = joined.match(/(\d{1,2}) ([a-z]+) (\d{4})\s*t\/m\s*(\d{1,2}) ([a-z]+) (\d{4})/i);
  const from = m && MONTHS.includes(m[2].toLowerCase()) ? iso(m[1], m[2], m[3]) : null;
  const until = m && MONTHS.includes(m[5].toLowerCase()) ? iso(m[4], m[5], m[6]) : null;
  const seen = new Set();
  for (const p of h.products) {
    if (p.where?.length && !p.where.includes(kindOf(c))) continue; // niet bij deze soort winkel
    const words = [p.name, ...(p.variants ?? []).map((v) => `${p.name.split(' ')[0]} ${v}`), p.name.split(' ')[0]]
      .map((w) => w.toLowerCase()).filter((w) => w.length >= 4);
    lines.forEach((l, i) => {
      const low = l.toLowerCase();
      if (l.startsWith('###') || l.length > 90 || !words.some((w) => low.includes(w))) return;
      const next = lines[i + 1] ?? '';
      if (!PRICE_LINE.test(next) || PRICE_LINE.test(l) && !/[a-z]{4}/i.test(l.replace(PRICE_LINE, ''))) return;
      if ((p.dislikes ?? []).some((t) => t.toLowerCase() === low) || seen.has(`${p.id}|${low}`)) return;
      seen.add(`${p.id}|${low}`);
      const price = next.match(/voor\s*(\d+[.,]\d{2})/i);
      const multi = next.match(/(\d+)\s*voor\s*(\d+[.,]\d{2})/i);
      deals.push({
        id: `snel-${c}-${slug(l)}`, productId: p.id, title: l, chain: c,
        price: multi ? +(parseFloat(multi[2].replace(',', '.')) / Number(multi[1])).toFixed(2) : price ? parseFloat(price[1].replace(',', '.')) : null,
        normal: null, mech: next.replace(/\s+/g, ' ').slice(0, 60), from, until, span: 'week', url: null,
        match: 'twijfel', note: 'Snel gevonden op naam; Claude controleert dit nog',
      });
    });
  }
}
console.log(JSON.stringify({ updatedAt: new Date().toISOString(), source: 'Snelle koppeling', deals }, null, 2));
console.error(`Snelle koppeling: ${deals.length} mogelijke acties`);
