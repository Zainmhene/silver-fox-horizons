# Where we stopped (2026-11-22)

## v4 (2026-11-22, separate track in `v4/`): cinematic homepage demo from Moudy's written brief
- Runs alongside v3 in `site/` and touches nothing there. Started in another session after Moudy pasted a full brief ("keep the current palette and fonts") and said "go".
- New build in `v4/` (`index.html`, `css/style.css`, `js/main.js`, `assets/`).
- Process: ONE section at a time in brief order (Header, Hero, Mandate, About, Expertise, Approach, Map, Insights, Closing, Footer). After each: Playwright at 1440x900 and 390x844, review, fix, stop for Moudy. Never change a finished section unless asked.
- Asset rules in that brief: never edit, regenerate, cut out, upscale or add images. CSS blending only. Videos compressed with ffmpeg.
- Tokens: bg `#0A0D13`, ivory `#F3EEE6`, gold `#C9A06E`, Oswald + Nunito. Oswald has no italic: the gold hero line is upright Oswald Light.
- `v4/assets/` holds the eight originals under the brief's names, copied from: `governance.jpg` = source/IMG_3996.JPG, `positioning.jpg` = IMG_3999.JPG, `tower.jpg` = IMG_3988.JPG, `portrait.png` = source/D28333D6...png (unedited 1213x1296), `map-night.jpg` = source/nasa/black-marble-africa.jpg, plus hero/investment/closing.mp4. `hero.mp4` is only 1280x720.
- Libraries local in `v4/js/vendor/`: GSAP 3.15.0, ScrollTrigger, Lenis 1.3.27.
- Preview: launch config `silver-fox-v4` (port 5184) in `Desktop/Claude/.claude/launch.json`.
- **Done: 1 Header** (transparent, blurred plate after scroll, centred links, 44px compact button in the bar, full-screen menu under 1024px). `index.html` has a temporary 220vh spacer in `<main>`: remove it when the Hero is built.
- **Next: 2 Hero**, only after Moudy approves the Header.

## Status (2026-11-22): hero, tiles and the lady's section APPROVED by Moudy. Map section (Focus) rebuilt to his second brief, waiting for his verdict.

## Status (2026-11-22, latest): hero, tiles, the lady's section and Focus (map) all APPROVED by Moudy. Mobile polish pass (update 14) APPROVED ("Looks good"). Next section to be picked together.

## v3 update 17 (2026-11-22): contact section + footer, demo prep, git
- What was added:
  - `#contact` replaces the old `#next` placeholder. It is navy, with the closing line "Let's talk about what comes next." (a DRAFT), contact details as bracketed placeholders, and an enquiry form (name, organisation, email, area of interest, message).
  - The form is DEMO ONLY: it checks the fields, then says "Thank you. This is a demo, so your message was not sent."
  - Footer: logo, nav, a placeholder for social links, © 2026, and placeholders for Privacy and Terms.
- Checked at 1440 and 390: no console errors, no sideways scroll.
- The header and menu still link to `#insights`, which doesn't exist yet.
- Git:
  - Repo initialised (`main`, first commit 885a423). `.claude/skills/` added to `.gitignore`.
  - Remote: https://github.com/zainmhene/silver-fox-horizons.git. Moudy's GitHub username is `zainmhene`; "ZainDStyles" is only his git display name.
  - PUBLIC + GitHub Pages: Moudy created the repo, then we push and turn on Pages (main / root).
  - Demo link (LIVE, checked 2026-11-22): https://zainmhene.github.io/silver-fox-horizons/site/
    - Checked at 1440 and 390: every request loads, no console errors, stats count, map glows, no sideways scroll.
    - `.nojekyll` is in the repo root.
    - Pages redeploys from `main` after each push.
- `gh` CLI is not installed.

## v3 update 16 (2026-11-22): faint dot texture in the Expertise section (Moudy's brief, item 2)
- New `site/dot-texture.js`, used through `<canvas class="dot-canvas" data-dot-texture>` as the first child of `#expertise`.
  - Same settings as the Focus texture in impact-map.js: navy and copper dots, the same density and sizes, opacity .07-.24, denser near the edges, a slow drift.
  - Runs only while on screen; reduced motion gets a still texture; it rebuilds when the section resizes.
  - Focus keeps its own copy in impact-map.js, which was left untouched.
