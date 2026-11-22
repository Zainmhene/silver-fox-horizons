/* =========================================================
   Silver Fox Horizons / Direction 04: HORIZON
   Everything opens out of one line.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqDesk = window.matchMedia('(min-width: 1024px)');
  var reduce = mqReduce.matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var hasSplit = !!window.SplitText;
  var motion = hasGsap && !reduce;

  var header = document.getElementById('site-header');
  var horizon = document.querySelector('.horizon');
  var OPEN = 'inset(0% 0% 0% 0%)';

  initHeader();
  initMenu();
  initIndex();
  var mapReady = initMap();

  if (!motion) {
    // Reduced motion, or the animation library did not load: show the finished page.
    window.__horizon = true;
    root.classList.remove('intro');
    mapReady.then(function (map) { if (map) map.reveal(); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(SplitText);

  // Arriving on a deep link (e.g. #reach): skip the title sequence and land on the scene.
  var deep = null;
  try { deep = location.hash && location.hash !== '#top' ? document.querySelector(location.hash) : null; } catch (e) { deep = null; }
  if ('scrollRestoration' in history && deep) history.scrollRestoration = 'manual';

  // The title sequence starts at once (the line needs no fonts); scenes wait for
  // the fonts so their lines split where the reader will see them break.
  // Only claim the page once the motion layer is really running; otherwise the
  // safety timer in the <head> reveals the finished hero on its own.
  window.__horizon = true;
  if (deep) root.classList.remove('intro');
  else intro(mqDesk.matches);
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, wait(1600)]).then(function () {
    mapReady.then(function (map) { scenes(map, deep); });
  });

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function num(el, prop, fallback) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue(prop));
    return isNaN(v) ? fallback : v;
  }
  function slit(f) { return 'inset(' + (f * 100).toFixed(2) + '% 0% ' + ((1 - f) * 100).toFixed(2) + '% 0%)'; }
  function bandFraction(band, desk) {
    var wrap = band.closest('.bandwrap');
    if (!wrap) return 0.5;
    return desk ? num(wrap, '--f', 0.5) : num(wrap, '--fm', num(wrap, '--h', 0.5));
  }

  /* ---------------------------------------------------------
     Header: transparent over the hero, then solid; hides on the way down
     --------------------------------------------------------- */
  function initHeader() {
    var last = window.scrollY;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      header.classList.toggle('at-top', y < vh * 0.55);
      header.classList.toggle('is-solid', y > vh * 0.55);
      if (!header.classList.contains('menu-open')) {
        if (y > last + 6 && y > vh * 0.9) header.classList.add('is-hidden');
        else if (y < last - 6 || y < vh * 0.5) header.classList.remove('is-hidden');
      }
      last = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
    update();
  }

  /* ---------------------------------------------------------
     Chapter index riding the right end of the line (desktop)
     --------------------------------------------------------- */
  function initIndex() {
    if (!horizon) return;
    var idx = horizon.querySelector('.horizon__index-num');
    var all = [].slice.call(document.querySelectorAll('.scene'));
    var current = null;
    var ticking = false;
    function swap(r) {
      if (!motion) { idx.textContent = r; return; }
      gsap.timeline()
        .to(idx, { yPercent: -110, duration: 0.3, ease: 'power2.in' })
        .add(function () { idx.textContent = r; })
        .fromTo(idx, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' });
    }
    function update() {
      ticking = false;
      var lineY = window.innerHeight * 0.58 + 1;
      var roman = null, scene = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].getBoundingClientRect().top <= lineY) { scene = all[i]; roman = scene.getAttribute('data-scene'); }
      }
      // Where the numeral already stands on the right, the index steps aside.
      horizon.classList.toggle('index-off', !!scene && scene.classList.contains('scene--mirror'));
      if (roman === current) return;
      current = roman;
      horizon.classList.toggle('show-index', !!roman);
      if (roman) swap(roman);
    }
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------------------------------------------------------
     Mobile menu: keyboard usable, Escape closes, focus stays inside
     --------------------------------------------------------- */
  function initMenu() {
    var btn = header.querySelector('.menu-toggle');
    var menu = document.getElementById('menu');
    var label = btn.querySelector('.menu-toggle__label');
    if (!btn || !menu) return;

    function items() { return [btn].concat([].slice.call(menu.querySelectorAll('a'))); }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      var f = items();
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      label.textContent = 'Close';
      header.classList.add('menu-open');
      header.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
      var first = menu.querySelector('a');
      if (first) first.focus();
    }
    function close(returnFocus) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      label.textContent = 'Menu';
      header.classList.remove('menu-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (returnFocus) btn.focus();
    }
    btn.addEventListener('click', function () { if (menu.hidden) open(); else close(true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    var onChange = function (e) { if (e.matches && !menu.hidden) close(false); };
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', onChange);
  }

  /* ---------------------------------------------------------
     Reach: Africa drawn as one silver line, resting on the horizon
     --------------------------------------------------------- */
  function initMap() {
    var svgEl = document.querySelector('.map__svg');
    if (!svgEl || !window.d3) return Promise.resolve(null);
    return Promise.all([
      fetch('assets/africa-outline.geo.json').then(function (r) { return r.json(); }),
      fetch('assets/places.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      return buildMap(svgEl, res[0], res[1]);
    }).catch(function () { return null; });
  }

  // Join the outline's edge arcs into one continuous coastline.
  function stitch(geo) {
    var geom = geo.geometry || (geo.features && geo.features[0].geometry);
    var lines = geom.coordinates;
    var key = function (p) { return p[0].toFixed(3) + ',' + p[1].toFixed(3); };
    var open = [], closed = [];
    lines.forEach(function (l) { (key(l[0]) === key(l[l.length - 1]) ? closed : open).push(l); });
    var used = new Array(open.length).fill(false);
    var rings = [];
    for (var s = 0; s < open.length; s++) {
      if (used[s]) continue;
      used[s] = true;
      var ring = open[s].slice();
      var grew = true;
      while (grew) {
        grew = false;
        var end = key(ring[ring.length - 1]);
        for (var i = 0; i < open.length; i++) {
          if (used[i]) continue;
          var l = open[i];
          if (key(l[0]) === end) { ring = ring.concat(l.slice(1)); used[i] = true; grew = true; break; }
          if (key(l[l.length - 1]) === end) { ring = ring.concat(l.slice().reverse().slice(1)); used[i] = true; grew = true; break; }
        }
      }
      rings.push(ring);
    }
    rings = rings.concat(closed).sort(function (a, b) { return b.length - a.length; });
    var main = rings[0];
    // Islands worth drawing: Madagascar is the only one that reads at this scale.
    var islands = rings.slice(1).filter(function (r) { return r.length > 120; });
    return { main: main, islands: islands };
  }

  function buildMap(svgEl, outlineGeo, places) {
    var d3 = window.d3;
    var data = stitch(outlineGeo);

    // Start the coastline at the southern tip (where it touches the horizon) and
    // split it into two strokes that climb the west and east coasts to the north.
    var ring = data.main;
    if (ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, -1);
    var south = 0, north = 0;
    ring.forEach(function (p, i) { if (p[1] < ring[south][1]) south = i; });
    ring = ring.slice(south).concat(ring.slice(0, south + 1));
    ring.forEach(function (p, i) { if (p[1] > ring[north][1]) north = i; });
    var halfA = ring.slice(0, north + 1);
    var halfB = ring.slice(north).reverse();
    var whole = { type: 'LineString', coordinates: ring };

    var routes = [
      { from: 'Lagos', to: 'London', edge: 'top' },
      { from: 'Dakar', to: 'New York', edge: 'left' },
      { from: 'Nairobi', to: 'Dubai', edge: 'right' }
    ];

    var svg = d3.select(svgEl);
    var revealed = false;
    var nodes = {};

    function render() {
      var W = svgEl.clientWidth;
      var H = svgEl.clientHeight;
      if (!W || !H) return;
      var desk = mqDesk.matches;
      svg.attr('viewBox', '0 0 ' + W + ' ' + H).selectAll('*').remove();

      var ah = desk ? H * 0.8 : Math.min(H * 0.62, W * 0.7);
      var cx = desk ? W * 0.585 : W * 0.5;
      var bottom = desk ? H : H - 1;
      var proj = d3.geoMercator().fitExtent([[cx - ah, bottom - ah], [cx + ah, bottom]], whole);
      var path = d3.geoPath(proj);
      var pad = desk ? 0 : 16;

      // Mobile: the scene carries its own horizon line.
      if (!desk) {
        svg.append('line').attr('class', 'map__horizon')
          .attr('x1', 0).attr('x2', W).attr('y1', bottom + 0.5).attr('y2', bottom + 0.5)
          .attr('stroke', 'rgba(201,205,210,.42)').attr('stroke-width', 1);
      }

      var g = svg.append('g').attr('fill', 'none').attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
      nodes.coast = [halfA, halfB].map(function (half) {
        return g.append('path').attr('d', path({ type: 'LineString', coordinates: half }))
          .attr('stroke', '#C9CDD2').attr('stroke-width', 1.1).node();
      });
      nodes.islands = data.islands.map(function (isl) {
        return g.append('path').attr('d', path({ type: 'LineString', coordinates: isl }))
          .attr('stroke', '#C9CDD2').attr('stroke-width', 1).node();
      });

      // Cities: a quiet field of points, three of them carry a line out.
      var cities = svg.append('g');
      var origins = routes.map(function (r) { return r.from; });
      nodes.dots = [];
      Object.keys(places.africa).forEach(function (name) {
        var p = proj(places.africa[name]);
        var isOrigin = origins.indexOf(name) > -1;
        nodes.dots.push(cities.append('circle').attr('cx', p[0]).attr('cy', p[1])
          .attr('r', isOrigin ? 2.4 : 1.5)
          .attr('fill', isOrigin ? '#EEF0F2' : 'rgba(201,205,210,.55)').node());
      });

      var arcs = svg.append('g').attr('fill', 'none');
      var labels = svg.append('g');
      nodes.arcs = [];
      nodes.labels = [];
      routes.forEach(function (r) {
        var a = places.africa[r.from], b = places.global[r.to];
        var O = proj(a), T = proj(b), E;
        // On a phone the continent nearly fills the width, so side labels go above it.
        var sideMax = desk ? H * 0.6 : (bottom - ah) - 8;
        if (r.edge === 'top') E = [Math.max(pad + 40, Math.min(W - 160, T[0])), 1];
        else if (r.edge === 'left') E = [pad, Math.max(24, Math.min(sideMax, T[1]))];
        else E = [W - pad, Math.max(24, Math.min(sideMax, T[1]))];
        var dx = E[0] - O[0], dy = E[1] - O[1];
        var len = Math.sqrt(dx * dx + dy * dy);
        var px = -dy / len, py = dx / len;
        if (py > 0 || (Math.abs(py) < 0.2 && px > 0)) { px = -px; py = -py; }
        if (r.edge === 'top' && px > 0) { px = -px; py = -py; } // London bows west, over the Atlantic
        var bend = r.edge === 'top' ? 0.22 : 0.24;
        var C = [(O[0] + E[0]) / 2 + px * len * bend, (O[1] + E[1]) / 2 + py * len * bend];
        nodes.arcs.push(arcs.append('path')
          .attr('d', 'M' + O[0] + ',' + O[1] + 'Q' + C[0] + ',' + C[1] + ' ' + E[0] + ',' + E[1])
          .attr('stroke', 'rgba(201,205,210,.78)').attr('stroke-width', 0.9).node());

        var km = Math.round(d3.geoDistance(a, b) * 6371 / 10) * 10;
        var lg = labels.append('g').attr('class', 'map__label');
        var anchor = r.edge === 'left' ? 'start' : r.edge === 'right' ? 'end' : 'start';
        var lx = r.edge === 'top' ? E[0] + 12 : E[0];
        // Side labels sit on whichever side of the arc's end the curve does not come from.
        var fromAbove = C[1] < E[1];
        var ly = r.edge === 'top' ? E[1] + 16 : fromAbove ? E[1] + (desk ? 28 : 24) : E[1] - (desk ? 32 : 28);
        lg.append('circle').attr('cx', E[0]).attr('cy', E[1]).attr('r', 2).attr('fill', '#EEF0F2');
        lg.append('text').attr('x', lx).attr('y', ly).attr('text-anchor', anchor)
          .attr('fill', '#EDE7DD').style('font', 'italic 400 ' + (desk ? 19 : 16) + 'px "Bodoni Moda", serif')
          .text(r.to);
        lg.append('text').attr('x', lx).attr('y', ly + (desk ? 18 : 16)).attr('text-anchor', anchor)
          .attr('fill', 'rgba(201,205,210,.75)')
          .style('font', '500 ' + (desk ? 9.5 : 8.5) + 'px Inter, sans-serif').style('letter-spacing', '.22em')
          .text((r.from + ' — ' + km.toLocaleString('en-GB') + ' km').toUpperCase());
        nodes.labels.push(lg.node());

        // Name the origin, quietly.
        var west = r.from === 'Dakar';
        var oa = west ? 'end' : 'start';
        var ox = west ? O[0] - 8 : O[0] + 8;
        var under = r.from === 'Lagos';
        nodes.labels.push(labels.append('text').attr('x', under ? O[0] : ox).attr('y', O[1] + (under ? 17 : 3.5))
          .attr('text-anchor', under ? 'middle' : oa).attr('fill', 'rgba(201,205,210,.8)')
          .style('font', '500 8.5px Inter, sans-serif').style('letter-spacing', '.2em')
          .text(r.from.toUpperCase()).node());
      });

      if (revealed || !motion) finalState(); else hiddenState();
    }

    function strokes() { return nodes.coast.concat(nodes.islands, nodes.arcs); }
    function hiddenState() {
      strokes().forEach(function (p) {
        var L = p.getTotalLength();
        p.style.strokeDasharray = L + ' ' + L;
        p.style.strokeDashoffset = L;
      });
      nodes.dots.concat(nodes.labels).forEach(function (n) { n.style.opacity = 0; });
    }
    function finalState() {
      strokes().forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
      nodes.dots.concat(nodes.labels).forEach(function (n) { n.style.opacity = ''; });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 180);
    });
    render();

    return {
      reveal: function () { revealed = true; finalState(); },
      // Added to a scene timeline as a callback so it always draws the current nodes
      // (the SVG is rebuilt on resize). If the timeline is jumped to its end, show it finished.
      play: function (tl, at) {
        tl.add(function () {
          if (revealed) return;
          if (tl.progress() === 1 && !tl.isActive()) { revealed = true; finalState(); return; }
          gsap.timeline({ onComplete: function () { revealed = true; finalState(); } })
            .to(nodes.coast, { strokeDashoffset: 0, duration: 2.8, ease: 'power2.inOut' }, 0)
            .to(nodes.islands, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 1.6)
            .to(nodes.dots, { opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power1.out' }, 1.4)
            .to(nodes.arcs, { strokeDashoffset: 0, duration: 1.8, stagger: 0.3, ease: 'power2.inOut' }, 2.2)
            .to(nodes.labels, { opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power1.out' }, 3.2);
        }, at);
      }
    };
  }

  /* ---------------------------------------------------------
     Hero: the line draws from the centre, then opens into the film
     --------------------------------------------------------- */
  function intro(desk) {
    var hero = document.querySelector('.hero');
    var wrap = hero.querySelector('.bandwrap--hero');
    var band = hero.querySelector('.band');
    var img = hero.querySelector('.band__media img');
    var inner = hero.querySelector('.masthead--light .masthead__inner');
    var below = hero.querySelectorAll('.hero__below > *');
    var f = desk ? num(wrap, '--f', 0.7) : num(wrap, '--fm', 0.8);
    var line = desk ? horizon.querySelector('.horizon__base') : hero.querySelector('.band-line');

    gsap.set(header, { autoAlpha: 0 });
    gsap.set(inner, { yPercent: 112, y: 0 });
    gsap.set(below, { autoAlpha: 0, y: 14 });
    gsap.set(band, { clipPath: slit(f), visibility: 'hidden' });
    gsap.set(line, { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(img, { scale: 1.08 });
    root.classList.remove('intro');

    var drift;
    var tl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power3.inOut' } });
    tl.to(line, { scaleX: 1, duration: 1.5 })
      .to(inner, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0.95)
      .set(band, { visibility: 'visible' }, 1.9)
      .to(band, { clipPath: OPEN, duration: 1.4 }, 1.9)
      .to(img, { scale: 1, duration: 2.8, ease: 'power2.out' }, 1.9)
      .to(below, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.14, ease: 'power2.out' }, 2.9)
      .to(header, { autoAlpha: 1, duration: 1.2, ease: 'power2.out', clearProps: 'opacity,visibility' }, 3.0)
      .add(function () {
        // A very slow drift, anchored on the horizon so the line never moves.
        drift = gsap.to(img, { scale: 1.045, xPercent: -1.4, duration: 34, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        ScrollTrigger.create({
          trigger: hero, start: 'top top', end: 'bottom top',
          onToggle: function (self) { if (self.isActive) drift.resume(); else drift.pause(); }
        });
      }, 4.2);
  }

  /* ---------------------------------------------------------
     Scenes
     --------------------------------------------------------- */
  function scenes(map, deep) {
    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 1024px)', mob: '(max-width: 1023.98px)' }, function (ctx) {
      var desk = ctx.conditions.desk;
      var all = gsap.utils.toArray('.scene');
      var plays = [];

      all.forEach(function (scene) {
        var build = scene.classList.contains('scene--chapter') || scene.classList.contains('scene--contact') ? chapter
          : scene.id === 'mandate' ? mandate
          : scene.id === 'about' ? about
          : scene.id === 'reach' ? reach
          : scene.id === 'approach' ? approach
          : scene.id === 'insights' ? insights : null;
        if (!build) return;
        var parts = build(scene, desk, map);
        if (desk) {
          var len = { mandate: 0.65, about: 0.45, reach: 0.85, approach: 1.7, insights: 0.5, contact: 0.3 }[scene.id] || 0.55;
          var st = ScrollTrigger.create({
            trigger: scene, start: 'top top',
            end: function () { return '+=' + Math.round(window.innerHeight * len); },
            pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            scrub: parts.scrub ? true : false,
            onEnter: function () { parts.main.play(); },
            onUpdate: parts.onUpdate || null,
            onLeave: parts.onLeave || null,
            onLeaveBack: parts.onLeaveBack || null,
            onRefresh: parts.onRefresh || null
          });
          var pre = ScrollTrigger.create({
            trigger: scene, start: 'top 55%',
            onEnter: function () { parts.pre.play(); }
          });
          plays.push([pre, parts.pre], [st, parts.main]);
        } else {
          (parts.mobile || []).forEach(function (pair) {
            var st2 = ScrollTrigger.create({
              trigger: pair[0], start: pair[2] || 'top 82%',
              onEnter: function () { pair[1].play(); }
            });
            plays.push([st2, pair[1]]);
          });
        }
      });

      // Anything already scrolled past when the page loads is shown complete.
      ScrollTrigger.refresh();
      if (deep) {
        window.scrollTo(0, deep.getBoundingClientRect().top + window.scrollY);
        deep = null;
      }
      requestAnimationFrame(function () {
        var y = window.scrollY;
        plays.forEach(function (p) { if (y > p[0].start + 2) p[1].progress(1); });
        ScrollTrigger.update();
      });
    });
  }

  /* ---- shared reveal pieces ---- */
  function splitLines(el, dir, tl, at, from) {
    if (!el) return;
    if (!hasSplit) {
      gsap.set(el, { autoAlpha: 0, y: 18 * dir });
      tl.to(el, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out' }, at);
      return;
    }
    var split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
    gsap.set(split.lines, { yPercent: 108 * dir });
    tl.to(split.lines, {
      yPercent: 0, duration: 1.25, ease: 'power3.out',
      stagger: { each: 0.1, from: from || 'start' }
    }, at);
    tl.add(function () { split.revert(); });
  }
  function riseNumeral(scene, tl, at) {
    var n = scene.querySelector('.numeral');
    if (!n) return;
    gsap.set(n, { clipPath: 'inset(100% -10% 0% -10%)', y: 28 });
    tl.to(n, { clipPath: 'inset(-10% -10% 0% -10%)', y: 0, duration: 1.5, ease: 'power3.inOut', clearProps: 'clipPath,transform' }, at);
  }
  function fade(els, tl, at, opts) {
    els = gsap.utils.toArray(els);
    if (!els.length) return;
    var o = opts || {};
    gsap.set(els, { autoAlpha: 0, y: o.y == null ? 14 : o.y });
    tl.to(els, { autoAlpha: 1, y: 0, duration: o.d || 1.1, stagger: o.stagger || 0.12, ease: 'power2.out' }, at);
  }
  function openBand(band, desk, tl, at) {
    var f = bandFraction(band, desk);
    var img = band.querySelector('img');
    gsap.set(band, { clipPath: slit(f), visibility: 'hidden' });
    tl.set(band, { visibility: 'visible' }, at);
    tl.to(band, { clipPath: OPEN, duration: 1.4, ease: 'power3.inOut' }, at);
    if (img) {
      gsap.set(img, { scale: 1.1 });
      tl.to(img, { scale: 1, duration: 2.6, ease: 'power2.out' }, at);
    }
  }
  function drawLine(el, tl, at) {
    if (!el) return;
    gsap.set(el, { scaleX: 0, transformOrigin: '50% 50%' });
    tl.to(el, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, at);
  }
  function T() { return gsap.timeline({ paused: true }); }

  /* ---- I. Mandate: one sentence, ambition above the line, delivery below ---- */
  function mandate(scene, desk) {
    var pre = T(), main = T();
    var above = scene.querySelector('.mandate__above');
    var below = scene.querySelector('.mandate__below');
    if (desk) {
      riseNumeral(scene, pre, 0);
      fade(scene.querySelector('.scene__meta'), pre, 0.5);
      splitLines(above, 1, main, 0.1, 'end');
      splitLines(below, -1, main, 0.35, 'start');
      return { pre: pre, main: main };
    }
    var a = T(), b = T();
    riseNumeral(scene, a, 0);
    fade(scene.querySelector('.scene__meta'), a, 0.4);
    splitLines(above, 1, b, 0, 'end');
    splitLines(below, -1, b, 0.3, 'start');
    return { mobile: [[scene, a], [above, b, 'top 80%']] };
  }

  /* ---- About ---- */
  function about(scene, desk) {
    var pre = T(), main = T();
    var statement = scene.querySelector('.about__statement');
    var body = scene.querySelectorAll('.about__body p');
    var values = scene.querySelectorAll('.values li');
    if (desk) {
      fade(scene.querySelector('.scene__meta'), pre, 0);
      splitLines(statement, 1, main, 0.05, 'end');
      fade(body, main, 0.55, { y: -12 });
      fade(values, main, 0.8, { y: -12, stagger: 0.14 });
      return { pre: pre, main: main };
    }
    var a = T(), b = T(), c = T();
    fade(scene.querySelector('.scene__meta'), a, 0);
    splitLines(statement, 1, a, 0.1, 'end');
    fade(body, b, 0);
    fade(values, c, 0, { stagger: 0.12 });
    return { mobile: [[scene, a], [scene.querySelector('.about__body'), b], [scene.querySelector('.values'), c]] };
  }

  /* ---- II - IV and VIII: the film frame opens out of the line ---- */
  function chapter(scene, desk) {
    var pre = T(), main = T();
    var title = scene.querySelector('.chapter-title, .contact__title');
    var band = scene.querySelector('.band');
    var belowEls = scene.querySelectorAll('.band-below > *');
    if (desk) {
      riseNumeral(scene, pre, 0);
      fade(scene.querySelector('.scene__meta'), pre, 0.5);
      splitLines(title, 1, pre, 0.3, 'start');
      openBand(band, true, main, 0);
      fade(belowEls, main, 0.9, { y: -12, stagger: 0.16 });
      return { pre: pre, main: main };
    }
    var a = T(), b = T(), c = T();
    riseNumeral(scene, a, 0);
    fade(scene.querySelector('.scene__meta'), a, 0.4);
    splitLines(title, 1, a, 0.3, 'start');
    drawLine(scene.querySelector('.band-line'), b, 0);
    openBand(band, false, b, 0.45);
    fade(belowEls, c, 0, { stagger: 0.14 });
    return { mobile: [[scene, a], [scene.querySelector('.band-holder'), b, 'top 78%'], [scene.querySelector('.band-below'), c, 'top 88%']] };
  }

  /* ---- V. Reach ---- */
  function reach(scene, desk, map) {
    var pre = T(), main = T();
    var counts = scene.querySelectorAll('.count');
    var labels = scene.querySelectorAll('.figure__label');
    function counters(tl, at) {
      counts.forEach(function (el, i) {
        var to = parseFloat(el.getAttribute('data-to'));
        var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
        var o = { v: 0 };
        el.textContent = (0).toFixed(dec);
        tl.to(o, {
          v: to, duration: 2.4, ease: 'power2.out',
          onUpdate: function () { el.textContent = o.v.toFixed(dec); }
        }, at + i * 0.12);
      });
    }
    var figs = scene.querySelectorAll('.figure__num');
    if (desk) {
      riseNumeral(scene, pre, 0);
      fade(scene.querySelector('.scene__meta'), pre, 0.5);
      if (map) map.play(main, 0);
      fade(figs, main, 0.6, { y: -16, stagger: 0.12 });
      counters(main, 0.6);
      fade(labels, main, 1.1, { y: -8, stagger: 0.12 });
      return { pre: pre, main: main };
    }
    var a = T(), b = T(), c = T();
    riseNumeral(scene, a, 0);
    fade(scene.querySelector('.scene__meta'), a, 0.4);
    if (map) map.play(b, 0);
    fade(figs, c, 0, { stagger: 0.12 });
    counters(c, 0);
    fade(labels, c, 0.4, { stagger: 0.12 });
    return { mobile: [[scene, a], [scene.querySelector('.map'), b, 'top 70%'], [scene.querySelector('.figures'), c, 'top 85%']] };
  }

  /* ---- VI. Approach: four stations; the line fills as you go ---- */
  function approach(scene, desk) {
    var pre = T(), main = T();
    var stations = [].slice.call(scene.querySelectorAll('.station'));
    scene.classList.add('is-tracking');
    if (desk) {
      var fill = horizon.querySelector('.horizon__fill');
      var marks = [];
      var masts = stations.map(function (st) { return st.querySelector('.station__mast'); });
      gsap.set(masts, { scaleY: 0 });
      var setFill = function (p) {
        gsap.to(fill, { scaleX: p, autoAlpha: p > 0.003 ? 1 : 0, duration: 0.35, ease: 'power1.out', overwrite: true });
        stations.forEach(function (st, i) {
          var lit = p >= marks[i];
          if (lit === st.classList.contains('is-lit')) return;
          st.classList.toggle('is-lit', lit);
          gsap.to(masts[i], { scaleY: lit ? 1 : 0, duration: lit ? 1.1 : 0.5, ease: lit ? 'power3.out' : 'power2.in', overwrite: true });
        });
      };
      var measure = function () {
        var W = window.innerWidth;
        marks = stations.map(function (st) {
          return (st.querySelector('.station__dot').getBoundingClientRect().left + 4) / W;
        });
      };
      measure();
      riseNumeral(scene, pre, 0);
      fade(scene.querySelector('.scene__meta'), pre, 0.5);
      fade(scene.querySelectorAll('.station__above, .station__text'), pre, 0.6, { y: 10, stagger: 0.06 });
      return {
        pre: pre, main: main, scrub: true,
        onUpdate: function (self) { setFill(self.progress); },
        onLeave: function () { setFill(1); },
        onLeaveBack: function () { setFill(0); },
        onRefresh: function (self) { measure(); setFill(self.progress); }
      };
    }
    var a = T();
    riseNumeral(scene, a, 0);
    fade(scene.querySelector('.scene__meta'), a, 0.4);
    var pairs = [[scene, a]];
    stations.forEach(function (st) {
      var tl = T();
      tl.add(function () { st.classList.add('is-lit'); }, 0.2);
      pairs.push([st, tl, 'top 68%']);
    });
    return { mobile: pairs };
  }

  /* ---- VII. Insights: a film strip opening from the line ---- */
  function insights(scene, desk) {
    var pre = T(), main = T();
    var frames = [].slice.call(scene.querySelectorAll('.frame'));
    if (desk) {
      riseNumeral(scene, pre, 0);
      fade(scene.querySelector('.scene__meta'), pre, 0.5);
      frames.forEach(function (fr, i) {
        var media = fr.querySelector('.frame__media');
        gsap.set(media, { clipPath: slit(0.5), visibility: 'hidden' });
        main.set(media, { visibility: 'visible' }, i * 0.18);
        main.to(media, { clipPath: OPEN, duration: 1.4, ease: 'power3.inOut' }, i * 0.18);
        var img = media.querySelector('img');
        gsap.set(img, { scale: 1.12 });
        main.to(img, { scale: 1, duration: 2.4, ease: 'power2.out', clearProps: 'transform' }, i * 0.18);
      });
      fade(scene.querySelectorAll('.frame__meta'), main, 0.7, { y: 8, stagger: 0.14 });
      fade(scene.querySelectorAll('.frame__foot'), main, 1.1, { y: 0, stagger: 0.14 });
      fade(scene.querySelectorAll('.frame__title, .frame__text'), main, 0.9, { y: -10, stagger: 0.08 });
      return { pre: pre, main: main };
    }
    var a = T();
    riseNumeral(scene, a, 0);
    fade(scene.querySelector('.scene__meta'), a, 0.4);
    var pairs = [[scene, a]];
    frames.forEach(function (fr) {
      var tl = T();
      var media = fr.querySelector('.frame__media');
      gsap.set(media, { clipPath: slit(0.5), visibility: 'hidden' });
      tl.set(media, { visibility: 'visible' }, 0);
      tl.to(media, { clipPath: OPEN, duration: 1.3, ease: 'power3.inOut' }, 0);
      fade(fr.querySelectorAll('.frame__meta, .frame__foot, .frame__title, .frame__text'), tl, 0.5, { stagger: 0.1 });
      pairs.push([fr, tl, 'top 80%']);
    });
    return { mobile: pairs };
  }
})();
