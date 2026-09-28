// Downloads OFL fonts from the Google Fonts CSS2 API into /fonts and writes
// a local fonts.css with rewritten URLs (unicode-range subsets preserved).
// Usage: node scripts/fetch-fonts.mjs "Family:axis@range" ...
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'fonts');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const KEEP_SUBSETS = new Set(['latin', 'latin-ext', 'arabic']);

const families = process.argv.slice(2);
if (!families.length) { console.error('no families'); process.exit(1); }
await fs.mkdir(OUT, { recursive: true });

let css = '';
for (const fam of families) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, '+')}&display=block`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) { console.error('FAIL', fam, res.status); continue; }
  const text = await res.text();
  // Split into blocks preceded by /* subset */ comments.
  const blocks = text.split(/(?=\/\* [a-z0-9-]+ \*\/)/);
  for (const b of blocks) {
    const subset = (b.match(/^\/\* ([a-z0-9-]+) \*\//) || [])[1];
    if (!subset || !KEEP_SUBSETS.has(subset)) continue;
    const m = b.match(/url\((https:[^)]+\.woff2)\)/);
    if (!m) continue;
    const family = b.match(/font-family: '([^']+)'/)[1];
    const style = b.match(/font-style: (\w+)/)[1];
    const weight = b.match(/font-weight: ([\d ]+)/)[1].trim().replace(' ', '-');
    const file = `${family.replace(/\s+/g, '')}-${style}-${weight}-${subset}.woff2`;
    const dest = path.join(OUT, file);
    try { await fs.access(dest); } catch {
      const r = await fetch(m[1], { headers: { 'User-Agent': UA } });
      await fs.writeFile(dest, Buffer.from(await r.arrayBuffer()));
    }
    css += b.replace(m[1], `./${file}`).trim() + '\n';
    console.log('ok', file);
  }
}
await fs.writeFile(path.join(OUT, 'fonts.css'), css);