- Layering: the canvas sits at z-index 0, and `.tiles-head` and `.tiles` at z-index 1. The cards are opaque, so dots never show through the photos. Card 01 still has one image (kids-smile.webp).
- Desktop tile positions were checked unchanged; the phone swipe row still works.
- APPROVED by Moudy ("Looks good").
- Item 1 of that brief was not in the paste.
- Screenshots: `.playwright-mcp/tiles-before-1440.png`, `tiles-after-1440(-zoom).png`, `tiles-after-390.png`.

## v3 update 15 (2026-11-22): About portrait edge blend, CSS only (image file untouched)
- What changed:
  - `.about-photo` gets a `--edge-mask`: left fade 18%, bottom fade 20%, the right edge keeps its 9%, plus a wide soft ellipse for the outer corners.
  - Phones have their own `--edge-mask`: left 15%, bottom 32%, a wide ellipse.
  - Her face, earrings and head wrap stay fully visible.
- `.about-photo::after`: a low navy tone on her outer edges and the shirt bottom. It is masked by the same cut-out file (`mask-image: url(...)`) plus the edge mask, so it can never draw a box. It scales with the image during the reveal.
- APPROVED by Moudy ("Looks good").
- Screenshots: `.playwright-mcp/about-before/after-1440(.zoom/-diag).png`, `about-before/after-390(-diag).png`. The diag shots are brightness-boosted to show edges.

