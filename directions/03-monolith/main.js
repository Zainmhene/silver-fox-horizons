/* Silver Fox Horizons — Direction 03 "MONOLITH"
   Vanilla JS, no dependencies. Content is fully visible without it. */
(function () {
  'use strict';
  window.__sfh = true;

  var doc = document;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var fontsReady = (doc.fonts && doc.fonts.ready) ? Promise.race([
    Promise.all([
      doc.fonts.load('700 100px "Inter Tight"', 'AFRICA'),
      doc.fonts.load('600 100px "Inter Tight"', 'A'),
      doc.fonts.load('500 100px "Inter Tight"', 'A'),
      doc.fonts.load('400 17px "Inter"', 'A')
    ]).then(function () { return doc.fonts.ready; }),
    new Promise(function (r) { setTimeout(r, 2000); })
  ]) : Promise.resolve();

  /* ------------------------------------------------------------
     1. Line splitter: wraps each rendered line in a mask so it
        can slide up. Keeps inline elements (sup, span) intact.
     ------------------------------------------------------------ */
  function tokenize(el) {
    var words = [];
    var cur = null;
    function add(node) {
      if (!cur) { cur = { nodes: [] }; words.push(cur); }
      cur.nodes.push(node);
    }
    function walk(node, wrap) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { cur = null; return; }
            add(wrap(doc.createTextNode(p)));
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { cur = null; words.push({ br: true }); return; }
          walk(n, function (t) { var c = n.cloneNode(false); c.appendChild(t); return wrap(c); });
        }
      });
    }
    walk(el, function (t) { return t; });
    return words;
  }

  function splitLines(el) {
    if (el.__orig == null) el.__orig = el.innerHTML;
    el.innerHTML = el.__orig;
    var words = tokenize(el);
    el.innerHTML = '';
    var spans = [];
    words.forEach(function (w, i) {
      if (w.br) { el.appendChild(doc.createElement('br')); return; }
      var s = doc.createElement('span');
      s.className = 'w';
      w.nodes.forEach(function (n) { s.appendChild(n); });
      if (spans.length && !(words[i - 1] && words[i - 1].br)) el.appendChild(doc.createTextNode(' '));
      el.appendChild(s);
      spans.push(s);
    });
    var lines = [];
    var lastTop = null;
    spans.forEach(function (s) {
      var t = s.offsetTop;
      if (lastTop === null || Math.abs(t - lastTop) > 3) { lines.push([]); lastTop = t; }
      lines[lines.length - 1].push(s);
    });
    el.innerHTML = '';
    lines.forEach(function (ln, i) {
      var outer = doc.createElement('span');
      outer.className = 'ln';
      var inner = doc.createElement('span');
      inner.className = 'ln__in';
      inner.style.setProperty('--i', i);
      ln.forEach(function (s, j) {
        if (j) inner.appendChild(doc.createTextNode(' '));
        while (s.firstChild) inner.appendChild(s.firstChild);
      });
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.classList.add('is-split');
  }

  var splitEls = $$('[data-split]');
  function splitAll() { splitEls.forEach(splitLines); }

  /* ------------------------------------------------------------
     2. Reveal on scroll
     ------------------------------------------------------------ */
  var revealEls = $$('[data-rv], [data-split], .gridlines');
  var io = null;
  function startReveals() {
    if (RM || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    var vh = window.innerHeight, vw = window.innerWidth;
    revealEls.forEach(function (e) {
      // Anything already on screen at load reveals now, even in the bottom strip.
      var r = e.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0) e.classList.add('is-in');
      else io.observe(e);
    });
  }

  /* ------------------------------------------------------------
     3. Hero word: crop the SVG viewBox to the exact ink of the
        letters so AFRICA spans the grid edge to edge.
     ------------------------------------------------------------ */
  var measureCtx = doc.createElement('canvas').getContext('2d');
  function inkMetrics(text, weight, tracking) {
    measureCtx.font = weight + ' 100px "Inter Tight"';
    if ('letterSpacing' in measureCtx) measureCtx.letterSpacing = tracking + 'px';
    var m = measureCtx.measureText(text);
    return {
      left: m.actualBoundingBoxLeft,
      right: m.actualBoundingBoxRight,
      asc: m.actualBoundingBoxAscent,
      desc: m.actualBoundingBoxDescent
    };
  }
  function fitHeroWord(svg) {
    var texts = $$('text', svg);
    if (!texts.length) return;
    var ms = texts.map(function (t) { return inkMetrics(t.textContent, 700, -4); });
    var A = Math.max.apply(null, ms.map(function (m) { return m.asc; }));
    var D = Math.max.apply(null, ms.map(function (m) { return m.desc; }));
    var gap = 10;
    var W = 0;
    ms.forEach(function (m, i) {
      W = Math.max(W, m.left + m.right);
      texts[i].setAttribute('x', m.left.toFixed(2));
      texts[i].setAttribute('y', (A + i * (A + D + gap)).toFixed(2));
    });
    var H = texts.length * (A + D) + (texts.length - 1) * gap;
    if (W > 0 && H > 0) svg.setAttribute('viewBox', '0 0 ' + W.toFixed(2) + ' ' + H.toFixed(2));
  }

  /* Contact line: two lines set so the longer one meets the grid edge. */
  function fitContact() {
    var h = $('.contact__h[data-fit]');
    if (!h) return;
    var a = inkMetrics('Let’s build', 600, -5.5);
    var b = inkMetrics('what’s next', 600, -5.5);
    var ratio = Math.max(a.left + a.right, b.left + b.right + 22) / 100;
    var avail = h.clientWidth;
    if (!(ratio > 0 && avail > 0)) return;
    var fs = avail / ratio;
    h.style.setProperty('--fit', fs.toFixed(2) + 'px');
    // One correction pass against the rendered lines (dot included).
    var widest = 0;
    $$('.contact__ln > span', h).forEach(function (s) { widest = Math.max(widest, s.getBoundingClientRect().width); });
    var used = parseFloat(getComputedStyle(h).fontSize) || fs;
    if (widest > 0) h.style.setProperty('--fit', (used * avail / widest * 0.995).toFixed(2) + 'px');
  }

  /* ------------------------------------------------------------
     4. Videos: load and play only when visible
     ------------------------------------------------------------ */
  function setupVideos() {
    var vids = $$('video[data-src]');
    if (RM || !vids.length || !('IntersectionObserver' in window)) return;
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
    doc.addEventListener('visibilitychange', function () {
      vids.forEach(function (v) { if (doc.hidden && !v.paused) v.pause(); });
    });
  }

  /* ------------------------------------------------------------
     5. Header: tone follows the section under it; active nav
     ------------------------------------------------------------ */
  var hdr = $('.hdr');
  var toneSections = $$('main [data-tone], footer[data-tone]');
  var navLinks = $$('.hdr__nav a[data-nav]');
  var navMap = { about: 'about', expertise: 'expertise', insights: 'insights', contact: 'contact' };
  function updateHeader() {
    var y = hdr.offsetHeight / 2;
    var probe = window.innerHeight * 0.45;
    var tone = 'dark', active = null;
    for (var i = 0; i < toneSections.length; i++) {
      var s = toneSections[i];
      var r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) tone = s.dataset.tone;
      if (r.top <= probe && r.bottom > probe) active = navMap[s.id] || null;
    }
    if (hdr.dataset.tone !== tone) hdr.dataset.tone = tone;
    navLinks.forEach(function (a) {
      var on = a.dataset.nav === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------
     6. Mobile menu (dialog): focus trap, Escape closes
     ------------------------------------------------------------ */
  var menuBtn = $('.hdr__menu');
  var menu = $('#menu');
  var menuClose = $('.menu__close');
  function focusables() { return $$('a[href], button:not([disabled])', menu); }
  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    doc.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    menuClose.focus();
  }
  function closeMenu(returnFocus) {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
    if (returnFocus) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', function () { closeMenu(true); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------------------------------------
     7. Expertise: pinned horizontal band (wide screens only)
     ------------------------------------------------------------ */
  var xp = $('.xp');
  var xpPin = $('.xp__pin');
  var xpTrack = $('.xp__track');
  var xpCount = $('.xp__count-n');
  var xpPanels = $$('.xp__panel');
  var mqPin = window.matchMedia('(min-width: 860px)');
  var pinned = false, xpDist = 0;

  function fitStackedWords() {
    var avail = xpTrack.clientWidth - parseFloat(getComputedStyle(xpTrack).paddingLeft) * 2;
    var m = inkMetrics('STATECRAFT', 700, -3.5);
    var w = m.left + m.right;
    if (w > 0 && avail > 0) xp.style.setProperty('--xp-fit', (avail / w * 100 * 0.995).toFixed(2) + 'px');
  }

  function layoutXP() {
    if (!xp) return;
    var want = mqPin.matches && !RM;
    if (want !== pinned) {
      pinned = want;
      xp.classList.toggle('is-pinned', want);
    }
    if (!pinned) {
      xpPin.style.height = '';
      xpTrack.style.transform = '';
      fitStackedWords();
      return;
    }
    xpDist = Math.max(0, xpTrack.scrollWidth - window.innerWidth);
    xpPin.style.height = (window.innerHeight + xpDist) + 'px';
    updateXP();
  }

  function updateXP() {
    if (!pinned) return;
    var r = xpPin.getBoundingClientRect();
    var p = xpDist ? clamp(-r.top / xpDist, 0, 1) : 0;
    xpTrack.style.transform = 'translate3d(' + (-p * xpDist).toFixed(1) + 'px,0,0)';
    xp.style.setProperty('--p', p.toFixed(4));
    var idx = 0;
    xpPanels.forEach(function (pn, i) { if (pn.getBoundingClientRect().left < window.innerWidth * 0.5) idx = i; });
    var label = '0' + (idx + 1);
    if (xpCount.textContent !== label) xpCount.textContent = label;
  }

  function xpTargetY(panel) {
    var pinTop = xpPin.getBoundingClientRect().top + window.pageYOffset;
    var pad = parseFloat(getComputedStyle(xpTrack).paddingLeft) || 0;
    return pinTop + clamp(panel.offsetLeft - pad, 0, xpDist);
  }

  $$('a[href^="#xp-"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!pinned) return;
      var panel = $(a.getAttribute('href'));
      if (!panel) return;
      e.preventDefault();
      window.scrollTo({ top: xpTargetY(panel), behavior: RM ? 'auto' : 'smooth' });
    });
  });

  /* ------------------------------------------------------------
     8. Map: Africa from Natural Earth, 24 demo countries lit
     ------------------------------------------------------------ */
  var ENGAGED = ['Nigeria', 'Ghana', 'Senegal', "Cote d'Ivoire", 'Kenya', 'Rwanda', 'Ethiopia', 'Tanzania',
    'Uganda', 'South Africa', 'Egypt', 'Morocco', 'Dem. Rep. Congo', 'Angola', 'Zambia', 'Mozambique',
    'Namibia', 'Botswana', 'Cameroon', 'Gabon', 'Sierra Leone', 'Liberia', 'Malawi', 'Tunisia'];
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/gi, '').toLowerCase(); }
  var engagedSet = {};
  ENGAGED.forEach(function (n) { engagedSet[norm(n)] = true; });

  function drawMap() {
    var svg = $('.map');
    if (!svg || !window.fetch) return;
    var LON0 = -18.5, LAT1 = 38, K = 10;
    function pt(c) { return ((c[0] - LON0) * K).toFixed(1) + ',' + ((LAT1 - c[1]) * K).toFixed(1); }
    function ring(r) { return 'M' + r.map(pt).join('L') + 'Z'; }
    if (!RM) svg.classList.add('is-wait');
    fetch('assets/africa-countries.geo.json')
      .then(function (r) { return r.json(); })
      .then(function (gj) {
        var NS = 'http://www.w3.org/2000/svg';
        var lit = [];
        var frag = doc.createDocumentFragment();
        gj.features.forEach(function (f) {
          var g = f.geometry; if (!g) return;
          var polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
          var d = polys.map(function (poly) { return poly.map(ring).join(''); }).join('');
          var p = doc.createElementNS(NS, 'path');
          p.setAttribute('d', d);
          if (engagedSet[norm(f.properties.name)]) {
            p.setAttribute('class', 'on');
            var c = polys[0][0];
            var cx = 0; c.forEach(function (q) { cx += q[0]; });
            lit.push({ el: p, x: cx / c.length });
          }
          frag.appendChild(p);
        });
        svg.appendChild(frag);
        // light them west to east, one by one
        lit.sort(function (a, b) { return a.x - b.x; }).forEach(function (o, i) {
          o.el.style.transitionDelay = (i * 70) + 'ms';
        });
        if (RM) return;
        var fig = svg.closest('figure');
        var mio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { svg.classList.remove('is-wait'); mio.disconnect(); }
          });
        }, { rootMargin: '0px 0px -20% 0px' });
        mio.observe(fig);
      })
      .catch(function () { svg.classList.remove('is-wait'); });
  }

  /* ------------------------------------------------------------
     9. Insights: image reveal that follows the hovered row
     ------------------------------------------------------------ */
  function setupInsights() {
    var box = $('.ins');
    var flt = $('.ins__float');
    if (!box || !flt) return;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;
    var img = $('img', flt);
    var links = $$('.ins__link', box);
    var ty = 0, cy = 0, running = false, primed = false;
    function prime() {
      if (primed) return; primed = true;
      links.forEach(function (a) { var i = new Image(); i.src = a.dataset.img; });
    }
    function loop() {
      cy += (ty - cy) * (RM ? 1 : 0.11);
      flt.style.transform = 'translate3d(0,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(ty - cy) > 0.3) requestAnimationFrame(loop); else running = false;
    }
    function aim(y, jump) {
      var max = box.offsetHeight - flt.offsetHeight;
      ty = clamp(y - flt.offsetHeight / 2, 0, Math.max(0, max));
      if (jump) cy = ty;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    function show(a, jump) {
      prime();
      if (img.getAttribute('src') !== a.dataset.img) img.src = a.dataset.img;
      var wasOn = flt.classList.contains('is-on');
      var r = a.getBoundingClientRect(), b = box.getBoundingClientRect();
      aim(r.top - b.top + r.height / 2, jump || !wasOn);
      flt.classList.add('is-on');
    }
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { show(a); });
      a.addEventListener('focus', function () { show(a, true); });
      a.addEventListener('blur', function () { flt.classList.remove('is-on'); });
    });
    box.addEventListener('mousemove', function (e) {
      if (!flt.classList.contains('is-on')) return;
      aim(e.clientY - box.getBoundingClientRect().top);
    });
    box.addEventListener('mouseleave', function () { flt.classList.remove('is-on'); });
  }

  /* ------------------------------------------------------------
     Scroll / resize loop
     ------------------------------------------------------------ */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateHeader();
      updateXP();
    });
  }

  var lastW = window.innerWidth, rT = null;
  function onResize() {
    clearTimeout(rT);
    rT = setTimeout(function () {
      var w = window.innerWidth;
      if (w !== lastW) {
        lastW = w;
        if (!RM) splitEls.forEach(function (el) {
          var wasIn = el.classList.contains('is-in');
          splitLines(el);
          if (wasIn) el.classList.add('is-in');
        });
        if (w >= 860) closeMenu(false);
      }
      fitContact();
      layoutXP();
      updateHeader();
    }, 150);
  }

  /* ------------------------------------------------------------
     Boot
     ------------------------------------------------------------ */
  setupVideos();
  setupInsights();
  updateHeader();

  // Fetch the map data only when the map is getting close.
  (function () {
    var fig = $('.reach__map');
    if (!fig) return;
    if (!('IntersectionObserver' in window)) { drawMap(); return; }
    if (!RM) $('.map').classList.add('is-wait');
    var lio = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { lio.disconnect(); drawMap(); }
    }, { rootMargin: '900px 0px' });
    lio.observe(fig);
  })();

  fontsReady.then(function () {
    $$('.hero__word-svg').forEach(fitHeroWord);
    fitContact();
    if (!RM) splitAll(); else splitEls.forEach(function (el) { el.classList.add('is-split'); });
    layoutXP();
    updateHeader();
    // Re-apply a deep link once the pinned band has its real height.
    if (location.hash && location.hash.length > 1) {
      var t = null;
      try { t = $(location.hash); } catch (err) { t = null; }
      if (t) {
        if (pinned && t.classList.contains('xp__panel')) window.scrollTo(0, xpTargetY(t));
        else t.scrollIntoView();
      }
    }
    requestAnimationFrame(startReveals);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
})();
