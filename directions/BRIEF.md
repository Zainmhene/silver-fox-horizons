# Silver Fox Horizons: six directions, shared brief

## The client and why this matters
Silver Fox Horizons is an international strategic advisory firm. The founder works in and around government and is extremely well connected. This homepage mockup must make her say "wow" and must hold up in front of ministers, heads of agencies and international investors. Budget feel: a $10k+ bespoke site by a top studio. The previous attempt was rejected as "a template with photos on it" and "AI slop". Do not repeat that.

Her own words: clean, sophisticated, professional, premium, understated, internationally credible. Reference: institute.global (Tony Blair Institute). Moudy (the designer) adds: elite, black, New York.

**Audience:** government officials (ministers, chiefs of staff, heads of agencies) and international investors/companies entering African markets. They are busy, senior, sceptical. They judge credibility in seconds. They do not want to be sold to.

## Content (use this copy; you may cut but not pad)

**Mandate (verbatim, must appear prominently):**
Silver Fox Horizons is an international strategic advisory firm partnering with governments, institutions and businesses to strengthen state capacity, elevate global influence and unlock investment opportunities across Africa.

**Positioning (verbatim):** We work at the intersection of statecraft, international positioning and investment diplomacy.

**Hero lines (may be adapted to your concept):** Shaping Africa's Future. / Connecting Global Opportunity.

**Expertise (titles and lines verbatim):**
01 Statecraft, Governance & Institutional Transformation: Helping governments strengthen institutional capacity, design and implement reforms, and improve public-sector performance.
02 Nation Branding, Strategic Communications & Global Positioning: Supporting governments in strengthening their international reputation, soft power and global visibility.
03 Investment Diplomacy, Market Access & Strategic Partnerships: Helping international companies and investors navigate African markets, engage with governments and develop strategic investment and commercial partnerships.

**About (placeholder copy):** We work alongside the people shaping Africa's next chapter. We bring policy, communications and commercial experience together, so that reform, reputation and investment move in the same direction.
Values: Trusted Advisor / Global Perspective / African Focus

**Demo figures (fake for the mockup, use these exact ones everywhere):**
24 African countries engaged · $6.8B investment facilitated · 60+ reform programmes supported · 15 years at the centre of government

**Approach:** 01 Understand: We start with the context: the institutions, the people and what has already been tried. 02 Strategise: We agree clear priorities and a realistic plan to reach them. 03 Partner: We work alongside your teams and bring in the right partners. 04 Deliver: We stay through implementation and measure what changes.

**Insights (sample articles):**
- Governance · 12 November 2026 · Building Delivery Units That Outlast an Election Cycle · What keeps a central delivery unit effective when leadership changes.
- Investment · 28 October 2026 · Engaging African Governments as an Investor · Practical lessons for companies entering markets where the state is a key partner.
- Nation Branding · 9 October 2026 · Reputation as a National Asset · Why a country's global image is built by its institutions, not its slogans.

**Contact:** Let's Build What's Next. / Tell us what you are working on. We will tell you honestly how we can help. / button: Contact Us

**Footer:** Strategic Advisory · Global Perspective · African Focus. Links: About, Expertise, Insights, Contact. LinkedIn icon (href="#"). © 2026 Silver Fox Horizons. Plus a small line: "Design concept. Figures and articles are placeholders."

**Voice:** plain, confident, short. Never use: leverage, seamless, empower, journey, unlock potential, cutting-edge, world-class, innovative, passionate, synergy, solutions (as a noun on its own), "we're more than".

## Required sections (order and form are yours)
Header with nav (About, Expertise, Insights, Contact) + "Get in Touch" + accessible mobile menu · Hero · Mandate · About · Expertise (all three) · Reach / impact with the demo figures (a map is welcome) · Approach · Insights (marked as sample) · Contact · Footer.

