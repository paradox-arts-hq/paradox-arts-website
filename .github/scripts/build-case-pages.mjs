#!/usr/bin/env node
/* Builds a standalone, search-friendly page for every case study on the homepage.

   Output (generated; commit it):
     work/<slug>/index.html   one page per case study, with the same content as its pop-up
     work/case-study.css      the site's own stylesheet plus a few page-only rules
     work/case-study.js       the before/after slider, on pages that have one
     work/index.html          sends /work/ to the Work section of the homepage
     sitemap.xml              the case-study pages are listed after the existing entries

   The content comes from the <script id="work-data"> block in index.html, the same data the
   pop-ups use, so the pages and the pop-ups cannot drift apart. Run it after changing a case study:
     node .github/scripts/build-case-pages.mjs
   The publish workflow also runs it before every deploy. It uses only Node's built-in modules. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://www.paradox-arts.com';
const ORG_ID = SITE + '/#organization';
const EMAIL = 'hq.paradoxarts@gmail.com';

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const write = (f, s) => {
  const p = path.join(ROOT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
};

const indexHtml = read('index.html');

/* ---------- 1. the case-study data, exactly as the homepage defines it ---------- */
const dataScript = (indexHtml.match(/<script id="work-data">([\s\S]*?)<\/script>/) || [])[1];
if (!dataScript) throw new Error('No <script id="work-data"> block in index.html');
const sandbox = { window: {}, document: { addEventListener() {}, getElementById() { return null; } } };
vm.runInNewContext(dataScript, sandbox);
const PROJECTS = sandbox.window.PX_PROJECTS;
const ORDER = Array.from(sandbox.window.PX_ORDER || []);
if (!PROJECTS || !ORDER.length) throw new Error('PX_PROJECTS or PX_ORDER is missing from the work-data block');

