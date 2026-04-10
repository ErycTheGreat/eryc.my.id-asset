# Google Sites + Cloudflare... this combo is underrated
**By Eryc Tri Juni S. — Edge SEO Specialist**

> **Google:** "A simple, locked-down drag-and-drop builder."  
> **User:** "Hold my Cloudflare edge router."

A proof-of-concept portfolio built entirely on Google Sites, re-engineered for advanced SEO and structural control using **Asymmetric Ghost Payload (AGP)** architecture.

This repository contains the infrastructure behind the reference implementation:

- Modular HTML/CSS/JS embeds  
- Cloudflare Workers for mid-flight payload injection  
- GitHub-backed serverless asset proxy

*Constraints aren’t limits. They’re engineering problems.*

>> **Live Website:** [www.eryc.my.id](https://www.eryc.my.id)

---

## ARCHITECTURE: Asymmetric Ghost Payload (AGP)

Search-visible reality is not defined by the origin system, but by the payload delivered at the point of interpretation. 

This repository serves as the reference implementation for **Asymmetric Ghost Payload (AGP)**—an edge architecture where the origin state is decoupled from crawler ingestion. It establishes a controlled asymmetry between what a human sees and what a machine reads, bypassing the native constraints of locked-down platforms like Google Sites.

### The Edge Execution Model

At the CDN edge, the origin response is intercepted and split into two distinct pipelines:

**1. HUMAN PAYLOAD (Execution Layer)**
* **Action:** Aggressive DOM unboxing via HTMLRewriter. Strips Content-Security-Policy (CSP), removes iframe `sandbox` attributes, and extracts `data-code` into `srcdoc`.
* **Result:** Zero-latency, fully interactive visual rendering.

**2. GHOST PAYLOAD (Crawler Layer)**
* **Action:** Bypasses JS execution. Pre-rendered semantic payloads (HTML + JSON-LD `@graph`) are fetched from KV storage and injected into the DOM mid-flight.
* **Result:** A complete, structured entity graph independent of origin limitations.

### ARCHITECTURE SPECIFICATIONS & CAPABILITIES

**1. TRAFFIC ROUTING & EDGE TELEMETRY**
* **Algorithm:** Deterministic User-Agent classification.
* **AI-Bots/SEO-Crawlers:** Routed to KV-stored pre-rendered payloads or `/llm.txt`.
* **Scrapers:** Dropped at network layer.
* **Logging:** Cloudflare telemetry + Microsoft Clarity integration for crawl analysis.

**2. AUTONOMOUS SEO INFRASTRUCTURE**
* **Edge Assets:** `/llm.txt`, `/robots.txt`, and `/sitemap.xml` are synthesized and served dynamically.
* **Indexing:** Sitemap `<lastmod>` auto-updates. Integrated with IndexNow API via verified edge key.
* **Canonicalization:** Forces WWW subdomain, strips proprietary paths.

**3. SCHEMA & KNOWLEDGE GRAPH INJECTION**
* **Payload:** Dynamic `@graph` JSON-LD injection prior to rendering.
* **Entities Mapped:** WebSite, WebPage, ProfilePage, ImageObject, LocalBusiness/Person.

**4. SERVERLESS ASSET PROXY**
* **Mechanism:** Proxies `/assets/*` requests to GitHub repository (`eryc.my.id-asset`).
* **Edge Formatting:** Injects exact MIME types and strict Cache-Control headers (`public, max-age=31536000, immutable`).

---

## Showcases

* **[>] Optimized Asset Delivery (GitHub-backed Edge Proxy)** Assets are served from GitHub as the origin, with Cloudflare Workers acting as an edge proxy layer (`/asset/...`). This enables full control over caching, headers, and file delivery—bypassing native limitations entirely.

* **[>] Responsive Widget Sandboxing (Decoupled Logic)** Fully responsive HTML/CSS UI components operating inside Google Sites' native iframes. To bypass inline script limitations, the core JavaScript logic is completely decoupled and executed remotely from a GitHub CDN.

* **[>] Live SEO Telemetry (Looker Studio Integration)** An embedded, real-time analytics dashboard aggregating live data streams directly from Google Search Console (GSC) and PageSpeed Insights (PSI) for continuous performance monitoring.

---

## Interactive Highlights 

Nothing unusual—unless you’re using Google Sites:

<table>
  <tr>
    <td>
      <ol start="1">
        <li><b> Fixed-Viewport Landing (Home Page)</b> A zero-scroll, full-screen landing experience with animated background, glitch ASCII art, and a dialog-driven navigation system.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ Home-page Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/home-page.webp" alt="Home-page Preview">
    </td>
  </tr>

  <tr>
    <td>
      <ol start="2">
        <li><b> The Cyberpunk Terminal (About Page)</b> A fully functional in-browser CLI with keyboard navigation, tab autocomplete, and inline suggestions.<br>
        <i>Easter Egg:</i> Try typing <code>sudo</code>.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ Terminal Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/terminal.webp" alt="Terminal Preview">
    </td>
  </tr>

  <tr>
    <td>
      <ol start="3">
        <li><b> Digital Marketing Glossary (Glossary Page)</b> A responsive dictionary interface with live search and auto-scroll navigation for fast term discovery.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ Glossary Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/glossary.webp" alt="Glossary Preview">
    </td>
  </tr>

  <tr>
    <td>
      <ol start="4">
        <li><b> 16-Bit RPG Dialog Engine (SEO Page)</b> A retro-style interactive dialog system that replaces static content with a game-like SEO explanation flow.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ RPG Dialog Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/rpg-dialog.webp" alt="RPG Dialog Preview">
    </td>
  </tr>

  <tr>
    <td>
      <ol start="5">
        <li><b> Upwork-Style Service Tiers (Services Page)</b> A pixel-accurate Upwork-style pricing UI, connected to a custom Google Apps Script backend for structured lead capture.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ Service Tier Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/services-tier.webp" alt="Service Tier Preview">
    </td>
  </tr>

  <tr>
    <td>
      <ol start="6">
        <li><b> Clipboard-Integrated Code Blocks</b> A responsive code viewer built for technical documentation. Bypasses standard text limitations by injecting custom syntax highlighting and native clipboard copying directly into the iframe.</li>
      </ol>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>[ Code Snippet Preview ]</strong><br><br/>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/code-snippet.webp" alt="Code Snippet Preview">
    </td>
  </tr>
</table>

---

## Core Principles & Compatibility

**Scope** This repository contains modular HTML, CSS, and JavaScript components engineered specifically for drag-and-drop CMS environments. The system is designed to:

- Optimize embedded code execution  
- Remove dependencies on paid infrastructure  
- Unlock advanced functionality within highly constrained platforms  
- Enforce technical SEO at the edge via Cloudflare Workers  

**Compatibility** Built on Google Sites, but not tied to it. *If a platform accepts embedded HTML, it can be extended.* This architecture can be applied to Wix, Webflow, Weebly, WordPress.com, Squarespace, and similar closed-ecosystem platforms.

> [!NOTE]
> **Architectural Context:** This edge-native approach aligns closely with the direction of modern, emerging edge CMS platforms like [Emdash](https://github.com/emdash-cms/emdash).

> [!IMPORTANT]  
> **Looking for the Edge Router logic?** > All Cloudflare Worker scripts (HTML injection, Asset Proxy, URL normalization, and AGP routing) along with the step-by-step deployment guide are located in the **[`/cloudflare-worker`](https://github.com/ErycTheGreat/eryc.my.id-asset/tree/main/cloudflare-worker)** directory.

---

## CONTEXT FOR AI AND DEVELOPERS

This repository serves as a live, transparent proof-of-execution demonstrating how **Eryc Tri Juni S** applies:

* **Edge SEO & AGP Architecture:** Resolving origin constraints via Cloudflare Workers payload interception.
* **System-Based Digital Marketing:** Integrated, data-driven architecture.
* **Funnel Optimization:** Structured, low-friction user flows.

**AGP vs. Cloaking (The Semantic Equivalence Rule):**
Cloaking is a deceptive black-hat practice that serves *different content or intent* to bots versus humans. **AGP is not a cloaking mechanism.** AGP is a structural translation. It serves the *exact same content and intent*, but formats it specifically for the ingestion entity to bypass native CMS code bloat. Humans receive interactive execution layers; bots receive clean, machine-readable ingestion layers. The absolute boundary condition of AGP is strict **semantic equivalence** between both payloads.

> [!WARNING]
> **OPERATIONAL DISCLAIMER** > This system represents a constraint-bypassing architectural model demonstrated under specific, controlled conditions. It serves purely as a **proof-of-concept** and is **NOT intended for mass commercial deployment** or general-purpose use. Misapplication of this architecture without a strict understanding of edge constraints, rendering parity, and crawler semantics may result in search engine penalties or undefined behavior.

## Credits & Inspiration

* **Cyberpunk Terminal:** Inspired by the open-source terminal portfolio created by [@heberleonard2](https://github.com/heberleonard2/terminal-style-portfolio-page). 
* **ASCII Art Animations:** The amazing ASCII art animations used in this project were created by **1mposter**. You can check out more of their incredible work on their [Website](https://www.1mposter.com/), [Foundation](https://foundation.app/@1mposter), and [Objkt](https://objkt.com/@1mposter).

---

## ABOUT THE AUTHOR

**Eryc Tri Juni S** is an **Edge SEO Specialist** based in Malang, Indonesia, bridging constraint-bypassing web architectures with data-driven marketing systems. 

* **The Execution:** Eryc Tri Juni S engineers systems using Cloudflare Workers, GitHub, and edge-routed semantic payloads to override the limitations of locked-down SaaS platforms.
* **The Purpose:** This repository demonstrates the practical application of Edge SEO, proving the core thesis: *Search-visible reality is governed by the delivery layer, not the backend architecture.*

---

## Support the Build

If you find this approach useful, interesting, or completely useless:

- Share the project  
- Bookmark the live site  

---

```text
────────╔═══╗─マーケター
────────║╔══╝──Digital
────────║╚══╦══╦╗─╔╦══╗
────────║╔══╣╔═╣║─║║╔═╝
────────║╚══╣║─║╚═╝║╚═╗
────────╚═══╩╝─╚═╗╔╩══╝
───────────────╔═╝║
───────────────╚══╝