## Media (in your folder's `assets/`, reference as `assets/<file>`)
Photos (all natural colour, 16:9 unless noted):
- `hero-golden-city.webp` 1672x941: golden-hour African capital, government building, towers, river. Strongest hero image.
- `gen-parliament.webp`: pale stone colonnade, steps, palms, two suited figures, golden light. (governance)
- `gen-skyline-bluehour.webp`: East African capital skyline at blue hour, hills. (nation branding)
- `gen-port.webp`: container port, cranes, ship, sunset. (investment)
- `gen-architecture.webp`: dark curved bronze facade, thin gold light. (abstract, approach)
- `gen-state-room.webp`: empty walnut meeting room, light stripes. (diplomacy, about)
- `gen-capital-aerial.webp`: aerial capital at dusk, boulevards, roundabout. (reach)
- `gen-horizon-dawn.webp`: distant city on a flat sea horizon, pale gold sky, huge negative space.
- `gen-corridor.webp`: man in suit walking through glass corridor towards sunset skyline. (contact)
- `portrait.webp` 1400x1496: woman in patterned head wrap, gold earrings, looking up. (about)
- `woman-laptop.webp` 1000x1500 portrait: professional woman at laptop.
- `tower.webp` 1000x1500 portrait: Kigali tower, blue sky. `governance.webp`: Kigali Convention Centre at night, aerial. `positioning.webp` 1920x1920: Earth at night, Africa lower left. `insight-skyline.webp`, `insight-night.webp`: small thumbs.
Videos (muted, 1080p-ish, with posters):
- `hero.mp4` (+`hero-poster.webp`): drone flying forward between towers at sunset (Abuja).
- `investment.mp4` (+poster): skyline at sunset, gold haze (Nairobi).
- `closing.mp4` (+poster), `city-night-2.mp4` (+poster): night city aerials.
- `city-aerial-dusk.mp4` (+poster): African city aerial at dusk, overcast.
Map data (real, from Natural Earth 1:50m):
- `africa-countries.geo.json`: FeatureCollection, 56 African countries (Polygon/MultiPolygon, [lon,lat]).
- `africa-outline.geo.json`: MultiLineString of the continent's outer edge only.
- `africa-borders.geo.json`: MultiLineString of internal borders.
- `places.json`: `{ africa: {Lagos:[lon,lat], ...}, global: {London:[lon,lat], ...} }`.
Use a few images well rather than all of them. Never stretch, never use an image as wallpaper behind body text without a deliberate reason.

## Quality bar: what "not slop" means here
- A single, ownable concept that drives every decision. If a section could sit on any consultancy site, redesign it.
- Typography carries the design: a deliberate scale (at least one size that is genuinely big), tight display leading, real hierarchy, consistent label system. Body text readable: 16-18px, good contrast. Never grey-on-grey.
- A real grid. Alignments that line up across sections. Purposeful whitespace, not empty screens.
- Images treated with care: crops chosen, captions where useful (place, time), no muddy filters that kill the light.
- Detail layer that shows craft: indices, counters, hairlines, coordinates, small captions, considered hover states, focus states.
- Motion is slow, smooth, meaningful, never decorative noise. Reveal on scroll, line-by-line headlines, lines that draw. No bouncing, spinning, parallax soup, custom cursors, auto carousels, particle confetti, glassmorphism blobs, purple gradients, emoji, stock icon grids.
- Mobile is designed, not squashed: stacked, simpler motion, no pinning, no horizontal scroll at 375px.

## Technical rules
- Your files only: `directions/<your-folder>/index.html`, `style.css`, `main.js` (more files inside your folder are fine). Never touch anything outside your folder. Do not delete or rename the provided assets.
- Static HTML/CSS/JS. No build step, no npm installs.
- External resources allowed: Google Fonts stylesheets, and scripts from `https://cdn.jsdelivr.net/npm/` with exact versions only, e.g. `gsap@3.13.0/dist/gsap.min.js`, `gsap@3.13.0/dist/ScrollTrigger.min.js`, `gsap@3.13.0/dist/SplitText.min.js`, `d3@7.9.0/dist/d3.min.js`. Load local JSON with `fetch('assets/...')`. Nothing else from the network.
- `<title>Silver Fox Horizons</title>` exactly.
- CSS colour tokens on `:root`. The site has one deliberate theme: repeat the same token values inside `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` and `:root[data-theme="dark"] { ... }`, and give `body` an explicit background.
- Accessibility: semantic landmarks, alt text (decorative images `alt=""`), visible focus, keyboard-usable menu with Escape to close, `prefers-reduced-motion` shows final states with no pinning or autoplay. Content must stay visible if JS fails.
- Performance: lazy-load below-the-fold images, `preload="none"` on videos until near view, play videos only when visible, cap canvas DPR at 2.
- Mobile: at least a 16px side gutter, no horizontal scroll at 375px.

## How to check your work (do this, more than once)
A local server is already running: `http://127.0.0.1:5180/directions/<your-folder>/`. Do NOT use the in-app browser pane or the Playwright tools (other builders share them). Use headless Chrome screenshots, each with your own profile dir:

```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --user-data-dir="C:\Users\MouDy\AppData\Local\Temp\sfh-<your-folder>" --window-size=1440,900 --virtual-time-budget=4000 --screenshot="C:\Users\MouDy\AppData\Local\Temp\sfh-<your-folder>\desk-hero.png" "http://127.0.0.1:5180/directions/<your-folder>/#top"
```
Change the `#anchor` to capture each section, and use `--window-size=390,844` for phone. Reduced motion is forced so final states show. Open the PNGs with the Read tool and judge them as a demanding creative director would. Iterate until every section is genuinely high-end. Also run `node --check main.js`.

## When you finish
Reply in under 150 words: the concept in one line, the strongest moment, any known weakness, and which section anchors exist (ids) so screenshots can be taken.
