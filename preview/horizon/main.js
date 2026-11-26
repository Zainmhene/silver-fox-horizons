/* Silver Fox Horizons — Concept 04 "Horizon" */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap && !reduce;
  if (!motion) root.classList.remove('motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // In-page anchors
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var target = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', url.hash);
  });

  /* ---------- Mobile menu ---------- */
  var toggle = d.querySelector('.menu-toggle');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.sr').textContent = open ? 'Close menu' : 'Menu';
    root.classList.toggle('menu-open', open);
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- Header state + horizon progress ---------- */
  var header = d.querySelector('.site-header');
  var fill = d.querySelector('.header-horizon__fill');
  var hero = d.querySelector('[data-hero]');
  var darkSections = d.querySelectorAll('.on-dark:not(.site-footer), .site-footer');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
    var hh = header.offsetHeight, dark = false;
    darkSections.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= hh * .5 && r.bottom >= hh * .5) dark = true; });
    header.classList.toggle('is-dark', dark);
    if (hero) header.classList.toggle('is-over-hero', y < hero.offsetHeight - 90);
    var max = root.scrollHeight - window.innerHeight;
    if (fill) fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Insights filter (works without motion) ---------- */
  var filterBtns = d.querySelectorAll('[data-filter]');
  if (filterBtns.length) {
    var cards = d.querySelectorAll('[data-cat]');
    var count = d.querySelector('[data-count-label]');
    var applyFilter = function (f) {
      var shown = 0;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === f ? 'true' : 'false'); });
      var visible = [];
      cards.forEach(function (c) {
        var on = f === 'all' || c.dataset.cat === f;
        c.hidden = !on;
        if (on) { shown++; visible.push(c); }
      });
      if (count) count.textContent = shown === 1 ? 'Showing 1 note' : 'Showing ' + shown + ' notes';
      if (motion) {
        gsap.fromTo(visible, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, stagger: .06, ease: 'expo.out', clearProps: 'transform' });
        ScrollTrigger.refresh();
      }
    };
    filterBtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });
    var initial = new URLSearchParams(location.search).get('topic');
    if (initial && d.querySelector('[data-filter="' + initial + '"]')) applyFilter(initial);
  }

  /* ---------- Contact form (front-end only) ---------- */
  var form = d.querySelector('[data-demo-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = 'Thank you. This is a demo, so your message has not been sent yet.';
      form.reset();
    });
  }

  if (!motion) return;

  /* ====================================================================
     Motion
     ==================================================================== */
  var ease = 'expo.out';

  /* Hero: letterbox opens, horizon draws, headline rises */
  if (hero) {
    header.classList.add('is-intro');
    var tl = gsap.timeline({ delay: .25 });
    tl.to('.hero__rule', { scaleX: 1, duration: 1.8, ease: 'expo.inOut' }, 0)
      .to('.hero__sun', { opacity: 1, y: 0, duration: 1.4, ease: ease }, 1.1)
      .to('.hero__bar--t', { yPercent: -100, duration: 1.7, ease: 'expo.inOut' }, .7)
      .to('.hero__bar--b', { yPercent: 100, duration: 1.7, ease: 'expo.inOut' }, .7)
      .fromTo('.hero__media', { scale: 1.12 }, { scale: 1, duration: 3.2, ease: 'power3.out' }, 0)
      .to('.hero .ln > span', { y: 0, duration: 1.5, stagger: .11, ease: ease }, 1.15)
      .to('.hero [data-hero-fade]', { opacity: 1, y: 0, duration: 1.3, stagger: .1, ease: ease }, 1.6)
      .add(function () { header.classList.remove('is-intro'); }, 1.5);

    gsap.to('.hero__inner', { yPercent: -14, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* Split-line headings outside the hero */
  gsap.utils.toArray('[data-lines]').forEach(function (el) {
    if (el.closest('[data-hero]')) return;
    gsap.to(el.querySelectorAll('.ln > span'), { y: 0, duration: 1.4, stagger: .1, ease: ease, scrollTrigger: { trigger: el, start: 'top 86%' } });
  });

  /* Generic reveals */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.3, ease: ease, delay: parseFloat(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* Horizon lines draw */
  gsap.utils.toArray('[data-draw]').forEach(function (el) {
    gsap.to(el, { clipPath: 'inset(-30px 0% -30px 0)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });

  /* Image wipes (left to right, like light crossing the horizon) */
  gsap.utils.toArray('[data-wipe]').forEach(function (el) {
    var img = el.querySelector('img');
    var t = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
    t.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'expo.inOut' });
    if (img && !img.hasAttribute('data-parallax')) t.from(img, { scale: 1.18, duration: 2, ease: ease }, 0);
  });

  /* Parallax images */
  gsap.utils.toArray('[data-parallax]').forEach(function (img) {
    var amt = parseFloat(img.dataset.parallax || 8);
    gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Count-up numerals */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var obj = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(obj, {
      v: end, duration: 2.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: function () { el.textContent = obj.v.toFixed(dec); }
    });
  });

  /* Closing: the sun rises on the horizon */
  var sun = d.querySelector('.closing__sun');
  if (sun) {
    gsap.fromTo(sun, { x: 0, y: 0, xPercent: -50, yPercent: 80 }, { yPercent: 46, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top 95%', end: 'top 15%', scrub: 1 } });
  }

  /* About: timeline along the horizon */
  var timeline = d.querySelector('.timeline');
  if (timeline) {
    var steps = timeline.querySelectorAll('.step');
    gsap.to('.timeline__fill', {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: timeline, start: 'top 75%', end: 'bottom 55%', scrub: 1,
        onUpdate: function (self) {
          steps.forEach(function (s, i) { s.classList.toggle('is-lit', self.progress >= i / steps.length + .02 || self.progress > .98); });
        }
      }
    });
    if (window.innerWidth <= 1100) steps.forEach(function (s) {
      ScrollTrigger.create({ trigger: s, start: 'top 75%', onEnter: function () { s.classList.add('is-lit'); } });
    });
  }

  /* Practices: pinned horizontal gallery (desktop, motion only) */
  var practices = d.querySelector('.practices');
  if (practices) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', function () {
      practices.classList.add('is-horizontal');
      var pin = practices.querySelector('.practices__pin');
      var track = practices.querySelector('.practices__track');
      var chapters = gsap.utils.toArray(practices.querySelectorAll('.chapter'));
      var plFill = practices.querySelector('.pl-fill');
      var plSun = practices.querySelector('.pl-sun');
      var labels = practices.querySelectorAll('.pl-labels li');
      var stops = [];
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var measure = function () {
        var dd = dist();
        stops = chapters.map(function (c) {
          var centre = c.offsetLeft + c.offsetWidth / 2 - window.innerWidth / 2;
          return Math.min(1, Math.max(0, centre / dd));
        });
        labels.forEach(function (l, i) { l.style.left = (stops[i] * 100) + '%'; });
      };

      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onRefresh: measure,
          onUpdate: function (self) {
            var p = self.progress;
            plFill.style.transform = 'scaleX(' + p + ')';
            plSun.style.left = (p * 100) + '%';
            var best = 0, bd = 9;
            stops.forEach(function (s, i) { var dd = Math.abs(s - p); if (dd < bd) { bd = dd; best = i; } });
            labels.forEach(function (l, i) { l.classList.toggle('is-active', i === best && p > stops[0] - .25); });
          }
        }
      });
      measure();

      chapters.forEach(function (c) {
        var img = c.querySelector('.chapter__media img');
        gsap.fromTo(img, { xPercent: 5 }, { xPercent: -5, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.from(c.querySelectorAll('.chapter__body > *'), { y: 30, opacity: 0, duration: 1.1, stagger: .08, ease: ease, scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 70%' } });
      });

      return function () { practices.classList.remove('is-horizontal'); gsap.set(track, { clearProps: 'all' }); };
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
