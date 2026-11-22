/* Silver Fox Horizons / Direction 01: Golden Hour */
(function () {
  'use strict';
  window.__sfh = true;

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduced;

  initHeader();
  initMenu();
  initNavSpy();
  initMap();

  if (!animate) {
    root.classList.remove('motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: 'expo.out' });

  heroIntro();
  var fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]);
  fontsReady.then(function () {
    heroTitle();
    sectionReveals();
    ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------------ */
  /* Header: solid background once the hero starts to scroll away        */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-solid', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu: dialog with focus trap, Escape to close                 */
  /* ------------------------------------------------------------------ */
  function initMenu() {
    var openBtn = document.querySelector('[data-menu-open]');
    var menu = document.querySelector('[data-menu]');
    if (!openBtn || !menu) return;
    var closeBtn = menu.querySelector('[data-menu-close]');
    var outside = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('[data-header]')];

    function focusables() {
      return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function open() {
      menu.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      outside.forEach(function (el) { if (el) el.inert = true; });
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      closeBtn.focus();
      document.addEventListener('keydown', onKey);
    }
    function close(returnFocus) {
      menu.classList.remove('is-open');
      menu.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      outside.forEach(function (el) { if (el) el.inert = false; });
      document.removeEventListener('keydown', onKey);
      if (returnFocus) openBtn.focus();
    }
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', function () { close(true); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { close(false); });
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches && !menu.hidden) close(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nav: mark the section currently in view                             */
  /* ------------------------------------------------------------------ */
  function initNavSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = document.querySelectorAll('[data-nav]');
    var sections = document.querySelectorAll('main > section[id]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-nav') === id); });
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------------------------ */
  /* Hero: very slow image settle, headline line by line, rule draws     */
  /* ------------------------------------------------------------------ */
  function heroIntro() {
    var img = document.querySelector('[data-hero-media] img');
    var header = document.querySelector('[data-header]');
    gsap.to(img, { scale: 1, duration: 4.6, ease: 'power2.out' });
    gsap.to(header, { opacity: 1, duration: 1.6, delay: .9, ease: 'power2.out' });
    gsap.to('[data-hero-rule]', { scaleY: 1, duration: 2, delay: .35, ease: 'expo.inOut' });
  }

  function heroTitle() {
    var title = document.querySelector('[data-hero-title]');
    var lines;
    var split = null;
    if (window.SplitText) {
      split = SplitText.create(title.querySelectorAll('.hl'), { type: 'lines', mask: 'lines', linesClass: 'ln' });
      padMasks(split);
      lines = split.lines;
    } else {
      lines = title.querySelectorAll('.hl');
    }
    gsap.set(title, { opacity: 1 });
    var tl = gsap.timeline({ delay: .25 });
    tl.from(lines, {
      yPercent: 112, duration: 1.7, stagger: .13, ease: 'expo.out',
      onComplete: function () { if (split) split.revert(); }
    });
    tl.to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.5, stagger: .14, ease: 'power3.out' }, .75);
  }

  /* SplitText masks clip italic overhangs and descenders; give them room. */
  function padMasks(split) {
    (split.masks || []).forEach(function (m) {
      m.style.padding = '.06em .14em .12em';
      m.style.margin = '-.06em -.14em -.12em';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveals                                                      */
  /* ------------------------------------------------------------------ */
  function sectionReveals() {
    var st = function (el, start) { return { trigger: el, start: start || 'top 86%', once: true }; };

    // Headlines, line by line
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (!window.SplitText) {
        gsap.from(el, { opacity: 0, y: 30, duration: 1.4, scrollTrigger: st(el) });
        return;
      }
      var s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      padMasks(s);
      gsap.from(s.lines, {
        yPercent: 112, duration: 1.6, stagger: .11, ease: 'expo.out',
        scrollTrigger: st(el, 'top 88%'),
        onComplete: function () { s.revert(); }
      });
    });

    // Labels: text fades, gold rule draws
    document.querySelectorAll('[data-rv="label"]').forEach(function (el) {
      gsap.timeline({ scrollTrigger: st(el, 'top 90%') })
        .from(el, { opacity: 0, duration: 1.2, ease: 'power2.out' })
        .fromTo(el, { '--rule': 0 }, { '--rule': 1, duration: 1.6, ease: 'expo.inOut' }, .1);
    });

    // Plain fade-ups
    document.querySelectorAll('[data-rv=""]').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 26, duration: 1.5, ease: 'power3.out', delay: .15, scrollTrigger: st(el) });
    });

    // Cards (expertise + insights): stagger within each group
    groupBy('[data-rv="card"]').forEach(function (group) {
      var parent = group[0].parentElement;
      var tl = gsap.timeline({ scrollTrigger: st(parent, 'top 84%') });
      group.forEach(function (card, i) {
        var img = card.querySelector('img');
        tl.from(card, { opacity: 0, y: 48, duration: 1.6, ease: 'power3.out' }, i * .16);
        if (img) tl.from(img, { scale: 1.14, duration: 2.4, ease: 'power3.out', clearProps: 'transform' }, i * .16);
      });
    });

    // Portrait: slow emergence from black
    var portrait = document.querySelector('[data-rv="portrait"]');
    if (portrait) {
      gsap.timeline({ scrollTrigger: st(portrait, 'top 80%') })
        .from(portrait.querySelector('img'), { opacity: 0, scale: 1.05, duration: 2.6, ease: 'power2.out', clearProps: 'transform' })
        .from(portrait.querySelector('.about__glow'), { opacity: 0, duration: 3, ease: 'power1.out' }, .4);
    }

    // Values: gold rule draws down, items follow
    var values = document.querySelector('[data-rv="values"]');
    if (values) {
      gsap.timeline({ scrollTrigger: st(values, 'top 85%') })
        .fromTo(values, { '--line': 0 }, { '--line': 1, duration: 1.8, ease: 'expo.inOut' })
        .from(values.children, { opacity: 0, x: -14, duration: 1.3, stagger: .18, ease: 'power3.out' }, .45);
    }

    // Figures: fade in and count up once
    var figs = document.querySelectorAll('[data-rv="fig"]');
    if (figs.length) {
      var tlF = gsap.timeline({ scrollTrigger: st(figs[0].parentElement, 'top 85%') });
      figs.forEach(function (fig, i) {
        tlF.from(fig, { opacity: 0, y: 24, duration: 1.4, ease: 'power3.out' }, i * .14);
        var num = fig.querySelector('[data-count]');
        if (num) tlF.add(countUp(num), i * .14 + .1);
      });
    }

    // Approach: the line draws and each step lights as it is reached
    var steps = document.querySelector('[data-steps]');
    if (steps) {
      var dots = steps.querySelectorAll('.step__dot');
      var items = steps.querySelectorAll('.step');
      dots.forEach(function (d) { d.classList.add('is-off'); });
      var tlS = gsap.timeline({ scrollTrigger: st(steps, 'top 82%') });
      tlS.fromTo(steps, { '--p': 0 }, { '--p': 1, duration: 3.2, ease: 'power1.inOut' }, 0);
      items.forEach(function (item, i) {
        var t = i * 1.0;
        tlS.call(function () { dots[i].classList.remove('is-off'); }, null, t + .05);
        tlS.from(item.querySelectorAll('.step__title, .step__text'), { opacity: 0, y: 18, duration: 1.3, stagger: .1, ease: 'power3.out' }, t);
      });
    }

    // Contact image: curtain opens from the right, light settles
    var frame = document.querySelector('[data-rv="frame"]');
    if (frame) {
      gsap.timeline({ scrollTrigger: st(frame, 'top 78%') })
        .fromTo(frame, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 2, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from(frame.querySelector('img'), { scale: 1.12, duration: 3, ease: 'power2.out', clearProps: 'transform' }, 0);
    }

    // Section counters: thin line draws
    document.querySelectorAll('.panel .count').forEach(function (c) {
      gsap.fromTo(c, { '--line': 0, opacity: 0 }, { '--line': 1, opacity: 1, duration: 1.8, ease: 'expo.inOut', scrollTrigger: st(c, 'top bottom') });
    });
  }

  function groupBy(sel) {
    var map = new Map();
    document.querySelectorAll(sel).forEach(function (el) {
      var p = el.parentElement;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(el);
    });
    return Array.from(map.values());
  }

  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var o = { v: 0 };
    var fmt = function (v) { return pre + v.toFixed(dec) + suf; };
    el.textContent = fmt(0);
    return gsap.to(o, {
      v: end, duration: 2.6, ease: 'power2.out',
      onUpdate: function () { el.textContent = fmt(o.v); },
      onComplete: function () { el.textContent = fmt(end); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reach map: dot-matrix Africa, sample capitals, links to the world   */
  /* ------------------------------------------------------------------ */
  function initMap() {
    var host = document.querySelector('[data-map]');
    if (!host || !window.d3 || !window.fetch) return;
    var load = function (f) { return fetch('assets/' + f).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); }); };
    Promise.all([load('africa-countries.geo.json'), load('africa-outline.geo.json'), load('africa-borders.geo.json'), load('places.json')])
      .then(function (d) { drawMap(host, d[0], d[1], d[2], d[3]); })
      .catch(function () { /* map is illustrative; figures remain */ });
  }

  function drawMap(host, countries, outline, borders, places) {
    var W = 760, H = 720, TERM = 220;
    countries.features.forEach(function (f) { rewindIfNeeded(f.geometry); });

    // Fit to the mainland and Madagascar only (outline also holds far islands)
    var mainland = { type: 'MultiPoint', coordinates: [[-17.6, 14.7], [51.4, 11.8], [10.0, 37.4], [20.0, -34.9], [50.5, -15.5], [-9.8, 29.5], [32.0, 31.5], [-13.0, 27.5]] };
    var proj = d3.geoAzimuthalEqualArea().rotate([-17, -2]).fitExtent([[96, 22], [W - 96, H - 22]], mainland);
    var path = d3.geoPath(proj);

    // Dot matrix sampled from the filled land
    var S = 2, step = 8.5;
    var cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.scale(S, S);
    ctx.beginPath();
    d3.geoPath(proj, ctx)(countries);
    ctx.fillStyle = '#fff';
    ctx.fill();
    var px = ctx.getImageData(0, 0, cv.width, cv.height).data;
    var dots = '';
    var row = 0;
    for (var y = step / 2; y < H; y += step * .866, row++) {
      for (var x = (row % 2 ? step : step / 2); x < W; x += step) {
        var i = (Math.round(y * S) * cv.width + Math.round(x * S)) * 4 + 3;
        if (px[i] > 140) dots += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'h0';
      }
    }

    var cities = places.africa;
    var labelled = { Casablanca: 'l',Cairo: 'r', Dakar: 'l', Lagos: 'b', 'Addis Ababa': 'r', Nairobi: 'r', Kinshasa: 'l', Johannesburg: 'r' };
    // Each link leaves the frame on the side of the world it points to: [from, to, side, position 0..1]
    var links = [['Lagos', 'London', 't', .34], ['Dakar', 'New York', 'l', .2], ['Nairobi', 'Dubai', 'r', .2], ['Johannesburg', 'Beijing', 'r', .52]];

    var svg = '';
    svg += '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" focusable="false">';
    svg += '<defs>' +
      '<linearGradient id="mg-dot" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="' + (W - 120) + '" y2="0">' +
      '<stop offset="0" stop-color="#EBCB86" stop-opacity=".95"/><stop offset=".5" stop-color="#C9A55C" stop-opacity=".66"/><stop offset="1" stop-color="#9C8048" stop-opacity=".46"/></linearGradient>' +
      '<radialGradient id="mg-glow"><stop offset="0" stop-color="#F6D998" stop-opacity=".7"/><stop offset=".35" stop-color="#C9A55C" stop-opacity=".22"/><stop offset="1" stop-color="#C9A55C" stop-opacity="0"/></radialGradient>' +
      // soft terminator: a gradient-edged mask that slides east to west
      '<linearGradient id="mg-term" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="' + (TERM / (W + TERM)).toFixed(3) + '" stop-color="#fff"/></linearGradient>' +
      '<mask id="mg-sweep" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><rect class="map__sweep" x="' + (-TERM) + '" y="0" width="' + (W + TERM) + '" height="' + H + '" fill="url(#mg-term)"/></mask>' +
      '</defs>';
    svg += '<g mask="url(#mg-sweep)"><path class="map__dots" stroke-width="2.7" d="' + dots + '"/></g>';
    svg += '<path class="map__borders" d="' + path(borders) + '"/>';
    svg += '<path class="map__outline" pathLength="1" d="' + path(outline) + '"/>';

    // Links to global capitals, ending at the frame edge with a label
    var cx = W / 2, cy = H / 2, inset = 6;
    svg += '<g class="map__links">';
    links.forEach(function (pair) {
      var a = proj(cities[pair[0]]);
      if (!a) return;
      var e = pair[2] === 't' ? [pair[3] * W, inset, 't']
        : pair[2] === 'l' ? [inset, pair[3] * H, 'l']
        : [W - inset, pair[3] * H, 'r'];
      var mx = (a[0] + e[0]) / 2, my = (a[1] + e[1]) / 2;
      var dx = e[0] - a[0], dy = e[1] - a[1], len = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / len, ny = dx / len;
      // bow the arc away from the continent's centre
      var side = ((mx - cx) * nx + (my - cy) * ny) > 0 ? 1 : -1;
      var k = len * .22 * side;
      var c1 = (mx + nx * k).toFixed(1) + ' ' + (my + ny * k).toFixed(1);
      var d = 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + c1 + ' ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
      svg += '<path class="map__arc map__arc--glow" pathLength="1" d="' + d + '"/>';
      svg += '<path class="map__arc" pathLength="1" d="' + d + '"/>';
      var anchor = e[2] === 'l' ? 'start' : e[2] === 'r' ? 'end' : 'middle';
      var tx = e[0] + (e[2] === 'l' ? 10 : e[2] === 'r' ? -10 : 0);
      var ty = e[1] + (e[2] === 't' ? 20 : e[2] === 'b' ? -12 : 4);
      svg += '<g class="map__edge"><circle cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="2.4"/>' +
        '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="' + anchor + '">' + pair[1] + '</text></g>';
    });
    svg += '</g>';

    // Capitals: warm lights, labels on a few
    svg += '<g class="map__cities">';
    Object.keys(cities).forEach(function (name) {
      var p = proj(cities[name]);
      if (!p) return;
      var side = labelled[name];
      svg += '<g class="map__city" data-x="' + p[0].toFixed(1) + '" transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')">' +
        '<circle r="17" fill="url(#mg-glow)"/><circle class="map__core" r="2.6"/>';
      if (side === 'b') {
        svg += '<text x="0" y="20" text-anchor="middle">' + name + '</text>';
      } else if (side) {
        svg += '<text x="' + (side === 'l' ? -10 : 10) + '" y="3.8" text-anchor="' + (side === 'l' ? 'end' : 'start') + '">' + name + '</text>';
      }
      svg += '</g>';
    });
    svg += '</g></svg>';

    host.innerHTML = svg;

    var anim = window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!anim) return;

    var el = host.querySelector('svg');
    var sweep = el.querySelector('.map__sweep');
    var outlineEl = el.querySelector('.map__outline');
    var arcs = el.querySelectorAll('.map__arc');
    var edges = el.querySelectorAll('.map__edge');
    var cityEls = Array.prototype.slice.call(el.querySelectorAll('.map__city'));

    gsap.set(sweep, { attr: { x: W } });
    gsap.set(outlineEl, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(edges, { opacity: 0 });
    gsap.set(cityEls, { opacity: 0 });

    var dur = 3.2;
    var tl = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 75%', once: true } });
    // Night falls east to west: the lights come on in the same order
    tl.to(sweep, { attr: { x: -TERM }, duration: dur, ease: 'power1.inOut' }, 0);
    tl.to(outlineEl, { strokeDashoffset: 0, duration: dur + .6, ease: 'power2.inOut' }, 0);
    cityEls.forEach(function (c) {
      var x = parseFloat(c.getAttribute('data-x'));
      tl.to(c, { opacity: 1, duration: 1.2, ease: 'power2.out' }, ((W - x) / W) * dur + .2);
    });
    tl.to(arcs, { strokeDashoffset: 0, duration: 2.2, stagger: .18, ease: 'power2.inOut' }, dur - .2);
    tl.to(edges, { opacity: 1, duration: 1, stagger: .18, ease: 'power2.out' }, dur + 1.4);
  }

  // d3 expects clockwise exterior rings; flip any polygon that covers the globe
  function rewindIfNeeded(g) {
    if (!g) return;
    var fix = function (rings) {
      if (d3.geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI) rings.forEach(function (r) { r.reverse(); });
    };
    if (g.type === 'Polygon') fix(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(fix);
  }
})();
