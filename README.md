# Paradox Arts website

The portfolio site for Paradox Arts, a strategic branding studio in Lagos: [paradox-arts.com](https://www.paradox-arts.com).

It is a static site with no build step. Everything the host serves is in `site/`.

## Folders

- `site/`: the website. `index.html` holds the page, its styles and scripts, and the case-study data (`window.PX_PROJECTS`). Images sit in one folder per project.
- `site/_handoff/`: working files from the original handoff. Leave this folder out when uploading to the host.
- `.claude/tools/`: two small Node servers for previewing the site locally.
- `SETUP-STATUS.md`: what is done, what is still open, and the launch checklist.

## Preview locally

Needs Node.js.

```bash
node .claude/tools/serve.js site 8080
```

Then open http://localhost:8080. `prodserve.js` serves the same files with gzip and caching, the way a production host would.

## Going live

Upload everything in `site/` except `_handoff/` to a host with HTTPS. The steps after launch (Search Console, Google Business Profile, analytics) are in `SETUP-STATUS.md`.
