# Paradox Arts website: setup status (updated 20 Nov 2026)

The site is in `site/`: publish that folder as it is. On Cloudflare Pages or Netlify, connect the private
GitHub repo (github.com/hqparadoxarts/paradox-arts-website) with no build command and `site` as the output
folder; every push to `main` then goes live. `_handoff/`, at the top of the repo, holds the original notes,
mock-ups, source files and spare photos, and is not published.

## Final scorecard (9 Nov 2026)

Measured with Lighthouse 12 on a local server set up like a real host (gzip + caching):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| **Desktop** | 100 | 100 | 100 | 100 |
| **Mobile** (slow-phone simulation) | 99–100 | 100 | 100 | 100 |

Mobile timings: first paint 1.0 s, largest content 1.8–1.9 s, layout shift 0, blocking time 50–110 ms.
All Core Web Vitals are in Google's "good" range. Mobile Performance moves a point or two between runs
(it measures CPU time on the testing computer), and it dropped as low as 87 when this PC was busy.

Also verified:
- **Accessibility:** axe-core, WCAG 2.0 / 2.1 / 2.2 AA + best practices: 0 issues in both themes, every section.
- **HTML:** 0 validator errors.
- **SEO:** title 55 characters, description 154, canonical URL, Open Graph + Twitter cards with image size
  and alt text, structured data (organisation + website), one H1, alt text on every image, robots.txt,
  sitemap.xml, web app manifest.
- **Responsive:** no sideways scroll at 360, 390, 768, 1024, 1280, 1440 px; every section checked on
  phone, tablet and desktop.
- **Flows:** nav and every in-page link (desktop and phone menu), back/forward, skip link, case studies
  (click, keyboard, deep links, prev/next, image viewer), JBB slider, enquiry form + validation +
  WhatsApp hand-off, "Start here" cards, FAQ, Founding Logic game, sound, alt colour theme, easter eggs.

## Launch checklist
1. **Hosting / domain** for paradox-arts.com, on **HTTPS**.
2. **Compression and caching:** hosts compress text files by default, and `site/_headers` gives Cloudflare
   Pages and Netlify the tested caching: images, fonts and the music for a year, the statistics script for a
   day, pages checked on every visit. On any other host, copy those rules into its settings. Because images
   are cached for a year, a replaced image needs a new file name (and `index.html` updated to match).
3. **Google Search Console:** verify the domain and submit `https://www.paradox-arts.com/sitemap.xml`
   (step by step in the review doc, see "Copy rewrites" below).
4. **Google Business Profile** for Paradox Arts, Lagos: the biggest local-SEO lever for searches
   like "branding agency Lagos" (ten-step guide in the same doc).
5. After launch, run PageSpeed Insights on the live URL to confirm with real-network numbers.
6. **Before creating the Business Profile:** answer the address question in the review doc (hidden
   address and Lagos as a service area, or a studio address clients can visit).
7. **Analytics: on.** Your Umami Cloud Website ID is in `site/analytics.js`. Visits start counting once the
   site is live at paradox-arts.com (local previews never count). After launch, open the live site once and
   check that Umami → Websites → paradox-arts.com shows the visit. Ad blockers hide some visitors from any
   analytics tool, so treat the numbers as a floor.
8. **404 page:** done (`site/404.html`). Netlify, Vercel and Cloudflare Pages use it automatically for
   unknown addresses; on other hosts, set it as the custom error page.
9. **Privacy note:** done (`site/privacy.html`, linked from the footer and under the enquiry form). Check
   that keeping enquiries up to 12 months suits you.

## Code on GitHub and hosting prep (done 9–10 Nov 2026)
- **GitHub:** private repo github.com/hqparadoxarts/paradox-arts-website, branch `main`, pushed from this
  folder with GitHub CLI (signed in as hqparadoxarts). Code only: the "Website Images" originals and the zips
  stay on this computer (`.gitignore`). To publish a change, commit and push; once a host is connected, it
  goes live by itself.
