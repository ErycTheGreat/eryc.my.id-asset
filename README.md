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

Nothing unusual—unless you’re using Google Sites:

<table>
  <tr>
    <td valign="top" width="33%">
      <b>Fixed-Viewport Landing (Home)</b><br>
      A zero-scroll, full-screen landing experience.
      <ul>
        <li>Animated background</li>
        <li>Glitch ASCII art</li>
        <li>Dialog navigation</li>
      </ul>
      <br>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/home-page.webp" alt="Home-page Preview" width="100%">
    </td>
    <td valign="top" width="33%">
      <b>The Cyberpunk Terminal (About)</b><br>
      A fully functional in-browser CLI.
      <ul>
        <li>Keyboard navigation</li>
        <li>Tab autocomplete</li>
        <li>Inline suggestions</li>
        <li>Easter Egg: <code>sudo</code></li>
      </ul>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/terminal.webp" alt="Terminal Preview" width="100%">
    </td>
    <td valign="top" width="33%">
      <b>Digital Marketing Glossary</b><br>
      A responsive dictionary interface.
      <ul>
        <li>Live search bar</li>
        <li>Auto-scroll navigation</li>
        <li>Fast term discovery</li>
      </ul>
      <br>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/glossary.webp" alt="Glossary Preview" width="100%">
    </td>
  </tr>
  <tr>
    <td valign="top" width="33%">
      <b>16-Bit RPG Engine (SEO)</b><br>
      A retro-style interactive dialog system.
      <ul>
        <li>Game-like explanation flow</li>
        <li>Replaces static content</li>
        <li>SNES-style aesthetics</li>
      </ul>
      <br>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/rpg-dialog.webp" alt="RPG-dialog Preview" width="100%">
    </td>
    <td valign="top" width="33%">
      <b>Upwork-Style Tiers (Services)</b><br>
      A pixel-accurate Upwork pricing UI.
      <ul>
        <li>Apps Script backend integration</li>
        <li>Structured lead capture</li>
        <li>Bypasses native forms</li>
      </ul>
      <br>
      <img src="https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/image/services-tier.webp" alt="Service-tier Preview" width="100%">
    </td>
    <td valign="top" width="33%">
      <b>System Architecture</b><br>
      Expanding beyond native constraints.
      <ul>
        <li>Edge routing active</li>
        <li>GitHub CDN stable</li>
        <li>Modular embeds</li>
      </ul>
      <br>
      <i>*(More custom components in development...)*</i>
    </td>
  </tr>
</table>
--

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