## v3 update 14 (2026-11-22): mobile polish pass (phones only, desktop checked unchanged at 1440)
- Hero (≤767px):
  - darker bottom shade, a soft dark pool behind the text, and a text shadow;
  - one short line instead of the paragraph ("Partnering with governments and institutions across Africa.", Moudy's wording);
  - "Explore Our Expertise" is the only button ("Get in touch" stays in the menu, the header and the tiles section);
  - headline line-height 1 → 1.12;
  - "Scroll" hint at the bottom left.
  - Video and behaviour untouched.
- The full hero paragraph now shows on phones under the "We work at the intersection…" heading (`.tiles-intro`, hidden on desktop).
- Expertise cards 02–04 on phones:
  - a swipe row (`.tiles-rail`), with `display: contents` on desktop so the grid is unchanged;
  - cards 85% wide, CSS scroll-snap, 3 dots (`.tiles-dots`) that follow the scroll and can be tapped.
- Focus stats: illustrative EXAMPLE numbers 25+, 15+, $2B+. They are NOT client claims; the HTML comment says to replace them before launch.
  - Count-up runs from 0 on scroll entry (ScrollTrigger 'top 85%'); confirmed on mobile.
  - City glow: unchanged, runs in view and pauses off-screen (confirmed).
- CSS/JS links now carry `?v=mob3`, because the local server let the browser keep an old main.js. Bump the version after edits.
- Proof screenshots are in `.playwright-mcp/`: mob-before-*, mob-after-hero2, mob-after-intro, mob-after-cards-1/2/3, mob-after-focus-a/b, desk-after-hero, desk-after-tiles.

## v3 update 13 (2026-11-22): Focus (brief 3) finished and checked, APPROVED ("Looks good")
- Western Sahara fixed: in the data "Morocco" covers WS's coast and "W. Sahara" is only the inland part. WS = Morocco clipped south of 27°40'N joined with the "W. Sahara" shape (shared edges dropped, 140/140 chained). Morocco = clipped north. Dashed border, no gaps.
- Arcs cut to 4 calm ones (Cairo→London, Accra→New York, Addis→Dubai, Johannesburg→Dubai), cubic curves. London rises above the continent, New York dips south over the ocean. 8 signals, out and back, 7.5-13s. Phones: 3 arcs (no Johannesburg), with London/New York just above the map's top-left and Dubai top-right.
- Hubs stay within ~360px of the map on wide screens. Extra space between the stats and the map (stage margin) so the London arc clears Tunisia.
- City tags: open sea preferred, but a tag may sit over land next to its city (+45 score). Tags have a thin light outline so they read on the navy. Never over other tags, cities, arcs, leaders or the text. Order: Kigali, Nairobi, Addis, Johannesburg, Cairo, Lagos, Accra. Phone map is 86% wide.
- Glows: scroll from map top at 80% to map bottom at 98%; arcs draw after; hub labels 1.5s later.
- Checked: 1440 and 390 (no tag overlaps, no sideways scroll, no console errors), hover (Libya/Niger names show), reduced motion (glows on, arcs drawn, no signals, halos still).

## v3 update 12 (2026-11-22): Focus rebuilt to brief 3 (concept image + country map)
- Done: new centred layout (Our Focus / "Connecting Africa to Global Opportunity." / Trade · Investment · People · Innovation / stats row 00+ Partner Cities, Countries, Investment Facilitated). Map is an inline SVG of real countries made by scratchpad `scripts/focus-map-svg.js`. Western Sahara is split from the data's Morocco shape at 27°40'N, with a dashed border. Somaliland is merged into Somalia. The 7 hub countries have inner copper glows (clip paths).
- `site/impact-map.js` rewritten: drifting navy and copper dot texture, glows lit by scroll, city points with halos, navy pill tags (auto-placed in clear space), 6 arcs to London, New York and Dubai with signals out and back, hover/tap names, stats count once, pause off-screen, reduced motion shows the final state.
- First check at 1440: 7 glows and 7 tags on, no console errors, no sideways scroll. Hub labels were not yet on when checked (they appear 1.5s after the arcs).
- STILL TO DO: review the 1440 screenshot (`.playwright-mcp/focus3-1440.png`) against the concept, check the arcs, signals and hub labels, test 390 (mobile), test reduced motion, fix anything flat or cluttered.

## v3 update 11 (2026-11-22): Focus section map rebuilt (Moudy's two pasted briefs)
- Brief 1 (dot-matrix grid, pinned 200vh, sweep, cities, arcs with lights, tilt) was built, then replaced by brief 2: "no grid", keep the scattered dot texture, map only in the centre column, labels never on dots/lines/labels, calm.
- Text now: "Our Focus" / "A Continent of Opportunity." / same paragraph / "Partner with us →". Stats are placeholders `00+`, `00+`, `$00B+` (`data-count="0"`). Put the real number in `data-count` and it counts up; at 0 the "00" just fades in (no fake numbers flash by).
- Files: `site/impact-map.js` (canvas), `site/africa-mask.js` (6 KB inside/outside mask of Africa, 2 map units per cell, made from `assets/africa-countries.geo.json` by scratchpad `scripts/africa-dots.js`, step 2). `site/africa-dots.js` (grid) deleted.
- How it works: faint navy texture (alpha .1, density 0.004/px², kept off the text). Texture dots inside Africa plus extra jittered dots darken to navy, with random delays. Then 7 copper glows (Cairo, Lagos, Accra, Addis Ababa, Nairobi, Kigali, Johannesburg) turn their dots copper and pulse slowly (5.5s). Then 3 faint arcs (0.75px, copper .42) from the coast (Dakar, Tangier, the Horn) to New York (left), London (top) and Dubai (right).
- Labels are placed automatically (`placeLabels`): the nearest clear spot not touching land, arcs, other labels, leaders, cities, the text/stats or the screen edge. A heavy penalty applies if a label sits nearer another city. Placement order: Nairobi, Kigali, Addis, Johannesburg, Cairo, Accra, Lagos. Phone labels are 8px.
- Desktop: pinned `+=200%`, scrub 1. Beats: emerge .02-.46, glows .46-.76, arcs .76-.96. Stats count after the glows. Phone: no pin, map above the text (CSS `order: -1`); it emerges as it scrolls in, then glows and arcs play once (7.5s). Reduced motion: final state, still.
- Check helper in the browser: `window.__impactCheck()` returns any overlaps. 0 issues at 1440x900 and 390x844, including reduced motion.

## v3 update 10 (2026-11-22): map section (`#impact`), cream (superseded by update 11)
- Moudy picked "Cream map" from 3 options (cream / dark glowing / gold-line network). Order now: hero (navy) > tiles (cream) > lady (near-black) > impact (cream) > placeholder.
- Copy (placeholder, mine): "Our Impact" / "Building Lasting Impact." / "Reform, reputation and investment work that keeps delivering after the first meeting, in countries across the continent." / link "A continent of opportunity →" (#contact). Counter 04 / 05.
- DEMO (not client facts): 15 focus countries (Morocco, Egypt, Senegal, Côte d'Ivoire, Ghana, Nigeria, Ethiopia, Kenya, Rwanda, Uganda, Tanzania, Angola, Zambia, Botswana, South Africa) and figures 50+ partnerships, 15+ countries, $5B+ facilitated (from the ChatGPT mock).
- Map is an inline SVG made from `assets/africa-countries.geo.json` by scratchpad `scripts/africa-svg.js` (equirectangular, 53 countries; Cabo Verde, Seychelles and Mauritius left out; points thinned; 54 KB). To change focus countries, edit FOCUS/CITIES in the script, rerun it, and replace the `<svg class="map-svg" ...>...</svg>` block in index.html (node replace).
- Motion (once, on entry): continent fades in, focus countries turn bronze one by one, city dots pop, stats rise, numbers count up (GSAP). Country name label follows the pointer on hover. `.impact` has overflow hidden so the label never causes sideways scroll.
- Checked 390, 1024, 1290, 1440, 1920: no overflow, no console errors.

## v3 update 9 (2026-11-22, latest): AI outline for her cut-out (no more cuts)
- Moudy still saw cuts on her face. My colour-rule outline bit into her forehead by the head wrap and notched her brow.
- Now: free local tool **rembg** with the **BiRefNet portrait** model gives only the outline. Installed at `C:/Users/MouDy/tools/rembg/venv` (Python 3.12, rembg 2.0.87); model (973 MB) cached in `C:/Users/MouDy/.rembg/models/`. Reusable for any client.
- Scripts in scratchpad: `scripts/cutout.py` (runs the model and saves the mask), `scripts/compose.py` (mask >= 253 counts as solid: alpha 255 with the original pixels copied exactly; soft edge colours decontaminated with pymatting). Run with `C:/Users/MouDy/tools/rembg/venv/Scripts/python.exe -I`.
- Result `assets/about-portrait-original-cut.webp` (lossless): 781,974 fully visible pixels, 0 differ from the original. A red overlay check shows only wall removed (face, lashes, wrap, earrings, blouse intact; wall through the hoops removed).
- The img src carries `?v=ai1` so browsers drop the old cached copy. Bump it when the file changes.

## v3 update 8 (2026-11-22): her ORIGINAL photo, not the upscale
- Moudy pasted a prompt (all-black site, Cormorant Garamond, CSS-only portrait) and then said "undo that, bring everything before this prompt". All of it was undone; recycled files were restored. Do not redo that prompt.
- Moudy: keep the dark background, the map and everything, but "the lady needs to be the 2nd image" = his original photo. The Higgsfield 4K upscale and my colour grade had changed her face.
- New file `assets/about-portrait-original-cut.webp` (1213x1296, lossless WebP): his original `assets/source/D28333D6-...png`, not upscaled, not recoloured. Only the stone wall is removed. Every fully opaque pixel equals the original (verified in node: 0 of 764,978 differ).
- How the cut-out was made (scratchpad `scripts/fill-rows.js`): soft colour mask, then a row-by-row trace that keeps her solid. The wall's red minus green is 5-16; her skin, eyes and wrap are 21+ or very dark. The forehead shadow band under the wrap is bridged. The trace stays inside the earlier mask at the right and chest edges. The blouse's bottom-left edge is cut along a line.
- ffmpeg gotcha: check pixels by decoding to raw rgba/rgb and comparing in node. Filter-based diffs (format/extractplanes/mergeplanes) gave false results.
- Fix after Moudy's "edges look cut": the far eye's long lashes (over the wall) had been trimmed. They are restored with a darkness key around the far eye (x 388-472, y 495-565): a lash is kept if darker than the wall (wall brightness 100-113). Every fully visible pixel still equals the original (0 of 765,398 differ).
- Globe left is now capped (`min(...)`) so on very wide screens (2560) its bright rim stays below and left of the text. 1440/1920/phone unchanged.
- Page uses only this portrait now (no srcset). The upscaled/darkened/cut versions (`about-portrait-*.webp`, `about-portrait-cut-*.webp`, `assets/source/portrait-headwrap-*.png`) are unused but kept.

## v3 update 7 (2026-11-22): About on near-black with Africa at night behind her
- Moudy: "darker background with tiny bit of the map visibility behind her", like the ChatGPT About panel.
- Section background `--night #0A0D13` (set on `.about` only; header stays navy).
- Her portrait is now a cut-out with transparency (`about-portrait-cut-1000/1600/2400.webp`, source `assets/source/portrait-headwrap-cut-2400.png`), made locally from the darkened 2400 version with a soft saturation/brightness mask. No credits.
- Globe: NASA Black Marble 2012 "Africa, Europe, and the Middle East" (public domain), original 8192px from images-assets.nasa.gov (`GSFC_20171208_Archive_e001591`), saved in `assets/source/nasa/`. Web file `about-globe.webp` (2000px, land and ocean darkened, lights warmed to gold). Shown with `mix-blend-mode: screen` at .7 opacity, sized 1.7x section height, Africa centred behind her: Mediterranean coast and Nile at top left of her head, South Africa lights at the bottom. A left gradient keeps the text side clean. Fades in once on entry.
- Section height fixed: `--H: clamp(620px, min(100vh, 62vw), 980px)`; portrait 108% of it, so the head wrap is always cut by the top edge (fixes Moudy's "what is this": the photo had shown as a floating box with a flat-cut head wrap). Values placed from the portrait (`--pl`, `--ph`).
- Gold arc removed earlier (`about-arc-mask.png` unused). Old `about-portrait-1000/1600/2400.webp` (non-cut) now unused too.
- Checked 1290x985 (Moudy's window), 1440x900, 1600x1000, 1920x1080, 1280x720, 1024x768, 390x844: head wrap always cut at top, values clear of her, text clear of her face, no overflow, no console errors.

## v3 update 6 (2026-11-22): About rebuilt to match Moudy's ChatGPT reference
- Moudy rejected v1 of the section ("make it like this", ChatGPT about crop in `design-reference/mood-01-about-impact.png`).
- Portrait background: stone wall darkened toward navy locally with ffmpeg (saturation + brightness mask, ellipses protect face/lips/neck/chest). Source `assets/source/portrait-headwrap-dark-2400.png`; web files `about-portrait-1000/1600/2400.webp` replaced. No credits used.
- Layout: photo box keeps the photo's shape (115% of section height, face just right of centre, head wrap cut at top); two-line Oswald title (all ivory, no accent); "ABOUT US ——" eyebrow with trailing rule; gold "Our approach" link; values in small Nunito with ticks on a thin gold line at right; "03 / 05" counter bottom left; thin gold arc passes behind her (SVG masked by `assets/about-arc-mask.png`, her silhouette) and draws on entry.
- Kept Moudy's fonts (Oswald/Nunito) rather than the reference's serif, for consistency with the hero and tiles.
- Fix after Moudy's screenshot: the gold arc cut through the values at his window size (1236 wide). Arc removed (`assets/about-arc-mask.png` now unused). Portrait width capped at 60vw (`--ph`), values positioned from the portrait (`--pc` + 0.465 x `--ph` + 2.5rem) so they always sit 40px clear of the head wrap. Checked 1236x985, 1440x900, 1920x1080, 1280x720, 1024x768, 390x844.
- Checked 1440x900, 1920x1080, 1024x768, 390x844: no overflow, no console errors.

## v3 update 5 (2026-11-22): the lady's section (About), first version (rejected)
- Tiles approved by Moudy. Page = hero (navy) > tiles (cream) > About (navy) > placeholder.
- Moudy's picks: navy, placed after the tiles; Higgsfield 4K upscale; my paragraph ("We work alongside the people shaping Africa's next chapter...").
- Portrait: Moudy's head-wrap photo (`assets/source/D28333D6-...png`, 1213x1296) upscaled on Higgsfield (bytedance 4K, 2 credits, balance now 13.34) to `assets/source/portrait-headwrap-4k.png` (3840x4096). Web sizes with house grade: `about-portrait-1000/1600/2400.webp`.
- Layout: portrait on the right 62%, stone wall fades into navy on the left, title "Strategic Advisory for a Stronger Africa." (bronze accent), paragraph, "Our approach" link, three values (01 Trusted Advisor, 02 Global Perspective, 03 African Focus) on a bronze line at bottom right over her black top. Phones: portrait on top fading into navy, text over its lower edge, values stacked.
- Motion (once, on entry): portrait opens from the right, bronze line draws down, values follow. CSS transitions started by a ScrollTrigger class (`.about.is-in`).
- Checked at 1440x900, 1920x1080, 390x844: no overflow, no console errors.

## v3 update 4 (2026-11-22): Moudy's tile picks
- Tile 01 back to the smiling boy photo (`kids-smile.webp`), shown still with no drift. Moudy: "keep this kid section".
- Tile 04 back to the night flyover/bridge clip (`interchange-night.mp4`, 1600x900). Moudy: "bring the bridge one back".
- `tile-ny-walk.mp4` and `tile-port.mp4` are now unused but still in `assets/`.
- Tiles 02 (strip) and 03 (Cape Town) are unchanged. Next: Moudy's verdict on the whole tiles section, then pick the next section together.

## v3 update 3 (2026-11-22): back to ONE section at a time
- Moudy did not agree to the About and montage sections I added in one go. Both removed from the page, markup kept in `site/parked-sections.html` (CSS still in style.css). Page = hero + expertise tiles only.
- Rule from Moudy: tiles use REAL video clips, not animated stills, and each clip must fit its tile's shape and meaning. Show clip options first, build after he picks.
- Tiles now (all Pexels 4K sources, house grade, cut by scratchpad `tile-clips.ps1`):
  - 01 tall: `tile-ny-walk.mp4` (Pexels 5975254, woman in beige blazer walking a New York street), 1080x1920.
  - 02 wide: `tile-strip.mp4` 1920x662, 5 clips x 2.2 s hard cuts: solar farm 7042814, boys at laptop 11025557, open market 3967176, office team 8632607, boys studying 11025389. Caption under the title follows the clip (Energy, Technology, Trade, Work, Education).
  - 03: `tile-capetown.mp4` (9324436 Cape Town aerial). 04: `tile-port.mp4` (10391545 container cranes, top-down).
- `gsap.ticker.lagSmoothing(0)` so reveals finish on time while videos decode.

## v3 update 2 (2026-11-22, late): navy + sand, Moudy's fonts, 4K, house grade
- Palette (from Moudy's ChatGPT example): navy `--navy #121A27` for dark sections/header, sand `--sand #ECE2CF` (About), cream `--cream #F5EEE2` (tiles), bronze-tan `--gold #C9A06E` on navy, `--accent-ink #8A5E30` on sand.
- Fonts (from Moudy's favourites list): Oswald (headlines, uppercase), Nunito (text), BBH Bogle (big statements, e.g. montage). Scripts/playful ones in his list left out for a government audience. Oswald has no italic: accents are bronze + weight 300.
- Tile 01 = kids photo (Moudy's, 1333x2000). Tile 02 = mini montage crossfading every 2.6s with changing caption: parliament (Governance), Pexels solar farm Eswatini (Energy), coder Nairobi (Technology), classroom Tanzania (Education), woman in hard hat with phone (Infrastructure). Pexels IDs 39382227, 19805876, 6059407, 11174193; 4K originals in `assets/source/`.
- House grade for photos (scratchpad `grade-photos.ps1`): shadows lean navy, highlights warm sand, contrast 1.06, saturation .94. Apply to every new photo/video.
- Not 4K yet: kids photo, Kigali Convention Centre (2000x960), interchange video (1080p), head-wrap portrait (1213px, AI). Montage not re-graded yet. Waiting for Moudy's video pack.

## v3 update (2026-11-22, evening): light/dark rhythm, new fonts, portrait section, montage
- Peer research (live sites): TBI white/black + PP Editorial New/Aeonik; Brunswick warm cream #F6F6EF + ultramarine #0B0384, Petit Serif/Helix; DGA navy #02003B + royal + sand; Africa Practice navy #202339 + plum, Outfit. Lesson: light base + one deep colour, dark only for big moments.
- Palette now: ivory `--paper #F2EDE3`, ink `--ink #141210`, bronze accent (`--gold #C9935F` on dark, `--accent-ink #8A5327` on light). Champagne dropped.
- Fonts now: **Bespoke Serif** (headlines, real italics) + **Switzer** (text), Fontshare, free commercial. Gilda/Hanken dropped. Note: Fontshare is not allowed in claude.ai artifacts; self-host the font files before publishing there.
- Page order: Hero (dark video) > About (light: portrait, "Strategic Advisory for a Stronger Africa.", values 01-03) > Montage (dark: `assets/montage.mp4`, 10 cuts x 1.3s, built by scratchpad `make-montage.ps1`, line "Working with governments, institutions and investors.") > Expertise tiles (light; tile 01 now Kigali tower daytime) > placeholder.
- Montage needs more real faces (TBI's strength is people). Ask Moudy for clips (Pexels: "African businesswoman portrait slow motion", "Lagos street", "Nairobi office") or generate.

## v3: building together, one section at a time (current work)
Moudy rejected all six directions. New process: build one section, review together, then the next. Work lives in `site/` (index.html, style.css, main.js), assets from `../assets/`.
- **Hero (done, "Classic" layout chosen by Moudy):** night aerial clip (14294714_7, 4K), graded warm gold on deep black. Desktop: pinned ~260vh, scroll scrubs 120 AVIF frames, `assets/hero-seq-1920/` (17.9 MB) or `hero-seq-2560/` (21.8 MB) picked by screen size, WebP `hero-seq/` as fallback. AVIF frames must be written one file at a time (ffmpeg `-f image2` batch output does not decode in browsers): script in scratchpad was `make-avif-frames.ps1`. Phones: vertical cut `assets/hero-night-portrait.mp4` (1080x1920, 5.1 MB).
  - Type: **Gilda Display** (headlines, no real italic, so never italicise it) + **Hanken Grotesk** (text). Accent **champagne #E3CBA0**. Square buttons, no pills.
  - Layout: text on the left with a thin champagne vertical line, kicker "International Strategic Advisory", "Shaping Africa's Future." + champagne "Connecting Global Opportunity.", mandate, solid "Explore Our Expertise" + "Get in touch →" link, 01/05 counter bottom right.
  - Comparison pages kept for reference: `site/fonts.html`, `site/styles.html`, `site/layouts.html`. Editorial version saved in `site/editorial/`.
- **Expertise tiles (built, waiting for feedback):** section `#expertise` after the hero, from Moudy's screen recording (four-tile grid). Heading = client's positioning line (second half muted). Tiles: 01 portrait "Strategic Advisory for a Stronger Africa." (tall left), 02 Statecraft (parliament, AI, wide top), 03 Nation Branding (real Kigali Convention Centre at night, `governance.webp`, image lifted so the dome clears the text), 04 Investment (real night interchange video `interchange-night.mp4`, plays only on screen). Kigali tower daytime photo saved for the future light section; purple dome video skipped (colour clash). Stills drift slowly; tiles rise in on scroll. Rounded 18px tiles, square buttons.
- **Agreed next sections:**
  - About must look like the mood image (`design-reference/mood-01-about-impact.png`): large portrait right, headline left, vertical values list.
  - Not black only: one light section like the cream map mock (ivory panel, dark Africa map, copper countries, port photo) so investors are not shown dark image after dark image.
  - Tile section from Moudy's screen recording: grid of four tiles, each with a slow living video, number, short line, button.
  - Keep from the six directions: 01 Golden Hour contact (corridor, "Let's Build What's Next."), 06 Embassy gold-line map with cities and tropics, 01 Golden Hour "How We Work" with the bronze curve.

# Earlier (2026-11-21, evening)

## Where things are
- **v1** (root `index.html`, `style.css`, `main.js`): rejected by Moudy as "a template with photos on". Kept only for reference.
- **Six v2 directions**, each a complete homepage in `directions/<nn-name>/` (index.html, style.css, main.js, own `assets/` copy):
  - `04-horizon`: my pick. One silver line across the site, images open out of it, Bodoni, chapters I-VIII.
  - `01-golden-hour`: the ChatGPT mock built properly (black frame, golden-hour images, gold rules, dot map).
  - `02-continent`: Africa in ~6,000 gold dots from real data, changes per expertise chapter.
  - `03-monolith`: New York black and white, giant type, video inside the letters of AFRICA.
  - `05-sovereign`: banknote/passport security print, guilloche medallion, deep green and gold.
  - `06-embassy`: the light one, ivory and ink, Articles I-III.
- Shared brief for all six: `directions/BRIEF.md`. Gallery page: `directions/gallery/` (screenshots in `shots/`).
- Gallery published (private): https://claude.ai/artifact/AoWuuyV8fRuZn2jxt2Apit
- Live versions of each direction are published from `directions/<nn>/publish.html` (a wrapper-less copy of index.html for the artifact host). If you change a direction, update publish.html too and republish to the same URL:
  - 01 Golden Hour: https://claude.ai/artifact/NpaEaNU3eE8FhEBM1fYTei
  - 02 Continent: https://claude.ai/artifact/Sx7ng25a15xtHJomnqZT1z
  - 03 Monolith: https://claude.ai/artifact/SkXcDFgDtyW38T9hxJDN2i
  - 04 Horizon: https://claude.ai/artifact/5VzFhVWERz2EWoHB7G2dKM
  - 05 Sovereign: https://claude.ai/artifact/PqA7HU4VhBj9a27xkJREPD
  - 06 Embassy: https://claude.ai/artifact/WrqrJA3gnc1ifcrnUmMKcT
  - Not yet checked in a signed-in browser (the in-app browser was signed out). Check each on desktop and phone first.

## Decisions made while Moudy was away (he approved "future decisions")
- Generated 8 images with Higgsfield GPT Image 2.6 (16 credits; 15.34 left). Originals in `assets/source/generated/`.
- Used two of the five new videos (African city aerial at dusk, second night aerial). Skipped the Brasilia Congress clip (Brazil, would be spotted) and the purple-lit dome (palette clash).
- Demo figures everywhere: 24 countries, $6.8B, 60+ programmes, 15 years. **Fake, for the mockup only.**
- Embassy: changed the portrait caption from "The Founder" to "Editorial portrait" (the model is not the client).
- Continent: raised the base dot brightness so Africa reads on phones.
- Published privately on claude.ai instead of a public GitHub page (unreleased client work with fake figures).

## Needs Moudy / the client
- Pick a direction (or a mix).
- Real figures, real articles, contact details, LinkedIn, logo.
- Embassy footnotes 1-2 (definitions of "state capacity", "investment diplomacy") were written by the builder: approve or replace.
- All photos except the Kigali/NASA/stock ones are AI-generated: fine for the mockup, the live site needs real or licensed photography.
- The portrait is a stock/AI model: swap for Moudy's realistic version or the client's own photo.

## Notes
- Preview server: `python -m http.server 5180 --bind 127.0.0.1` from the project folder, then `/directions/<nn-name>/`.
- Headless Chrome `--screenshot` with `#anchor` gives black frames on this machine; use Playwright or a CDP script for section screenshots.
- Not a git repo yet (ask before creating one).
