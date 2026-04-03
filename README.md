# Pushing Google Sites Beyond Its Limits
**By Eryc Tri Juni S. — SEO & Digital Marketing Specialist**

> **Google:** "A simple, locked-down drag-and-drop builder."  
> **User:** "Hold my Cloudflare edge router."

A portfolio built entirely on Google Sites, re-engineered for SEO and structural control.

This repository contains the system behind it:

- Modular HTML/CSS/JS embeds  
- Cloudflare Workers for edge-level SEO control  
- GitHub-backed asset proxy via Cloudflare Workers

*Constraints aren’t limits. They’re engineering problems.*

>> **Live Website:** [www.eryc.my.id](https://www.eryc.my.id)

---

## Under the Hood: The SEO/GEO Stack

Google Sites keeps things simple by design. This project uses Cloudflare edge routing to unlock features that, elsewhere, wouldn’t need unlocking:

- Custom Title Tags
- Dynamic Meta Descriptions
- Valid JSON-LD Markup
- Custom `sitemap.xml`
- Custom `robots.txt`
- Custom `llm.txt`

---

## Showcases

* **[>] Optimized Asset Delivery (GitHub-backed Edge Proxy)** Assets are served from GitHub as the origin, with Cloudflare Workers acting as an edge proxy layer (`/asset/...`). This enables full control over caching, headers, and file delivery—bypassing Google Sites’ native limitations entirely.

---

## Interactive Highlights 

Nothing unusual—unless you’re using Google Sites :

<table>
  <tr>
    <td>
      <ul>
        <li><b>[>] Fixed-Viewport Landing (Home Page)</b> A zero-scroll, full-screen landing experience with animated background, glitch ASCII art, and a dialog-driven navigation system.</li>
      </ul>
      <div align="center">
        <strong>[ Home-page Preview ]</strong><br>
        <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/home-page.webp" alt="Home-page Preview">
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li><b>[>] The Cyberpunk Terminal (About Page)</b> A fully functional in-browser CLI with keyboard navigation, tab autocomplete, and inline suggestions.<br>
        <i>Easter Egg:</i> Try typing <code>sudo</code>.</li>
      </ul>
      <div align="center">
        <strong>[ Terminal Preview ]</strong><br>
        <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/terminal.webp" alt="Terminal Preview">
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li><b>[>] Digital Marketing Glossary (Glossary Page)</b> A responsive dictionary interface with live search and auto-scroll navigation for fast term discovery.</li>
      </ul>
      <div align="center">
        <strong>[ Glossary Preview ]</strong><br>
        <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/glossary.webp" alt="Glossary Preview">
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li><b>[>] 16-Bit RPG Dialog Engine (SEO Page)</b> A retro-style interactive dialog system that replaces static content with a game-like SEO explanation flow.</li>
      </ul>
      <div align="center">
        <strong>[ RPG Dialog Preview ]</strong><br>
        <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/rpg-dialog.webp" alt="RPG Dialog Preview">
      </div>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li><b>[>] Upwork-Style Service Tiers (Services Page)</b> A pixel-accurate Upwork-style pricing UI, connected to a custom Google Apps Script backend for structured lead capture.</li>
      </ul>
      <div align="center">
        <strong>[ Service Tier Preview ]</strong><br>
        <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/services-tier.webp" alt="Service Tier Preview">
      </div>
    </td>
  </tr>
</table>

---

## Core Principles

**Scope** This repository contains modular HTML, CSS, and JavaScript components engineered specifically for drag-and-drop CMS environments. The system is designed to:

- Optimize embedded code execution  
- Remove dependencies on paid infrastructure  
- Unlock advanced functionality within highly constrained platforms  
- Enforce technical SEO at the edge via Cloudflare Workers  

**Compatibility** Built on Google Sites, but not tied to it. *If a platform accepts embedded HTML, it can be extended.* This architecture can be applied to [WordPress.com](https://wordpress.com), [Wix](https://wix.com), [Weebly](https://weebly.com), [Squarespace](https://www.squarespace.com), [Webflow](https://webflow.com), and similar closed-ecosystem platforms.

> [!NOTE]
> **Architectural Context:** This edge-native approach aligns closely with the direction of modern, emerging edge CMS platforms like [Emdash](https://github.com/emdash-cms/emdash) (@emdash-cms/emdash).

---

## Credits & Inspiration

* **Cyberpunk Terminal:** Inspired by the open-source terminal portfolio created by [@heberleonard2](https://github.com/heberleonard2/terminal-style-portfolio-page). 
* **ASCII Art Animations:** The amazing ASCII art animations used in this project were created by **1mposter**. You can check out more of their incredible work on their [Website](https://www.1mposter.com/), [Foundation](https://foundation.app/@1mposter), and [Objkt](https://objkt.com/@1mposter).

---

## Support the Build

If you find this approach useful, interesting, or completely insane:

- Share the project  
- Bookmark the live site  

Have a great day.

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
