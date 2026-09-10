import fs from 'fs';

const SUPABASE_URL = 'https://tkxujdfrpvebfnulsdnt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PIR-ZRc9XZ0iPhQExY_ubg_Re0HQkDt';
const SITE_URL = 'https://mrkari2455-create.github.io/goftman-danesh';

async function generateSitemap() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entries?select=label`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const entries = await res.json();

  const urls = [
    `<url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>`,
    ...entries.map(
      (e) =>
        `<url><loc>${SITE_URL}/article/${encodeURIComponent(e.label)}</loc><priority>0.8</priority></url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', xml);
  console.log(`Sitemap generated with ${entries.length + 1} URLs`);
}

generateSitemap();
