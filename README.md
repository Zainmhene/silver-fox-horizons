# Silver Fox Horizons: homepage demo

> **Current demo: [`site/`](site/index.html)** (open `/site/` on the server). It has 6 sections: hero, expertise, about, focus map, contact, footer.
> Contact details, social links and legal links are placeholders, the stats are illustrative example numbers, and the contact form is demo-only (it sends nothing).
> The root `index.html`, `directions/` and `v4/` are earlier explorations, kept for reference.

Static homepage mockup for Silver Fox Horizons, an international strategic advisory firm working across Africa. Client brief and reference notes: [BRIEF.md](BRIEF.md).

**Status: demo, not production.** Copy marked `PLACEHOLDER` in `index.html` and the sample articles need client approval or replacement before launch.

## Run it

```powershell
python -m http.server 5180 --bind 127.0.0.1
```

Then open http://127.0.0.1:5180. (`.claude/launch.json` has the same command as `silver-fox` for the preview tool.)

No build step, no dependencies to install. GSAP 3.13 (with ScrollTrigger and SplitText) loads from jsDelivr; fonts from Google Fonts.

## Files

| Path | What |
|---|---|
| `index.html` | All 10 sections |
| `style.css` | Design tokens at the top (`--bg`, `--text`, `--gold`), then one block per section |
| `main.js` | Menu, lazy videos, hero film, reveals, scroll effects |
| `assets/` | Web-ready media (WebP images, 1080p/1600px MP4s) |
| `assets/hero-frames/` | 120 WebP frames for the scroll-driven hero (desktop only) |
| `assets/source/` | Original full-size files, not used by the page |

## Behaviour

- **Desktop (768px+):** hero is pinned for 250vh and scrubs through 120 frames on a canvas.
- **Phones (under 768px):** hero plays `hero.mp4` muted and looping; no frames are downloaded.
- **Reduced motion:** everything shows in its final state, nothing pins, videos stay on their poster image.
- **No JavaScript / CDN down:** content stays visible (the hide-before-animate class is only added when motion is allowed, and removed if GSAP fails to load).

## Rebuilding media

Hero frames were made with:

```powershell
ffmpeg -i assets/source/15025946_3840_2160_30fps_3.mp4 -an -vf "fps=120/20.6,scale=1600:-2" -c:v libwebp -quality 70 assets/hero-frames/frame-%03d.webp
```

## Before launch

- Real copy for the hero line, About, Approach steps and closing.
- Real articles (or remove Insights).
- Contact link or form, LinkedIn URL, favicon, logo.
- Licence/source confirmed for every image (see BRIEF.md).
- The map section (`#map`) is an empty placeholder.