/* ---------- helpers ---------- */
// Content is authored HTML, as in the pop-ups; only bare ampersands are escaped.
const markup = (s) => String(s ?? '').replace(/&(?!#?\w+;)/g, '&amp;');
const plain = (s) => String(s ?? '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&[lr]dquo;/g, '"').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const attr = (s) => plain(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const clamp = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:·–-]+$/, '') + '…';
};
const local = (rel) => '/' + String(rel).replace(/^\//, '');
const absolute = (rel) => SITE + local(rel);
const warnings = [];

// Width and height of a JPEG or PNG, read from the file header (keeps pages from shifting as images load).
function imageSize(rel) {
  if (!exists(rel)) { warnings.push('missing image ' + rel); return null; }
  const b = fs.readFileSync(path.join(ROOT, rel));
  if (b.length > 24 && b.toString('latin1', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7) || m === 0xff) { i += m === 0xff ? 1 : 2; continue; }
      if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}
const dims = (rel) => { const s = imageSize(rel); return s ? ` width="${s.w}" height="${s.h}"` : ''; };

/* ---------- 2. the pop-up template, rendered as a page ---------- */
// Same as formatCaseBody() in index.html: free-text intro first, then one row per "<strong>Label.</strong>" paragraph.
function formatCaseBody(body) {
  const blocks = [];
  const re = /<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m, last = 0, between = '';
  while ((m = re.exec(body))) {
    between += body.slice(last, m.index);
    last = re.lastIndex;
    blocks.push({ tag: m[1].toLowerCase(), outer: m[0], inner: m[2] });
  }
  between += body.slice(last);
  if (between.trim()) throw new Error('Unexpected markup in a case-study body: ' + between.trim().slice(0, 80));
  const intro = [], beats = [];
  let current = null;
  for (const b of blocks) {
    const inner = b.inner.trim();
    const label = b.tag === 'p' ? inner.match(/^<strong>([^<]+)<\/strong>\s*/) : null;
    if (label) {
      const rest = inner.slice(label[0].length).trim();
      current = { label: label[1].replace(/\.$/, ''), parts: rest ? [`<p>${rest}</p>`] : [] };
      beats.push(current);
    } else if (current) current.parts.push(b.outer);
    else intro.push(b.outer);
  }
  const introHTML = intro.length ? `<div class="case-intro">${intro.join('')}</div>` : '';
  const beatsHTML = beats.length ? `<div class="case-beats">${beats.map((b) =>
    `<div class="case-beat${/^outcome/i.test(b.label) ? ' case-beat--outcome' : ''}"><div class="case-beat-label">${b.label}</div><div class="case-beat-content">${b.parts.join('')}</div></div>`
  ).join('')}</div>` : '';
  return markup(introHTML + beatsHTML);
}

function baMarkup(p) {
  const pic = (src, alt, fallback) => src && exists(src)
    ? `<div class="ba-pic"><img src="${local(src)}" alt="${attr(alt)}" draggable="false"${dims(src)}></div>`
    : `<div class="img-ph"><span class="ph-tag">${markup(fallback)}</span></div>`;
  return `<div class="ba" data-ba-widget>
          ${pic(p.afterImg, 'After: ' + p.afterTag, p.afterTag)}
          <div class="ba-before">${pic(p.beforeImg, 'Before: ' + p.beforeTag, p.beforeTag)}</div>
          <div class="ba-handle"><div class="ba-grip">↔</div></div>
          <div class="ba-hint">drag to compare</div>
        </div>`;
}

function mediaHTML(p) {
  if (!p.gallery) {
    return p.ba ? `<div class="overlay-frame">${baMarkup(p)}</div>` : '';
  }
  const ba = p.ba ? `
      <div class="overlay-frame${p.beforeImg ? ' overlay-frame--portrait' : ''}" style="margin-bottom:40px;">
        ${baMarkup(p)}
      </div>` : '';
  const links = (p.pdfLink || p.links) ? `<div class="case-links">${p.pdfLink ? `<a class="case-pdf-link" href="${local(p.pdfLink)}" target="_blank" rel="noopener">View Full Brand Guideline (PDF) →</a>` : ''}${(p.links || []).map((l) => `<a class="case-pdf-link" href="${attr(l.href)}" target="_blank" rel="noopener">${markup(l.label)} →</a>`).join('')}</div>` : '';
  const palette = p.palette ? `
      <div class="case-system">
        <div class="case-swatches">
          ${p.palette.map((c) => `<div class="swatch"><span class="swatch-chip" style="background:${c.hex}"></span><span class="swatch-name">${markup(c.name)}</span><span class="swatch-hex">${c.hex}</span></div>`).join('')}
        </div>
        ${links}
      </div>` : '';
  const process = p.process && exists(p.process.src) ? `
      <div class="case-process">
        <img src="${local(p.process.src)}" alt="${attr(p.title + ', process: ' + clamp(plain(p.process.note), 110))}" loading="lazy" decoding="async"${dims(p.process.src)}>
        <p>${markup(p.process.note)}</p>
      </div>` : '';
  const sections = p.gallery.map((sec) => `
      <section class="case-section">
        <h2>${markup(sec.title)}</h2>
        <p>${markup(sec.note)}</p>
        <div class="case-grid">
          ${sec.images.filter((img) => exists(img.src) || (warnings.push('missing image ' + img.src), false)).map((img) => `
          <figure class="case-figure">
            <img src="${local(img.src)}" alt="${attr(img.caption)}" loading="lazy" decoding="async"${dims(img.src)}>
            <figcaption>${markup(img.caption)}</figcaption>
          </figure>`).join('')}
        </div>
      </section>`).join('');
  const testimonial = p.testimonial ? `
      <div class="case-testimonial">
        <p class="ct-quote">&ldquo;${markup(p.testimonial.quote)}&rdquo;</p>
        <p class="ct-who">${markup(p.testimonial.name)}<span>${markup(p.testimonial.role)}</span></p>
      </div>` : '';
  return `${ba}${palette}${process}${sections}${testimonial}${p.note ? `<p class="case-footnote">${markup(p.note)}</p>` : ''}`;
}

/* ---------- 3. one page per case study ---------- */
function pageHTML(slug, i) {
  const p = PROJECTS[slug];
  const url = `${SITE}/work/${slug}/`;
  const isCase = /^Project \d{3}/.test(p.eyebrow);
  const title = `${plain(p.title)} · ${isCase ? 'Case Study' : 'Studio Wall'} · Paradox Arts`;
  const ending = (p.body.match(/<p><strong>(?:Outcome|Status)\.?<\/strong>\s*([\s\S]*?)<\/p>/i) || p.body.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || '';
  const description = clamp(`${plain(p.title)}: ${plain(p.meta)}. ${plain(ending)}`, 158);
  const cover = p.card && p.card.img && exists(p.card.img) ? p.card.img : null;
  const coverSize = cover ? imageSize(cover) : null;
  const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length];
  const next = ORDER[(i + 1) % ORDER.length];
  const year = ((p.snapshot || []).map((s) => s.value).join(' ') + ' ' + p.eyebrow).match(/\b(20\d\d)\b/);
  const images = [cover, ...(p.gallery || []).flatMap((s) => s.images.map((im) => im.src))].filter((s, k, a) => s && exists(s) && a.indexOf(s) === k);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': url + '#case-study',
        name: plain(p.title) + (isCase ? ' case study' : ''),
        headline: plain(p.title),
        description,
        url,
        inLanguage: 'en',
        image: images.slice(0, 8).map(absolute),
        keywords: plain(p.meta).replace(/ · /g, ', '),
        ...(year ? { dateCreated: year[1] } : {}),
        creator: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': SITE + '/#website' },
      },
      { '@type': 'Organization', '@id': ORG_ID, name: 'Paradox Arts', url: SITE + '/' },
      { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Paradox Arts', url: SITE + '/' },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Paradox Arts', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: plain(p.title), item: url },
        ],
      },
    ],
  };

  const snapshot = (p.snapshot && p.snapshot.length) ? `
    <div class="case-snapshot">
      ${p.snapshot.map((s) => `<div class="cs-item"><div class="cs-label">${markup(s.label)}</div><div class="cs-value">${markup(s.value)}</div></div>`).join('')}
    </div>` : '';
  const results = (p.results && p.results.length) ? `
    <div class="case-results">
      ${p.results.map((r) => `<div class="cr-item"><div class="cr-value">${markup(r.value)}</div><div class="cr-label">${markup(r.label)}</div></div>`).join('')}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Generated by .github/scripts/build-case-pages.mjs from the case-study data in index.html. Edit the data there, not this file. -->
<title>${attr(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Paradox Arts">
<meta property="og:locale" content="en_NG">
<meta property="og:title" content="${attr(plain(p.title) + ' · Paradox Arts')}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${url}">${cover ? `
<meta property="og:image" content="${absolute(cover)}">${coverSize ? `
<meta property="og:image:width" content="${coverSize.w}">
<meta property="og:image:height" content="${coverSize.h}">` : ''}
<meta property="og:image:alt" content="${attr(p.card.alt)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(plain(p.title) + ' · Paradox Arts')}">
<meta name="twitter:description" content="${attr(description)}">${cover ? `
<meta name="twitter:image" content="${absolute(cover)}">
<meta name="twitter:image:alt" content="${attr(p.card.alt)}">` : ''}
<meta name="theme-color" content="#F1DAC4">
<link rel="icon" type="image/png" sizes="64x64" href="/images/logo/favicon-64.png">
<link rel="icon" type="image/png" sizes="192x192" href="/images/logo/icon-192.png">
<link rel="apple-touch-icon" href="/images/logo/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/work/case-study.css">
<script type="application/ld+json">
${JSON.stringify(ld, null, 2).replace(/</g, '\\u003c')}
</script>
<script>window.pxTrack=window.pxTrack||function(){(window.pxTrackQ=window.pxTrackQ||[]).push([].slice.call(arguments))};</script>
<script src="/analytics.js" defer></script>${p.ba ? `
<script src="/work/case-study.js" defer></script>` : ''}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="cp-bar">
  <a class="cp-logo" href="/"><img src="/images/logo/logo-mark-navy.png" alt="" width="88" height="132">Paradox Arts</a>
  <a class="cp-back" href="/#work">All work</a>
