/* Faint drifting dot texture for cream sections (same settings as the Focus/map section in impact-map.js):
   navy and copper dots, low opacity, a little denser towards the edges, drifting slowly.
   Usage: <canvas class="dot-canvas" aria-hidden="true" data-dot-texture></canvas> as the first child of a section.
   Runs only while the section is on screen. Reduced motion: drawn once, no drift. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-dot-texture]').forEach((canvas, n) => {
    const section = canvas.parentElement;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!section || !ctx) return;

    let W = 0, H = 0, dpr = 1, dots = [];
    function init() {
      W = section.clientWidth; H = section.clientHeight;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      let seed = 20261122 + n * 7919;
      const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      dots = [];
      const tries = Math.round(W * H * (W >= 900 ? 0.0042 : 0.0048));
      for (let k = 0; k < tries; k++) {
        const x = rnd() * W, y = rnd() * H;
        const ex = Math.abs(x / W - 0.5) * 2, ey = Math.abs(y / H - 0.5) * 2;
        if (rnd() > 0.45 + 0.55 * Math.pow(Math.max(ex, ey), 1.6)) continue; // a little denser towards the edges
        const copper = rnd() < 0.24;
        const ang = rnd() * TAU, sp = 2 + rnd() * 4; // px per second: a slow drift
        dots.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 0.75 + rnd() * 0.8, c: copper ? 1 : 0, a: copper ? 0.12 + rnd() * 0.12 : 0.07 + rnd() * 0.09 });
      }
    }
    function draw(dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const groups = new Map();
      for (const d of dots) {
        if (dt) {
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.x < -2) d.x += W + 4; else if (d.x > W + 2) d.x -= W + 4;
          if (d.y < -2) d.y += H + 4; else if (d.y > H + 2) d.y -= H + 4;
        }
        const key = d.c * 100 + Math.round(d.a * 50);
        let l = groups.get(key); if (!l) groups.set(key, (l = [])); l.push(d);
      }
      for (const [key, l] of groups) {
        const copper = key >= 100, a = (key % 100) / 50;
        ctx.fillStyle = copper ? `rgba(176,122,67,${a})` : `rgba(22,32,47,${a})`;
        ctx.beginPath();
        for (const d of l) { ctx.moveTo(d.x + d.r, d.y); ctx.arc(d.x, d.y, d.r, 0, TAU); }
        ctx.fill();
      }
    }

    let visible = false, raf = 0, last = 0;
    function frame(now) {
      raf = 0;
      if (!visible) return;
      if (now - last > 33) { draw(last ? Math.min(0.1, (now - last) / 1000) : 0); last = now; }
      raf = requestAnimationFrame(frame);
    }
    const relayout = () => { init(); draw(0); };
    relayout();
    if (document.fonts) document.fonts.ready.then(relayout);
    // Section height changes (fonts, images, breakpoints): rebuild the dots to fit
    let lastSize = '';
    new ResizeObserver(() => {
      const size = section.clientWidth + 'x' + section.clientHeight;
      if (size !== lastSize) { lastSize = size; relayout(); }
    }).observe(section);

    if (reduce) return;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '80px 0px' }).observe(section);
  });
})();
