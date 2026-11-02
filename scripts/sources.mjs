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
