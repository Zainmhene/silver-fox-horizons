# Homepage v2: design

## Why
Version 1 read as a template: stock section patterns, dark stock footage made muddier by a colour grade, empty black screens. The client (works in government, well connected) has to say "wow". Moudy's reference is the ChatGPT mockup in `design-reference/mock-a-full-page.webp`: its quality bar is the target.

## What makes the reference work (and what we take from it)
- Luminous golden-hour images framed by true black. Black is the frame, not a filter on the image.
- Every screen is composed: label, large serif headline, short text, link, image, and a small detail (section counter, values list, arrows).
- Thin gold rules divide panels; gold appears in italics, links and one filled button.
- Image cards for the three expertise areas, side by side.

## Not taking from it (anti-goals)
- Invented numbers (50+, 15+, $5B+), team photos, the "Senior Government Advisor" quote. Counters stay as `00+` placeholders, clearly marked.
- Muddy grades, full-screen darkness, effects everywhere.

## Approaches considered
- **A. Rebuild to mock A's layout with generated on-subject images (picked by Moudy).** Closest to the look he wants.
- B. Keep v1 structure, just brighten the media. Rejected: still a template.
- C. Type-led "briefing document". Rejected by Moudy.

## Sections (order from mock A)
1. **Header:** two-line serif logo "Silver Fox / Horizons", links, outlined pill "Get in Touch →".
2. **Hero:** full-bleed golden-hour city (`design-reference/hero-candidate-golden-hour.webp`), dark gradient on the left only. Thin gold vertical rule beside the headline. "Shaping Africa's Future." + gold italic "Connecting Global Opportunity.", mandate sentence, "Explore Our Expertise →", "Scroll to explore", `01 / 05`. Very slow zoom on the image.
3. **About:** text left, portrait right with gold edge glow, vertical values (Trusted Advisor / Global Perspective / African Focus) with a gold rule. `02 / 05`.
4. **Expertise:** "Three Areas. One Vision." + intersection line from the brief, three image cards (governance, nation branding, investment) with title and "Learn More →". `03 / 05`.
5. **Map:** "A Continent of Opportunity." Built in code: real Africa outline in gold, city dots, arcs to London / New York / Dubai, `00+` counters. Needs map shape data (separate download approval). Placeholder panel until then.
6. **Approach:** four numbered gold circles joined by a line, over a dark architectural-curve image.
7. **Insights:** heading left, three thumbnail cards right, labelled as samples.
8. **Contact:** "Let's Build What's Next.", gold filled button, corridor-to-city image.
9. **Footer:** serif logo, links, tagline, LinkedIn.

## Visual rules
- Headlines: **Instrument Serif** (regular + italic), my call: closer to the mock's serif and stronger on black than Cormorant Light. Body: Inter 400, off-white at 80%, never grey 300.
- Colours: `#0A0A0A` page, `#111111` panels, text `#F2EFEA`, gold `#B89B5E`, gold rules at 35% opacity.
- Images get no darkening filter. Gradients only where text sits on them.
- Motion: slow fades and line reveals, slow zoom (max 8%), gold lines drawing. No scroll-scrubbed film (dropped from v1).
- Mobile: stacked, image above text, no pinning.

## Images to generate (GPT Image 2.6, 16:9 or 4:3, high, 2K, 2 credits each)
1. Governance: neoclassical government building with columns at golden hour, no identifiable flag.
2. Nation branding: modern African skyline at dusk, towers glowing.
3. Investment: port with cranes and container ship at sunset.
4. Approach: dark abstract architectural curves with warm gold light.
5-7. Insights thumbnails: three golden-hour city views.
8. Contact: silhouette walking through a glass corridor towards a city at sunset.

Total 16 credits of 31.34 available. Hero uses Moudy's image; portrait waits for Moudy's realistic version (current one meanwhile).

All imagery is AI-generated: fine for the mockup; flag to the client that launch needs real or licensed photography.

## Left to the builder
Exact spacing, breakpoints, card hover states, reveal timings within the motion rules above.
