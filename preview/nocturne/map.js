/* =========================================================
   Silver Fox Horizons — Nocturne dot-map
   Africa drawn from a hand-built lon/lat outline, sampled
   into a hexagonal dot grid and lit like a night-side
   satellite view. Vanilla canvas, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  // ---- Simplified coastline (lon, lat), clockwise from Tangier ----
  var AFRICA = [
    [-5.8, 35.8], [-5.3, 35.9], [-3.9, 35.25], [-2.95, 35.3], [-0.65, 35.7], [0.1, 35.95], [1.3, 36.5],
    [3.05, 36.8], [5.1, 36.75], [6.9, 36.9], [7.75, 36.9], [8.75, 36.95], [9.85, 37.3], [10.3, 36.8],
    [11.05, 37.05], [10.6, 36.4], [10.65, 35.8], [11.05, 35.5], [10.75, 34.75], [10.1, 33.9], [10.9, 33.7],
    [11.1, 33.5], [12.0, 32.9], [13.2, 32.9], [14.25, 32.65], [15.1, 32.4], [15.6, 31.5], [16.6, 31.2],
    [18.0, 30.75], [19.6, 30.4], [20.0, 30.75], [20.05, 32.1], [20.6, 32.55], [21.5, 32.9], [22.65, 32.75],
    [23.95, 32.1], [25.1, 31.75], [25.15, 31.55], [27.25, 31.35], [28.95, 30.85], [29.9, 31.2], [30.4, 31.45],
    [31.8, 31.5], [32.3, 31.27], [34.22, 31.32], [34.9, 29.5], [34.5, 28.5], [34.25, 27.75], [33.6, 28.25],
    [32.55, 29.95], [33.1, 28.35], [33.8, 27.2], [33.95, 26.75], [34.3, 26.1], [34.9, 25.05], [35.5, 23.9],
    [36.65, 22.2], [37.25, 21.0], [37.22, 19.6], [37.35, 19.1], [38.3, 18.1], [38.9, 16.6], [39.45, 15.6],
    [40.2, 14.9], [41.0, 14.1], [41.7, 13.4], [42.75, 13.0], [43.3, 12.5], [43.15, 11.6], [43.5, 11.35],
    [45.0, 10.45], [46.5, 10.75], [48.0, 11.2], [49.2, 11.3], [50.5, 11.7], [51.27, 11.83], [51.1, 11.0],
    [51.4, 10.4], [50.9, 9.4], [50.3, 8.3], [49.8, 7.95], [48.9, 5.9], [48.5, 5.35], [47.6, 4.0],
    [46.4, 2.6], [45.35, 2.05], [44.0, 1.0], [43.0, 0.0], [42.55, -0.35], [41.6, -1.65], [40.9, -2.3],
    [40.12, -3.2], [39.7, -4.05], [39.1, -5.1], [39.3, -6.8], [39.5, -8.0], [39.5, -8.9], [39.8, -9.9],
    [40.2, -10.3], [40.5, -11.6], [40.5, -12.95], [40.7, -14.5], [40.6, -15.3], [39.9, -16.2], [36.9, -17.9],
    [35.9, -18.8], [34.85, -19.85], [35.1, -20.9], [35.5, -22.1], [35.5, -23.85], [35.0, -24.6], [33.6, -25.1],
    [32.6, -25.95], [32.9, -26.85], [32.1, -28.8], [31.05, -29.85], [30.45, -30.75], [29.3, -31.6],
    [27.9, -33.0], [26.9, -33.6], [25.6, -33.95], [24.8, -34.2], [23.05, -34.05], [22.1, -34.2], [20.0, -34.83],
    [19.25, -34.4], [18.47, -34.35], [18.42, -33.9], [18.1, -33.2], [17.95, -33.0], [18.2, -32.4], [17.3, -30.3],
    [16.87, -29.25], [16.45, -28.6], [15.15, -26.65], [14.85, -25.0], [14.45, -22.95], [14.0, -22.0],
    [13.4, -20.6], [12.5, -18.6], [11.75, -17.25], [11.85, -15.8], [12.15, -15.2], [12.55, -13.9], [13.4, -12.58],
    [13.55, -12.35], [13.8, -11.0], [13.2, -9.4], [13.23, -8.8], [12.9, -7.5], [12.35, -6.1], [12.15, -5.8],
    [12.2, -5.55], [11.85, -4.8], [10.65, -3.45], [9.7, -2.5], [8.75, -0.65], [9.45, 0.4], [9.55, 1.1],
    [9.75, 1.85], [9.9, 2.95], [9.6, 3.9], [9.2, 4.0], [8.7, 4.5], [8.3, 4.6], [7.3, 4.45], [6.25, 4.3],
    [5.95, 4.3], [5.4, 5.2], [4.6, 6.1], [3.4, 6.42], [2.4, 6.35], [1.25, 6.13], [0.6, 5.8], [-0.2, 5.55],
    [-1.75, 4.9], [-2.1, 4.75], [-3.0, 5.1], [-4.0, 5.25], [-6.1, 4.95], [-6.65, 4.75], [-7.55, 4.38],
    [-9.0, 4.9], [-10.05, 5.88], [-10.8, 6.32], [-11.5, 6.9], [-12.5, 7.5], [-13.25, 8.48], [-13.3, 9.0],
    [-13.7, 9.52], [-14.5, 10.3], [-15.0, 10.85], [-15.6, 11.85], [-16.7, 12.3], [-16.8, 13.1], [-16.6, 13.45],
    [-16.75, 13.9], [-17.15, 14.6], [-17.5, 14.75], [-16.8, 15.4], [-16.5, 16.05], [-16.3, 17.0], [-16.05, 18.1],
    [-16.2, 19.1], [-16.5, 19.4], [-16.3, 20.0], [-17.05, 20.8], [-16.7, 21.3], [-16.2, 22.4], [-15.95, 23.7],
    [-15.3, 24.6], [-14.5, 26.1], [-13.6, 27.0], [-12.95, 27.95], [-11.1, 28.5], [-10.2, 29.4], [-9.65, 30.4],
    [-9.8, 31.5], [-9.25, 32.3], [-8.5, 33.25], [-7.6, 33.6], [-6.85, 34.0], [-6.6, 34.3], [-6.15, 35.2]
  ];

  var MADAGASCAR = [
    [49.3, -12.0], [49.9, -13.3], [50.25, -14.9], [50.45, -15.6], [49.9, -16.6], [49.4, -18.15], [48.9, -19.6],
    [48.55, -20.6], [47.95, -22.4], [47.5, -23.8], [47.0, -25.0], [46.2, -25.2], [45.2, -25.6], [44.2, -25.1],
    [43.65, -23.4], [43.3, -22.0], [43.75, -21.3], [44.3, -20.3], [44.45, -19.0], [44.0, -17.7], [44.45, -16.2],
    [46.3, -15.7], [47.2, -14.9], [47.9, -13.8], [48.3, -13.4], [48.8, -12.6]
  ];

  var HUBS = [
    { n: 'Cairo', c: 'Egypt', lon: 31.24, lat: 30.04, tz: 'Africa/Cairo' },
    { n: 'Casablanca', c: 'Morocco', lon: -7.59, lat: 33.57, tz: 'Africa/Casablanca' },
    { n: 'Dakar', c: 'Senegal', lon: -17.45, lat: 14.69, tz: 'Africa/Dakar' },
    { n: 'Abidjan', c: "Côte d’Ivoire", lon: -4.02, lat: 5.35, tz: 'Africa/Abidjan' },
    { n: 'Accra', c: 'Ghana', lon: -0.19, lat: 5.6, tz: 'Africa/Accra' },
    { n: 'Lagos', c: 'Nigeria', lon: 3.38, lat: 6.52, tz: 'Africa/Lagos' },
    { n: 'Addis Ababa', c: 'Ethiopia', lon: 38.76, lat: 9.01, tz: 'Africa/Addis_Ababa' },
    { n: 'Nairobi', c: 'Kenya', lon: 36.82, lat: -1.29, tz: 'Africa/Nairobi' },
    { n: 'Kigali', c: 'Rwanda', lon: 30.06, lat: -1.95, tz: 'Africa/Kigali' },
    { n: 'Luanda', c: 'Angola', lon: 13.23, lat: -8.84, tz: 'Africa/Luanda' },
    { n: 'Johannesburg', c: 'South Africa', lon: 28.05, lat: -26.2, tz: 'Africa/Johannesburg' },
    { n: 'Cape Town', c: 'South Africa', lon: 18.42, lat: -33.92, tz: 'Africa/Johannesburg' }
  ];

  // global capitals; al = label alignment hint when clamped to an edge
  var GLOBAL = [
    { n: 'London', lon: -0.13, lat: 51.51, al: 'end' },
    { n: 'Brussels', lon: 4.35, lat: 50.85, al: 'start' },
    { n: 'Washington, D.C.', lon: -77.04, lat: 38.91, al: 'start' },
    { n: 'Riyadh', lon: 46.68, lat: 24.71, al: 'below' },
    { n: 'Dubai', lon: 55.27, lat: 25.2, al: 'start' },
    { n: 'Beijing', lon: 116.4, lat: 39.9, al: 'end' },
    { n: 'Tokyo', lon: 139.69, lat: 35.69, al: 'end' }
  ];

  var ROUTES = [
    ['Lagos', 'London'], ['Nairobi', 'Dubai'], ['Johannesburg', 'Beijing'], ['Accra', 'Washington, D.C.'],
    ['Cairo', 'Brussels'], ['Addis Ababa', 'Beijing'], ['Kigali', 'Tokyo'], ['Dakar', 'Washington, D.C.'],
    ['Cairo', 'Riyadh'], ['Luanda', 'Beijing'], ['Abidjan', 'Brussels'], ['Cape Town', 'London'],
    ['Nairobi', 'Riyadh'], ['Johannesburg', 'Tokyo'], ['Casablanca', 'Washington, D.C.'], ['Lagos', 'Dubai'],
    ['Addis Ababa', 'Dubai'], ['Casablanca', 'Brussels']
  ];

  // secondary night lights [lon, lat, weight]
  var LIGHTS = [
    [15.27, -4.44, 1], [32.53, 15.5, 0.8], [39.28, -6.8, 0.8], [3.06, 36.75, 0.8], [10.18, 36.8, 0.7],
    [13.19, 32.89, 0.6], [7.49, 9.06, 0.6], [8.52, 12.0, 0.7], [32.58, 0.35, 0.7], [28.32, -15.39, 0.5],
    [31.05, -17.83, 0.5], [32.57, -25.97, 0.5], [47.52, -18.88, 0.6], [-8.0, 12.64, 0.5], [-1.52, 12.37, 0.45],
    [2.11, 13.51, 0.35], [15.04, 12.13, 0.35], [9.7, 4.05, 0.6], [45.32, 2.05, 0.45], [31.02, -29.86, 0.75],
    [29.92, 31.2, 0.9], [32.64, 25.69, 0.4], [-6.84, 34.02, 0.6], [-8.0, 31.63, 0.55], [-5.0, 34.03, 0.45],
    [-13.68, 9.64, 0.4], [-13.23, 8.47, 0.35], [-10.8, 6.3, 0.35], [1.22, 6.13, 0.4], [2.42, 6.37, 0.45],
    [3.9, 7.38, 0.6], [7.0, 4.8, 0.55], [11.5, 3.87, 0.45], [9.45, 0.39, 0.3], [15.24, -4.26, 0.5],
    [27.48, -11.66, 0.4], [39.67, -4.04, 0.45], [34.76, -0.09, 0.35], [31.58, 4.85, 0.3], [38.93, 15.32, 0.3],
    [43.15, 11.59, 0.3], [44.06, 9.56, 0.3], [33.79, -13.96, 0.3], [35.0, -15.78, 0.3], [28.58, -20.15, 0.3],
    [25.91, -24.65, 0.3], [17.08, -22.56, 0.3], [28.19, -25.75, 0.8], [25.6, -33.96, 0.45], [26.2, -29.1, 0.35],
    [-15.98, 18.08, 0.3], [20.07, 32.12, 0.45], [37.22, 19.62, 0.3], [29.36, -3.38, 0.35], [32.9, -2.52, 0.35],
    [36.68, -3.37, 0.35], [34.84, -19.84, 0.35], [-1.62, 6.69, 0.55], [-16.49, 16.03, 0.25], [-5.8, 35.76, 0.45],
    [-0.64, 35.7, 0.5], [10.76, 34.74, 0.4], [32.9, 24.09, 0.35], [13.49, -14.92, 0.3], [15.74, -12.77, 0.3],
    [22.42, -5.9, 0.3], [25.19, 0.52, 0.3], [29.22, -1.68, 0.3], [18.56, 4.36, 0.3], [6.0, 6.3, 0.4],
    [7.4, 6.45, 0.4], [5.6, 7.2, 0.35], [-3.0, 6.0, 0.3], [30.8, 28.1, 0.5], [31.2, 27.2, 0.5], [31.1, 29.1, 0.55],
    [32.7, 26.2, 0.4], [31.4, 30.6, 0.8], [30.9, 30.8, 0.7], [32.3, 30.6, 0.45], [36.3, -1.0, 0.3], [37.3, -0.4, 0.25],
    [27.8, -26.6, 0.5], [28.4, -26.3, 0.5], [30.4, -29.6, 0.35], [18.9, -33.95, 0.4], [-17.2, 14.8, 0.3],
    [12.6, 32.75, 0.35], [8.0, 36.8, 0.35], [5.4, 36.2, 0.35], [-2.2, 34.7, 0.3], [9.1, 7.8, 0.3], [8.7, 9.9, 0.3]
  ];

  // ---- projection: sinusoidal centred on 17°E (keeps Africa's true shape) ----
  var CM = 17, D2R = Math.PI / 180;
  function proj(lon, lat) { return [(lon - CM) * Math.cos(lat * D2R), lat]; }

  function pip(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  var PA = AFRICA.map(function (p) { return proj(p[0], p[1]); });
  var PM = MADAGASCAR.map(function (p) { return proj(p[0], p[1]); });
  var BOUNDS = (function () {
    var b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
    PA.concat(PM).forEach(function (p) {
      b.x0 = Math.min(b.x0, p[0]); b.x1 = Math.max(b.x1, p[0]);
      b.y0 = Math.min(b.y0, p[1]); b.y1 = Math.max(b.y1, p[1]);
    });
    return b;
  })();
  function onLand(x, y) { return pip(x, y, PA) || pip(x, y, PM); }

  function fmtCoord(lat, lon) {
    return Math.abs(lat).toFixed(2) + '°' + (lat >= 0 ? 'N' : 'S') + '  ' + Math.abs(lon).toFixed(2) + '°' + (lon >= 0 ? 'E' : 'W');
  }
  function localTime(tz) {
    try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date()); }
    catch (e) { return ''; }
  }

  function glowSprite(r, g, b, size) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var x = c.getContext('2d');
    var gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
    gr.addColorStop(0.18, 'rgba(' + r + ',' + g + ',' + b + ',0.45)');
    gr.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',0.1)');
    gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, size, size);
    return c;
  }

  var LEVELS = 12;

  function DotMap(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = Object.assign({
      arcs: true, interactive: true, labels: true, density: 1, padX: 0.05, padY: 0.06,
      shiftX: 0, tooltip: null, onHover: null, highlight: null, intensity: 1
    }, opts || {});
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.par = { x: 0, y: 0, tx: 0, ty: 0 };
    this.mouse = { x: -9999, y: -9999, on: false };
    this.hover = -1;
    this.forced = this.o.highlight != null ? this.o.highlight : -1;
    this.revealAt = null;
    this.running = false;
    this.visible = false;
    this.warmSprite = glowSprite(255, 226, 186, 64);
    this.blueSprite = glowSprite(127, 167, 255, 96);
    this.whiteSprite = glowSprite(236, 241, 255, 64);
    this.routes = [];
    this.build();
    this.bind();
  }

  DotMap.prototype.build = function () {
    var rect = this.c.getBoundingClientRect();
    var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h; this.dpr = dpr;
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(h * dpr);

    var bw = BOUNDS.x1 - BOUNDS.x0, bh = BOUNDS.y1 - BOUNDS.y0;
    var padY = w < 600 ? 0.035 : this.o.padY;
    var sc = Math.min(w * (1 - 2 * this.o.padX) / bw, h * (1 - 2 * padY) / bh);
    this.sc = sc;
    this.ox = (w - bw * sc) / 2 - BOUNDS.x0 * sc + this.o.shiftX * w;
    this.oy = (h - bh * sc) / 2 + BOUNDS.y1 * sc;

    var s = Math.max(4.2, 0.78 * sc / this.o.density);
    this.r = Math.max(0.75, Math.min(1.45, s * 0.17));
    var xs = [], ys = [], base = [], warm = [], phase = [], dist = [];
    var self = this;
    var cx = this.ox + (17 - CM) * sc, cy = this.oy - 2 * sc;
    var maxD = Math.hypot(w, h) * 0.55;
    var lightsP = LIGHTS.map(function (l) { var p = proj(l[0], l[1]); return [p[0], p[1], l[2]]; });
    HUBS.forEach(function (hb) { var p = proj(hb.lon, hb.lat); lightsP.push([p[0], p[1], 1.25]); });
    var sig = 1.25, sig2 = 2 * sig * sig;
    var row = 0;
    for (var py = this.oy - BOUNDS.y1 * sc - s; py < this.oy - BOUNDS.y0 * sc + s; py += s * 0.866, row++) {
      for (var px = (row % 2 ? s / 2 : 0) + (this.ox + BOUNDS.x0 * sc) - s; px < this.ox + BOUNDS.x1 * sc + s; px += s) {
        var X = (px - this.ox) / sc, Y = (this.oy - py) / sc;
        if (!onLand(X, Y)) continue;
        var dd = s / sc * 1.1;
        var edge = !onLand(X + dd, Y) || !onLand(X - dd, Y) || !onLand(X, Y + dd) || !onLand(X, Y - dd);
        var wm = 0;
        for (var k = 0; k < lightsP.length; k++) {
          var dx = X - lightsP[k][0], dy = Y - lightsP[k][1];
          var d2 = dx * dx + dy * dy;
          if (d2 < 30) wm += lightsP[k][2] * Math.exp(-d2 / sig2);
        }
        wm = Math.min(1, wm);
        var tex = 0.5 + 0.5 * Math.sin(X * 0.42 + Math.sin(Y * 0.31) * 2.1) * Math.cos(Y * 0.37 - X * 0.12);
        xs.push(px); ys.push(py);
        base.push((edge ? 0.5 : 0.17 + tex * 0.12) + wm * 0.45);
        warm.push(wm);
        phase.push(Math.random() * Math.PI * 2);
        dist.push(Math.min(1, Math.hypot(px - cx, py - cy) / maxD));
      }
    }
    var n = xs.length;
    this.n = n;
    this.dx = new Float32Array(xs); this.dy = new Float32Array(ys);
    this.base = new Float32Array(base); this.warm = new Float32Array(warm);
    this.phase = new Float32Array(phase); this.dist = new Float32Array(dist);
    this.buckets = [];
    for (var b = 0; b < LEVELS * 2; b++) this.buckets.push({ idx: new Int32Array(n), len: 0 });

    // hubs + lights to pixels
    this.hubs = HUBS.map(function (hb) { var p = proj(hb.lon, hb.lat); return { d: hb, x: self.ox + p[0] * sc, y: self.oy - p[1] * sc, ph: Math.random() * 6 }; });
    this.lights = LIGHTS.map(function (l) { var p = proj(l[0], l[1]); return { x: self.ox + p[0] * sc, y: self.oy - p[1] * sc, w: l[2], ph: Math.random() * 6 }; });

    // global anchors (clamped to an inset rectangle)
    var m = w < 600 ? 18 : 30;
    var cx0 = this.ox + (20 - CM) * sc, cy0 = this.oy - 6 * sc;
    this.globals = GLOBAL.map(function (g) {
      var p = proj(g.lon, g.lat), gx = self.ox + p[0] * sc, gy = self.oy - p[1] * sc;
      var edge = null;
      if (gx < m || gx > w - m || gy < m + 6 || gy > h - m) {
        var vx = gx - cx0, vy = gy - cy0, t = 1;
        if (vx < 0) { var t1 = (m - cx0) / vx; if (t1 < t) { t = t1; edge = 'l'; } }
        if (vx > 0) { var t2 = (w - m - cx0) / vx; if (t2 < t) { t = t2; edge = 'r'; } }
        if (vy < 0) { var t3 = (m + 6 - cy0) / vy; if (t3 < t) { t = t3; edge = 't'; } }
        gx = cx0 + vx * t; gy = cy0 + vy * t;
      }
      return { d: g, x: gx, y: gy, edge: edge, pulse: -10 };
    });

    var byName = {};
    this.hubs.forEach(function (hb, i) { byName[hb.d.n] = i; });
    var gByName = {};
    this.globals.forEach(function (g, i) { gByName[g.d.n] = i; });
    var now = performance.now();
    this.routes = ROUTES.map(function (r, i) {
      var a = self.hubs[byName[r[0]]], g = self.globals[gByName[r[1]]];
      var mx = (a.x + g.x) / 2, my = (a.y + g.y) / 2;
      var vx = g.x - a.x, vy = g.y - a.y, len = Math.hypot(vx, vy) || 1;
      var nx = -vy / len, ny = vx / len;
      if (ny > 0) { nx = -nx; ny = -ny; } // bow upwards
      var bow = Math.min(len * 0.26, 220);
      return {
        a: a, g: g, hub: byName[r[0]],
        p0x: a.x, p0y: a.y, p1x: mx + nx * bow, p1y: my + ny * bow, p2x: g.x, p2y: g.y,
        start: now + 300 + i * 650 + Math.random() * 400, dur: 2300 + Math.random() * 1300
      };
    });
  };

  DotMap.prototype.bind = function () {
    var self = this;
    var resizeT;
    if ('ResizeObserver' in window) {
      var lastW = 0, lastH = 0;
      new ResizeObserver(function (entries) {
        var cr = entries[0].contentRect;
        if (Math.abs(cr.width - lastW) < 2 && Math.abs(cr.height - lastH) < 2) return;
        lastW = cr.width; lastH = cr.height;
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { self.build(); if (!self.running) self.draw(performance.now()); }, 120);
      }).observe(this.c);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (self.visible) {
          if (self.revealAt == null) self.revealAt = performance.now();
          self.start();
        } else self.stop();
      }, { rootMargin: '80px' }).observe(this.c);
    } else { this.visible = true; this.revealAt = performance.now(); this.start(); }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) self.stop(); else if (self.visible) self.start();
    });

    window.addEventListener('pointermove', function (e) {
      var r = self.c.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      self.par.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      self.par.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      if (!self.o.interactive) return;
      self.mouse.x = e.clientX - r.left; self.mouse.y = e.clientY - r.top;
      self.mouse.on = self.mouse.x >= 0 && self.mouse.y >= 0 && self.mouse.x <= r.width && self.mouse.y <= r.height;
      self.hitTest();
      if (!self.running) self.draw(performance.now());
    }, { passive: true });

    if (this.o.interactive) {
      this.c.addEventListener('pointerleave', function () { self.mouse.on = false; self.mouse.x = -9999; self.setHover(-1); });
      this.c.addEventListener('pointerdown', function (e) {
        var r = self.c.getBoundingClientRect();
        self.mouse.x = e.clientX - r.left; self.mouse.y = e.clientY - r.top; self.mouse.on = true;
        self.hitTest(28);
        if (!self.running) self.draw(performance.now());
      });
    }
  };

  DotMap.prototype.offset = function (depth) {
    var amp = this.w < 600 ? 0 : 14;
    return [-this.par.x * amp * depth, -this.par.y * amp * depth];
  };

  DotMap.prototype.hitTest = function (radius) {
    var best = -1, bd = radius || 18;
    var o = this.offset(1.4);
    for (var i = 0; i < this.hubs.length; i++) {
      var d = Math.hypot(this.mouse.x - (this.hubs[i].x + o[0]), this.mouse.y - (this.hubs[i].y + o[1]));
      if (d < bd) { bd = d; best = i; }
    }
    this.setHover(best);
  };

  DotMap.prototype.setHover = function (i) {
    if (i === this.hover) return;
    this.hover = i;
    this.c.style.cursor = i >= 0 ? 'pointer' : '';
    this.updateTip();
    if (this.o.onHover) this.o.onHover(i);
    if (!this.running) this.draw(performance.now());
  };

  DotMap.prototype.focus = function (i) { // driven by legend
    this.forced = i;
    this.updateTip();
    if (!this.running) this.draw(performance.now());
  };

  DotMap.prototype.updateTip = function () {
    var tip = this.o.tooltip;
    if (!tip) return;
    var i = this.hover >= 0 ? this.hover : this.forced;
    if (i < 0) { tip.classList.remove('is-on'); return; }
    var hb = this.hubs[i], d = hb.d;
    var o = this.offset(1.4);
    tip.innerHTML = '<div class="t-city">' + d.n + '</div><div class="t-country">' + d.c + '</div>' +
      '<div class="t-meta"><span>' + fmtCoord(d.lat, d.lon) + '</span><b>' + localTime(d.tz) + '</b></div>';
    var x = hb.x + o[0], y = hb.y + o[1];
    var tw = tip.offsetWidth || 200;
    x = Math.max(tw / 2 + 8, Math.min(this.w - tw / 2 - 8, x));
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
    tip.classList.add('is-on');
  };

  DotMap.prototype.start = function () {
    if (this.running) return;
    if (this.reduced) { this.draw(performance.now(), true); return; }
    this.running = true;
    var self = this;
    (function loop(t) {
      if (!self.running) return;
      self.draw(t);
      self.raf = requestAnimationFrame(loop);
    })(performance.now());
  };
  DotMap.prototype.stop = function () { this.running = false; cancelAnimationFrame(this.raf); };

  function bez(r, t) {
    var u = 1 - t;
    return [u * u * r.p0x + 2 * u * t * r.p1x + t * t * r.p2x, u * u * r.p0y + 2 * u * t * r.p1y + t * t * r.p2y];
  }

  DotMap.prototype.draw = function (now, staticFrame) {
    var ctx = this.ctx, w = this.w, h = this.h, n = this.n, I = this.o.intensity;
    var t = now / 1000;
    var stat = staticFrame || this.reduced;
    this.par.x += (this.par.tx - this.par.x) * 0.06;
    this.par.y += (this.par.ty - this.par.y) * 0.06;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    var rt = stat || this.revealAt == null ? 9 : (now - this.revealAt) / 1000;
    var revealing = rt < 3.2;

    // ---- dots ----
    var o1 = this.offset(0.6);
    var sweepU = ((t * 0.055) % 1.5) - 0.25;
    var mx = this.mouse.on ? this.mouse.x - o1[0] : -9999, my = this.mouse.y - o1[1];
    var R = 110, R2 = R * R;
    var B = this.buckets;
    for (var b = 0; b < B.length; b++) B[b].len = 0;
    var dx = this.dx, dy = this.dy, base = this.base, warm = this.warm, ph = this.phase, dist = this.dist;
    for (var i = 0; i < n; i++) {
      var a = base[i];
      if (!stat) {
        a += 0.07 * Math.sin(t * 1.4 + ph[i]);
        var s7 = Math.sin(t * 0.6 + ph[i] * 9.0);
        if (s7 > 0.992) a += 0.5;
        var nx = (dx[i] / w) * 0.8 + (dy[i] / h) * 0.2;
        var sw = (nx - sweepU) / 0.07;
        a += 0.2 * Math.exp(-sw * sw);
      }
      var ex = dx[i] - mx, ey = dy[i] - my, e2 = ex * ex + ey * ey;
      if (e2 < R2) { var f = 1 - Math.sqrt(e2) / R; a += 0.55 * f * f; }
      if (revealing) {
        var rv = (rt * 0.9 - dist[i]) * 2.4;
        if (rv <= 0) continue;
        if (rv < 1) a *= rv;
      }
      a *= I;
      if (a <= 0.02) continue;
      var lv = Math.min(LEVELS - 1, (a * LEVELS) | 0);
      var bk = B[(warm[i] > 0.3 ? LEVELS : 0) + lv];
      bk.idx[bk.len++] = i;
    }
    ctx.save();
    ctx.translate(o1[0], o1[1]);
    var r = this.r, TAU = Math.PI * 2;
    for (var q = 0; q < B.length; q++) {
      var bucket = B[q];
      if (!bucket.len) continue;
      var lvl = q % LEVELS, isWarm = q >= LEVELS;
      var al = (lvl + 0.5) / LEVELS;
      ctx.fillStyle = isWarm ? 'rgba(255,236,210,' + al.toFixed(3) + ')' : 'rgba(214,220,232,' + al.toFixed(3) + ')';
      var rr = r * (0.8 + lvl / LEVELS * 0.55);
      ctx.beginPath();
      for (var j = 0; j < bucket.len; j++) {
        var id = bucket.idx[j];
        ctx.moveTo(dx[id] + rr, dy[id]);
        ctx.arc(dx[id], dy[id], rr, 0, TAU);
      }
      ctx.fill();
    }
    ctx.restore();

    var revealK = revealing ? Math.max(0, Math.min(1, (rt - 0.8) / 1.4)) : 1;

    // ---- warm city lights ----
    ctx.globalCompositeOperation = 'lighter';
    var o2 = this.offset(1);
    var ws = this.warmSprite;
    for (var L = 0; L < this.lights.length; L++) {
      var li = this.lights[L];
      var fl = stat ? 1 : 0.85 + 0.15 * Math.sin(t * 2.1 + li.ph);
      var sz = (10 + li.w * 18) * Math.min(1.25, this.sc / 9) ;
      ctx.globalAlpha = Math.min(1, 0.35 * li.w * fl * revealK * I);
      ctx.drawImage(ws, li.x + o2[0] - sz / 2, li.y + o2[1] - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;

    // ---- arcs ----
    var o3 = this.offset(1.4);
    ctx.save();
    ctx.translate(o3[0], o3[1]);
    if (this.o.arcs) {
      var active = this.hover >= 0 ? this.hover : this.forced;
      ctx.lineCap = 'round';
      // faint full network
      for (var k = 0; k < this.routes.length; k++) {
        var ro = this.routes[k];
        var on = active === ro.hub;
        ctx.strokeStyle = on ? 'rgba(127,167,255,0.55)' : 'rgba(170,190,230,0.07)';
        ctx.lineWidth = on ? 1.1 : 0.8;
        ctx.globalAlpha = revealK;
        ctx.beginPath();
        ctx.moveTo(ro.p0x, ro.p0y);
        ctx.quadraticCurveTo(ro.p1x, ro.p1y, ro.p2x, ro.p2y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!stat) {
        for (var k2 = 0; k2 < this.routes.length; k2++) {
          var rr2 = this.routes[k2];
          var p = (now - rr2.start) / rr2.dur;
          if (p < 0) continue;
          if (p > 1.45) {
            rr2.start = now + 2500 + Math.random() * 7000;
            rr2.dur = 2300 + Math.random() * 1300;
            continue;
          }
          if (p >= 1 && rr2.g.pulse < rr2.start) rr2.g.pulse = now;
          var head = Math.min(1, p), tail = Math.max(0, p - 0.38);
          if (head <= tail) continue;
          var SEG = 22, prev = bez(rr2, tail);
          for (var sgi = 1; sgi <= SEG; sgi++) {
            var tt = tail + (head - tail) * sgi / SEG;
            var pt = bez(rr2, tt);
            var fade = sgi / SEG;
            ctx.strokeStyle = 'rgba(160,190,255,' + (fade * fade * 0.9).toFixed(3) + ')';
            ctx.lineWidth = 0.6 + fade * 1.1;
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(pt[0], pt[1]);
            ctx.stroke();
            prev = pt;
          }
          if (p < 1) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(this.whiteSprite, prev[0] - 9, prev[1] - 9, 18, 18);
          }
        }
      } else {
        // reduced motion: a few still trails
        for (var k3 = 0; k3 < this.routes.length; k3 += 2) {
          var rs = this.routes[k3];
          ctx.strokeStyle = 'rgba(160,190,255,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rs.p0x, rs.p0y);
          ctx.quadraticCurveTo(rs.p1x, rs.p1y, rs.p2x, rs.p2y);
          ctx.stroke();
        }
      }

      // global anchors
      ctx.globalCompositeOperation = 'source-over';
      var fontPx = w < 600 ? 8.5 : 10;
      ctx.font = '500 ' + fontPx + 'px Geist, Inter, system-ui, sans-serif';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0.18em';
      ctx.textBaseline = 'middle';
      for (var gi = 0; gi < this.globals.length; gi++) {
        var g = this.globals[gi];
        var since = (now - g.pulse) / 1000;
        if (since >= 0 && since < 1.6) {
          ctx.strokeStyle = 'rgba(127,167,255,' + (0.6 * (1 - since / 1.6)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(g.x, g.y, 3 + since * 14, 0, TAU); ctx.stroke();
        }
        ctx.globalAlpha = revealK;
        ctx.fillStyle = 'rgba(127,167,255,0.9)';
        ctx.beginPath(); ctx.arc(g.x, g.y, 2, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(127,167,255,0.35)';
        ctx.beginPath(); ctx.arc(g.x, g.y, 5.5, 0, TAU); ctx.stroke();
        if (this.o.labels && w >= 600) {
          var label = g.d.n.toUpperCase();
          ctx.fillStyle = 'rgba(138,144,156,0.95)';
          var lx = g.x, ly = g.y, align = 'left';
          if (!g.edge && g.d.al === 'below') { align = 'center'; ly = g.y + 17; }
          else if (g.edge === 't') { ly = g.y + 16; align = g.d.al === 'end' ? 'right' : 'left'; lx = g.x + (align === 'right' ? 4 : -4); }
          else if (g.edge === 'r' || (!g.edge && g.d.al === 'end')) { align = 'right'; lx = g.x - 12; }
          else { align = 'left'; lx = g.x + 12; }
          ctx.textAlign = align;
          ctx.fillText(label, lx, ly);
        }
        ctx.globalAlpha = 1;
      }
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    }

    // ---- hubs ----
    var act = this.hover >= 0 ? this.hover : this.forced;
    for (var hI = 0; hI < this.hubs.length; hI++) {
      var hb = this.hubs[hI];
      var isA = hI === act;
      var pulse = stat ? 0.5 : (t * 0.45 + hb.ph * 0.17) % 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = revealK * (isA ? 1 : 0.75);
      var gs = isA ? 64 : 40;
      ctx.drawImage(this.blueSprite, hb.x - gs / 2, hb.y - gs / 2, gs, gs);
      ctx.globalAlpha = revealK * 0.9;
      ctx.drawImage(this.warmSprite, hb.x - 10, hb.y - 10, 20, 20);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = revealK;
      ctx.fillStyle = '#F6F2EA';
      ctx.beginPath(); ctx.arc(hb.x, hb.y, isA ? 2.8 : 2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(127,167,255,' + ((1 - pulse) * 0.55).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hb.x, hb.y, 4 + pulse * (isA ? 22 : 14), 0, TAU); ctx.stroke();
      if (isA) {
        ctx.strokeStyle = 'rgba(217,220,225,0.7)';
        ctx.beginPath(); ctx.arc(hb.x, hb.y, 9, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (this.hover >= 0 || this.forced >= 0) {
      if (!this._tipT || now - this._tipT > 60) { this._tipT = now; this.updateTip(); }
    }
  };

  window.NocturneMap = DotMap;
  window.NocturneMap.HUBS = HUBS;
})();
