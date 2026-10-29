// =====================================================
// 00. Page Transitions (Barba-style, no full reload)
// 功能：撳內部連結唔再成頁重新載入 —— 背景攞下一頁 HTML，
//       淡入 Brand Light 遮罩 → 換走 <body> 內容 → 重新啟動
//       全站 script（window.__luveRun）→ 遮罩淡出。
//       jQuery / Webflow / GSAP / Lenis / 字體全部唔使再下載。
// 範圍：暫時只喺 staging（*.webflow.io）啟用；正式網站照舊。
//       想正式網站都用：將 ENABLE 條件改成 true。
// 安全網：任何一步出錯、或者下一頁用唔同嘅 Webflow 模組，
//         就自動改用普通轉頁（location.href）。
// =====================================================
(function () {
  if (window.__luveLife) return;

  var SRC = (document.currentScript && document.currentScript.src) || "";
  var ENABLE =
    /\.webflow\.io$/.test(location.hostname) &&
    !!(window.fetch && window.DOMParser && history.pushState && window.Promise);

  var L = (window.__luveLife = { gen: 0, items: [], enabled: ENABLE, src: SRC });

  // ── per-run timers / observers（每次換頁會清走上一頁嘅）──
  function obs(C) {
    if (!C || !ENABLE) return C;
    var W = function (cb, o) {
      var x = new C(cb, o);
      L.items.push({ k: "obs", o: x });
      return x;
    };
    W.prototype = C.prototype;
    return W;
  }
  L.wrap = function (gen) {
    return {
      raf: function (cb) {
        return window.requestAnimationFrame(function (t) {
          if (gen === L.gen) cb(t);
        });
      },
      setInterval: function () {
        var id = window.setInterval.apply(window, arguments);
        if (ENABLE) L.items.push({ k: "int", id: id });
        return id;
      },
      RO: obs(window.ResizeObserver),
      MO: obs(window.MutationObserver),
      IO: obs(window.IntersectionObserver),
    };
  };
  L.start = function () {
    var w = L.wrap(L.gen);
    window.__luveRun(w.raf, w.setInterval, w.RO, w.MO, w.IO);
  };

  if (!ENABLE) return;

  var P = EventTarget.prototype,
    oAdd = P.addEventListener,
    oRem = P.removeEventListener;
  L.oAdd = oAdd;

  var docEl = document.documentElement;
  function persistent(t) {
    return t === window || t === document || t === docEl || t === document.body;
  }
  // Was this listener added by our code (this script or a page inline script),
  // rather than by a library (GSAP, Lenis, Webflow…)?
  function ours() {
    var lines = String(new Error().stack || "").split("\n"),
      self = false;
    for (var i = 0; i < lines.length; i++) {
      var f = lines[i];
      if (!/https?:\/\//.test(f)) continue;
      if (!self) {
        self = true; // the wrapper itself
        continue;
      }
      if (/jquery/i.test(f)) continue;
      if (SRC && f.indexOf(SRC) > -1) return true;
      return f.indexOf(location.origin + "/") > -1 && !/\.js[?:]/.test(f);
    }
    return false;
  }
  P.addEventListener = function (type, fn, opt) {
    if (fn && persistent(this) && ours()) {
      // after a swap these events have already happened → run once, soon
      if (
        L.gen > 0 &&
        (type === "DOMContentLoaded" || (type === "load" && this === window))
      ) {
        var me = this;
        setTimeout(
          function () {
            try {
              var ev = new Event(type);
              typeof fn === "function" ? fn.call(me, ev) : fn.handleEvent(ev);
            } catch (e) {
              console.error(e);
            }
          },
          type === "load" ? 80 : 0
        );
        return;
      }
      L.items.push({ k: "ev", t: this, type: type, fn: fn, opt: opt });
    }
    return oAdd.call(this, type, fn, opt);
  };
  if (window.gsap && gsap.ticker) {
    var oTick = gsap.ticker.add;
    gsap.ticker.add = function (fn) {
      if (ours()) L.items.push({ k: "tick", fn: fn });
      return oTick.apply(this, arguments);
    };
  }

  // head nodes that exist before our script adds anything
  var headBase = new Set([].slice.call(document.head.childNodes));
  var loaded = new Set(
    [].slice.call(document.scripts).map(function (s) {
      return s.src;
    })
  );
  function wfBundle(doc) {
    return [].slice
      .call(doc.querySelectorAll("script[src]"))
      .map(function (s) {
        return s.getAttribute("src");
      })
      .filter(function (u) {
        return /website-files\.com\/[^/]+\/js\/webflow/.test(u);
      })
      .sort()
      .join("|");
  }
  var currentBundle = wfBundle(document);

  function cleanup() {
    L.items.forEach(function (it) {
      try {
        if (it.k === "ev") oRem.call(it.t, it.type, it.fn, it.opt);
        else if (it.k === "int") clearInterval(it.id);
        else if (it.k === "obs") it.o.disconnect();
        else if (it.k === "tick") gsap.ticker.remove(it.fn);
      } catch (e) {}
    });
    L.items = [];
    try {
      if (window.lenis) window.lenis.destroy();
    } catch (e) {}
    window.lenis = null;
    try {
      ScrollTrigger.getAll().forEach(function (t) {
        t.kill();
      });
    } catch (e) {}
    try {
      gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) {
        t.kill();
      });
    } catch (e) {}
    [].slice.call(document.head.childNodes).forEach(function (n) {
      if (!headBase.has(n) && n.nodeName === "STYLE") n.remove();
    });
    docEl.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
    docEl.style.overflow = "";
    docEl.style.backgroundColor = "#f0e8dd";
  }

  // ── page-specific <head> styles（Projects / Process / Contact…）──
  function syncHead(doc) {
    document.title = doc.title;
    ["description", "og:title", "og:description"].forEach(function (k) {
      var sel = 'meta[name="' + k + '"],meta[property="' + k + '"]',
        a = document.head.querySelector(sel),
        b = doc.head.querySelector(sel);
      if (a && b) a.setAttribute("content", b.getAttribute("content"));
    });
    var key = function (n) {
      return n.nodeName === "STYLE"
        ? "s:" + n.textContent
        : "l:" + (n.getAttribute("href") || "");
    };
    var isPageCss = function (n) {
      return n.nodeName === "STYLE" || (n.nodeName === "LINK" && /stylesheet/i.test(n.rel));
    };
    var want = new Map();
    [].slice.call(doc.head.children).forEach(function (n) {
      if (isPageCss(n)) want.set(key(n), n);
    });
    [].slice.call(document.head.children).forEach(function (n) {
      if (!headBase.has(n) || !isPageCss(n)) return;
      if (want.has(key(n))) want.delete(key(n));
      else {
        headBase.delete(n);
        n.remove();
      }
    });
    want.forEach(function (n) {
      var c = document.importNode(n, true);
      document.head.appendChild(c);
      headBase.add(c);
    });
    // new external head scripts (e.g. Home marquee)
    return [].slice
      .call(doc.head.querySelectorAll("script[src]"))
      .map(function (s) {
        return s.getAttribute("src");
      })
      .filter(function (u) {
        return u && !loaded.has(new URL(u, location.href).href);
      });
  }

  function loadScript(src) {
    return new Promise(function (res) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = s.onerror = function () {
        res();
      };
      loaded.add(s.src);
      document.body.appendChild(s);
    });
  }

  function swapBody(doc) {
    var body = document.body,
      loader = body.querySelector(".page-loader");
    [].slice.call(body.attributes).forEach(function (a) {
      body.removeAttribute(a.name);
    });
    [].slice.call(doc.body.attributes).forEach(function (a) {
      body.setAttribute(a.name, a.value);
    });
    [].slice.call(body.childNodes).forEach(function (n) {
      if (n !== loader) n.remove();
    });
    var nl = doc.body.querySelector(".page-loader");
    if (nl) nl.remove();
    var inline = [],
      ext = [];
    [].slice.call(doc.body.querySelectorAll("script")).forEach(function (s) {
      var src = s.getAttribute("src");
      if (src) {
        var abs = new URL(src, location.href).href;
        if (!loaded.has(abs) && abs.indexOf("luve-webflow-scripts") < 0 && !/csb\.app/.test(abs))
          ext.push(abs);
        s.remove();
      } else inline.push(s);
    });
    var frag = document.createDocumentFragment();
    [].slice.call(doc.body.childNodes).forEach(function (n) {
      frag.appendChild(document.importNode(n, true));
    });
    if (loader) body.insertBefore(frag, loader);
    else body.appendChild(frag);
    // re-create inline scripts so they run (same position → currentScript works)
    var live = [].slice.call(body.querySelectorAll("script:not([src])"));
    live.forEach(function (old) {
      var s = document.createElement("script");
      [].slice.call(old.attributes).forEach(function (a) {
        s.setAttribute(a.name, a.value);
      });
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
    return ext;
  }

  function webflowReinit(doc) {
    ["data-wf-page", "data-wf-item-slug", "data-wf-collection"].forEach(function (k) {
      var v = doc.documentElement.getAttribute(k);
      if (v === null) docEl.removeAttribute(k);
      else docEl.setAttribute(k, v);
    });
    var W = window.Webflow;
    if (!W) return;
    try {
      W.destroy();
    } catch (e) {}
    try {
      W.ready();
    } catch (e) {}
    ["ix2", "ix3"].forEach(function (m) {
      try {
        var x = W.require(m);
        if (x && x.init) x.init();
      } catch (e) {}
    });
    // reCAPTCHA widgets inside the new page's forms
    try {
      if (window.grecaptcha && grecaptcha.render)
        document.querySelectorAll(".g-recaptcha").forEach(function (el) {
          if (!el.querySelector("iframe")) grecaptcha.render(el);
        });
    } catch (e) {}
  }

  // ── overlay（用返全站 .page-loader，Brand Light）──
  function loaderEl() {
    return document.querySelector(".page-loader");
  }
  function overlayIn() {
    return new Promise(function (res) {
      var l = loaderEl();
      if (!l) return res();
      var c = l.querySelector(".loader-content");
      if (c) c.style.opacity = "0";
      l.style.setProperty("background-color", "#f0e8dd", "important");
      l.style.transition = "none";
      l.style.display = "flex";
      l.style.visibility = "visible";
      l.style.opacity = "0";
      void l.offsetWidth;
      l.style.transition = "opacity .35s cubic-bezier(.65,0,.35,1)";
      l.style.opacity = "1";
      setTimeout(res, 360);
    });
  }
  function overlayOut() {
    var l = loaderEl();
    if (!l) return;
    l.style.transition = "opacity .55s cubic-bezier(.65,0,.35,1)";
    l.style.opacity = "0";
    setTimeout(function () {
      if (l.style.opacity === "0") l.style.display = "none";
    }, 600);
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
  }

  // ── fetch + cache ──
  var cache = new Map();
  function getHTML(url) {
    var k = url.split("#")[0];
    if (!cache.has(k))
      cache.set(
        k,
        fetch(k, { credentials: "same-origin" }).then(function (r) {
          if (!r.ok || !/text\/html/.test(r.headers.get("content-type") || ""))
            throw new Error("not html");
          return r.text();
        })
      );
    var p = cache.get(k);
    p.catch(function () {
      cache.delete(k);
    });
    return p;
  }

  function eligible(a) {
    if (!a || !a.href) return false;
    var raw = a.getAttribute("href") || "";
    if (!raw || raw.charAt(0) === "#") return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download") || a.classList.contains("no-transition")) return false;
    if (a.closest("[data-no-transition]")) return false;
    var u;
    try {
      u = new URL(a.href, location.href);
    } catch (e) {
      return false;
    }
    if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return false;
    if (/\.(pdf|vcf|jpe?g|png|webp|gif|zip|mp4)$/i.test(u.pathname)) return false;
    if (/^\/(card|401)(\/|$)/.test(u.pathname)) return false;
    if (/^\/(card)(\/|$)/.test(location.pathname)) return false;
    if (u.pathname === location.pathname && u.search === location.search) return false;
    return true;
  }

  var busy = false;
  function go(url, opt) {
    opt = opt || {};
    if (busy) return;
    busy = true;
    var html = getHTML(url);
    try {
      history.replaceState(
        Object.assign({}, history.state || {}, { luve: 1, y: window.scrollY }),
        "",
        location.href
      );
    } catch (e) {}
    try {
      sessionStorage.setItem("internal-transition", "true");
    } catch (e) {}
    Promise.all([html, overlayIn()])
      .then(function (r) {
        var doc = new DOMParser().parseFromString(r[0], "text/html");
        if (
          !doc.body ||
          wfBundle(doc) !== currentBundle ||
          doc.documentElement.getAttribute("data-wf-site") !== docEl.getAttribute("data-wf-site")
        ) {
          location.href = url; // different Webflow modules → normal page load
          return;
        }
        if (!opt.pop) history.pushState({ luve: 1, y: 0 }, "", url);
        return render(doc, url, opt);
      })
      .catch(function (e) {
        console.warn("[transition] fallback to full load:", e);
        location.href = url;
      });
  }

  function render(doc, url, opt) {
    cleanup();
    L.gen++;
    var newHeadScripts = syncHead(doc);
    docEl.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    var ext = swapBody(doc);
    return ext
      .concat(newHeadScripts)
      .reduce(function (p, src) {
        return p.then(function () {
          return loadScript(src);
        });
      }, Promise.resolve())
      .then(function () {
        webflowReinit(doc);
        L.start();
        try {
          sessionStorage.removeItem("internal-transition");
        } catch (e) {}
        var y = opt.pop && typeof opt.y === "number" ? opt.y : 0,
          hash = new URL(url, location.href).hash;
        return new Promise(function (res) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              try {
                ScrollTrigger.refresh();
              } catch (e) {}
              var t = hash && document.querySelector(hash);
              if (t) y = t.getBoundingClientRect().top + window.scrollY;
              if (y) {
                if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true });
                else window.scrollTo(0, y);
              }
              res();
            });
          });
        });
      })
      .then(function () {
        overlayOut();
        busy = false;
        // late images change the page height → keep ScrollTrigger in sync
        var t = 0;
        [].slice.call(document.images).forEach(function (im) {
          if (!im.complete)
            im.addEventListener(
              "load",
              function () {
                clearTimeout(t);
                t = setTimeout(function () {
                  try {
                    ScrollTrigger.refresh();
                  } catch (e) {}
                }, 120);
              },
              { once: true }
            );
        });
      })
      .catch(function (e) {
        console.error("[transition] render failed, reloading:", e);
        location.reload();
      });
  }

  // ── wiring（用原生 addEventListener，唔會被清走）──
  try {
    history.scrollRestoration = "manual";
  } catch (e) {}
  oAdd.call(
    document,
    "click",
    function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      var a = e.target && e.target.closest && e.target.closest("a[href]");
      if (!eligible(a)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      go(a.href);
    },
    true
  );
  var warm = function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (eligible(a)) getHTML(a.href).catch(function () {});
  };
  oAdd.call(document, "mouseover", warm, { passive: true });
  oAdd.call(document, "touchstart", warm, { passive: true });
  oAdd.call(window, "popstate", function (e) {
    if (busy) return location.reload();
    go(location.href, { pop: true, y: e.state && e.state.y });
  });
  try {
    history.replaceState({ luve: 1, y: 0 }, "", location.href);
  } catch (e) {}
})();

window.__luveRun = function (
  requestAnimationFrame,
  setInterval,
  ResizeObserver,
  MutationObserver,
  IntersectionObserver
) {
