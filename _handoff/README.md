# Paradox Arts website: hand-off notes

## 1. Upload checklist

Put these in the site root, keeping the folder names:

| Item | Notes |
|---|---|
| `portfolio_paradox_merged.html` | Rename to `index.html`. |
| `mascot/` | Three WebP files, already optimised. |
| `logo/` | Your existing logo files, plus `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `favicon-64.png` from this package. |
| Project folders | `prime-ignites/`, `lcf/`, `mac/`, `ration/`, `ca/`, `jbb/`, `jobrown/`, `mv/`, `studio-wall/`, `about/`. Every path is listed in `image-manifest.txt`. Run `compress_images.py` first. |
| `logo/og-image.jpg` | 1200 × 630 px, under 300 KB. This is the card that shows when the link is shared. It needs your real logo artwork and Archivo, so it has to be made in your design tool. |
| `robots.txt`, `sitemap.xml` | Already prepared. Submit the sitemap in Google Search Console. |
| `sub_clair-lofi-background-586104.mp3` | Loads only when someone switches sound on. |

Before it goes live:
- Set up the mailbox `hello@paradox-arts.com`. The site now uses it everywhere (links, structured data, enquiry form fallback). If you pick a different address, it is one find-and-replace.
- Turn on gzip or Brotli at the host, and caching for images.
- Open the site on a real phone over mobile data, and on a mid-range Android if you can.

## 2. Compressing the images

```
pip install pillow
python compress_images.py path/to/your/site
```

Results go to `optimized-images/` with identical names. Check them, then copy them over the originals. Target: covers and gallery images under about 250 KB each, 1800 px on the long edge. Until files are uploaded, the site hides the missing images quietly, so tiles keep their colour and text.

## 3. Adding a client or a result

Everything lives in one block, `<script id="work-data">`, in the Work section. The comment at the top explains it. In short: copy a project entry, give it a new slug, fill in `card` and the case-study fields, and add the slug to `PX_SELECTED` (the main grid, best at five or six) or `PX_WALL` (the Studio Wall). Cards, pop-ups, links and the previous and next arrows update themselves.

To show a measured result, add this to the project, and a results strip appears in its case study:

```
results: [{ value: '14 days', label: 'Brand system delivered' }, { value: '6', label: 'Core assets' }]
```

Leave it out until the number is real.

## 4. How to measure outcomes for brand work

Brand work is hard to measure with one number, so use three layers and report only what you can show.

**Delivery** (you always have these)
- Days from kickoff to handover, against the plan.
- Number of deliverables and revision rounds.
- Kickoff and handover dates from your messages or invoices.

**Adoption** (does the client actually use it?)
- Assets produced per week or month since launch.
- Time the client's team takes to produce a new piece (before and after).
- Whether the guidelines are being followed: ask for three recent client posts or documents and check them.

**Business** (needs a before and after, ideally 30, 60 and 90 days)
- Social: reach, engagement rate, follower growth, profile visits, from Instagram or LinkedIn insights. Screenshot the baseline before launch.
- Website: visits, enquiry form submissions, WhatsApp clicks, from analytics.
- Sales: enquiries per month, bookings, sign-ups, donations, or whatever the client already counts.
- Client words: one line from the client on what changed. This counts as an outcome, and the guide says to use it verbatim, with permission.

**Where you may already have numbers**
- **Limitless CF:** weekly content is ongoing, so Instagram or YouTube insights since the system launched (posts per week, reach, engagement, subscriber growth) probably exist already.
- **Prime Ignites:** the delivery timeline and the number of brand assets handed over.
- **JBB Global Services:** before and after letterhead, the date range, and any change in how they use it.
- **Mac Ignites and Jobrown:** delivery dates, the number of deliverable types, and whether the client's team now produces materials without you.

For every future project, agree one or two measures at kickoff, capture the baseline in week one, and set a 60-day check-in. That way the number exists when you need it.
