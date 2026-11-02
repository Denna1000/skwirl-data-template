// Waar de acties per keten staan. Gedeeld door collect.mjs (op GitHub) en mac-bron.mjs (op de Mac).
const AGG = (slug) => `https://www.supermarktaanbiedingen.com/aanbiedingen/${slug}`;

export const SOURCES = {
  ah: [AGG('albert_heijn')], jumbo: [AGG('jumbo')], lidl: [AGG('lidl')], aldi: [AGG('aldi')], dekamarkt: [AGG('dekamarkt')],
  plus: [AGG('plus')], dirk: [AGG('dirk')], spar: [AGG('spar')], hoogvliet: [AGG('hoogvliet')],
  vomar: [AGG('vomar'), 'https://www.vomar.nl/aanbiedingen'],
  ekoplaza: ['https://www.ekoplaza.nl/nl/aanbiedingen'],
};

/** Deze bronnen weigeren servers (zoals die van GitHub); de Mac haalt ze op */
export const VIA_MAC = (url) => url.includes('supermarktaanbiedingen.com');

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
/**
 * Is een folder van supermarktaanbiedingen.com verouderd? Soms staat daar dagen na de wissel nog de folder van
 * vorige week, met alleen een paar restjes (bijv. AH op maandag). Verouderd = de folder begon meer dan 6 dagen
 * geleden, of er staan minder dan 10 prijzen in.
 */
export function folderStale(lines, now = new Date()) {
  const text = lines.join('\n');
  const prices = lines.filter((l) => /^\s*(voor\s+)?\d+[.,]\d\d\s*$/i.test(l)).length;
  const m = text.match(/folder\s*-\s*(\d{1,2}) (\w+) (\d{4})/i);
  const start = m && MONTHS.includes(m[2].toLowerCase()) ? new Date(+m[3], MONTHS.indexOf(m[2].toLowerCase()), +m[1]) : null;
  const old = start ? (now.getTime() - start.getTime()) / 864e5 > 6 : false;
  return old || prices < 10;
}
