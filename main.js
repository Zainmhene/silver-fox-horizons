/* Silver Fox Horizons: homepage demo interactions
   Slow and smooth only. Everything respects prefers-reduced-motion. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid background after leaving the top ---------- */
  const header = document.querySelector('[data-header]');
  const updateHeader = () => header.classList.toggle('is-solid', window.scrollY > 40);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const toggleLabel = document.querySelector('[data-menu-label]');
  let closeTimer;

  const menuIsOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  function openMenu() {
    clearTimeout(closeTimer);
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = 'Close menu';
    document.body.classList.add('menu-open');
    const first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = 'Open menu';
    document.body.classList.remove('menu-open');
    closeTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 500);
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => (menuIsOpen() ? closeMenu(true) : openMenu()));
  menu.querySelectorAll('[data-menu-link]').forEach((link) => link.addEventListener('click', () => closeMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (!menuIsOpen()) return;
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the menu (toggle + menu links)
    const items = [toggle, ...menu.querySelectorAll('a')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && menuIsOpen()) closeMenu(false);
  });

  /* ---------- Videos: load only when near the viewport ---------- */
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; });
    video.load();
    video.dataset.loaded = '1';
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          loadVideo(target);
          target.play().catch(() => {});
        } else if (target.dataset.loaded) {
          target.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('[data-lazy-video]').forEach((v) => videoObserver.observe(v));
  }

  /* ---------- Hero elements ---------- */
  const hero = document.querySelector('[data-hero]');
  const heroVideo = hero.querySelector('[data-hero-video]');
  const heroCanvas = hero.querySelector('[data-hero-canvas]');
  const heroContent = hero.querySelector('[data-hero-content]');
  const scrollCue = hero.querySelector('[data-scroll-cue]');

  function playHeroVideo() {
    loadVideo(heroVideo);
    heroVideo.play().catch(() => {});
  }

  /* ---------- Without GSAP (CDN failed): show everything, keep it simple ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    if (!reduceMotion) playHeroVideo();
    document.querySelectorAll('[data-value], [data-step]').forEach((el) => el.classList.add('is-active'));
    document.querySelector('[data-steps]').style.setProperty('--p', 1);
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const hasSplit = !!window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(window.SplitText);

  /* ---------- Reduced motion: final states, no scroll effects ---------- */
  if (reduceMotion) {
    document.querySelectorAll('[data-value], [data-step]').forEach((el) => el.classList.add('is-active'));
    document.querySelector('[data-steps]').style.setProperty('--p', 1);
    return;
  }

  /* ---------- Reusable animations ---------- */
  const EASE = 'power3.out';

  // Thin gold line draws in, then the label text appears
  function labelTimeline(label) {
    return gsap.timeline()
      .to(label.querySelector('.rule'), { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
      .to(label.querySelector('.label-text'), { opacity: 1, duration: 0.8, ease: 'power1.out' }, '-=0.3');
  }

  // Line-by-line rise, revealed from behind a clip
  const lineFrom = { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 55 };
  const lineTo = { clipPath: 'inset(-30% -5% -30% -5%)', yPercent: 0, duration: 1.4, ease: EASE, stagger: 0.14 };

  function splitReveal(el) {
    const trigger = { trigger: el, start: 'top 85%', once: true };
    if (!hasSplit) {
      gsap.set(el, { visibility: 'visible', opacity: 0 });
      gsap.to(el, { opacity: 1, duration: 1.2, ease: 'power1.out', scrollTrigger: trigger });
      return;
    }
    window.SplitText.create(el, {
      type: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.fromTo(self.lines, lineFrom, { ...lineTo, scrollTrigger: trigger });
      },
    });
  }

  function init() {
    /* Hero intro: label, then the two headline lines, then the short line and button */
    const heroLabel = hero.querySelector('[data-label]');
    const heroLines = hero.querySelectorAll('[data-hero-line]');
    const heroFades = hero.querySelectorAll('[data-hero-fade]');
    gsap.set(heroLines, { visibility: 'visible' });
    gsap.timeline({ delay: 0.3 })
      .add(labelTimeline(heroLabel))
      .fromTo(heroLines, lineFrom, { ...lineTo, stagger: 0.25 }, '-=0.5')
      .to(heroFades, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.15 }, '-=0.6');

    /* Hero film */
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1px)', () => {
      const FRAME_COUNT = 120;
      const frames = new Array(FRAME_COUNT);
      const loaded = new Array(FRAME_COUNT).fill(false);
      const ctx = heroCanvas.getContext('2d');
      const state = { frame: 0 };
      let lastDrawn = -1;

      hero.classList.add('is-canvas');
      heroVideo.pause();

      const frameSrc = (i) => `assets/hero-frames/frame-${String(i + 1).padStart(3, '0')}.webp`;

      function nearestLoaded(i) {
        for (let d = 0; d < FRAME_COUNT; d++) {
          if (loaded[i - d]) return i - d;
          if (loaded[i + d]) return i + d;
        }
        return -1;
      }

      function render(force) {
        const i = nearestLoaded(Math.round(state.frame));
        if (i < 0 || (i === lastDrawn && !force)) return;
        const img = frames[i];
        const cw = heroCanvas.width;
        const ch = heroCanvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        lastDrawn = i;
      }

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        heroCanvas.width = Math.round(heroCanvas.clientWidth * dpr);
        heroCanvas.height = Math.round(heroCanvas.clientHeight * dpr);
        render(true);
      }

      // Load every 4th frame first so scrubbing works early, then fill the gaps
      const order = [];
      for (let i = 0; i < FRAME_COUNT; i += 4) order.push(i);
      for (let i = 0; i < FRAME_COUNT; i++) if (i % 4) order.push(i);
      order.forEach((i) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          loaded[i] = true;
          if (Math.abs(i - Math.round(state.frame)) <= 4) render(true);
        };
        img.src = frameSrc(i);
        frames[i] = img;
      });

      resize();
      window.addEventListener('resize', resize);

      const film = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
      film
        .to(state, { frame: FRAME_COUNT - 1, ease: 'none', duration: 1, onUpdate: () => render(false) }, 0)
        .to(scrollCue, { autoAlpha: 0, duration: 0.06 }, 0)
        .to(heroContent, { autoAlpha: 0, y: -40, ease: 'power1.in', duration: 0.22 }, 0.58);

      return () => {
        window.removeEventListener('resize', resize);
        hero.classList.remove('is-canvas');
      };
    });

    /* Labels outside the hero */
    document.querySelectorAll('[data-label]').forEach((label) => {
      if (hero.contains(label)) return;
      ScrollTrigger.create({ trigger: label, start: 'top 88%', once: true, onEnter: () => labelTimeline(label) });
    });

    /* Headlines and the mandate: line by line */
    document.querySelectorAll('[data-split]').forEach(splitReveal);

    /* Paragraphs, links and list items: quiet fade */
    ScrollTrigger.batch('[data-fade]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.15, delay: 0.25 }),
    });

    /* Slow zoom on scroll, max 8% */
    document.querySelectorAll('[data-zoom]').forEach((el) => {
      gsap.fromTo(el, { scale: 1 }, {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('.panel, .about-visual') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* About: values turn gold one by one */
    const values = document.querySelectorAll('[data-value]');
    ScrollTrigger.create({
      trigger: '[data-about]',
      start: 'top 55%',
      end: 'bottom 70%',
      onUpdate: (self) => values.forEach((li, i) => li.classList.toggle('is-active', self.progress > 0.12 + i * 0.28)),
    });

    /* Approach: gold line draws between the steps */
    const stepsEl = document.querySelector('[data-steps]');
    const steps = stepsEl.querySelectorAll('[data-step]');
    gsap.fromTo(stepsEl, { '--p': 0 }, {
      '--p': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stepsEl,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 1,
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-active', self.progress > i * 0.25 + 0.001)),
      },
    });
  }

  // Split text only after the web fonts are in, so line breaks are correct
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(init);
})();
