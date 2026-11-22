/* Silver Fox Horizons v3: hero */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('[data-hero]');
  const canvas = hero.querySelector('[data-hero-canvas]');
  const video = hero.querySelector('[data-hero-video]');
  const content = hero.querySelector('[data-hero-content]');
  const counterFill = hero.querySelector('[data-counter-fill]');

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  const menuLabel = document.querySelector('[data-menu-label]');
  let menuTimer;
  const isOpen = () => menuBtn.getAttribute('aria-expanded') === 'true';
  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Close';
    document.body.classList.add('menu-open');
    menu.querySelector('a').focus({ preventScroll: true });
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    document.body.classList.remove('menu-open');
    menuTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 400);
    if (returnFocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => (isOpen() ? closeMenu(true) : openMenu()));
  menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    const items = [menuBtn, ...menu.querySelectorAll('a')];
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); items[0].focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && isOpen()) closeMenu(false); });

  /* ---------- Helpers ---------- */
  // Tall screens get the vertical cut so phones stay sharp
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  if (portrait && video.dataset.portraitPoster) video.poster = video.dataset.portraitPoster;

  function playVideo() {
    video.querySelectorAll('source[data-src]').forEach((s) => {
      if (!s.src) s.src = portrait && s.dataset.srcPortrait ? s.dataset.srcPortrait : s.dataset.src;
    });
    video.load();
    video.play().catch(() => {});
  }
  const solidHeader = (on) => header.classList.toggle('is-solid', on);

  /* ---------- Tile videos: load and play only while on screen ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const tileObs = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          const s = target.querySelector('source[data-src]');
          if (s && !s.src) { s.src = s.dataset.src; target.load(); }
          target.play().catch(() => {});
        } else {
          target.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('[data-tile-video]').forEach((v) => tileObs.observe(v));
  }

  /* ---------- Tile 02 strip: caption follows whichever clip is playing ---------- */
  const strip = document.querySelector('[data-strip]');
  const stripCap = document.querySelector('[data-cycle-cap]');
  if (strip && stripCap) {
    const caps = (strip.dataset.caps || '').split('|');
    const seg = parseFloat(strip.dataset.seg) || 2.2;
    let shown = 0;
    strip.addEventListener('timeupdate', () => {
      const i = Math.min(caps.length - 1, Math.floor(strip.currentTime / seg));
      if (i === shown) return;
      shown = i;
      stripCap.style.opacity = '0';
      setTimeout(() => { stripCap.textContent = caps[i]; stripCap.style.opacity = '1'; }, 200);
    });
  }

  /* ---------- Phones: expertise cards swipe sideways, dots follow (CSS does the snapping) ---------- */
  const rail = document.querySelector('[data-tiles-rail]');
  const dotsWrap = document.querySelector('[data-tiles-dots]');
  if (rail && dotsWrap) {
    const cards = rail.querySelectorAll('.tile');
    const dots = dotsWrap.querySelectorAll('button');
    const step = () => (cards.length > 1 ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left : 1);
    let current = 0, ticking = false;
    const setDot = (i) => {
      if (i === current) return;
      current = i;
      dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    };
    rail.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const max = rail.scrollWidth - rail.clientWidth;
        const i = rail.scrollLeft >= max - 4 ? cards.length - 1 : Math.round(rail.scrollLeft / step());
        setDot(Math.max(0, Math.min(cards.length - 1, i)));
      });
    }, { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => {
      rail.scrollTo({ left: i * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
  }

  /* ---------- Contact form: DEMO ONLY. Checks the fields, then shows a note; nothing is sent anywhere ---------- */
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      form.querySelectorAll('input, textarea').forEach((el) => {
        const bad = !el.checkValidity() || (el.required && !el.value.trim());
        el.closest('.field').classList.toggle('is-invalid', bad);
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !first) first = el;
      });
      if (first) {
        status.classList.add('is-error');
        status.textContent = 'Please add your name, a valid email and a message.';
        first.focus();
        return;
      }
      status.classList.remove('is-error');
      status.textContent = 'Thank you. This is a demo, so your message was not sent.';
      form.reset();
    });
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f && f.classList.contains('is-invalid') && e.target.checkValidity() && e.target.value.trim()) {
        f.classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  /* ---------- No GSAP or reduced motion: everything visible, still image ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    if (!reduceMotion) playVideo();
    window.addEventListener('scroll', () => solidHeader(window.scrollY > hero.offsetHeight - 90), { passive: true });
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  // Keep reveals on real time even when video decoding makes a few frames slow
  gsap.ticker.lagSmoothing(0);

  if (reduceMotion) {
    ScrollTrigger.create({ trigger: hero, start: 'bottom 90px', onEnter: () => solidHeader(true), onLeaveBack: () => solidHeader(false) });
    return;
  }

  /* ---------- Intro: label and its rules, then the headline rises line by line, then text, buttons, counter ---------- */
  const lines = hero.querySelectorAll('[data-hero-line]');
  const kicker = hero.querySelector('.hero-kicker');
  const afterFades = hero.querySelectorAll('.hero-text, .hero-actions, .hero-foot [data-hero-fade]');
  gsap.set(lines, { visibility: 'visible' });
  gsap.timeline({ delay: 0.25 })
    .to(kicker, { opacity: 1, duration: 0.9, ease: 'power1.out' })
    .to('[data-hero-vrule]', { scaleY: 1, duration: 1.4, ease: 'power3.inOut' }, '<')
    .to('[data-hero-rule]', { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, '<')
    .fromTo(lines,
      { yPercent: 35, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      { yPercent: 0, opacity: 1, clipPath: 'inset(-20% -5% -25% -5%)', duration: 1.4, ease: 'power3.out', stagger: 0.22 }, '-=0.6')
    .to(afterFades, { opacity: 1, duration: 1.1, ease: 'power1.out', stagger: 0.14 }, '-=0.8');

  /* ---------- Desktop: pinned night flight scrubbed by scroll ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1px)', () => {
    const COUNT = 120;
    const frames = new Array(COUNT);
    const ready = new Array(COUNT).fill(false);
    const ctx = canvas.getContext('2d');
    const state = { f: 0 };
    let drawn = -1;

    hero.classList.add('is-canvas');
    video.pause();

    // Sharp AVIF frames sized to the screen; WebP set only if the browser can't decode AVIF
    const SETS = {
      big: { dir: '../assets/hero-seq-2560/', ext: 'avif' },
      std: { dir: '../assets/hero-seq-1920/', ext: 'avif' },
      fallback: { dir: '../assets/hero-seq/', ext: 'webp' },
    };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let set = canvas.clientWidth * dpr > 2000 ? SETS.big : SETS.std;
    const src = (i) => `${set.dir}f${String(i + 1).padStart(3, '0')}.${set.ext}`;

    function nearest(i) {
      for (let d = 0; d < COUNT; d++) {
        if (ready[i - d]) return i - d;
        if (ready[i + d]) return i + d;
      }
      return -1;
    }
    function draw(force) {
      const i = nearest(Math.round(state.f));
      if (i < 0 || (i === drawn && !force)) return;
      const img = frames[i];
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = i;
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(true);
    }

    // Every 4th frame first so scrubbing works early, then the rest
    const order = [];
    for (let i = 0; i < COUNT; i += 4) order.push(i);
    for (let i = 0; i < COUNT; i++) if (i % 4) order.push(i);
    function loadAll() {
      order.forEach((i) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { ready[i] = true; if (Math.abs(i - Math.round(state.f)) <= 4) draw(true); };
        img.src = src(i);
        frames[i] = img;
      });
    }
    const probe = new Image();
    probe.onload = loadAll;
    probe.onerror = () => { set = SETS.fallback; loadAll(); };
    probe.src = src(0);

    resize();
    window.addEventListener('resize', resize);

    const film = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onLeave: () => solidHeader(true),
        onEnterBack: () => solidHeader(false),
      },
    });
    film
      .to(state, { f: COUNT - 1, ease: 'none', duration: 1, onUpdate: () => draw(false) }, 0)
      .to(counterFill, { scaleX: 1, ease: 'none', duration: 1 }, 0)
      .to(content, { autoAlpha: 0, y: -40, ease: 'power1.in', duration: 0.22 }, 0.62);

    return () => {
      window.removeEventListener('resize', resize);
      hero.classList.remove('is-canvas');
    };
  });


  /* ---------- Expertise tiles: heading lines rise, then the tiles rise one after another ---------- */
  // Created after the hero pin so their positions include the pinned scroll distance
  // Each section reveals its own heading lines, then its text, when it comes into view
  document.querySelectorAll('.about, .montage, .tiles-sec, .impact, .contact').forEach((sec) => {
    const lines = sec.querySelectorAll('[data-reveal-line]');
    const fades = sec.querySelectorAll('[data-reveal-fade]');
    const trigger = { trigger: sec, start: 'top 72%', once: true };
    gsap.set(lines, { visibility: 'visible' });
    gsap.fromTo(lines,
      { yPercent: 40, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      { yPercent: 0, opacity: 1, clipPath: 'inset(-20% -5% -25% -5%)', duration: 1.3, ease: 'power3.out', stagger: 0.15, scrollTrigger: trigger });
    gsap.to(fades, { opacity: 1, duration: 1.1, ease: 'power1.out', stagger: 0.12, delay: 0.25, scrollTrigger: trigger });
  });
  // About: portrait opens, bronze line draws, values follow (CSS transitions, started once on entry)
  const about = document.querySelector('[data-about]');
  if (about) ScrollTrigger.create({ trigger: about, start: 'top 70%', once: true, onEnter: () => about.classList.add('is-in') });
  gsap.fromTo('[data-tile]',
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.tiles', start: 'top 82%', once: true } });
})();
