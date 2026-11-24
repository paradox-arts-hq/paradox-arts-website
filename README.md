# Paradox Arts website

The portfolio site for Paradox Arts, a strategic branding studio in Lagos: [paradox-arts.com](https://www.paradox-arts.com).

A static site. Everything in this folder is the website, and `index.html` is the homepage. The case-study pages in `work/` are generated from `index.html` by one small script (see "Case-study pages" below).

## What's where

- `index.html`: the homepage, with its styles, scripts and the case-study data (`window.PX_PROJECTS`). `privacy.html` and `404.html` are the other two hand-made pages.
- `work/`: one generated page per case study (`work/<slug>/index.html`), plus their shared `case-study.css` and `case-study.js`. Don't edit these by hand.
- `images/`: every picture, one folder per project (`prime-ignites/`, `lcf/`, `mac/`, `jbb/`, `jobrown/`, `ration/`, `ca/`, `studio-wall/`), plus `about/`, `logo/` and `mascot/`.
- `fonts/`: the self-hosted fonts and their licences.
- `guides/`: the client brand guides (PDF) that the case studies link to.
- `audio/`: the background music.
- `analytics.js`: visit statistics (Umami Cloud, no cookies). It only counts on paradox-arts.com.
- `_headers`: caching rules for hosts that read them (Cloudflare Pages, Netlify). GitHub Pages ignores it.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: for search engines and phones. The case-study entries in `sitemap.xml` are written by the script.
- `.github/`: the publishing workflow and the case-study page script. GitHub doesn't publish this folder.

## Publishing

GitHub Pages publishes the `main` branch through `.github/workflows/static.yml`: a **build** job rebuilds the case-study pages and uploads the site, then a **deploy** job publishes it. Every push to `main` goes live within a minute or two. If a deploy ever fails with "No artifacts named github-pages", start a new run (Actions → Deploy site to GitHub Pages → Run workflow) rather than re-running the failed one.

## Case-study pages

Every case study also has its own page, for example `/work/prime-ignites/`, so search engines can find it and it can be shared as a link. The homepage cards link to these pages; a plain click still opens the pop-up. The pages are built from the same data as the pop-ups by `.github/scripts/build-case-pages.mjs` (Node.js, no installs needed).

After adding or changing a case study in `index.html`, run:

```
node .github/scripts/build-case-pages.mjs
```

and commit the updated `work/` folder and `sitemap.xml` with your change. The publishing workflow runs the same script before every deploy, so the live pages stay in step even if you forget.

## Preview locally

Run any static web server in this folder, for example `npx serve .` (Node.js) or `python -m http.server 8080`, and open the address it prints.

## Changing pictures

Pictures, fonts and the music stay in visitors' browsers for a year. To replace one, save it under a new file name and update its link in `index.html`; a file that keeps its old name can stay stale for returning visitors.
