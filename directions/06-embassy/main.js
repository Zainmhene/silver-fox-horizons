/* Silver Fox Horizons: Direction 06, "Embassy" */
(function () {
  'use strict';
  window.__sfhReady = true;

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: compact once the page moves ---------- */
  var header = doc.getElementById('site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-compact', window.scrollY > 48);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Figures: count up once, when seen ---------- */
  var nums = Array.prototype.slice.call(doc.querySelectorAll('.num[data-to]'));
  function fmt(v, dec) { return dec ? v.toFixed(dec) : String(Math.round(v)); }
  if (!reduceMotion) {
    nums.forEach(function (n) { n.textContent = fmt(0, +n.dataset.dec || 0); });
  }
  function countUp() {
    if (reduceMotion) return;
    var t0 = performance.now();
    var dur = 2600;
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      nums.forEach(function (n) {
        var dec = +n.dataset.dec || 0;
        n.textContent = fmt(parseFloat(n.dataset.to) * e, dec);
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll ---------- */
  var figures = doc.querySelector('.figures');
  if (figures) figures.setAttribute('data-io', '');
  var signatures = doc.querySelector('.signatures');
  if (signatures) signatures.setAttribute('data-io', '');

  function enter(el) {
    el.classList.add('is-in');
    if (el === figures) countUp();
  }
  var targets = doc.querySelectorAll('[data-io]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          enter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(enter);
  }

  /* ---------- Mobile menu (dialog) ---------- */
  var menuBtn = doc.querySelector('.menu-btn');
  var menu = doc.getElementById('menu');
  var closeBtn = menu ? menu.querySelector('.menu__close') : null;

  function focusables() {
    return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
  }
  function onMenuKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    doc.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    doc.addEventListener('keydown', onMenuKey);
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
    doc.removeEventListener('keydown', onMenuKey);
    if (returnFocus) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      if (menu.hidden) openMenu(); else closeMenu(true);
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { closeMenu(true); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(false); });
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (mq) {
      if (mq.matches && !menu.hidden) closeMenu(false);
    });
  }

  /* ---------- Footnotes: keep inside the viewport, Escape to dismiss ---------- */
  var fits = [];
  doc.querySelectorAll('.fn').forEach(function (fn) {
    var mark = fn.querySelector('.fn__mark');
    var note = fn.querySelector('.fn__note');
    if (!mark || !note) return;
    function place() {
      fn.classList.remove('is-dismissed');
      fit();
      // Open below the marker when there is no room above it (under the sticky header)
      var fr = fn.getBoundingClientRect();
      var hb = header ? header.getBoundingClientRect().bottom : 0;
      fn.classList.toggle('fn--below', fr.top - note.offsetHeight - 24 < hb);
    }
    function fit() {
      // Measure from the marker, not the note: the note's transform may be mid-transition
      var fr = fn.getBoundingClientRect();
      var w = note.offsetWidth;
      var left = fr.left + fr.width / 2 - w / 2;
      var vw = doc.documentElement.clientWidth;
      var pad = 16, shift = 0;
      if (left < pad) shift = pad - left;
      else if (left + w > vw - pad) shift = vw - pad - (left + w);
      note.style.setProperty('--shift', Math.round(shift) + 'px');
    }
    fits.push(fit);
    fit();
    fn.addEventListener('mouseenter', place);
    mark.addEventListener('focus', place);
    mark.addEventListener('click', function () {
      place();
      fn.classList.toggle('is-open');
    });
    mark.addEventListener('blur', function () { fn.classList.remove('is-open'); });
    fn.addEventListener('mouseleave', function () { fn.classList.remove('is-dismissed'); });
    fn.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        fn.classList.remove('is-open');
        fn.classList.add('is-dismissed');
      }
    });
  });
  var fitQueued = false;
  window.addEventListener('resize', function () {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () { fitQueued = false; fits.forEach(function (f) { f(); }); });
  });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fits.forEach(function (f) { f(); }); });

  doc.addEventListener('click', function (e) {
    doc.querySelectorAll('.fn.is-open').forEach(function (fn) {
      if (!fn.contains(e.target)) fn.classList.remove('is-open');
    });
  });

  /* ---------- Atlas: Africa engraved in gold hairline ---------- */
  var atlas = doc.getElementById('atlas');
  var SVGNS = 'http://www.w3.org/2000/svg';
  var LON0 = -19, LAT0 = 38.5, K = 10, W = 720, H = 740;

  function project(p) { return [(p[0] - LON0) * K, (LAT0 - p[1]) * K]; }
  function inView(p) { var q = project(p); return q[0] >= -2 && q[0] <= W + 2 && q[1] >= -2 && q[1] <= H + 2; }
  function lineToD(line) {
    var d = '';
    for (var i = 0; i < line.length; i++) {
      var q = project(line[i]);
      d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    }
    return d;
  }
  function el(name, attrs, parent) {
    var node = doc.createElementNS(SVGNS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function lines(geo) {
    var g = geo.geometry || geo;
    if (g.type === 'LineString') return [g.coordinates];
    if (g.type === 'MultiLineString') return g.coordinates;
    if (geo.features) return geo.features.reduce(function (a, f) { return a.concat(lines(f)); }, []);
    return [];
  }

  // Label placement per city: r = right, l = left, b = below, a = above
  var LABEL = {
    Accra: 'bl', Kigali: 'l', Kinshasa: 'l', Luanda: 'l', Lagos: 'b',
    Abuja: 'r', Nairobi: 'r', 'Addis Ababa': 'l', Dakar: 'r', Johannesburg: 'r',
    Cairo: 'r', Casablanca: 'r'
  };

  function ptKey(p) { return p[0].toFixed(3) + ',' + p[1].toFixed(3); }
  function chain(arcs) {
    var rem = arcs.map(function (a) { return a.slice(); });
    var rings = [];
    while (rem.length) {
      var r = rem.shift();
      var grew = true;
      while (grew) {
        grew = false;
        var e = ptKey(r[r.length - 1]), s = ptKey(r[0]);
        for (var i = 0; i < rem.length; i++) {
          var a = rem[i];
          if (ptKey(a[0]) === e) r = r.concat(a.slice(1));
          else if (ptKey(a[a.length - 1]) === e) r = r.concat(a.slice().reverse().slice(1));
          else if (ptKey(a[a.length - 1]) === s) r = a.concat(r.slice(1));
          else if (ptKey(a[0]) === s) r = a.slice().reverse().concat(r.slice(1));
          else continue;
          rem.splice(i, 1);
          grew = true;
          break;
        }
      }
      rings.push(r);
    }
    return rings.sort(function (a, b) { return b.length - a.length; });
  }

  function buildAtlas() {
    if (!atlas || !window.fetch) return;
    Promise.all([
      getJSON('assets/africa-outline.geo.json'),
      getJSON('assets/africa-borders.geo.json'),
      getJSON('assets/places.json')
    ]).then(function (res) {
      var outline = res[0], borders = res[1], places = res[2];

      // Graticule: equator and the tropics
      var grat = el('g', { 'class': 'a-grat', 'aria-hidden': 'true' }, atlas);
      [[23.44, 'Tropic of Cancer', 1], [0, 'Equator', 0], [-23.44, 'Tropic of Capricorn', 0]].forEach(function (g) {
        var y = (LAT0 - g[0]) * K;
        el('line', { x1: 0, x2: W, y1: y.toFixed(1), y2: y.toFixed(1) }, grat);
        var t = el('text', { x: g[2] ? W : 0, y: (y - 8).toFixed(1), 'text-anchor': g[2] ? 'end' : 'start' }, grat);
        t.textContent = g[1];
      });

      // Internal borders, one quiet path
      var bd = lines(borders).filter(function (l) { return l.some(inView); }).map(lineToD).join('');
      el('path', { 'class': 'a-borders', d: bd, 'aria-hidden': 'true' }, atlas);

      // Coastline: join the edge arcs into closed rings, so the continent is drawn in one stroke
      var og = el('g', { 'class': 'a-outline', 'aria-hidden': 'true' }, atlas);
      var rings = chain(lines(outline).filter(function (l) { return l.some(inView); }));
      rings.forEach(function (r, i) {
        if (i === 0) {
          // Start the pen at the northern tip
          var top = 0;
          for (var j = 1; j < r.length; j++) if (r[j][1] > r[top][1]) top = j;
          r = r.slice(top).concat(r.slice(1, top + 1));
        }
        el('path', { d: lineToD(r), pathLength: 1, 'class': i === 0 ? 'coast' : 'isle' }, og);
      });

      // Demo cities
      var cg = el('g', { 'class': 'a-cities', 'aria-hidden': 'true' }, atlas);
      var names = Object.keys(places.africa || {});
      names.forEach(function (name, i) {
        var q = project(places.africa[name]);
        var g = el('g', { 'class': 'a-city', style: '--i:' + i }, cg);
        el('circle', { 'class': 'ring', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 7 }, g);
        el('circle', { 'class': 'dot', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.6 }, g);
        var pos = LABEL[name] || 'r';
        var tx = q[0], ty = q[1] + 5, anchor = 'start';
        if (pos === 'r') { tx += 14; }
        if (pos === 'l') { tx -= 14; anchor = 'end'; }
        if (pos === 'b') { tx -= 4; ty = q[1] + 27; anchor = 'middle'; }
        if (pos === 'a') { ty = q[1] - 16; anchor = 'middle'; }
        if (pos === 'bl') { tx -= 6; ty = q[1] + 26; anchor = 'end'; }
        if (pos === 'br') { tx += 6; ty = q[1] + 26; }
        var t = el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': anchor }, g);
        t.textContent = name;
      });
    }).catch(function () {
      var f = atlas.closest('.atlas');
      if (f) f.hidden = true;
    });
  }
  buildAtlas();
})();
