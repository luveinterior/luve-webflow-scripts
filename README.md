# LUVÉ Webflow scripts

Custom code for luveinterior.com, served through jsDelivr:

- `script.js` — site-wide script (Site settings → Custom code → Footer)
  `https://cdn.jsdelivr.net/gh/luveinterior/luve-webflow-scripts@<commit>/script.min.js`
- `digital-card/card.css`, `digital-card/card.js` — Digital Card page (`/card/...`), loaded by the page's Code Embed
  `https://cdn.jsdelivr.net/gh/luveinterior/luve-webflow-scripts@<commit>/digital-card/card.min.js`

Pin URLs to a commit ID so each publish uses an exact version; change the ID to update or roll back.
- `furniture/shop.css`, `furniture/shop.js` — Furniture pages (`/furniture` and the product pages), loaded by each page's custom code
  `https://cdn.jsdelivr.net/gh/luveinterior/luve-webflow-scripts@<commit>/furniture/shop.min.css`
  `https://cdn.jsdelivr.net/gh/luveinterior/luve-webflow-scripts@<commit>/furniture/shop.min.js`
  (moved here from CodeSandbox so it can be versioned like the rest)