</header>
<main id="main" class="overlay-inner cp-main">
  <nav class="cp-crumbs" aria-label="Breadcrumb"><a href="/">Paradox Arts</a> <span aria-hidden="true">/</span> <a href="/#work">Work</a> <span aria-hidden="true">/</span> <span aria-current="page">${markup(p.title)}</span></nav>
  <div class="overlay-eyebrow">${markup(p.eyebrow)}</div>
  <h1 class="overlay-title">${markup(p.title)}</h1>
  <div class="overlay-meta">${markup(p.meta)}</div>
  ${snapshot}
  ${results}
  <div class="overlay-body">${formatCaseBody(p.body)}</div>
  ${mediaHTML(p)}
  <div class="case-cta">
    <p>Sound like your brand's story?</p>
    <a class="btn" href="mailto:${EMAIL}">Let's Talk →</a>
  </div>
  <nav class="cp-pager" aria-label="More case studies">
    <a class="cp-prev" href="/work/${prev}/"><span>Previous</span><strong>${markup(PROJECTS[prev].title)}</strong></a>
    <a class="cp-next" href="/work/${next}/"><span>Next</span><strong>${markup(PROJECTS[next].title)}</strong></a>
  </nav>
</main>
<footer class="cp-foot">
  <span>© <span id="footYear">2026</span> Paradox Arts. We Tell Your Story.</span>
  <span><a href="/">www.paradox-arts.com</a> · <a href="/privacy.html">Privacy</a></span>
