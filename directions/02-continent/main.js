/* Silver Fox Horizons / Direction 02: Continent
   The map is the website. One dot-matrix continent, built from Natural Earth data,
   carries the hero and every chapter of the expertise story. */
(function () {
  'use strict';
  window.__sfh = true;

  var doc = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pinMQ = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  var REDUCED = reduceMQ.matches;

  /* scrollbar width, so full-bleed maths match the grid */
  function setSbw() { doc.style.setProperty('--sbw', Math.max(0, window.innerWidth - doc.clientWidth) + 'px'); }
  setSbw();
  window.addEventListener('resize', setSbw);

  /* ------------------------------------------------------------------ header */
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------------- mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  var menuLabel = menuBtn.querySelector('.menu-btn__label');
  var menuTimer = 0;

  function isOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open, restoreFocus) {
    clearTimeout(menuTimer);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Close' : 'Menu';
    doc.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      var first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      menuTimer = setTimeout(function () { if (!isOpen()) menu.hidden = true; }, REDUCED ? 0 : 420);
      if (restoreFocus) menuBtn.focus();
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(!isOpen(), false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false, true); return; }
    if (e.key === 'Tab') {
      var items = [menuBtn].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      else if (i === -1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches && isOpen()) setMenu(false, false); });

  /* ------------------------------------------------------------------ reveals */
  document.querySelectorAll('.display, .h-chapter, .h-statement, .h-section').forEach(function (h) {
    h.classList.add('lines');
    h.querySelectorAll('.ln').forEach(function (ln, i) { ln.style.setProperty('--i', i); });
  });
  document.querySelectorAll('.figures, .steps, .values, .articles').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) { el.style.setProperty('--d', (i * 110) + 'ms'); });
  });

  var revealEls = document.querySelectorAll('.reveal, .lines, .route');
  if (REDUCED || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ----------------------------------------------------------------- counters */
  function runCount(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
    var finalStr = to.toFixed(dec), len = finalStr.length;
    var t0 = performance.now(), dur = 2000;
    function tick(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      var s = (to * e).toFixed(dec);
      while (s.length < len) s = '0' + s;
      el.textContent = p < 1 ? s : finalStr;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var countEls = document.querySelectorAll('[data-count]');
  if (!REDUCED && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); countIO.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { countIO.observe(el); });
  }

  /* ------------------------------------------------------------------- clocks */
  var timeFmt = {};
  // Morocco keeps GMT+1 outside Ramadan; pin it so every browser shows the same official offset
  function zone(tz) { return tz === 'Africa/Casablanca' ? 'Etc/GMT-1' : tz; }
  function localTime(tz) {
    tz = zone(tz);
    try {
      if (!timeFmt[tz]) timeFmt[tz] = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
      return timeFmt[tz].format(new Date());
    } catch (e) { return '--:--'; }
  }
  function tzAbbr(tz, fixed) {
    if (fixed) return fixed;
    if (tz === 'Africa/Casablanca') return 'GMT+1';
    try {
      var part = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'shortOffset' })
        .formatToParts(new Date()).filter(function (p) { return p.type === 'timeZoneName'; })[0];
      var v = part ? part.value : '';
      if (tz === 'Africa/Cairo') return v === 'GMT+3' ? 'EEST' : 'EET';
      return v === 'GMT' || v === 'UTC' ? 'GMT' : v;
    } catch (e) { return ''; }
  }
  var clockEls = document.querySelectorAll('[data-tz]');
  function updateClocks() {
    clockEls.forEach(function (el) { el.querySelector('time').textContent = localTime(el.dataset.tz); });
    document.querySelectorAll('[data-tz-live]').forEach(function (el) { el.textContent = localTime(el.getAttribute('data-tz-live')); });
  }
  updateClocks();
  setInterval(updateClocks, 15000);

  /* ====================================================================== MAP */
  var GOLD = '214,179,106', INK = '237,237,237', GREY = '138,144,153';
  var EXTRA = { Rabat: [-6.8498, 33.9716], Pretoria: [28.1881, -25.7461] };
  var CAPS = [['Rabat', 'l'], ['Cairo', 'r'], ['Dakar', 'r'], ['Abuja', 'r'], ['Accra', 'l'], ['Addis Ababa', 'r'],
    ['Nairobi', 'r'], ['Kigali', 't'], ['Kinshasa', 'r'], ['Luanda', 'r'], ['Pretoria', 'r']];
