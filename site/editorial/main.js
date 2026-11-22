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

  /* ---------- No GSAP or reduced motion: everything visible, still image ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    if (!reduceMotion) playVideo();
    window.addEventListener('scroll', () => solidHeader(window.scrollY > hero.offsetHeight - 90), { passive: true });
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion) {
    ScrollTrigger.create({ trigger: hero, start: 'bottom 90px', onEnter: () => solidHeader(true), onLeaveBack: () => solidHeader(false) });
    return;
  }

  /* ---------- Intro: hairline draws, labels appear, the big line rises, then the rest ---------- */
  const lines = hero.querySelectorAll('[data-hero-line]');
  const metaFades = hero.querySelectorAll('.hero-meta [data-hero-fade]');
  const sideFade = hero.querySelector('.hero-side');
  gsap.set(lines, { visibility: 'visible' });
  gsap.timeline({ delay: 0.25 })
    .to('[data-hero-rule]', { scaleX: 1, duration: 1.4, ease: 'power3.inOut' })
    .to(metaFades, { opacity: 1, duration: 0.9, ease: 'power1.out', stagger: 0.1 }, '-=0.9')
    .fromTo(lines,
      { yPercent: 35, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      { yPercent: 0, opacity: 1, clipPath: 'inset(-20% -5% -25% -5%)', duration: 1.4, ease: 'power3.out', stagger: 0.22 }, '-=0.5')
    .to(sideFade, { opacity: 1, duration: 1.1, ease: 'power1.out' }, '-=0.8');

  /* ---------- Desktop: pinned night flight scrubbed by scroll ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
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
      big: { dir: '../../assets/hero-seq-2560/', ext: 'avif' },
      std: { dir: '../../assets/hero-seq-1920/', ext: 'avif' },
      fallback: { dir: '../../assets/hero-seq/', ext: 'webp' },
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
      .to(content, { autoAlpha: 0, y: 40, ease: 'power1.in', duration: 0.22 }, 0.62);

    return () => {
      window.removeEventListener('resize', resize);
      hero.classList.remove('is-canvas');
    };
  });

  /* ---------- Phones: the same flight as a quiet looping video, no pinning ---------- */
  mm.add('(max-width: 767px)', () => {
    playVideo();
    const st = ScrollTrigger.create({ trigger: hero, start: 'bottom 72px', onEnter: () => solidHeader(true), onLeaveBack: () => solidHeader(false) });
    return () => { video.pause(); st.kill(); };
  });
})();
