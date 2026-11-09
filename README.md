# Paradox Arts website

The portfolio site for Paradox Arts, a strategic branding studio in Lagos: [paradox-arts.com](https://www.paradox-arts.com).

It is a static site with no build step. Everything the host serves is in `site/`.

## Folders

- `site/`: the website. `index.html` holds the page, its styles and scripts, and the case-study data (`window.PX_PROJECTS`). Images sit in one folder per project.
- `site/_headers`: caching rules that Cloudflare Pages and Netlify apply. The host reads it and doesn't publish it.
- `_handoff/`: working files from the original handoff, plus spare photos the site no longer uses. Not published.
- `.claude/tools/`: two small Node servers for previewing the site locally.
- `SETUP-STATUS.md`: what is done, what is still open, and the launch checklist.

## Preview locally

Needs Node.js.

```bash
node .claude/tools/serve.js site 8080
```

Then open http://localhost:8080. `prodserve.js` serves the same files with gzip and caching, the way a production host would.

## Going live

Connect this repo to Cloudflare Pages (or Netlify) with no build command and `site` as the output folder. Every push to `main` then goes live by itself. On any other host, upload the contents of `site/` and copy the rules in `site/_headers` into the host's settings.

Images, fonts and the music stay in visitors' browsers for a year. To replace one, save it under a new file name and update `index.html`; a file that keeps its old name can stay stale for returning visitors.

The steps after launch (Search Console, Google Business Profile, analytics) are in `SETUP-STATUS.md`.
