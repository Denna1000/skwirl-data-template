// Pagina ophalen en omzetten naar leesbare tekstregels. Gedeeld door fetch-text.mjs en collect.mjs.
const UA = 'Mozilla/5.0 (compatible; Skwirl/1.0; persoonlijk boodschappenlijstje)';

/** Geeft { ok, status, lines } terug; bij een fout ok=false en lege lines */
export async function pageText(url, words = []) {
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'nl-NL,nl;q=0.9' }, signal: AbortSignal.timeout(20000), redirect: 'follow' });
  } catch (e) { return { ok: false, status: 0, lines: [], error: e.message }; }
  if (!res.ok) return { ok: false, status: res.status, lines: [] };
  const text = (await res.text())
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr|\/a|\/span)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&euro;/g, '€').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1);
  let lines = text.filter((l, i) => l !== text[i - 1]);
  const ws = words.map((w) => w.toLowerCase()).filter(Boolean);
  if (ws.length) {
    const keep = new Set();
    lines.forEach((l, i) => { if (ws.some((w) => l.toLowerCase().includes(w))) for (let j = i - 2; j <= i + 2; j++) if (j >= 0 && j < lines.length) keep.add(j); });
    lines = [...keep].sort((a, b) => a - b).map((i) => lines[i]);
  }
  return { ok: true, status: res.status, lines };
}
