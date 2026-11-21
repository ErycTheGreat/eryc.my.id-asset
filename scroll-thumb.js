/* Android-style overlay scrollbar: native bar hidden (page keeps full width),
   a thin #00bba9 thumb fades in while scrolling and fades out when idle. */
(function () {
  if (window.__erycThumb) return; window.__erycThumb = 1;
  var st = document.createElement("style");
  st.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar{display:none;width:0;height:0}" +
    "#eryc-thumb{position:fixed;right:2px;top:0;width:4px;border-radius:4px;background:#00bba9;" +
    "opacity:0;transition:opacity .35s ease;pointer-events:none;z-index:2147483647;will-change:transform,opacity}" +
    "#eryc-thumb.on{opacity:.9}";
  document.head.appendChild(st);
  var t = document.createElement("div"); t.id = "eryc-thumb"; t.setAttribute("aria-hidden", "true");
  function mount() { document.body.appendChild(t); }
  if (document.body) mount(); else addEventListener("DOMContentLoaded", mount);
  var timer, de = document.documentElement;
  function draw() {
    var ih = window.innerHeight, sh = Math.max(de.scrollHeight, document.body.scrollHeight);
    if (sh <= ih + 1) { t.classList.remove("on"); return false; }
    var pad = 6, track = ih - pad * 2, h = Math.max(40, track * ih / sh);
    var y = pad + (window.scrollY / (sh - ih)) * (track - h);
    t.style.height = h + "px"; t.style.transform = "translateY(" + y + "px)";
    return true;
  }
  function show() {
    if (!draw()) return;
    t.classList.add("on"); clearTimeout(timer);
    timer = setTimeout(function () { t.classList.remove("on"); }, 900);
  }
  addEventListener("scroll", show, { passive: true });
  addEventListener("resize", show, { passive: true });
})();