var CAP_ABBR = { Rabat: null, Cairo: null, Dakar: 'GMT', Abuja: 'WAT', Accra: 'GMT', 'Addis Ababa': 'EAT', Nairobi: 'EAT', Kigali: 'CAT', Kinshasa: 'WAT', Luanda: 'WAT', Pretoria: 'SAST' };
  var CAP_TZ = { Rabat: 'Africa/Casablanca', Cairo: 'Africa/Cairo', Dakar: 'Africa/Dakar', Abuja: 'Africa/Lagos', Accra: 'Africa/Accra',
    'Addis Ababa': 'Africa/Addis_Ababa', Nairobi: 'Africa/Nairobi', Kigali: 'Africa/Kigali', Kinshasa: 'Africa/Kinshasa', Luanda: 'Africa/Luanda', Pretoria: 'Africa/Johannesburg' };
  var ARCS = [['Dakar', 'New York'], ['Accra', 'Washington'], ['Lagos', 'London'], ['Abuja', 'Brussels'],
    ['Nairobi', 'Dubai'], ['Addis Ababa', 'Beijing']];
  var ARC_SIDE = { London: 'l', Brussels: 'r', Dubai: 't' };
  var CORR = [['Casablanca', 'Cairo'], ['Casablanca', 'Accra'], ['Accra', 'Lagos'], ['Lagos', 'Abuja'], ['Abuja', 'Cairo'],
    ['Cairo', 'Addis Ababa'], ['Addis Ababa', 'Nairobi'], ['Nairobi', 'Kigali'], ['Kigali', 'Johannesburg'], ['Abuja', 'Nairobi']];
  var CORR_NODES = [['Casablanca', 'l'], ['Cairo', 'r'], ['Accra', 'l'], ['Lagos', 'r'], ['Abuja', 'r'], ['Addis Ababa', 'r'],
    ['Nairobi', 'r'], ['Kigali', 'l'], ['Johannesburg', 'r']];
  var CONTACT_NODES = [['Lagos', 'r'], ['Nairobi', 'r'], ['Johannesburg', 'r'], ['Cairo', 'r']];
  var LIVE = [['Lagos', 'Africa/Lagos', 'WAT'], ['Nairobi', 'Africa/Nairobi', 'EAT'], ['Cairo', 'Africa/Cairo', null],
    ['Johannesburg', 'Africa/Johannesburg', 'SAST'], ['Accra', 'Africa/Accra', 'GMT'], ['Addis Ababa', 'Africa/Addis_Ababa', 'EAT'],
    ['Kigali', 'Africa/Kigali', 'CAT'], ['Casablanca', 'Africa/Casablanca', null], ['Dakar', 'Africa/Dakar', 'GMT'],
    ['Abuja', 'Africa/Lagos', 'WAT'], ['Kinshasa', 'Africa/Kinshasa', 'WAT'], ['Luanda', 'Africa/Luanda', 'WAT']];

  var STATES = {
    hero:    { view: 'africa', cross: 1, cap: 0, arcs: 0, corr: 0, all: 0, fig: 'Fig. 00', title: 'Continental view', count: 'Overview', bar: 0 },
    mandate: { view: 'africa', cross: 1, cap: 0, arcs: 0, corr: 0, all: 0, fig: 'Fig. 00', title: 'Continental view', count: 'Mandate', bar: 0 },
    gov:     { view: 'africa', cross: 0, cap: 1, arcs: 0, corr: 0, all: 0, capLabels: 1, fig: 'Fig. 01', title: 'Seats of government', count: '01 / 03', bar: 1 / 3 },
    pos:     { view: 'world', cross: 0, cap: 0, arcs: 1, corr: 0, all: 0, fig: 'Fig. 02', title: 'Global positioning', count: '02 / 03', bar: 2 / 3 },
    inv:     { view: 'africa', cross: 0, cap: 0, arcs: 0, corr: 1, all: 0, corrLabels: 1, fig: 'Fig. 03', title: 'Investment corridors', count: '03 / 03', bar: 1 },
    all:     { view: 'world', cross: 0, cap: 0.75, arcs: 1, corr: 0.7, all: 1, fig: 'Fig. 04', title: 'Reach', count: 'Summary', bar: 1 },
    heroRM:  { view: 'world', cross: 1, cap: 0.75, arcs: 1, corr: 0.7, all: 1, fig: 'Fig. 00', title: 'Continental view', count: 'Overview', bar: 0 },
    contact: { view: 'africa', cross: 0, cap: 1, arcs: 0, corr: 0, all: 0.4, fig: '', title: '', count: '', bar: 0 }
  };

  var G = null;          // shared geometry (design space, 1000 x 1000)
  var C = {};            // city name -> [lon, lat]
  var fontsReady = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function dms(v, pos, neg) {
    var a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60);
    return (d < 10 ? '0' : '') + d + '°' + (m < 10 ? '0' : '') + m + '′' + (v >= 0 ? pos : neg);
  }
  function fmtLL(ll) { return dms(ll[1], 'N', 'S') + ' ' + dms(ll[0], 'E', 'W'); }
  var kmCache = {};
  function km(a, b) {
    var key = a + '|' + b;
    if (!kmCache[key]) {
      var d = d3.geoDistance(C[a], C[b]) * 6371.0088;
      kmCache[key] = (Math.round(d / 10) * 10).toLocaleString('en-GB') + ' km';
    }
    return kmCache[key];
  }
  function fmtInt(n) { return n.toLocaleString('en-GB'); }

  /* ---------- geometry: dot grid with d3.geoContains, built once ---------- */
  function buildGeometry(geo, places) {
    var t0 = performance.now();
    Object.keys(places.africa).forEach(function (k) { C[k] = places.africa[k]; });
    Object.keys(places.global).forEach(function (k) { C[k] = places.global[k]; });
    Object.keys(EXTRA).forEach(function (k) { C[k] = EXTRA[k]; });

    var P0 = d3.geoNaturalEarth1().fitExtent([[0, 0], [1000, 1000]], geo);
    var path = d3.geoPath(P0);
    var degPx = P0([1, 0])[0] - P0([0, 0])[0];
    var STEP = degPx * 0.7;
    var feats = geo.features.map(function (f) { return { f: f, b: path.bounds(f) }; });
    var B = path.bounds(geo);
    var xs = [], ys = [], gi = [], gj = [], lat = [], isl = [];
    var hit = new Array(feats.length);
    var i0 = Math.floor(B[0][0] / STEP), i1 = Math.ceil(B[1][0] / STEP);
    var j0 = Math.floor(B[0][1] / STEP), j1 = Math.ceil(B[1][1] / STEP);
    for (var j = j0; j <= j1; j++) {
      var y = j * STEP;
      for (var i = i0; i <= i1; i++) {
        var x = i * STEP, ll = null;
        for (var k = 0; k < feats.length; k++) {
          var b = feats[k].b;
          if (x < b[0][0] || x > b[1][0] || y < b[0][1] || y > b[1][1]) continue;
          if (!ll) ll = P0.invert([x, y]);
          if (ll && d3.geoContains(feats[k].f, ll)) {
            if (ll[1] > -40) { xs.push(x); ys.push(y); gi.push(i); gj.push(j); lat.push(ll[1]); isl.push(0); }
            hit[k] = true;
            break;
          }
        }
      }
    }
    // small island states that fall between grid points still get one dot
    feats.forEach(function (F, k) {
      if (hit[k]) return;
      var p = P0(d3.geoCentroid(F.f));
      xs.push(p[0]); ys.push(p[1]); gi.push(0); gj.push(0); lat.push(0); isl.push(1);
    });

    var n = xs.length;
    var g = {
      P0: P0, STEP: STEP, n: n, degPx: degPx,
      x: Float32Array.from(xs), y: Float32Array.from(ys),
      gi: Int16Array.from(gi), gj: Int16Array.from(gj), isl: Uint8Array.from(isl),
      dCap: new Float32Array(n), dCorr: new Float32Array(n), cIdx: new Uint8Array(n), cT: new Float32Array(n),
      ox: new Float32Array(n), oy: new Float32Array(n), delay: new Float32Array(n)
    };

    // continental bounding boxes (design units)
    var ax0 = 1e9, ay0 = 1e9, ax1 = -1e9, ay1 = -1e9;
    for (var q = 0; q < n; q++) {
      if (g.isl[q]) continue;
      if (g.x[q] < ax0) ax0 = g.x[q]; if (g.x[q] > ax1) ax1 = g.x[q];
      if (g.y[q] < ay0) ay0 = g.y[q]; if (g.y[q] > ay1) ay1 = g.y[q];
    }
    var pad = STEP;
    g.box = { africa: [ax0 - pad, ay0 - pad, ax1 + pad, ay1 + pad] };
    var wpts = [[-36, 22], [-0.13, 56], [4.35, 56], [64, 26], [64, 40]].map(function (p) { return P0(p); });
    var wb = g.box.africa.slice();
    wpts.forEach(function (p) { wb[0] = Math.min(wb[0], p[0]); wb[1] = Math.min(wb[1], p[1]); wb[2] = Math.max(wb[2], p[0]); wb[3] = Math.max(wb[3], p[1]); });
    g.box.world = wb;

    // assembly: dots gather inward, a wave runs north to south
    var cx = (ax0 + ax1) / 2, cy = (ay0 + ay1) / 2, hgt = ay1 - ay0;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (q = 0; q < n; q++) {
      var dx = g.x[q] - cx, dy = g.y[q] - cy, r = Math.sqrt(dx * dx + dy * dy) || 1;
      var push = 0.07 + rnd() * 0.09, ang = (rnd() - 0.5) * 0.7;
      var ux = dx / r, uy = dy / r, ca = Math.cos(ang), sa = Math.sin(ang);
      g.ox[q] = (ux * ca - uy * sa) * r * push;
      g.oy[q] = (ux * sa + uy * ca) * r * push;
      g.delay[q] = ((g.y[q] - ay0) / hgt) * 1.15 + rnd() * 0.45;
    }

    // great-circle polylines in design space
    function gc(a, b, steps) {
      var ip = d3.geoInterpolate(a, b), pts = [], cum = [0], L = 0;
      for (var s = 0; s <= steps; s++) {
        var p = P0(ip(s / steps));
        if (s > 0) { var pp = pts[s - 1]; L += Math.hypot(p[0] - pp[0], p[1] - pp[1]); cum.push(L); }
        pts.push(p);
      }
      return { pts: pts, cum: cum, len: L };
    }
    g.corr = CORR.map(function (c) { return gc(C[c[0]], C[c[1]], 48); });
    g.arcs = ARCS.map(function (a) { return gc(C[a[0]], C[a[1]], 180); });
    g.city = {};
    Object.keys(C).forEach(function (k) { g.city[k] = P0(C[k]); });

    // per-dot distances to capitals and corridors
    var caps = CAPS.map(function (c) { return g.city[c[0]]; });
    var segs = [];
    g.corr.forEach(function (cr, ci) {
      for (var s = 1; s < cr.pts.length; s++) {
        segs.push([cr.pts[s - 1][0], cr.pts[s - 1][1], cr.pts[s][0], cr.pts[s][1], ci, cr.cum[s - 1] / cr.len, cr.cum[s] / cr.len]);
      }
    });
    for (q = 0; q < n; q++) {
      var px = g.x[q], py = g.y[q], best = 1e9;
      for (var c = 0; c < caps.length; c++) {
        var d = Math.hypot(px - caps[c][0], py - caps[c][1]);
        if (d < best) best = d;
      }
      g.dCap[q] = best;
      var bd = 1e9, bi = 0, bt = 0;
      for (var s2 = 0; s2 < segs.length; s2++) {
        var S = segs[s2], vx = S[2] - S[0], vy = S[3] - S[1], wx = px - S[0], wy = py - S[1];
        var u = clamp((wx * vx + wy * vy) / (vx * vx + vy * vy), 0, 1);
        var ex = wx - u * vx, ey = wy - u * vy, dd = ex * ex + ey * ey;
        if (dd < bd) { bd = dd; bi = S[4]; bt = S[5] + (S[6] - S[5]) * u; }
      }
      g.dCorr[q] = Math.sqrt(bd); g.cIdx[q] = bi; g.cT[q] = bt;
    }
    g.ms = Math.round(performance.now() - t0);
    doc.setAttribute('data-grid-ms', g.ms);
    doc.setAttribute('data-grid-n', n);
    return g;
  }

  /* glow sprite */
  var glow = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(240,210,140,1)'); gr.addColorStop(0.25, 'rgba(214,179,106,.45)'); gr.addColorStop(1, 'rgba(214,179,106,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    return c;
  })();

  /* light travelling along a corridor: returns 0..1 brightness at fraction t */
  var SPEED = 120; // design units per second
  function lightPos(ci, time) {
    var cr = G.corr[ci], dur = cr.len / SPEED, cyc = dur + 1.6;
    var u = ((time + ci * 0.73) % cyc) / dur;
    return u;
  }

  /* ------------------------------------------------------------ MapView class */
  function MapView(canvas, opt) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.opt = opt || {};
    this.state = this.opt.state || 'hero';
    this.amt = { cross: 0, cap: 0, arcs: 0, corr: 0, all: 0, capL: 0, corrL: 0 };
    this.tgt = Object.assign({}, this.amt);
    this.arcP = 0;
    this.visible = false;
    this.started = performance.now();
    this.assembling = !!this.opt.assemble && !REDUCED;
    this.crossIdx = 0; this.crossFrom = null; this.crossT0 = 0;
    this.last = 0;
    this.W = 0; this.H = 0;
    this.caps = (this.opt.caps || CAPS).map(function (c) { return c; });
    this.dCap = G.dCap;
    if (this.opt.caps) {
      var list = this.caps.map(function (c) { return G.city[c[0]]; }), arr = new Float32Array(G.n);
      for (var q = 0; q < G.n; q++) {
        var b = 1e9;
        for (var k = 0; k < list.length; k++) { var d = Math.hypot(G.x[q] - list[k][0], G.y[q] - list[k][1]); if (d < b) b = d; }
        arr[q] = b;
      }
      this.dCap = arr;
    }
    this.sx = new Float32Array(G.n); this.sy = new Float32Array(G.n);
    this.al = new Float32Array(G.n); this.lit = new Float32Array(G.n);
    this.setState(this.state, !!this.opt.hold);
  }

  MapView.prototype.setState = function (name, hold) {
    this.state = name;
    var s = STATES[name];
    var t = this.tgt;
    t.cross = hold ? 0 : s.cross; t.cap = hold ? 0 : s.cap; t.arcs = hold ? 0 : s.arcs; t.corr = hold ? 0 : s.corr; t.all = hold ? 0 : s.all;
    t.capL = hold ? 0 : (s.capLabels ? 1 : 0); t.corrL = hold ? 0 : (s.corrLabels ? 1 : 0);
    this.viewName = s.view;
    if (this.views) this.viewTgt = this.views[this.viewName];
    if (REDUCED || this.opt.still) { this.snap(); }
  };

  MapView.prototype.snap = function () {
    var a = this.amt, t = this.tgt;
    Object.keys(t).forEach(function (k) { a[k] = t[k]; });
    this.arcP = t.arcs > 0 ? 1.5 : 0;
    this.assembling = false;
    if (this.views) this.view = Object.assign({}, this.views[this.viewName]);
  };

  MapView.prototype.pads = function (name) {
    var W = this.W, H = this.H, o = this.opt;
    if (o.pinned || o.panel) {
      var top = o.top || 84;
      return name === 'world'
        ? { t: top + 24, r: 40, b: 64, l: 40 }
        : { t: top + 32, r: Math.max(48, W * 0.07), b: 72, l: Math.max(56, W * 0.08) };
    }
    var m = Math.round(Math.min(W, H) * 0.045);
    return name === 'world' ? { t: m, r: m, b: m, l: m } : { t: m, r: m, b: m, l: m };
  };

  MapView.prototype.fit = function (name) {
    var box = G.box[name], p = this.pads(name);
    var aw = this.W - p.l - p.r, ah = this.H - p.t - p.b;
    var bw = box[2] - box[0], bh = box[3] - box[1];
    var s = Math.min(aw / bw, ah / bh);
    return { s: s, tx: p.l + (aw - s * bw) / 2 - s * box[0], ty: p.t + (ah - s * bh) / 2 - s * box[1] };
  };

  MapView.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { this.W = 0; return false; }
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = r.width; this.H = r.height;
    this.c.width = Math.round(r.width * this.dpr); this.c.height = Math.round(r.height * this.dpr);
    this.views = { africa: this.fit('africa'), world: this.fit('world') };
    this.viewTgt = this.views[this.viewName];
    if (!this.view || REDUCED || this.opt.still) this.view = Object.assign({}, this.viewTgt);
    this.sub = this.views.africa.s * G.STEP < 4.4 ? 2 : 1;
    this.small = this.W < 560;
    this.frame0 = (this.opt.pinned || this.opt.panel) ? { l: 10, t: this.opt.top || 84, r: this.W - 10, b: this.H - 10 } : { l: 4, t: 4, r: this.W - 4, b: this.H - 4 };
    if (this.opt.onResize) this.opt.onResize(this);
    return true;
  };

  MapView.prototype.toS = function (p) {
    var v = this.view; return [v.s * p[0] + v.tx, v.s * p[1] + v.ty];
  };

  MapView.prototype.update = function (now) {
    var dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0.016;
    this.last = now;
    if (REDUCED || this.opt.still) return;
    var a = this.amt, t = this.tgt, k = 1 - Math.exp(-dt / 0.42);
    Object.keys(t).forEach(function (key) { a[key] += (t[key] - a[key]) * k; });
    var v = this.view, vt = this.viewTgt, kv = 1 - Math.exp(-dt / 0.5);
    if (v && vt) { v.s += (vt.s - v.s) * kv; v.tx += (vt.tx - v.tx) * kv; v.ty += (vt.ty - v.ty) * kv; }
    if (t.arcs > 0.01) this.arcP = Math.min(1.5, this.arcP + dt / 2.1);
    else if (a.arcs < 0.02) this.arcP = 0;
  };

  /* crosshair: glides between cities, synchronised with the readout */
  MapView.prototype.crossPoint = function (now) {
    var idx = liveIdx, to = G.city[LIVE[idx][0]];
    if (this.crossIdx !== idx || !this.crossFrom) {
      this.crossFrom = this.crossCur || to; this.crossIdx = idx; this.crossT0 = now;
    }
    var p = REDUCED ? 1 : easeInOut(clamp((now - this.crossT0) / 1300, 0, 1));
    this.crossArrive = p;
    var f = this.crossFrom;
    this.crossCur = [f[0] + (to[0] - f[0]) * p, f[1] + (to[1] - f[1]) * p];
    return this.crossCur;
  };

  MapView.prototype.frame = function (now) {
    if (!this.W) return;
    this.update(now);
    var ctx = this.ctx, dpr = this.dpr, W = this.W, H = this.H;
    var v = this.view, s = v.s, tx = v.tx, ty = v.ty;
    var a = this.amt, time = (REDUCED || this.opt.still) ? 2.2 : now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var n = G.n, sub = this.sub;
    var spacing = s * G.STEP * sub;
    var r = clamp(spacing * 0.22, 0.7, 1.8);
    var aT = this.assembling ? (now - this.started) / 1000 : 99;
    if (aT > 3) this.assembling = false;
    var cp = a.cross > 0.01 ? this.crossPoint(now) : null;
    // the instrument boots: the reticle only locks on once most of the continent has assembled
    this.crossK = this.assembling ? clamp((aT - 1.9) / 0.7, 0, 1) : 1;
    if (this.crossK <= 0) cp = null;
    var Rc = 95, Rk = 30, Rr = 14;
    var base = 0.44 + a.all * 0.1;
    var sx = this.sx, sy = this.sy, al = this.al, lit = this.lit;
    var dCap = this.dCap;
    var lp = null;
    if (a.corr > 0.01) { lp = []; for (var ci = 0; ci < G.corr.length; ci++) lp.push(lightPos(ci, time)); }
    var still = REDUCED || this.opt.still;

    for (var i = 0; i < n; i++) {
      if (sub === 2 && !G.isl[i] && ((G.gi[i] & 1) || (G.gj[i] & 1))) { al[i] = 0; continue; }
      var L = 0, d;
      if (cp) {
        var ddx = G.x[i] - cp[0], ddy = G.y[i] - cp[1], d2 = ddx * ddx + ddy * ddy;
        if (d2 < Rc * Rc) { d = 1 - Math.sqrt(d2) / Rc; L = a.cross * d * d * 0.9; }
      }
      if (a.cap > 0.01 && dCap[i] < Rk) { d = 1 - dCap[i] / Rk; d = a.cap * d * d; if (d > L) L = d; }
      if (lp && G.dCorr[i] < Rr) {
        d = 1 - G.dCorr[i] / Rr;
        var u = lp[G.cIdx[i]], dist = G.cT[i] - u, pulse;
        pulse = still ? 0.55 : (dist <= 0 && dist > -0.22 ? 1 + dist / 0.22 : (dist > 0 && dist < 0.03 ? 1 - dist / 0.03 : 0));
        d = a.corr * d * (0.34 + 0.66 * pulse);
        if (d > L) L = d;
      }
      var A = base + (1 - base) * L;
      var X = s * G.x[i] + tx, Y = s * G.y[i] + ty;
      if (this.assembling) {
        var p = (aT - G.delay[i]) / 0.95;
        if (p <= 0) { al[i] = 0; continue; }
        if (p < 1) {
          var e = easeOut(p);
          X += G.ox[i] * s * (1 - e); Y += G.oy[i] * s * (1 - e);
          A = A * e + Math.sin(Math.PI * p) * 0.75;
        }
      }
      sx[i] = X; sy[i] = Y; al[i] = A; lit[i] = L;
    }

    // dots, bucketed by alpha
    var NB = 18, rect = r * dpr < 1.6;
    for (var b = 1; b <= NB; b++) {
      var lo = (b - 1) / NB, hi = b / NB, any = false;
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        var av = al[i];
        if (av <= lo || av > hi) continue;
        any = true;
        if (rect) ctx.rect(sx[i] - r, sy[i] - r, r * 2, r * 2);
        else { ctx.moveTo(sx[i] + r, sy[i]); ctx.arc(sx[i], sy[i], r, 0, 6.2832); }
      }
      if (any) { ctx.fillStyle = 'rgba(' + GOLD + ',' + hi.toFixed(3) + ')'; ctx.fill(); }
    }
    // glow on lit dots
    ctx.globalCompositeOperation = 'lighter';
    var gs = Math.max(5, spacing * 1.25);
    for (i = 0; i < n; i++) {
      if (lit[i] > 0.3 && al[i] > 0) {
        ctx.globalAlpha = Math.min(1, (lit[i] - 0.3) * 0.5);
        ctx.drawImage(glow, sx[i] - gs, sy[i] - gs, gs * 2, gs * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (a.corr > 0.01) this.drawCorridors(time, still);
    if (a.cap > 0.01) this.drawCaps(time, still);
    if (a.arcs > 0.01) this.drawArcs(time, still);
    if (cp) this.drawCross(cp);
  };

  /* ---- labels: mono tags on a dark backing so they read over dots ---- */
  MapView.prototype.tagBox = function (x, y, name, sub, side, gapPx) {
    var ctx = this.ctx, small = this.small;
    var fs = small ? 9 : 10.5, off = gapPx || (small ? 7 : 10);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
    ctx.font = '500 ' + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    var t1 = name.toUpperCase(), w1 = ctx.measureText(t1).width, w2 = 0;
    if (sub && !small) { ctx.font = '400 ' + (fs - 1) + 'px "IBM Plex Mono", ui-monospace, monospace'; w2 = ctx.measureText(sub).width; }
    var w = Math.max(w1, w2), h = (sub && !small) ? fs * 2.45 : fs * 1.25, bx, by;
    if (side === 'r') { bx = x + off; by = y - h / 2; }
    else if (side === 'l') { bx = x - off - w; by = y - h / 2; }
    else if (side === 'b') { bx = x - w / 2; by = y + off; }
    else { bx = x - w / 2; by = y - off - h; }
    bx = clamp(bx, 6, this.W - w - 6);
    return { x: bx, y: by, w: w, h: h, w1: w1, w2: w2, t1: t1, fs: fs };
  };

  MapView.prototype.tag = function (x, y, name, sub, side, alpha, gapPx) {
    if (alpha < 0.02) return;
    var ctx = this.ctx, small = this.small;
    var B = this.tagBox(x, y, name, sub, side, gapPx);
    var fs = B.fs, t1 = B.t1, w1 = B.w1, w2 = B.w2, w = B.w, h = B.h, bx = B.x, by = B.y;
    ctx.fillStyle = 'rgba(7,8,10,' + (0.8 * alpha) + ')';
    ctx.fillRect(bx - 5, by - 3, w + 10, h + 6);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(' + INK + ',' + (0.96 * alpha) + ')';
    ctx.font = '500 ' + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    var ax = side === 'l' ? bx + w - w1 : (side === 'r' ? bx : bx + (w - w1) / 2);
    ctx.fillText(t1, ax, by);
    if (sub && !small) {
      ctx.fillStyle = 'rgba(' + GREY + ',' + alpha + ')';
      ctx.font = '400 ' + (fs - 1) + 'px "IBM Plex Mono", ui-monospace, monospace';
      var ax2 = side === 'l' ? bx + w - w2 : (side === 'r' ? bx : bx + (w - w2) / 2);
      ctx.fillText(sub, ax2, by + fs * 1.35);
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  };

  MapView.prototype.ring = function (x, y, rad, alpha, width) {
    var ctx = this.ctx;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832);
    ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha + ')'; ctx.lineWidth = width || 1; ctx.stroke();
  };
  MapView.prototype.node = function (x, y, rad, alpha) {
    var ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha * 0.9;
    ctx.drawImage(glow, x - rad * 5, y - rad * 5, rad * 10, rad * 10);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832);
    ctx.fillStyle = 'rgba(245,226,180,' + alpha + ')'; ctx.fill();
  };

  MapView.prototype.drawCaps = function (time, still) {
    var a = this.amt, small = this.small, self = this;
    var labels = a.capL;
    this.caps.forEach(function (c, i) {
      var p = self.toS(G.city[c[0]]);
      var k = clamp(a.cap * 1.6 - i * 0.05, 0, 1);
      if (k <= 0) return;
      self.node(p[0], p[1], small ? 1.6 : 2.1, k);
      self.ring(p[0], p[1], small ? 4.5 : 6, 0.55 * k, 1);
      var ph = still ? 0.45 : ((time / 2.6 + i * 0.137) % 1);
      self.ring(p[0], p[1], (small ? 4.5 : 6) + ph * (small ? 12 : 20), (1 - ph) * 0.55 * k, 1);
      if (labels > 0.02) self.tag(p[0], p[1], c[0], fmtLL(C[c[0]]), c[1], k * labels);
    });
  };

  MapView.prototype.drawCross = function (cp) {
    var ctx = this.ctx, a = this.amt.cross * (this.crossK == null ? 1 : this.crossK), p = this.toS(cp), X = Math.round(p[0]) + 0.5, Y = Math.round(p[1]) + 0.5;
    var F = this.frame0, g = 16;
    ctx.strokeStyle = 'rgba(' + INK + ',' + (0.13 * a) + ')'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(F.l, Y); ctx.lineTo(X - g, Y); ctx.moveTo(X + g, Y); ctx.lineTo(F.r, Y);
    ctx.moveTo(X, F.t + ((this.opt.pinned || this.opt.panel) ? 44 : 0)); ctx.lineTo(X, Y - g); ctx.moveTo(X, Y + g); ctx.lineTo(X, F.b);
    ctx.stroke();
    // reticle: four corner brackets
    var h = 9, l = 4;
    ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.95 * a) + ')'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
      var cx = X + q[0] * h, cy = Y + q[1] * h;
      ctx.moveTo(cx, cy - q[1] * l); ctx.lineTo(cx, cy); ctx.lineTo(cx - q[0] * l, cy);
    });
    ctx.stroke();
    this.node(X, Y, 1.8, a);
    if (this.crossArrive >= 1 && !this.pingT) this.pingT = performance.now();
    if (this.crossArrive < 1) this.pingT = 0;
    if (this.pingT && !REDUCED) {
      var pk = (performance.now() - this.pingT) / 1400;
      if (pk < 1) this.ring(X, Y, 6 + easeOut(pk) * 34, (1 - pk) * 0.7 * a, 1);
    }
    var name = LIVE[liveIdx][0];
    this.tag(X, Y, name, fmtLL(C[name]), 'r', a * clamp((this.crossArrive - 0.55) / 0.45, 0, 1), 18);
  };

  MapView.prototype.polyS = function (geom) {
    var out = new Array(geom.pts.length);
    for (var i = 0; i < geom.pts.length; i++) out[i] = this.toS(geom.pts[i]);
    return out;
  };

  MapView.prototype.drawCorridors = function (time, still) {
    var ctx = this.ctx, a = this.amt.corr, self = this;
    G.corr.forEach(function (cr, ci) {
      var pts = self.polyS(cr);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.5 * a) + ')'; ctx.lineWidth = 1; ctx.stroke();
      if (still) return;
      var u = lightPos(ci, time);
      if (u < 0 || u > 1.03) return;
      // tail
      var tail = 0.22, segs = 10;
      for (var k = 0; k < segs; k++) {
        var u0 = clamp(u - tail + tail * k / segs, 0, 1), u1 = clamp(u - tail + tail * (k + 1) / segs, 0, 1);
        if (u1 <= u0) continue;
        var p0 = self.toS(pointAt(cr, u0)), p1 = self.toS(pointAt(cr, u1));
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = 'rgba(245,226,180,' + (a * 0.9 * (k + 1) / segs) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      if (u <= 1) { var h = self.toS(pointAt(cr, u)); self.node(h[0], h[1], 1.5, a); }
    });
    var labels = this.amt.corrL;
    CORR_NODES.forEach(function (c) {
      var p = self.toS(G.city[c[0]]);
      self.node(p[0], p[1], self.small ? 1.6 : 2, a);
      self.ring(p[0], p[1], self.small ? 4 : 5, 0.5 * a, 1);
      if (labels > 0.02) self.tag(p[0], p[1], c[0], null, c[1], labels * a);
    });
  };

  function pointAt(cr, u) {
    var L = cr.len * u, cum = cr.cum, lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] < L) lo = mid; else hi = mid; }
    var seg = cum[hi] - cum[lo] || 1, f = (L - cum[lo]) / seg, A = cr.pts[lo], B = cr.pts[hi];
    return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f];
  }

  MapView.prototype.drawArcs = function (time, still) {
    var ctx = this.ctx, a = this.amt.arcs, self = this, F = this.frame0;
    var edgeTags = [], inTags = [];
    this.edgeRects = [];
    G.arcs.forEach(function (arc, k) {
      var pts = self.polyS(arc);
      // visible part: until the arc leaves the frame
      var exit = pts.length - 1, out = false;
      for (var i = 1; i < pts.length; i++) {
        var q = pts[i];
        if (q[0] < F.l || q[0] > F.r || q[1] < F.t || q[1] > F.b) { exit = i; out = true; break; }
      }
      var vis = [], Lv = 0;
      for (i = 0; i <= exit; i++) {
        var pt = pts[i];
        if (i === exit && out) {
          var pr = pts[i - 1], tt = 1;
          if (pt[0] < F.l) tt = Math.min(tt, (F.l - pr[0]) / (pt[0] - pr[0]));
          if (pt[0] > F.r) tt = Math.min(tt, (F.r - pr[0]) / (pt[0] - pr[0]));
          if (pt[1] < F.t) tt = Math.min(tt, (F.t - pr[1]) / (pt[1] - pr[1]));
          if (pt[1] > F.b) tt = Math.min(tt, (F.b - pr[1]) / (pt[1] - pr[1]));
          pt = [pr[0] + (pt[0] - pr[0]) * tt, pr[1] + (pt[1] - pr[1]) * tt];
        }
        if (i > 0) Lv += Math.hypot(pt[0] - vis[i - 1][0], pt[1] - vis[i - 1][1]);
        vis.push(pt);
      }
      var pk = easeInOut(clamp((self.arcP - k * 0.12) / 0.8, 0, 1));
      if (pk <= 0) return;
      var target = Lv * pk, acc = 0, head = vis[0];
      ctx.beginPath(); ctx.moveTo(vis[0][0], vis[0][1]);
      for (i = 1; i < vis.length; i++) {
        var sl = Math.hypot(vis[i][0] - vis[i - 1][0], vis[i][1] - vis[i - 1][1]);
        if (acc + sl >= target) {
          var f = (target - acc) / (sl || 1);
          head = [vis[i - 1][0] + (vis[i][0] - vis[i - 1][0]) * f, vis[i - 1][1] + (vis[i][1] - vis[i - 1][1]) * f];
          ctx.lineTo(head[0], head[1]); break;
        }
        acc += sl; ctx.lineTo(vis[i][0], vis[i][1]); head = vis[i];
      }
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.1 * a) + ')'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.85 * a) + ')'; ctx.lineWidth = 1.1; ctx.stroke();
      // origin
      var o = vis[0];
      self.node(o[0], o[1], self.small ? 1.6 : 2, a);
      self.ring(o[0], o[1], self.small ? 4 : 5, 0.5 * a, 1);
      if (pk < 1) { self.node(head[0], head[1], 1.8, a); return; }
      // signal travelling outward once drawn
      if (!still) {
        var u = ((time / 3.4) + k * 0.19) % 1;
        var sp = pointOnPoly(vis, Lv * u);
        ctx.globalAlpha = a * Math.sin(Math.PI * u);
        self.node(sp[0], sp[1], 1.4, 1);
        ctx.globalAlpha = 1;
      }
      var name = ARCS[k][1], dist = km(ARCS[k][0], name).toUpperCase();
      var end = vis[vis.length - 1];
      if (!out) {
        self.node(end[0], end[1], self.small ? 1.6 : 2.2, a);
        self.ring(end[0], end[1], self.small ? 4 : 6, 0.6 * a, 1);
        inTags.push({ x: end[0], y: end[1], name: name, sub: self.small ? null : dist, side: ARC_SIDE[name] || 'r' });
      } else {
        var side = end[0] <= F.l + 1 ? 'left' : end[0] >= F.r - 1 ? 'right' : 'top';
        edgeTags.push({ x: end[0], y: end[1], side: side, name: name, dist: dist });
      }
    });
    // edge labels for cities beyond the frame, de-collided
    ['left', 'right', 'top'].forEach(function (side) {
      var list = edgeTags.filter(function (t) { return t.side === side; });
      if (side === 'top') list.sort(function (p, q) { return p.x - q.x; });
      else list.sort(function (p, q) { return p.y - q.y; });
      for (var i = 1; i < list.length; i++) {
        if (side === 'top') { if (list[i].x - list[i - 1].x < 120) list[i].x = list[i - 1].x + 120; }
        else if (list[i].y - list[i - 1].y < 40) list[i].y = list[i - 1].y + 40;
      }
      list.forEach(function (t) { self.edgeTag(t, a); });
    });
    // in-frame labels pick the first side that stays clear of the edge labels
    inTags.forEach(function (t) {
      var sides = [t.side, 'l', 'b', 'r', 't'], pick = t.side;
      for (var i = 0; i < sides.length; i++) {
        var B = self.tagBox(t.x, t.y, t.name, t.sub, sides[i]);
        var hit = self.edgeRects.some(function (R) { return B.x - 5 < R.x + R.w && B.x + B.w + 5 > R.x && B.y - 3 < R.y + R.h && B.y + B.h + 3 > R.y; });
        if (!hit && B.y > F.t) { pick = sides[i]; break; }
      }
      self.tag(t.x, t.y, t.name, t.sub, pick, a);
    });
  };

  function pointOnPoly(pts, L) {
    var acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + sl >= L) { var f = (L - acc) / (sl || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; }
      acc += sl;
    }
    return pts[pts.length - 1];
  }

  MapView.prototype.edgeTag = function (t, alpha) {
    var ctx = this.ctx, F = this.frame0, small = this.small;
    var fs = small ? 9 : 10.5;
    var arrow = t.side === 'left' ? '← ' : t.side === 'right' ? '' : '↑ ';
    var tail = t.side === 'right' ? ' →' : '';
    var l1 = arrow + t.name.toUpperCase() + tail, l2 = t.dist;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
    ctx.font = '500 ' + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    var w1 = ctx.measureText(l1).width;
    ctx.font = '400 ' + (fs - 1) + 'px "IBM Plex Mono", ui-monospace, monospace';
    var w2 = small ? 0 : ctx.measureText(l2).width;
    var w = Math.max(w1, w2), h = small ? fs * 1.25 : fs * 2.45, bx, by;
    if (t.side === 'left') { bx = F.l + 8; by = t.y - h / 2; }
    else if (t.side === 'right') { bx = F.r - 8 - w; by = t.y - h / 2; }
    else { bx = clamp(t.x - w / 2, F.l + 8, F.r - 8 - w); by = F.t + 8; }
    by = clamp(by, F.t + 4, F.b - h - 4);
    if (this.edgeRects) this.edgeRects.push({ x: bx - 5, y: by - 3, w: w + 10, h: h + 6 });
    // tick on the frame edge
    ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.9 * alpha) + ')'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (t.side === 'left') { ctx.moveTo(F.l, t.y); ctx.lineTo(F.l + 5, t.y); }
    else if (t.side === 'right') { ctx.moveTo(F.r, t.y); ctx.lineTo(F.r - 5, t.y); }
    else { ctx.moveTo(t.x, F.t); ctx.lineTo(t.x, F.t + 5); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(7,8,10,' + (0.82 * alpha) + ')';
    ctx.fillRect(bx - 5, by - 3, w + 10, h + 6);
    ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.35 * alpha) + ')'; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(bx - 5) + 0.5, Math.round(by - 3) + 0.5, Math.round(w + 10), Math.round(h + 6));
    ctx.textBaseline = 'top';
    ctx.font = '500 ' + fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(' + INK + ',' + alpha + ')';
    ctx.fillText(l1, t.side === 'right' ? bx + w - w1 : bx, by);
    if (!small) {
      ctx.font = '400 ' + (fs - 1) + 'px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(' + GREY + ',' + alpha + ')';
      ctx.fillText(l2, t.side === 'right' ? bx + w - w2 : bx, by + fs * 1.35);
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  };

  /* ------------------------------------------------------ live readout cycle */
  var liveIdx = 0;
  var liveEls = [];
  function renderLive() {
    var L = LIVE[liveIdx], coord = fmtLL(C[L[0]]), time = localTime(L[1]) + ' ' + tzAbbr(L[1], L[2]);
    liveEls.forEach(function (root) {
      if (root.hasAttribute('data-live-line')) {
        root.textContent = coord + ' · ' + L[0].toUpperCase() + ' · ' + time;
        return;
      }
      var c = root.querySelector('[data-ro="coord"]'), n = root.querySelector('[data-ro="city"]'), t = root.querySelector('[data-ro="time"]');
      if (c) c.textContent = coord;
      if (n) n.textContent = L[0];
      if (t) t.textContent = time;
    });
  }

  function rows(list) {
    return '<dl class="ro-rows">' + list.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  }
  function readoutHTML(name) {
    if (name === 'hero' || name === 'mandate') {
      return '<p class="ro-head"><span class="ro-dot"></span>Live readout</p>' +
        '<p class="ro-big"><span data-ro="coord"></span><span data-ro="city"></span><span data-ro="time"></span></p>' +
        rows([['Grid', '0.7°'], ['Points', fmtInt(G.n)], ['Nodes', String(LIVE.length)]]);
    }
    if (name === 'gov') return '<p class="ro-head">Seats of government · local time</p>' + rows(CAPS.map(function (c) { return [c[0], '<span data-tz-live="' + CAP_TZ[c[0]] + '">' + localTime(CAP_TZ[c[0]]) + '</span> ' + tzAbbr(CAP_TZ[c[0]], CAP_ABBR[c[0]])]; }));
    if (name === 'pos') return '<p class="ro-head">Great-circle distance</p>' + rows(ARCS.map(function (c) { return [c[0] + ' → ' + c[1], km(c[0], c[1])]; }));
    if (name === 'inv') return '<p class="ro-head">Corridors</p>' + rows(CORR.map(function (c) { return [c[0] + ' — ' + c[1], km(c[0], c[1])]; }));
    if (name === 'all') return '<p class="ro-head">Summary</p>' + rows([['Capitals marked', String(CAPS.length)], ['Global links', '0' + ARCS.length], ['Corridors', String(CORR.length)], ['Grid points', fmtInt(G.n)]]);
    return '';
  }

  /* --------------------------------------------------------------- the loop */
  var views = [];
  var rafId = 0;
  function loop(now) {
    for (var i = 0; i < views.length; i++) { var v = views[i]; if (v.visible && v.W) v.frame(now); }
    updateScale();
    rafId = requestAnimationFrame(loop);
  }
  function drawAllStill() {
    var now = performance.now();
    views.forEach(function (v) { if (v.W) v.frame(now); });
  }

  var visIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target.__view;
      if (!v) return;
      v.visible = en.isIntersecting;
      if (v.visible) { v.last = 0; if (v.opt.hold && !REDUCED) { v.opt.hold = false; v.setState(v.state); } }
    });
  }, { rootMargin: '120px 0px' }) : null;

  var ro = ('ResizeObserver' in window) ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) { var v = en.target.__view; if (v) { v.resize(); if (REDUCED || v.opt.still) v.frame(performance.now()); } });
  }) : null;

  function addView(canvas, opt) {
    var v = new MapView(canvas, opt);
    canvas.__view = v;
    v.resize();
    views.push(v);
    if (visIO) visIO.observe(canvas); else v.visible = true;
    if (ro) ro.observe(canvas);
    return v;
  }
  function clearViews() {
    views.forEach(function (v) { if (visIO) visIO.unobserve(v.c); if (ro) ro.unobserve(v.c); v.c.__view = null; });
    views = [];
    liveEls = [];
  }

  /* ---------------------------------------------------- pinned story stage */
  var stage = null, stepIO = null, hud = {};
  function setupPinned() {
    var canvas = document.querySelector('.stage__canvas');
    stage = addView(canvas, { pinned: true, assemble: true, state: 'hero' });
    ['fig', 'title', 'count', 'bar', 'readout', 'scale', 'pts'].forEach(function (k) { hud[k] = document.querySelector('[data-hud="' + k + '"]'); });
    hud.pts.textContent = fmtInt(G.n) + ' points';
    liveEls.push(hud.readout);
    applyHUD('hero', true);

    var steps = document.querySelectorAll('.story .step');
    stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var st = en.target.getAttribute('data-state');
          if (st && st !== activeState) { activeState = st; previewing = null; stage.setState(st); applyHUD(st); }
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    steps.forEach(function (s) { stepIO.observe(s); });

    // mandate indices preview their chapter on the map
    document.querySelectorAll('.mandate__k').forEach(function (k) {
      function on() { if (activeState !== 'mandate') return; previewing = k.dataset.preview; stage.setState(previewing); applyHUD(previewing); }
      function off() { if (!previewing) return; previewing = null; stage.setState(activeState); applyHUD(activeState); }
      k.addEventListener('mouseenter', on); k.addEventListener('mouseleave', off);
      k.addEventListener('focus', on); k.addEventListener('blur', off);
    });
  }
  var activeState = 'hero', previewing = null, hudState = null, hudTimer = 0;
  function applyHUD(name, instant) {
    if (!hud.fig || name === hudState) return;
    hudState = name;
    var s = STATES[name];
    hud.fig.textContent = s.fig; hud.title.textContent = s.title; hud.count.textContent = s.count;
    hud.bar.style.transform = 'scaleX(' + Math.max(0.02, s.bar) + ')';
    clearTimeout(hudTimer);
    var swap = function () { hud.readout.innerHTML = readoutHTML(name); renderLive(); hud.readout.classList.remove('is-swapping'); };
    if (instant || REDUCED) swap();
    else { hud.readout.classList.add('is-swapping'); hudTimer = setTimeout(swap, 260); }
  }
  function updateScale() {
    if (!stage || !hud.scale || !stage.view) return;
    var px = stage.view.s * (G.P0([8.9932, 0])[0] - G.P0([0, 0])[0]);
    hud.scale.style.width = px.toFixed(1) + 'px';
  }

  /* --------------------------------------------- stacked maps (mobile / RM) */
  // reduced motion on desktop: each chapter gets its own full-height instrument panel
  var panelMQ = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: reduce)');
  function panelHUD(fig, st) {
    fig.querySelectorAll('.hud--panel').forEach(function (h) { h.remove(); });
    if (!panelMQ.matches) return;
    var S = STATES[st];
    fig.insertAdjacentHTML('beforeend',
      '<div class="hud hud--panel hud--tl mono" aria-hidden="true"><span class="hud__fig">' + S.fig + '</span><span class="hud__title">' + S.title + '</span></div>' +
      '<div class="hud hud--panel hud--tr mono" aria-hidden="true"><span>' + S.count + '</span><span class="hud__bar"><i style="transform:scaleX(' + Math.max(0.02, S.bar) + ')"></i></span></div>' +
      '<div class="hud hud--panel hud--br mono" aria-hidden="true"><span class="scalebar"><i data-panel-scale></i><b>1,000 km</b></span><span>Natural Earth I · 0.7° grid</span><span>' + fmtInt(G.n) + ' points</span></div>');
  }
  function panelScale(v) {
    var el = v.c.parentNode.querySelector('[data-panel-scale]');
    if (el && v.view) el.style.width = (v.view.s * (G.P0([8.9932, 0])[0] - G.P0([0, 0])[0])).toFixed(1) + 'px';
  }
  function setupStacked() {
    var panel = panelMQ.matches;
    document.querySelectorAll('.step__map').forEach(function (fig) {
      var name = fig.getAttribute('data-view');
      var canvas = fig.querySelector('canvas');
      if (!canvas) return;
      var st = name === 'hero' ? (REDUCED ? (panel ? 'heroRM' : 'all') : 'hero') : name;
      var opt = { state: st };
      if (name === 'hero') opt.assemble = true;
      else opt.hold = !REDUCED; // chapter maps animate in when first seen
      if (panel) { opt.panel = true; opt.top = name === 'hero' ? 84 : 24; opt.onResize = panelScale; }
      panelHUD(fig, st);
      addView(canvas, opt);
      var cap = fig.querySelector('[data-readout]');
      if (cap) cap.innerHTML = readoutHTML(cap.getAttribute('data-readout'));
      var was = fig.querySelector('[data-was-line]');
      if (was && !panel) { was.removeAttribute('data-was-line'); was.className = 'readout-line mono'; was.setAttribute('data-live-line', ''); }
      var line = fig.querySelector('[data-live-line]');
      if (line && panel) {
        line.removeAttribute('data-live-line'); line.className = 'readout readout--static mono'; line.setAttribute('data-was-line', '');
        line.innerHTML = readoutHTML('hero');
        liveEls.push(line);
      } else if (line) liveEls.push(line);
    });
  }

  function setupContact() {
    var fig = document.querySelector('.contact__map canvas');
    if (fig) addView(fig, { state: 'contact', caps: CONTACT_NODES });
  }

  var mode = null;
  function init() {
    var want = pinMQ.matches ? 'pinned' : 'stacked';
    if (want === mode) return;
    mode = want;
    if (stepIO) { stepIO.disconnect(); stepIO = null; }
    clearViews(); stage = null; hudState = null;
    doc.setAttribute('data-map', mode);
    if (mode === 'pinned') setupPinned(); else setupStacked();
    setupContact();
    renderLive();
    if (REDUCED) drawAllStill();
  }

  function start(geo, places) {
    G = buildGeometry(geo, places);
    init();
    pinMQ.addEventListener('change', function () { init(); if (REDUCED) drawAllStill(); });
    panelMQ.addEventListener('change', function () { mode = null; init(); });
    // live readout: advance every 3.6 s, refresh the time each minute
    renderLive();
    if (!REDUCED) {
      setInterval(function () { liveIdx = (liveIdx + 1) % LIVE.length; renderLive(); }, 3600);
      rafId = requestAnimationFrame(loop);
    } else {
      setInterval(renderLive, 30000);
      updateScale();
    }
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('500 11px "IBM Plex Mono"'), document.fonts.load('400 10px "IBM Plex Mono"')])
        .then(function () { fontsReady = true; if (REDUCED) drawAllStill(); });
    }
  }

  if (typeof d3 === 'undefined') { doc.classList.add('no-map'); return; }
  Promise.all([
    fetch('assets/africa-countries.geo.json').then(function (r) { return r.json(); }),
    fetch('assets/places.json').then(function (r) { return r.json(); })
  ]).then(function (res) { start(res[0], res[1]); })
    .catch(function (err) { doc.classList.add('no-map'); if (window.console) console.warn('Map unavailable', err); });
})();
