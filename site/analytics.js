/* Paradox Arts · visit statistics with Umami Cloud (no cookies, nothing that identifies a visitor).

   TO SWITCH IT ON: paste your Website ID between the quotes on the WEBSITE_ID line below.
   Find it in Umami Cloud: Settings → Websites → paradox-arts.com → Edit → Website ID.
   While it is empty, nothing loads and nothing is sent.

   What gets counted: page visits, plus these events (names as they appear in Umami → Events):
     Enquiry form opened · Enquiry sent · WhatsApp click · Email click · Social click ·
     Case study opened · Brand guide opened · Outbound link · Wallpaper download · 404
   Enquiry events carry only the service and timeline chosen, never names or contact details. */
(function () {
  var WEBSITE_ID = 'dea7c645-9606-4c59-ae4c-de82035942d9';  // Paradox Arts on Umami Cloud (added 9 Nov 2026)
  var LIVE_HOSTS = ['paradox-arts.com', 'www.paradox-arts.com'];

  // Calls made before this file loads wait in window.pxTrackQ (set up by the one-line stub in each page).
  var pending = window.pxTrackQ || [];
  window.pxTrack = function (name, data) {
    try {
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
      else if (pending) pending.push([name, data]);
    } catch (err) { /* statistics must never break the page */ }
  };

  // Only the live site is counted: local previews and any other address send nothing.
  if (!WEBSITE_ID || LIVE_HOSTS.indexOf(location.hostname) === -1) { pending = null; window.pxTrackQ = []; return; }

  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', WEBSITE_ID);
  s.setAttribute('data-domains', LIVE_HOSTS.join(','));
  s.setAttribute('data-exclude-hash', 'true');  // jumps within the page (#work, #about) are not extra page views
  s.setAttribute('data-do-not-track', 'true');  // a browser's Do Not Track setting is respected
  s.onload = function () {
    var queued = pending || []; pending = null;
    queued.forEach(function (e) { window.pxTrack(e[0], e[1]); });
  };
  document.head.appendChild(s);

  // Contact and outbound clicks on every page, through one listener (covers links added later too).
  function where(a) {
    var box = a.closest('section[id], [role="dialog"][id], footer, header');
    return box ? (box.id || box.tagName.toLowerCase()) : 'page';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^https:\/\/wa\.me\//i.test(href)) window.pxTrack('WhatsApp click', { from: where(a) });
    else if (/^mailto:/i.test(href)) window.pxTrack('Email click', { from: where(a) });
    else if (/\.pdf($|[?#])/i.test(href)) window.pxTrack('Brand guide opened', { file: href.split('/').pop() });
    else if (a.hasAttribute('download')) window.pxTrack('Wallpaper download');
    else if (/instagram\.com|tiktok\.com|linkedin\.com/i.test(href)) window.pxTrack('Social click', { network: href.match(/instagram|tiktok|linkedin/i)[0].toLowerCase() });
    else if (/^https?:\/\//i.test(href) && a.hostname !== location.hostname) window.pxTrack('Outbound link', { site: a.hostname });
  }, true);
})();
