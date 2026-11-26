/* Silver Fox Horizons — Nocturne: shared behaviour */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger) && !reduced;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- header ---------- */
  var header = $('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    if (toggle) { toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); toggle && toggle.focus(); } });
  $$('#mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && doc.classList.contains('menu-open')) setMenu(false); });

  /* ---------- live clocks ---------- */
  var clocks = $$('[data-tz]');
  function tick() {
    var d = new Date();
    clocks.forEach(function (el) {
      try {
        var parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: el.getAttribute('data-tz') }).formatToParts(d);
        var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : '00'; };
        el.innerHTML = get('hour') + '<span class="blink">:</span>' + get('minute') + '<span class="sec">:' + get('second') + '</span>';
      } catch (e) { /* ignore */ }
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 1000); }

  /* ---------- practices story (sticky aside) ---------- */
  var story = $('.story');
  if (story) {
    var cards = $$('.p-card', story);
    var track = $('.num-track', story);
    var titles = $$('.story-titles h3', story);
    var bars = $$('.story-progress i', story);
    var setStory = function (i) {
      if (track) track.style.transform = 'translateY(' + (-i * 0.82) + 'em)';
      titles.forEach(function (t, k) { t.classList.toggle('is-active', k === i); });
      bars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
    };
    setStory(0);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setStory(cards.indexOf(e.target)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      cards.forEach(function (c) { io.observe(c); });
    }
  }

  /* ---------- spotlight cards ---------- */
  $$('.i-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- count-up ---------- */
  function fmt(el, v) {
    var dec = +(el.getAttribute('data-decimals') || 0);
    el.textContent = (el.getAttribute('data-prefix') || '') + v.toFixed(dec);
    var suf = el.getAttribute('data-suffix');
    if (suf) { var s = document.createElement('small'); s.textContent = suf; el.appendChild(s); }
  }
  var counters = $$('[data-count]');
  counters.forEach(function (el) { fmt(el, +el.getAttribute('data-count')); });
  if (!reduced && counters.length && 'IntersectionObserver' in window) {
    counters.forEach(function (el) { fmt(el, 0); });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1800;
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
          fmt(el, to * k);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- dot maps ---------- */
  if (window.NocturneMap) {
    var main = $('#africa-map');
    if (main) {
      var legendBtns = $$('[data-hub]');
      var map = new window.NocturneMap(main, {
        tooltip: $('#map-tip'),
        onHover: function (i) { legendBtns.forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-hub') === i); }); }
      });
      legendBtns.forEach(function (b) {
        var i = +b.getAttribute('data-hub');
        var on = function () { map.focus(i); legendBtns.forEach(function (x) { x.classList.toggle('is-on', x === b); }); };
        var off = function () { map.focus(-1); b.classList.remove('is-on'); };
        b.addEventListener('mouseenter', on); b.addEventListener('focus', on);
        b.addEventListener('mouseleave', off); b.addEventListener('blur', off);
        b.addEventListener('click', on);
      });
    }
    $$('canvas[data-ambient-map]').forEach(function (c) {
      var hl = c.getAttribute('data-highlight');
      new window.NocturneMap(c, {
        arcs: c.getAttribute('data-arcs') === 'true', labels: c.getAttribute('data-labels') !== 'false', interactive: false,
        density: +(c.getAttribute('data-density') || 0.85), intensity: +(c.getAttribute('data-intensity') || 0.85),
        highlight: hl != null ? +hl : null, padX: 0.06, padY: 0.08
      });
    });
  }

  /* ---------- insights filter ---------- */
  var filters = $$('.filter');
  if (filters.length) {
    var items = $$('[data-cat]');
    var empty = $('.filter-empty');
    var count = $('.filter-count');
    var apply = function (cat) {
      var shown = 0;
      items.forEach(function (it) {
        var ok = cat === 'all' || it.getAttribute('data-cat') === cat;
        it.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      filters.forEach(function (f) { f.setAttribute('aria-pressed', String(f.getAttribute('data-filter') === cat)); });
      if (empty) empty.style.display = shown ? 'none' : 'block';
      if (count) count.textContent = shown + (shown === 1 ? ' piece' : ' pieces');
      if (hasGsap) {
        var vis = items.filter(function (it) { return !it.classList.contains('is-hidden'); });
        window.gsap.fromTo(vis, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', overwrite: true });
        window.ScrollTrigger.refresh();
      }
    };
    filters.forEach(function (f) { f.addEventListener('click', function () { apply(f.getAttribute('data-filter')); }); });
    // counts
    filters.forEach(function (f) {
      var c = f.getAttribute('data-filter');
      var sup = $('sup', f);
      if (sup) sup.textContent = c === 'all' ? items.length : items.filter(function (it) { return it.getAttribute('data-cat') === c; }).length;
    });
    apply('all');
  }

  /* ---------- expertise subnav ---------- */
  var subLinks = $$('.subnav a');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    subLinks.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) sio.observe(t); });
  }

  /* ---------- contact form ---------- */
  var form = $('#enquiry');
  if (form) {
    var status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('[required]', form).forEach(function (f) {
        var field = f.closest('.field');
        var valid = f.value.trim() !== '' && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        if (field) field.classList.toggle('invalid', !valid);
        f.setAttribute('aria-invalid', String(!valid));
        if (!valid) { ok = false; first = first || f; }
      });
      if (!ok) { first.focus(); return; }
      status.classList.add('is-on');
      status.focus();
      form.reset();
    });
    $$('[required]', form).forEach(function (f) {
      f.addEventListener('input', function () { var field = f.closest('.field'); if (field) field.classList.remove('invalid'); });
    });
  }

  /* ---------- reveals (IntersectionObserver + CSS, independent of GSAP) ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var revealEls = [];
    $$('[data-reveal]').forEach(function (el) { revealEls.push([el, 0]); });
    $$('[data-stagger]').forEach(function (g) {
      Array.prototype.slice.call(g.children).forEach(function (c, i) { revealEls.push([c, i * 90]); });
    });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        rio.unobserve(e.target);
        var el = e.target, d = +(el.getAttribute('data-rv-delay') || 0);
        el.style.transitionDelay = d + 'ms';
        el.classList.add('rv-in');
        setTimeout(function () { el.classList.remove('rv', 'rv-in'); el.style.transitionDelay = ''; }, 1700 + d);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(function (p) {
      p[0].classList.add('rv');
      if (p[1]) p[0].setAttribute('data-rv-delay', p[1]);
      rio.observe(p[0]);
    });
  }

  /* ---------- motion (GSAP) ---------- */
  if (!hasGsap) {
    $$('.process-line').forEach(function (l) { l.style.setProperty('--p', 1); });
    $$('.step').forEach(function (s) { s.classList.add('is-lit'); });
    return;
  }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  doc.classList.add('js-motion');

  if (window.Lenis) {
    var lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    window.__lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -90 });
        history.replaceState(null, '', id);
      });
    });
  }

  // hero intro
  var heroLines = $$('.hero h1 .line > span, .page-hero h1 .line > span');
  if (heroLines.length) {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    var add = function (sel, vars, at) { var els = $$(sel); if (els.length) tl.from(els, vars, at); };
    tl.from(heroLines, { yPercent: 115, duration: 1.6, stagger: 0.12 }, 0.15);
    add('.hero .label, .page-hero .label', { opacity: 0, y: 12, duration: 1.2 }, 0.1);
    add('.hero-copy > *, .page-hero .ph-row > *', { opacity: 0, y: 20, duration: 1.4, stagger: 0.1 }, 0.6);
    add('.clocks li, .clocks-title', { opacity: 0, x: 16, duration: 1.2, stagger: 0.07 }, 0.8);
    add('.hero-media', { opacity: 0, scale: 1.08, duration: 2.6, ease: 'power2.out' }, 0);
  }

  // hero parallax
  if ($('.hero-media')) {
    gsap.to('.hero-media', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-inner', { opacity: 0.15, y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  }


  // scroll-scrubbed word reveal
  $$('[data-words]').forEach(function (el) {
    var words = [];
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) split(ch);
      });
    })(el);
    gsap.fromTo(words, { opacity: 0.12 }, {
      opacity: 1, ease: 'none', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.6 }
    });
  });

  // image drift inside frames
  $$('.p-media img, .practice-media img, .mandate-media img, .featured-media img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // process line
  $$('.process').forEach(function (sec) {
    var line = $('.process-line', sec), steps = $$('.step', sec);
    ST.create({
      trigger: sec, start: 'top 70%', end: 'bottom 70%', scrub: 0.5,
      onUpdate: function (self) {
        var p = Math.min(1, self.progress * 1.25);
        line.style.setProperty('--p', p.toFixed(4));
        steps.forEach(function (s, i) { s.classList.toggle('is-lit', p >= i / steps.length + 0.02); });
      }
    });
    line.style.setProperty('--p', 0);
  });

  // closing limb rises
  if ($('.limb')) {
    gsap.from('.limb', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  window.addEventListener('load', function () { ST.refresh(); });
})();