</footer>
<script>(function(){var e=document.getElementById('footYear'),y=new Date().getFullYear();if(e&&y>2026)e.textContent='2026–'+y;})();</script>
</body>
</html>
`;
}

/* ---------- 4. shared stylesheet and script ---------- */
const siteCss = (indexHtml.match(/<style>([\s\S]*?)<\/style>/) || [])[1];
if (!siteCss) throw new Error('No <style> block in index.html');
const pageCss = `
/* =====================================================================
   STANDALONE CASE-STUDY PAGES: everything above is the homepage's own
   stylesheet (copied by .github/scripts/build-case-pages.mjs); the rules
   below turn the pop-up layout into an ordinary page.
   ===================================================================== */
.cp-bar{ display:flex; align-items:center; justify-content:space-between; gap:20px; padding:20px var(--margin); border-bottom:1px solid rgba(22,27,51,.12); }
.cp-logo{ display:inline-flex; align-items:center; gap:12px; font-weight:800; font-size:14px; letter-spacing:.1em; text-transform:uppercase; }
.cp-logo img{ width:auto; height:30px; }
.cp-back, .cp-crumbs a, .cp-foot a{ border-bottom:2px solid currentColor; padding-bottom:2px; }
.cp-back{ font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
.cp-back::before{ content:"← "; }
.cp-main{ padding-top:44px; padding-bottom:96px; }
.cp-crumbs{ font-size:12px; letter-spacing:.05em; margin-bottom:30px; opacity:.7; }
.cp-crumbs a{ border-bottom-width:1px; }
.cp-main .case-section h2{ font-weight:800; text-transform:uppercase; font-size:clamp(20px,2.6vw,28px); letter-spacing:-.01em; }
.cp-main :is(.case-figure, .case-process) img{ cursor:auto; }
.cp-pager{ margin-top:56px; padding-top:28px; border-top:1px solid rgba(22,27,51,.15); display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.cp-pager a{ display:block; padding:18px 20px; border:2px solid var(--navy); transition:background .25s ease, color .25s ease; }
.cp-pager a:hover, .cp-pager a:focus-visible{ background:var(--navy); color:var(--cream); }
.cp-pager span{ display:block; font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; opacity:.7; }
.cp-pager strong{ display:block; margin-top:6px; font-size:16px; font-weight:800; text-transform:uppercase; }
.cp-pager .cp-next{ text-align:right; }
.cp-prev span::before{ content:"← "; }
.cp-next span::after{ content:" →"; }
footer.cp-foot{ padding:28px var(--margin); display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px 24px; font-size:13px; content-visibility:visible; contain-intrinsic-size:none; }
@media (max-width:640px){
  .cp-main{ padding-top:32px; padding-bottom:72px; }
  .cp-pager{ grid-template-columns:1fr; }
  .cp-pager .cp-next{ text-align:left; }
}
`;
const css = `/* Generated by .github/scripts/build-case-pages.mjs from index.html. Do not edit by hand. */\n`
  + siteCss.replace(/url\((['"]?)(fonts|images)\//g, 'url($1/$2/') + pageCss;

const js = `/* Generated by .github/scripts/build-case-pages.mjs: the before/after slider for case-study pages,
   the same behaviour as in the homepage pop-up. */
document.querySelectorAll('[data-ba-widget]').forEach(function (root) {
  var before = root.querySelector('.ba-before'), handle = root.querySelector('.ba-handle');
  var beforeImg = before && before.querySelector('.ba-pic, .img-ph'), dragging = false;
  if (!before || !handle || !beforeImg) return;
  function lockWidth() { beforeImg.style.width = root.getBoundingClientRect().width + 'px'; beforeImg.style.left = '0px'; }
  function setPct(x) {
    var r = root.getBoundingClientRect(), pct = Math.max(2, Math.min(98, (x - r.left) / r.width * 100));
    before.style.width = pct + '%'; handle.style.left = pct + '%'; root.classList.add('was-dragged');
  }
  lockWidth();
  window.addEventListener('resize', lockWidth);
  root.addEventListener('pointerdown', function (e) { dragging = true; root.setPointerCapture(e.pointerId); setPct(e.clientX); });
  root.addEventListener('pointermove', function (e) { if (dragging) setPct(e.clientX); });
  root.addEventListener('pointerup', function () { dragging = false; });
  root.addEventListener('pointerleave', function () { dragging = false; });
});
`;

const forward = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Generated by .github/scripts/build-case-pages.mjs. -->
<title>Work · Paradox Arts</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=/#work">
</head>
<body>
<p><a href="/#work">See the work on the Paradox Arts homepage</a></p>
</body>
</html>
`;

/* ---------- 5. write everything ---------- */
const keep = new Set(ORDER);
if (exists('work')) {
  for (const dir of fs.readdirSync(path.join(ROOT, 'work'), { withFileTypes: true })) {
    // remove pages of case studies that no longer exist
    if (dir.isDirectory() && !keep.has(dir.name)) fs.rmSync(path.join(ROOT, 'work', dir.name), { recursive: true, force: true });
  }
}
ORDER.forEach((slug, i) => write(`work/${slug}/index.html`, pageHTML(slug, i)));
write('work/case-study.css', css);
write('work/case-study.js', js);
write('work/index.html', forward);

let sitemap = read('sitemap.xml').replace(/\r\n/g, '\n');
sitemap = sitemap.replace(/\n  <url>\n    <loc>https:\/\/www\.paradox-arts\.com\/work\/[\s\S]*?<\/url>/g, '');
sitemap = sitemap.replace(/\n?<\/urlset>\s*$/, '\n' + ORDER.map((slug) => `  <url>\n    <loc>${SITE}/work/${slug}/</loc>\n  </url>`).join('\n') + '\n</urlset>\n');
write('sitemap.xml', sitemap);

console.log(`Built ${ORDER.length} case-study pages: ${ORDER.map((s) => '/work/' + s + '/').join(', ')}`);
if (warnings.length) console.warn('Warnings:\n  ' + [...new Set(warnings)].join('\n  '));
