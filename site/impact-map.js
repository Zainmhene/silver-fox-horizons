/* Silver Fox Horizons: Focus section.
   - A faint dot texture (navy and copper) covers the section, a little denser at the edges, drifting slowly.
   - The map (inline SVG of real country shapes) sits centred and large. As it scrolls in, the seven hub
     countries light up one by one with a copper glow from inside (Egypt, Nigeria, Ghana, Ethiopia, Kenya,
     Rwanda, South Africa), and their cities appear: a copper point with a soft halo and a navy label tag.
   - Then thin copper arcs reach London and New York (left edge) and Dubai (right edge); small signals keep
     travelling out to the world and back to Africa, slowly, at different times.
   - Hover or tap a country to see its name. Everything pauses when the section is off screen.
   - Reduced motion: glows on, arcs drawn, no moving signals, still texture. */
(() => {
  'use strict';

  const section = document.querySelector('[data-impact]');
  const canvas = section && section.querySelector('[data-impact-canvas]');
  const svgMap = section && section.querySelector('[data-focus-svg]');
  const overlay = section && section.querySelector('[data-focus-overlay]');
  const labelsBox = section && section.querySelector('[data-focus-labels]');
  const tip = section && section.querySelector('[data-map-tip]');
  const statsEl = section && section.querySelector('[data-focus-stats]');
  const M = window.AFRICA_MASK;
  if (!section || !canvas || !svgMap || !overlay || !labelsBox || !M || !canvas.getContext) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const still = reduce || !hasGsap;
  const NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const proj = (lon, lat) => [(lon - M.lon0) * M.k, (M.lat0 - lat) * M.k];
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* ---------- Places (city order matches the glow order in the SVG) ---------- */
  const CITIES = [
    { name: 'Cairo', ll: [31.24, 30.04] },
    { name: 'Lagos', ll: [3.38, 6.52] },
    { name: 'Accra', ll: [-0.19, 5.6] },
    { name: 'Addis Ababa', ll: [38.75, 9.03] },
    { name: 'Nairobi', ll: [36.82, -1.29] },
    { name: 'Kigali', ll: [30.06, -1.95] },
    { name: 'Johannesburg', ll: [28.05, -26.2] },
  ];
  const HUBS = { london: 'London', ny: 'New York', dubai: 'Dubai' };
  // Four calm arcs, none crossing: north to London, west to New York, east and south-east to Dubai
  const ARCS = [['Cairo', 'london'], ['Accra', 'ny'], ['Addis Ababa', 'dubai'], ['Johannesburg', 'dubai']];

  /* ---------- Inside-Africa mask (for keeping labels in clear space) ---------- */
  const mask = new Uint8Array(M.cols * M.rows);
  for (const [row, ...runs] of M.runs) for (let i = 0; i < runs.length; i += 2) for (let c = runs[i]; c <= runs[i + 1]; c++) mask[row * M.cols + c] = 1;
  const inAfrica = (ux, uy) => { const c = Math.floor(ux / M.step), r = Math.floor(uy / M.step); return c >= 0 && r >= 0 && c < M.cols && r < M.rows && mask[r * M.cols + c] === 1; };

  /* ---------- Static elements created once ---------- */
  const glows = [...svgMap.querySelectorAll('.focus-glow')];
  const defs = el('defs', {}, overlay);
  defs.innerHTML =
    '<radialGradient id="fhalo"><stop offset="0" stop-color="#E9A868" stop-opacity=".6"/><stop offset="1" stop-color="#E9A868" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="fsig"><stop offset="0" stop-color="#F3BE82" stop-opacity=".85"/><stop offset=".4" stop-color="#E3A461" stop-opacity=".35"/><stop offset="1" stop-color="#E3A461" stop-opacity="0"/></radialGradient>';
  const gArcs = el('g', { class: 'focus-arcs' }, overlay);
  const gLeaders = el('g', { class: 'focus-leaders' }, overlay);
  const gSignals = el('g', { class: 'focus-signals' }, overlay);
  const gPoints = el('g', { class: 'focus-points' }, overlay);

  const pills = CITIES.map((c) => { const s = document.createElement('span'); s.className = 'focus-pill'; s.textContent = c.name; labelsBox.appendChild(s); return s; });
  const hubLabels = Object.fromEntries(Object.entries(HUBS).map(([k, n]) => { const s = document.createElement('span'); s.className = 'focus-hub'; s.textContent = n; labelsBox.appendChild(s); return [k, s]; }));

  // Point on an arc (cubic curve) at t = 0..1
  const at = (a, t) => {
    const k = 1 - t, b0 = k * k * k, b1 = 3 * k * k * t, b2 = 3 * k * t * t, b3 = t * t * t;
    return [b0 * a.ax + b1 * a.c1x + b2 * a.c2x + b3 * a.bx, b0 * a.ay + b1 * a.c1y + b2 * a.c2y + b3 * a.by];
  };

  /* ---------- Layout ---------- */
  let W = 0, H = 0, mx = 0, my = 0, mw = 0, mh = 0, s = 1, desktop = true;
  let cities = [], arcs = [], hubs = {}, signals = [];
  let cityEls = [];

  function layout() {
    const sr = section.getBoundingClientRect(), br = svgMap.getBoundingClientRect();
    W = section.clientWidth; H = section.clientHeight;
    if (!W || !H || !br.width) return false;
    mx = br.left - sr.left; my = br.top - sr.top; mw = br.width; mh = br.height; s = mw / M.w;
    desktop = W >= 900;
    overlay.setAttribute('width', W); overlay.setAttribute('height', H); overlay.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const P = (lon, lat) => { const [ux, uy] = proj(lon, lat); return [mx + ux * s, my + uy * s]; };
    cities = CITIES.map((c, i) => { const [x, y] = P(...c.ll); return { ...c, i, x, y }; });

    // Text and stats never get covered
    const keepOff = [...section.querySelectorAll('.focus-head, .focus-stats')].map((e) => {
      const b = e.getBoundingClientRect();
      return [b.left - sr.left - 12, b.top - sr.top - 12, b.right - sr.left + 12, b.bottom - sr.top + 12];
    });
    const statsBottom = keepOff.length ? Math.max(...keepOff.map((r) => r[3])) : my;

    // World hubs: section edges on desktop; close to the map on phones (shorter arcs)
    const pad = desktop ? (parseFloat(getComputedStyle(section).paddingLeft) || 40) * 0.6 : 14;
    hubs = desktop
      // (on very wide screens the hubs stay within reach of the map, so the arcs never stretch too far)
      ? { london: { x: Math.max(pad, mx - 360), y: Math.max(statsBottom + 26, my - 0.02 * mh) }, ny: { x: Math.max(pad, mx - 330), y: my + 0.47 * mh }, dubai: { x: Math.min(W - pad, mx + mw + 360), y: my + 0.3 * mh } }
      : { london: { x: pad, y: my - 40 }, ny: { x: pad, y: my - 6 }, dubai: { x: W - pad, y: my + 0.04 * mh } };

    // Arcs: gentle bows away from the continent, kept below the stats
    const ccx = mx + mw * 0.55, ccy = my + mh * 0.5;
    // phones: shorter arcs, and the Johannesburg arc is left out so the east coast stays clear for the tags
    const arcList = desktop ? ARCS : ARCS.filter(([city]) => city !== 'Johannesburg');
    arcs = arcList.map(([city, hub], j) => {
      const c = cities.find((x) => x.name === city), h = hubs[hub];
      const ax = c.x, ay = c.y, bx = h.x, by = h.y;
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      const midx = (ax + bx) / 2, midy = (ay + by) / 2;
      if (nx * (midx - ccx) + ny * (midy - ccy) < 0) { nx = -nx; ny = -ny; }
      let cx = midx + nx * 0.2 * len, cy = midy + ny * 0.2 * len;
      cy = Math.max(cy, statsBottom + 14);
      if (desktop && hub === 'ny') { cx = midx; cy = Math.max(ay, by) + 0.14 * len; } // dips south over the ocean
      // cubic curve (two handles); the London arc rises first, then travels above the continent
      let c1x = ax + (2 / 3) * (cx - ax), c1y = ay + (2 / 3) * (cy - ay), c2x = bx + (2 / 3) * (cx - bx), c2y = by + (2 / 3) * (cy - by);
      if (desktop && hub === 'london') { const top = statsBottom + 16; c1x = ax - 0.05 * Math.abs(dx); c1y = top; c2x = bx + 0.32 * (ax - bx); c2y = top; }
      return { j, hub, city, ax, ay, bx, by, c1x, c1y, c2x, c2y };
    });
    const arcPts = [];
    for (const a of arcs) for (let t = 0; t <= 1.0001; t += 0.01) arcPts.push(at(a, t));

    /* Label placement: nearest clear spot (no land, arcs, other labels or leaders, cities, text or edges) */
    const rects = [], leaders = [];
    const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    const inflate = (r, p) => [r[0] - p, r[1] - p, r[2] + p, r[3] + p];
    const inRect = (x, y, r) => x > r[0] && x < r[2] && y > r[1] && y < r[3];
    const touchesLand = (r) => { const R = inflate(r, 4); for (let y = R[1]; y <= R[3]; y += 2.5) for (let x = R[0]; x <= R[2]; x += 2.5) if (inAfrica((x - mx) / s, (y - my) / s)) return true; return false; };
    const segRect = (l, r) => { for (let t = 0; t <= 1; t += 0.03) if (inRect(l[0] + (l[2] - l[0]) * t, l[1] + (l[3] - l[1]) * t, r)) return true; return false; };
    const segsCross = (a, b) => {
      const d = (a[2] - a[0]) * (b[3] - b[1]) - (a[3] - a[1]) * (b[2] - b[0]); if (!d) return false;
      const u = ((b[0] - a[0]) * (b[3] - b[1]) - (b[1] - a[1]) * (b[2] - b[0])) / d, v = ((b[0] - a[0]) * (a[3] - a[1]) - (b[1] - a[1]) * (a[2] - a[0])) / d;
      return u > 0 && u < 1 && v > 0 && v < 1;
    };
    const distSeg = (px, py, l) => { const dx = l[2] - l[0], dy = l[3] - l[1], q = dx * dx + dy * dy || 1; const t = clamp01(((px - l[0]) * dx + (py - l[1]) * dy) / q); return Math.hypot(px - l[0] - t * dx, py - l[1] - t * dy); };
    // land = true: the label may sit over land (city tags, scored lower than open sea); hub labels need sea
    function ok(r, self, leader, land) {
      if (r[0] < 4 || r[2] > W - 4 || r[1] < 4 || r[3] > H - 4) return false;
      if (keepOff.some((k) => hit(r, k))) return false;
      if (rects.some((p) => hit(r, inflate(p, 6)))) return false;
      const R = inflate(r, 4);
      if (arcPts.some(([x, y]) => inRect(x, y, R))) return false;
      if (cities.some((c) => c !== self && inRect(c.x, c.y, inflate(r, 9)))) return false;
      if (leaders.some((l) => segRect(l, inflate(r, 3)))) return false;
      if (!land && touchesLand(r)) return false;
      if (leader) {
        if (rects.some((p) => segRect(leader, inflate(p, 3)))) return false;
        if (leaders.some((l) => segsCross(l, leader))) return false;
        if (cities.some((c) => c !== self && distSeg(c.x, c.y, leader) < 9)) return false;
        if (arcPts.some(([x, y]) => distSeg(x, y, leader) < 2)) return false;
      }
      return true;
    }
    const size = (node) => [node.offsetWidth, node.offsetHeight];

    // Hub labels sit beside their point, on whichever side is clear
    for (const [k, h] of Object.entries(hubs)) {
      const [w, hh] = size(hubLabels[k]);
      const right = k !== 'dubai';
      const opts = right
        ? [[h.x - 3, h.y - 12 - hh], [h.x + 10, h.y - hh / 2], [h.x - 3, h.y + 12]]
        : [[h.x + 3 - w, h.y - 12 - hh], [h.x - 10 - w, h.y - hh / 2], [h.x + 3 - w, h.y + 12]];
      let pick = opts.map(([x, y]) => [x, y, x + w, y + hh]).find((r) => ok(r, null, null)) || [opts[0][0], opts[0][1], opts[0][0] + w, opts[0][1] + hh];
      h.rect = pick; rects.push(pick);
    }

    // City tags: inland cities first (least room), then the coast west to east
    const ORDER = ['Kigali', 'Nairobi', 'Addis Ababa', 'Johannesburg', 'Cairo', 'Lagos', 'Accra'];
    const cityR = desktop ? 3.4 : 2.8;
    for (const c of [...cities].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name))) {
      const [w, hh] = size(pills[c.i]);
      let best = null;
      for (const d of [16, 24, 34, 46, 60, 76, 94, 116, 140, 170, 205]) {
        for (let k = 0; k < 24; k++) {
          const ang = (k / 24) * TAU, cs = Math.cos(ang), sn = Math.sin(ang);
          const ax = c.x + cs * d, ay = c.y + sn * d;
          // tag runs away from the city: right of the anchor, left of it, or centred above/below
          const mode = Math.abs(sn) > 0.85 ? 'c' : cs >= 0 ? 'r' : 'l';
          const r = mode === 'r' ? [ax, ay - hh / 2, ax + w, ay + hh / 2]
            : mode === 'l' ? [ax - w, ay - hh / 2, ax, ay + hh / 2]
            : sn < 0 ? [ax - w / 2, ay - hh, ax + w / 2, ay] : [ax - w / 2, ay, ax + w / 2, ay + hh];
          const ex = Math.min(Math.max(c.x, r[0]), r[2]), ey = Math.min(Math.max(c.y, r[1]), r[3]);
          const dl = Math.hypot(ex - c.x, ey - c.y) || 1;
          const leader = dl > cityR + 7 ? [c.x + ((ex - c.x) / dl) * (cityR + 3), c.y + ((ey - c.y) / dl) * (cityR + 3), ex, ey] : null;
          const confusing = cities.some((o) => o !== c && Math.hypot(ex - o.x, ey - o.y) < dl) ? 60 : 0;
          let score = d + 8 * Math.abs(sn) + confusing;
          if (best && score >= best.score) continue;
          if (!ok(r, c, leader, true)) continue;
          score += touchesLand(r) ? 45 : 0; // open sea preferred; over land only when it keeps the tag by its city
          if (!best || score < best.score) best = { score, r, leader };
        }
        if (best && best.score < d + 25) break;
      }
      if (!best) best = { r: [c.x + 10, c.y - 9, c.x + 10 + w, c.y + 9], leader: null };
      c.rect = best.r; c.leader = best.leader;
      rects.push(best.r); if (best.leader) leaders.push(best.leader);
    }

    draw();
    return true;
  }

  /* ---------- Build the overlay from the layout ---------- */
  function draw() {
    gArcs.textContent = ''; gLeaders.textContent = ''; gSignals.textContent = ''; gPoints.textContent = '';
    signals = [];
    for (const a of arcs) {
      a.path = el('path', { d: `M${a.ax} ${a.ay}C${a.c1x} ${a.c1y} ${a.c2x} ${a.c2y} ${a.bx} ${a.by}`, fill: 'none', stroke: '#B07A43', 'stroke-opacity': '.6', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' }, gArcs);
      a.len = a.path.getTotalLength();
      a.path.style.strokeDasharray = a.len;
      a.path.style.strokeDashoffset = arcsShown ? 0 : a.len;
      // two signals per arc: one going out to the world, one coming back to Africa
      if (!still) {
        for (const dir of [1, -1]) {
          const halo = el('circle', { r: desktop ? 6 : 5, fill: 'url(#fsig)', opacity: 0 }, gSignals);
          const core = el('circle', { r: desktop ? 1.7 : 1.4, fill: '#F2C08A', opacity: 0 }, gSignals);
          signals.push({ a, dir, halo, core, dur: (dir > 0 ? 7.5 : 9.8) + a.j * (dir > 0 ? 1.15 : 0.85), off: a.j * 1.7 + (dir > 0 ? 0 : 3.1) });
        }
      }
    }
    // hub points
    for (const [k, h] of Object.entries(hubs)) {
      el('circle', { cx: h.x, cy: h.y, r: 6.5, fill: 'none', stroke: '#B07A43', 'stroke-opacity': '.5', 'stroke-width': 1 }, gPoints);
      el('circle', { cx: h.x, cy: h.y, r: 3, fill: '#C68745' }, gPoints);
      const lab = hubLabels[k];
      lab.style.transform = `translate(${h.rect[0]}px, ${h.rect[1]}px)`;
    }
    // city points, halos, leaders and tags
    cityEls = cities.map((c) => {
      const g = el('g', { opacity: 0 }, gPoints);
      el('circle', { class: 'city-halo', cx: c.x, cy: c.y, r: desktop ? 13 : 10, fill: 'url(#fhalo)' }, g);
      el('circle', { cx: c.x, cy: c.y, r: desktop ? 3.4 : 2.8, fill: '#D3904C' }, g);
      el('circle', { cx: c.x, cy: c.y, r: 1.15, fill: '#FFE6C7' }, g);
      let line = null;
      if (c.leader) line = el('line', { x1: c.leader[0], y1: c.leader[1], x2: c.leader[2], y2: c.leader[3], stroke: '#16202F', 'stroke-opacity': '.5', 'stroke-width': '.8', opacity: 0 }, gLeaders);
      const pill = pills[c.i];
      pill.style.transform = `translate(${c.rect[0]}px, ${c.rect[1]}px)`;
      return { g, line, pill };
    });
    applyGlow(glowP);
    for (const k of Object.keys(hubs)) hubLabels[k].classList.toggle('is-on', arcsShown);
  }

  /* ---------- Glow sequence (driven by scroll) ---------- */
  let glowP = still ? 1 : 0;
  const cityT = (p, i) => clamp01(p * (CITIES.length * 0.55 + 1) - i * 0.55);
  function applyGlow(p) {
    glowP = p;
    glows.forEach((g, i) => { g.style.opacity = cityT(p, i).toFixed(3); });
    cityEls.forEach((e, i) => {
      const t = cityT(p, i), on = t > 0.55;
      e.g.setAttribute('opacity', clamp01((t - 0.3) / 0.5).toFixed(3));
      if (e.line) e.line.setAttribute('opacity', clamp01((t - 0.55) / 0.45).toFixed(3));
      e.pill.classList.toggle('is-on', on);
    });
    if (p >= 0.98) showArcs();
  }
  let arcsShown = still;
  let arcsAt = still ? -1e9 : 0;
  function showArcs() {
    if (arcsShown) return;
    arcsShown = true;
    arcsAt = performance.now();
    arcs.forEach((a, j) => {
      a.path.style.transition = `stroke-dashoffset 1.9s cubic-bezier(.65,0,.35,1) ${j * 0.22}s`;
      a.path.style.strokeDashoffset = 0;
    });
    setTimeout(() => Object.values(hubLabels).forEach((l) => l.classList.add('is-on')), 1500);
  }

  /* ---------- Signals and texture (one loop, only while on screen) ---------- */
  const ctx = canvas.getContext('2d');
  let dots = [], dpr = 1, lastTex = 0;
  function initTexture() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    let seed = 20261122;
    const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    dots = [];
    const tries = Math.round(W * H * (desktop ? 0.0042 : 0.0048));
    for (let k = 0; k < tries; k++) {
      const x = rnd() * W, y = rnd() * H;
      const ex = Math.abs(x / W - 0.5) * 2, ey = Math.abs(y / H - 0.5) * 2;
      if (rnd() > 0.45 + 0.55 * Math.pow(Math.max(ex, ey), 1.6)) continue; // a little denser towards the edges
      const copper = rnd() < 0.24;
      const ang = rnd() * TAU, sp = 2 + rnd() * 4; // px per second: a slow drift
      dots.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 0.75 + rnd() * 0.8, c: copper ? 1 : 0, a: copper ? 0.12 + rnd() * 0.12 : 0.07 + rnd() * 0.09 });
    }
  }
  function drawTexture(dt) {
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
  function drawSignals(now) {
    const since = (now - arcsAt) / 1000;
    for (const sg of signals) {
      const a = sg.a;
      const drawn = clamp01((since - 2.1 - a.j * 0.22) / 0.8); // start once the arc has finished drawing
      if (!arcsShown || drawn <= 0) { sg.halo.setAttribute('opacity', 0); sg.core.setAttribute('opacity', 0); continue; }
      let u = ((now / 1000 + sg.off) % sg.dur) / sg.dur;
      const [x, y] = at(a, sg.dir > 0 ? u : 1 - u);
      const vis = Math.sin(Math.PI * u) * drawn;
      sg.halo.setAttribute('cx', x.toFixed(1)); sg.halo.setAttribute('cy', y.toFixed(1)); sg.halo.setAttribute('opacity', (vis * 0.9).toFixed(3));
      sg.core.setAttribute('cx', x.toFixed(1)); sg.core.setAttribute('cy', y.toFixed(1)); sg.core.setAttribute('opacity', vis.toFixed(3));
    }
  }
  let visible = false, raf = 0, lastNow = 0;
  function frame(now) {
    raf = 0;
    if (!visible) return;
    if (now - lastTex > 33) { drawTexture(lastTex ? Math.min(0.1, (now - lastTex) / 1000) : 0); lastTex = now; }
    drawSignals(now);
    lastNow = now;
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Hover / tap: country name ---------- */
  if (tip) {
    const show = (path, x, y) => {
      const r = section.getBoundingClientRect();
      tip.textContent = path.dataset.country;
      tip.style.left = `${x - r.left}px`; tip.style.top = `${y - r.top}px`;
      tip.classList.add('is-on');
    };
    svgMap.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const p = e.target.closest && e.target.closest('[data-country]');
      if (p) show(p, e.clientX, e.clientY); else tip.classList.remove('is-on');
    });
    svgMap.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
    let tapTimer;
    svgMap.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const p = e.target.closest && e.target.closest('[data-country]');
      if (!p) return;
      svgMap.querySelectorAll('.is-tapped').forEach((n) => n.classList.remove('is-tapped'));
      p.classList.add('is-tapped');
      show(p, e.clientX, e.clientY);
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tip.classList.remove('is-on'); p.classList.remove('is-tapped'); }, 1800);
    });
  }

  /* ---------- Stats: count once ---------- */
  const counts = [...section.querySelectorAll('[data-count]')];
  let counted = false;
  function countStats() {
    if (counted) return;
    counted = true;
    counts.forEach((n, i) => {
      const target = parseInt(n.dataset.count, 10) || 0;
      if (still) { n.textContent = String(target); return; }
      if (target === 0) {
        // placeholder "00": settles gently into place, no fake numbers flash by
        window.gsap.fromTo(n, { opacity: 0.15, y: 6 }, { opacity: 1, y: 0, duration: 1.2, delay: i * 0.18, ease: 'power2.out' });
        return;
      }
      const o = { v: 0 };
      window.gsap.to(o, { v: target, duration: 1.8, delay: i * 0.18, ease: 'power2.out', onUpdate: () => { n.textContent = String(Math.round(o.v)); } });
    });
  }
  // With motion, numbers start at 0 and count up on entry (the HTML holds the final value for no-JS)
  // (min-width keeps the row from shifting as digits are added)
  if (!still) counts.forEach((n) => {
    if (!parseInt(n.dataset.count, 10)) return;
    n.style.minWidth = n.getBoundingClientRect().width + 'px';
    n.textContent = '0';
  });

  /* ---------- Start ---------- */
  const relayout = () => { if (layout()) { initTexture(); drawTexture(0); } };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(relayout);
  let rId; window.addEventListener('resize', () => { clearTimeout(rId); rId = setTimeout(relayout, 140); });
  relayout();

  if (still) {
    section.classList.add('is-in');
    countStats();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener('refresh', relayout);
  ScrollTrigger.create({ trigger: statsEl || section, start: 'top 85%', once: true, onEnter: () => { section.classList.add('is-in'); countStats(); } });
  ScrollTrigger.create({
    // glows finish as the whole map comes into view; the arcs follow
    trigger: svgMap, start: 'top 80%', end: 'bottom 98%', scrub: 0.6,
    onUpdate: (st) => applyGlow(Math.max(glowP, st.progress)), // lights stay on once lit
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    section.classList.toggle('is-paused', !visible);
    if (visible && !raf) { lastTex = 0; raf = requestAnimationFrame(frame); }
  }, { rootMargin: '80px 0px' }).observe(section);
})();