- **Norton:** this PC's Norton Antivirus scans secure connections, which Git's own certificate list rejects,
  so this repo checks certificates against the Windows store (`http.sslBackend=schannel`). Verification stays on.
- **Ready to publish as is:** `_handoff/` moved out of `site/`, the two spare About photos into
  `_handoff/spare-images/`, and `site/_headers` added with the caching rules.

## Pre-launch check and Mac Ignites link (20 Nov 2026)
- **Check passed:** all 160 files the pages use are present; 0 HTML errors on the three pages; 0 accessibility
  issues in both themes (axe-core 4.10.2, WCAG 2.2 AA); no console errors, failed loads or sideways scroll;
  title, description, canonical, 1200×630 share image, structured data, sitemap and manifest in place.
- **macignites.com is offline:** the domain is registered (Namecheap name servers) but has no address
  records, so it loads for nobody. Until it's back, the Mac Ignites case study hides its "Visit
  macignites.com" button, and the outcome reads "…one system clients now meet in person: staff ID cards and
  branded apparel." To restore: in `index.html`, un-comment the `links:` line in the Mac Ignites entry and
  put the site back in the outcome ("…meet everywhere: macignites.com, staff ID cards and branded apparel.").
- Sitemap: the homepage's last-changed date is now 20 Nov 2026.
- Still for you to click once: the LinkedIn company page and the Pixabay music credit (both block automated
  checks). Three small logo files are unused (`logo/favicon.png`, `logo/logo-half-left-navy.png`,
  `logo/logo-half-right-navy.png`, 26 KB); harmless if published.

## About photo size (done 16 Nov 2026)
- The founder portrait no longer fills its column. Beside the text it is 300–460 px wide (432×540 on a 1440
  laptop, was 536×671); when the layout is one column it is at most 400 px wide (400×500 at 968 px, was
  837×1046, nearly a full screen). Phones keep it at the full text width (343×429 at 390 px).
- The About text is capped at 700 px wide, so its lines don't grow longer where the photo used to be.

