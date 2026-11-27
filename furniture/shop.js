// =============================================================================
// LUVÉ Furniture — shop.js
// 只喺 /furniture 同 Furniture template page 載入（Page Settings → Before </body>），
// 放喺 site footer code（GSAP / Lenis / Swiper / script.js）之後。
// 其他 page 唔會載入呢個檔，所以唔會影響現有網站。
//
// TABLE OF CONTENTS
//   S0. Webflow CMS adapter (price / dimension formatting, empty fields)
//   S1. Helpers (storage, ready)
//   S2. Catalogue intro fade-in
//   S3. View switcher (default / grid / index)
//   S4. Default view — active row (side columns follow viewport centre)
//   S5. Index rows — directional wipe on hover
//   S6. Enquiry list (localStorage) + drawer
//   S7. Product page — gallery marquee (auto-scroll + drag + drag hint)
//   S8. Product page — options (with swatches), quantity, add to list
//   S9. Swatch preview — enlarged 1:1 swatch above the cursor
//   S9b. Option lines — "+N more options" when there are more than 3
//   S10. Product page — "Details" toggle
//   S11. Pill buttons — same look + hover motion as the GET IN TOUCH buttons
//   S12. Technical Specifications — dimension marks on the drawings
//   S13. 3D configurator (model-viewer) when the piece has a 3D model
//   S14. Line-reveal guard (sentences broken by an early line split)
//   S15. Technical Sheet panel + downloads (sheet PDF, image, 3D zip, selection PDF) + ±1 cm note
//   S16. Product tabs (Configurate / Description / Dimensions / Finishes / Downloads)
// =============================================================================
(function () {
  if (!document.body.classList.contains("body-shop")) return;

  // ===========================================================================
  // S1. Helpers
  // ===========================================================================
  const LIST_KEY = "luve-enquiry-list";
  const VIEW_KEY = "luve-shop-view";
  const VIEWS = ["default", "grid", "index"];

  const memory = {};
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return key in memory ? memory[key] : fallback;
      }
    },
    set(key, value) {
      memory[key] = value;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  const catalogue = $("[data-shop-catalogue]");
  const productRoot = $("[data-shop-product]");

  // Runs now (before script.js's DOMContentLoaded handlers bind page-transition
  // links): on the catalogue page "Continue browsing" only closes the drawer.
  if (catalogue) {
    $$("[data-shop-continue]").forEach((a) => a.classList.add("no-transition"));
  }

  adaptCmsMarkup();
  // The tagline is set by the text box, not by an early line split
  // (script.js SplitText splits once; a later font swap broke lines mid-sentence)
  $$(".shop-product__tagline").forEach((t) => {
    t.classList.add("no-line-reveal");
    // fonts were already cached → script.js may have split it already: undo
    if (t.dataset.linesSplit) {
      // \s = whitespace（之前漏咗反斜線，變成將每個字母 s 換成空格 → "the arm ri e"）
      t.textContent = (t.innerText || t.textContent).replace(/\s+/g, " ").trim();
      delete t.dataset.linesSplit;
    }
    if (window.gsap)
      window.gsap.from(t, {
        y: 24,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.25,
      });
  });

  // ===========================================================================
  // S0. Webflow CMS adapter — runs once, before everything else.
  //     Webflow can't format or branch on CMS values, so bound fields come out
  //     raw; this turns them into the same markup the prototype renders.
  //     Every step is a no-op on markup that is already final (prototype).
  // ===========================================================================
  function adaptCmsMarkup() {
    const EMPTY = "w-dyn-bind-empty"; // Webflow hides bound elements whose field is empty
    const isEmpty = (el) =>
      el.classList.contains(EMPTY) || !el.textContent.trim();
    const show = (el, text) => {
      el.textContent = text;
      el.classList.remove(EMPTY);
    };

    // Price (Number field): empty → "Price on request", 12800 → "HKD 12,800"
    $$("[data-shop-price]").forEach((el) => {
      const n = Number(el.textContent.replace(/[^\d.]/g, ""));
      show(
        el,
        isEmpty(el) || !n
          ? "Price on request"
          : `HKD ${n.toLocaleString("en-HK")}`
      );
    });

    // Rows that only make sense with a value (e.g. Seat height in the spec list)
    $$("[data-shop-optional]").forEach((row) => {
      const dims = $$("[data-shop-dim]", row);
      if (dims.length && dims.every(isEmpty)) row.remove();
    });

    // Dimensions (Number fields): empty → "—"; data-shop-unit="cm" is added to real values
    $$("[data-shop-dim]").forEach((el) => {
      const unit = (el.dataset.shopUnit || "").trim();
      show(
        el,
        isEmpty(el) ? "—" : el.textContent.trim() + (unit ? " " + unit : "")
      );
    });

    // Index rows hold three bare dimension spans: "W 60 × D 70 × H 80 cm"
    $$("[data-shop-size]").forEach((el) => {
      const [w, d, h] = $$("[data-shop-dim]", el).map((s) =>
        s.textContent.trim()
      );
      if (w != null) el.textContent = `W ${w} × D ${d} × H ${h} cm`;
    });

    // Enquiry form: placeholders / rows (not settable on Webflow form fields).
    // Same wording as the site's GET IN TOUCH form.
    const placeholders = {
      Name: "Full name",
      Email: "name@example.com",
      Phone: "+852 1234 5678",
      Message: "Room, quantities, timing or any questions…",
    };
    $$(".shop-enquiry__form input, .shop-enquiry__form textarea").forEach(
      (f) => {
        if (/^example text$/i.test(f.placeholder || "")) f.placeholder = "";
      }
    );
    Object.keys(placeholders).forEach((name) => {
      const input = $(`.shop-enquiry__form [name="${name}"]`);
      if (input) input.placeholder = placeholders[name];
    });
    const message = $('.shop-enquiry__form [name="Message"]');
    if (message) message.rows = 3;

    // Drawer header laid out like the GET IN TOUCH panel: "TITLE (2)" left,
    // CLOSE right. The old "Continue browsing" footer is dropped.
    const dHead = $(".shop-drawer__head");
    const dTitle = $(".shop-drawer__title");
    const dCount = $(".shop-drawer__count");
    const dClose = $(".shop-drawer__close");
    if (dHead && dTitle && dTitle.parentNode !== dHead)
      dHead.insertBefore(dTitle, dHead.firstChild);
    if (dTitle && dCount && dCount.parentNode !== dTitle)
      dTitle.appendChild(dCount);
    if (dHead && dClose) dHead.appendChild(dClose);
    $$(".shop-drawer__foot").forEach((el) => el.remove());

    // Collection notice (PDPO DPP1): purpose + link to the Privacy Policy, shown
    // before the visitor sends their details
    const enquiryForm = $(".shop-enquiry__form");
    if (enquiryForm && !$(".shop-enquiry__privacy", enquiryForm)) {
      const note = document.createElement("p");
      note.className = "shop-enquiry__privacy";
      note.innerHTML =
        'We use these details only to reply to your enquiry and arrange your order. See our <a href="/privacy-policy" class="no-transition" target="_blank" rel="noopener">Privacy Policy</a>.';
      const submit = $("[type='submit']", enquiryForm);
      if (submit) submit.parentNode.insertBefore(note, submit);
      else enquiryForm.appendChild(note);
    }

    // Technical drawings are optional: drop figures whose image field is empty
    $$(".shop-tech__fig").forEach((fig) => {
      const img = $("img", fig);
      if (img && (img.classList.contains(EMPTY) || !img.getAttribute("src")))
        fig.remove();
    });

    // Swatch 2 is optional: drop swatch boxes whose image field is empty
    $$(".shop-swatch").forEach((sw) => {
      const img = $("img", sw);
      if (img && (img.classList.contains(EMPTY) || !img.getAttribute("src")))
        sw.remove();
    });

    // Option groups with no Materials (e.g. a timber seat): plain text instead
    $$("[data-option-group]").forEach((dd) => {
      if ($(".shop-opts__list .shop-opt", dd)) return;
      if (!$(".w-dyn-list", dd)) return; // prototype fallback rows are already plain text
      dd.textContent = (dd.dataset.optionNote || "").trim() || "—";
      ["data-option-group", "data-option-note", "data-swatch-zone"].forEach(
        (a) => dd.removeAttribute(a)
      );
      dd.classList.remove("shop-opts");
    });

    // Index rows on the catalogue: materials column copies the option names of
    // the same piece from the default-view list (no extra nested lists needed)
    $$("[data-shop-row] [data-shop-materials]").forEach((cell) => {
      if (cell.textContent.trim()) return;
      const row = cell.closest("[data-shop-row]");
      const item =
        row.dataset.handle &&
        $(`[data-shop-item][data-handle="${CSS.escape(row.dataset.handle)}"]`);
      if (!item) return;
      cell.innerHTML = "";
      $$("dd", item).forEach((dd) => {
        if (
          !/^(Upholstery|Finish)$/.test(
            (dd.previousElementSibling || {}).textContent || ""
          )
        )
          return;
        const names = $$(".shop-opts__list .shop-opt__label", dd).map((l) =>
          l.textContent.trim()
        );
        const span = document.createElement("span");
        span.textContent = names.length
          ? names.join(" / ")
          : dd.textContent.trim();
        cell.appendChild(span);
      });
    });

    // Product page "More pieces": the list holds every piece; keep the 3 that
    // follow this one in catalogue order (wrapping), like the prototype
    if (productRoot) {
      const more = $$("[data-shop-more] [data-shop-row]", productRoot);
      const here = more.findIndex(
        (r) => r.dataset.handle === productRoot.dataset.handle
      );
      if (more.length && here >= 0) {
        const keep = new Set(
          [1, 2, 3].map((n) => more[(here + n) % more.length])
        );
        more.forEach((r) => keep.has(r) || r.remove());
      } else {
        more.slice(3).forEach((r) => r.remove());
      }
    }
  }

  // A photo that fails to load (network hiccup / flaky file:// read) retries once
  // with a cache-buster before giving up. Returns a promise: true = loaded.
  function loadWithRetry(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve(true);
    return new Promise((resolve) => {
      let retried = false;
      const retry = () => {
        if (retried) return resolve(false);
        retried = true;
        const src = img.getAttribute("src");
        setTimeout(() => {
          img.src = src + (src.includes("?") ? "&" : "?") + "retry=1";
        }, 300);
      };
      img.addEventListener("load", () => resolve(true));
      img.addEventListener("error", retry);
      if (img.complete && !img.naturalWidth) retry(); // already failed before we got here
    });
  }

  const onReady = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn)
      : fn();

  onReady(() => {
    // gallery photos are handled in S7; every other photo just gets one retry
    $$(".shop-main img, .shop-drawer img").forEach((img) => {
      if (!img.closest("[data-shop-gallery]")) loadWithRetry(img);
    });
    initPillButtons();
    initEnquiryList();
    initIndexRows();
    initOptionLists();
    initSwatchPreview();
    if (catalogue) {
      initViews();
      initActiveRows();
      initIntro();
    }
    if (productRoot) {
      initGallery();
      initProductForm();
      initDetails();
    }
  });

  // ===========================================================================
  // S2. Catalogue intro — list fades in after the Smart Page Loader has gone
  // ===========================================================================
  function initIntro() {
    const loader = $(".page-loader");
    const start = performance.now();
    const ready = () => catalogue.classList.add("is-ready");

    (function check() {
      const gone =
        !loader ||
        getComputedStyle(loader).display === "none" ||
        parseFloat(getComputedStyle(loader).opacity) < 0.05;
      if (gone || performance.now() - start > 5000)
        return setTimeout(ready, 150);
      setTimeout(check, 100);
    })();
  }

  // ===========================================================================
  // S3. View switcher
  // ===========================================================================
  function initViews() {
    const buttons = $$("[data-shop-view-btn]");
    const panels = {
      items: $('[data-shop-panel="items"]', catalogue),
      index: $('[data-shop-panel="index"]', catalogue),
    };
    let current = catalogue.dataset.view || "default";
    let busy = false;

    function apply(view) {
      current = view;
      catalogue.dataset.view = view;
      if (panels.items) panels.items.hidden = view === "index";
      if (panels.index) panels.index.hidden = view !== "index";
      buttons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.shopViewBtn === view))
      );
      store.set(VIEW_KEY, view);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      if (window.lenis) window.lenis.resize();
      document.dispatchEvent(
        new CustomEvent("shop:viewchange", { detail: { view } })
      );
    }

    // Willett (measured): fade out ≈ 250ms → swap layout while invisible → fade in ≈ 300ms
    const FADE_OUT = 250;
    function setView(view) {
      if (busy || view === current || !VIEWS.includes(view)) return;
      busy = true;
      catalogue.classList.add("is-switching");
      setTimeout(() => {
        // If we are below the top of the list, jump back to it while it is invisible
        const top =
          catalogue.getBoundingClientRect().top + window.scrollY - 140;
        if (window.scrollY > top) {
          if (window.lenis) window.lenis.scrollTo(top, { immediate: true });
          else window.scrollTo(0, top);
        }
        apply(view);
        // two frames: let the new layout paint at opacity 0 before fading in
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            catalogue.classList.remove("is-switching");
            setTimeout(() => (busy = false), 300);
          })
        );
      }, FADE_OUT + 10);
    }

    buttons.forEach((b) =>
      b.addEventListener("click", () => setView(b.dataset.shopViewBtn))
    );

    const saved = store.get(VIEW_KEY, null);
    apply(VIEWS.includes(saved) ? saved : current);
  }

  // ===========================================================================
  // S4. Default view — the row crossing the viewport centre is "active";
  //     only its sticky name/price + spec columns are visible (Willett style).
  // ===========================================================================
  function initActiveRows() {
    const items = $$("[data-shop-item]", catalogue);
    if (!items.length) return;

    let active = null;
    const setActive = (item) => {
      if (item === active) return;
      if (active) active.classList.remove("is-active");
      active = item;
      active.classList.add("is-active");
    };
    setActive(items[0]);

    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-active"));
      return;
    }

    // A 1px band across the middle of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target);
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    items.forEach((i) => io.observe(i));

    // Back above the first row → first row stays active
    window.addEventListener(
      "scroll",
      () => {
        if (items[0].getBoundingClientRect().top > window.innerHeight / 2)
          setActive(items[0]);
      },
      { passive: true }
    );
  }

  // ===========================================================================
  // S5. Index rows — dark fill wipes in from the edge the pointer entered,
  //     and wipes out towards the edge it left.
  // ===========================================================================
  function initIndexRows() {
    if (!canHover) return;
    $$("[data-shop-row]").forEach((row) => {
      const fill = $(".shop-row__fill", row);
      if (!fill) return;
      // GSAP owns the transform from here (the CSS translateY is only the no-JS start state)
      if (window.gsap) gsap.set(fill, { y: 0, yPercent: -101 });

      const fromTop = (e) => {
        const r = row.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      };

      row.addEventListener("mouseenter", (e) => {
        row.classList.add("is-hover");
        const start = fromTop(e) ? -101 : 101;
        if (window.gsap) {
          gsap.fromTo(
            fill,
            { yPercent: start },
            { yPercent: 0, duration: 0.45, ease: "power3.out", overwrite: true }
          );
        } else {
          fill.style.transform = "none";
        }
      });

      row.addEventListener("mouseleave", (e) => {
        row.classList.remove("is-hover");
        const end = fromTop(e) ? -101 : 101;
        if (window.gsap) {
          gsap.to(fill, {
            yPercent: end,
            duration: 0.4,
            ease: "power3.out",
            overwrite: true,
          });
        } else {
          fill.style.transform = `translateY(${end}%)`;
        }
      });
    });
  }

  // ===========================================================================
  // S6. Enquiry list + drawer
  //     Lines are keyed by product handle + chosen options, the same keys a
  //     Shopify cart uses, so this can later be swapped for a Shopify cart.
  // ===========================================================================
  let enquiry = null;

  function initEnquiryList() {
    const drawer = $("[data-shop-drawer]");
    if (!drawer) return;

    const linesEl = $("[data-shop-lines]", drawer);
    const field = $("[data-shop-lines-field]", drawer);
    const form = $("[data-shop-enquiry-form]", drawer);
    const done = $("[data-shop-enquiry-done]", drawer);
    const closeBtn = $(".shop-drawer__close", drawer);
    // Webflow native form: .w-form > form + .w-form-done; webflow.js toggles their inline display
    const wfDone =
      form &&
      form.parentElement &&
      form.parentElement.querySelector(".w-form-done");
    let lines = store.get(LIST_KEY, []);
    if (!Array.isArray(lines)) lines = [];
    let lastFocus = null;

    const esc = (s) =>
      String(s == null ? "" : s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      );
    const count = () => lines.reduce((n, l) => n + l.qty, 0);

    function summary() {
      return lines
        .map((l) => {
          const opts = l.options.map((o) => `${o.name}: ${o.value}`).join("; ");
          return `${l.qty} × ${l.title} (${l.sku})${opts ? " — " + opts : ""}`;
        })
        .join("\n");
    }

    function render() {
      const n = count();
      $$("[data-shop-list-count]").forEach(
        (el) => (el.textContent = String(n))
      );
      $$(".shop-drawer__count").forEach((el) => (el.textContent = `(${n})`));
      document.body.classList.toggle("shop-has-items", n > 0);
      drawer.classList.toggle("has-items", n > 0);
      $$("[data-shop-pill]").forEach((p) =>
        p.setAttribute("aria-hidden", String(n === 0))
      );
      if (field) field.value = summary();

      linesEl.innerHTML = lines
        .map(
          (l) => `
        <li class="shop-line" data-key="${esc(l.key)}">
          <img class="shop-line__img" src="${esc(l.image)}" alt="">
          <div>
            <div><span class="shop-line__name">${esc(
              l.title
            )}</span><span class="shop-line__sku">${esc(l.sku)}</span></div>
            <ul class="shop-line__opts">${l.options
              .map((o) => `<li>${esc(o.name)}: ${esc(o.value)}</li>`)
              .join("")}</ul>
            <div class="shop-line__qty">
              <button type="button" data-shop-line-step="-1" aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button type="button" data-shop-line-step="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button type="button" class="shop-line__remove" data-shop-line-remove>Remove</button>
        </li>`
        )
        .join("");
    }

    function save() {
      store.set(LIST_KEY, lines);
      render();
    }

    let add = function (line) {
      const key = [line.handle, ...line.options.map((o) => o.value)].join("|");
      const existing = lines.find((l) => l.key === key);
      if (existing) existing.qty = Math.min(99, existing.qty + line.qty);
      else lines.push(Object.assign({ key }, line));
      drawer.classList.remove("is-sent");
      if (wfDone) {
        // Webflow shows / hides its own success message with inline display
        wfDone.style.display = "";
        form.style.display = "";
      } else if (done) {
        done.hidden = true;
      }
      save();
    };

    // Same motion as the site's GET IN TOUCH panel (enquiry component timeline):
    //   open : backdrop 0→1 (.45s power2.out) + panel clip-path wipe from the right
    //          (1s power4.inOut); content rises in from .82s (.75s, stagger .085)
    //   close: panel wipes back (.8s power4.inOut); backdrop fades from .25s (.4s power2.in)
    const backdrop = $(".shop-drawer__backdrop", drawer);
    const panel = $(".shop-drawer__panel", drawer);
    const introEls = () =>
      [".shop-drawer__head", ".shop-drawer__body"]
        .map((s) => $(s, drawer))
        .filter(Boolean);
    const hasGsap = !!window.gsap;
    if (hasGsap) drawer.classList.add("has-gsap");
    let motion = null;
    let isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocus = document.activeElement;
      if (motion) motion.kill();
      // start state BEFORE the drawer becomes visible, so no frame flashes fully open
      if (hasGsap) {
        gsap.set(panel, { clipPath: "inset(0 0 0 100%)" });
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(introEls(), { yPercent: 40, opacity: 0 });
      }
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("shop-drawer-open");
      if (window.lenis) window.lenis.stop();
      if (!hasGsap) {
        setTimeout(
          () => closeBtn && closeBtn.focus({ preventScroll: true }),
          50
        );
        return;
      }
      motion = gsap
        .timeline({
          onComplete: () => closeBtn && closeBtn.focus({ preventScroll: true }),
        })
        .to(backdrop, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
        .to(
          panel,
          { clipPath: "inset(0 0 0 0%)", duration: 1, ease: "power4.inOut" },
          0
        )
        .to(
          introEls(),
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.085,
            ease: "power3.out",
          },
          0.82
        );
    }

    function finishClose() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("shop-drawer-open");
      if (window.lenis) window.lenis.start();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      if (lastFocus && lastFocus.focus)
        lastFocus.focus({ preventScroll: true });
      if (!hasGsap) return finishClose();
      if (motion) motion.kill();
      motion = gsap
        .timeline({ onComplete: finishClose })
        .to(
          panel,
          {
            clipPath: "inset(0 0 0 100%)",
            duration: 0.8,
            ease: "power4.inOut",
          },
          0
        )
        .to(backdrop, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.25);
    }

    // Same messages as the GET IN TOUCH form: ".field-error-msg" at the top right
    // of each field, shown when Send is pressed, cleared as soon as the visitor types.
    function initValidation(form) {
      const box = (f) => f.closest(".shop-field") || f.parentElement;
      const show = (f) => {
        const b = box(f);
        let m = b && b.querySelector(":scope > .field-error-msg");
        if (!m && b) {
          m = document.createElement("div");
          m.className = "field-error-msg";
          m.setAttribute("role", "alert");
          b.appendChild(m);
        }
        if (m) {
          m.textContent =
            f.type === "email" && f.validity.typeMismatch
              ? "*Invalid email address"
              : "*This field is required";
        }
        f.classList.add("is-error");
        if (b) b.classList.add("has-error");
      };
      const clear = (f) => {
        if (!f.matches || !f.matches("input, textarea, select")) return;
        f.classList.remove("is-error");
        const b = box(f);
        if (b) b.classList.remove("has-error");
      };
      const validate = () => {
        let first = null;
        $$("input, textarea, select", form).forEach((f) => {
          if (!f.willValidate || f.checkValidity()) return clear(f);
          first = first || f;
          show(f);
        });
        if (first) {
          first.reportValidity();
          try {
            first.focus({ preventScroll: true });
          } catch (e) {
            first.focus();
          }
        }
        return !first;
      };
      form.addEventListener(
        "click",
        (e) => {
          if (e.target.closest('[type="submit"]') && !validate()) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        },
        true
      );
      form.addEventListener("invalid", (e) => show(e.target), true);
      form.addEventListener("input", (e) => clear(e.target));
      form.addEventListener("change", (e) => clear(e.target));
      form.addEventListener("reset", () =>
        $$("input, textarea, select", form).forEach(clear)
      );
    }

    function clearAfterSend() {
      lines = [];
      store.set(LIST_KEY, lines);
      render();
      drawer.classList.add("has-items", "is-sent"); // keep the thank-you message visible
      if (done) done.hidden = false;
      if (form) form.reset();
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-shop-list-open]")) {
        e.preventDefault();
        open();
        return;
      }
      if (e.target.closest("[data-shop-list-close]")) {
        e.preventDefault();
        close();
        return;
      }
      const cont = e.target.closest("[data-shop-continue]");
      if (cont && catalogue) {
        e.preventDefault();
        close();
        return;
      }
      const lineEl = e.target.closest(".shop-line");
      if (!lineEl) return;
      const line = lines.find((l) => l.key === lineEl.dataset.key);
      if (!line) return;
      const step = e.target.closest("[data-shop-line-step]");
      if (step) {
        line.qty = Math.max(
          1,
          Math.min(99, line.qty + Number(step.dataset.shopLineStep))
        );
        save();
      } else if (e.target.closest("[data-shop-line-remove]")) {
        lines = lines.filter((l) => l !== line);
        save();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    if (form) {
      initValidation(form);
      // Keep the hidden "Enquiry list" field current right before Webflow serialises the form
      form.addEventListener(
        "submit",
        () => field && (field.value = summary()),
        true
      );
      // Prototype: guard.js blocks the real submit and fires this instead
      form.addEventListener("shop:prototype-submit", clearAfterSend);
      // Webflow: native success message (.w-form-done) appears after a real submit
      if (wfDone && "MutationObserver" in window) {
        new MutationObserver(() => {
          if (getComputedStyle(wfDone).display !== "none" && lines.length)
            clearAfterSend();
        }).observe(wfDone, { attributes: true, attributeFilter: ["style"] });
      }
    }

    // Another tab changed the list
    window.addEventListener("storage", (e) => {
      if (e.key !== LIST_KEY) return;
      lines = store.get(LIST_KEY, []);
      render();
    });

    // "Enquire about bespoke finishes": the drawer opens with the form even when
    // the list is empty, and a message the visitor can edit
    const lead = $(".shop-enquiry__lead", drawer);
    const leadText = lead ? lead.textContent : "";
    function ask(message) {
      const general = !lines.length;
      drawer.classList.toggle("is-general", general);
      if (lead)
        lead.textContent = general
          ? "Tell us what you have in mind and we will send you samples and finish options."
          : leadText;
      const msg = form && $('[name="Message"]', form);
      if (msg && message && !msg.value.trim()) msg.value = message;
      open();
    }
    const _add = add;
    add = function (line) {
      drawer.classList.remove("is-general");
      if (lead) lead.textContent = leadText;
      _add(line);
    };

    render();
    enquiry = { add, open, close, ask };
  }

  // ===========================================================================
  // S7. Product gallery — endless marquee, same as Willett (Embla AutoScroll):
  //     drifts left at ≈ 27px/s, loops seamlessly, can be dragged / flung,
  //     then carries on. Uses the LUVÉ .luve-drag-hint cursor on hover.
  // ===========================================================================
  function initGallery() {
    const el = $("[data-shop-gallery]", productRoot);
    const track = el && $("[data-shop-gallery-track]", el);
    if (!track) return;

    const SPEED = 27; // px per second — measured on willettspace.com
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let originals = Array.from(track.children);
    let setWidth = 0;
    let x = 0;
    let fling = 0; // px/s left over from a drag, decays back to the auto speed
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    // One full set of slides plus enough clones to cover the viewport twice
    function layout() {
      $$("[data-shop-clone]", track).forEach((c) => c.remove());
      // 每張相之間有間距（CSS margin-right）→ 一齊計入一圈嘅長度，循環先會接得啱
      setWidth = originals.reduce(
        (w, s) =>
          w +
          s.getBoundingClientRect().width +
          (parseFloat(getComputedStyle(s).marginRight) || 0),
        0
      );
      if (!setWidth) return;
      const copies = Math.ceil((el.clientWidth * 2) / setWidth);
      for (let i = 0; i < copies; i++) {
        originals.forEach((s) => {
          const clone = s.cloneNode(true);
          clone.setAttribute("data-shop-clone", "");
          clone.setAttribute("aria-hidden", "true");
          $$("img", clone).forEach((img) => (img.alt = ""));
          track.appendChild(clone);
        });
      }
    }

    function render() {
      if (setWidth) x = ((x % setWidth) - setWidth) % setWidth; // keep x in (-setWidth, 0]
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    }

    function tick(dtSeconds) {
      const dt = Math.min(dtSeconds, 0.064);
      if (!dragging) {
        x -= (reduceMotion ? 0 : SPEED) * dt;
        x += fling * dt;
        fling *= Math.pow(0.03, dt);
        if (Math.abs(fling) < 2) fling = 0;
      }
      render();
    }

    // Drag / fling
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      fling = 0;
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      x += dx;
      velocity = (dx / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX;
      lastT = now;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      fling = performance.now() - lastT < 100 ? velocity : 0;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    // Start once every photo has its real width. A photo that still fails after
    // one retry is dropped from the strip, so the loop never shows a broken image.
    // 條 gallery 闊過畫面，右邊嘅相喺 overflow 外面，loading="lazy" 會令佢哋
    // 永遠唔載入 → 一直等 → 唔郁、拉唔到。所以 gallery 嘅相即刻載入；
    // 最多等 4 秒，慢嘅相載好之後會自動重新排過。
    const loaded = originals.map((s) => {
      const img = $("img", s);
      if (img && img.loading === "lazy") img.loading = "eager";
      return img ? loadWithRetry(img) : Promise.resolve(true);
    });
    const slides = originals.slice();
    const done = slides.map(() => false);
    loaded.forEach((p, i) => p.then(() => (done[i] = true)));
    const timeout = new Promise((r) =>
      setTimeout(() => r(loaded.map(() => true)), 4000)
    );
    let started = false;
    Promise.race([Promise.all(loaded), timeout]).then((ok) => {
      if (started) return;
      started = true;
      // 4 秒後仍未載好嘅相：載好就重排（真係載唔到就移走）
      loaded.forEach((p, i) => {
        if (done[i]) return;
        p.then((good) => {
          const sl = slides[i];
          if (!good && sl.isConnected) {
            sl.remove();
            originals = originals.filter((o) => o !== sl);
          }
          layout();
          render();
        });
      });
      originals = originals.filter((s, i) => {
        if (!ok[i]) s.remove();
        return ok[i];
      });
      layout();
      if (window.gsap) {
        gsap.ticker.add((time, deltaTime) => tick(deltaTime / 1000));
      } else {
        let prev = performance.now();
        (function frame(now) {
          tick((now - prev) / 1000);
          prev = now;
          requestAnimationFrame(frame);
        })(prev);
      }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        layout();
        render();
      }, 150);
    });

    if (!canHover || !window.gsap) return;
    let hint = $(".luve-drag-hint.shop-drag-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "luve-drag-hint shop-drag-hint";
      hint.innerHTML =
        '<span class="luve-dh-arrows">← →</span><span class="luve-dh-label">Drag</span>';
      document.body.appendChild(hint);
      // DRAG label = same typography as the EXPLORE cursor text (same as script.js section 30)
      const cursorText = $(".cursor-text");
      const dragLabel = $(".luve-dh-label", hint);
      if (cursorText && dragLabel) {
        const cs = getComputedStyle(cursorText);
        [
          "fontFamily",
          "fontSize",
          "fontWeight",
          "letterSpacing",
          "textTransform",
          "color",
        ].forEach((prop) => (dragLabel.style[prop] = cs[prop]));
      }
    }
    gsap.set(hint, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 });
    const moveX = gsap.quickTo(hint, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(hint, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    el.addEventListener("mouseenter", (e) => {
      gsap.set(hint, { x: e.clientX, y: e.clientY });
      document.body.classList.add("luve-strip-active");
      gsap.to(hint, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    el.addEventListener("mousemove", (e) => {
      moveX(e.clientX);
      moveY(e.clientY);
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("luve-strip-active");
      gsap.to(hint, {
        opacity: 0,
        scale: 0.6,
        duration: 0.25,
        ease: "power2.in",
      });
    });
  }

  // ===========================================================================
  // S8. Product options + quantity + add to enquiry list
  //     The selects are built from the spec table's option lines
  //     ([data-option-group] → .shop-opt), so CMS data is entered once:
  //     every option (also those past the first 3) + the "Custom …" line.
  //     (Same shape as Shopify Option1 / Option2.)
  // ===========================================================================
  function initProductForm() {
    const form = $("[data-shop-options]", productRoot);
    if (!form) return;

    const fields = $("[data-shop-option-fields]", form);
    const optionText = (line) => {
      const label = $(".shop-opt__label", line);
      return (label ? label.textContent : line.textContent).trim();
    };

    $$(".shop-product__buy [data-option-group]", productRoot).forEach(
      (row, gi) => {
        const name = row.dataset.optionGroup;
        const lines = [
          ...$$(".shop-opts__list .shop-opt", row),
          ...$$("[data-option-custom]", row),
        ];
        if (!lines.length) return;

        buildDropdown(fields, `shop-opt-${gi}`, name, lines, optionText);
      }
    );

    const qtyInput = $("[data-shop-qty-input]", form);
    const clampQty = () => {
      const n = Math.round(Number(qtyInput.value) || 1);
      qtyInput.value = String(Math.max(1, Math.min(99, n)));
      return Number(qtyInput.value);
    };
    $$("[data-shop-qty-step]", form).forEach((b) =>
      b.addEventListener("click", () => {
        qtyInput.value = String(clampQty() + Number(b.dataset.shopQtyStep));
        clampQty();
      })
    );
    qtyInput.addEventListener("change", clampQty);

    const addBtn = $("[data-shop-add]", form);
    const addLabel = addBtn.textContent.trim();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!enquiry) return;
      const firstImg = $("[data-shop-gallery] img", productRoot);
      enquiry.add({
        handle: productRoot.dataset.handle || location.pathname,
        title:
          ($(".shop-product__name", productRoot) || {}).textContent ||
          document.title,
        sku: productRoot.dataset.sku || "",
        image: firstImg ? firstImg.currentSrc || firstImg.src : "",
        url: location.pathname + location.search,
        options: $$("select", fields).map((s) => ({
          name: s.name,
          value: s.options[s.selectedIndex].text,
        })),
        qty: clampQty(),
      });
      addBtn.classList.add("is-done");
      setBtnText(addBtn, "Added to enquiry list");
      setTimeout(() => {
        addBtn.classList.remove("is-done");
        setBtnText(addBtn, addLabel);
      }, 1800);
      enquiry.open();
    });
  }

  // ---------------------------------------------------------------------------
  // S8b. Dropdown with swatches. A native <select> can't show images in its open
  //      list, so the visible part is a "select-only combobox" (WAI-ARIA): focus
  //      stays on the button, which handles ↑ ↓ Home End Enter Space Esc Tab.
  //      A hidden <select name> keeps the value for the form.
  // ---------------------------------------------------------------------------
  function buildDropdown(parent, id, name, lines, optionText) {
    const swatchHTML = (line) => {
      const sw = line && $(".shop-swatch", line);
      const img = sw && $("img", sw);
      const label =
        sw && sw.dataset.label ? sw.dataset.label : optionText(line);
      return img
        ? `<span class="shop-swatch" data-label="${label.replace(
            /"/g,
            "&quot;"
          )}"><img src="${img.currentSrc || img.src}" alt=""></span>`
        : `<span class="shop-swatch is-custom"></span>`;
    };

    const wrap = document.createElement("div");
    wrap.className = "shop-select";
    wrap.innerHTML = `
      <span class="shop-select__label" id="${id}-label"></span>
      <div class="shop-select__control" data-swatch-zone>
        <button type="button" class="shop-select__button" id="${id}-button" role="combobox" aria-haspopup="listbox" aria-controls="${id}-list" aria-expanded="false" aria-labelledby="${id}-label ${id}-button"></button>
        <ul class="shop-select__list" role="listbox" id="${id}-list" aria-labelledby="${id}-label" data-lenis-prevent></ul>
        <select name="" hidden tabindex="-1" aria-hidden="true"></select>
      </div>`;
    $(".shop-select__label", wrap).textContent = name;
    const control = $(".shop-select__control", wrap);
    const button = $(".shop-select__button", wrap);
    const list = $(".shop-select__list", wrap);
    const select = $("select", wrap);
    select.name = name;

    lines.forEach((line, i) => {
      select.add(new Option(optionText(line), String(i)));
      const li = document.createElement("li");
      li.className = "shop-select__option";
      li.id = `${id}-opt-${i}`;
      li.setAttribute("role", "option");
      li.dataset.index = String(i);
      li.innerHTML = `${swatchHTML(line)}<span></span>`;
      li.lastElementChild.textContent = optionText(line);
      list.appendChild(li);
    });
    const items = $$(".shop-select__option", list);
    parent.appendChild(wrap);

    let active = 0;
    const setActive = (i) => {
      active = Math.max(0, Math.min(items.length - 1, i));
      items.forEach((li, n) => li.classList.toggle("is-active", n === active));
      button.setAttribute("aria-activedescendant", items[active].id);
      // keep the active option in view inside the list only (never scroll the page)
      const li = items[active];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (
        li.offsetTop + li.offsetHeight >
        list.scrollTop + list.clientHeight
      )
        list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    };
    const choose = (i) => {
      select.selectedIndex = i;
      items.forEach((li, n) =>
        li.setAttribute("aria-selected", String(n === i))
      );
      button.innerHTML = `${swatchHTML(
        lines[i]
      )}<span class="shop-select__value"></span>`;
      $(".shop-select__value", button).textContent = optionText(lines[i]);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const open = () => {
      document.dispatchEvent(
        new CustomEvent("shop:dropdown-open", { detail: wrap })
      );
      control.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      setActive(select.selectedIndex);
    };
    const isOpen = () => control.classList.contains("is-open");
    const close = (focusButton) => {
      if (!isOpen()) return;
      control.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-activedescendant");
      if (focusButton) button.focus({ preventScroll: true });
    };

    button.addEventListener("click", () => (isOpen() ? close(true) : open()));
    button.addEventListener("keydown", (e) => {
      if (!isOpen()) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          open();
        }
        return;
      }
      const keys = {
        ArrowDown: active + 1,
        ArrowUp: active - 1,
        Home: 0,
        End: items.length - 1,
      };
      if (e.key in keys) {
        e.preventDefault();
        setActive(keys[e.key]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(active);
        close(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation(); // don't also close the enquiry drawer
        close(true);
      } else if (e.key === "Tab") {
        close(false);
      }
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest(".shop-select__option");
      if (!li) return;
      choose(Number(li.dataset.index));
      close(true);
    });
    list.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".shop-select__option");
      if (li) setActive(Number(li.dataset.index));
    });
    document.addEventListener("pointerdown", (e) => {
      if (!wrap.contains(e.target)) close(false);
    });
    document.addEventListener("shop:dropdown-open", (e) => {
      if (e.detail !== wrap) close(false);
    });

    choose(0);
  }

  // ===========================================================================
  // S9. Swatch preview — hovering an Upholstery / Finish row (or option select)
  //     fades in a larger 1:1 swatch just above the cursor, clear of the
  //     LUVÉ cursor circle. The swatch under the pointer wins; otherwise the first.
  // ===========================================================================
  function initSwatchPreview() {
    if (!canHover || !window.gsap) return;

    const OFFSET = 64; // px above the pointer (VIEW cursor is 100px wide)
    const preview = document.createElement("div");
    preview.className = "shop-swatch-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.innerHTML = '<img alt=""><span></span>';
    document.body.appendChild(preview);
    const img = $("img", preview);
    const caption = $("span", preview);

    gsap.set(preview, {
      xPercent: -50,
      yPercent: -100,
      autoAlpha: 0,
      scale: 0.92,
      transformOrigin: "50% 100%",
    });
    const moveX = gsap.quickTo(preview, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(preview, "y", {
      duration: 0.35,
      ease: "power3.out",
    });
    let current = null;

    const hide = () => {
      if (!current) return;
      current = null;
      gsap.to(preview, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.2,
        ease: "power2.in",
        overwrite: "auto",
      });
    };

    document.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        // Swatch under the pointer → else the first swatch of that option line
        // (or of the select chip). Empty space in the row / the dashed "Custom" line hide it.
        const zone = e.target.closest && e.target.closest("[data-swatch-zone]");
        const line =
          zone &&
          (e.target.closest(".shop-opt, .shop-select__option") ||
            (zone.matches(".shop-select__control") &&
              $(".shop-select__button", zone)));
        const swatch =
          line && (e.target.closest(".shop-swatch") || $(".shop-swatch", line));
        const swImg = swatch && $("img", swatch);
        if (!swImg) return hide();

        if (!current)
          gsap.set(preview, { x: e.clientX, y: e.clientY - OFFSET });
        moveX(e.clientX);
        moveY(e.clientY - OFFSET);
        if (swatch !== current) {
          img.src = swImg.currentSrc || swImg.src;
          caption.textContent = swatch.dataset.label || "";
          if (!current)
            gsap.to(preview, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          current = swatch;
        }
      },
      { passive: true }
    );
    document.addEventListener("pointerdown", hide);
    window.addEventListener("scroll", hide, { passive: true });
  }

  // ===========================================================================
  // S9b. Option lines — CSS shows the first 3; when there are more, add a
  //      "+N more options" note above the "Custom …" line (the select has them all)
  // ===========================================================================
  function initOptionLists() {
    const MAX = 3;
    $$("[data-option-group]").forEach((row) => {
      const extra = $$(".shop-opts__list .shop-opt", row).length - MAX;
      if (extra <= 0 || $(".shop-opt--more", row)) return;
      const more = document.createElement("span");
      more.className = "shop-opt shop-opt--more";
      more.textContent = `+${extra} more option${extra > 1 ? "s" : ""}`;
      const custom = $("[data-option-custom]", row);
      row.insertBefore(more, custom || null);
    });
  }

  // ===========================================================================
  // S10. "Details" — longer description opens under the short one
  // ===========================================================================
  function initDetails() {
    $$("[data-shop-details]", productRoot).forEach((box) => {
      const btn = $("[data-shop-details-btn]", box);
      const panel = $("[data-shop-details-panel]", box);
      if (!btn || !panel) return;
      panel.inert = true;
      btn.addEventListener("click", () => {
        const open = !box.classList.contains("is-open");
        box.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        panel.inert = !open;
        setTimeout(() => {
          if (window.ScrollTrigger) ScrollTrigger.refresh();
          if (window.lenis) window.lenis.resize();
        }, 650);
      });
    });
  }
  // ===========================================================================
  // S11. Pill buttons — same structure, colours and hover motion as the
  //      enquiry component's NEXT / BACK / SUBMIT (hoverButton in its embed):
  //      desktop: colour sweep, dot fades in at the left, text slides 12px;
  //      touch: quick press (scale .96) instead of hover.
  //      Dark buttons (.shop-btn--dark, pill) = NEXT/SUBMIT, line buttons = BACK.
  // ===========================================================================
  function setBtnText(btn, text) {
    const label = btn.querySelector("[data-shop-btn-text]");
    if (label) label.textContent = text;
    else btn.textContent = text;
  }

  function initPillButtons() {
    // Webflow's native form button is <input type=submit>, which can't hold the
    // dot: swap it for a <button> (webflow.js finds submit buttons with :input).
    $$(".shop-enquiry__form input[type='submit']").forEach((input) => {
      const btn = document.createElement("button");
      btn.type = "submit";
      btn.className =
        input.className.replace(/\bw-button\b/, "").trim() ||
        "shop-btn shop-btn--dark";
      if (input.dataset.wait) btn.dataset.wait = input.dataset.wait;
      btn.textContent = input.value;
      input.replaceWith(btn);
    });

    const gsap = window.gsap;
    const touch = window.matchMedia(
      "(max-width: 991px), (hover: none)"
    ).matches;
    const DARK = "#795e49";
    const LIGHT = "#f0e8dd";

    $$(".shop-btn, .shop-list-pill").forEach((btn) => {
      if (btn.dataset.shopBtnBound) return;
      // Structure: <span data-shop-btn-text>Label</span><span class="btn-arrow"></span>
      let text = btn.querySelector("[data-shop-btn-text]");
      if (!text) {
        text = document.createElement("span");
        text.setAttribute("data-shop-btn-text", "");
        while (btn.firstChild) text.appendChild(btn.firstChild);
        btn.appendChild(text);
      }
      let arrow = btn.querySelector(".btn-arrow");
      if (!arrow) {
        arrow = document.createElement("span");
        arrow.className = "btn-arrow";
        arrow.setAttribute("aria-hidden", "true");
        btn.appendChild(arrow);
      }
      if (!gsap) return; // CSS :hover fallback stays active

      const light = btn.classList.contains("shop-btn--line");
      const baseBg = light ? LIGHT : DARK;
      const baseText = light ? DARK : LIGHT;
      // dark pills → Brand Light with dark text (same as the floating MENU pill);
      // line pills → dark
      const hoverBg = light ? DARK : LIGHT;
      const hoverText = light ? LIGHT : DARK;
      btn.dataset.shopBtnBound = "true";
      const busy = () => btn.classList.contains("is-done");

      if (touch) {
        gsap.set(arrow, { display: "none" });
        gsap.set(text, { x: 0, color: baseText });
        const press = () => {
          if (busy()) return;
          gsap.to(btn, {
            scale: 0.96,
            backgroundColor: hoverBg,
            duration: 0.1,
            ease: "power1.out",
            overwrite: "auto",
          });
          gsap.to(text, { color: hoverText, duration: 0.1, overwrite: "auto" });
        };
        const release = () => {
          gsap.to(btn, {
            scale: 1,
            backgroundColor: baseBg,
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
          });
          gsap.to(text, { color: baseText, duration: 0.2, overwrite: "auto" });
        };
        btn.addEventListener("touchstart", press, { passive: true });
        btn.addEventListener("touchend", release, { passive: true });
        btn.addEventListener("touchcancel", release, { passive: true });
        btn.addEventListener("mousedown", press);
        btn.addEventListener("mouseup", release);
        btn.addEventListener("mouseleave", release);
        return;
      }

      gsap.set(text, { x: 0, color: baseText });
      gsap.set(arrow, {
        autoAlpha: 0,
        x: -15,
        scale: 0.6,
        backgroundColor: "transparent",
        borderColor: baseText,
      });
      btn.addEventListener("mouseenter", () => {
        if (busy()) return;
        gsap.to(btn, {
          backgroundColor: hoverBg,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(arrow, {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          backgroundColor: hoverText,
          borderColor: hoverText,
          duration: 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
        gsap.to(text, {
          x: 12,
          color: hoverText,
          duration: 1,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          backgroundColor: baseBg,
          duration: 0.6,
          overwrite: "auto",
        });
        gsap.to(arrow, {
          autoAlpha: 0,
          x: -15,
          scale: 0.6,
          backgroundColor: "transparent",
          borderColor: baseText,
          duration: 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
        gsap.to(text, {
          x: 0,
          color: baseText,
          duration: 0.8,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
    });
  }
  // ===========================================================================
  // S12. Technical Specifications — dimension lines on the drawings: side view
  //      = height (left) + depth (below), front view = width (below), each
  //      running the full extent of the piece. Values come from the Width /
  //      Depth / Height rows.
  // ===========================================================================
  function buildTechDims() {
    const tech = $(".shop-tech", productRoot || document);
    if (!tech) return;
    const dims = {};
    $$(".shop-tech__dims .shop-spec__row", tech).forEach((row) => {
      const key = (($("dt", row) || {}).textContent || "").trim().toLowerCase();
      const value = (($("dd", row) || {}).textContent || "").trim();
      if (/\d/.test(value)) dims[key] = value.replace(/\s*cm$/, "") + " cm";
    });

    $$(".shop-tech__fig", tech).forEach((fig) => {
      const img = $("img", fig);
      if (!img) return;
      const which = (
        img.alt ||
        ($("figcaption", fig) || {}).textContent ||
        ""
      ).toLowerCase();
      const marks = /side/.test(which)
        ? [
            ["h", dims.height],
            ["d", dims.depth],
          ]
        : /front/.test(which)
        ? [["w", dims.width]]
        : [];
      const els = marks
        .filter((m) => m[1])
        .map(([axis, value]) => {
          const el = document.createElement("div");
          el.className = "shop-tech__dim shop-tech__dim--" + axis;
          el.setAttribute("aria-hidden", "true");
          const val = document.createElement("span");
          val.className = "shop-tech__dim-val";
          val.textContent = value;
          el.appendChild(val);
          fig.appendChild(el);
          return { axis, el };
        });
      if (!els.length) return;
      fig.classList.add("has-dims");

      // Lines run the full extent of the piece in the drawing, so the drawing
      // is scanned for its outline (bounding box of the ink).
      const layout = (box) => {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        if (!nw || !nh) return;
        const fr = fig.getBoundingClientRect();
        const ir = img.getBoundingClientRect();
        const s = Math.min(ir.width / nw, ir.height / nh); // object-fit: contain
        const ox = ir.left - fr.left + (ir.width - nw * s) / 2;
        const oy = ir.top - fr.top + (ir.height - nh * s) / 2;
        const L = ox + box.x0 * nw * s;
        const R = ox + box.x1 * nw * s;
        const T = oy + box.y0 * nh * s;
        const B = oy + box.y1 * nh * s;
        const gap = isDesktop() ? 22 : 16;
        els.forEach(({ axis, el }) => {
          if (axis === "h") {
            Object.assign(el.style, {
              left: L - gap - 1 + "px",
              top: T + "px",
              height: B - T + "px",
              width: "",
            });
          } else {
            Object.assign(el.style, {
              left: L + "px",
              top: B + gap + "px",
              width: R - L + "px",
              height: "",
            });
          }
        });
      };
      let box = { x0: 0, y0: 0, x1: 1, y1: 1 };
      const relayout = () => layout(box);
      const ready =
        img.complete && img.naturalWidth
          ? Promise.resolve()
          : new Promise((r) => img.addEventListener("load", r, { once: true }));
      ready
        .then(() => inkBox(img.currentSrc || img.src))
        .then((b) => (box = b))
        .catch(() => {})
        .then(() => {
          relayout();
          if ("ResizeObserver" in window)
            new ResizeObserver(relayout).observe(fig);
          else window.addEventListener("resize", relayout);
        });
    });
  }

  // Bounding box of the dark lines in a drawing (0–1 of the image size)
  const inkCache = {};
  function inkBox(url) {
    if (inkCache[url]) return inkCache[url];
    inkCache[url] = new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        const k = Math.min(
          1,
          500 / Math.max(im.naturalWidth, im.naturalHeight)
        );
        const w = Math.max(1, Math.round(im.naturalWidth * k));
        const h = Math.max(1, Math.round(im.naturalHeight * k));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        g.drawImage(im, 0, 0, w, h);
        let d;
        try {
          d = g.getImageData(0, 0, w, h).data;
        } catch (e) {
          return reject(e); // no CORS: fall back to the whole image
        }
        let x0 = w,
          y0 = h,
          x1 = -1,
          y1 = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (
              d[i + 3] > 40 &&
              d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11 < 200
            ) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        if (x1 < 0) return reject(new Error("blank drawing"));
        resolve({ x0: x0 / w, y0: y0 / h, x1: (x1 + 1) / w, y1: (y1 + 1) / h });
      };
      im.onerror = () => reject(new Error("drawing " + url));
      im.src = url;
    });
    return inkCache[url];
  }

  // ===========================================================================
  // S13. 3D configurator (Poliform-style). Shown only when the piece has a
  //      "3D model" (CMS Link field → [data-shop-model] on the product root).
  //      Viewer: Google <model-viewer>, loaded when the section comes near.
  //      The model needs one material per configurable part, named "fabric…"
  //      and "wood…". Swatch photos come from the Furniture Materials CMS and
  //      are made seamless in the browser before they go on the model.
  // ===========================================================================
  const MV_SRC =
    "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.2.0/dist/model-viewer.min.js";
  const CDN = "https://cdn.prod.website-files.com/68da0dcc1d086704a4e2d623/";
  // Furniture Materials (CMS) that work as repeating textures, in display order
  const CFG_MATERIALS = {
    fabric: [
      [
        "Rust and cream tweed",
        "6abf87d0780ea55c34f3fa54_6abf86390fa8b5425c8e4539_SW_F09.jpeg",
      ],
      [
        "Oval jacquard",
        "6abf87cc780ea55c34f3f7e4_6abf8638ca6cd200da92be27_SW_F01.jpeg",
      ],
      [
        "Oval jacquard, horizontal",
        "6af42357726ad69e0a86dc2c_6af4233c5c11aab276f6c1e1_SW_F14.jpeg",
      ],
      [
        "Botanical jacquard",
        "6abf87cd780ea55c34f3f820_6abf86383839945a6a2c6e2d_SW_F02.jpeg",
      ],
      [
        "Green geometric jacquard",
        "6abf87cd780ea55c34f3f8a7_6abf863829f9636ef27569c6_SW_F03.jpeg",
      ],
      [
        "Palm-leaf jacquard",
        "6abf87ce780ea55c34f3f925_6abf86383839945a6a2c6e57_SW_F04.jpeg",
      ],
      [
        "Geometric jacquard",
        "6abf87cf780ea55c34f3f969_6abf8638691a5efd6f77fe8d_SW_F05.jpeg",
      ],
      [
        "Quilted wave fabric",
        "6abf87cf780ea55c34f3f994_6abf8639dcf35b4e2225dcf0_SW_F06.jpeg",
      ],
      [
        "Ivory bouclé",
        "6abf87cf780ea55c34f3f9d5_6abf8639928793450c6791e7_SW_F07.jpeg",
      ],
      [
        "Navy chenille",
        "6abf87d0780ea55c34f3fa89_6abf863abc8d7d76d81f6f57_SW_F10.jpeg",
      ],
      [
        "Burnt-orange chenille",
        "6abf87d1780ea55c34f3faac_6abf863ba10f811923c781fb_SW_F12.jpeg",
      ],
      [
        "Woven paper cord",
        "6abf87d0780ea55c34f3fa2e_6abf86392fc5d7bb5a5482d3_SW_F08.jpeg",
      ],
      [
        "Black woven paper cord",
        "6abf87d1780ea55c34f3fae0_6abf863ba10f811923c7821d_SW_F13.jpeg",
      ],
    ],
    timber: [
      [
        "Reddish-brown timber",
        "6abf87d0780ea55c34f3fa65_6abf863e72818784d11da669_SW_T09.jpeg",
      ],
      [
        "Dark-stained timber",
        "6abf87cd780ea55c34f3f852_6abf863bdcf35b4e2225de42_SW_T01.jpeg",
      ],
      [
        "Walnut-tone timber",
        "6abf87d0780ea55c34f3fa0f_6abf863e72818784d11da647_SW_T08.jpeg",
      ],
      [
        "Dark walnut-tone timber",
        "6abf87ce780ea55c34f3f94a_6abf863c334bd533bae0495b_SW_T06.jpeg",
      ],
      [
        "Warm brown timber",
        "6abf87ce780ea55c34f3f8d8_6abf863ce4586d0a496c97b3_SW_T05.jpeg",
      ],
      [
        "Warm oak-tone timber",
        "6abf87cf780ea55c34f3f9b4_6abf863dbc8d7d76d81f7116_SW_T07.jpeg",
      ],
      [
        "Black-stained ash",
        "6abf87cd780ea55c34f3f87e_6abf863c29f9636ef2756ca6_SW_T04.jpeg",
      ],
    ],
  };
  const CFG_PARTS = [
    {
      key: "fabric",
      option: "Upholstery",
      title: "Upholstery",
      match: /^fabric/i,
    },
    {
      key: "timber",
      option: "Finish",
      title: "Timber finish",
      match: /^wood/i,
    },
  ];
  const CFG_VIEWS = [
    ["3/4", "-35deg 75deg auto"],
    ["Front", "0deg 82deg auto"],
    ["Side", "-90deg 82deg auto"],
    ["Back", "180deg 78deg auto"],
    ["Top", "-20deg 18deg auto"],
  ];
  const ICON_ROTATE =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const ICON_FULL =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

  function buildConfigurator() {
    if (!productRoot) return;
    const model = (productRoot.dataset.shopModel || "").trim();
    if (!/\.glb(\?|$)/i.test(model) || $("[data-shop-cfg]", productRoot))
      return;
    const anchor = $(".shop-tech", productRoot) || $(".shop-more", productRoot);
    if (!anchor) return;

    // The piece's own options (spec table) are marked "As shown" and picked first
    const own = {};
    $$(".shop-product__buy [data-option-group]", productRoot).forEach((row) => {
      own[row.dataset.optionGroup] = $$(
        ".shop-opts__list .shop-opt__label",
        row
      ).map((l) => l.textContent.trim().toLowerCase());
    });

    const esc = (s) =>
      String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      );
    const groups = CFG_PARTS.map((part) => {
      const mine = own[part.option] || [];
      const items = CFG_MATERIALS[part.key].map(([name, file]) => ({
        name,
        url: CDN + file,
        own: mine.includes(name.toLowerCase()),
      }));
      items.sort((a, b) => b.own - a.own);
      return { part, items };
    });

    const swatches = (g) =>
      g.items
        .map(
          (it, i) =>
            `<button type="button" class="shop-cfg__swatch" role="radio" aria-checked="false" data-cfg-part="${
              g.part.key
            }" data-cfg-index="${i}" title="${esc(it.name)}" aria-label="${esc(
              it.name
            )}" style="background-image:url('${it.url}')">${""}</button>`
        )
        .join("");

    const sec = document.createElement("section");
    sec.className = "shop-cfg no-line-reveal";
    sec.setAttribute("data-shop-cfg", "");
    sec.id = "configure";
    sec.innerHTML = `
      <h2 class="shop-rule-title">Configure in 3D</h2>
      <div class="shop-cfg__wrap">
        <div class="shop-cfg__stage" data-cfg-stage data-lenis-prevent>
          <model-viewer data-cfg-viewer camera-controls touch-action="pan-y" interaction-prompt="auto"
            camera-orbit="${
              CFG_VIEWS[0][1]
            }" min-camera-orbit="auto 15deg auto" max-camera-orbit="auto 100deg auto"
            interpolation-decay="120" shadow-intensity="1.1" shadow-softness="0.9" exposure="1.05"
            environment-image="neutral" tone-mapping="neutral" reveal="manual" loading="eager"
            ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" alt="3D model">
            <button slot="ar-button" type="button" class="shop-cfg__ar">View in your room</button>
            <div slot="progress-bar" class="shop-cfg__progress" data-cfg-progress><span></span></div>
          </model-viewer>
          <p class="shop-cfg__loading" data-cfg-loading>Loading 3D model…</p>
          <div class="shop-cfg__tools">
            <div class="shop-cfg__views" role="group" aria-label="Viewpoint">
              ${CFG_VIEWS.map(
                (v, i) =>
                  `<button type="button" data-cfg-view="${
                    v[1]
                  }" aria-pressed="${i === 0}">${v[0]}</button>`
              ).join("")}
            </div>
            <button type="button" class="shop-cfg__icon" data-cfg-zoom="-1" aria-label="Zoom out">−</button>
            <button type="button" class="shop-cfg__icon" data-cfg-zoom="1" aria-label="Zoom in">+</button>
            <button type="button" class="shop-cfg__icon" data-cfg-rotate aria-pressed="false" aria-label="Auto-rotate">${ICON_ROTATE}</button>
            <button type="button" class="shop-cfg__icon" data-cfg-full aria-label="Full screen">${ICON_FULL}</button>
          </div>
          <p class="shop-cfg__hint">Drag to turn · scroll to zoom</p>
        </div>
        <div class="shop-cfg__panel">
          ${groups
            .map(
              (g, gi) => `
            <div class="shop-cfg__group">
              <div class="shop-cfg__group-head">
                <span class="shop-cfg__step">0${gi + 1}</span>
                <h3 class="shop-cfg__title">${g.part.title}</h3>
                <span class="shop-cfg__picked" data-cfg-picked="${
                  g.part.key
                }"></span>
              </div>
              <div class="shop-cfg__swatches" role="radiogroup" aria-label="${
                g.part.title
              }">${swatches(g)}</div>
            </div>`
            )
            .join("")}
          <div class="shop-cfg__summary">
            <p class="shop-cfg__summary-label">Your selection</p>
            <p class="shop-cfg__summary-text" data-cfg-summary></p>
            <button type="button" class="shop-btn shop-btn--dark" data-cfg-add>Add to enquiry list</button>
          </div>
        </div>
      </div>`;
    anchor.parentNode.insertBefore(sec, anchor);
    sec._cfgGroups = groups;

    // Link from the buy column down to the configurator
    const buy = $(".shop-product__buy", productRoot);
    if (buy && !$("[data-cfg-jump]", buy)) {
      const jump = document.createElement("a");
      jump.href = "#configure";
      jump.className = "shop-btn shop-btn--line shop-cfg__jump no-transition";
      jump.setAttribute("data-cfg-jump", "");
      jump.textContent = "Configure in 3D";
      const note = $(".shop-note", buy);
      buy.insertBefore(jump, note || null);
    }
  }

  // Seamless tile from a swatch photo: blend it with a copy shifted by half a
  // tile, so edges wrap cleanly (no mirrored "kaleidoscope" pattern).
  const seamlessCache = {};
  function seamless(url, size = 768) {
    if (seamlessCache[url]) return seamlessCache[url];
    seamlessCache[url] = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const a = document.createElement("canvas");
        a.width = a.height = size;
        const ga = a.getContext("2d");
        ga.drawImage(img, 0, 0, size, size);
        const b = document.createElement("canvas");
        b.width = b.height = size;
        const gb = b.getContext("2d");
        const h = size / 2;
        [
          [-h, -h],
          [h, -h],
          [-h, h],
          [h, h],
        ].forEach(([x, y]) => gb.drawImage(a, x, y));
        const A = ga.getImageData(0, 0, size, size);
        const B = gb.getImageData(0, 0, size, size).data;
        const d = A.data;
        for (let y = 0; y < size; y++) {
          const dy = Math.min(y, size - 1 - y) / h;
          for (let x = 0; x < size; x++) {
            let m = Math.min(Math.min(x, size - 1 - x) / h, dy) * 2.5;
            m = m >= 1 ? 1 : m * m * (3 - 2 * m);
            const i = (y * size + x) * 4;
            d[i] = d[i] * m + B[i] * (1 - m);
            d[i + 1] = d[i + 1] * m + B[i + 1] * (1 - m);
            d[i + 2] = d[i + 2] * m + B[i + 2] * (1 - m);
          }
        }
        ga.putImageData(A, 0, 0);
        a.toBlob(
          (blob) =>
            blob
              ? resolve(URL.createObjectURL(blob))
              : reject(new Error("toBlob")),
          "image/jpeg",
          0.88
        );
      };
      img.onerror = () => reject(new Error("swatch " + url));
      img.src = url;
    });
    return seamlessCache[url];
  }

  function loadModelViewer() {
    if (window.customElements && customElements.get("model-viewer"))
      return Promise.resolve();
    if (!loadModelViewer.p) {
      loadModelViewer.p = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.type = "module";
        s.src = MV_SRC;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }).then(() => customElements.whenDefined("model-viewer"));
    }
    return loadModelViewer.p;
  }

  function initConfigurator() {
    const sec = $("[data-shop-cfg]", productRoot);
    if (!sec) return;
    const groups = sec._cfgGroups;
    const viewer = $("[data-cfg-viewer]", sec);
    const stage = $("[data-cfg-stage]", sec);
    const state = {};
    let ready = false;
    groups.forEach((g) => (state[g.part.key] = 0));

    function updateLabels() {
      const names = groups.map((g) => {
        const item = g.items[state[g.part.key]];
        $(`[data-cfg-picked="${g.part.key}"]`, sec).textContent =
          item.name + (item.own ? " (as shown)" : "");
        $$(`[data-cfg-part="${g.part.key}"]`, sec).forEach((b) => {
          const on = Number(b.dataset.cfgIndex) === state[g.part.key];
          b.setAttribute("aria-checked", String(on));
          // "Selected" tag follows the chosen swatch
          const tag = $(".shop-cfg__tag", b);
          if (on && !tag)
            b.insertAdjacentHTML(
              "beforeend",
              '<span class="shop-cfg__tag" aria-hidden="true">Selected</span>'
            );
          if (!on && tag) tag.remove();
        });
        return item.name;
      });
      $("[data-cfg-summary]", sec).textContent = names.join(" · ");
    }

    function apply(g) {
      if (!ready) return Promise.resolve();
      const item = g.items[state[g.part.key]];
      const mat = viewer.model.materials.find((m) => g.part.match.test(m.name));
      if (!mat) return Promise.resolve();
      const btn = $(
        `[data-cfg-part="${g.part.key}"][data-cfg-index="${
          state[g.part.key]
        }"]`,
        sec
      );
      if (btn) btn.classList.add("is-loading");
      return seamless(item.url)
        .then((u) => viewer.createTexture(u))
        .then((tex) => {
          if (g.items[state[g.part.key]] !== item) return; // a newer pick won
          const pbr = mat.pbrMetallicRoughness;
          pbr.setBaseColorFactor([1, 1, 1, 1]);
          pbr.baseColorTexture.setTexture(tex);
          const s =
            pbr.baseColorTexture.texture &&
            pbr.baseColorTexture.texture.sampler;
          if (s) {
            if (s.setWrapS) s.setWrapS(10497); // REPEAT
            if (s.setWrapT) s.setWrapT(10497);
          }
        })
        .catch((e) => console.warn("[shop] configurator texture", e))
        .then(() => btn && btn.classList.remove("is-loading"));
    }

    sec.addEventListener("click", (e) => {
      const sw = e.target.closest("[data-cfg-part]");
      if (sw) {
        const g = groups.find((x) => x.part.key === sw.dataset.cfgPart);
        state[g.part.key] = Number(sw.dataset.cfgIndex);
        updateLabels();
        apply(g);
        return;
      }
      const view = e.target.closest("[data-cfg-view]");
      if (view) {
        viewer.autoRotate = false;
        $("[data-cfg-rotate]", sec).setAttribute("aria-pressed", "false");
        viewer.cameraOrbit = view.dataset.cfgView;
        viewer.cameraTarget = "auto auto auto";
        viewer.fieldOfView = "auto";
        $$("[data-cfg-view]", sec).forEach((b) =>
          b.setAttribute("aria-pressed", String(b === view))
        );
        return;
      }
      const zoom = e.target.closest("[data-cfg-zoom]");
      if (zoom && ready) {
        const o = viewer.getCameraOrbit();
        const r = Math.max(
          0.6,
          Math.min(
            4,
            o.radius * (Number(zoom.dataset.cfgZoom) > 0 ? 0.8 : 1.25)
          )
        );
        viewer.cameraOrbit = `${o.theta}rad ${o.phi}rad ${r}m`;
        return;
      }
      if (e.target.closest("[data-cfg-rotate]")) {
        viewer.autoRotate = !viewer.autoRotate;
        $("[data-cfg-rotate]", sec).setAttribute(
          "aria-pressed",
          String(viewer.autoRotate)
        );
        return;
      }
      if (e.target.closest("[data-cfg-full]")) {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (stage.requestFullscreen) stage.requestFullscreen();
        return;
      }
      if (e.target.closest("[data-cfg-add]") && enquiry) {
        const btn = $("[data-cfg-add]", sec);
        const firstImg = $("[data-shop-gallery] img", productRoot);
        enquiry.add({
          handle: productRoot.dataset.handle || location.pathname,
          title:
            ($(".shop-product__name", productRoot) || {}).textContent ||
            document.title,
          sku: productRoot.dataset.sku || "",
          image: firstImg ? firstImg.currentSrc || firstImg.src : "",
          url: location.pathname + location.search,
          options: groups.map((g) => ({
            name: g.part.option,
            value: g.items[state[g.part.key]].name,
          })),
          qty: 1,
        });
        btn.classList.add("is-done");
        setBtnText(btn, "Added to enquiry list");
        setTimeout(() => {
          btn.classList.remove("is-done");
          setBtnText(btn, "Add to enquiry list");
        }, 1800);
        enquiry.open();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      stage.classList.toggle("is-full", document.fullscreenElement === stage);
    });
    viewer.addEventListener("camera-change", (e) => {
      if (e.detail.source === "user-interaction")
        $$("[data-cfg-view]", sec).forEach((b) =>
          b.setAttribute("aria-pressed", "false")
        );
    });
    viewer.addEventListener("progress", (e) => {
      const bar = $("[data-cfg-progress]", sec);
      bar.firstElementChild.style.width =
        Math.round(e.detail.totalProgress * 100) + "%";
      bar.classList.toggle("is-done", e.detail.totalProgress >= 1);
    });
    viewer.addEventListener("load", () => {
      ready = true;
      Promise.all(groups.map(apply)).then(() => {
        viewer.dismissPoster();
        sec.classList.add("is-ready");
        // warm the cache in the background so later picks feel instant
        setTimeout(
          () =>
            groups.forEach((g) =>
              g.items.forEach((it) => seamless(it.url).catch(() => {}))
            ),
          1500
        );
      });
    });
    viewer.addEventListener("error", () => {
      $("[data-cfg-loading]", sec).textContent =
        "The 3D model could not be loaded.";
    });

    initCfgDownloads(sec, () => {
      const o = {};
      groups.forEach(
        (g) =>
          (o[g.part.option.toLowerCase()] = g.items[state[g.part.key]].name)
      );
      return o;
    });

    updateLabels();
    // Load the viewer (≈1 MB) + model only when the section is close
    const start = () =>
      loadModelViewer().then(
        () => (viewer.src = productRoot.dataset.shopModel.trim())
      );
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            io.disconnect();
            start().catch((err) => console.warn("[shop] model-viewer", err));
          }
        },
        { rootMargin: "800px 0px" }
      );
      io.observe(sec);
    } else {
      start();
    }

    // "Configure in 3D" in the buy column: smooth scroll (Lenis when present)
    const jump = $("[data-cfg-jump]", productRoot);
    if (jump)
      jump.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (productRoot._showTab) productRoot._showTab("configurate");
        const target = $("[data-shop-tabs]", productRoot) || sec;
        if (window.lenis) window.lenis.scrollTo(target, { offset: -80 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
  }

  // ===========================================================================
  // S14. Line-reveal guard. script.js splits h1–h6 / p into lines once (on
  //      document.fonts.ready, autoSplit off). If the box later gets narrower
  //      or a font swaps in after the split, a "line" wraps onto two rows and a
  //      sentence breaks mid-way (e.g. the tagline "…opening, carried | down…").
  //      When that happens here, put the plain text back.
  // ===========================================================================
  const splitTexts = new Map();
  $$(".shop-main h1, .shop-main h2, .shop-main h3, .shop-main p").forEach(
    (el) => {
      if (!el.children.length) splitTexts.set(el, el.textContent);
    }
  );
  function fixSplitWraps() {
    splitTexts.forEach((text, el) => {
      if (el.dataset.linesSplit !== "true" || !el.isConnected) return;
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
      const broken = Array.from(el.querySelectorAll("*")).some(
        (n) =>
          !n.children.length &&
          n.textContent.trim() &&
          n.getBoundingClientRect().height > lh * 1.6
      );
      if (broken) el.textContent = text;
    });
  }
  window.addEventListener("load", () => setTimeout(fixSplitWraps, 300));
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => setTimeout(fixSplitWraps, 600));
  let fixTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(fixTimer);
    fixTimer = setTimeout(fixSplitWraps, 250);
  });

  // ===========================================================================
  // S15. Technical Sheet + downloads
  //      - "Download Technical Sheet" under the enquiry button opens a panel
  //        from the left (Willett-style) with the sheet preview + PDF link.
  //        The sheet itself is made offline (techsheet/build.js, same layout
  //        as the printed catalogue) and stored in the CMS "Technical Sheet"
  //        (File) + "Technical Sheet Preview" (Image) fields.
  //      - Technical Specifications → "Downloads" row: Technical sheet /
  //        Image / 3D model (or "coming soon").
  //      - 3D view → pdf / 3D / img: pdf = the same sheet layout, made in the
  //        browser (jsPDF) with the chosen upholstery / finish and 3 renders.
  //      - ±1 cm note under the drawings.
  // ===========================================================================
  const JSPDF_SRC =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  const LOGO_SRC =
    "https://cdn.prod.website-files.com/689c46a99322e838240737a2/6ac62a697f50a44b9aa96cc2_luve-logo-brown-900.png";
  const DIM_NOTE =
    "All dimensions are approximate (±1 cm), as each piece is made by hand.";
  const ICON_DOWN =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M4 7.5l4 4 4-4M3 14h10" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';

  const slug = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Technical Sheet file + preview (hidden CMS-bound link / image in the product root)
  function sheetInfo() {
    const a = productRoot && $("[data-shop-sheet-pdf]", productRoot);
    const im = productRoot && $("[data-shop-sheet-img]", productRoot);
    const pdf =
      a && /\.pdf(\?|$)/i.test(a.getAttribute("href") || "") ? a.href : "";
    const src =
      im && !im.classList.contains("w-dyn-bind-empty")
        ? im.getAttribute("src") || ""
        : "";
    return { pdf, preview: /^https?:|^\.|^\//.test(src) ? src : "" };
  }

  function pieceInfo() {
    const text = (sel) =>
      (($(sel, productRoot) || {}).textContent || "").trim();
    const spec = {};
    $$(".shop-product__buy .shop-spec__row", productRoot).forEach((row) => {
      const dt = ($("dt", row) || {}).textContent;
      if (!dt) return;
      const dd = $("dd", row);
      const first = dd && $(".shop-opts__list .shop-opt__label", dd);
      spec[dt.trim()] = ((first || dd || {}).textContent || "").trim();
    });
    const dims = {};
    $$(".shop-tech__dims .shop-spec__row", productRoot).forEach((row) => {
      const v = (($("dd", row) || {}).textContent || "")
        .replace(/\s*cm$/, "")
        .trim();
      if (/\d/.test(v))
        dims[(($("dt", row) || {}).textContent || "").trim()] = v;
    });
    const photo = $("[data-shop-gallery] img", productRoot);
    const drawings = {};
    $$(".shop-tech__fig img", productRoot).forEach((img) => {
      const which = (
        img.alt ||
        ($("figcaption", img.closest("figure")) || {}).textContent ||
        ""
      ).toLowerCase();
      if (/front/.test(which)) drawings.front = img.currentSrc || img.src;
      if (/side/.test(which)) drawings.side = img.currentSrc || img.src;
    });
    return {
      name: text(".shop-product__name"),
      sku: productRoot.dataset.sku || "",
      price: text("[data-shop-price]"),
      type: spec.Type || "",
      upholstery: spec.Upholstery || "",
      finish: spec.Finish || "",
      dims,
      photo: photo ? photo.currentSrc || photo.src : "",
      drawings,
      download: (productRoot.dataset.shopDownload || "").trim(),
    };
  }

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.className = "no-transition";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function fetchBlob(url) {
    return fetch(url, { mode: "cors" }).then((r) => {
      if (!r.ok) throw new Error(r.status + " " + url);
      return r.blob();
    });
  }
  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image " + src));
      img.src = src;
    });
  }
  // Image → JPEG/PNG data URL (optionally cropped to cover a w:h box)
  function imageData(src, opts = {}) {
    return loadImg(src).then((img) => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      let sx = 0,
        sy = 0,
        sw = nw,
        sh = nh;
      if (opts.cover) {
        const ar = opts.cover;
        if (nw / nh > ar) {
          sw = nh * ar;
          sx = (nw - sw) / 2;
        } else {
          sh = nw / ar;
          sy = (nh - sh) / 2;
        }
      }
      const k = Math.min(1, (opts.max || 1800) / Math.max(sw, sh));
      const c = document.createElement("canvas");
      c.width = Math.round(sw * k);
      c.height = Math.round(sh * k);
      const g = c.getContext("2d");
      if (opts.bg) {
        g.fillStyle = opts.bg;
        g.fillRect(0, 0, c.width, c.height);
      }
      g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      const png = opts.png;
      return {
        data: c.toDataURL(png ? "image/png" : "image/jpeg", 0.9),
        w: c.width,
        h: c.height,
        type: png ? "PNG" : "JPEG",
      };
    });
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF)
      return Promise.resolve(window.jspdf.jsPDF);
    if (!loadJsPdf.p)
      loadJsPdf.p = loadScript(JSPDF_SRC).then(() => window.jspdf.jsPDF);
    return loadJsPdf.p;
  }

  // Render the 3D view at a camera orbit; returns a JPEG cropped to the piece
  function renderAt(viewer, orbit, bg = "#E4E0DA", size = 0) {
    const prev = viewer.getCameraOrbit().toString();
    const prevTarget = viewer.getCameraTarget().toString();
    const prevFov = viewer.getFieldOfView();
    const prevRotate = viewer.autoRotate;
    viewer.autoRotate = false;
    viewer.cameraTarget = "auto auto auto";
    viewer.fieldOfView = "auto";
    viewer.cameraOrbit = orbit;
    viewer.jumpCameraToGoal();
    // Render larger than the screen: a still of the current view covers the
    // stage while the viewer is briefly resized to size × size px.
    let cover = null;
    const prevStyle = viewer.getAttribute("style") || "";
    const grow = () => {
      if (!size) return;
      const stage = viewer.parentElement;
      cover = new Image();
      cover.src = viewer.toDataURL("image/png");
      cover.className = "shop-cfg__cover";
      stage.appendChild(cover);
      const k = size / Math.max(viewer.clientWidth, viewer.clientHeight);
      viewer.style.cssText =
        prevStyle +
        `;position:absolute;left:0;top:0;width:${Math.round(
          viewer.clientWidth * k
        )}px;height:${Math.round(viewer.clientHeight * k)}px;`;
    };
    const frame = () =>
      new Promise((r) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(r, 60))
        )
      );
    grow();
    return frame()
      .then(() => (size ? frame() : null))
      .then(() => loadImg(viewer.toDataURL("image/png")))
      .then((img) => {
        const w = img.naturalWidth,
          h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, w, h).data;
        let x0 = w,
          y0 = h,
          x1 = -1,
          y1 = -1;
        for (let y = 0; y < h; y += 2)
          for (let x = 0; x < w; x += 2)
            if (d[(y * w + x) * 4 + 3] > 24) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
        if (x1 < 0) {
          x0 = 0;
          y0 = 0;
          x1 = w - 1;
          y1 = h - 1;
        }
        const cw = x1 - x0 + 1,
          ch = y1 - y0 + 1;
        const k = Math.min(1, (size || 1400) / Math.max(cw, ch)); // keeps the PDF light
        const o = document.createElement("canvas");
        o.width = Math.round(cw * k);
        o.height = Math.round(ch * k);
        const og = o.getContext("2d");
        og.fillStyle = bg;
        og.fillRect(0, 0, o.width, o.height);
        og.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
        return {
          data: o.toDataURL("image/jpeg", 0.86),
          w: o.width,
          h: o.height,
          type: "JPEG",
        };
      })
      .finally(() => {
        if (size) {
          viewer.setAttribute("style", prevStyle);
          if (cover) setTimeout(() => cover.remove(), 120);
        }
        viewer.cameraOrbit = prev;
        viewer.cameraTarget = prevTarget;
        viewer.fieldOfView = prevFov + "deg";
        viewer.jumpCameraToGoal();
        viewer.autoRotate = prevRotate;
      });
  }

  // "Your selection" sheet — same grid as techsheet/sheet.html (A4, mm)
  function makeSelectionSheet(info, sel, renders) {
    const swatchFor = (name) => {
      const b = $$(".shop-cfg__swatch", productRoot).find(
        (x) => x.getAttribute("aria-label") === name
      );
      const m = b && /url\(['"]?([^'")]+)/.exec(b.style.backgroundImage || "");
      return m ? m[1] : "";
    };
    const drawingJob = (src) =>
      src
        ? Promise.all([
            imageData(src, { bg: "#F0E8DD", max: 900 }),
            inkBox(src).catch(() => ({ x0: 0, y0: 0, x1: 1, y1: 1 })),
          ])
        : null;
    return Promise.all([
      loadJsPdf(),
      imageData(LOGO_SRC, { bg: "#F0E8DD", max: 600 }).catch(() => null),
      Promise.all(
        ["upholstery", "finish"].map((k) =>
          swatchFor(sel[k])
            ? imageData(swatchFor(sel[k]), { cover: 1, max: 400 }).catch(
                () => null
              )
            : null
        )
      ),
      drawingJob(info.drawings.front),
      drawingJob(info.drawings.side),
    ]).then(([JsPDF, logo, sw, front, side]) => {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      const BROWN = [121, 94, 73];
      const INK = [121, 94, 73];
      const STUDIO = [228, 224, 218];
      const PT = 0.3528; // mm per pt
      doc.setFillColor(240, 232, 221);
      doc.rect(0, 0, 210, 297, "F");
      const rule = (y, x0 = 10, x1 = 200) => {
        doc.setDrawColor(...BROWN);
        doc.setLineWidth(0.6 * PT);
        doc.line(x0, y, x1, y);
      };
      const text = (str, x, y, size, opts = {}) => {
        doc.setFont(opts.font || "helvetica", opts.style || "normal");
        doc.setFontSize(size);
        doc.setTextColor(...(opts.color || INK));
        doc.text(str, x, y, {
          baseline: "middle",
          align: opts.align || "left",
          maxWidth: opts.maxWidth,
        });
      };
      const fit = (im, x, y, w, h, pad = 0) => {
        doc.setFillColor(...STUDIO);
        doc.rect(x, y, w, h, "F");
        if (!im) return;
        const k = Math.min((w - pad * 2) / im.w, (h - pad * 2) / im.h);
        doc.addImage(
          im.data,
          im.type,
          x + (w - im.w * k) / 2,
          y + (h - im.h * k) / 2,
          im.w * k,
          im.h * k
        );
      };

      // header
      if (logo)
        doc.addImage(logo.data, "JPEG", 10, 8.5, 4.6 * (logo.w / logo.h), 4.6);
      text(`${info.name} ${info.type}`.toUpperCase(), 105, 11, 9, {
        style: "bold",
        align: "center",
      });
      text(info.sku, 200, 11, 7.6, { style: "bold", align: "right" });
      rule(15.5);
      // images: hero = 3/4 view, side = front + side views
      fit(renders[0], 10, 20, 127, 132, 10);
      fit(renders[1], 140, 20, 60, 65, 5);
      fit(renders[2], 140, 87, 60, 65, 5);
      rule(160);

      // table
      const d = info.dims;
      let size = d.Width
        ? `W ${d.Width} × D ${d.Depth || "—"} × H ${d.Height || "—"} cm`
        : "—";
      if (d["Seat height"]) size += `     Seat height ${d["Seat height"]} cm`;
      const rows = [
        ["Size", size, true],
        ["Upholstery", sel.upholstery],
        ["Timber finish", sel.finish],
      ];
      let y = 160;
      rows.forEach(([k, v, mixed]) => {
        text(k, 10, y + 3.3, 6.4);
        text(mixed ? v : String(v).toUpperCase(), 41, y + 3.3, 7.8, {
          style: "bold",
        });
        if (k === "Size")
          text(info.price || "Price on request", 121, y + 3.3, 7.8, {
            style: "bold",
            align: "right",
          });
        y += 6.6;
        rule(y, 10, 121);
      });

      // notes
      y += 8;
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      text(
        "YOUR SELECTION · CONFIGURED ONLINE " + today.toUpperCase(),
        10,
        y,
        7.4,
        { style: "bold" }
      );
      text("MADE TO ORDER · LEAD TIME ON REQUEST", 10, y + 5.6, 7.4, {
        style: "bold",
      });
      text(DIM_NOTE, 10, y + 11.2, 6.4, { color: BROWN });

      // swatches
      let my = y + 20;
      [
        ["Upholstery", sel.upholstery, sw[0]],
        ["Timber finish", sel.finish, sw[1]],
      ].forEach(([label, name, im]) => {
        text(label, 10, my + 1.5, 6.4);
        fit(im, 41, my, 17, 17);
        text(String(name).toUpperCase(), 41, my + 20, 5.8, {
          style: "bold",
          maxWidth: 30,
        });
        my += 27;
      });

      // drawings with dimension lines (ink fitted into 48 x 44 mm boxes)
      const drawing = (job, top, marks) => {
        if (!job) return;
        const [im, box] = job;
        const ar = im.w / im.h;
        const inkW = (box.x1 - box.x0) * ar;
        const inkH = box.y1 - box.y0;
        const hh = Math.min(44 / inkH, 46 / inkW);
        const w = hh * ar;
        const L = 140 + 12 + (48 - inkW * hh) / 2 - box.x0 * w;
        const T = top - box.y0 * hh;
        doc.addImage(im.data, "JPEG", L, T, w, hh);
        const iL = L + box.x0 * w,
          iR = L + box.x1 * w,
          iT = T + box.y0 * hh,
          iB = T + box.y1 * hh;
        doc.setDrawColor(...BROWN);
        doc.setLineWidth(0.5 * PT);
        const label = (str, x, yy) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6);
          const tw = doc.getTextWidth(str) + 2;
          doc.setFillColor(240, 232, 221);
          doc.rect(x - tw / 2, yy - 1.4, tw, 2.8, "F");
          text(str, x, yy, 6, { style: "bold", color: BROWN, align: "center" });
        };
        if (marks.h) {
          const x = iL - 5;
          doc.line(x, iT, x, iB);
          doc.line(x - 1.1, iT, x + 1.1, iT);
          doc.line(x - 1.1, iB, x + 1.1, iB);
          label(marks.h + " cm", x, (iT + iB) / 2);
        }
        if (marks.w) {
          const yy = iB + 4;
          doc.line(iL, yy, iR, yy);
          doc.line(iL, yy - 1.1, iL, yy + 1.1);
          doc.line(iR, yy - 1.1, iR, yy + 1.1);
          label(marks.w + " cm", (iL + iR) / 2, yy);
        }
      };
      drawing(front, 168, { w: d.Width });
      drawing(side, 224, { h: d.Height, w: d.Depth });

      // footer
      rule(279);
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...BROWN);
      doc.text("For spirits who LUVÉ design", 10, 285, { baseline: "middle" });
      text("luveinterior.com", 144, 284.5, 7.4, { color: BROWN });
      text(`©${new Date().getFullYear()} LUVE Limited`, 144, 287.6, 7.4, {
        color: BROWN,
      });

      const parts = ["LUVE", info.name, sel.upholstery, sel.finish].map(slug);
      return { blob: doc.output("blob"), name: parts.join("_") + ".pdf" };
    });
  }

  function busy(btn, on) {
    btn.classList.toggle("is-busy", on);
    btn.setAttribute("aria-busy", String(on));
  }
  function run(btn, job) {
    if (btn.classList.contains("is-busy")) return;
    busy(btn, true);
    Promise.resolve()
      .then(job)
      .catch((e) => {
        console.warn("[shop] download", e);
        alert("Sorry, the download could not be prepared. Please try again.");
      })
      .then(() => busy(btn, false));
  }
  const download3d = (info) =>
    fetchBlob(info.download).then((b) =>
      saveBlob(b, `LUVE_${slug(info.name)}_3D.zip`)
    );
  const downloadSheet = (info, sheet) =>
    fetchBlob(sheet.pdf).then((b) =>
      saveBlob(b, `LUVE_${slug(info.name)}_Technical-Sheet.pdf`)
    );

  // Construction & Care — care notes by material family. The upholstery shown
  // follows the current choice (3D configurator, else the options form);
  // other families are one click away, so the panel stays short.
  const CARE = {
    timber: {
      title: "Timber",
      tips: [
        "Dust with a soft, dry cloth and wipe spills straight away.",
        "Keep away from direct sunlight, heaters and air-conditioning vents.",
        "Use felt pads under the feet; avoid silicone sprays and harsh cleaners.",
      ],
    },
    woven: {
      title: "Woven fabrics",
      hint: "jacquard, tweed, quilted",
      tips: [
        "Vacuum gently with a soft brush attachment every week or two.",
        "Blot spills at once with a clean, dry cloth — do not rub.",
        "For stains, use a professional upholstery cleaner.",
      ],
    },
    pile: {
      title: "Chenille & velvet",
      tips: [
        "Brush lightly in the direction of the pile.",
        "Blot spills; never rub or soak the fabric.",
        "Pressure marks are natural and ease with gentle brushing.",
      ],
    },
    boucle: {
      title: "Bouclé",
      tips: [
        "Vacuum with a soft brush; never pull a loose loop — trim it with small scissors.",
        "Blot spills at once with a clean, dry cloth.",
        "Professional cleaning only.",
      ],
    },
    cord: {
      title: "Woven paper cord",
      tips: [
        "Dust with a soft brush or dry cloth.",
        "Keep dry: wipe spills immediately with a barely damp cloth, then dry.",
        "Keep sharp objects and heavy point loads off the weave.",
      ],
    },
    hide: {
      title: "Sheepskin & hide",
      tips: [
        "Shake out and brush gently with a wide-tooth comb.",
        "Keep dry and away from heat sources.",
        "Specialist sheepskin / leather cleaning only.",
      ],
    },
  };
  const careFamilies = (name) => {
    const n = String(name || "").toLowerCase();
    const out = [];
    if (/paper cord/.test(n)) out.push("cord");
    if (/lamb|sheepskin|hide/.test(n)) out.push("hide");
    if (/boucl/.test(n)) out.push("boucle");
    if (/chenille|velvet/.test(n)) out.push("pile");
    if (!out.length) out.push("woven");
    return out;
  };
  // The upholstery the visitor is looking at right now
  function currentUpholstery() {
    const sel =
      productRoot &&
      $('[data-cfg-part="fabric"][aria-checked="true"]', productRoot);
    if (sel) return sel.getAttribute("aria-label");
    const s =
      productRoot &&
      $$("[data-shop-option-fields] select", productRoot).find((x) =>
        /upholstery/i.test(x.name)
      );
    if (s && s.selectedIndex >= 0) return s.options[s.selectedIndex].text;
    const info = productRoot ? pieceInfo() : {};
    return info.upholstery || "";
  }
  function careHTML() {
    const info = pieceInfo();
    const uph = currentUpholstery();
    const custom = /custom/i.test(uph);
    const fams = custom ? ["woven"] : careFamilies(uph);
    const esc = (s) =>
      String(s == null ? "" : s).replace(
        /[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
      );
    const list = (k) =>
      `<ul class="shop-care__tips">${CARE[k].tips
        .map((t) => `<li>${esc(t)}</li>`)
        .join("")}</ul>`;
    const rows = [
      ["Frame", info.finish ? "Timber — " + info.finish : "Timber"],
      ["Seat", uph && !/^none/i.test(uph) ? "Upholstered — " + uph : ""],
      ["Made", "To order, by hand"],
    ].filter((r) => r[1]);
    const others = Object.keys(CARE).filter(
      (k) => k !== "timber" && fams.indexOf(k) < 0
    );
    return `
      <section class="shop-care__block">
        <h3 class="shop-care__h">Construction</h3>
        <dl class="shop-spec shop-care__spec">${rows
          .map(
            (r) =>
              `<div class="shop-spec__row"><dt>${r[0]}</dt><dd>${esc(
                r[1]
              )}</dd></div>`
          )
          .join("")}</dl>
      </section>
      <section class="shop-care__block">
        <h3 class="shop-care__h">Care</h3>
        <div class="shop-care__fam"><h4>${CARE.timber.title}</h4>${list(
      "timber"
    )}</div>
        <div class="shop-care__fam" data-care-current>
          <h4>${custom ? "Upholstery" : esc(uph)} <span>${fams
      .map((k) => CARE[k].title)
      .join(" · ")}</span></h4>
          ${fams.map(list).join("")}
        </div>
        <div class="shop-care__more">
          <span>Other upholstery</span>
          <div class="shop-care__chips">${others
            .map(
              (k) =>
                `<button type="button" data-care="${k}">${CARE[k].title}</button>`
            )
            .join("")}</div>
          <div class="shop-care__other" data-care-other hidden></div>
        </div>
        <p class="shop-care__note">Any questions? Email us at <a href="mailto:hello@luveinterior.com">hello@luveinterior.com</a>.</p>
      </section>`;
  }

  // Left panel: Construction & Care / Technical Sheet (Willett)
  function buildSheetPanel(sheet) {
    if ($("[data-shop-sheet-panel]")) return $("[data-shop-sheet-panel]");
    const panel = document.createElement("div");
    panel.className = "shop-sheet";
    panel.setAttribute("data-shop-sheet-panel", "");
    panel.setAttribute("data-lenis-prevent", "");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="shop-sheet__backdrop" data-sheet-close></div>
      <aside class="shop-sheet__panel" role="dialog" aria-modal="true" aria-label="Technical Sheet">
        <div class="shop-sheet__head">
          <div class="shop-sheet__tabs" role="tablist">
            <button type="button" role="tab" data-sheet-tab="care" aria-selected="false">Construction &amp; Care</button>
            ${
              sheet.pdf
                ? '<button type="button" role="tab" data-sheet-tab="sheet" aria-selected="true">Technical Sheet</button>'
                : ""
            }
          </div>
          <button type="button" class="shop-sheet__close" data-sheet-close aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </div>
        <div class="shop-sheet__body shop-care" data-sheet-pane="care" hidden></div>
        <div class="shop-sheet__body" data-sheet-pane="sheet"${
          sheet.pdf ? "" : " hidden"
        }>
          <a class="shop-sheet__preview no-transition" href="${
            sheet.pdf
          }" target="_blank" rel="noopener" aria-label="Open the Technical Sheet (PDF)">
            <img src="${sheet.preview}" alt="Technical Sheet preview">
          </a>
          <button type="button" class="shop-sheet__dl" data-sheet-download>${ICON_DOWN}<span>Download Spec Sheet</span></button>
        </div>
      </aside>`;
    document.body.appendChild(panel);
    let lastFocus = null;
    let paneTimer = null;
    const showPane = (id, animate) => {
      if (id === "sheet" && !sheet.pdf) id = "care";
      const panes = $$("[data-sheet-pane]", panel);
      const current = panes.find((p) => !p.hidden);
      $$("[data-sheet-tab]", panel).forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.sheetTab === id))
      );
      const swap = () => {
        if (id === "care")
          $("[data-sheet-pane=care]", panel).innerHTML = careHTML();
        panes.forEach((p) => {
          p.hidden = p.dataset.sheetPane !== id;
          p.classList.remove("is-out");
          p.classList.toggle("is-in", !!animate && !p.hidden);
        });
        $(".shop-sheet__panel", panel).scrollTop = 0;
      };
      clearTimeout(paneTimer);
      if (animate && current && current.dataset.sheetPane !== id) {
        current.classList.add("is-out");
        paneTimer = setTimeout(swap, 220);
      } else if (!current || current.dataset.sheetPane !== id || !animate)
        swap();
    };
    panel._show = showPane;
    const open = (id) => {
      showPane(id || "sheet");
      lastFocus = document.activeElement;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("shop-sheet-lock");
      if (window.lenis) window.lenis.stop();
      setTimeout(() => $(".shop-sheet__close", panel).focus(), 50);
    };
    const close = () => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("shop-sheet-lock");
      if (window.lenis) window.lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    panel.addEventListener("click", (e) => {
      if (e.target.closest("[data-sheet-close]")) close();
      const tab = e.target.closest("[data-sheet-tab]");
      if (tab) showPane(tab.dataset.sheetTab, true);
      const chip = e.target.closest("[data-care]");
      if (chip) {
        const box = $("[data-care-other]", panel);
        const k = chip.dataset.care;
        const on = chip.getAttribute("aria-pressed") === "true";
        $$("[data-care]", panel).forEach((b) =>
          b.setAttribute("aria-pressed", "false")
        );
        box.hidden = on;
        if (!on) {
          chip.setAttribute("aria-pressed", "true");
          box.innerHTML =
            '<ul class="shop-care__tips">' +
            CARE[k].tips.map((t) => "<li>" + t + "</li>").join("") +
            "</ul>";
        }
      }
      const dl = e.target.closest("[data-sheet-download]");
      if (dl) run(dl, () => downloadSheet(pieceInfo(), sheet));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });
    panel._open = (id) => open(id);
    return panel;
  }

  // All product photos at their original upload size, zipped in the browser
  const JSZIP_SRC =
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
  function downloadPhotos(info) {
    const urls = Array.from(
      new Set(
        $$("[data-shop-gallery] img", productRoot)
          .map((im) => im.getAttribute("src"))
          .filter(Boolean)
      )
    );
    if (!urls.length) return Promise.reject(new Error("no photos"));
    const zipLib = window.JSZip ? Promise.resolve() : loadScript(JSZIP_SRC);
    return zipLib
      .then(() => Promise.all(urls.map((u) => fetchBlob(u).catch(() => null))))
      .then((blobs) => {
        const zip = new window.JSZip();
        blobs.forEach((b, i) => {
          if (!b) return;
          const ext = /png/.test(b.type) ? "png" : "jpg";
          zip.file(
            `LUVE_${slug(info.name)}_${String(i + 1).padStart(2, "0")}.${ext}`,
            b
          );
        });
        return zip.generateAsync({ type: "blob" });
      })
      .then((z) => saveBlob(z, `LUVE_${slug(info.name)}_Photos.zip`));
  }

  function buildDownloads() {
    if (!productRoot) return;
    const sheet = sheetInfo();
    const tech = $(".shop-tech", productRoot);

    // ±1 cm note under the drawings
    const grid = tech && $(".shop-tech__grid", tech);
    if (grid && !$(".shop-tech__note", tech)) {
      const note = document.createElement("p");
      note.className = "shop-tech__note";
      note.textContent = DIM_NOTE;
      grid.parentNode.insertBefore(note, grid.nextSibling);
    }

    // buy column: Download Technical Sheet (only when the piece has one)
    const buy = $(".shop-product__buy", productRoot);
    if (buy && !$("[data-sheet-open]", buy)) {
      const links = document.createElement("div");
      links.className = "shop-sheet-links";
      links.innerHTML =
        (sheet.pdf
          ? `<button type="button" data-sheet-open="sheet">Download Technical Sheet</button>`
          : "") +
        `<button type="button" data-sheet-open="care">View Construction &amp; Care</button>`;
      buy.appendChild(links);
      const panel = buildSheetPanel(sheet);
      links.addEventListener("click", (e) => {
        const b = e.target.closest("[data-sheet-open]");
        if (!b) return;
        if (b.dataset.sheetOpen === "sheet" && !sheet.preview)
          run(b, () => downloadSheet(pieceInfo(), sheet));
        else panel._open(b.dataset.sheetOpen);
      });
    }

    // Technical Specifications → Downloads row
    const dl = tech && $(".shop-tech__dims", tech);
    if (!dl || $("[data-shop-downloads]", dl)) return;
    const has3d = /^https?:\/\//.test(
      (productRoot.dataset.shopDownload || "").trim()
    );
    const row = document.createElement("div");
    row.className = "shop-spec__row shop-tech__dl";
    row.setAttribute("data-shop-downloads", "");
    const item = (k, label) =>
      `<button type="button" class="shop-tech__dl-btn" data-dl="${k}">${ICON_DOWN}<span>${label}</span></button>`;
    const off = (label) =>
      `<span class="shop-tech__dl-btn is-off">${label}</span>`;
    row.innerHTML = `<dt>Downloads</dt><dd>
      ${
        sheet.pdf
          ? item("sheet", "Technical sheet (PDF)")
          : off("Technical sheet — coming soon")
      }
      ${item("img", "Product photos (ZIP)")}
      ${
        has3d
          ? item("3d", "3D model (SketchUp / glTF)")
          : off("3D model — coming soon")
      }
    </dd>`;
    dl.appendChild(row);
    productRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dl]");
      if (!btn) return;
      const info = pieceInfo();
      const kind = btn.dataset.dl;
      if (kind === "sheet") run(btn, () => downloadSheet(info, sheet));
      if (kind === "img") run(btn, () => downloadPhotos(info));
      if (kind === "3d") run(btn, () => download3d(info));
    });
  }

  // pdf / 3D / img on the 3D view: uses the current view + selection
  function initCfgDownloads(sec, getSelection) {
    const stage = $("[data-cfg-stage]", sec);
    const viewer = $("[data-cfg-viewer]", sec);
    if (!stage || $("[data-cfg-downloads]", stage)) return;
    const has3d = /^https?:\/\//.test(
      (productRoot.dataset.shopDownload || "").trim()
    );
    const bar = document.createElement("div");
    bar.className = "shop-cfg__downloads";
    bar.setAttribute("data-cfg-downloads", "");
    bar.innerHTML = [
      ["pdf", "pdf", "Download your selection (PDF)"],
      ["3d", "3D", has3d ? "Download 3D model" : "3D model coming soon"],
      ["img", "img", "Download image of this view"],
    ]
      .map(
        ([k, label, title]) =>
          `<button type="button" class="shop-cfg__dl" data-cfg-dl="${k}" title="${title}" aria-label="${title}"${
            k === "3d" && !has3d ? " disabled" : ""
          }>${ICON_DOWN}<span>${label}</span></button>`
      )
      .join("");
    stage.appendChild(bar);

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cfg-dl]");
      if (!btn || btn.disabled) return;
      const info = pieceInfo();
      const sel = getSelection();
      const kind = btn.dataset.cfgDl;
      if (kind === "img")
        run(btn, () =>
          renderAt(
            viewer,
            viewer.getCameraOrbit().toString(),
            "#EBE6DF",
            3600
          ).then((r) =>
            fetch(r.data)
              .then((res) => res.blob())
              .then((b) =>
                saveBlob(
                  b,
                  ["LUVE", info.name, sel.upholstery, sel.finish]
                    .map(slug)
                    .join("_") + ".jpg"
                )
              )
          )
        );
      if (kind === "pdf")
        run(btn, () =>
          renderAt(viewer, "-35deg 75deg auto")
            .then((a) =>
              renderAt(viewer, "0deg 82deg auto").then((b) => [a, b])
            )
            .then((ab) =>
              renderAt(viewer, "-90deg 82deg auto").then((c) => ab.concat([c]))
            )
            .then((renders) => makeSelectionSheet(info, sel, renders))
            .then((f) => saveBlob(f.blob, f.name))
        );
      if (kind === "3d") run(btn, () => download3d(info));
    });
  }
  // ===========================================================================
  // S16. Product tabs (Poliform-style): CONFIGURATE · DESCRIPTION ·
  //      DIMENSIONS · FINISHES · DOWNLOADS. Built from the sections already on
  //      the page (Configure in 3D, Technical Specifications, Downloads row)
  //      plus Description / Finishes made from the product data.
  //      Default tab: Configurate when the piece has a 3D model, else Description.
  // ===========================================================================
  // Tabs: dark fill wipes in from the side the pointer entered, out the side it left
  function initTabWipe(sec) {
    if (!canHover || !window.gsap) return;
    $$("[data-tab]", sec).forEach((b) => {
      const fill = $(".shop-tabs__fill", b);
      if (!fill) return;
      // GSAP owns the transform (the CSS translateX is only the no-JS start state)
      gsap.set(fill, { x: 0, xPercent: -101 });
      const fromLeft = (e) => {
        const r = b.getBoundingClientRect();
        return e.clientX < r.left + r.width / 2;
      };
      b.addEventListener("mouseenter", (e) => {
        b.classList.add("is-hover");
        gsap.fromTo(
          fill,
          { x: 0, xPercent: fromLeft(e) ? -101 : 101 },
          {
            x: 0,
            xPercent: 0,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          }
        );
      });
      b.addEventListener("mouseleave", (e) => {
        b.classList.remove("is-hover");
        gsap.to(fill, {
          xPercent: fromLeft(e) ? -101 : 101,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
      });
    });
  }

  // Description pictures: crossfade every 5 s while the tab is on screen
  function initDescSlides(fig, sec) {
    if (!fig) return;
    const imgs = $$("img", fig);
    const dots = $$(".shop-desc__dots button", fig);
    if (imgs.length < 2) return;
    let i = 0,
      timer = null,
      inView = false;
    const go = (n) => {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
      dots.forEach((d, k) => {
        d.classList.toggle("is-on", k === i);
        d.setAttribute("aria-current", String(k === i));
      });
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
      fig.classList.remove("is-playing");
    };
    const play = () => {
      stop();
      const panel = fig.closest("[data-panel]");
      if (!inView || document.hidden || (panel && panel.hidden)) return;
      // restart the progress bar of the current dot
      fig.classList.remove("is-playing");
      void fig.offsetWidth;
      fig.classList.add("is-playing");
      timer = setInterval(() => {
        go(i + 1);
        fig.classList.remove("is-playing");
        void fig.offsetWidth;
        fig.classList.add("is-playing");
      }, 5000);
    };
    dots.forEach((d, k) =>
      d.addEventListener("click", () => {
        go(k);
        play();
      })
    );
    go(0);
    // load the rest once the first is in
    imgs.slice(1).forEach((im) => (im.loading = "eager"));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (es) => {
          inView = es[0].isIntersecting;
          play();
        },
        { threshold: 0.25 }
      ).observe(fig);
    } else {
      inView = true;
      play();
    }
    document.addEventListener("visibilitychange", play);
    sec.addEventListener("click", (e) => {
      if (e.target.closest("[data-tab]")) setTimeout(play, 0);
    });
  }

  function buildTabs() {
    if (!productRoot || $("[data-shop-tabs]", productRoot)) return;
    const tech = $(".shop-tech", productRoot);
    if (!tech) return;
    const cfg = $("[data-shop-cfg]", productRoot);
    const esc = (s) =>
      String(s == null ? "" : s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      );
    const text = (el) => ((el && el.textContent) || "").trim();

    // spec rows of the buy column
    const spec = {};
    const options = {};
    $$(".shop-product__buy .shop-spec__row", productRoot).forEach((row) => {
      const k = text($("dt", row));
      if (!k) return;
      const dd = $("dd", row);
      const lines = $$(".shop-opts__list .shop-opt", dd);
      if (lines.length) {
        options[k] = lines.map((l) => {
          const im = $(".shop-swatch img", l);
          return {
            name: text($(".shop-opt__label", l)),
            src:
              im && !im.classList.contains("w-dyn-bind-empty")
                ? im.getAttribute("src")
                : "",
          };
        });
        spec[k] = options[k].map((o) => o.name).join(" / ");
      } else {
        spec[k] = text(dd);
      }
    });

    // ---- Description
    const name = text($(".shop-product__name", productRoot));
    const story = text($(".shop-product__story", productRoot));
    const tagline = text($(".shop-product__tagline", productRoot));
    const rows = [
      ["Type", spec.Type],
      ["Product no.", productRoot.dataset.sku || ""],
      ["Upholstery", spec.Upholstery],
      ["Finish", spec.Finish],
      ["Made", "To order, by hand"],
    ].filter((r) => r[1] && r[1] !== "—");
    // Design Story (CMS) is the longer text; falls back to the short description
    const designStory = (productRoot.dataset.shopStory || "").trim();
    const paras = (designStory || story || tagline)
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const year = (productRoot.dataset.shopYear || "").trim() || "2026";
    const gal = Array.from(
      new Set(
        $$("[data-shop-gallery] img", productRoot)
          .map((im) => im.getAttribute("src"))
          .filter(Boolean)
      )
    );
    const scene =
      gal.find((u) => /scene(?!detail)/i.test(u)) ||
      gal.find((u) => /scene/i.test(u)) ||
      gal[0] ||
      "";
    // Slides: the scene photo, then the CMS "Story Images" (sketches, workshop —
    // one URL per line), topped up from the gallery; 5 at most
    const storyImgs = (productRoot.dataset.shopStoryImages || "")
      .split(/\s+/)
      .filter((u) => /^https?:/.test(u));
    const slides = Array.from(
      new Set(
        [
          scene,
          ...storyImgs,
          ...gal.filter((u) => /scene/i.test(u)),
          ...gal,
        ].filter(Boolean)
      )
    ).slice(0, 5);
    const desc = `
      <div class="shop-desc">
        ${
          slides.length
            ? `<figure class="shop-desc__media" data-desc-slides>${slides
                .map(
                  (u, i) =>
                    `<img src="${esc(u)}" alt="${esc(name)}${
                      i ? " — " + (i + 1) : ""
                    }" loading="lazy" class="${i ? "" : "is-on"}">`
                )
                .join("")}${
                slides.length > 1
                  ? `<div class="shop-desc__dots">${slides
                      .map(
                        (u, i) =>
                          `<button type="button" aria-label="Picture ${
                            i + 1
                          }"><i></i></button>`
                      )
                      .join("")}</div>`
                  : ""
              }</figure>`
            : ""
        }
        <div class="shop-desc__text">
          <h3 class="shop-desc__name">${esc(name)}</h3>
          ${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
          <p class="shop-desc__by">Designed by LUVÉ, ${esc(year)}</p>
        </div>
      </div>`;

    // ---- Finishes: same options as the configurator, else the piece's own
    const groups =
      cfg && cfg._cfgGroups
        ? cfg._cfgGroups.map((g) => ({
            title: g.part.title,
            items: g.items.map((it) => ({
              name: it.name,
              src: it.url,
              own: it.own,
            })),
          }))
        : Object.keys(options).map((k) => ({
            title: k === "Finish" ? "Timber finish" : k,
            items: options[k].map((o) => Object.assign({ own: true }, o)),
          }));
    const finishes = groups.length
      ? `<div class="shop-fin">${groups
          .map(
            (g) => `
          <div class="shop-fin__group">
            <div class="shop-fin__head"><h3>${esc(g.title)}</h3><span>${
              g.items.length
            } option${g.items.length === 1 ? "" : "s"}</span></div>
            <ul class="shop-fin__grid">${g.items
              .map(
                (it) =>
                  `<li class="shop-fin__item"><div class="shop-fin__ph">${
                    it.src
                      ? `<img src="${esc(it.src)}" alt="" loading="lazy">`
                      : ""
                  }</div><span class="shop-fin__name">${esc(it.name)}</span>${
                    it.own ? '<span class="shop-fin__own">As shown</span>' : ""
                  }</li>`
              )
              .join("")}</ul>
          </div>`
          )
          .join("")}
          <p class="shop-fin__note">Further fabrics, leathers and timber finishes are available on request. <a href="#" data-fin-enquire class="no-transition">Enquire about bespoke finishes</a></p>
        </div>`
      : `<p class="shop-fin__note">Finishes on request.</p>`;

    // ---- Tabs
    const tabs = [];
    if (cfg) tabs.push(["configurate", "Configurate", cfg]);
    tabs.push(["description", "Description", desc]);
    tabs.push(["dimensions", "Dimensions", tech]);
    tabs.push(["finishes", "Finishes", finishes]);
    const dlRow = $("[data-shop-downloads]", tech);
    if (dlRow) {
      const list = document.createElement("div");
      list.className = "shop-dl";
      $$("dd > *", dlRow).forEach((el) => list.appendChild(el));
      dlRow.remove();
      tabs.push(["downloads", "Downloads", list]);
    }

    const sec = document.createElement("section");
    sec.className = "shop-tabs no-line-reveal";
    sec.setAttribute("data-shop-tabs", "");
    sec.innerHTML = `<div class="shop-tabs__bar" role="tablist" aria-label="Product information">${tabs
      .map(
        ([id, label]) =>
          `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="false" data-tab="${id}"><span class="shop-tabs__fill" aria-hidden="true"></span><span class="shop-tabs__label">${label}</span></button>`
      )
      .join("")}</div>`;
    (cfg || tech).parentNode.insertBefore(sec, cfg || tech);
    tabs.forEach(([id, , content]) => {
      const panel = document.createElement("div");
      panel.className = "shop-tabs__panel";
      panel.id = "panel-" + id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + id);
      panel.dataset.panel = id;
      if (typeof content === "string") panel.innerHTML = content;
      else panel.appendChild(content);
      sec.appendChild(panel);
    });

    const show = (id) => {
      $$("[data-tab]", sec).forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.tab === id))
      );
      $$("[data-panel]", sec).forEach((p) => {
        const on = p.dataset.panel === id;
        p.hidden = !on;
        p.classList.toggle("is-in", on);
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (window.lenis) window.lenis.resize();
    };
    sec.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (b) show(b.dataset.tab);
      if (e.target.closest("[data-fin-enquire]")) {
        e.preventDefault();
        if (enquiry && enquiry.ask)
          enquiry.ask(
            `I would like to see further fabric, leather and timber options for ${name}.`
          );
      }
    });
    sec.addEventListener("keydown", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b || !/^Arrow(Left|Right)$/.test(e.key)) return;
      const all = $$("[data-tab]", sec);
      const n =
        all[
          (all.indexOf(b) + (e.key === "ArrowRight" ? 1 : all.length - 1)) %
            all.length
        ];
      n.focus();
      show(n.dataset.tab);
    });
    initTabWipe(sec);
    initDescSlides($(".shop-desc__media", sec), sec);
    productRoot._showTab = show;
    show(tabs[0][0] === "configurate" ? "configurate" : "description");
  }
  // S12 / S13 run here, after their constants exist; onReady keeps the order
  // (after the main init above), so the new pill buttons get their hover too.
  buildTechDims();
  buildConfigurator();
  buildDownloads();
  buildTabs();
  onReady(() => {
    initPillButtons();
    if (productRoot) initConfigurator();
  });
})();
