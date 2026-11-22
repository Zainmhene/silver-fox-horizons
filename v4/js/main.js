/* Silver Fox Horizons — homepage demo (v4)
   0 Core (motion flags, smooth scroll, in-page links, line splitting)
   1 Header and menu
   2 Hero (preloader, frame sequence, intro, clocks) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var lenis = null;

  /* 0. CORE ---------------------------------------------------------------- */
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    // Always open at the top so the film starts from its first frame
    // (ScrollTrigger owns history.scrollRestoration, so it has to be asked)
    if (!location.hash) ScrollTrigger.clearScrollMemory('manual');
    // expo.out is GSAP's name for cubic-bezier(.16, 1, .3, 1)
    gsap.defaults({ ease: 'expo.out', duration: 1.4 });
  }

  // Smooth scroll (off when the visitor asks for reduced motion)
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function loop(time) { lenis.raf(time); requestAnimationFrame(loop); })(performance.now());
    }
  }

  function scrollToTarget(target) {
    var top = target.id === 'top';
    if (lenis) {
      lenis.scrollTo(top ? 0 : target, { duration: 1.6 });
    } else if (top) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // In-page links
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    // A link inside the full-screen menu always closes it first
    if (link.hasAttribute('data-menu-link') && menuIsOpen()) closeMenu(false);
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target);
    if (id !== 'top' && history.replaceState) history.replaceState(null, '', '#' + id);
  });

  // Split a text element into its visual lines: <span class="line"><span class="line-inner">…
  // Returns the inner spans, ready to be revealed line by line.
  function splitLines(el) {
    var text = el.getAttribute('data-split-text');
    if (text === null) {
      text = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('data-split-text', text);
    }
    el.textContent = '';
    var words = text.split(' ').map(function (word) {
      var span = document.createElement('span');
      span.style.display = 'inline-block';
      span.textContent = word;
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
      return span;
    });
    var lines = [];
    var lastTop = null;
    words.forEach(function (span) {
      var top = span.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        lines.push([]);
        lastTop = top;
      }
      lines[lines.length - 1].push(span.textContent);
    });
    el.textContent = '';
    return lines.map(function (lineWords) {
      var line = document.createElement('span');
      var inner = document.createElement('span');
      line.className = 'line';
      inner.className = 'line-inner';
      inner.textContent = lineWords.join(' ');
      line.appendChild(inner);
      el.appendChild(line);
      el.appendChild(document.createTextNode(' '));
      return inner;
    });
  }

  function clamp01(value) { return Math.max(0, Math.min(1, value)); }

  /* 1. HEADER AND MENU ------------------------------------------------------ */
  var header = document.querySelector('[data-header]');
  var menu = document.querySelector('[data-menu]');
  var menuBtn = document.querySelector('[data-menu-btn]');
  var menuLabel = document.querySelector('[data-menu-label]');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav] a[href^="#"]'));
  var desktopQuery = window.matchMedia('(min-width: 1024px)');
  var hero = document.querySelector('[data-hero]');

  // Bar state + current section, one read per frame.
  // The bar stays transparent over the hero and turns dark and blurred once the hero has passed.
  var ticking = false;
  function updateHeader() {
    ticking = false;
    if (!header) return;
    var scrolled = hero
      ? hero.getBoundingClientRect().bottom <= header.offsetHeight + 1
      : window.scrollY > 24;
    header.classList.toggle('is-scrolled', scrolled);

    var probe = window.innerHeight * 0.4;
    var current = null;
    navLinks.forEach(function (link) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      var rect = target.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) current = link;
    });
    navLinks.forEach(function (link) {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeader);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateHeader();

  // Full-screen menu
  function menuIsOpen() { return !!menu && menu.classList.contains('is-open'); }

  function setPageInert(state) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === header || el === menu || el.tagName === 'SCRIPT') return;
      if (state) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function openMenu() {
    if (!menu || menuIsOpen()) return;
    menu.classList.add('is-open');
    root.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Close';
    setPageInert(true);
    if (lenis) lenis.stop();
  }

  function closeMenu(returnFocus) {
    if (!menu || !menuIsOpen()) return;
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    setPageInert(false);
    if (lenis) lenis.start();
    if (returnFocus) menuBtn.focus();
  }

  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (menuIsOpen()) closeMenu(false);
      else openMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (!menuIsOpen()) return;
      if (event.key === 'Escape') {
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      // Keep focus inside the bar and the menu while it is open
      var items = Array.prototype.slice.call(
        document.querySelectorAll('.site-header a, .site-header button, .menu a, .menu button')
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var onDesktop = function (event) { if (event.matches) closeMenu(false); };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onDesktop);
    else desktopQuery.addListener(onDesktop);
  }

  /* 2. HERO ------------------------------------------------------------------ */
  var HERO = {
    frameCount: 140,
    framePath: function (index) {
      var n = String(index + 1);
      while (n.length < 3) n = '0' + n;
      return 'assets/hero/f' + n + '.webp';
    },
    moreAt: 0.12,     // scroll progress where the short line and button arrive
    moreBack: 0.07,   // scrolling back above this hides them again
    veilFrom: 0.84,   // the film dims to the page colour over the last stretch
    veilMax: 0.82
  };

  var heroCanvas = hero && hero.querySelector('[data-hero-canvas]');
  var heroVideo = hero && hero.querySelector('[data-hero-video]');
  var heroPoster = hero && hero.querySelector('.hero-poster');
  var heroMedia = hero && hero.querySelector('[data-hero-media]');
  var heroVeil = hero && hero.querySelector('[data-hero-veil]');
  var heroHead = hero && hero.querySelector('[data-hero-head]');
  var heroMore = hero && hero.querySelector('[data-hero-more]');
  var heroLabel = hero && hero.querySelector('[data-hero-label]');
  var heroScroll = hero && hero.querySelector('[data-hero-scroll]');
  var heroProgress = hero && hero.querySelector('[data-hero-progress]');
  var heroClocks = hero && hero.querySelector('[data-hero-clocks]');
  var heroSplits = hero ? Array.prototype.slice.call(hero.querySelectorAll('[data-split]')) : [];

  var canSequence = !!hero && hasGsap && !reduceMotion && !!heroCanvas && !!heroCanvas.getContext;
  var sequenceOn = false;
  var frames = [];
  var framesRequested = false;
  var frameState = { frame: 0 };
  var drawnFrame = -1;
  var sequenceTween = null;
  var moreShown = false;
  var introDone = false;
  var ctx = canSequence ? heroCanvas.getContext('2d') : null;

  // Preloader
  var preloader = document.querySelector('[data-preloader]');
  var preloaderBar = document.querySelector('[data-preloader-bar]');
  var preloaderCount = document.querySelector('[data-preloader-count]');
  function setProgress(value) {
    var v = clamp01(value);
    if (preloaderBar) preloaderBar.style.transform = 'scaleX(' + v + ')';
    if (preloaderCount) {
      var n = String(Math.round(v * 100));
      while (n.length < 3) n = '0' + n;
      preloaderCount.textContent = n;
    }
  }

  // Frames: every fourth one first (enough to scrub the whole film), then the rest fills in
  function nearestFrame(index) {
    for (var d = 0; d < HERO.frameCount; d++) {
      if (frames[index - d]) return index - d;
      if (frames[index + d]) return index + d;
    }
    return -1;
  }
  function drawFrame(index) {
    if (!ctx) return;
    var found = nearestFrame(index);
    if (found < 0 || found === drawnFrame) return;
    ctx.drawImage(frames[found], 0, 0, heroCanvas.width, heroCanvas.height);
    drawnFrame = found;
  }
  function loadFrames(onProgress, onPlayable) {
    framesRequested = true;
    var order = [];
    var i;
    for (i = 0; i < HERO.frameCount; i += 4) order.push(i);
    for (i = 0; i < HERO.frameCount; i++) if (i % 4) order.push(i);
    var firstPass = Math.ceil(HERO.frameCount / 4);
    var done = 0;
    var next = 0;
    var active = 0;
    var playable = false;
    function pump() {
      while (active < 6 && next < order.length) start(order[next++]);
    }
    function start(index) {
      active++;
      var img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = function () {
        active--;
        done++;
        if (img.naturalWidth) frames[index] = img;
        if (sequenceOn) drawFrame(Math.round(frameState.frame));
        if (!playable) {
          onProgress(done / firstPass);
          if (done >= firstPass) { playable = true; onPlayable(); }
        }
        pump();
      };
      img.src = HERO.framePath(index);
    }
    pump();
  }

  // Short line + button: arrive on the first scroll, the headline glides up to make room
  function moreOffset() {
    return heroMore.offsetHeight + parseFloat(getComputedStyle(heroMore).marginTop || 0);
  }
  function showMore() {
    if (moreShown) return;
    moreShown = true;
    gsap.to(heroHead, { y: 0, duration: 1.5, overwrite: true });
    gsap.to(heroMore, { autoAlpha: 1, y: 0, duration: 1.4, delay: 0.12, overwrite: true });
  }
  function hideMore() {
    if (!moreShown) return;
    moreShown = false;
    gsap.to(heroMore, { autoAlpha: 0, y: 20, duration: 0.7, overwrite: true });
    gsap.to(heroHead, { y: moreOffset(), duration: 1.3, overwrite: true });
  }

  function renderSequence() {
    var p = frameState.frame / (HERO.frameCount - 1);
    drawFrame(Math.round(frameState.frame));
    if (heroVeil) heroVeil.style.opacity = (clamp01((p - HERO.veilFrom) / (1 - HERO.veilFrom)) * HERO.veilMax).toFixed(3);
    if (p > HERO.moreAt) showMore();
    else if (p < HERO.moreBack) hideMore();
    if (heroScroll) heroScroll.classList.toggle('is-away', p > 0.03);
    if (heroProgress) heroProgress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  function enableSequence() {
    if (sequenceOn || !canSequence) return;
    sequenceOn = true;
    root.classList.add('hero-seq');
    if (heroVideo) { heroVideo.pause(); heroVideo.classList.remove('is-playing'); }
    moreShown = false;
    gsap.set(heroMore, { autoAlpha: 0, y: 20 });
    gsap.set(heroHead, { y: moreOffset() });
    if (!framesRequested) loadFrames(function () {}, function () {});
    sequenceTween = gsap.to(frameState, {
      frame: HERO.frameCount - 1,
      ease: 'none',
      duration: 1,
      onUpdate: renderSequence,
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true
      }
    });
    renderSequence();
  }

  function disableSequence() {
    if (!sequenceOn) return;
    sequenceOn = false;
    root.classList.remove('hero-seq');
    if (sequenceTween) {
      if (sequenceTween.scrollTrigger) sequenceTween.scrollTrigger.kill();
      sequenceTween.kill();
      sequenceTween = null;
    }
    frameState.frame = 0;
    moreShown = true;
    gsap.set(heroHead, { y: 0 });
    gsap.set(heroMore, { autoAlpha: 1, y: 0 });
    if (heroVeil) heroVeil.style.opacity = 0;
    if (heroScroll) heroScroll.classList.remove('is-away');
    if (heroProgress) heroProgress.style.transform = 'scaleX(0)';
    startVideo();
    ScrollTrigger.refresh();
  }

  // Phones and tablets: the film plays as a muted loop over the poster
  var videoObserver = null;
  function startVideo() {
    if (!heroVideo || reduceMotion || sequenceOn) return;
    if (!heroVideo.getAttribute('src')) {
      heroVideo.setAttribute('src', heroVideo.getAttribute('data-src'));
      heroVideo.addEventListener('playing', function () { heroVideo.classList.add('is-playing'); });
    }
    var play = function () {
      var attempt = heroVideo.play();
      if (attempt && attempt.catch) attempt.catch(function () {});
    };
    play();
    if (!videoObserver && 'IntersectionObserver' in window) {
      videoObserver = new IntersectionObserver(function (entries) {
        if (sequenceOn) return;
        if (entries[0].isIntersecting) play();
        else heroVideo.pause();
      }, { threshold: 0.05 });
      videoObserver.observe(hero);
    }
  }

  // Live clocks
  function startClocks() {
    if (!heroClocks || !window.Intl) return;
    var items = Array.prototype.slice.call(heroClocks.querySelectorAll('[data-clock]')).map(function (el) {
      var format = null;
      try {
        format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: el.getAttribute('data-clock') });
      } catch (error) { format = null; }
      return { el: el, format: format };
    });
    var tick = function () {
      var now = new Date();
      items.forEach(function (item) {
        if (!item.format) return;
        var value = item.format.format(now);
        if (item.el.textContent !== value) item.el.textContent = value;
      });
    };
    tick();
    setInterval(tick, 5000);
  }

  // Intro: bars open, then label, headline line by line, frame, clocks, scroll cue
  var titleLines = [];
  function splitTitle() {
    titleLines = [];
    heroSplits.forEach(function (el) { titleLines = titleLines.concat(splitLines(el)); });
  }

  function armIntro() {
    var bars = hero.querySelectorAll('.hero-bar');
    var frameEdges = hero.querySelectorAll('.hero-frame span');
    gsap.set(bars, { scaleY: 1 });
    gsap.set(heroMedia, { scale: 1.06 });
    gsap.set(titleLines, { yPercent: 110 });
    gsap.set(heroLabel, { autoAlpha: 0, y: 14 });
    gsap.set(heroLabel.querySelector('.hero-label-line'), { scaleX: 0 });
    gsap.set([frameEdges[0], frameEdges[2]], { scaleX: 0 });
    gsap.set([frameEdges[1], frameEdges[3]], { scaleY: 0 });
    gsap.set([heroClocks, heroScroll], { autoAlpha: 0 });
    if (!sequenceOn) gsap.set(heroMore, { autoAlpha: 0, y: 20 });
  }

  function playIntro() {
    var bars = hero.querySelectorAll('.hero-bar');
    var frameEdges = hero.querySelectorAll('.hero-frame span');
    var tl = gsap.timeline({ delay: 0.45, onComplete: function () { introDone = true; } });
    tl.to(bars, { scaleY: 0, duration: 2.4, ease: 'power3.inOut' }, 0)
      .to(heroMedia, { scale: 1, duration: 3.4 }, 0.1)
      .to(heroLabel.querySelector('.hero-label-line'), { scaleX: 1, duration: 1.4 }, 1.3)
      .to(heroLabel, { autoAlpha: 1, y: 0, duration: 1.4 }, 1.35)
      .to(titleLines, { yPercent: 0, duration: 1.6, stagger: 0.12 }, 1.5)
      .to(frameEdges, { scaleX: 1, scaleY: 1, duration: 1.6, stagger: 0.14, ease: 'power3.inOut' }, 1.5)
      .to(heroClocks, { autoAlpha: 1, duration: 1.4 }, 2.4)
      .to(heroScroll, { autoAlpha: 1, duration: 1.4 }, 2.6);
    if (!sequenceOn) tl.to(heroMore, { autoAlpha: 1, y: 0, duration: 1.4 }, 2.1);
  }

  /* START ---------------------------------------------------------------------
     Wait for fonts and the first pass of hero frames (or the poster on phones),
     then lift the preloader and play the intro. */
  function markReady() { root.classList.add('is-ready'); }

  function whenFontsReady() {
    return new Promise(function (resolve) {
      var finished = false;
      var finish = function () { if (!finished) { finished = true; resolve(); } };
      setTimeout(finish, 2500);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(finish);
      else finish();
    });
  }

  function whenHeroReady() {
    return new Promise(function (resolve) {
      var finished = false;
      var finish = function () { if (!finished) { finished = true; setProgress(1); resolve(); } };
      if (!hero) { finish(); return; }
      setTimeout(finish, 8000); // never hold the page hostage on a slow line
      if (canSequence && desktopQuery.matches) {
        loadFrames(setProgress, finish);
      } else if (heroPoster && !(heroPoster.complete && heroPoster.naturalWidth)) {
        setProgress(0.4);
        heroPoster.addEventListener('load', finish);
        heroPoster.addEventListener('error', finish);
      } else {
        finish();
      }
    });
  }

  function start() {
    startClocks();

    if (!hero) { markReady(); return; }

    if (!hasGsap || reduceMotion) {
      // Still page: poster only, everything visible
      markReady();
      return;
    }

    splitTitle();
    if (desktopQuery.matches) enableSequence();
    armIntro();
    if (!sequenceOn) startVideo();
    markReady();
    playIntro();

    // Crossing the 1024px line switches between the scrubbed film and the looping video
    var onBreakpoint = function (event) {
      if (event.matches) enableSequence();
      else disableSequence();
    };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpoint);
    else desktopQuery.addListener(onBreakpoint);

    // Re-split the headline when the width changes
    var lastWidth = window.innerWidth;
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!introDone) return;
        splitTitle();
        if (sequenceOn && !moreShown) gsap.set(heroHead, { y: moreOffset() });
      }, 200);
    }, { passive: true });
  }

  var startedAt = performance.now();
  Promise.all([whenFontsReady(), whenHeroReady()]).then(function () {
    // Keep the preloader up for a beat so it never flashes
    var wait = Math.max(0, 900 - (performance.now() - startedAt));
    setTimeout(start, wait);
  });
})();
