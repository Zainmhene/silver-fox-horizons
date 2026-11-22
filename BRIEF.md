# Silver Fox Horizons: brief

Mockup for a client who works in government and has a strong network. Goal: a mockup that makes her say "wow".

## Client's message (verbatim, do not edit)

> We're aiming for something very clean, sophisticated and professional, along the lines of the Tony Blair Institute: https://institute.global
>
> I think the following statement captures our mandate beautifully and could serve as the foundation for the website:
>
> Silver Fox Horizons is an international strategic advisory firm partnering with governments, institutions and businesses to strengthen state capacity, elevate global influence and unlock investment opportunities across Africa.
>
> We should position Silver Fox Horizons as a strategic advisory firm working at the intersection of statecraft, international positioning and investment diplomacy, with three core areas of expertise:
>
> Statecraft, Governance & Institutional Transformation: Helping governments strengthen institutional capacity, design and implement reforms, and improve public-sector performance.
>
> Nation Branding, Strategic Communications & Global Positioning: Supporting governments in strengthening their international reputation, soft power and global visibility.
>
> Investment Diplomacy, Market Access & Strategic Partnerships: Helping international companies and investors navigate African markets, engage with governments and develop strategic investment and commercial partnerships.
>
> The website should communicate this mandate very clearly, with a premium, understated and internationally credible feel.

## Moudy's direction

- Feeling: elite, black, New York.
- Match institute.global for credibility, then do better.
- Full build prompt still to come.

## Reference: institute.global (studied 2026-11-21)

- **Type:** PP Editorial New (thin high-contrast serif, weight 400) for headlines, 100px hero, 72px feature, 48px section, tight negative tracking (-2px at 100px). Aeonik (geometric sans) for labels, nav and small copy, often uppercase at 16px. Both are paid fonts: do not copy, find a free or licensed equivalent.
- **Colour:** near-black (#1a1a1a-ish) top bar, nav and footer; white and light grey (#f4f4f4) content bands. Black pill buttons with an arrow. Almost no accent colour.
- **Homepage order:** full-bleed video hero with serif headline + pause button > "Who we are" (label left, statement right) > two image cards (Helping Governments Deliver / Shaping Policy & Debate) > CentreAI feature (image left, text right on grey) > Featured insights (one large overlay card + three small cards with topic dots and dates) > Our Impact (grey band, text + photo) > "We are ___" rotating word with letter-by-letter reveal > newsletter band with two marquee rows of serif text and inline images > dark footer with four link columns.
- **Where we can beat it:** their palette is safe and flat, the hero is a generic meeting video, the sections are a standard grid, and there is no sense of place. Silver Fox is about Africa: the assets (night Earth, Kigali, skylines at sunset) give us a story they don't have.

## Assets (in `assets/`)

| File | Content | Notes |
|---|---|---|
| `D28333D6-...png` | Woman in patterned head wrap, gold earrings | Source unknown, may be AI-generated: confirm before use |
| `IMG_3988.JPG` | Glass tower, blue sky (looks like Kigali) | Portrait 4160x6240, visible signage |
| `IMG_3991.JPG` | Woman in black blazer at laptop | Portrait 4000x6000 |
| `IMG_3996.JPG` | Kigali Convention Centre at night, aerial | Source unknown: confirm licence |
| `IMG_3999.JPG` | Earth at night centred on Africa | Looks like NASA night imagery |
| `12564030_...60fps.mp4` | Skyline at sunset, gold haze | 1080p, 9 s, 3 MB |
| `14294714_...24fps_6.mp4` | Night aerial city under lit mountain | 4K, 16 s, 89 MB: must compress |
| `15025946_...30fps_3.mp4` | Drone down highway at sunset between towers | 4K, 21 s, 75 MB: must compress |

## Open questions

- Logo, brand colours, fonts: any existing?
- Pages: homepage only for the mockup, or more?
- Real copy beyond the mandate (team, case studies, contact): use placeholders until provided.
- Stack: brochure site, so static HTML/CSS or Astro by default.
