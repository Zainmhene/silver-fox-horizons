/* Silver Fox Horizons — Direction 05: SOVEREIGN
   Generative guilloche (rosettes, wave bands, frames), engraved map, reveals, menu.
   Everything here is decoration or enhancement: the page reads fully without it. */
(() => {
  'use strict';
  window.__sfhReady = true;

  const doc = document;
  const TAU = Math.PI * 2;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const r1 = (n) => Math.round(n * 10) / 10;

  function el(tag, attrs, parent) {
    const e = doc.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- Guilloche geometry ---------- */
  const circlePath = (r) => `M${r} 0A${r} ${r} 0 1 1 ${-r} 0A${r} ${r} 0 1 1 ${r} 0Z`;

  // Closed polar curve r(t)
  function polar(fn, steps = 900) {
    let d = '';
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * TAU;
      const r = fn(t);
      d += (i ? 'L' : 'M') + r1(r * Math.cos(t)) + ' ' + r1(r * Math.sin(t));
    }
    return d + 'Z';
  }

  // Spirograph: sum of rotating vectors [amplitude, integer frequency, phase]
  function spiro(terms, steps = 1800) {
    let d = '';
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * TAU;
      let x = 0, y = 0;
      for (const [a, k, ph = 0] of terms) { x += a * Math.cos(k * t + ph); y += a * Math.sin(k * t + ph); }
      d += (i ? 'L' : 'M') + r1(x) + ' ' + r1(y);
    }
    return d + 'Z';
  }

  // Add a path; opts: op, w, rot, cls, draw, delay, dur
  function add(g, d, o = {}) {
    const p = el('path', { d }, g);
    if (o.op != null) p.setAttribute('stroke-opacity', o.op);
    if (o.w != null) p.setAttribute('stroke-width', o.w);
    if (o.rot) p.setAttribute('transform', `rotate(${o.rot.toFixed(3)})`);
    if (o.cls) p.setAttribute('class', o.cls);
    if (o.draw && !reduce) {
      p.setAttribute('pathLength', '1');
      p.classList.add('dr');
      if (o.delay) p.style.setProperty('--d', Math.round(o.delay) + 'ms');
      if (o.dur) p.style.setProperty('--dur', Math.round(o.dur) + 'ms');
    }
    return p;
  }

  // Trigger line-drawing on a container once its initial state has painted
  function drawNow(node) {
    if (reduce) { node.classList.add('is-drawn'); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-drawn')));
  }

  /* ---------- Brand mark ---------- */
  function buildMark(svg) {
    const g = el('g', null, svg);
    add(g, circlePath(46), { op: 0.9, w: 2.6 });
    add(g, circlePath(40), { op: 0.5, w: 1.6 });
    const s = spiro([[22, 1], [13, -7]], 420);
    for (let k = 0; k < 5; k++) add(g, s, { op: 0.75, w: 1.8, rot: (k * (360 / 8)) / 5 });
    add(g, circlePath(5), { op: 0.9, w: 2 });
  }

  /* ---------- Hero medallion ---------- */
  function buildMedallion(svg) {
    const size = svg.getBoundingClientRect().width || 600;
    const small = size < 480;
    const W = small ? 1.5 : 0.95; // hairline in viewBox units
    const g = el('g', null, svg);

    add(g, circlePath(458), { op: 0.75, w: W * 1.6, draw: 1, delay: 0, dur: 2600 });
    add(g, circlePath(450), { op: 0.35, w: W, draw: 1, delay: 160, dur: 2600 });

    // Rope band
    const rope = polar((t) => 415 + 27 * Math.sin(36 * t), 1080);
    const nR = small ? 5 : 7;
    for (let k = 0; k < nR; k++) add(g, rope, { op: 0.55, w: W, rot: (k * (360 / 36)) / nR, draw: 1, delay: 380 + k * 110, dur: 3400 });

    add(g, circlePath(381), { op: 0.75, w: W * 1.6, draw: 1, delay: 700, dur: 2600 });
    add(g, circlePath(374), { op: 0.35, w: W, draw: 1, delay: 820, dur: 2600 });

    // Main rosette field: hypotrochoid loops
    const main = spiro([[250, 1], [111, -13]], 2200);
    const nM = small ? 6 : 9;
    for (let k = 0; k < nM; k++) add(g, main, { op: small ? 0.4 : 0.5, w: W, rot: (k * (360 / 14)) / nM, draw: 1, delay: 1100 + k * 150, dur: 4200 });

    // Cream counter-family, very faint, for a second ink
    const counter = spiro([[300, 1], [52, 27]], 2200);
    const nC = small ? 2 : 4;
    for (let k = 0; k < nC; k++) add(g, counter, { op: 0.16, w: W, cls: 'cream', rot: (k * (360 / 26)) / nC, draw: 1, delay: 1900 + k * 160, dur: 4200 });

    add(g, circlePath(132), { op: 0.75, w: W * 1.6, draw: 1, delay: 2000, dur: 2200 });
    add(g, circlePath(125), { op: 0.35, w: W, draw: 1, delay: 2100, dur: 2200 });

    // Core
    const core = spiro([[74, 1], [40, -9]], 900);
    const nK = small ? 4 : 6;
    for (let k = 0; k < nK; k++) add(g, core, { op: 0.6, w: W, rot: (k * (360 / 10)) / nK, draw: 1, delay: 2400 + k * 120, dur: 3000 });
    add(g, circlePath(20), { op: 0.85, w: W * 1.4, draw: 1, delay: 3000, dur: 1600 });
    add(g, circlePath(3), { op: 1, w: W * 2, cls: 'cream' });
  }

  /* ---------- Guilloche wave bands (section dividers) ---------- */
  function buildBand(host, animate) {
    const w = Math.round(host.clientWidth);
    const h = Math.round(host.clientHeight) || 56;
    if (!w) return;
    host.textContent = '';
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: '100%', preserveAspectRatio: 'none', focusable: 'false' }, host);
    if (animate) svg.setAttribute('data-draw', '');
    // Fine interference lattice with a slow swell: two families whose amplitudes trade places
    const mid = h / 2;
    const s = (h / 2 - 3) / 24;
    const lam = 72, Lam = Math.max(360, Math.min(560, w / 2.6));
    const N = 9;
    for (let fam = 0; fam < 2; fam++) {
      for (let k = 0; k < N; k++) {
        const ph = (k / N) * TAU + (fam ? Math.PI / N : 0);
        let d = '';
        for (let x = 0; x <= w; x += 2) {
          const sw = 8 * Math.sin((TAU * x) / Lam);
          const a = s * (16 + (fam ? -sw : sw));
          d += (x ? 'L' : 'M') + x + ' ' + r1(mid + a * Math.sin((TAU * x) / lam + ph));
        }
        add(svg, d, { op: fam ? 0.2 : 0.3, w: 0.6, draw: animate, delay: k * 70 + fam * 260, dur: 3400 });
      }
    }
    return svg;
  }

  /* ---------- Certificate frames (guilloche rope along a rounded rectangle) ---------- */
  function roundRect(x, y, w, h, r) {
    const a = (Math.PI * r) / 2, L0 = w - 2 * r, L1 = h - 2 * r;
    const P = 2 * (L0 + L1) + 4 * a;
    function at(s) {
      s = ((s % P) + P) % P;
      if (s < L0) return [x + r + s, y, 0, -1]; s -= L0;
      if (s < a) { const t = -Math.PI / 2 + s / r; return [x + w - r + r * Math.cos(t), y + r + r * Math.sin(t), Math.cos(t), Math.sin(t)]; } s -= a;
      if (s < L1) return [x + w, y + r + s, 1, 0]; s -= L1;
      if (s < a) { const t = s / r; return [x + w - r + r * Math.cos(t), y + h - r + r * Math.sin(t), Math.cos(t), Math.sin(t)]; } s -= a;
      if (s < L0) return [x + w - r - s, y + h, 0, 1]; s -= L0;
      if (s < a) { const t = Math.PI / 2 + s / r; return [x + r + r * Math.cos(t), y + h - r + r * Math.sin(t), Math.cos(t), Math.sin(t)]; } s -= a;
      if (s < L1) return [x, y + h - r - s, -1, 0]; s -= L1;
      const t = Math.PI + s / r; return [x + r + r * Math.cos(t), y + r + r * Math.sin(t), Math.cos(t), Math.sin(t)];
    }
    return { P, at };
  }

  function buildFrame(svg) {
    const rect = svg.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return;
    const key = w + 'x' + h;
    if (svg.dataset.key === key) return;
    svg.dataset.key = key;
    const animate = !svg.dataset.drawnOnce;
    svg.textContent = '';
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    if (animate) svg.setAttribute('data-draw', '');
    const lg = svg.dataset.frameSize === 'lg';
    const mid = lg ? 15 : 11;   // band centre inset
    const amp = lg ? 5.5 : 4;
    const inner = mid + amp + (lg ? 7 : 5);
    const anim = animate && !reduce;

    add(svg, `M.5 .5H${w - 0.5}V${h - 0.5}H.5Z`, { op: 0.6, w: 1, draw: anim, dur: 2400 });
    const rr = roundRect(mid, mid, w - 2 * mid, h - 2 * mid, 8);
    const n = Math.max(24, Math.round(rr.P / (lg ? 13 : 10.5)));
    const phases = lg ? 5 : 4;
    const steps = Math.ceil(rr.P / 2);
    for (let k = 0; k < phases; k++) {
      const ph = (k / phases) * Math.PI;
      let d = '';
      for (let i = 0; i <= steps; i++) {
        const s = (i / steps) * rr.P;
        const [px, py, nx, ny] = rr.at(s);
        const o = amp * Math.sin((TAU * n * s) / rr.P + ph);
        d += (i ? 'L' : 'M') + r1(px + nx * o) + ' ' + r1(py + ny * o);
      }
      add(svg, d + 'Z', { op: 0.34, w: 0.6, draw: anim, delay: 200 + k * 140, dur: 3000 });
    }
    add(svg, `M${inner} ${inner}H${w - inner}V${h - inner}H${inner}Z`, { op: 0.4, w: 0.8, draw: anim, delay: 500, dur: 2600 });

    // Corner rosettes
    const cr = lg ? 9 : 7;
    const rosette = spiro([[cr * 0.62, 1], [cr * 0.38, -5]], 180);
    [[inner, inner], [w - inner, inner], [w - inner, h - inner], [inner, h - inner]].forEach(([cx, cy]) => {
      const g = el('g', { transform: `translate(${cx} ${cy})` }, svg);
      el('circle', { r: cr + 2.5, fill: lg ? '#0E201A' : '#0A1612', stroke: 'none' }, g);
      for (let k = 0; k < 3; k++) add(g, rosette, { op: 0.7, w: 0.6, rot: k * 24 });
      add(g, circlePath(cr + 2.5), { op: 0.5, w: 0.7 });
    });
    if (anim) {
      svg.dataset.drawnOnce = '1';
      watchDraw(svg);
    }
  }

  /* ---------- Banknote portrait window: elliptical rope ---------- */
  function buildOval(svg) {
    const cx = 200, cy = 250;
    const rx0 = 148, ry0 = 195; // window radii in viewBox units (matches CSS insets)
    svg.setAttribute('data-draw', '');
    const ell = (rx, ry, fn, steps = 900) => {
      let d = '';
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * TAU - Math.PI / 2; // start at the top
        const c = Math.cos(t), s = Math.sin(t);
        let nx = c / rx, ny = s / ry; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
        const o = fn ? fn(t) : 0;
        d += (i ? 'L' : 'M') + r1(cx + rx * c + nx * o) + ' ' + r1(cy + ry * s + ny * o);
      }
      return d + 'Z';
    };
    add(svg, ell(rx0 + 2.5, ry0 + 2.5), { op: 0.75, w: 0.9, draw: 1, dur: 2600 });
    add(svg, ell(rx0 + 6, ry0 + 6), { op: 0.3, w: 0.6, draw: 1, delay: 100, dur: 2600 });
    for (let k = 0; k < 5; k++) {
      const ph = (k / 5) * Math.PI;
      add(svg, ell(rx0 + 15, ry0 + 15, (t) => 4.2 * Math.sin(124 * t + ph), 2400), { op: 0.26, w: 0.5, draw: 1, delay: 200 + k * 140, dur: 3200 });
    }
    add(svg, ell(rx0 + 24, ry0 + 24), { op: 0.6, w: 0.8, draw: 1, delay: 400, dur: 2600 });
    // Microtext along the oval, fitted so the repeat closes cleanly at the top
    const id = 'oval-text-path';
    const defs = el('defs', null, svg);
    const ra = rx0 + 33, rb = ry0 + 33;
    const perim = Math.PI * (3 * (ra + rb) - Math.sqrt((3 * ra + rb) * (ra + 3 * rb)));
    el('path', { id, d: ell(ra, rb).replace(/Z$/, '') }, defs);
    const unit = 'SILVER FOX HORIZONS · STRATEGIC ADVISORY · ';
    const reps = Math.max(1, Math.floor(perim / (unit.length * 5.6)));
    const text = el('text', { class: 'oval-text', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '6.2', fill: '#C7A35B', 'fill-opacity': '0.62' }, svg);
    const tp = el('textPath', { href: '#' + id, textLength: String(Math.round(perim - 6)), lengthAdjust: 'spacing' }, text);
    tp.textContent = unit.repeat(reps).trim();
    watchDraw(svg);
  }

  /* ---------- Seals (values, contact) ---------- */
  let sealId = 0;
  function buildSeal(svg, kind) {
    const id = 'seal-path-' + (++sealId);
    const defs = el('defs', null, svg);
    el('path', { id, d: 'M0 -80A80 80 0 1 1 0 80A80 80 0 1 1 0 -80' }, defs);
    const foil = kind === 'contact';
    const ink = foil ? '#0A1612' : '#C7A35B';
    if (foil) {
      const lg = el('linearGradient', { id: id + '-foil', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
      [['0', '#8C7038'], ['0.28', '#D9BD7B'], ['0.46', '#F3E1AA'], ['0.62', '#C7A35B'], ['0.82', '#977939'], ['1', '#C9A962']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, lg));
    }
    const g = el('g', { filter: 'url(#emboss)' }, svg);
    el('path', { d: polar((t) => 110 + 2.4 * Math.sin(96 * t), 960), fill: foil ? `url(#${id}-foil)` : '#11251E', stroke: foil ? '#7A6030' : '#C7A35B', 'stroke-width': 1.3, 'stroke-opacity': 0.95 }, g);
    const lines = el('g', { fill: 'none', stroke: ink }, g);
    add(lines, circlePath(101), { op: 0.85, w: 1.2 });
    add(lines, circlePath(96), { op: 0.45, w: 0.7 });
    add(lines, circlePath(66), { op: 0.85, w: 1.1 });
    add(lines, circlePath(61), { op: 0.45, w: 0.7 });
    const s = spiro([[44, 1], [15, -11]], 720);
    for (let k = 0; k < 5; k++) add(lines, s, { op: 0.6, w: 0.7, rot: (k * (360 / 12)) / 5 });
    add(lines, circlePath(27), { op: 0.8, w: 0.9 });
    const text = el('text', { 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11.5', 'font-weight': '500', fill: foil ? '#1A231B' : '#D8BC7A' }, g);
    const tp = el('textPath', { href: '#' + id, textLength: String(Math.round(TAU * 80 - 4)), lengthAdjust: 'spacing' }, text);
    tp.textContent = kind === 'contact'
      ? 'SILVER FOX HORIZONS ✦ STRATEGIC ADVISORY ✦ '
      : 'TRUSTED ADVISOR ✦ GLOBAL PERSPECTIVE ✦ AFRICAN FOCUS ✦ ';
    const mono = el('text', { x: 0, y: 6.5, 'text-anchor': 'middle', 'font-family': 'Libre Caslon Display, Georgia, serif', 'font-size': '19', fill: foil ? '#0A1612' : '#EDE5D3', 'letter-spacing': '0.5' }, g);
    mono.textContent = 'SFH';
  }

  /* ---------- Denomination underprints ---------- */
  function buildMini(svg, kind) {
    const g = el('g', null, svg);
    const W = 0.7;
    add(g, circlePath(96), { op: 0.22, w: W });
    add(g, circlePath(92), { op: 0.12, w: W });
    let shape, n, step;
    if (kind === 'a') { shape = spiro([[58, 1], [30, -11]], 900); n = 8; step = 360 / 12; }
    else if (kind === 'b') { shape = polar((t) => 66 + 20 * Math.sin(18 * t), 900); n = 7; step = 360 / 18; }
    else if (kind === 'c') { shape = spiro([[54, 1], [26, 13]], 900); n = 7; step = 360 / 12; }
    else { shape = spiro([[60, 1], [24, -17]], 900); n = 8; step = 360 / 18; }
    for (let k = 0; k < n; k++) add(g, shape, { op: 0.15, w: W, rot: (k * step) / n });
    add(g, circlePath(22), { op: 0.55, w: 0.8 });
    add(g, circlePath(19), { op: 0.25, w: 0.6 });
  }

  /* ---------- Approach: the instrument gains a layer at each stage ---------- */
  function buildStage(svg, stage) {
    svg.setAttribute('data-draw', '');
    const W = 0.9;
    const layers = [
      (g, op, dl) => { add(g, circlePath(96), { op, w: 1.3, draw: 1, delay: dl, dur: 2000 }); add(g, circlePath(91), { op: op * 0.6, w: W, draw: 1, delay: dl + 120, dur: 2000 }); },
      (g, op, dl) => { const r = polar((t) => 80 + 7 * Math.sin(28 * t), 900); for (let k = 0; k < 5; k++) add(g, r, { op, w: W, rot: (k * (360 / 28)) / 5, draw: 1, delay: dl + k * 100, dur: 2400 }); },
      (g, op, dl) => { const s = spiro([[46, 1], [22, -12]], 1100); for (let k = 0; k < 6; k++) add(g, s, { op: op * 0.85, w: W, rot: (k * (360 / 13)) / 6, draw: 1, delay: dl + k * 110, dur: 2800 }); },
      (g, op, dl) => { add(g, circlePath(22), { op, w: 1.1, draw: 1, delay: dl, dur: 1600 }); const c = spiro([[12, 1], [7, -6]], 400); for (let k = 0; k < 5; k++) add(g, c, { op, w: W, rot: (k * (360 / 7)) / 5, draw: 1, delay: dl + 100 + k * 90, dur: 2000 }); }
    ];
    for (let i = 0; i < stage; i++) {
      const current = i === stage - 1;
      const g = el('g', { class: current ? 'layer-new' : 'layer-old' }, svg);
      layers[i](g, current ? 0.66 : 0.24, current ? 500 : i * 120);
    }
    // centre point: the instrument is issued at stage IV
    if (stage === 4) el('circle', { r: 2.6, fill: '#EDE5D3' }, svg);
    watchDraw(svg);
  }

  /* ---------- Engraved map ---------- */
  const ENGAGED = ['nigeria', 'ghana', 'senegal', "cote d'ivoire", 'sierra leone', 'liberia', 'benin', 'togo', 'cameroon', 'gabon',
    'kenya', 'rwanda', 'ethiopia', 'tanzania', 'uganda', 'south africa', 'egypt', 'morocco', 'dem. rep. congo', 'angola',
    'zambia', 'botswana', 'namibia', 'mozambique'];
  const LABELS = {
    Casablanca: [-13, 5, 'end'], Cairo: [13, 5, 'start'], Dakar: [-13, 5, 'end'], Accra: [-11, 18, 'end'],
    Lagos: [6, 24, 'start'], Abuja: [13, -6, 'start'], 'Addis Ababa': [13, 5, 'start'], Nairobi: [13, 9, 'start'],
    Kigali: [-13, -5, 'end'], Kinshasa: [-13, -3, 'end'], Luanda: [-13, 8, 'end'], Johannesburg: [13, 5, 'start']
  };
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  async function buildMap(svg) {
    const get = (f) => fetch('assets/' + f).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });
    let countries, borders, outline, places;
    try {
      [countries, borders, outline, places] = await Promise.all([
        get('africa-countries.geo.json'), get('africa-borders.geo.json'), get('africa-outline.geo.json'), get('places.json')
      ]);
    } catch (e) { return; }

    const K = 10, LON0 = -26, LAT0 = 38, W = 850, H = 740;
    const P = ([lon, lat]) => r1((lon - LON0) * K) + ' ' + r1((LAT0 - lat) * K);
    const ring = (pts, close) => 'M' + pts.map(P).join('L') + (close ? 'Z' : '');
    const geomPath = (gm) => {
      if (!gm) return '';
      if (gm.type === 'Polygon') return gm.coordinates.map((r) => ring(r, true)).join('');
      if (gm.type === 'MultiPolygon') return gm.coordinates.map((p) => p.map((r) => ring(r, true)).join('')).join('');
      if (gm.type === 'LineString') return ring(gm.coordinates);
      if (gm.type === 'MultiLineString') return gm.coordinates.map((l) => ring(l)).join('');
      return '';
    };
    const featPath = (fc) => fc.type === 'FeatureCollection' ? fc.features.map((f) => geomPath(f.geometry)).join('') : geomPath(fc.geometry || fc);

    svg.textContent = '';
    const defs = el('defs', null, svg);
    const pat = el('pattern', { id: 'map-hatch', patternUnits: 'userSpaceOnUse', width: 5, height: 5, patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: '#C7A35B', 'stroke-width': 1.1, 'stroke-opacity': 0.62 }, pat);
    const clip = el('clipPath', { id: 'map-clip' }, defs);
    el('rect', { x: 0, y: 0, width: W, height: H }, clip);

    const root = el('g', { 'clip-path': 'url(#map-clip)' }, svg);

    // Graticule
    const grat = el('g', { class: 'm-grat' }, root);
    for (let lat = -30; lat <= 30; lat += 10) if (lat !== 0) el('path', { d: `M0 ${(LAT0 - lat) * K}H${W}` }, grat);
    for (let lon = -20; lon <= 50; lon += 10) el('path', { d: `M${(lon - LON0) * K} 0V${H}` }, grat);
    el('path', { class: 'm-eq', d: `M0 ${LAT0 * K}H${W}` }, root);
    // Tropics, finer
    [23.44, -23.44].forEach((lat) => el('path', { class: 'm-eq', d: `M0 ${r1((LAT0 - lat) * K)}H${W}`, 'stroke-opacity': 0.16 }, root));

    // Water-lining: concentric hairlines offset from the coast
    const coastD = featPath(outline);
    const water = el('g', { class: 'm-water' }, root);
    const offs = [32, 23, 15.5, 9.5, 4.5];
    offs.forEach((o, i) => {
      el('path', { d: coastD, stroke: '#C7A35B', 'stroke-opacity': (0.1 + i * 0.05).toFixed(2), 'stroke-width': o * 2 + 1.6 }, water);
      el('path', { d: coastD, stroke: '#0A1612', 'stroke-width': o * 2 }, water);
    });

    // Land, then engaged hatch
    const land = el('g', null, root);
    const engagedG = el('g', null, root);
    const engaged = [];
    countries.features.forEach((f) => {
      const d = geomPath(f.geometry);
      el('path', { class: 'm-land', d }, land);
      if (ENGAGED.includes(norm(f.properties.name || ''))) {
        const p = el('path', { class: 'm-hatch m-engaged', d, fill: 'url(#map-hatch)' }, engagedG);
        engaged.push(p);
      }
    });

    el('path', { class: 'm-border', d: featPath(borders) }, root);
    const coast = add(root, coastD, { cls: 'm-coast', draw: 1, dur: 3600 });
    coast.classList.add('m-coast');

    // Ticks
    const ticks = el('g', null, svg);
    [30, 20, 10, -10, -20, -30].forEach((lat) => {
      const t = el('text', { class: 'm-tick', x: W - 4, y: (LAT0 - lat) * K - 5, 'text-anchor': 'end' }, ticks);
      t.textContent = Math.abs(lat) + '°' + (lat > 0 ? 'N' : 'S');
    });
    const eq = el('text', { class: 'm-tick', x: W - 4, y: LAT0 * K - 6, 'text-anchor': 'end' }, ticks);
    eq.textContent = '0° Equator';

    // Scale bar (1° of longitude at the equator ≈ 111 km)
    const sb = el('g', { transform: `translate(24 ${H - 40})` }, svg);
    const len = (1000 / 111.32) * K;
    el('path', { d: `M0 0H${r1(len)}M0 -5V5M${r1(len / 2)} -3V3M${r1(len)} -5V5`, stroke: '#C7A35B', 'stroke-opacity': 0.7, 'stroke-width': 1, fill: 'none' }, sb);
    const sbt = el('text', { class: 'm-tick', x: 0, y: 22 }, sb);
    sbt.textContent = '0 — 1,000 km';

    // Cities
    const cityG = el('g', { class: 'm-cities' }, svg);
    const cities = [];
    Object.entries(places.africa || {}).forEach(([name, ll]) => {
      const [x, y] = P(ll).split(' ').map(Number);
      const g = el('g', { transform: `translate(${x} ${y})` }, cityG);
      el('circle', { class: 'm-city-ring', r: 6 }, g);
      el('circle', { class: 'm-city-dot', r: 2.2 }, g);
      const [dx, dy, anchor] = LABELS[name] || [12, 4, 'start'];
      const t = el('text', { class: 'm-label', x: dx, y: dy, 'text-anchor': anchor }, g);
      t.textContent = name;
      cities.push(g);
    });

    if (!reduce) {
      svg.setAttribute('data-draw', '');
      engaged.forEach((p) => { p.style.opacity = '0'; });
      cities.forEach((c) => { c.style.opacity = '0'; c.style.transition = 'opacity 1s ease'; });
      svg._onDraw = () => {
        engaged.forEach((p, i) => setTimeout(() => { p.style.opacity = '1'; }, 900 + i * 70));
        cities.forEach((c, i) => setTimeout(() => { c.style.opacity = '1'; }, 2200 + i * 90));
      };
      watchDraw(svg);
    }
  }

  /* ---------- Visibility: reveals and line drawing ---------- */
  const revealIO = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;

  const drawIO = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target;
      drawIO.unobserve(t);
      drawNow(t);
      if (t._onDraw) t._onDraw();
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 }) : null;

  function watchDraw(node) {
    if (reduce || !drawIO) { node.classList.add('is-drawn'); return; }
    drawIO.observe(node);
  }

  /* ---------- Header, menu ---------- */
  function initHeader() {
    const header = $('#header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24 || doc.body.classList.contains('menu-open'));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const btn = $('.menu-btn');
    const menu = $('#menu');
    const label = $('.menu-btn__label', btn);
    if (!btn || !menu) return;
    const focusables = () => [btn, ...$$('a, button', menu)];

    const open = () => {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      label.textContent = 'Close';
      doc.body.classList.add('menu-open');
      onScroll();
      const mb = $('[data-menu-band]', menu);
      if (mb && !mb.firstChild) buildBand(mb, false);
      const first = $('a', menu);
      if (first) first.focus();
    };
    const close = (returnFocus = true) => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      label.textContent = 'Menu';
      doc.body.classList.remove('menu-open');
      onScroll();
      if (returnFocus) btn.focus();
    };
    btn.addEventListener('click', () => (menu.hidden ? open() : close()));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => close(false)));
    doc.addEventListener('keydown', (e) => {
      if (menu.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        const f = focusables();
        const i = f.indexOf(doc.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', () => { if (!menu.hidden && window.innerWidth > 1100) close(false); });
  }

  /* ---------- Init ---------- */
  function init() {
    initHeader();

    const mark = $('[data-mark]');
    if (mark) buildMark(mark);

    // Hero
    const medSvg = $('[data-medallion]');
    const medallion = $('.medallion');
    if (medSvg) { medSvg.setAttribute('data-draw', ''); buildMedallion(medSvg); }
    const title = $('.hero__title');
    $$('.hero__title .line > span').forEach((s, i) => s.style.setProperty('--i', i));
    const startHero = () => {
      if (title) title.classList.add('is-in');
      if (medSvg) drawNow(medSvg);
      if (medallion) drawNow(medallion);
    };
    if (reduce) startHero();
    else if (doc.fonts && doc.fonts.ready) Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(startHero);
    else setTimeout(startHero, 200);

    // Bands
    const bands = $$('[data-band]');
    bands.forEach((b) => { const s = buildBand(b, true); if (s) watchDraw(s); });

    // Frames
    const frames = $$('[data-frame]');
    frames.forEach(buildFrame);
    if ('ResizeObserver' in window) {
      let raf = 0;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => frames.forEach(buildFrame));
      });
      frames.forEach((f) => ro.observe(f));
    }
    let bandW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (Math.abs(window.innerWidth - bandW) < 40) return;
      bandW = window.innerWidth;
      bands.forEach((b) => buildBand(b, false));
    });

    const oval = $('[data-oval]');
    if (oval) buildOval(oval);
    $$('[data-seal]').forEach((s) => buildSeal(s, s.dataset.seal));
    $$('[data-mini]').forEach((s) => buildMini(s, s.dataset.mini));
    $$('[data-stage]').forEach((s) => buildStage(s, +s.dataset.stage));
    const map = $('[data-map]');
    if (map) buildMap(map);

    // Reveals
    const reveals = $$('[data-reveal], .sec-label, [data-steps]');
    if (reduce || !revealIO) reveals.forEach((r) => r.classList.add('is-in'));
    else reveals.forEach((r) => revealIO.observe(r));
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
