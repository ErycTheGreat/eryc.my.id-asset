# Google Sites + Cloudflare... this combo is underrated

<p>
  <img src="https://img.shields.io/badge/architecture-AGP-1bc7fb" alt="Architecture: AGP">
  <img src="https://img.shields.io/badge/status-live%20production-00bba9" alt="Status: Live Production">
  <img src="https://img.shields.io/badge/edge-Cloudflare%20Workers-ff6a00" alt="Edge: Cloudflare Workers">
  <img src="https://img.shields.io/badge/license-MIT-4386c3" alt="License: MIT">
</p>

**By Eryc Tri Juni S — Edge SEO Specialist**

> **Google:** "A simple, locked-down drag-and-drop builder."
> **User:** "Hold my Cloudflare edge router."

This is the reference implementation of **Asymmetric Ghost Payload (AGP)** — an edge architecture that intercepts requests to a locked-down CMS (Google Sites) mid-flight at the Cloudflare Worker layer, and reconstructs what crawlers and AI agents receive, without ever touching the CMS itself.

**Live site:** [www.eryc.my.id](https://www.eryc.my.id)

> [!NOTE]
> **Status: live production code, not a generic template.** This repo is the actual deployment running `www.eryc.my.id` right now — it has real KV namespace IDs, a real R2 bucket name, and routes locked to a specific Cloudflare zone. A templated, env-var-driven version you can fork and deploy to your own domain is planned (see [Roadmap](#roadmap)). Until then, treat this as a transparent proof-of-execution, not a one-command deploy.

---

## Read the full story first

This README covers **what's in the repo and how to run it.** For the *why* and the *results*, read these first:

- **[Case study — Edge SEO: Asymmetric Ghost Payload Architecture](https://www.eryc.my.id/case-studies/edge-seo)** — the full engineering log, architecture diagrams, live PSI/GSC metrics, and the 9-step PageSpeed fix breakdown.
- **["I Built an AI SEO System on Google Sites Because Apparently, I Hate Myself"](https://dev.to/neo_nietzsche/i-built-an-ai-seo-system-on-google-sites-because-apparently-i-hate-myself-4n3n)** — same architecture, narrative version, with the CDN-migration odyssey and the Google Search Console gaslighting incident.

---

## What's actually in this repo

```text
eryc.my.id-asset/
├── index.js              # PRIMARY WORKER — the AGP router (see below)
├── wrangler.toml          # Deploy config for the primary router
├── cloudflare-worker/      # SECONDARY WORKER — the AI Scanner (cron job, see below)
├── home-page/             # Embedded HTML/CSS/JS for the Google Sites home page
├── about-page/            # Embedded code for the cyberpunk terminal About page
├── glossary-page/         # Embedded code for the searchable glossary
├── seo-page/               # Embedded code for the RPG-dialog SEO explainer page
├── footer-page/            # Shared footer embed
├── font/                  # Self-hosted font files served via the R2 asset proxy
├── image/                 # Static images referenced in this README
├── llms.txt               # Machine-readable entity summary, served from R2
├── llms-full.txt           # Full machine-readable entity graph, served from R2
├── sitemap-v2.xml          # Static sitemap reference (the live /sitemap.xml is generated dynamically — see below)
├── color-mood-board.txt    # Design reference
├── free-hosting-guide.txt  # Notes from the CDN migration (Drive → Dropbox → GitHub Raw → InfinityFree → R2)
└── .github/workflows/      # CI
```

> [!IMPORTANT]
> Two separate Cloudflare Workers live in this repo, with two separate jobs. Don't confuse them.

---

## Worker 1 — The AGP Router (`index.js`)

<p>
  <img src="https://img.shields.io/badge/R2-MY__ASSETS-ff6a00" alt="R2 binding: MY_ASSETS">
  <img src="https://img.shields.io/badge/KV-SEO__PAYLOADS-eab308" alt="KV binding: SEO_PAYLOADS">
  <img src="https://img.shields.io/badge/KV-AGP__STATE-eab308" alt="KV binding: AGP_STATE">
  <img src="https://img.shields.io/badge/cron-*/30_*_*_*_*-4386c3" alt="Cron: every 30 minutes">
</p>

This is the Worker that's actually bound to the live domain via `wrangler.toml`. It runs on **every request** to `www.eryc.my.id` and does all of the following, in order, before the response reaches the browser or crawler:

1. **Bot classification** — regex-matches the `User-Agent` against known AI bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.), search crawlers (`Googlebot`, `bingbot`, `Applebot`), and social bots (`FacebookBot`, `Twitterbot`, etc.). A `?debug=bot` query param is also a deterministic override for manual testing.
2. **Edge-only system files** — `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, and the IndexNow key-verification file are all generated and served directly by the Worker. None of these exist on Google Sites natively.
3. **R2 asset proxy** — `/assets/*` requests are proxied to an R2-backed CDN (`cdn.eryc.my.id`), with optional on-the-fly image resizing via a `?w=` query param (Cloudflare Images transform).
4. **The human/bot fork** — for human traffic, `HTMLRewriter` strips the platform's native canonical/description/OG tags, injects the real ones plus the full JSON-LD `@graph`, neutralizes Google Sites' background-cropping CSS, defers all native scripts until real interaction (`mousemove`/`keydown`/`touchstart`), and unboxes the sandboxed iframe via `srcdoc` injection. For bot traffic, it instead prepends a pre-rendered semantic payload from the `SEO_PAYLOADS` KV namespace and (for non-search-engine bots) strips scripts, styles, iframes, and decorative wrappers entirely via the `ElementSlasher` class — leaving a flattened, low-noise document.
5. **AGP state read** — `LCP_IMAGE_URL`, `GHOST_CSS`, and `GSTATIC_CSS` are read from the `AGP_STATE` KV namespace in parallel with the CMS fetch, so the response can preload the right hero image and inline critical CSS with zero added latency.

**On IndexNow:** the key-verification file (`/3d66934eab674a3496effb0a0651a038.txt`) is served, confirming domain ownership — but there's currently no code that actively *pushes* URLs to the IndexNow submit endpoint on content change. Verification only, not full automation, as of this writing.

### Deploy config (`wrangler.toml`)

<details>
<summary>Show full <code>wrangler.toml</code></summary>

```toml
name = "homepage-sitemap-robots-txt"
main = "index.js"
compatibility_date = "2024-03-27"

routes = [
  { pattern = "www.eryc.my.id/*", zone_name = "eryc.my.id" },
  { pattern = "eryc.my.id/*", zone_name = "eryc.my.id" },
  { pattern = "www.eryc.my.id/assets/*", zone_name = "eryc.my.id" }
]

[[r2_buckets]]
binding = "MY_ASSETS"
bucket_name = "eryc-assets"

[triggers]
crons = ["*/30 * * * *"]

[[kv_namespaces]]
binding = "SEO_PAYLOADS"
id = "4cbae4c8b74246a2b783cb63186e405a"

[[kv_namespaces]]
binding = "AGP_STATE"
id = "9a9985fe64c34f6ea7eb41de408ccbcd"

[observability]
[observability.logs]
enabled = true
invocation_logs = false   # only logs when a bot is detected — keeps log volume sane
```

</details>

---

## Worker 2 — The AI Scanner (`/cloudflare-worker`)

<p>
  <img src="https://img.shields.io/badge/AI-Workers_AI-1bc7fb" alt="Workers AI binding">
  <img src="https://img.shields.io/badge/browser-MYBROWSER-e0287d" alt="Browser rendering binding: MYBROWSER">
  <img src="https://img.shields.io/badge/KV-AGP__STATE-eab308" alt="KV binding: AGP_STATE">
  <img src="https://img.shields.io/badge/R2-MY__ASSETS-ff6a00" alt="R2 binding: MY_ASSETS">
</p>

This is the Worker referenced in the case study's "Autonomous Feedback" step. It runs **off the request path**, on the same 30-minute cron schedule, and does the AI-side prep work so the primary router never has to think at request time:

1. Launches a headless browser via `@cloudflare/puppeteer` (`env.MYBROWSER` binding) and navigates to the live site twice — once with `?debug=bot` to grab the *original* `gstatic.com` stylesheet URL (the human-lane Worker rewrites that link, so the bot path is the only way to see it unmodified), and once normally for a Lighthouse-style, FCP-timed CSS coverage pass.
2. Fetches the full Google Fonts CSS, writes it to R2 (`css/gstatic-cache.css`) as a baseline, then extracts just the critical, above-the-fold subset of rules actually used before First Contentful Paint and stores that separately in `AGP_STATE` for inlining.
3. Runs a second pass to extract a clean DOM snapshot, strips scripts/styles/SVGs and all class/id/jsaction attributes, and passes the sanitized HTML to a Workers AI model as a strict JSON parser — extracting the LCP image URL and dominant background color.
4. Has automatic model fallback: tries `@cf/zai-org/glm-4.7-flash` first, falls back to `@cf/meta/llama-3.1-8b-instruct-fp8` if the primary model fails or gets deprecated.
5. Writes the results to the same `AGP_STATE` KV namespace the primary router reads from.

> [!NOTE]
> This Worker needs its own `wrangler.toml` with `[ai]`, browser-rendering (`MYBROWSER`), and shared KV/R2 bindings. That config isn't finalized in this repo yet — full deploy docs for this Worker are pending (see [Roadmap](#roadmap)).

---

## Related infrastructure (not in this repo)

The live PSI/GSC telemetry shown on the [case study page](https://www.eryc.my.id/case-studies/edge-seo) — the "Live Architecture Performance" readings and the before/after Lighthouse dashboards — is powered by a **third Worker that lives in a separate project**, not this repo. At a high level: a weekly cron job authenticates against the Google Search Console API and PageSpeed Insights API v5, pulls desktop + mobile scores for both the origin and edge domains plus 30-day GSC totals, and writes the result into its own KV namespace. The case-study page then reads that KV at request time and injects the numbers into both the visible widget and a `Dataset`/`Observation` JSON-LD block, so the live metrics are exposed as structured, machine-readable claims rather than just text on the page.

It's mentioned here for architectural completeness since it's part of the same broader system, but its code isn't published in this repository.

### What that pipeline actually produces — results snapshot

Static snapshot, not live — the numbers below update weekly on the case study itself via the pipeline described above. This is what they showed as of **2026-06-14**.

<p>
  <img src="https://img.shields.io/badge/LCP-88%25_faster-00bba9" alt="LCP 88% faster">
  <img src="https://img.shields.io/badge/TBT-eliminated_(0ms)-00bba9" alt="TBT eliminated">
  <img src="https://img.shields.io/badge/SEO-100%2F100-00bba9" alt="SEO 100/100">
  <img src="https://img.shields.io/badge/Mobile_Perf-%2B32_pts-00bba9" alt="Mobile Performance +32 points">
</p>

**Mobile PSI — Origin (Google Sites) vs. Edge (AGP)**

| Metric | Origin | Edge | Change |
|---|---|---|---|
| Performance | 48/100 | 80/100 | +32 |
| Accessibility | 100/100 | 100/100 | — |
| Best Practices | 100/100 | 100/100 | — |
| SEO | 92/100 | 100/100 | +8 |
| FCP | 9.1 s | 3.8 s | 58% faster |
| Speed Index | 9.7 s | 3.8 s | 61% faster |
| LCP | 30.6 s | 3.8 s | 88% faster |
| TTI | 9.7 s | 3.8 s | 61% faster |
| TBT | 360 ms | 0 ms | -100% |
| CLS | 0 | 0.005 | negligible |

**Desktop PSI — Origin (Google Sites) vs. Edge (AGP)**

| Metric | Origin | Edge | Change |
|---|---|---|---|
| Performance | 54/100 | 98/100 | +44 |
| Accessibility | 95/100 | 100/100 | +5 |
| Best Practices | 100/100 | 100/100 | — |
| SEO | 92/100 | 100/100 | +8 |
| FCP | 0.9 s | 0.9 s | maintained |
| Speed Index | 1.4 s | 1.0 s | 29% faster |
| LCP | 3.9 s | 0.9 s | 77% faster |
| TTI | 3.9 s | 0.9 s | 77% faster |
| TBT | 560 ms | 0 ms | -100% |
| CLS | 0.051 | 0.002 | 96% reduction |

**Google Search Console (trailing 30 days):** 24 clicks · 1,779 impressions · 1.35% CTR · 24.68 avg. position

One honest caveat carried over from the engineering log: 194 KiB of unused CSS remains as an accepted trade-off — it's the cost of inlining `gstatic` CSS server-side to kill the 4,050ms render-blocking penalty in Row 1. Fixing one regressed the other slightly; this was the deliberate trade.

For the full row-by-row breakdown (what broke, why, and the exact fix per category) plus the live, auto-updating version of these tables, see the [case study](https://www.eryc.my.id/case-studies/edge-seo#the-engineering-log-matrix-interactive-transformation-diagram).

---

## Architecture Specifications

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/agp-diagram-animated.svg" alt="AGP Architecture Diagram — animated" width="800">
</p>
<p align="center">
  <a href="https://codepen.io/ErycTheGreat/pen/019ebf97-10f9-7ae4-adcc-bac6ae87e1ac">▶ View the interactive version on CodePen</a>
</p>

**Traffic routing** — deterministic User-Agent classification. AI bots and search crawlers get the Ghost Payload lane; non-search-engine bots additionally get scripts/styles/iframes stripped (`ElementSlasher`); humans get the full interactive UI with deferred hydration.

**Schema injection** — a single JSON-LD `@graph` (`WebSite`, `ProfilePage`, `Person`, `ProfessionalService`, `ImageObject` entities) is injected into every response, human or bot, before render.

**Asset delivery** — all images, fonts, and CSS are served from Cloudflare R2 under the live domain (`cdn.eryc.my.id`), with `Cache-Control: max-age=31536000, immutable` and optional edge-side image resizing. (Earlier iterations of this proxy used GitHub Raw, Dropbox, and even InfinityFree before settling on R2 — see the dev.to post's "CDN Migration Nobody Talks About" section for that story.)

**Canonicalization** — non-www traffic 301s to the `www` apex; the redundant Google Sites `/home` path 301s to `/`.

---

## Showcases

- **R2-backed edge asset proxy** — `/assets/*` served from Cloudflare R2 with on-the-fly resizing, full cache-header control, and zero dependency on Google Sites' (nonexistent) file hosting.
- **Responsive widget sandboxing** — fully responsive HTML/CSS UI components running inside Google Sites' native iframes, with core JS logic decoupled and deferred until real user interaction.
- **Live SEO telemetry** — PSI and GSC metrics rendered directly on the live page, sourced from a dedicated KV namespace updated weekly via Cron + the PSI/GSC APIs. See [Related infrastructure](#related-infrastructure-not-in-this-repo).

## Interactive Highlights

Nothing unusual — unless you're using Google Sites:

**1. Fixed-Viewport Landing (Home Page)**
A zero-scroll, full-screen landing experience with animated background, glitch ASCII art, and a dialog-driven navigation system.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/home-page.webp" alt="Home-page Preview" width="800">
</p>

**2. The Cyberpunk Terminal (About Page)**
A fully functional in-browser CLI with keyboard navigation, tab autocomplete, and inline suggestions.
*Easter Egg:* Try typing `sudo`.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/terminal.webp" alt="Terminal Preview" width="800">
</p>

**3. Digital Marketing Glossary (Glossary Page)**
A responsive dictionary interface with live search and auto-scroll navigation for fast term discovery.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/glossary.webp" alt="Glossary Preview" width="800">
</p>

**4. 16-Bit RPG Dialog Engine (SEO Page)**
A retro-style interactive dialog system that replaces static content with a game-like SEO explanation flow.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/rpg-dialog.webp" alt="RPG Dialog Preview" width="800">
</p>

**5. Upwork-Style Service Tiers (Services Page)**
A pixel-accurate Upwork-style pricing UI, connected to a custom Google Apps Script backend for structured lead capture.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/services-tier.webp" alt="Service Tier Preview" width="800">
</p>

**6. Clipboard-Integrated Code Blocks**
A responsive code viewer built for technical documentation. Bypasses standard text limitations by injecting custom syntax highlighting and native clipboard copying directly into the iframe.

<p align="center">
  <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/code-snippet.webp" alt="Code Snippet Preview" width="800">
</p>

---

## AGP vs. Cloaking — the semantic equivalence rule

Cloaking serves *different content or intent* to bots versus humans. AGP doesn't. It serves the **exact same content and intent**, reformatted for the ingestion entity:

| Layer | What they get |
|---|---|
| Human | Visual UI, interactions, styling, full DOM |
| Bot | Flattened semantic structure, clean JSON-LD, zero noise |

The boundary condition is strict semantic equivalence between both payloads. Same truth, different container — like water in a wine glass versus an industrial pipe. Still water.

> [!WARNING]
> This is a proof-of-concept demonstrated under specific, controlled conditions — not a general-purpose, drop-in solution. Misapplying this without understanding edge constraints, rendering parity, and crawler semantics can risk search penalties or undefined behavior.

---

## Compatibility

> [!TIP]
> Built on Google Sites, but not tied to it. If a platform accepts embedded HTML, this architecture extends to it — Wix, Webflow, Weebly, WordPress.com, Squarespace, and similar closed-ecosystem builders all have the same fundamental problem AGP solves: no `<head>` access, no native SEO infrastructure.

This approach also lines up with where edge-native CMS platforms are heading — see [Emdash](https://github.com/emdash-cms/emdash) for a from-scratch take on the same idea (the edge *is* the origin, no mid-flight interception needed).

---

## Roadmap

- [ ] Templated, env-var-driven version (no hardcoded KV IDs, bucket names, or domain) — forkable to any zone
- [ ] Full `wrangler.toml` + deploy docs for the AI Scanner Worker
- [ ] Full-site AGP rollout — currently the homepage (`/`) has full deployment; sub-pages run partial edge rules only
- [ ] Active IndexNow submission on publish, not just key verification

---

## Credits & Inspiration

- **Cyberpunk terminal:** inspired by [@heberleonard2](https://github.com/heberleonard2/terminal-style-portfolio-page)'s open-source terminal portfolio.
- **ASCII art animations:** by **1mposter** — [Website](https://www.1mposter.com/) · [Foundation](https://foundation.app/@1mposter) · [Objkt](https://objkt.com/@1mposter)

---

## License

[MIT](./LICENSE)

---

## Author

**Eryc Tri Juni S** — Edge SEO & GEO Specialist, Malang, Indonesia.

[Live site](https://www.eryc.my.id) · [Case study](https://www.eryc.my.id/case-studies/edge-seo) · [LinkedIn](https://www.linkedin.com/in/eryctrijunis) · [GitHub](https://github.com/ErycTheGreat) · [dev.to](https://dev.to/neo_nietzsche)

If you find this useful, interesting, or completely useless: a star tells me which one.

```text
────────╔═══╗─マーケター
────────║╔══╝──Digital
────────║╚══╦══╦╗─╔╦══╗
────────║╔══╣╔═╣║─║║╔═╝
────────║╚══╣║─║╚═╝║╚═╗
────────╚═══╩╝─╚═╗╔╩══╝
───────────────╔═╝║
───────────────╚══╝
```
