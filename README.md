# Paradox Arts website

The portfolio site for Paradox Arts, a strategic branding studio in Lagos: [paradox-arts.com](https://www.paradox-arts.com).

A static site with no build step. Everything in this folder is the website, and `index.html` is the homepage.

## What's where

- `index.html`: the homepage, with its styles, scripts and the case-study data (`window.PX_PROJECTS`). `privacy.html` and `404.html` are the other two pages.
- `images/`: every picture, one folder per project (`prime-ignites/`, `lcf/`, `mac/`, `jbb/`, `jobrown/`, `ration/`, `ca/`, `studio-wall/`), plus `about/`, `logo/` and `mascot/`.
- `fonts/`: the self-hosted fonts and their licences.
- `guides/`: the client brand guides (PDF) that the case studies link to.
- `audio/`: the background music.
- `analytics.js`: visit statistics (Umami Cloud, no cookies). It only counts on paradox-arts.com.
- `_headers`: caching rules the host applies. The host reads it and doesn't publish it.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: for search engines and phones.

## Publishing

The host publishes the `main` branch of this repo as it is: no build command, and the output folder left empty (the top of the repo). Every push to `main` goes live within a minute or two.

## Preview locally

Run any static web server in this folder, for example `npx serve .` (Node.js) or `python -m http.server 8080`, and open the address it prints.

## Changing pictures

Pictures, fonts and the music stay in visitors' browsers for a year. To replace one, save it under a new file name and update its link in `index.html`; a file that keeps its old name can stay stale for returning visitors.