## Marquee line (done 14 Nov 2026)
- The orange scrolling band now reads "A system that knows when to break its own rules" (was "Build the
  system, then break it"): it says what the client gets, and no longer sounds like "we break things".
- It loops four copies instead of two, so no screen up to 2560 px wide sees the empty strip the old loop
  left at the end of each pass, and it scrolls at the old reading speed. With reduced motion turned on,
  the line shows once, centred and wrapping.

## Brand guides (done 10 Nov 2026)
- The "View Full Brand Guideline (PDF)" buttons in the Prime Ignites, Limitless CF and Mac Ignites case
  studies pointed at files that were never added, so they would have opened the 404 page. They now open the
  guides in `site/guides/`, exact copies of your Figma exports: `prime-ignites-brand-guide.pdf` (15 MB,
  18 pages), `limitless-cf-brand-guide.pdf` (7 MB, 19 pages), `mac-ignites-brand-guide.pdf` (12 MB, 13 pages).
- Browsers keep them for a day, so a re-exported guide saved under the same name reaches visitors the next day.
- Worth knowing:
  - The last page of the Mac Ignites and Limitless guides gives +234 810 515 6132 as the studio's contact;
    the site uses +234 706 526 1941.
  - Their built-in titles ("Slide 01", "1", "Limitless NGO") come from the first frame's name in Figma and
    can show as the tab title in some browsers; rename that frame before the next export.
  - They are large on mobile data; a compressed export would open faster.
  - Check that each client is happy for their full guide to be public.

## Analytics, 404 page, privacy note and new images (done 9 Nov 2026)
- **Analytics (Umami Cloud, free plan):** `site/analytics.js` loads Umami only on paradox-arts.com and
  www.paradox-arts.com (Website ID added 9 Nov 2026; every setting it uses is confirmed in Umami's docs). No cookies, Do Not Track respected, and jumps within the page don't count
  as extra page views. Events, as named in Umami → Events: Enquiry form opened · Enquiry sent (service and
  timeline only, never names or contact details) · WhatsApp click · Email click · Social click · Case study
  opened (which project; from the grid, a link or prev/next) · Brand guide opened · Outbound link ·
  Wallpaper download · 404 (which address). Tested with a stand-in for Umami: every event fires, and
  nothing is sent from local previews.
- **404 page:** `site/404.html`: navy grid, the mark, "Both sides of this link are missing.", links home, to
  the work and to start a project; hidden from search. The local test servers now serve it for unknown
  addresses with a 404 status, as the hosts do.
- **Privacy note:** `site/privacy.html`, in plain English: no cookies or stored data, cookieless statistics,
  the form only opens WhatsApp, how enquiries are used and kept (up to 12 months if no project follows),
  who else handles data, and your rights under the Nigeria Data Protection Act 2023. Linked from the footer
  and under the enquiry form; added to the sitemap.
- **New images, only where they prove a point:**
  - Limitless CF: a new "Every Thursday" group of three YouTube thumbnails (July, September, and the
    29 October one moved in from Flyers), showing the weekly system behind the "20 thumbnails" line.
  - JBB: your #REBRANDING post (the old mark beside the new) now opens "The Mark", and a bread flyer joins
    the table-water flyer in "Applied", so both product lines appear.
  - Archive: the Offspring registration flyer; two Wisdomgate flyers ("The Prevailing Blood", "Crossing
    Over with Jesus"); a new "Identity Boards" group (Bluhue Wardrobes, RJ Foods, HOOAIJ); and a new "Our Own
    Brand" group (brand guidelines board, mugs, cap).
- Checked: 0 HTML errors and 0 accessibility issues on all three pages (the homepage in both themes);
  Lighthouse desktop 100/100/100/100, privacy page 100s, 404 page 100s. Mobile homepage performance read
  81–90 in these runs, and the page from before today's changes read 78–81 back to back, so the PC was
  busy (likely OneDrive syncing the new images), not the site.

## Cursor rebuilt and new About inset (done 9 Nov 2026)
- **Cursor, permanent fix.** The old cursor hid the system pointer and drew its own ring with script,
  so it could vanish (before the first mouse move, on touch laptops that switch modes), lag or freeze
  while the page was busy, and leave a stray ring on screen when the mouse left the page. Now the ring
  IS the system cursor: small SVG images the operating system draws, so it is always exactly on the
  pointer, never lags and can't disappear, even if a script fails. States are pure CSS: navy ring on the
  page, larger orange ring on links, buttons and cards, orange ring with a "View" label on project tiles,
  zoom ring on photos, dashed ring for dragging (the logo halves and the star), small ring with a dot on
  close buttons, the normal I-beam in form fields. The alt theme uses a light ring with neon orange.
  The script only draws the trailing dot and the labels; if it stalls, only they pause. Windows high
  contrast mode and touch screens keep the normal system pointer.
- **About inset:** your mark-on-grid artwork replaces the pale mark close-up: a 500 px square crop
  inside the grid (`about/paradox-arts-mark-grid.png`, 5 KB) in the inset, and your full 1080x1918
  artwork (`about/paradox-arts-mark-grid-full.png`, 9 KB, white top edge trimmed) in the image viewer.
- The two images the page no longer uses (`paradox-art-business-card-scene.jpg`, `paradox-art-mark-detail.jpg`)
  moved to `_handoff/spare-images/` on 10 Nov 2026.
- Checked: every cursor state in both themes, the trailing dot (appears on movement, hides when the
  pointer leaves the page), drags can't leave the drag cursor stuck, no console errors, 0 accessibility
  issues in both themes, 0 HTML errors, Lighthouse desktop 100/100/100/100. Mobile read 95–97 in late
  runs, and the previous version read the same (95/96/95 against 97/95/95, tested back to back), so
  that dip is this PC under load, not the site. A full-page restyle costs about 2 ms more with the new
  cursor rules, on computers with a mouse only.

## Copy rewrites (done 9 Nov 2026, from the messaging review)
Review doc, with the verdict, ranked gaps, rewrites table, Search Console steps and Business Profile
guide: https://claude.ai/artifact/EBgv6VB4FUgzkUTp3n6BnP

Applied the rewrites that needed nothing from you:
- **Hero:** "Since 2017" (was "Formalised 2025"); label "Brand Strategy & Design Studio"; new subline
  naming strategy and design and what the client gets; second button "Start A Project" (was "Contact Us").
- **Selected Work intro:** "Five businesses, five different problems…" (was "Five rooms…").
- **Case studies:** Prime Ignites and Mac Ignites outcomes now say what happened after launch; JBB no
  longer mentions bookkeeping. The Prime Ignites paragraph that repeated the new outcome ("Paradox Arts
  continues to support…") is cut; the snapshot still reads "Brand system, then ongoing support".
- **Testimonials:** the reworded Capital Africa quote is replaced by Ration's exact words (Williams
  Terkuma, Founder). Capital Africa's full, original quote stays in its case study.
- **About:** a line naming Oluwadamilare Taiwo as the lead, after the first paragraph.
- **Contact intro:** opens with the rebrand trigger: "has your brand stopped matching the business
  you've become?"

Second round, same day, from your edits in the doc:
- **Limitless CF outcome:** "Every Thursday since May 2026 has run on one system: 20 YouTube thumbnails,
  4 flyers and the livestream graphics, delivered weekly to the church's media team." This is your wording:
  Thursday is the fellowship service day, so the screens caption now says "Thursday fellowship service".
- **Ways to Start cards:** each now shows "Typical length" and "You leave with": Brand Audit 10 working
  days, Identity Sprint 15, Web Direction 20, Ongoing Partner monthly, "to a scope we agree together"
  (your "agreed SOP", in client words).
- **Pricing FAQ:** unchanged, as you asked ("Maintain the copy").
- **About:** your portrait (`about/founder-oluwadamilare-taiwo-600/900/1200.jpg`, 32–96 KB) replaces the
  business-card photo in the main frame and opens full size with a caption. The business-card photo
  is kept, unused, in `_handoff/spare-images/`. Search engines also get your photo and title in the structured data.
- The Ongoing Partner rewording waits in the doc as a suggestion (the Limitless CF one was withdrawn).

Timing FAQ (your call: change it): "How long does a project take?" now answers from the card lengths
(about 10, 15 and 20 working days) and says a full brand system's timeline is confirmed when it is
scoped. The old "14–20 business days" no longer fit next to a 15-day Identity Sprint. Add a typical
range for a full system whenever you have one.

Re-checked after both rounds: Lighthouse desktop 100/100/100/100; mobile 99/100/100/100 (two runs at
99; one run read 96 while this PC was busy), layout shift 0. 0 accessibility issues in both themes,
0 HTML errors, no sideways scroll on phones. The new subline wraps to four lines; the hero buttons
still show at every laptop size below, with 41 px or more to spare.

## Hero on short laptop screens (done 9 Nov 2026, your call: "fit the buttons")
The headline now scales to the screen height as well as the width, so "View our work" and "Contact us"
are visible without scrolling on common laptops. It stays as large as fits: when it needs to shrink, it
uses the three-row layout ("BOTH SIDES OF IT." on one line), the same composition large monitors show.

| Screen | Before | Now | Buttons |
|---|---|---|---|
| 1920×1080, 2560×1440 | 148 px | 148 px (unchanged) | visible |
| 1440×1100 | 144 px, 4 rows | unchanged | visible |
| 1440×900 | 144 px, buttons hidden | 132 px | visible |
| 1536×864 | 148 px | 125 px | visible |
| 1280×800 | 128 px | 101 px | visible |
| 1366×768, 1024×768 | 137 / 102 px | 90 px | visible |
| 1280×720 | 128 px | 72 px | visible |
| Tablet upright, phones | — | unchanged | visible |

A phone held sideways (844×390) still needs a scroll to reach the buttons; nothing fits in 390 px.

## Final check: what changed (9 Nov 2026)
- **Speed:** fonts self-hosted (Archivo, Pacifico; licences in `site/fonts/`), with a fallback tuned to
  Archivo's size so text doesn't jump when the font arrives; logo images resized to 2–4× their display
  size; project tiles get 480/800/1200 px versions (phones download ~15–75 KB instead of 50–290 KB) and
  only start loading after the first paint; off-screen sections render as you approach them; the
  per-letter hover effect, the hero skew and the custom cursor no longer run work when idle; a start-up
  scroll read that forced a full-page layout was removed; the hero entrance starts on the first frame.
- **Navigation:** in-page links jump close and glide the last stretch, land exactly, update the address,
  move focus to the section, and Back/Forward return to sections.
- **Hero:** the headline no longer runs into the orange mark on wide-but-short screens.
- **SEO:** shorter title and description, social card details, richer structured data, manifest, icons.
- **Accessibility:** valid "Ways To Start" cards (real headings + buttons), named pop-ups, FAQ answers
  linked to their questions, form errors announced and tied to fields, lab cards are real toggles once
  unlocked, larger footer tap targets, skip link focus, alt-theme label contrast.
- **Content:** case-study numbers now match their tiles. Footer, changed 16 Nov 2026: © 2026, the site's
  first year, then © 2026–2027 and so on by itself. The hero keeps "Since 2017" (your practice) and the
  founder's note keeps "formalised it in February 2025".

## Earlier rounds (7 Nov 2026)
- Contact section: option 1 of 4 (orange field, details on a cream card). Mock-ups in `_handoff/contact-options.html`.
- Download Wallpaper reward serves `logo/paradox-arts-wallpaper.jpg` (graffiti mark artwork).
- Hidden-image bug fixed (masked images now reveal and load as you scroll).
- Founding Logic halves rebuilt from the master logo as complete shapes; tap-to-complete bug fixed.
- Alt colour theme: project images in colour inside case studies; tiles black-and-white with readable
  text and colour on hover; decorative images grayscale.
- Work thumbnails dimmed for readable titles; custom cursor fixes; JBB before/after letterheads;
  transparent Mac and Ration logos; Limitless CF YouTube thumbnail; sound toggle plays the music;
  nav logo in the V1 Dark version.

## Notes
- The Medalarm image is 885 px wide (its size inside the PowerPoint); an original export would look sharper.
- The primeignites.com screenshots show the site as of 7 Nov 2026; recapture if the site changes.
- If a project tile image changes, regenerate its -480/-800/-1200 copies (or remove that entry from
  `window.PX_THUMBS` in `index.html`, and the tile falls back to the single image).
- Case studies live inside the one page (`#work/...` addresses), which search engines index as part of the
  home page. Separate case-study pages would rank individually; worth doing if SEO becomes a priority.

## Images you have that the site doesn't use yet (on purpose)
- The other LCF YouTube thumbnails, the Testimony carousel slides and the `DISPLAY IMGS` screens: the case
  study shows samples, and seven screen cards are already in it.
- More Wisdomgate flyers, the JBB water-flyer variants and content posts: one or two of each already show
  the range.
- Mac Ignites ID card front/back and the Capital Africa staff card: both show personal phone numbers and
  contact details, and the Mac card is already represented by its sample layout.
- The Shop With The Stars, Events by Daphne and Medalarm identity boards (Events by Daphne and Medalarm
  already appear in the Archive), and other Paradox mockups (laptop sticker, magazine covers).
- Two former About images (`paradox-art-business-card-scene.jpg`, `paradox-art-mark-detail.jpg`), now in
  `_handoff/spare-images/`.
