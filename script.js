// =============================================================================
// TABLE OF CONTENTS (目錄)
// =============================================================================
//
// 01. LUVE Home — Card Hover Effects (True Mask Effect)
// 02. Hero Slider — Auto Play & Nav Progress
// 03. UNIFIED Menu System (Single Side Menu)
// 04. FAQ Accordion — Stable Expand/Collapse
// 05. Contact Page — Form Switcher & Mobile Animations
// 06. Global Hover Effects (Links, Socials, Underlines)
// 07. Back-to-Top Arrow (Color Detection)
// 08. Custom Cursor — Desktop Only
// 09. CTA Button Hover (Standard)
// 10. Swiper Slider Section
// 11. Floating CTA Controller (Updated for Unified Menu)
// 12. Universal CTA Hover (Updated for Unified Menu)
// 13. Award Carousel — Infinite Scroll (Marquee)
// 14. Text Animations (Global SplitType)
// 15. Process Page — Hero Motion
// 16. Process Page — Card Stacking Effect (Desktop Only)
// 17. Process Page — Anchor Scroll (Optimized)
// 18. Universal Anchor Scroll（全站通用 back-to-top）
// 19. Profile Page — Hero Scroll Parallax (Projects Page Style)
// 20. Studio Page — Team Member Hover
// 21. Helper Functions (Split Masks & Viewport Detection)
// 22. Universal Line Reveal
// 23. Projects Page — Filter & Hover
// 24. Featured Projects — Reveal & Hover Effects
// 25. Featured Projects — 手機版圖片載入後重算位置
// 26. Smart Page Loader (Bulletproof Version)
// 27. Footer — Real-time Clock & Status (HK Time)
// 28. Footer — Auto Copyright Year
// 29. Smooth Scroll (Lenis) & Hero Scroll Parallax
// 30. Project Gallery Reveal + More Strip + Lightbox
// 31. Next Project Link
// 32. Home Scroll Expansion (Video/Image Scale)
// 33. Testimonials Aside Reveal — Pop Up From Below
// 34. Client Reviews & Services
// 35. Services（What we can help you with）
// 36. Clean Enquiry Component
// 37. Compact Nav Logo
// 38. Contact Page — Mobile Scroll Lock
// 39. CTA Buttons — Pill Size & Contrast Colour
// 40. Small Style Fixes — Hover Dot & FAQ Spacing
// 41. Process FAQ — Native Accordion + Image Crossfade
// 42. Back-to-Top — Round Button on Phones + Reliable Scroll
// 43. Project Page — More Section Header + Hide Empty Size
//
// =============================================================================

// =====================================================
// 01. LUVE Home — Card Hover Effects (True Mask Effect)
// 功能：首頁卡片的縮放與遮罩效果
// =====================================================
(function () {
  const CARD_IDS = [1, 2, 3, 4];

  const DUR_IN = 0.25;
  const DUR_OUT = 0.25;
  const S = 0.96; // 外框縮放目標（越小邊收得越多）
  const S_INV = 1 / S; // 圖片的反向縮放，抵消父層縮放
  const PRESS = 0.985;

  CARD_IDS.forEach((id) => {
    const wrap = document.querySelector(`.image-card-wrapper-${id}`);
    if (!wrap) return;

    const img = wrap.querySelector(".image-card");
    const text = document.querySelector(`.card-text-wrapper-${id}`);
    const btn = wrap.querySelector(".button-pagination");

    // 初始設定
    gsap.set(wrap, { scale: 1, transformOrigin: "50% 50%" });
    if (img) gsap.set(img, { scale: 1, transformOrigin: "50% 50%" });
    if (text) gsap.set(text, { opacity: 0, y: 6 });
    if (btn) {
      gsap.set(btn, { opacity: 0, y: -10 });
      btn.style.pointerEvents = "none";
    }

    // Hover In
    wrap.addEventListener("mouseenter", () => {
      gsap.to(wrap, { scale: S, duration: DUR_IN, ease: "power3.out" });
      if (img) {
        gsap.to(img, {
          scale: S_INV,
          duration: DUR_IN,
          ease: "power3.out",
        });
      }
      gsap.to([text, btn].filter(Boolean), {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: DUR_IN,
        ease: "power2.out",
      });
      if (btn) btn.style.pointerEvents = "auto";
    });

    // Hover Out
    wrap.addEventListener("mouseleave", () => {
      gsap.to(wrap, { scale: 1, duration: DUR_OUT, ease: "power2.in" });
      if (img) {
        gsap.to(img, {
          scale: 1,
          duration: DUR_OUT,
          ease: "power2.in",
        });
      }
      gsap.to([text, btn].filter(Boolean), {
        opacity: 0,
        y: 6,
        stagger: 0.03,
        duration: DUR_OUT,
        ease: "power2.in",
      });
      if (btn) btn.style.pointerEvents = "none";
    });

    // 壓感效果
    let over = false;
    wrap.addEventListener("mouseenter", () => (over = true));
    wrap.addEventListener("mouseleave", () => (over = false));

    wrap.addEventListener(
      "pointerdown",
      () => {
        const base = over ? S : 1;
        gsap.to(wrap, {
          scale: base * PRESS,
          duration: 0.06,
          ease: "power4.out",
        });
        if (img) {
          gsap.to(img, {
            scale: 1 / (base * PRESS),
            duration: 0.06,
            ease: "power4.out",
          });
        }
      },
      { capture: true }
    );

    const release = () => {
      const base = over ? S : 1;
      gsap.to(wrap, {
        scale: base,
        duration: 0.2,
        ease: "power3.out",
      });
      if (img) {
        gsap.to(img, {
          scale: 1 / base,
          duration: 0.2,
          ease: "power3.out",
        });
      }
    };

    wrap.addEventListener("pointerup", release, { capture: true });
    wrap.addEventListener("pointercancel", release, { capture: true });
    document.addEventListener("pointerup", release);
  });
})();

// =====================================================
// 02. Hero Slider — Auto Play & Nav Progress
// 功能：首頁 Hero 輪播與進度條邏輯
// =====================================================
const slides = document.querySelectorAll(".custom-slider > div");
const navItems = document.querySelectorAll(".nav-item");
const progressBars = document.querySelectorAll(".progress-bar-fill");

let currentIndex = 0;
let progressTween;
const slideDuration = 5;

gsap.set(slides, {
  opacity: 0,
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
});
if (slides[0]) gsap.set(slides[0], { opacity: 1 });

gsap.set(progressBars, { width: "0%" });
gsap.set(navItems, { opacity: 0.4 });
if (navItems[0]) gsap.set(navItems[0], { opacity: 1 });

function startProgress(index) {
  if (progressTween) progressTween.kill();

  progressBars.forEach((bar, i) => {
    if (i !== index) gsap.set(bar, { width: "0%" });
  });

  navItems.forEach((item, i) =>
    gsap.set(item, { opacity: i === index ? 1 : 0.4 })
  );

  progressTween = gsap.fromTo(
    progressBars[index],
    { width: "0%" },
    {
      width: "100%",
      duration: slideDuration,
      ease: "linear",
      onComplete: () => goToSlide((index + 1) % slides.length),
    }
  );
}

function goToSlide(index) {
  if (index === currentIndex) return;

  const TRANSITION_DUR = 1.0; // ★ 慢慢 dissolve：1.6 - 2.6 自己試
  const TRANSITION_EASE = "sine.inOut"; // ★ 更似溶解

  // 確保新 slide 係上面
  gsap.set(slides[index], { zIndex: 2 });
  gsap.set(slides[currentIndex], { zIndex: 1 });

  gsap.to(slides[currentIndex], {
    opacity: 0,
    duration: TRANSITION_DUR,
    ease: TRANSITION_EASE,
    overwrite: "auto",
  });

  gsap.to(slides[index], {
    opacity: 1,
    duration: TRANSITION_DUR,
    ease: TRANSITION_EASE,
    overwrite: "auto",
  });

  currentIndex = index;
  startProgress(index);
}

if (slides.length && navItems.length && progressBars.length) {
  startProgress(0);
  navItems.forEach((item, i) =>
    item.addEventListener("click", () => i !== currentIndex && goToSlide(i))
  );
}

// =====================================================
// =====================================================
// 03. UNIFIED MENU SYSTEM
// OH-style floating reveal + right-to-left side-menu reveal
// Replace the existing Section 03 in script.js with this whole block.
// =====================================================
function initUnifiedMenuSystem() {
  if (window.__LUVE_MENU_SYSTEM_BOUND__) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("[Menu] GSAP or ScrollTrigger is unavailable.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const navBar = document.querySelector(".nav-bar");
  const navBurger = document.querySelector(".class-nav-burger");
  const floatingBtn = document.querySelector(".floating-burger-btn");
  const sideMenu = document.querySelector(".side-bar");
  const overlay = document.querySelector(".side-menu-bg");

  if (!navBar || !navBurger || !floatingBtn || !sideMenu || !overlay) {
    console.error("[Menu] Missing required navigation elements.");
    return;
  }

  window.__LUVE_MENU_SYSTEM_BOUND__ = true;

  window.__MENU_STATE__ = window.__MENU_STATE__ || {};
  const STATE = window.__MENU_STATE__;
  STATE.menuOpen = false;
  STATE.openSource = null; // "top" or "floating"
  STATE.floatingVisible = false;

  const isFixedColorPage =
    document.body.classList.contains("is-contact") ||
    !!document.querySelector(".is-contact") ||
    document.body.classList.contains("body-projects") ||
    !!document.querySelector(".body-projects");

  const navLogo = navBar.querySelector(".nav-logo-svg");
  const navBurgerLines = navBurger.querySelectorAll(".hamburger-1-line");
  const navHamburgerWrap = navBurger.querySelector(".hamburger-1-wrap");

  // Floating-menu opening reuses an exact clone of the Designer hamburger.
  // The clone remains permanently w--open (X) and cannot affect the top burger.
  let sideClose = sideMenu.querySelector("[data-side-menu-close]");
  if (!sideClose) {
    sideClose = document.createElement("button");
    sideClose.type = "button";
    sideClose.className = "side-menu-close";
    sideClose.setAttribute("data-side-menu-close", "true");
    sideClose.setAttribute("aria-label", "Close menu");
    sideMenu.prepend(sideClose);
  }
  sideClose.classList.add("w--open");
  sideClose.classList.remove("hover-line-effect", "u-side-sweep");
  if (navHamburgerWrap) {
    const floatingCloseWrap = navHamburgerWrap.cloneNode(true);
    floatingCloseWrap.classList.add("side-menu-floating-x-wrap");
    sideClose.replaceChildren(floatingCloseWrap);
  }

  const lockScroll = () => {
    if (window.lenis) window.lenis.stop();
    else document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (window.lenis) window.lenis.start();
    else document.body.style.overflow = "";
  };

  // Closed colours come from the page's own CSS (light over a hero photo,
  // dark on light pages such as Furniture), read once before any tween.
  const closedLogoColor = navLogo ? getComputedStyle(navLogo).color : "#f0e8dd";
  const closedBurgerColor = navBurgerLines.length
    ? getComputedStyle(navBurgerLines[0]).backgroundColor
    : "#f0e8dd";

  const setMenuTheme = (isOpen, duration = 0.35, ease = "power2.out") => {
    if (isFixedColorPage) return;
    const logoColor = isOpen ? "#795e49" : closedLogoColor;
    const burgerColor = isOpen ? "#795e49" : closedBurgerColor;

    if (navLogo) {
      gsap.to(navLogo, {
        color: logoColor,
        fill: logoColor,
        duration,
        ease,
        overwrite: "auto",
        onComplete: () => {
          if (!isOpen) gsap.set(navLogo, { clearProps: "color,fill" });
        },
      });
    }

    if (navBurgerLines.length) {
      gsap.to(navBurgerLines, {
        backgroundColor: burgerColor,
        duration,
        ease,
        overwrite: "auto",
        onComplete: () => {
          if (!isOpen)
            gsap.set(navBurgerLines, { clearProps: "backgroundColor" });
        },
      });
    }
  };

  const showTopBurger = () => {
    gsap.killTweensOf(navBurger);
    navBurger.style.pointerEvents = "auto";
    navBurger.setAttribute("aria-hidden", "false");
    gsap.to(navBurger, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const hideTopBurger = () => {
    gsap.killTweensOf(navBurger);
    navBurger.style.pointerEvents = "none";
    navBurger.setAttribute("aria-hidden", "true");
    gsap.to(navBurger, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const announceFloatingState = (
    visible,
    motionManaged = false,
    instant = false
  ) => {
    window.dispatchEvent(
      new CustomEvent("luve:floating-menu-visibility", {
        detail: { visible, motionManaged, instant },
      })
    );
  };

  // OH Architecture floating-nav motion:
  // both pills stay opaque and move through an overflow mask at yPercent 102.
  const setFloatingVisible = (visible, instant = false) => {
    floatingBtn.style.pointerEvents =
      visible && !STATE.menuOpen ? "auto" : "none";

    if (STATE.floatingVisible === visible && !instant) return;
    STATE.floatingVisible = visible;

    gsap.killTweensOf(floatingBtn);

    // The isolated enquiry trigger receives the same GSAP state in this tick.
    announceFloatingState(visible, true, instant);

    gsap.to(floatingBtn, {
      yPercent: visible ? 0 : 102,
      opacity: 1,
      visibility: "visible",
      clipPath: visible ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
      duration: instant ? 0 : visible ? 0.75 : 0.55,
      ease: visible ? "power3.out" : "power3.inOut",
      overwrite: "auto",
    });
  };

  const syncClosedVisibility = (instant = false) => {
    if (STATE.menuOpen || document.body.classList.contains("side-menu-open")) {
      return;
    }

    const scrollY = window.scrollY;
    const threshold = window.innerHeight * 0.15;

    if (scrollY > 10) hideTopBurger();
    else showTopBurger();

    setFloatingVisible(scrollY > threshold, instant);
  };

  gsap.set(floatingBtn, {
    yPercent: 102,
    opacity: 1,
    visibility: "visible",
    clipPath: "inset(0 0 100% 0)",
    transformOrigin: "center center",
  });

  // Side panel keeps its Webflow position/size; only the reveal method changes.
  gsap.set(sideMenu, {
    xPercent: 0,
    x: 0,
    transform: "none",
    clipPath: "inset(0 0 0 100%)",
  });
  gsap.set(overlay, {
    autoAlpha: 0,
    display: "none",
    pointerEvents: "none",
  });

  const alignSideClose = () => {
    // Match the original class-nav-burger X position exactly.
    const burgerRect = navBurger.getBoundingClientRect();
    sideClose.style.setProperty("top", `${burgerRect.top}px`, "important");
    sideClose.style.setProperty(
      "right",
      `${innerWidth - burgerRect.right}px`,
      "important"
    );
    if (navHamburgerWrap) {
      const wrapRect = navHamburgerWrap.getBoundingClientRect();
      if (wrapRect.width && wrapRect.height) {
        sideClose.style.setProperty(
          "width",
          `${wrapRect.width}px`,
          "important"
        );
        sideClose.style.setProperty(
          "height",
          `${wrapRect.height}px`,
          "important"
        );
      }
    }
  };

  const resetFloatingCtaVisual = () => {
    const text = floatingBtn.querySelector(".floating-cta-text");
    const arrow = floatingBtn.querySelector(".btn-arrow");
    gsap.killTweensOf([floatingBtn, text, arrow].filter(Boolean));
    gsap.set(floatingBtn, { clearProps: "backgroundColor" });
    if (text) gsap.set(text, { x: 0, clearProps: "color" });
    if (arrow) {
      gsap.set(arrow, {
        autoAlpha: 0,
        x: -15,
        scale: 0.6,
        clearProps: "backgroundColor,borderColor",
      });
    }
  };

  let targetOpen = false;
  let menuMotion = null;
  let menuTransitioning = false;

  const setMenuTransitionLock = (locked) => {
    menuTransitioning = locked;
    STATE.menuTransitioning = locked;
    sideClose.disabled = locked;
    sideClose.setAttribute("aria-disabled", locked ? "true" : "false");
    if (locked) navBurger.style.pointerEvents = "none";
    else if (STATE.openSource === "top" || !STATE.menuOpen) {
      navBurger.style.pointerEvents =
        navBurger.getAttribute("aria-hidden") === "true" ? "none" : "auto";
    }
  };

  const focusOpenControl = () => {
    if (!targetOpen) return;
    if (STATE.openSource === "floating")
      sideClose.focus({ preventScroll: true });
    else navBurger.focus({ preventScroll: true });
  };

  const finishOpenedMenu = () => {
    if (!targetOpen) return;
    setMenuTransitionLock(false);
    focusOpenControl();
  };

  const finishClosedMenu = () => {
    if (targetOpen) return;
    const source = STATE.openSource;
    STATE.menuOpen = false;
    STATE.openSource = null;
    gsap.set(overlay, { display: "none", pointerEvents: "none", autoAlpha: 0 });
    document.body.classList.remove(
      "side-menu-open",
      "side-menu-from-floating",
      "floating-menu-open"
    );
    navBurger.classList.remove("w--open");
    setMenuTransitionLock(false);
    unlockScroll();
    resetFloatingCtaVisual();
    syncClosedVisibility();
    if (source === "floating" && STATE.floatingVisible) {
      floatingBtn.focus({ preventScroll: true });
    } else if (source === "top") {
      navBurger.focus({ preventScroll: true });
    }
  };

  const openMenu = (source) => {
    if (targetOpen || menuTransitioning) return;
    targetOpen = true;
    STATE.menuOpen = true;
    STATE.openSource = source;
    setMenuTransitionLock(true);

    document.body.classList.add("side-menu-open");
    document.body.classList.toggle(
      "side-menu-from-floating",
      source === "floating"
    );
    document.body.classList.toggle("floating-menu-open", source === "floating");

    if (source === "top") {
      // Keep the existing hamburger -> X only for the original top burger.
      navBurger.classList.add("w--open");
      showTopBurger();
      navBurger.style.pointerEvents = "none";
      setFloatingVisible(false);
    } else {
      // Floating MENU uses the new text CLOSE; no hamburger -> X.
      navBurger.classList.remove("w--open");
      hideTopBurger();
      floatingBtn.style.pointerEvents = "none";
    }

    if (menuMotion) menuMotion.kill();
    gsap.killTweensOf([overlay, sideMenu]);
    alignSideClose();
    gsap.set(overlay, { display: "block", pointerEvents: "auto" });
    lockScroll();
    setMenuTheme(true, 1, "power4.inOut");
    // Exact same opening timings as the enquiry panel.
    menuMotion = gsap.timeline({ onComplete: finishOpenedMenu });
    menuMotion
      .to(overlay, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
      .to(
        sideMenu,
        {
          transform: "none",
          clipPath: "inset(0 0 0 0%)",
          duration: 1,
          ease: "power4.inOut",
        },
        0
      );
  };

  const closeMenu = () => {
    if (!targetOpen || menuTransitioning) return;
    targetOpen = false;
    STATE.menuOpen = false;
    setMenuTransitionLock(true);
    navBurger.classList.remove("w--open");
    setMenuTheme(false, 0.8, "power4.inOut");
    if (menuMotion) menuMotion.kill();
    gsap.killTweensOf([overlay, sideMenu]);
    // Exact same closing timings as the enquiry panel.
    menuMotion = gsap.timeline({ onComplete: finishClosedMenu });
    menuMotion
      .to(
        sideMenu,
        {
          transform: "none",
          clipPath: "inset(0 0 0 100%)",
          duration: 0.8,
          ease: "power4.inOut",
        },
        0
      )
      .to(overlay, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.25);
  };

  navBurger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (targetOpen) closeMenu();
    else openMenu("top");
  });

  floatingBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (targetOpen) closeMenu();
    else openMenu("floating");
  });

  sideClose.addEventListener("click", closeMenu);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeMenu();
  });

  sideMenu.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && targetOpen) closeMenu();
  });

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: () => syncClosedVisibility(),
  });

  // MENU stays the brown pill everywhere: the top fade (section 37) already
  // gives it a calm background, so it no longer switches colour over dark
  // sections (the old "is-dark" toggling is removed on purpose).
  floatingBtn.classList.remove("is-dark");

  window.addEventListener("resize", () => {
    alignSideClose();
    syncClosedVisibility(true);
  });
  syncClosedVisibility(true);

  window.LuveMenuController = {
    openFromTop: () => openMenu("top"),
    openFromFloating: () => openMenu("floating"),
    close: closeMenu,
    sync: syncClosedVisibility,
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUnifiedMenuSystem, {
    once: true,
  });
} else {
  initUnifiedMenuSystem();
}

// =====================================================
// 04. FAQ Accordion — Stable Expand/Collapse
// 功能：FAQ 手風琴展開/收合，圖示切換 (+ -> X)
// =====================================================
// FAQ Accordion — Stable (+ -> X) + No Jank + No Gaps
// Works with: .faq-item .faq-item-title .faq-item-body
// Icon targets: .faq-item-title-icon OR .faq-item-title-icon-mobile (wrapper or svg inside)
// =====================================================

gsap.registerPlugin(CustomEase);

// Create ease once
if (!gsap.parseEase("sexySpeed")) {
  CustomEase.create("sexySpeed", "M0,0 C0.25,0.1 0.25,1 1,1");
}

const FAQ_ITEMS = gsap.utils.toArray(".faq-item");

if (FAQ_ITEMS.length) {
  // ---------- helpers ----------
  function getIconTarget(item) {
    const iconWrap =
      item.querySelector(".faq-item-title-icon") ||
      item.querySelector(".faq-item-title-icon-mobile");
    if (!iconWrap) return null;
    // If wrapper contains an svg, rotate svg; otherwise rotate the wrapper
    return iconWrap.querySelector("svg") || iconWrap;
  }

  function getBody(item) {
    return item.querySelector(".faq-answer-mask");
  }

  function setCollapsed(body) {
    gsap.set(body, { height: 0, opacity: 0, overflow: "hidden" });
    body.style.display = "none"; // ✅ truly not taking layout space
    body.style.height = "0px";
  }

  function setExpanded(body) {
    body.style.display = "block";
    body.style.overflow = "hidden";
    body.style.opacity = "1";
  }

  function closeItem(item) {
    const body = getBody(item);
    const iconTarget = getIconTarget(item);
    if (!body) return;

    item.classList.remove("is-open");

    gsap.killTweensOf(body);
    if (iconTarget) gsap.killTweensOf(iconTarget);

    // Lock current px height before collapsing (prevents "jank")
    body.style.display = "block";
    const currentH = body.getBoundingClientRect().height;
    body.style.height = `${currentH}px`;
    body.style.overflow = "hidden";

    gsap.to(body, {
      height: 0,
      opacity: 0,
      duration: 0.45,
      ease: "sexySpeed",
      onComplete: () => {
        body.style.height = "0px";
        body.style.display = "none"; // ✅ prevents leftover gap
      },
    });

    if (iconTarget) {
      gsap.to(iconTarget, {
        rotation: 0, // + (not opened)
        duration: 0.35,
        ease: "sexySpeed",
        transformOrigin: "50% 50%",
      });
    }
  }

  function openItem(item) {
    const body = getBody(item);
    const iconTarget = getIconTarget(item);
    if (!body) return;

    item.classList.add("is-open");

    gsap.killTweensOf(body);
    if (iconTarget) gsap.killTweensOf(iconTarget);

    // Make it measurable, then animate to its content height
    setExpanded(body);

    body.style.height = "auto";
    const targetH = body.scrollHeight;

    body.style.height = "0px";
    gsap.to(body, {
      height: targetH,
      opacity: 1,
      duration: 0.5,
      ease: "sexySpeed",
      onComplete: () => {
        body.style.height = "auto"; // ✅ keep stable for responsive text wrap
      },
    });

    if (iconTarget) {
      gsap.to(iconTarget, {
        rotation: 45, // + -> X
        duration: 0.35,
        ease: "sexySpeed",
        transformOrigin: "50% 50%",
      });
    }
  }

  // ---------- init ----------
  FAQ_ITEMS.forEach((item) => {
    const body = getBody(item);
    const iconTarget = getIconTarget(item);

    if (body) setCollapsed(body);
    if (iconTarget)
      gsap.set(iconTarget, { rotation: 0, transformOrigin: "50% 50%" });

    item.classList.remove("is-open");
  });

  // ---------- events ----------
  FAQ_ITEMS.forEach((item) => {
    const title = item.querySelector(".faq-item-title");
    if (!title) return;

    title.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });
  });

  // Optional: keep layout stable if fonts load late and change line-wrap
  window.addEventListener("resize", () => {
    FAQ_ITEMS.forEach((item) => {
      if (!item.classList.contains("is-open")) return;
      const body = getBody(item);
      if (!body) return;
      // If currently "auto", do nothing. If mid-animation, let GSAP handle.
      if (body.style.height === "auto") return;
    });
  });
}

// =====================================================
// 05. Contact Page — Form Switcher & Mobile Animations
// 功能：聯絡表單切換（桌面 Fade/Slide，手機 Slide-in）
// =====================================================
(function () {
  const wrapperSelector = ".contact-body-form";
  const allForms = [
    ".new-client-form",
    ".media-enquiry-form",
    ".general-enquiry-form",
    ".careers-form",
  ];

  const mm = gsap.matchMedia();

  // Desktop (≥ 992px)
  mm.add("(min-width: 992px)", () => {
    let currentForm = null;
    const wrapper = document.querySelector(wrapperSelector);

    if (wrapper) {
      gsap.set(wrapper, { clearProps: "all" });
      wrapper.style.display = "block";
    }

    const hideAllForms = () => {
      allForms.forEach((selector) => {
        gsap.set(selector, { display: "none", autoAlpha: 0 });
      });
    };

    const switchFormDesktop = (newFormSelector) => {
      const newForm = document.querySelector(newFormSelector);
      if (!newForm) return;

      if (!currentForm) {
        hideAllForms();
        gsap.set(newForm, { display: "block" });
        gsap.fromTo(
          newForm,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, ease: "power2.out" }
        );
        currentForm = newForm;
        return;
      }

      if (currentForm === newForm) return;

      gsap.to(currentForm, {
        autoAlpha: 0,
        duration: 0.5,
        onComplete: () => {
          gsap.set(currentForm, { display: "none" });
          gsap.set(newForm, { display: "block" });
          gsap.fromTo(
            newForm,
            { autoAlpha: 0, y: 15 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }
          );
          currentForm = newForm;
        },
      });
    };

    const defaultForm = document.querySelector(".new-client-form");
    if (defaultForm) {
      hideAllForms();
      gsap.set(defaultForm, { display: "block", autoAlpha: 1 });
      currentForm = defaultForm;
    }

    const links = {
      ".new-client-contact-link": ".new-client-form",
      ".media-contact-link": ".media-enquiry-form",
      ".general-contact-link": ".general-enquiry-form",
      ".careers-contact-link": ".careers-form",
    };

    Object.keys(links).forEach((key) => {
      document.querySelector(key)?.addEventListener("click", (e) => {
        e.preventDefault();
        switchFormDesktop(links[key]);
      });
    });
  });

  // Mobile/Tablet (< 992px)
  mm.add("(max-width: 991px)", () => {
    const wrapper = document.querySelector(wrapperSelector);

    if (wrapper) {
      gsap.set(wrapper, { xPercent: 100, display: "block" });
    }

    const openMobileForm = (targetSelector) => {
      document.body.classList.add("no-scroll");
      allForms.forEach((s) => gsap.set(s, { display: "none" }));

      const target = document.querySelector(targetSelector);
      if (target) gsap.set(target, { display: "block", autoAlpha: 1 });

      if (wrapper) gsap.set(wrapper, { willChange: "transform" });

      // [修改] 開啟：1.0s + expo.out
      gsap.to(wrapper, {
        xPercent: 0,
        duration: 1.0,
        ease: "expo.out",
        onComplete: () => {
          if (wrapper) gsap.set(wrapper, { willChange: "auto" });
        },
      });
    };

    const closeMobileForm = () => {
      if (wrapper) gsap.set(wrapper, { willChange: "transform" });

      // [修改] 關閉：1.5s + expo.inOut (或者 keep expo.out 都可以)
      // 建議用 0.7s 稍快一點
      gsap.to(wrapper, {
        xPercent: 100,
        duration: 1.5,
        ease: "expo.inOut", // 收埋時用 inOut 會有一種「抽走」的感覺
        onComplete: () => {
          document.body.classList.remove("no-scroll");
          if (wrapper) gsap.set(wrapper, { willChange: "auto" });
        },
      });
    };

    const links = {
      ".new-client-contact-link": ".new-client-form",
      ".media-contact-link": ".media-enquiry-form",
      ".general-contact-link": ".general-enquiry-form",
      ".careers-contact-link": ".careers-form",
    };

    Object.keys(links).forEach((key) => {
      const el = document.querySelector(key);
      if (el) {
        el.onclick = (e) => {
          e.preventDefault();
          openMobileForm(links[key]);
        };
      }
    });

    document.querySelectorAll(".form-close-btn").forEach((btn) => {
      btn.onclick = closeMobileForm;
    });
  });

  // ---------------------------------------------------
  // C. Close Button Interaction (Back Button Scale)
  // ---------------------------------------------------
  const allCloseBtns = document.querySelectorAll(".form-close-btn");

  if (allCloseBtns.length > 0) {
    allCloseBtns.forEach((btn) => {
      // 確保初始狀態正常
      gsap.set(btn, { scale: 1 });

      // Mouse Enter (Desktop Hover)
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, {
          scale: 1.05, // 稍微放大
          x: -5, // 稍微向左移 (配合 < BACK 的方向感)
          color: "#cfbea6", // (Optional) 變淺色
          duration: 0.3,
          ease: "power2.out",
        });
      });

      // Mouse Leave
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          scale: 1,
          x: 0,
          color: "#795e49", // 還原深色
          duration: 0.3,
          ease: "power2.out",
        });
      });

      // Mouse Down (Click Feedback)
      btn.addEventListener("mousedown", () => {
        gsap.to(btn, { scale: 0.95, duration: 0.1 });
      });

      // Mouse Up
      btn.addEventListener("mouseup", () => {
        gsap.to(btn, { scale: 1.05, duration: 0.1 });
      });
    });
  }
})();

// =====================================================
// 06. Global Hover Effects (Links, Socials, Underlines)
// 功能：全站連結的底線與社交圖標 Hover 效果
// =====================================================
(function initGlobalHoverEffects() {
  if (typeof gsap === "undefined") return;

  const bindOnce = (el, key) => {
    if (!el) return false;
    const k = `__bound_${key}__`;
    if (el[k]) return false;
    el[k] = true;
    return true;
  };

  const hasImage = (el) =>
    !!(el.querySelector("img") || el.querySelector("svg"));

  const isInSideMenu = (el) =>
    !!el.closest(".side-bar") || !!el.closest(".side-bar-2");

  const ensureSweepSpan = (hitEl, spanClass) => {
    if (!hitEl) return null;
    let span = hitEl.querySelector(`:scope > span.${spanClass}`);
    if (span) return span;
    const hasOnlyText = Array.from(hitEl.childNodes).every(
      (n) => n.nodeType === 3 || (n.nodeType === 1 && n.tagName === "BR")
    );
    if (!hasOnlyText) return null;
    span = document.createElement("span");
    span.className = spanClass;
    while (hitEl.firstChild) {
      span.appendChild(hitEl.firstChild);
    }
    hitEl.appendChild(span);
    return span;
  };

  const applyUnderlineSweep = ({
    hitEl,
    lineEl,
    hoverColor,
    leaveColor,
    lineColor,
    lineOpacity,
  }) => {
    if (!hitEl || !lineEl) return;
    if (
      !bindOnce(
        hitEl,
        "underline_sweep_" +
          (hitEl.className || hitEl.getAttribute?.("href") || Math.random())
      )
    )
      return;

    lineEl.classList.add("hover-line-effect");
    gsap.set(lineEl, {
      "--line-width": "0%",
      "--line-left": "0",
      "--line-right": "auto",
    });

    if (lineColor)
      lineEl.style.setProperty("--hover-underline-color", lineColor);
    if (lineOpacity !== undefined && lineOpacity !== null) {
      lineEl.style.setProperty(
        "--hover-underline-opacity",
        String(lineOpacity)
      );
    }

    if (!hitEl.dataset.baseColor) {
      hitEl.dataset.baseColor = getComputedStyle(hitEl).color || "#795e49";
    }
    const base = leaveColor || hitEl.dataset.baseColor;

    hitEl.addEventListener("mouseenter", () => {
      gsap.to(hitEl, {
        duration: 0.4,
        color: hoverColor,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.set(lineEl, { "--line-left": "0", "--line-right": "auto" });
      gsap.to(lineEl, {
        "--line-width": "100%",
        duration: 0.6,
        ease: "expo.out",
        overwrite: "auto",
      });
    });

    hitEl.addEventListener("mouseleave", () => {
      gsap.to(hitEl, {
        duration: 0.5,
        color: base,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      gsap.set(lineEl, { "--line-left": "auto", "--line-right": "0" });
      gsap.to(lineEl, {
        "--line-width": "0%",
        duration: 0.6,
        ease: "expo.out",
        overwrite: "auto",
      });
    });
  };

  // Side Menu Text Links
  const sideMenuTextLinks = document.querySelectorAll(
    ".side-bar a.side-link, .side-bar-2 a.side-link, .side-bar a.link-text, .side-bar-2 a.link-text"
  );
  sideMenuTextLinks.forEach((a) => {
    if (!a) return;
    if (
      a.classList.contains("nav-logo-link") ||
      a.classList.contains("cta-button") ||
      a.classList.contains("form-close-btn") ||
      a.classList.contains("w-inline-block") ||
      a.classList.contains("social-image") ||
      hasImage(a) ||
      a.querySelector(".social-image")
    ) {
      return;
    }
    const span = ensureSweepSpan(a, "u-side-sweep");
    if (!span) return;

    applyUnderlineSweep({
      hitEl: a,
      lineEl: span,
      hoverColor: "#f0e8dd",
      leaveColor: "#795e49",
      lineColor: "#f0e8dd",
      lineOpacity: 0.78,
    });
  });

  // =====================================================
  // Add this block inside the existing Footer & General Text Links section,
  // immediately AFTER the sideMenuTextLinks.forEach(...) block.
  // It reuses that section's existing applyUnderlineSweep function.
  // =====================================================
  document.addEventListener("DOMContentLoaded", () => {
    document
      // The floating-menu close control is the hamburger X, not a text link.
      // Keep it out of the underline system so it only uses the burger-line hover.
      .querySelectorAll('[data-enq-underline="true"]')
      .forEach((closeButton) => {
        applyUnderlineSweep({
          hitEl: closeButton,
          lineEl: closeButton,
          hoverColor: "#b58c67",
          leaveColor: "#795e49",
          lineColor: "#b58c67",
          lineOpacity: 1,
        });
      });
  });

  // Footer Social Icons
  const footerIcons = document.querySelectorAll(
    ".footer-section .social-image"
  );
  footerIcons.forEach((el) => {
    if (!bindOnce(el, "footer_icon_float")) return;
    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        duration: 0.4,
        color: "#cfbea6",
        y: -4,
        textShadow: "0 0 8px rgba(207,190,166,0.3)",
        ease: "power3.out",
        overwrite: "auto",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        duration: 0.5,
        color: "#795e49",
        y: 0,
        textShadow: "0 0 0 rgba(0,0,0,0)",
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  });

  // Side Menu Social Icons
  const sideMenuIcons = document.querySelectorAll(
    ".side-bar .social-image, .side-bar-2 .social-image"
  );
  sideMenuIcons.forEach((el) => {
    if (!bindOnce(el, "sidemenu_icon_float")) return;
    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        duration: 0.4,
        color: "#f0e8dd",
        y: -4,
        textShadow: "0 0 8px rgba(240,232,221,0.25)",
        ease: "power3.out",
        overwrite: "auto",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        duration: 0.5,
        color: "#795e49",
        y: 0,
        textShadow: "0 0 0 rgba(0,0,0,0)",
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  });

  // Footer & General Text Links
  const textLinks = document.querySelectorAll(
    ".footer-section a, .new-client-contact-link, .media-contact-link, .general-contact-link, .careers-contact-link, .footer-nav-link, a.w--current, .lfq a.link-text, .lfq-rich a:not([href='#get-in-touch'])"
  );
  textLinks.forEach((el) => {
    if (!el) return;
    if (
      el.classList.contains("nav-logo-link") ||
      el.classList.contains("cta-button") ||
      el.classList.contains("form-close-btn") ||
      el.classList.contains("w-inline-block") ||
      el.classList.contains("social-image") ||
      hasImage(el) ||
      el.querySelector(".social-image") ||
      isInSideMenu(el)
    ) {
      return;
    }
    applyUnderlineSweep({
      hitEl: el,
      lineEl: el,
      hoverColor: "#cfbea6",
      leaveColor: "#795e49",
      lineColor: "#cfbea6",
    });
  });
})();

// =====================================================
// =====================================================
// 07. Back-to-Top Arrow (Fixed Designer Color)
// 功能：保留 hover、顯示／隱藏及返回頂部；顏色完全由 Webflow/CSS 控制
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const arrow = document.querySelector(".anchor-arrow");
  if (!arrow) return;

  const paths = arrow.querySelectorAll("path,line,polyline");
  const baseStroke = parseFloat(paths[0]?.getAttribute("stroke-width")) || 3;

  gsap.set(arrow, { willChange: "transform" });

  arrow.addEventListener("mouseenter", () => {
    gsap.to(arrow, {
      scale: 1.08,
      y: -2,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.to(paths, {
      attr: { "stroke-width": baseStroke + 0.4 },
      duration: 0.45,
      ease: "power3.out",
    });
  });

  arrow.addEventListener("mouseleave", () => {
    gsap.to(arrow, {
      scale: 1,
      y: 0,
      duration: 0.45,
      ease: "power2.inOut",
      overwrite: true,
    });
    gsap.to(paths, {
      attr: { "stroke-width": baseStroke },
      duration: 0.45,
      ease: "power2.inOut",
      overwrite: true,
    });
  });

  gsap.set(arrow, { autoAlpha: 0, scale: 0.85, y: 10 });

  window.addEventListener(
    "scroll",
    () => {
      const show = window.scrollY > 600;
      gsap.to(arrow, {
        autoAlpha: show ? 1 : 0,
        scale: show ? 1 : 0.85,
        y: show ? 0 : 10,
        duration: show ? 0.6 : 0.5,
        ease: show ? "power2.out" : "power2.inOut",
      });
    },
    { passive: true }
  );

  arrow.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 1.2,
      ease: "power3.inOut",
    });
  });
});

// 08. Custom Cursor — Desktop Only
// Keeps enquiry BACK / NEXT / SUBMIT FORM in the warm translucent mode.
// Replace the existing Section 08 in script.js with this whole block.
// =====================================================
(function () {
  const cursor = document.querySelector(".cursor");
  const cursorText = document.querySelector(".cursor-text");

  if (!cursor) return;
  if (!window.matchMedia("(min-width: 992px)").matches) return;

  const BASE = {
    size: 20,
    growSize: 32,
    viewSize: 100,
    colorLight: "#795e49",
    borderLight: "rgba(0,0,0,0.08)",
    visualDur: 0.3,
  };

  const WARM_BG = "rgba(121,94,73,0.14)";
  const GLASS_BG = "rgba(255,255,255,0.1)";
  const GLASS_BORDER = "rgba(255,255,255,0.2)";
  const GLASS_BACKDROP = "blur(8px)";

  const VIEW_TARGET =
    '.projects-next-link, .project-link-block, .project-image-wrapper, .testimonials-aside-wrap *, .fp-card, .fp-card *, [data-cursor="view"]';

  const HIDE_CURSOR_TARGETS = '[data-cursor-hide="true"]';
  const ENQUIRY_SOFT_TARGETS =
    '[data-enq-form] [data-cursor-hide="true"], [data-cursor-soft="true"]';

  const WARM_HOVER_TARGETS = [
    "a",
    "p",
    "span",
    "strong",
    "em",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    ".faq-section .faq-item-title",
    "button",
    "[role='button']",
    ".w-button",
    ".btn",
    ".button",
    "input[type='submit']",
    "input[type='button']",
    "input",
    "textarea",
    "[contenteditable='true']",
    ".footer-form-wrapper .email-input",
    ".section-cta *",
    ".slide-nav-wrapper .nav-item",
    ".footer-legal-wrapper *",
    '[data-cursor="warm"]',
    VIEW_TARGET,
  ].join(", ");

  const BG_HOVER_WHITELIST =
    ".section-cta, .footer-form-wrapper, .slide-nav-wrapper, .footer-legal-wrapper";

  document
    .querySelectorAll(`${WARM_HOVER_TARGETS}, ${HIDE_CURSOR_TARGETS}`)
    .forEach((element) => {
      element.style.cursor = "none";
    });

  document.querySelectorAll(ENQUIRY_SOFT_TARGETS).forEach((element) => {
    element.style.cursor = "pointer";
  });

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });

  let cx = innerWidth / 2;
  let cy = innerHeight / 2;
  let area = "light";
  let hoverMode = "none";
  const darkSecs = Array.from(document.querySelectorAll(".dark-bg"));

  window.addEventListener(
    "mousemove",
    (event) => {
      cx = event.clientX;
      cy = event.clientY;

      const moveDur =
        hoverMode === "view" ? 0.35 : hoverMode === "warm" ? 0.16 : 0.08;

      gsap.to(cursor, {
        x: cx,
        y: cy,
        duration: moveDur,
        ease: "power1.out",
        overwrite: "auto",
      });
    },
    { passive: true }
  );

  const rectHit = (rect) =>
    cx > rect.left && cx < rect.right && cy > rect.top && cy < rect.bottom;

  function detectArea() {
    const next = darkSecs.some((section) =>
      rectHit(section.getBoundingClientRect())
    )
      ? "dark"
      : "light";

    if (next !== area) {
      area = next;
      applyVisual();
    }
  }

  ["mousemove", "scroll", "resize"].forEach((eventName) =>
    window.addEventListener(eventName, detectArea)
  );

  function isImageOrBg(node) {
    if (node.closest(BG_HOVER_WHITELIST)) return false;
    let element = node;
    while (element && element !== document.body) {
      if (element.tagName === "IMG") return true;
      const style = window.getComputedStyle(element);
      if (style && style.backgroundImage && style.backgroundImage !== "none") {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  document.addEventListener("pointerover", (event) => {
    const target = event.target;

    // This test must run before the generic button/role=button warm target.
    if (target.closest(ENQUIRY_SOFT_TARGETS)) return setHover("warm");
    if (target.closest(HIDE_CURSOR_TARGETS)) return setHover("hidden");
    if (target.closest(VIEW_TARGET)) return setHover("view");
    if (isImageOrBg(target)) return setHover("none");
    if (target.closest(WARM_HOVER_TARGETS)) return setHover("warm");
    setHover("none");
  });

  document.addEventListener("pointerout", (event) => {
    const next = event.relatedTarget;
    if (
      next &&
      (next.closest(ENQUIRY_SOFT_TARGETS) ||
        next.closest(HIDE_CURSOR_TARGETS) ||
        next.closest(WARM_HOVER_TARGETS) ||
        next.closest(VIEW_TARGET))
    ) {
      return;
    }
    setHover("none");
  });

  function setHover(mode) {
    if (mode === hoverMode) return;
    hoverMode = mode;
    applyVisual();
  }

  function applyVisual() {
    let size = BASE.size;
    let bg = BASE.colorLight;
    let border = BASE.borderLight;
    let backdrop = "none";
    let textAlpha = 0;
    let cursorAlpha = 1;

    if (hoverMode === "view") {
      size = BASE.viewSize;
      bg = GLASS_BG;
      border = GLASS_BORDER;
      backdrop = GLASS_BACKDROP;
      textAlpha = 1;
    } else if (hoverMode === "warm") {
      1276;

      size = BASE.growSize;
      bg = WARM_BG;
      border = "rgba(0,0,0,0.12)";
    } else if (hoverMode === "hidden") {
      size = 0;
      bg = "transparent";
      border = "transparent";
      cursorAlpha = 0;
    }

    gsap.to(cursor, {
      width: size,
      height: size,
      opacity: cursorAlpha,
      backgroundColor: bg,
      borderColor: border,
      backdropFilter: backdrop,
      webkitBackdropFilter: backdrop,
      duration: hoverMode === "hidden" ? 0.12 : BASE.visualDur,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (cursorText) {
      gsap.to(cursorText, {
        opacity: textAlpha,
        duration: 0.2,
        ease: "power1.out",
      });
    }

    cursor.style.mixBlendMode = "normal";
  }

  window.addEventListener("mousedown", () =>
    gsap.to(cursor, { scale: 0.9, duration: 0.08 })
  );

  window.addEventListener("mouseup", () =>
    gsap.to(cursor, {
      scale: 1,
      duration: 0.12,
      ease: "power2.out",
    })
  );

  gsap.fromTo(
    cursor,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: "power2.out", delay: 0.05 }
  );
})();

// =====================================================
// 09. CTA Button Hover (Standard)
// 功能：一般按鈕的 Hover 縮放與變色
// =====================================================
(function () {
  const btns = document.querySelectorAll(".cta-button");
  if (!btns.length) return;

  btns.forEach((btn) => {
    gsap.set(btn, { scale: 1, transformOrigin: "50% 50%" });

    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 0.16, ease: "power2.out" },
      })
      .to(
        btn,
        {
          backgroundColor: "#f0e8dd",
          color: "#3f3329",
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
        },
        0
      )
      .to(btn, { scale: 1.04 }, 0);

    btn.addEventListener("mouseenter", () => tl.play());
    btn.addEventListener("mouseleave", () => tl.reverse());
    btn.addEventListener("mousedown", () =>
      gsap.to(btn, { scale: 0.99, duration: 0.08 })
    );
    btn.addEventListener("mouseup", () =>
      gsap.to(btn, { scale: 1.04, duration: 0.12, ease: "power2.out" })
    );
  });
})();

// =====================================================
// 10. Swiper Slider Section
// 功能：初始化 Swiper 及自訂按鈕 GSAP 動畫
// =====================================================
$(document).ready(function () {
  function numberWithZero(num) {
    return num < 10 ? "0" + num : String(num);
  }

  $(".slider-gallery-component").each(function () {
    const $wrap = $(this);

    const totalSlides = numberWithZero(
      $wrap.find(".swiper.is-slider-titles .swiper-slide").length
    );
    $wrap.find(".swiper-number-total").text(totalSlides);

    const bgSwiper = new Swiper($wrap.find(".swiper.is-slider-bg")[0], {
      slidesPerView: 1,
      speed: 400,
      effect: "fade",
      allowTouchMove: false,
      loop: true,
      loopedSlides: 16,
    });

    const textSwiper = new Swiper($wrap.find(".swiper.is-slider-titles")[0], {
      slidesPerView: "auto",
      speed: 600,
      loop: true,
      loopedSlides: 16,
      slideToClickedSlide: true,
      mousewheel: false,
      keyboard: true,
      centeredSlides: true,
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active",
      navigation: {
        nextEl: $wrap.find(".swiper-next")[0],
        prevEl: $wrap.find(".swiper-prev")[0],
      },
    });

    $wrap.find(".swiper-number-current").text(numberWithZero(1));

    textSwiper.on("slideChange", function (e) {
      const real = e.realIndex;
      bgSwiper.slideToLoop(real, 400, false);
      $wrap.find(".swiper-number-current").text(numberWithZero(real + 1));
    });

    const btnPrev = $wrap.find(".swiper-prev")[0];
    const btnNext = $wrap.find(".swiper-next")[0];
    const btns = [btnPrev, btnNext].filter(Boolean);

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    btns.forEach((btn) => {
      gsap.set(btn, {
        willChange:
          "transform, background-color, color, box-shadow, border-color, backdrop-filter, filter",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transformOrigin: "50% 50%",
        zIndex: 20,
        borderRadius: "9999px",
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: "rgba(255,255,255,0.22)",
        color: "#2f261d",
        borderColor: "rgba(255,255,255,0.55)",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35)",
        backdropFilter: "blur(30px) saturate(110%)",
        filter: "brightness(1.03)",
        scale: 1,
        y: 0,
      });

      const dur = prefersReduce ? 0.01 : 0.26;

      const tl = gsap
        .timeline({
          paused: true,
          defaults: { duration: dur, ease: "power3.out", overwrite: "auto" },
        })
        .to(
          btn,
          {
            backgroundColor: "rgba(255,255,255,0.34)",
            color: "#2b2119",
            borderColor: "rgba(255,255,255,0.8)",
            boxShadow:
              "0 14px 28px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
            backdropFilter: "blur(34px) saturate(115%)",
            filter: "brightness(1.08)",
            scale: 1.08,
            y: -1.5,
          },
          0
        );

      btn.addEventListener("mouseenter", () => tl.play());
      btn.addEventListener("mouseleave", () => tl.reverse());

      btn.addEventListener("mousedown", () => {
        gsap.to(btn, {
          scale: 0.985,
          y: 0,
          duration: prefersReduce ? 0.01 : 0.08,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      btn.addEventListener("mouseup", () => {
        gsap.to(btn, {
          scale: 1.08,
          y: -1.5,
          duration: prefersReduce ? 0.01 : 0.14,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      btn.addEventListener("focus", () => tl.play());
      btn.addEventListener("blur", () => tl.reverse());

      btn.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
});

// =====================================================
// 11. Floating CTA Controller (Updated for Unified Menu)
// 功能：控制 floating button 既位置同主題
// =====================================================
window.FloatingCtaController = (function () {
  if (typeof gsap === "undefined") return null;

  const NAV = document.querySelector(".nav-bar");
  const FLOATING_CTA = document.querySelector(".floating-burger-btn");
  const ORIGINAL_BURGER = document.querySelector(".class-nav-burger");

  if (!NAV || !FLOATING_CTA || !ORIGINAL_BURGER) return null;

  // Floating button 既元素
  const FLOATING_LINES = FLOATING_CTA.querySelectorAll(".hamburger-1-line");
  const FLOATING_SVG = FLOATING_CTA.querySelector("svg");

  // 主題顏色
  const COLOR_LIGHT_TEXT = "#f0e8dd";
  const COLOR_DARK_TEXT = "#795e49";

  // ★ 更新：檢查統一既 menu 狀態
  const menuGuard = () => {
    return window.__MENU_STATE__?.menuOpen || false;
  };

  // 同步 floating button 既位置（跟 nav burger 對齊）
  const syncFloatingPosition = () => {
    const burgerRect = ORIGINAL_BURGER.getBoundingClientRect();
    const ctaRect = FLOATING_CTA.getBoundingClientRect();
    const currentNavY = gsap.getProperty(NAV, "y") || 0;
    const originalBurgerTop = burgerRect.top - currentNavY;

    const top = originalBurgerTop + (burgerRect.height - ctaRect.height) / 2;
    const rightDistance = window.innerWidth - burgerRect.right;

    gsap.set(FLOATING_CTA, {
      top: top,
      right: rightDistance,
      left: "auto",
      position: "fixed",
      overwrite: "auto",
    });
  };

  // 獲取當前主題（根據 data-theme）
  const getCurrentTheme = () => {
    const themedSections = document.querySelectorAll("[data-theme]");
    for (const sec of themedSections) {
      const r = sec.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        return sec.getAttribute("data-theme") || "light";
      }
    }
    return "light";
  };

  // 設定 floating button 既主題顏色
  const setFloatingTheme = (theme) => {
    if (menuGuard()) return; // Menu 開緊就唔改顏色

    const c = theme === "dark" ? COLOR_LIGHT_TEXT : COLOR_DARK_TEXT;

    // 如果係用 div lines
    if (FLOATING_LINES.length > 0) {
      gsap.to(FLOATING_LINES, {
        backgroundColor: c,
        duration: 0.25,
        overwrite: true,
      });
    }

    // 如果係用 SVG
    if (FLOATING_SVG) {
      gsap.to(FLOATING_CTA, {
        color: c,
        duration: 0.25,
        overwrite: true,
      });
    }
  };

  // 初始化
  gsap.set(FLOATING_CTA, { autoAlpha: 0, transformOrigin: "center center" });
  syncFloatingPosition();
  setFloatingTheme(getCurrentTheme());

  // Scroll 時更新
  window.addEventListener(
    "scroll",
    () => {
      if (menuGuard()) return;

      // 避免同 body lock 衝突
      if (
        document.body.classList.contains("no-scroll") ||
        document.body.style.overflow === "hidden"
      )
        return;

      syncFloatingPosition();
      setFloatingTheme(getCurrentTheme());
    },
    { passive: true }
  );

  // Resize 時更新
  window.addEventListener("resize", () => {
    syncFloatingPosition();
    setFloatingTheme(getCurrentTheme());
  });

  // Load 時更新
  window.addEventListener("load", () => {
    syncFloatingPosition();
    setFloatingTheme(getCurrentTheme());
  });

  return { syncFloatingPosition, setFloatingTheme };
})();

// =====================================================
// 12. Universal CTA Hover (Updated for Unified Menu)
// 功能：通用 CTA 按鈕動畫 (電腦版: 推移+箭嘴 / 手機版: 按壓縮放+轉色)
// =====================================================
(function initCtaHoverClean() {
  if (typeof gsap === "undefined") return;

  // ★ 更新：檢查統一既 menu 狀態
  const anyMenuOpen = () => window.__MENU_STATE__?.menuOpen || false;

  // 判斷是否為手機/平板
  const isMobile = window.matchMedia(
    "(max-width: 991px), (hover: none)"
  ).matches;

  const bindOnce = (el, key) => {
    if (!el) return false;
    const k = `__bound_${key}__`;
    if (el[k]) return false;
    el[k] = true;
    return true;
  };

  // Colours: brown pill with light text by default. A button sitting on a
  // dark photo / dark background gets the class "is-on-dark" (see section 39)
  // and uses the reverse: light pill with brown text, brown on hover.
  const BROWN = "#795e49";
  const LIGHT = "#f0e8dd";
  const tonesOf = (btn) =>
    btn.classList.contains("is-on-dark")
      ? { bg: LIGHT, tx: BROWN, hbg: BROWN, htx: LIGHT }
      : { bg: BROWN, tx: LIGHT, hbg: LIGHT, htx: BROWN };

  const applyPushEffect = (btnSelector, textSelector) => {
    const buttons = document.querySelectorAll(btnSelector);

    buttons.forEach((btn) => {
      if (!bindOnce(btn, `cta_hover_instance`)) return;

      const text = btn.querySelector(textSelector);
      const arrow =
        btn.querySelector(".btn-arrow") || btn.querySelector(".floating-arrow");
      const arrowIcon = arrow ? arrow.querySelector("img, svg") : null;
      const isFloating = btn.classList.contains("floating-burger-btn");

      // 初始狀態設定
      if (isFloating) gsap.set(btn, { backgroundColor: BROWN });

      // Re-apply the resting colours (section 39 calls this after it has
      // worked out whether the button sits on a dark or light background)
      btn.__ctaSetIdle = (duration = 0) => {
        const t = tonesOf(btn);
        gsap.to(btn, {
          backgroundColor: t.bg,
          duration,
          overwrite: "auto",
        });
        if (text) gsap.to(text, { color: t.tx, duration, overwrite: "auto" });
        if (arrow && !isMobile)
          gsap.set(arrow, { borderColor: t.tx, backgroundColor: "transparent" });
      };

      // =========================================================
      //  手機版邏輯
      // =========================================================
      if (isMobile) {
        if (arrow) gsap.set(arrow, { display: "none" });
        if (text) gsap.set(text, { x: 0, color: tonesOf(btn).tx });

        const mobilePress = () => {
          const t = tonesOf(btn);
          gsap.to(btn, {
            scale: 0.96,
            backgroundColor: t.hbg,
            duration: 0.1,
            ease: "power1.out",
            overwrite: "auto",
          });
          if (text) {
            gsap.to(text, {
              color: t.htx,
              duration: 0.1,
              overwrite: "auto",
            });
          }
        };

        const mobileRelease = () => {
          const t = tonesOf(btn);
          gsap.to(btn, {
            scale: 1,
            backgroundColor: t.bg,
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
          });
          if (text) {
            gsap.to(text, {
              color: t.tx,
              duration: 0.2,
              overwrite: "auto",
            });
          }
        };

        btn.addEventListener("touchstart", mobilePress, { passive: true });
        btn.addEventListener("touchend", mobileRelease, { passive: true });
        btn.addEventListener("touchcancel", mobileRelease, { passive: true });
        btn.addEventListener("mousedown", mobilePress);
        btn.addEventListener("mouseup", mobileRelease);
        btn.addEventListener("mouseleave", mobileRelease);

        // =========================================================
        //  電腦版邏輯
        // =========================================================
      } else {
        if (text) {
          gsap.set(text, { x: 0, color: tonesOf(btn).tx, "--line-width": "0%" });
          gsap.set(text, { "--line-left": "0", "--line-right": "auto" });
        }

        if (arrow) {
          gsap.set(arrow, {
            autoAlpha: 0,
            x: -15,
            scale: 0.6,
            backgroundColor: "transparent",
            borderColor: tonesOf(btn).tx,
            display: "flex",
          });
        }

        btn.addEventListener("mouseenter", () => {
          if (anyMenuOpen()) return;
          const t = tonesOf(btn);

          gsap.to(btn, {
            backgroundColor: t.hbg,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
          });

          if (arrow) {
            gsap.to(arrow, {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              backgroundColor: t.htx,
              borderColor: t.htx,
              duration: 0.6,
              ease: "expo.out",
              overwrite: "auto",
            });
            if (arrowIcon)
              gsap.to(arrowIcon, {
                filter: "brightness(2)",
                duration: 0.4,
                overwrite: "auto",
              });
          }

          if (text) {
            gsap.to(text, {
              color: t.htx,
              x: 12,
              duration: 1.0,
              ease: "expo.out",
              overwrite: "auto",
            });

            gsap.set(text, { "--line-left": "0", "--line-right": "auto" });
            gsap.to(text, {
              "--line-width": "100%",
              duration: 0.8,
              ease: "expo.out",
              overwrite: "auto",
            });
          }
        });

        btn.addEventListener("mouseleave", () => {
          const t = tonesOf(btn);
          gsap.to(btn, {
            backgroundColor: t.bg,
            duration: 0.6,
            overwrite: "auto",
          });

          if (arrow) {
            gsap.to(arrow, {
              autoAlpha: 0,
              x: -15,
              scale: 0.6,
              backgroundColor: "transparent",
              duration: 0.6,
              ease: "expo.out",
              overwrite: "auto",
            });
            if (arrowIcon)
              gsap.to(arrowIcon, {
                filter: "none",
                duration: 0.4,
                overwrite: "auto",
              });
          }

          if (text) {
            gsap.to(text, {
              color: t.tx,
              x: 0,
              duration: 0.8,
              ease: "expo.out",
              overwrite: "auto",
            });

            gsap.set(text, { "--line-left": "auto", "--line-right": "0" });
            gsap.to(text, {
              "--line-width": "0%",
              duration: 0.6,
              ease: "expo.out",
              overwrite: "auto",
            });
          }
        });

        // Desktop Reset (當 menu 開啟時)
        const resetToIdle = () => {
          const t = tonesOf(btn);
          gsap.to(btn, { backgroundColor: t.bg, duration: 0.2 });
          if (text)
            gsap.to(text, { x: 0, color: t.tx, "--line-width": "0%" });
          if (arrow) gsap.set(arrow, { autoAlpha: 0, x: -15 });
        };

        document.addEventListener(
          "click",
          () => {
            if (!anyMenuOpen()) return;
            resetToIdle();
          },
          true
        );
      }
    });
  };

  // 執行
  applyPushEffect(".btn-wrapper", ".btn-text");
  applyPushEffect(".floating-burger-btn", ".floating-cta-text");
  applyPushEffect(".reload-form-btn", ".btn-text");
})();

// =====================================================
// 13. Award Carousel — Infinite Scroll (Marquee)
// 功能：獎項輪播無限滾動
// =====================================================
function initAwardCarousel() {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const originalContent = track.innerHTML;
  track.innerHTML += originalContent;

  const totalWidth = track.scrollWidth;
  const moveDistance = totalWidth / 2;

  const speed = 50; // px/sec
  const dynamicDuration = moveDistance / speed;

  gsap.to(track, {
    x: -moveDistance,
    duration: dynamicDuration,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % moveDistance),
    },
  });
}
initAwardCarousel();

// =====================================================
// 14. Text Animations (Global SplitType)
// 功能：全站文字動畫 (Slide Up, Fade In 等)
// =====================================================
window.addEventListener("DOMContentLoaded", () => {
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  function createScrollTrigger(triggerElement, timeline) {
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top bottom",
      onLeaveBack: () => {
        timeline.progress(0);
        timeline.pause();
      },
    });
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 60%",
      onEnter: () => timeline.play(),
    });
  }

  $("[words-slide-up]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".word"), {
      opacity: 0,
      yPercent: 100,
      duration: 0.5,
      ease: "back.out(2)",
      stagger: { amount: 0.5 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[words-rotate-in]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.set($(this).find(".word"), { transformPerspective: 1000 });
    tl.from($(this).find(".word"), {
      rotationX: -90,
      duration: 0.6,
      ease: "power2.out",
      stagger: { amount: 0.6 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[words-slide-from-right]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".word"), {
      opacity: 0,
      x: "1em",
      duration: 0.6,
      ease: "power2.out",
      stagger: { amount: 0.2 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[letters-slide-up]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".char"), {
      yPercent: 100,
      duration: 0.2,
      ease: "power1.out",
      stagger: { amount: 0.6 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[letters-slide-down]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".char"), {
      yPercent: -120,
      duration: 0.3,
      ease: "power1.out",
      stagger: { amount: 0.7 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[letters-fade-in]:not([letters-sync='hero'])").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".char"), {
      opacity: 0,
      duration: 1,
      ease: "power1.out",
      stagger: { amount: 0.8 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[letters-fade-in-random]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".char"), {
      opacity: 0,
      duration: 0.05,
      ease: "power1.out",
      stagger: { amount: 0.4, from: "random" },
    });
    createScrollTrigger($(this), tl);
  });

  $("[scrub-each-word]").each(function () {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "top 90%",
        end: "top center",
        scrub: true,
      },
    });
    tl.from($(this).find(".word"), {
      opacity: 0.2,
      duration: 0.2,
      ease: "power1.out",
      stagger: { each: 0.4 },
    });
  });

  // Hero Profile Heading
  const $hero = $(".hero-profile-heading[text-split]");
  if ($hero.length) {
    const heroLines = $hero.find(".line");
    gsap.set(heroLines, { overflow: "hidden", display: "block" });

    const heroWords = $hero.find(".word");
    gsap.set(heroWords, { yPercent: 110, opacity: 0, display: "inline-block" });

    const tlHero = gsap.timeline({
      scrollTrigger: {
        trigger: $hero[0],
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tlHero.to(heroWords, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: "expo.out",
      stagger: { amount: 0.9, from: "start" },
    });
  }

  gsap.set("[text-split]", { opacity: 1 });
});

// =====================================================
// 15. Process Page — Hero Motion
// 功能：Process 頁面的 Hero 動畫
// =====================================================
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  const root = document.querySelector(".hero-process");
  const frame = document.querySelector(".hero-frame");
  const img = document.querySelector(".hero-image-process");
  const subtitle = document.querySelector(".intro-subtitle");
  const heroText = document.querySelector(
    ".intro-subtitle .paragraph-process-slide[letters-sync='hero'][letters-fade-in]"
  );
  const heroChars = heroText ? heroText.querySelectorAll(".char") : null;

  if (!root || !frame || !img) return;

  Object.assign(frame.style, {
    transformOrigin: "right center",
    willChange: "transform",
    backfaceVisibility: "hidden",
  });

  Object.assign(img.style, {
    objectFit: "contain",
    objectPosition: "right center",
    transformOrigin: "right center",
    willChange: "transform",
    backfaceVisibility: "hidden",
  });

  gsap.set(root, { "--t": "0vh", "--r": "0vw", "--b": "0vh", "--l": "0vw" });

  function getCoverScale() {
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    const contain = Math.min(fw / nw, fh / nh);
    const cover = Math.max(fw / nw, fh / nh);
    return (cover / contain) * 1.015;
  }

  function build() {
    gsap.set(img, { scale: getCoverScale(), yPercent: 0, force3D: true });

    const tl = gsap.timeline({
      defaults: { ease: "power2.out", overwrite: "auto" },
    });

    tl.fromTo(
      [frame, subtitle],
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power1.out",
        onComplete: () => {
          frame.style.pointerEvents = "auto";
        },
      },
      0
    );

    tl.to(
      root,
      {
        "--t": "20vh",
        "--r": "1vw",
        "--b": "0vh",
        "--l": "36vw",
        duration: 0.9,
        ease: "power3.out",
      },
      0.1
    );

    tl.to(
      img,
      {
        scale: 1,
        yPercent: 12,
        duration: 0.9,
        ease: "power3.out",
        force3D: true,
      },
      0.1
    );

    if (heroChars && heroChars.length) {
      tl.from(
        heroChars,
        {
          opacity: 0,
          duration: 1,
          ease: "power1.out",
          stagger: { amount: 0.8 },
        },
        0.35
      );
    }

    ScrollTrigger.create({
      trigger: ".hero-process",
      start: "top top",
      toggleActions: "play none none none",
      once: true,
      animation: tl,
      immediateRender: false,
    });

    ScrollTrigger.create({
      trigger: ".hero-process",
      start: "top top",
      end: "+=360vh",
      pin: true,
      scrub: false,
      anticipatePin: 1,
      onEnterBack: () => {
        gsap.set(root, {
          "--t": "20vh",
          "--r": "1vw",
          "--b": "0vh",
          "--l": "36vw",
        });
        gsap.set(img, { scale: 1, yPercent: 12 });
      },
    });
  }

  build();

  let rid;
  window.addEventListener("resize", () => {
    clearTimeout(rid);
    rid = setTimeout(() => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.killTweensOf([root, frame, img, subtitle]);
      build();
      ScrollTrigger.refresh();
    }, 150);
  });
});

// =====================================================
// 16. Process Page — Card Stacking Effect (Desktop Only)
// 功能：Process 頁面的卡片堆疊動畫 (手機版停用)
// =====================================================
function initProcessStacking() {
  // [新加] 檢查螢幕闊度：如果細過 992px (Tablet/Mobile)，直接跳出，唔執行動畫
  if (window.innerWidth < 992) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = document.querySelectorAll(".process-stages-panel");

  cards.forEach((card, index) => {
    const nextCard = cards[index + 1];
    if (!nextCard) return;

    gsap.fromTo(
      card,
      { scale: 1, filter: "brightness(1) blur(0px)", y: 0 },
      {
        scale: 0.85,
        filter: "brightness(0.6) blur(8px)",
        y: -80,
        transformOrigin: "center top",
        force3D: true,
        willChange: "transform, filter",

        ease: "none",

        scrollTrigger: {
          trigger: nextCard,

          // ★ 修改 2：由 "top bottom" 改為 "top 85%" (或者 80%)
          // 舊意思：下一張卡掂到底部 (0%) 就開始。
          // 新意思：下一張卡升到畫面底部上少少 (15-20% 位置) 先開始。
          // 咁樣可以延遲個動畫，唔會一見到個頂就 Blur。
          start: "top 85%",

          end: "top top",
          scrub: 1,
        },
      }
    );
  });
}

window.addEventListener("load", () => {
  // 延遲少少執行，確保 Webflow 佈局載入完成
  setTimeout(initProcessStacking, 100);
});

// =====================================================
// 17. Process Page — Anchor Scroll (Optimized)
// 功能：Process 頁面的 Anchor 顯示邏輯 + 優化返頂動畫
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  if (!document.body.classList.contains("body-process")) return;

  gsap.registerPlugin(ScrollTrigger);

  const ANCHOR = document.querySelector(".anchor-scroll");
  const PARALLAX = document.querySelector(".process-parallax-wrap");
  const STAGES = document.querySelector(".process-stages-wrap");
  if (!ANCHOR || !STAGES) return;

  // ============================================
  // 初始設定
  // ============================================
  gsap.set(ANCHOR, {
    autoAlpha: 0,
    pointerEvents: "none",
    willChange: "opacity,transform",
  });

  let isVisible = false; // ← 追蹤狀態，避免重複動畫

  // ============================================
  // 顯示/隱藏函數（加入狀態檢查）
  // ============================================
  const showAnchor = () => {
    if (isVisible) return; // 已經顯示緊就唔做嘢
    isVisible = true;

    gsap.killTweensOf(ANCHOR); // 停止所有進行中既動畫
    gsap.to(ANCHOR, {
      autoAlpha: 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
      onStart: () => {
        ANCHOR.style.pointerEvents = "auto";
      },
    });
  };

  const hideAnchor = () => {
    if (!isVisible) return; // 已經隱藏緊就唔做嘢
    isVisible = false;

    gsap.killTweensOf(ANCHOR); // 停止所有進行中既動畫
    gsap.to(ANCHOR, {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        ANCHOR.style.pointerEvents = "none";
      },
    });
  };

  // ============================================
  // ScrollTrigger 控制 Anchor 顯示
  // ============================================

  // 1. 主要控制：基於 Stages Section
  ScrollTrigger.create({
    trigger: STAGES,
    start: "top top",
    end: "bottom top",
    onEnter: showAnchor,
    onEnterBack: showAnchor,
    onLeaveBack: hideAnchor,
  });

  // 2. 頁頂控制：確保頁頂時一定隱藏
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const scrollY = self.scroll();

      // ★ 嚴格判斷：Y <= 50 就隱藏（比之前 <= 1 更寬鬆）
      if (scrollY <= 50) {
        hideAnchor();
      }
    },
  });

  // 3. Parallax Section 控制（如果有）
  if (PARALLAX) {
    ScrollTrigger.create({
      trigger: PARALLAX,
      start: "top top",
      end: "bottom top",
      onEnterBack: hideAnchor,
    });
  }

  // ============================================
  // ★ 優化返頂動畫（快速 + Smooth）
  // ============================================
  ANCHOR.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 方法 1：固定時間（推薦）
    // 無論距離幾遠，都用固定 1.2 秒返頂
    // 呢個方法最 smooth 同快速
    if (window.lenis) {
      // 如果用緊 Lenis smooth scroll
      window.lenis.scrollTo(0, {
        duration: 1.2, // ← 固定 1.2 秒（可調）
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      });
    } else {
      // 原生 GSAP scrollTo
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: true },
        duration: 1.2, // ← 固定 1.2 秒
        ease: "power3.out", // ← Smooth easing
        overwrite: "auto",
      });
    }

    /* 
    // 方法 2：根據距離動態調整（可選）
    // 距離遠 → 時間長啲
    // 距離近 → 時間短啲
    const currentScroll = window.scrollY || window.pageYOffset;
    const distance = currentScroll;
    
    // 計算時間：每 1000px 約 0.4 秒，最少 0.8 秒，最多 2 秒
    const duration = Math.min(2, Math.max(0.8, distance / 1000 * 0.4));
    
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        duration: duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      gsap.to(window, {
        scrollTo: { y: 0 },
        duration: duration,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
    */
  });

  // ============================================
  // 初始化檢查（Load 時檢查一次）
  // ============================================
  window.addEventListener("load", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY <= 50) {
      hideAnchor();
    }
  });
});

// =====================================================
// 18. Universal Anchor Scroll（全站通用 back-to-top）
// 功能：所有有 .anchor-scroll 嘅頁面都可用
//       • scroll 超過 300px → 顯示按鈕
//       • click / touch → 0.5 秒快速返頂（手機綁 touchend）
// 備註：Process 頁有自己嘅 Section 19 處理，呢度跳過避免重複
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  if (document.body.classList.contains("body-process")) return;

  var anchor = document.querySelector(".anchor-scroll");
  if (!anchor) return;

  gsap.set(anchor, { autoAlpha: 0, pointerEvents: "none" });
  var isVisible = false;

  function showAnchor() {
    if (isVisible) return;
    isVisible = true;
    gsap.killTweensOf(anchor);
    gsap.to(anchor, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
      onStart: function () {
        anchor.style.pointerEvents = "auto";
      },
    });
  }
  function hideAnchor() {
    if (!isVisible) return;
    isVisible = false;
    gsap.killTweensOf(anchor);
    gsap.to(anchor, {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.out",
      onComplete: function () {
        anchor.style.pointerEvents = "none";
      },
    });
  }

  ScrollTrigger.create({
    start: 300,
    end: "max",
    onEnter: showAnchor,
    onLeaveBack: hideAnchor,
  });

  function scrollToTop(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        duration: 0.5,
        easing: function (t) {
          return 1 - Math.pow(1 - t, 4);
        },
        force: true,
      });
    } else {
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: false },
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }
  anchor.addEventListener("click", scrollToTop);
  anchor.addEventListener("touchend", scrollToTop, { passive: false });
});

// =====================================================
// 19. Profile Page — Hero Scroll Parallax (Projects Page Style)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("body-profile")) return;

  gsap.registerPlugin(ScrollTrigger);

  const heroWrap = document.querySelector(".hero-profile-wrap");
  const heroImg = document.querySelector(".hero-profile-image");
  const heroOverlay = document.querySelector(".hero-profile-overlay");
  const heroCaption = document.querySelector(".hero-profile-caption");

  if (!heroWrap) return;

  // 1. 背景圖片視差 (Parallax)
  // 向下移動，速度慢於 Scroll
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: heroWrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // 2. Overlay 變暗
  if (heroOverlay) {
    gsap.to(heroOverlay, {
      opacity: 0.6,
      ease: "none",
      scrollTrigger: {
        trigger: heroWrap,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // 3. Caption 入場效果 (Optional)
  // 模仿 Projects Page，文字可能會有一點視差或者淡入
  if (heroCaption) {
    gsap.from(heroCaption, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: heroCaption,
        start: "top 90%", // 當 Caption 進入畫面底部時
        toggleActions: "play none none reverse",
      },
    });
  }
});

// =====================================================
// 20. Studio Page — Team Member Hover
// 功能：Studio 頁面成員列表的 Hover 連動效果
// =====================================================
window.addEventListener("load", function () {
  const memberRows = gsap.utils.toArray(".studio-name-row[data-member]");
  const photoItems = gsap.utils.toArray(
    ".studio-image-column[data-member-photo]"
  );

  console.log(
    "team hover (by data):",
    memberRows.length,
    "rows /",
    photoItems.length,
    "photos"
  );

  if (!memberRows.length || !photoItems.length) return;

  memberRows.forEach((row) => {
    const texts = row.querySelectorAll(".members-role, .members-name");
    gsap.set(texts, { opacity: 0.25 });
  });

  gsap.set(photoItems, { autoAlpha: 0 });

  const firstKey = memberRows[0].getAttribute("data-member");
  setActiveByKey(firstKey);

  memberRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      const key = row.getAttribute("data-member");
      setActiveByKey(key);
    });
  });

  function setActiveByKey(key) {
    memberRows.forEach((row) => {
      const rowKey = row.getAttribute("data-member");
      const texts = row.querySelectorAll(".members-role, .members-name");
      gsap.to(texts, {
        opacity: rowKey === key ? 1 : 0.25,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    photoItems.forEach((item) => {
      const itemKey = item.getAttribute("data-member-photo");
      gsap.to(item, {
        autoAlpha: itemKey === key ? 1 : 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }
});

// =====================================================
// 21. Universal Line Reveal（GSAP SplitText + Mask）
// 功能：全站文字入場逐行 mask reveal
//   - 通用選取 h1-h6, p，唔需要手動加 class
//   - 用 GSAP 官方 SplitText，mask:"lines" 自動加遮罩容器
//   - document.fonts.ready 先拆行，避免字體未載入時位置跳動
//   - ScrollTrigger once:true → 每個元素只播一次
//   - ★ 排除清單：所有自己有獨立動畫系統嘅區域，唔可以同時
//     畀 SplitText 處理，否則會夾埋一齊搞爛 DOM / 搶走控制權
// =====================================================
document.fonts.ready.then(() => {
  gsap.registerPlugin(SplitText, ScrollTrigger);

  const selectorString = "h1, h2, h3, h4, h5, h6, p";
  let elements = gsap.utils.toArray(selectorString);

  // ★ 關鍵過濾 (Exclusions)
  //   注意：所有 return false 必須喺最後 return true 之前，
  //   否則後面嘅排除會變成永遠執行唔到嘅死 code
  elements = elements.filter((el) => {
    // 剔除 Nav Bar
    if (el.closest(".nav-bar")) return false;

    // 剔除 Footer
    if (el.closest(".footer-section")) return false;

    // 剔除 Testimonials Aside（自己有獨立 hover reveal）
    if (el.closest(".testimonials-aside-wrap")) return false;

    // ★ 剔除 Review Carousel（自己一套獨立、可重複播放嘅拆行系統）
    if (el.closest(".review-wrap")) return false;
    if (el.classList.contains("review-text")) return false;

    // ★ 剔除 Featured Projects 常駐文字欄（唔需要拆行reveal）
    if (el.closest(".fp-static-info")) return false;
    if (el.closest(".fp-static-content")) return false;

    // ★ 剔除 Services List（.service-name 有獨立 scroll 變色 / hover 系統）
    if (el.closest(".services-list")) return false;

    // ★★ 剔除 Project Info Row（Home fp-card / Profile testimonials）——
    //    靠 Section 33 hover popup 控制顯示，唔可以畀 SplitText
    //    scroll-reveal 搶走控制權（否則一 scroll 到就自己彈出嚟）★★
    if (el.closest(".project-info-row")) return false;
    if (el.closest(".fp-card")) return false;

    // 剔除 Button Wrapper
    if (el.closest(".btn-wrapper")) return false;

    // 剔除 Video
    if (
      el.classList.contains("cover-about-video") ||
      el.closest(".cover-about-video")
    )
      return false;

    // 手動剔除（想邊個元素完全唔做 masking，喺 Designer 加呢個 class）
    if (el.closest(".no-line-reveal")) return false;

    // 剔除 Process FAQ 隱藏 CMS 來源（.lfq embed 會讀佢原本嘅 HTML）
    if (el.closest(".faq-wrapper") || el.closest(".lfq")) return false;

    // 剔除 Projects 頁卡片文字（由 Section 23 連圖一齊 reveal）
    if (el.closest(".project-card-item")) return false;

    return true;
  });

  console.log("[LineReveal] Found elements:", elements.length);

  elements.forEach((el) => {
    if (el.dataset.linesSplit === "true") return;
    if (!el.textContent.trim()) return;

    SplitText.create(el, {
      type: "lines",
      mask: "lines", // ★ 官方 mask，自動加遮罩，唔使自己寫 overflow:hidden
      autoSplit: false, // 唔响應 resize 自動重拆，確保動畫只播一次
      onSplit(self) {
        // CTA heading 特殊對齊（第一行靠左、其餘靠右）
        // 直接用 line 嘅 parentElement（即 mask wrapper）落 inline style，
        // 唔靠估 SplitText 內部生成嘅 class 名，100% 準確
        if (el.classList.contains("cta-heading")) {
          self.lines.forEach((line, index) => {
            const maskEl = line.parentElement;
            if (maskEl) {
              maskEl.style.width = "100%";
              maskEl.style.textAlign = index === 0 ? "left" : "right";
            }
          });
        }

        return gsap.from(self.lines, {
          yPercent: 110,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      },
    });

    el.dataset.linesSplit = "true";
  });
});

// =====================================================
// 23. Projects Page — Filter & Hover
// 功能：專案頁面的篩選功能與卡片 Hover 動畫
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  const CONFIG = {
    // 這裡改用 Class 選擇器以支援多個 Input
    // searchId 移除，改用下面的 searchInputs
    catId: "category-select",
    sizeId: "size-select",
    itemClass: ".project-card-item",
    imgWrapClass: ".project-image-wrap",
    imgClass: ".project-img",
    overlayClass: ".hover-overlay",
    titleSelector: ".projects-name",
  };

  // [修改 1] 選取所有搜尋框 (Desktop ID + Mobile Class)
  const searchInputs = document.querySelectorAll(
    "#search-input, .search-input"
  );

  const catFilter = document.getElementById(CONFIG.catId);
  const sizeFilter = document.getElementById(CONFIG.sizeId);
  const items = document.querySelectorAll(CONFIG.itemClass);

  // --- Filter 選項（由 CMS 數據自動生成）---
  // Style 跟 CMS「Design Style」欄；Size 跟「Project Size」參照。
  // 只會列出真係有 project 嘅選項，所以每個選項都搵到嘢。
  // 想加新 style：喺 CMS Design Style 欄打新名，有兩個或以上 project
  // 就會自動出現（排喺下面固定次序之後）。
  const STYLE_ORDER = [
    "Modern French",
    "Mid-Century & Eclectic",
    "Japandi & Scandinavian",
    "Contemporary",
  ];
  const SIZE_ORDER = [
    "Under 1,000 sq.ft",
    "1,000–1,500 sq.ft",
    "1,500 sq.ft & Above",
  ];
  const buildOptions = (sel, allLabel, order, attr) => {
    if (!sel) return;
    const count = {};
    items.forEach((it) => {
      const v = (it.getAttribute(attr) || "").trim();
      if (v) count[v] = (count[v] || 0) + 1;
    });
    const list = order.filter((v) => count[v]);
    Object.keys(count)
      .filter((v) => !order.includes(v))
      .sort()
      .forEach((v) => list.push(v));
    sel.innerHTML = "";
    const add = (value, text) => {
      const o = document.createElement("option");
      o.value = value;
      o.textContent = text;
      sel.appendChild(o);
    };
    add("All", allLabel);
    list.forEach((v) => add(v, v));
  };
  buildOptions(catFilter, "All Styles", STYLE_ORDER, "data-category");
  buildOptions(sizeFilter, "All Sizes", SIZE_ORDER, "data-size");
  if (catFilter) catFilter.setAttribute("aria-label", "Filter by style");
  if (sizeFilter) sizeFilter.setAttribute("aria-label", "Filter by size");

  // --- 初始動畫：每張卡（圖 + 名 + 呎數）一齊 reveal ---
  // 圖由上下向中間打開（clip-path），成張卡同時輕輕升上嚟，
  // 文字只係慢少少淡入，同一個節奏，唔再逐行分開出。
  // 用 ScrollTrigger.batch：同一行一齊入畫面嘅卡，左至右相隔 0.12 秒。
  if (items.length > 0) {
    items.forEach((item) => {
      const wrap = item.querySelector(CONFIG.imgWrapClass);
      const info = item.querySelectorAll(
        ".project-info-wrap, .project-info-wrap-mobile"
      );
      gsap.set(item, { opacity: 0, y: 40 });
      if (wrap) gsap.set(wrap, { clipPath: "inset(8% 0% 8% 0%)" });
      if (info.length) gsap.set(info, { opacity: 0, y: 12 });
    });
    ScrollTrigger.batch(items, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        batch.forEach((item, i) => {
          const wrap = item.querySelector(CONFIG.imgWrapClass);
          const info = item.querySelectorAll(
            ".project-info-wrap, .project-info-wrap-mobile"
          );
          const tl = gsap.timeline({ delay: i * 0.12 });
          tl.to(item, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 0);
          if (wrap)
            tl.to(
              wrap,
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.out" },
              0
            );
          if (info.length)
            tl.to(info, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.18);
        });
      },
    });
  }

  // --- Hover Effect ---
  items.forEach((item) => {
    const img = item.querySelector(CONFIG.imgClass);
    const overlay = item.querySelector(CONFIG.overlayClass);
    if (img) gsap.set(img, { scale: 1 });
    if (overlay) gsap.set(overlay, { opacity: 0 });

    item.addEventListener("mouseenter", () => {
      if (img) gsap.to(img, { scale: 1.1, duration: 0.5, ease: "power2.out" });
      if (overlay)
        gsap.to(overlay, { opacity: 1, duration: 0.3, ease: "power1.out" });
    });

    item.addEventListener("mouseleave", () => {
      if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.out" });
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    });
  });

  // --- Filter Logic ---
  function runFilter() {
    // [修改 2] 獲取當前輸入值 (隨便拿一個 Input 的值，因為我們會同步)
    // 如果找不到 input，就預設空字串
    const searchValue =
      searchInputs.length > 0 ? searchInputs[0].value.toLowerCase().trim() : "";

    const catValue = catFilter ? catFilter.value : "All";
    const sizeValue = sizeFilter ? sizeFilter.value : "All";

    items.forEach((item) => {
      const itemCat = (item.getAttribute("data-category") || "").trim();
      const itemSize = (item.getAttribute("data-size") || "").trim();
      const titleEl = item.querySelector(CONFIG.titleSelector);
      const itemTitle = titleEl ? titleEl.innerText.toLowerCase() : "";

      const matchSearch = itemTitle.includes(searchValue);
      const matchCat = catValue === "All" || (itemCat && itemCat === catValue);
      const matchSize =
        sizeValue === "All" || (itemSize && itemSize === sizeValue);

      if (matchSearch && matchCat && matchSize) {
        if (item.style.display === "none") {
          item.style.display = "block";
          // make sure a card that was never scrolled to is fully revealed
          gsap.set(item.querySelectorAll(".project-info-wrap, .project-info-wrap-mobile"), { opacity: 1, y: 0 });
          const w0 = item.querySelector(CONFIG.imgWrapClass);
          if (w0) gsap.set(w0, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.fromTo(
            item,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        }
      } else {
        if (item.style.display !== "none") {
          gsap.to(item, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            onComplete: () => {
              item.style.display = "none";
            },
          });
        }
      }
    });

    // 觸發 ScrollTrigger 刷新，確保佈局正確
    ScrollTrigger.refresh();
  }

  // --- Event Listeners ---

  // [修改 3] 為所有 Input 綁定事件 & 數值同步
  if (searchInputs.length > 0) {
    searchInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const val = e.target.value;
        // 同步所有搜尋框的值 (Desktop 打字 Mobile 都會見到)
        searchInputs.forEach((el) => {
          if (el !== e.target) el.value = val;
        });
        runFilter();
      });
    });
  }

  if (catFilter) catFilter.addEventListener("change", runFilter);
  if (sizeFilter) sizeFilter.addEventListener("change", runFilter);

  // 公開 runFilter 給其他函數調用
  window.runProjectFilter = runFilter;
});

// =====================================================
// =====================================================
// 24. Featured Projects — Reveal & Hover Effects
// 功能：首頁 Featured Projects 入場動畫 + Hover 互動
// =====================================================
// FEATURED PROJECTS - HYBRID ANIMATION SYSTEM
// 1. Dissolve Entry (All Devices)
// 2. Mask Reveal & Hover (Desktop Only)
// =====================================================
function initProjectAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // 選取所有項目
  const projects = document.querySelectorAll(".featured-project-item");
  if (projects.length === 0) return;

  // ========================================================
  // PART 1: DISSOLVE ENTRY (全平台通用 - 淡入效果)
  // ========================================================
  // 使用 Batch，令 Grid Items 一個接一個順滑淡入
  // 配合 Lenis，我哋用較長嘅 duration 同 smooth ease
  ScrollTrigger.batch(".featured-project-item", {
    start: "top 85%", // 項目進入畫面底部 15% 時觸發
    once: true, // 只做一次，唔會因為 Scroll Back 而消失

    onEnter: (batch) => {
      // ★ 手機版（≤991px）：純 opacity 淡入，唔用 Y 位移
      //   原因：y:80 + stagger 喺手機單欄佈局期間造成視覺重疊
      //   桌面版維持原有 y:80 效果
      var isMobile = window.matchMedia("(max-width: 991px)").matches;
      gsap.fromTo(
        batch,
        {
          autoAlpha: 0,
          y: isMobile ? 0 : 80,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          stagger: isMobile ? 0.15 : 0.2,
          overwrite: true,
        }
      );
    },
  });

  // ========================================================
  // PART 2: RESPONSIVE LOGIC (Mask & Hover 區分)
  // ========================================================
  ScrollTrigger.matchMedia({
    // --- A. DESKTOP 邏輯 (>= 992px) ---
    // 包含：Mask Reveal + Image Scale + Hover Effects
    "(min-width: 992px)": function () {
      projects.forEach((project) => {
        const image = project.querySelector(".project-image");
        const revealMask = project.querySelector(".project-reveal-mask");
        const imageWrapper = project.querySelector(".project-image-wrapper");
        const overlay = project.querySelector(".hover-overlay");

        // 1. 設定初始狀態
        if (revealMask)
          gsap.set(revealMask, {
            transformOrigin: "bottom center",
            display: "block",
          });
        if (overlay)
          gsap.set(overlay, {
            opacity: 0,
            backgroundColor: "#000000",
            display: "block",
          });

        // 2. Mask Reveal 動畫 timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: project,
            start: "top 75%", // 當 Item 去到畫面 75% 處開始 Mask 動畫
            toggleActions: "play none none reverse",
          },
        });

        // 白色遮罩向上收縮
        if (revealMask) {
          tl.to(revealMask, { scaleY: 0, duration: 1.8, ease: "power3.inOut" });
        }
        // 圖片由大變正常 (視差感)
        if (image) {
          tl.fromTo(
            image,
            { scale: 1.4 },
            { scale: 1, duration: 2.0, ease: "power3.out" },
            "<"
          );
        }

        // 3. Hover Interaction
        if (imageWrapper) {
          imageWrapper.addEventListener("mouseenter", () => {
            if (image)
              gsap.to(image, {
                scale: 1.05,
                duration: 1.5,
                ease: "power2.out",
              });
            if (overlay)
              gsap.to(overlay, {
                opacity: 0.1,
                duration: 0.8,
                ease: "power2.out",
              });
          });

          imageWrapper.addEventListener("mouseleave", () => {
            if (image)
              gsap.to(image, { scale: 1, duration: 1.2, ease: "power2.out" });
            if (overlay)
              gsap.to(overlay, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
              });
          });
        }
      });
    },

    // --- B. MOBILE 邏輯 (< 992px) ---
    // 包含：移除 Mask，移除 Hover，確保只睇到 Part 1 嘅淡入
    "(max-width: 991px)": function () {
      projects.forEach((project) => {
        const image = project.querySelector(".project-image");
        const revealMask = project.querySelector(".project-reveal-mask");
        const overlay = project.querySelector(".hover-overlay");

        // 強制隱藏 Mask 同 Overlay，以免遮住張圖
        if (revealMask) gsap.set(revealMask, { display: "none" });
        if (overlay) gsap.set(overlay, { display: "none" });

        // 確保圖片比例正常
        if (image) gsap.set(image, { scale: 1 });
      });
    },
  });
}

// 執行
initProjectAnimations();

// =====================================================
// 25. Featured Projects — 手機版圖片載入後重算位置
// 原因：initProjectAnimations 喺圖片載入前執行，
//       版面尺寸未定 → ScrollTrigger 位置計錯
// 對策：window.load 後重新計算（唔清除動畫，只 refresh）
// =====================================================
window.addEventListener("load", function () {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
  });
});

// =====================================================
// 26. Smart Page Loader
//   - 首次載入：slogan SplitText line-reveal（跟 Section 21）+ 頂部 bar + 右下細 spinner
//   - 內部轉頁：去 spinner，overlay 淡入蓋上 → 新頁 Section 21 自動 reveal
// =====================================================
function initSmartLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) {
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
    return;
  }

  const progressBar = document.querySelector(".loader-progress-bar");
  const slogan = document.querySelector(
    ".loader-slogan .intro-subtitle-heading"
  );
  const spinner = document.querySelector(".loader-spinner-wrap");
  const content = document.querySelector(".loader-content");

  let isExiting = false;
  let sloganSplit = null;

  // --- 離場動畫 ---
  const playExitAnimation = () => {
    if (isExiting) return;
    isExiting = true;

    if (progressBar) {
      gsap.to(progressBar, {
        width: "100%",
        duration: 0.3,
        ease: "power2.out",
      });
    }

    const exitTL = gsap.timeline({ delay: 0.1 });
    exitTL
      .to(content, { opacity: 0, y: -15, duration: 0.5, ease: "power2.in" })
      .to(loader, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          loader.style.display = "none";
          gsap.set("body", { opacity: 1, visibility: "visible" });
          document.body.style.opacity = "1";
          document.body.style.visibility = "visible";
          if (progressBar) gsap.set(progressBar, { width: "0%", opacity: 0 });
          ScrollTrigger.refresh();
          if (window.location.hash && window.lenis) {
            setTimeout(() => {
              const target = document.querySelector(window.location.hash);
              if (target) window.lenis.scrollTo(target, { immediate: true });
            }, 100);
          }
        },
      });
  };

  // --- Full Intro（首次載入）：slogan line-reveal ---
  const playFullIntro = () => {
    if (spinner) gsap.set(spinner, { opacity: 1 });

    if (progressBar) {
      gsap.set(progressBar, { opacity: 1, width: "0%" });
      gsap.to(progressBar, { width: "85%", duration: 2, ease: "power2.out" });
    }

    const loaderSlogan = document.querySelector(".loader-slogan");

    // Slogan SplitText line-reveal（跟 Section 21 參數）
    if (slogan && window.SplitText) {
      sloganSplit = SplitText.create(slogan, {
        type: "lines",
        mask: "lines",
        autoSplit: false,
        onSplit: (self) => {
          // 拆完行、set 好起始位置後，先顯示容器（防閃現）
          if (loaderSlogan) gsap.set(loaderSlogan, { opacity: 1 });
          return gsap.from(self.lines, {
            yPercent: 110,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.08,
          });
        },
      });
    } else if (slogan) {
      // Fallback（冇 SplitText）：容器先隱藏，再 fade 上嚟
      if (loaderSlogan) gsap.set(loaderSlogan, { opacity: 1 });
      gsap.fromTo(
        slogan,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }

    const checkLoad = () => {
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        return Promise.resolve();
      }
      return new Promise((resolve) => window.addEventListener("load", resolve));
    };
    const minDelay = new Promise((resolve) => setTimeout(resolve, 600));

    Promise.all([checkLoad(), minDelay]).then(() => {
      playExitAnimation();
    });

    setTimeout(() => {
      if (!isExiting) playExitAnimation();
    }, 3500);
  };

  // --- Simple Intro（內部轉頁）：純 overlay，冇 spinner、冇 slogan ---
  const playSimpleIntro = () => {
    loader.style.setProperty("background-color", "#f0e8dd", "important"); // ★ 內部轉頁色板：同頁面底色一樣（Brand Light）
    document.documentElement.style.backgroundColor = "#f0e8dd";
    if (slogan) gsap.set(slogan, { opacity: 0 });
    if (progressBar) gsap.set(progressBar, { opacity: 0 });
    if (spinner) gsap.set(spinner, { opacity: 0 }); // ★ 轉頁唔要 spinner

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      playExitAnimation();
    } else {
      window.addEventListener("load", playExitAnimation);
      setTimeout(playExitAnimation, 1500);
    }
  };

  // --- 判斷 ---
  try {
    const isInternal = sessionStorage.getItem("internal-transition");
    if (isInternal) {
      playSimpleIntro();
      sessionStorage.removeItem("internal-transition");
    } else {
      playFullIntro();
    }
  } catch (e) {
    playFullIntro();
  }

  // --- 連結點擊：內部轉頁 overlay 淡入（冇 spinner）---
  const links = document.querySelectorAll("a");

  // ★ Prefetch：滑鼠移到 / 手指按住內部連結就先下載下一頁 HTML，撳落去轉頁快好多
  const prefetched = new Set();
  const prefetch = (link) => {
    const href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || link.target === "_blank") return;
    let url;
    try {
      url = new URL(href, location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    if (prefetched.has(url.href)) return;
    prefetched.add(url.href);
    const l = document.createElement("link");
    l.rel = "prefetch";
    l.href = url.href;
    document.head.appendChild(l);
  };
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => prefetch(link), { passive: true });
    link.addEventListener("touchstart", () => prefetch(link), { passive: true });
  });

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        target === "_blank" ||
        href === window.location.href ||
        link.classList.contains("no-transition")
      ) {
        return;
      }
      e.preventDefault();
      try {
        sessionStorage.setItem("internal-transition", "true");
      } catch (e) {}
      // ★ 撳連結即刻將最底層 html 變 Brand Light（reload 期間唔會閃色）
      document.documentElement.style.backgroundColor = "#f0e8dd";

      loader.style.display = "flex";
      loader.style.setProperty("background-color", "#f0e8dd", "important"); // ★ 內部轉頁：淡入頁面底色
      gsap.set(loader, { opacity: 0 });
      gsap.set(content, { opacity: 1, y: 0 });
      if (slogan) gsap.set(slogan, { opacity: 0 });
      if (progressBar) gsap.set(progressBar, { opacity: 0 });
      if (spinner) gsap.set(spinner, { opacity: 0 }); // ★ 冇 spinner

      gsap.to(loader, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          window.location.href = href;
        },
      });
    });
  });
}

initSmartLoader();

// Safari Back Button Cache Fix
window.onpageshow = function (event) {
  if (event.persisted) {
    const loader = document.querySelector(".page-loader");
    if (loader) loader.style.display = "none";
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
  }
};

// =====================================================
// 27. Footer — Real-time Clock & Status (HK Time)
// 功能：頁尾顯示香港時間及營業狀態
// =====================================================
function initFooterTime() {
  const timeSpan = document.getElementById("js-time");
  const stateSpan = document.getElementById("js-state");
  if (!timeSpan || !stateSpan) return;

  function updateTime() {
    const timeZone = "Asia/Hong_Kong";
    const openHour = 10;
    const openMinute = 0;
    const closeHour = 18;

    const now = new Date();

    const timeString = now.toLocaleTimeString("en-US", {
      timeZone: timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const hkDate = new Date(
      now.toLocaleString("en-US", { timeZone: timeZone })
    );
    const day = hkDate.getDay();
    const currentHour = hkDate.getHours();
    const currentMinute = hkDate.getMinutes();

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60;

    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours =
      currentTotalMinutes >= openTotalMinutes &&
      currentTotalMinutes < closeTotalMinutes;

    const isOpen = isWeekday && isBusinessHours;

    timeSpan.innerText = timeString;
    stateSpan.innerText = isOpen ? "OPEN" : "CLOSED";
  }

  updateTime();
  setInterval(updateTime, 1000);
}
initFooterTime();

// =====================================================
// 28. Footer — Auto Copyright Year
// 功能：自動更新版權年份
// =====================================================
function initCurrentYear() {
  const yearSpan = document.querySelector("[data-current-year]");
  if (yearSpan) yearSpan.innerText = new Date().getFullYear();
}
initCurrentYear();

// =====================================================
// 29. Smooth Scroll (Lenis) & Hero Scroll Parallax
// 功能：Lenis 平滑捲動與 Hero 區域視差動畫
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const resizeObserver = new ResizeObserver(() => {
    lenis.resize();
  });
  resizeObserver.observe(document.body);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      // href="#" (e.g. Contact page links handled by other scripts) is not a scroll target
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      try {
        lenis.scrollTo(href);
      } catch (err) {}
    });
  });

  window.lenis = lenis;
});

// Hero Parallax Animations
gsap.to(".hero-project-thumbnail", {
  y: "20vh",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-scroll",
    start: "top top",
    end: "bottom top",
    scrub: 1,
  },
});

gsap.to(".hero-image-wrap", {
  y: "-15vh",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-scroll",
    start: "top top",
    end: "bottom top",
    scrub: 1,
  },
});

gsap.to(".hero-project-overlay", {
  opacity: 0.6,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-scroll",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});

// =====================================================
// 30. Project Gallery Reveal + More Strip + Lightbox
//     (FINAL 完整版，包含全部 fix)
//
// 功能：
//   A. 主 Gallery 圖片 Scroll Reveal（品牌緩動 + Batch Stagger）
//   B. JS 比例修正（inline setProperty 最高優先）
//   C. "More of [Project]" 橫向拖曳 Strip
//      ┣ 主 Gallery 超過 MAIN_LIMIT 張的相自動入 strip
//      ┣ "View more images →" 按鈕 click → 橫向捲動預覽
//      ┣ 鼠標拖曳 + 動量慣性捲動
//      ┣ Glass DRAG cursor hint（跟 VIEW cursor 一致）
//      ┣ RAF 連續偵測（徹底防止 cursor 卡住）
//      ┗ 點擊圖片 → Lightbox（← → 導航 + 鍵盤快捷鍵）
//
// 貼法：搵 script.js 入面「// 31. Project Gallery Reveal」
//       由呢個 banner 到「// 32. Next Project Link」之前，
//       整段換成呢份檔案全部內容。
//       其餘 section 同中文註解唔好郁。
// =====================================================
ScrollTrigger.refresh();

// ── 品牌緩動（重複建立無害） ──────────────────────────────────────
CustomEase.create("luveSmooth", "M0,0 C0.22,1 0.36,1 1,1");

// =====================================================
// A + B. 主 Gallery Reveal + JS 比例修正
// =====================================================

// ── B. 統一比例（2026-10）─────────────────────────────────────────
// 以前每張相跟自己原本比例，直度相有啲 0.69、有啲 0.8，所以大細唔一。
// 而家所有直度相統一 4:5、橫度相統一 16:9；相用 object-fit: cover
// 等比例放大（uniform scale）填滿個框，唔會變形，只會裁走少少邊位。
var LUVE_RATIO = { Portrait: "4 / 5", Landscape: "16 / 9" };
gsap.utils.toArray("[data-layout]").forEach(function (item) {
  var img = item.querySelector("img");
  var layout = item.getAttribute("data-layout");
  var ratio = LUVE_RATIO[layout];
  if (!ratio && img && img.naturalWidth)
    ratio = img.naturalWidth >= img.naturalHeight ? LUVE_RATIO.Landscape : LUVE_RATIO.Portrait;
  if (!ratio) ratio = LUVE_RATIO.Portrait;
  item.style.setProperty("aspect-ratio", ratio, "important");
  item.style.setProperty("height", "auto", "important");
  item.style.setProperty("overflow", "hidden", "important");
  if (img) {
    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "100%", "important");
    img.style.setProperty("object-fit", "cover", "important");
    img.style.setProperty("object-position", "50% 50%", "important");
  }
});

// ── A. 主 Gallery Reveal（設定初始狀態 + Batch 觸發）──────────────
gsap.utils.toArray(".projects-gallery-item").forEach(function (item) {
  var cover = item.querySelector(".projects-gallery-cover");
  var img = item.querySelector("img");
  if (cover) gsap.set(cover, { autoAlpha: 1 });
  if (img) gsap.set(img, { scale: 1.1, yPercent: 2 });
});

ScrollTrigger.batch(".projects-gallery-item", {
  start: "top 88%",
  once: true,
  onEnter: function (batch) {
    batch.forEach(function (item, i) {
      var cover = item.querySelector(".projects-gallery-cover");
      var img = item.querySelector("img");
      var tl = gsap.timeline({ delay: i * 0.1 });
      if (cover)
        tl.to(cover, { autoAlpha: 0, duration: 1.1, ease: "luveSmooth" }, 0);
      if (img)
        tl.to(
          img,
          { scale: 1, yPercent: 0, duration: 1.2, ease: "luveSmooth" },
          0
        );
    });
  },
});

// =====================================================
// C. "More of [Project Name]" Strip
// =====================================================
(function initMoreStrip() {
  // ─────────────────────────────────────────────────────────────────
  // ★ 設定（呢度改，唔需要搵其他地方）
  // ─────────────────────────────────────────────────────────────────
  var MAIN_LIMIT = 10; // 主 Gallery 最多顯示幾張；第 11 張起入 More strip
  // 想停用 More section → 改成 999

  // 項目名 selector 優先鏈（由上至下逐個試，揾到有文字就用）
  // ★ 如果「More of ___」顯示唔對，喺呢度加入你嘅正確 class
  var NAME_SELECTORS = [
    ".hero-project-title",
    ".projects-hero-title",
    ".hero-project-heading",
    ".projects-heading",
    ".project-detail-title",
    "h1",
  ];
  // ─────────────────────────────────────────────────────────────────

  // ── 1. 搵 Gallery DOM ─────────────────────────────────────────
  // Native section built in Webflow Designer (class .more-section).
  // Hidden when the project has 10 photos or fewer.
  var nativeMore = document.querySelector(".more-section");
  var hideNative = function () {
    if (nativeMore) nativeMore.style.display = "none";
  };
  var galleryList = document.querySelector(".projects-gallery-list");
  if (!galleryList) return hideNative();

  var allItems = Array.from(galleryList.querySelectorAll("[data-layout]"));
  var moreItems = allItems.slice(MAIN_LIMIT);
  if (moreItems.length === 0) return hideNative();

  // ★ 移除超額 item 之前先取出圖片資料
  var moreData = moreItems
    .map(function (item) {
      var img = item.querySelector("img");
      if (!img) return null;
      return {
        src: img.getAttribute("src") || img.currentSrc || img.src || "",
        srcset: img.getAttribute("srcset") || "",
        sizes: img.getAttribute("sizes") || "",
        alt: img.getAttribute("alt") || "",
      };
    })
    .filter(Boolean);

  if (moreData.length === 0) return hideNative();
  moreItems.forEach(function (el) {
    el.remove();
  });

  // ── 2. 抽項目名 ───────────────────────────────────────────────
  var projectName = "This Project";
  for (var ni = 0; ni < NAME_SELECTORS.length; ni++) {
    var found = document.querySelector(NAME_SELECTORS[ni]);
    if (found && found.textContent.trim()) {
      projectName = found.textContent.trim();
      break;
    }
  }

  // ── 3. More Section DOM（優先用 Designer 入面嘅 .more-section）──
  var moreSection = nativeMore;
  if (!moreSection) {
  moreSection = document.createElement("div");
  moreSection.className = "luve-more-section";
  moreSection.innerHTML =
    '<div class="luve-more-header">' +
    '<div class="luve-more-eyebrow services-eyebrow">' +
    '<div class="services-eyebrow-dot"></div>' +
    '<span class="luve-more-label small-eyebrow-text">More of ' +
    projectName +
    "</span></div>" +
    '<div class="luve-more-nav">' +
    '<button type="button" class="luve-more-arrow is-prev" aria-label="Previous images">' +
    '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor"' +
    ' stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="8,1 1,8 8,15"/></svg></button>' +
    '<button type="button" class="luve-more-arrow is-next" aria-label="Next images">' +
    '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor"' +
    ' stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="1,1 8,8 1,15"/></svg></button>' +
    "</div>" +
    "</div>" +
    '<div class="luve-more-strip-outer">' +
    '<div class="luve-more-strip"></div>' +
    "</div>";

  var galleryWrap =
    galleryList.closest(".projects-gallery-wrap") || galleryList;
  galleryWrap.insertAdjacentElement("afterend", moreSection);
  }

  var stripOuter = moreSection.querySelector(".more-strip-outer, .luve-more-strip-outer");
  var strip = moreSection.querySelector(".more-strip, .luve-more-strip");
  var moreHeader = moreSection.querySelector(".more-header, .luve-more-header");

  // ── 4. 建立 strip items（Designer 嘅 .more-item 做模板，複製每張相）──
  var itemTpl = strip.querySelector(".more-item");
  if (itemTpl) itemTpl.remove();
  var stripImgEls = [];
  moreData.forEach(function (data, i) {
    var div = itemTpl ? itemTpl.cloneNode(false) : document.createElement("div");
    if (!itemTpl) div.className = "luve-more-item";
    div.classList.add("is-strip-item");
    div.setAttribute("data-strip-index", i);

    var img = document.createElement("img");
    img.src = data.src;
    img.alt = data.alt;
    img.loading = "lazy";
    img.className = "more-item-img";
    if (data.srcset) img.srcset = data.srcset;
    if (data.sizes) img.sizes = data.sizes;

    div.appendChild(img);
    strip.appendChild(div);
    stripImgEls.push(img);
  });

  ScrollTrigger.refresh();

  // ── 5. "View more images" CTA click → 橫向捲動預覽 ───────────
  var moreCta = moreSection.querySelector(".luve-more-cta");
  if (moreCta) {
    moreCta.addEventListener("click", function () {
      var maxScroll = strip.scrollWidth - strip.clientWidth;
      if (strip.scrollLeft >= maxScroll - 10) {
        strip.scrollTo({ left: 0, behavior: "smooth" }); // 已到底 → 回頭
      } else {
        strip.scrollBy({ left: strip.clientWidth * 0.6, behavior: "smooth" }); // 向右
      }
    });
  }

  // ── 6. 拖曳捲動 ──────────────────────────────────────────────
  var isDown = false;
  var startX = 0;
  var scrollLeft = 0;
  var velX = 0;
  var lastX = 0;
  var didDrag = false;
  var dragStartX = 0;
  var rafId = null;

  strip.addEventListener("mousedown", function (e) {
    isDown = true;
    didDrag = false;
    startX = e.pageX - strip.getBoundingClientRect().left;
    dragStartX = e.pageX;
    scrollLeft = strip.scrollLeft;
    lastX = e.pageX;
    velX = 0;
    cancelAnimationFrame(rafId);
  });

  strip.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    e.preventDefault();
    if (Math.abs(e.pageX - dragStartX) > 6) didDrag = true;
    var walk = (e.pageX - strip.getBoundingClientRect().left - startX) * 1.2;
    strip.scrollLeft = scrollLeft - walk;
    velX = e.pageX - lastX;
    lastX = e.pageX;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    (function momentum() {
      if (Math.abs(velX) < 0.5) return;
      strip.scrollLeft -= velX;
      velX *= 0.91;
      rafId = requestAnimationFrame(momentum);
    })();
  }

  strip.addEventListener("mouseup", endDrag);
  strip.addEventListener("mouseleave", endDrag);

  if (false) strip.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].pageX;
      dragStartX = startX;
      scrollLeft = strip.scrollLeft;
      lastX = startX;
      isDown = true;
      didDrag = false;
      velX = 0;
      cancelAnimationFrame(rafId);
    },
    { passive: true }
  );

  if (false) strip.addEventListener(
    "touchmove",
    function (e) {
      if (!isDown) return;
      var x = e.touches[0].pageX;
      if (Math.abs(x - dragStartX) > 6) didDrag = true;
      strip.scrollLeft = scrollLeft - (x - startX);
      velX = x - lastX;
      lastX = x;
    },
    { passive: true }
  );

  // touch: native scrolling + scroll-snap (Section 43); no JS drag/momentum
  strip.addEventListener("touchstart", function () { didDrag = false; }, { passive: true });

  // ── 7. Drag Cursor Hint（glass，RAF 連續偵測防卡住）──────────
  var dragHint = document.createElement("div");
  dragHint.className = "luve-drag-hint";
  dragHint.innerHTML =
    '<span class="luve-dh-arrows">\u2190 \u2192</span>' +
    '<span class="luve-dh-label">Drag</span>';
  document.body.appendChild(dragHint);

  // ★ DRAG 字型統一跟 EXPLORE（.cursor-text）：字體、size、weight、字距、大階、顏色
  //   （Head Code 嘅 .luve-dh-label 用咗唔存在嘅 --text-main--font-family，會跌返 Bauer Bodoni）
  var cursorTextEl = document.querySelector(".cursor-text");
  var dragLabelEl = dragHint.querySelector(".luve-dh-label");
  if (cursorTextEl && dragLabelEl) {
    var cursorTextStyle = getComputedStyle(cursorTextEl);
    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "textTransform",
      "color",
    ].forEach(function (prop) {
      dragLabelEl.style[prop] = cursorTextStyle[prop];
    });
  }

  gsap.set(dragHint, {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.7,
  });

  var isOverStrip = false;
  var mouseClientX = -9999;
  var mouseClientY = -9999;
  var boundsRaf = null;

  // 全域追蹤鼠標位置（mousemove + pointermove 雙保險）
  function trackMouse(e) {
    mouseClientX = e.clientX;
    mouseClientY = e.clientY;
  }
  document.addEventListener("mousemove", trackMouse, { passive: true });
  document.addEventListener("pointermove", trackMouse, { passive: true });

  // RAF 連續偵測：每幀確認鼠標係咪仍在 strip 範圍內
  function runBoundsCheck() {
    if (!isOverStrip) {
      boundsRaf = null;
      return;
    }
    var rect = stripOuter.getBoundingClientRect();
    var inside =
      mouseClientX >= rect.left - 4 &&
      mouseClientX <= rect.right + 4 &&
      mouseClientY >= rect.top - 4 &&
      mouseClientY <= rect.bottom + 4;
    if (!inside) {
      // 強制 leave（唔等 mouseleave 事件）
      isOverStrip = false;
      document.body.classList.remove("luve-strip-active");
      gsap.killTweensOf(dragHint);
      gsap.to(dragHint, {
        autoAlpha: 0,
        scale: 0.7,
        duration: 0.15,
        ease: "power2.in",
      });
      boundsRaf = null;
      return;
    }
    // 同步更新 drag hint 位置
    gsap.to(dragHint, {
      x: mouseClientX,
      y: mouseClientY,
      duration: 0.3,
      ease: "power1.out",
      overwrite: "auto",
    });
    boundsRaf = requestAnimationFrame(runBoundsCheck);
  }

  stripOuter.addEventListener("mouseenter", function () {
    isOverStrip = true;
    document.body.classList.add("luve-strip-active");
    gsap.to(dragHint, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.35,
      ease: "back.out(1.4)",
    });
    if (!boundsRaf) boundsRaf = requestAnimationFrame(runBoundsCheck);
  });

  stripOuter.addEventListener("mouseleave", function () {
    isOverStrip = false;
    document.body.classList.remove("luve-strip-active");
    gsap.killTweensOf(dragHint);
    gsap.to(dragHint, {
      autoAlpha: 0,
      scale: 0.7,
      duration: 0.15,
      ease: "power2.in",
    });
  });

  // 按住壓扁 hint
  strip.addEventListener("mousedown", function () {
    gsap.to(dragHint, { scale: 0.85, duration: 0.12 });
  });
  strip.addEventListener("mouseup", function () {
    gsap.to(dragHint, { scale: 1, duration: 0.25, ease: "back.out(1.8)" });
  });

  // ── 8. Lightbox ──────────────────────────────────────────────
  var currentLB = 0;

  var lb = document.createElement("div");
  lb.className = "luve-lightbox";
  lb.innerHTML =
    '<div class="luve-lightbox-img-wrap"><img src="" alt="" /></div>' +
    '<button class="luve-lightbox-close" aria-label="Close">' +
    '<svg width="22" height="22" viewBox="0 0 22 22" fill="none"' +
    ' stroke="#f0e8dd" stroke-width="1.5" stroke-linecap="round">' +
    '<line x1="1" y1="1" x2="21" y2="21"/>' +
    '<line x1="21" y1="1" x2="1" y2="21"/>' +
    "</svg>" +
    "</button>" +
    '<button class="luve-lightbox-prev" aria-label="Previous">' +
    '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"' +
    ' stroke="#f0e8dd" stroke-width="1.4" stroke-linecap="round"' +
    ' stroke-linejoin="round">' +
    '<polyline points="18,4 8,14 18,24"/>' +
    "</svg>" +
    "</button>" +
    '<button class="luve-lightbox-next" aria-label="Next">' +
    '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"' +
    ' stroke="#f0e8dd" stroke-width="1.4" stroke-linecap="round"' +
    ' stroke-linejoin="round">' +
    '<polyline points="10,4 20,14 10,24"/>' +
    "</svg>" +
    "</button>" +
    '<div class="luve-lightbox-counter"></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector(".luve-lightbox-img-wrap img");
  var lbClose = lb.querySelector(".luve-lightbox-close");
  var lbPrev = lb.querySelector(".luve-lightbox-prev");
  var lbNext = lb.querySelector(".luve-lightbox-next");
  var lbCounter = lb.querySelector(".luve-lightbox-counter");

  function openLightbox(index) {
    currentLB = index;
    lbImg.src =
      stripImgEls[index].getAttribute("src") || stripImgEls[index].src;
    lbImg.alt = stripImgEls[index].alt || "";
    lbCounter.textContent = index + 1 + " / " + stripImgEls.length;
    lb.classList.add("is-open");
    if (window.lenis) window.lenis.stop();
    gsap.to(dragHint, { autoAlpha: 0, duration: 0.15 });
    gsap.to(lb, { autoAlpha: 1, duration: 0.38, ease: "power2.out" });
    gsap.fromTo(
      lbImg,
      { scale: 0.94 },
      { scale: 1, duration: 0.5, ease: "luveSmooth" }
    );
  }

  function closeLightbox() {
    gsap.to(lb, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: function () {
        lb.classList.remove("is-open");
        if (window.lenis) window.lenis.start();
      },
    });
  }

  function goTo(dir) {
    var slideOut = dir > 0 ? -30 : 30;
    var slideIn = dir > 0 ? 30 : -30;
    gsap.to(lbImg, {
      autoAlpha: 0,
      x: slideOut,
      duration: 0.18,
      onComplete: function () {
        currentLB = (currentLB + dir + stripImgEls.length) % stripImgEls.length;
        lbImg.src =
          stripImgEls[currentLB].getAttribute("src") ||
          stripImgEls[currentLB].src;
        lbCounter.textContent = currentLB + 1 + " / " + stripImgEls.length;
        gsap.fromTo(
          lbImg,
          { autoAlpha: 0, x: slideIn },
          { autoAlpha: 1, x: 0, duration: 0.28, ease: "power2.out" }
        );
      },
    });
  }

  strip.querySelectorAll(".is-strip-item").forEach(function (item) {
    var idx = parseInt(item.getAttribute("data-strip-index"), 10);
    item.addEventListener("click", function () {
      if (didDrag) return;
      openLightbox(idx);
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function (e) {
    e.stopPropagation();
    goTo(-1);
  });
  lbNext.addEventListener("click", function (e) {
    e.stopPropagation();
    goTo(1);
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });

  // ── 手機版：lightbox 內手指左右滑動切換相 ──────────────────
  var lbTouchStartX = 0,
    lbTouchStartY = 0,
    lbTouchActive = false;
  lb.addEventListener(
    "touchstart",
    function (e) {
      if (!lb.classList.contains("is-open")) return;
      lbTouchStartX = e.touches[0].clientX;
      lbTouchStartY = e.touches[0].clientY;
      lbTouchActive = true;
    },
    { passive: true }
  );
  lb.addEventListener(
    "touchend",
    function (e) {
      if (!lbTouchActive) return;
      lbTouchActive = false;
      var dx = e.changedTouches[0].clientX - lbTouchStartX;
      var dy = e.changedTouches[0].clientY - lbTouchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goTo(1);
        else goTo(-1);
      }
    },
    { passive: true }
  );

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goTo(-1);
    if (e.key === "ArrowRight") goTo(1);
  });

  // ── 9. More Section Header 淡入 ──────────────────────────────
  // Strip items 直接可見（唔做初始 autoAlpha:0，避免未入屏時係白嘅）
  gsap.fromTo(
    moreHeader,
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: "luveSmooth",
      scrollTrigger: {
        trigger: moreSection,
        start: "top 88%",
        once: true,
      },
    }
  );
})(); // end initMoreStrip

// =====================================================
// 31. Next Project Link
// 功能：下一個專案連結的顯示與 Hover 動畫
// =====================================================
ScrollTrigger.refresh();

const nextProjectLink = document.querySelector(".projects-next-link");

if (nextProjectLink) {
  let nextCover = nextProjectLink.querySelector(".projects-next-overlay");
  let nextImg = nextProjectLink.querySelector(".projects-next-image");
  let nextHeading = nextProjectLink.querySelector(".projects-next-heading");

  let tlNext = gsap.timeline({
    scrollTrigger: {
      trigger: nextProjectLink,
      start: "top 75%",
      once: true,
    },
  });

  if (nextCover) {
    tlNext.fromTo(
      nextCover,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: 1.8, ease: "power3.out" }
    );
  }

  if (nextImg) {
    tlNext.fromTo(
      nextImg,
      { scale: 1.2 },
      { scale: 1.0, duration: 1.8, ease: "power3.out" },
      "<"
    );
  }

  nextProjectLink.addEventListener("mouseenter", () => {
    if (nextImg) {
      gsap.to(nextImg, {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  nextProjectLink.addEventListener("mouseleave", () => {
    if (nextImg) {
      gsap.to(nextImg, {
        scale: 1.0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });
}

// =====================================================
// 32. Home Scroll Expansion (Video/Image Scale)
// 功能：首頁滾動時的媒體縮放效果 (Exo Ape Style)
// =====================================================
ScrollTrigger.refresh();

// Part A: Image Expansion
if (window.innerWidth > 991) {
  gsap.fromTo(
    ".scroll-image",
    {
      width: "40vw",
      height: "40vw",
      margin: "auto",
      borderRadius: "0px",
    },
    {
      width: "100vw",
      height: "100vh",
      borderRadius: "0px",
      margin: "auto",
      ease: "none",
      scrollTrigger: {
        trigger: ".scroll-track-home",
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.5,
      },
    }
  );
} else {
  gsap.set(".scroll-image", { width: "100%", height: "100vh" });
}

// Part B: Reel Video Expansion
const reelVideo = document.querySelector(".z-reel-video video");
if (reelVideo) reelVideo.play();

if (window.innerWidth > 991) {
  let reelAnim = gsap.fromTo(
    ".z-reel-video",
    {
      scale: 0.4,
      borderRadius: "20px",
      margin: "auto",
    },
    {
      scale: 1,
      borderRadius: "0px",
      margin: "auto",
      ease: "none",
      force3D: true,
    }
  );

  ScrollTrigger.create({
    trigger: ".z-reel-track",
    start: "top top",
    end: "+=100%",
    pin: true,
    scrub: 0,
    animation: reelAnim,
  });

  gsap.to(".z-reel-text", {
    opacity: 0,
    scale: 1.5,
    ease: "power1.in",
    scrollTrigger: {
      trigger: ".z-reel-track",
      start: "top top",
      end: "+=30%",
      scrub: true,
    },
  });
} else {
  gsap.set(".z-reel-video", { width: "100%", height: "100%", scale: 1 });
}

(function () {
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isIOS && isSafari) document.documentElement.classList.add("ios-safe");
})();

// =====================================================
// Custom Form Validation & Logic (Complete Final Version)
// 功能：Checkbox互斥 + 必填 + Phone/Email/URL 驗證 + 錯誤顯示
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const customSubmits = document.querySelectorAll(
    ".btn-wrapper, .reload-form-btn"
  );

  // --- 1. 定義驗證規則 (Regex) ---
  const phoneRegex = /^[\d\+\-\(\)\s]*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // URL 規則：只要有 "非空格.非空格" 就當係 URL (寬鬆模式)
  const urlRegex = /\S+\.\S+/;

  // ---------------------------------------------------
  // A. Checkbox 互斥邏輯 (修正：針對 Wrapper 內的 Input)
  // ---------------------------------------------------

  const noneWrapper = document.getElementById("cb-none");
  const optionWrappers = document.querySelectorAll(".cb-option");

  // 獲取 Wrapper 裡面的真實 Input
  const cbNoneInput = noneWrapper
    ? noneWrapper.querySelector("input[type='checkbox']")
    : null;

  const cbOptionInputs = [];
  optionWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input[type='checkbox']");
    if (input) cbOptionInputs.push(input);
  });

  // Helper: 視覺上取消剔選
  const uncheckVisual = (inputElement) => {
    const customDiv =
      inputElement.previousElementSibling || inputElement.nextElementSibling;
    if (customDiv) customDiv.classList.remove("w--redirected-checked");
  };

  // 邏輯綁定
  if (cbNoneInput && cbOptionInputs.length > 0) {
    // 情境一：當剔選 "None"
    cbNoneInput.addEventListener("change", () => {
      if (cbNoneInput.checked) {
        cbOptionInputs.forEach((input) => {
          input.checked = false; // 邏輯取消
          uncheckVisual(input); // 視覺取消
        });
        validateSingleGroup(noneWrapper.closest(".form-checkbox-group"));
      }
    });

    // 情境二：當剔選 "其他"
    cbOptionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          cbNoneInput.checked = false; // 邏輯取消
          uncheckVisual(cbNoneInput); // 視覺取消
        }
        validateSingleGroup(input.closest(".form-checkbox-group"));
      });
    });
  }

  // ---------------------------------------------------
  // B. Group 驗證函數 (Radio / Checkbox)
  // ---------------------------------------------------
  const validateSingleGroup = (group) => {
    if (!group) return true;

    // 支援多種 Error Class
    const errorMsg = group.querySelector(
      ".optionfield-error-msg, .select-field-error-msg"
    );
    const inputs = group.querySelectorAll(
      "input[type='radio'], input[type='checkbox']"
    );

    if (inputs.length === 0) return true;

    const isChecked = Array.from(inputs).some((input) => input.checked);

    if (!isChecked) {
      if (group) group.classList.add("has-error");
      if (errorMsg) {
        errorMsg.style.display = "block";
        requestAnimationFrame(() => {
          errorMsg.style.opacity = "1";
          errorMsg.style.transform = "translateY(0)";
        });
      }
      return false;
    } else {
      if (group) group.classList.remove("has-error");
      if (errorMsg) {
        errorMsg.style.opacity = "0";
        errorMsg.style.transform = "translateY(-5px)";
        setTimeout(() => {
          errorMsg.style.display = "none";
        }, 300);
      }
      return true;
    }
  };

  // ---------------------------------------------------
  // C. Input & Select 驗證函數 (含 URL/Phone 邏輯)
  // ---------------------------------------------------
  const validateInput = (input) => {
    const group = input.closest(".input-group, .form-select-wrapper");
    const errorTextEl = group
      ? group.querySelector(
          ".field-error-msg, .optionfield-error-msg, .select-field-error-msg"
        )
      : null;

    const val = input.value.trim();
    const isRequired = input.hasAttribute("required");

    // 類型判斷
    const inputId = input.id.toLowerCase();
    const isPhone = input.type === "tel" || inputId.includes("phone");
    const isEmail = input.type === "email" || inputId.includes("email");
    // [新加] URL 判斷：根據 ID
    const isUrl =
      inputId.includes("link") ||
      inputId.includes("portfolio") ||
      inputId.includes("url");

    let hasError = false;
    let errorMessage = "*This field is required";

    // --- 驗證邏輯 ---

    // A. 必填檢查
    if (isRequired && val === "") {
      hasError = true;
      if (input.tagName === "SELECT") {
        errorMessage = "*Please select an option (請選擇一項)";
      } else {
        errorMessage = "*This field is required";
      }
    }
    // B. 格式檢查 (只有當有內容時才檢查)
    else if (val !== "") {
      // 電話
      if (isPhone) {
        const digitCount = val.replace(/\D/g, "").length;
        if (!phoneRegex.test(val)) {
          hasError = true;
          errorMessage = "*Invalid characters (digits only)";
        } else if (digitCount < 8) {
          hasError = true;
          errorMessage = "*At least 8 digits required";
        }
      }
      // Email
      else if (isEmail) {
        if (!emailRegex.test(val)) {
          hasError = true;
          errorMessage = "*Invalid email address";
        }
      }
      // [新加] URL
      else if (isUrl) {
        if (!urlRegex.test(val)) {
          hasError = true;
          errorMessage = "*Please enter a valid URL";
        }
      }
    }

    // --- 顯示 / 隱藏錯誤 ---

    if (hasError) {
      input.classList.add("is-error");
      if (group) group.classList.add("has-error");

      // 更新錯誤文字
      if (errorTextEl) {
        errorTextEl.innerText = errorMessage;
        errorTextEl.style.display = "block";
        errorTextEl.style.opacity = "1";
        errorTextEl.style.transform = "translateY(0)";
      }
      return false;
    } else {
      input.classList.remove("is-error");
      if (group) group.classList.remove("has-error");

      if (errorTextEl) {
        errorTextEl.style.opacity = "0";
        errorTextEl.style.transform = "translateY(-5px)";
        setTimeout(() => {
          if (!group.classList.contains("has-error"))
            errorTextEl.style.display = "none";
        }, 300);
      }
      return true;
    }
  };

  // ---------------------------------------------------
  // D. 實時監聽
  // ---------------------------------------------------
  const allInputs = document.querySelectorAll(".form-input, .form-select");
  allInputs.forEach((input) => {
    input.addEventListener("input", () => validateInput(input));
    input.addEventListener("blur", () => validateInput(input));
    input.addEventListener("change", () => validateInput(input));
  });

  const allOptions = document.querySelectorAll(
    "input[type='radio'], input[type='checkbox']"
  );
  allOptions.forEach((opt) => {
    opt.addEventListener("change", () => {
      const parentGroup = opt.closest(".form-checkbox-group");
      if (parentGroup) validateSingleGroup(parentGroup);
    });
  });

  // ---------------------------------------------------
  // E. Submit 按鈕邏輯
  // ---------------------------------------------------
  customSubmits.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.classList.contains("reload-form-btn")) return;

      e.preventDefault();
      const form = btn.closest("form");
      if (!form) return;

      let isFormValid = true;
      let firstErrorEl = null;

      // 1. 檢查 Inputs & Selects
      const requiredInputs = form.querySelectorAll(
        ".form-input[required], select[required], textarea[required]"
      );
      requiredInputs.forEach((input) => {
        if (!validateInput(input)) {
          isFormValid = false;
          if (!firstErrorEl)
            firstErrorEl = input.closest(".input-group, .form-select-wrapper");
        }
      });

      // 2. 檢查 Groups
      const allGroups = form.querySelectorAll(".form-checkbox-group");
      allGroups.forEach((group) => {
        if (!validateSingleGroup(group)) {
          isFormValid = false;
          if (!firstErrorEl) firstErrorEl = group;
        }
      });

      // 3. 結果判定
      if (isFormValid) {
        const realSubmit = form.querySelector("input[type='submit']");
        if (realSubmit) realSubmit.click();
      } else {
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  });
});

// =====================================================
// Custom Form Reset Logic (Reload Button)
// 功能：點擊 Reload 按鈕後，隱藏 Success Message，重置表單
// =====================================================
(function initFormReset() {
  const reloadBtns = document.querySelectorAll(".reload-form-btn");

  reloadBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const formBlock = btn.closest(".w-form");
      if (!formBlock) return;

      const successMsg = formBlock.querySelector(".w-form-done");
      const form = formBlock.querySelector("form");

      if (successMsg) successMsg.style.display = "none";
      if (form) {
        // [關鍵修正] 唔好用 "block"，改用 "" (空字串)
        // 意思係：移除 inline style，跟返 Webflow CSS class (Flex/Grid)
        form.style.display = "";

        // 1. 重置表單內容
        form.reset();

        // 2. 移除錯誤樣式 (Class Only)
        const errorInputs = form.querySelectorAll(".is-error");
        const errorGroups = form.querySelectorAll(".has-error");

        errorInputs.forEach((el) => el.classList.remove("is-error"));
        errorGroups.forEach((el) => el.classList.remove("has-error"));

        // 3. 隱藏錯誤訊息 (回復 CSS 預設狀態)
        const errorMsgs = form.querySelectorAll(
          ".field-error-msg, .optionfield-error-msg, .select-field-error-msg"
        );
        errorMsgs.forEach((el) => {
          el.style.removeProperty("display");
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });

        // 4. 重置 Floating Labels
        const activeGroups = form.querySelectorAll(".input-group.is-active");
        activeGroups.forEach((g) => g.classList.remove("is-active"));

        // 5. 重置 Checkbox 視覺
        const checkedDivs = form.querySelectorAll(".w--redirected-checked");
        checkedDivs.forEach((div) =>
          div.classList.remove("w--redirected-checked")
        );
      }
    });
  });
})();

// =====================================================
// Dynamic Help Text Logic (Hide on Type)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".form-input");

  inputs.forEach((input) => {
    const group = input.closest(".input-group");
    // 檢查有無 Help Text，如果無就唔使做
    if (!group || !group.querySelector(".field-help-text")) return;

    const toggleHelpText = () => {
      const isEmpty = input.value.trim() === "";
      const isFocused = document.activeElement === input;

      // 只有在 "Focus 緊" 並且 "內容是空" 的時候才顯示
      if (isFocused && isEmpty) {
        group.classList.add("show-help");
      } else {
        group.classList.remove("show-help");
      }
    };

    // 綁定事件
    input.addEventListener("focus", toggleHelpText); // 點擊時檢查
    input.addEventListener("input", toggleHelpText); // 打字時檢查
    input.addEventListener("blur", () => {
      // 離開時，無條件隱藏
      group.classList.remove("show-help");
    });
  });
});

// =====================================================
// Mobile Search Bar Toggle (Clean - No Submit Btn)
// =====================================================
function initMobileSearchToggle() {
  const trigger = document.querySelector(".mobile-search-trigger");
  const searchContainer = document.querySelector(".search-bar-container");
  const input = document.querySelector(".search-input");

  // 必須元素檢查
  if (!trigger || !searchContainer) return;

  let isOpen = false;

  // 初始設定：Mobile 隱藏
  if (window.innerWidth < 992) {
    gsap.set(searchContainer, { height: 0, autoAlpha: 0, display: "none" });
  }

  // Toggle 開關
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      // --- OPEN ---
      isOpen = true;
      gsap.set(searchContainer, { display: "flex" });

      gsap.to(searchContainer, {
        height: "auto",
        autoAlpha: 1,
        duration: 0.6,
        ease: "expo.out",
        onComplete: () => {
          if (input) input.focus(); // 自動彈 Keyboard
        },
      });
    } else {
      // --- CLOSE ---
      isOpen = false;

      // 收埋鍵盤
      if (input) input.blur();

      gsap.to(searchContainer, {
        height: 0,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(searchContainer, { display: "none" });
        },
      });
    }
  });

  // 點擊外部自動收埋
  document.addEventListener("click", (e) => {
    // 如果 Click 中 Search Bar 內部，唔好收埋
    if (
      isOpen &&
      !searchContainer.contains(e.target) &&
      !trigger.contains(e.target)
    ) {
      // 如果 Input 有字，可以選擇唔自動收，避免誤觸
      if (input && input.value.trim() !== "") return;

      // 模擬點擊 Trigger 來關閉
      trigger.click();
    }
  });
}

initMobileSearchToggle();

// =====================================================
// Global Scroll Reveal 已完全移除
// ★ 圖片：唔再做任何 scroll reveal 動畫（直接常駐顯示）
// ★ 文字：全部交俾 Section 21 SplitText Masking 統一處理，
//         唔再需要呢層獨立嘅淡入系統
// =====================================================

// =====================================================
// Client Reviews（line-split reveal + auto progress）
//   + Services hover
// 取代之前所有 testimonials/services JS
// =====================================================

// ── A. CLIENT REVIEWS ────────────────────────────────
// =====================================================
// 33. Popup Hover Reveal — Image + Info Pop Up From Below
//     通用版本：支援多個 wrap（Profile 頁單一 + Home 頁多張卡）
//     ★ 想加落第三個地方，複製最底個 initPopupHoverReveal(...) call 一行就得
// =====================================================
function initPopupHoverReveal(config) {
  gsap.registerPlugin(ScrollTrigger);

  const wraps = document.querySelectorAll(config.wrapSelector);
  if (!wraps.length) return;

  // ─────────────────────────────────────────────────────────────
  // ★ 動畫參數 — 想調整就改呢度嘅數字（所有 wrap 共用同一組參數）
  // ─────────────────────────────────────────────────────────────
  const POP_DISTANCE = 50; // hover-center-image 由下方幾多 px 彈上嚟
  const POP_SCALE = 0.92; // hover-center-image 起始縮放
  const INFO_DISTANCE = 18; // project-info-row 由下方幾多 px 彈上嚟
  const DUR_IN = 0.7; // 彈入時長（秒）
  const DUR_OUT = 0.45; // 收回時長（秒）
  const INFO_DELAY_IN = 0.08; // project-info-row 比 center-image 遲幾耐入（秒）
  const EASE_IN = "power3.out"; // 彈入曲線
  const EASE_OUT = "power2.in"; // 收回曲線
  // ─────────────────────────────────────────────────────────────

  wraps.forEach((wrap) => {
    const mainImg = wrap.querySelector(config.mainImgSelector);
    const centerImg = wrap.querySelector(config.centerImgSelector);
    const infoRow = wrap.querySelector(config.infoRowSelector);

    // --- 1. 初始狀態 ---
    if (mainImg) {
      gsap.set(mainImg, {
        scale: 1.2,
        filter: "brightness(1)",
      });
    }

    if (centerImg) {
      gsap.set(centerImg, {
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        y: POP_DISTANCE,
        scale: POP_SCALE,
        transformOrigin: "center center",
      });
    }

    if (infoRow) {
      gsap.set(infoRow, {
        autoAlpha: 0,
        y: INFO_DISTANCE,
      });
    }

    // --- 2. Hover In：兩個元素一齊彈出 ---
    wrap.addEventListener("mouseenter", () => {
      if (centerImg) {
        gsap.to(centerImg, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: DUR_IN,
          ease: EASE_IN,
          overwrite: "auto",
        });
      }
      if (infoRow) {
        gsap.to(infoRow, {
          autoAlpha: 1,
          y: 0,
          duration: DUR_IN,
          ease: EASE_IN,
          delay: INFO_DELAY_IN,
          overwrite: "auto",
        });
      }
      if (mainImg) {
        gsap.to(mainImg, {
          scale: 1.1,
          filter: "brightness(0.7)",
          duration: DUR_IN,
          ease: EASE_IN,
          overwrite: "auto",
        });
      }
    });

    // --- 3. Hover Out：全部收回 ---
    wrap.addEventListener("mouseleave", () => {
      if (centerImg) {
        gsap.to(centerImg, {
          autoAlpha: 0,
          y: POP_DISTANCE,
          scale: POP_SCALE,
          duration: DUR_OUT,
          ease: EASE_OUT,
          overwrite: "auto",
        });
      }
      if (infoRow) {
        gsap.to(infoRow, {
          autoAlpha: 0,
          y: INFO_DISTANCE,
          duration: DUR_OUT,
          ease: EASE_OUT,
          overwrite: "auto",
        });
      }
      if (mainImg) {
        gsap.to(mainImg, {
          scale: 1,
          filter: "brightness(1)",
          duration: DUR_OUT,
          ease: EASE_OUT,
          overwrite: "auto",
        });
      }
    });
  });
}

// 執行 — Profile 頁（原本嘅 testimonials-aside-wrap，單一個）
initPopupHoverReveal({
  wrapSelector: ".testimonials-aside-wrap",
  mainImgSelector: ".testimonial-image-contain",
  centerImgSelector: ".hover-center-image",
  infoRowSelector: ".project-info-row",
});

// 執行 — Home 頁 Featured Projects（新結構，多張卡）
initPopupHoverReveal({
  wrapSelector: ".fp-card",
  mainImgSelector: ".fp-img",
  centerImgSelector: ".fp-hover-img",
  infoRowSelector: ".project-info-row",
});

// =====================================================
// 34. Client Reviews Carousel（1:1 還原 bymonolog）
// 功能：客戶評價輪播
//   - 兩條 bar（fill/fly）用 xPercent 平移輪流做「填緊嗰條」：
//     當前條由左慢慢填滿(6s)；到尾整條向右掃走(0.5s power2.inOut)，
//     同時另一條由左開始新一輪填(delay 0.4s)，兩條角色互換
//   - 文字用 SplitText(mask:lines, deepSlice) 逐行 stagger：
//     離場 yPercent 0→-150、入場 150→0，新字喺舊字動畫 60% 先起
//   - name/role(details) 同 message 一齊 stagger
// =====================================================
(function initReviews() {
  var root = document.querySelector(".review-slides");
  var slideEls = Array.from(document.querySelectorAll(".review-slide"));
  var barFill = document.querySelector(".review-bar-fill");
  var barFly = document.querySelector(".review-bar-fly");
  var numEl = document.querySelector(".review-num");
  var totalEl = document.querySelector(".review-total");
  var prevBtn = document.querySelector(".review-prev");
  var nextBtn = document.querySelector(".review-next");
  if (!slideEls.length) return;

  var AUTO_SEC = 6; // autoplay 每段秒數（= bymonolog Fe）
  var FAST = 0.5; // 離場快速度
  var SLOW = 0.8; // 入場慢速度

  gsap.registerPlugin(SplitText);

  document.fonts.ready.then(function () {
    // ── 建立每個 slide 嘅資料（含 SplitText）──
    var items = slideEls.map(function (el) {
      var message = el.querySelector(".review-text");
      var headshot = el.querySelector(".review-avatar");
      var details = Array.from(
        el.querySelectorAll(".review-name, .review-role")
      );
      var split = message
        ? SplitText.create(message, {
            type: "lines",
            linesClass: "review-line",
            mask: "lines",
            autoSplit: true,
            deepSlice: true, // ★ 解決 <strong><em> nested tag
          })
        : null;
      return {
        root: el,
        message: message,
        headshot: headshot,
        details: details,
        split: split,
      };
    });

    var total = items.length;
    var g = 0; // 當前 index
    var auto = null; // autoplay/bar timeline
    var textTl = null; // 文字切換 timeline
    var l = barFill; // 當前「填緊」嗰條
    var p = barFly; // 備用條

    if (totalEl) totalEl.textContent = String(total).padStart(2, "0");

    function updateNum() {
      if (numEl) numEl.textContent = String(g + 1).padStart(2, "0");
    }

    // ── 隱藏一個 slide 嘅內容（初始態）──
    function hide(it) {
      gsap.set(it.root, { opacity: 0, yPercent: 150 });
      if (it.headshot) gsap.set(it.headshot, { opacity: 0, yPercent: 100 });
      if (it.details.length) gsap.set(it.details, { opacity: 0 });
    }

    function killItem(it) {
      gsap.killTweensOf(it.root);
      if (it.headshot) gsap.killTweensOf(it.headshot);
      if (it.details.length) gsap.killTweensOf(it.details);
    }

    // ── 兩條 bar 初始：都收埋喺左（xPercent:-100）──
    function resetBars() {
      gsap.set(barFill, { xPercent: -100 });
      gsap.set(barFly, { xPercent: -100 });
      l = barFill;
      p = barFly;
    }

    // ── 離場：舊 slide 文字逐行向上走 ──
    function outTL(it) {
      if (!it.split) return null;
      var y = FAST;
      var w = gsap.timeline();
      w.to(it.split.lines, {
        yPercent: -150,
        opacity: 0,
        stagger: 0.03,
        ease: "power2.in",
        duration: y,
      });
      if (it.headshot) {
        w.to(
          it.headshot,
          { yPercent: -50, opacity: 0, ease: "power2.in", duration: y },
          "-=" + y * 1.2
        );
      }
      if (it.details.length) {
        w.to(
          it.details,
          {
            yPercent: -150,
            opacity: 0,
            ease: "power2.in",
            duration: y,
            stagger: 0.03,
          },
          "<"
        );
      }
      return w;
    }

    // ── 入場：新 slide 文字逐行由下上嚟 ──
    function inTL(it) {
      if (!it.split) return null;
      var y = gsap.timeline();
      y.set(it.root, { opacity: 1, yPercent: 0 }).fromTo(
        it.split.lines,
        { yPercent: 150, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.03,
          ease: "power3.out",
          duration: SLOW,
        }
      );
      if (it.headshot) {
        y.fromTo(
          it.headshot,
          { yPercent: 50, opacity: 0 },
          { yPercent: 0, opacity: 1, ease: "power3.out", duration: SLOW },
          "-=1"
        );
      }
      if (it.details.length) {
        y.fromTo(
          it.details,
          { yPercent: 150, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: "power3.out",
            duration: SLOW,
            stagger: 0.03,
          },
          "<"
        );
      }
      return y;
    }

    // ── 文字切換：舊走 → (60%位) → 新嚟 ──
    function swapText(nextIdx) {
      if (textTl) {
        textTl.kill();
        textTl = null;
      }
      var oldIt = items[g];
      var newIt = items[nextIdx];
      g = nextIdx;
      updateNum();

      var out = outTL(oldIt);
      if (!out) return;
      var N = out.duration() * 0.6;
      textTl = gsap.timeline({
        onComplete: function () {
          textTl = null;
        },
      });
      textTl
        .add(out, 0)
        .call(
          function () {
            killItem(oldIt);
            hide(oldIt);
          },
          null,
          N
        )
        .add(inTL(newIt), N);
    }

    // ── bar 切換：舊條掃走 + 新條由左填（角色互換）──
    function swapBars(opts) {
      var enteringDelay = opts.enteringDelay;
      var onSwapStart = opts.onSwapStart;

      var w = l; // 掃走嗰條
      var x = p; // 新填嗰條
      l = x;
      p = w;

      gsap.set(x, { xPercent: -100 });
      auto = gsap.timeline({
        onComplete: function () {
          advance();
        },
      });
      if (onSwapStart) auto.add(onSwapStart, 0);
      // 舊條由滿(0) 掃走去右(100)
      auto.to(w, { xPercent: 100, duration: 0.5, ease: "power2.inOut" }, 0);
      // 新條由左(-100) 填滿到(0)，delay enteringDelay
      auto.to(
        x,
        { xPercent: 0, duration: AUTO_SEC, ease: "none" },
        enteringDelay
      );
    }

    // ── 只填當前條（第一次 / resume）──
    function fillCurrent() {
      if (auto) auto.kill();
      auto = gsap.timeline({
        onComplete: function () {
          advance();
        },
      });
      auto.to(l, { xPercent: 0, duration: AUTO_SEC, ease: "none" });
    }

    // ── autoplay 到尾：自動下一張 ──
    function advance() {
      if (auto) auto.kill();
      var nextIdx = (g + 1) % total;
      swapBars({
        enteringDelay: 0.4,
        onSwapStart: function () {
          swapText(nextIdx);
        },
      });
    }

    // ── 手動撳掣 ──
    function go(dir) {
      if (auto) {
        auto.kill();
        auto = null;
      }
      if (textTl) {
        textTl.kill();
        textTl = null;
      }
      var nextIdx = dir === "next" ? (g + 1) % total : (g - 1 + total) % total;
      swapBars({
        enteringDelay: 0.2,
        onSwapStart: function () {
          swapText(nextIdx);
        },
      });
    }

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        go("next");
      });
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        go("prev");
      });

    // ── 初始化 ──
    items.forEach(hide);
    resetBars();
    inTL(items[g]);
    updateNum();
    fillCurrent();

    // ── 入畫先播、出畫暫停（慳效能）──
    ScrollTrigger.create({
      trigger: root || slideEls[0],
      start: "top bottom",
      end: "bottom top",
      onEnter: function () {
        auto ? auto.resume() : fillCurrent();
      },
      onEnterBack: function () {
        auto ? auto.resume() : fillCurrent();
      },
      onLeave: function () {
        if (auto) auto.pause();
      },
      onLeaveBack: function () {
        if (auto) auto.pause();
      },
    });
  });
})();

// =====================================================
// 35. Services（What we can help you with）
// 功能：服務項目
//   - Desktop：顏色 hover + 游標跟隨換圖 + 變色字疊圖
//   - Mobile/Tablet：Autoplay 換圖 + Scroll 逐個變色
//   - ★ 已移除 service-item 嘅左飛入 reveal（desktop/mobile 都唔要）
// =====================================================

// ── A. SERVICES：顏色 hover + 游標跟隨換圖（Desktop only）──
(function initServices() {
  var items = Array.from(document.querySelectorAll(".service-item"));
  if (!items.length) return;

  var isDesktopHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // ── 顏色變化（Desktop only）──
  if (isDesktopHover) {
    var DIM = 0.18;
    gsap.set(items, { opacity: DIM });
    items[0].classList.add("is-active");
    gsap.set(items[0], { opacity: 1 });

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        items.forEach(function (it) {
          it.classList.remove("is-active");
        });
        item.classList.add("is-active");
        gsap.to(items, { opacity: DIM, duration: 0.35, ease: "power2.out" });
        gsap.to(item, { opacity: 1, duration: 0.35, ease: "power2.out" });
      });
    });
  }

  // ── 游標跟隨 + 單軌換圖 + 變色字疊圖（Desktop only）──
  (function initCursorFollowImage() {
    if (!isDesktopHover) return;

    var list = document.querySelector(".services-list");
    var imgWrap = document.querySelector(".service-img");
    var track = document.querySelector(".service-img-track");
    var nameBlend = document.querySelector(".service-name-blend");
    var nameBlendText = nameBlend
      ? nameBlend.querySelector(".service-name")
      : null;
    if (!list || !imgWrap || !track) return;

    var imgEls = Array.from(track.querySelectorAll(".service-img-el"));
    if (!imgEls.length) return;

    imgEls.sort(function (a, b) {
      return (+a.dataset.idx || 0) - (+b.dataset.idx || 0);
    });

    imgEls.forEach(function (el) {
      el.setAttribute("draggable", "false");
      el.style.webkitUserDrag = "none";
      el.style.userSelect = "none";
    });

    var total = imgEls.length;
    var STEP = 100 / total;
    var FOLLOW_DUR = 0.5;
    var TRACK_DUR = 0.5;

    var xTo = gsap.quickTo(imgWrap, "x", {
      duration: FOLLOW_DUR,
      ease: "power3",
    });
    var yTo = gsap.quickTo(imgWrap, "y", {
      duration: FOLLOW_DUR,
      ease: "power3",
    });

    list.addEventListener("mousemove", function (e) {
      var listRect = list.getBoundingClientRect();
      var x = e.clientX - listRect.left - imgWrap.offsetWidth / 2;
      var y = e.clientY - listRect.top - imgWrap.offsetHeight / 2;
      xTo(x);
      yTo(y);
    });

    list.addEventListener("pointerenter", function () {
      gsap.to(imgWrap, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
    });
    list.addEventListener("pointerleave", function () {
      gsap.to(imgWrap, { autoAlpha: 0, duration: 0.3, overwrite: "auto" });
    });

    var currentIdx = 0;
    var realNames = items.map(function (it) {
      return it.querySelector(".service-name");
    });

    function goToIdx(idx) {
      if (idx === currentIdx || idx < 0 || idx >= total) return;
      currentIdx = idx;
      gsap.to(track, {
        yPercent: -STEP * idx,
        duration: TRACK_DUR,
        ease: "power3.out",
        overwrite: "auto",
      });
      if (nameBlendText && realNames[idx]) {
        nameBlendText.textContent = realNames[idx].textContent;
      }
    }

    list.addEventListener("mouseover", function (e) {
      var item = e.target.closest(".service-item");
      if (!item || !list.contains(item)) return;
      var idx = items.indexOf(item);
      goToIdx(idx);
    });

    gsap.set(track, { yPercent: 0 });

    if (nameBlendText && realNames[0]) {
      nameBlendText.textContent = realNames[0].textContent;
    }

    if (nameBlend) {
      var listRectCache, imgX, imgY, realRect, targetX, targetY;
      gsap.ticker.add(function () {
        if (!realNames[currentIdx]) return;
        listRectCache = list.getBoundingClientRect();
        realRect = realNames[currentIdx].getBoundingClientRect();
        imgX = gsap.getProperty(imgWrap, "x");
        imgY = gsap.getProperty(imgWrap, "y");
        targetX = realRect.left - listRectCache.left - imgX;
        targetY = realRect.top - listRectCache.top - imgY;
        gsap.set(nameBlend, { x: targetX, y: targetY });
      });
    }
  })();

  // ★ 已移除：原本 .services-eyebrow + service-item 嘅左飛入 reveal ★
})();

// ── B. SERVICES：Mobile/Tablet Autoplay + Scroll 逐個變色 ──
(function initServicesMobile() {
  var isDesktopHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (isDesktopHover) return;

  var imgWrap = document.querySelector(".service-img");
  var track = document.querySelector(".service-img-track");
  if (!imgWrap || !track) return;

  gsap.set(imgWrap, { autoAlpha: 1 });

  var imgEls = Array.from(track.querySelectorAll(".service-img-el"));
  if (!imgEls.length) return;

  imgEls.sort(function (a, b) {
    return (+a.dataset.idx || 0) - (+b.dataset.idx || 0);
  });

  var total = imgEls.length;
  var STEP = 100 / total;
  var AUTOPLAY_SEC = 3;

  var tl = gsap.timeline({ repeat: -1 });
  for (var i = 1; i <= total; i++) {
    tl.to(track, {
      yPercent: -STEP * (i % total),
      duration: 0.6,
      ease: "power3.inOut",
    }).to({}, { duration: AUTOPLAY_SEC - 0.6 });
  }

  ScrollTrigger.create({
    trigger: imgWrap,
    start: "top bottom",
    end: "bottom top",
    onEnter: function () {
      tl.play();
    },
    onLeave: function () {
      tl.pause();
    },
    onEnterBack: function () {
      tl.play();
    },
    onLeaveBack: function () {
      tl.pause();
    },
  });

  // ── Scroll 逐個變色（慢啲：duration 0.9）──
  var nameEls = gsap.utils.toArray(".service-item .service-name");
  nameEls.forEach(function (nameEl) {
    ScrollTrigger.create({
      trigger: nameEl,
      start: "top 70%",
      onEnter: function () {
        gsap.to(nameEl, {
          color: "#795e49",
          duration: 0.9,
          ease: "power2.out",
          overwrite: true,
        });
      },
      onLeaveBack: function () {
        gsap.to(nameEl, {
          color: "rgba(14, 31, 42, 0.1)",
          duration: 0.9,
          ease: "power2.out",
          overwrite: true,
        });
      },
    });
  });

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();

// =====================================================
// 36. Clean Enquiry Component
// Controls:
// - GET IN TOUCH isolated push + arrow hover
// - Three-step enquiry form navigation and validation
// - Scoped per Component instance (does not modify MENU)
// =====================================================
(function initCleanEnquiryComponents(attempt) {
  // Site-wide libraries may load after the Webflow Component Embed.
  // Wait briefly instead of loading GSAP or SplitText a second time.
  if (!window.gsap || !window.SplitText) {
    if (attempt < 160) {
      window.setTimeout(() => initCleanEnquiryComponents(attempt + 1), 50);
    }
    return;
  }

  const roots = document.querySelectorAll(".enq-component-host");
  if (!roots.length) return;

  const gsap = window.gsap || null;
  const isMobile = window.matchMedia(
    "(max-width: 991px), (hover: none)"
  ).matches;

  roots.forEach((root) => {
    if (root.dataset.enqPhase36Bound === "true") return;
    root.dataset.enqPhase36Bound = "true";

    // -------------------------------------------------
    // A. Isolated GET IN TOUCH hover
    // -------------------------------------------------
    const cta = root.querySelector('[data-enq-cta="true"]');
    const ctaText = cta?.querySelector('[data-enq-cta-text="true"]');
    const ctaArrow = cta?.querySelector('[data-enq-cta-arrow="true"]');

    if (cta && ctaText && ctaArrow && gsap) {
      const idle = () => {
        gsap.to(cta, {
          scale: 1,
          backgroundColor: "#F0E8DD",
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(ctaText, {
          x: 0,
          color: "#795E49",
          duration: 0.65,
          ease: "expo.out",
          overwrite: "auto",
        });
        gsap.to(ctaArrow, {
          autoAlpha: 0,
          x: -15,
          scale: 0.6,
          backgroundColor: "transparent",
          borderColor: "#795E49",
          duration: 0.55,
          ease: "expo.out",
          overwrite: "auto",
        });
      };

      const hoverIn = () => {
        if (window.__MENU_STATE__?.menuOpen) return;
        gsap.to(cta, {
          backgroundColor: "#795E49",
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(ctaArrow, {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          backgroundColor: "#F0E8DD",
          borderColor: "#F0E8DD",
          duration: 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
        gsap.to(ctaText, {
          x: 12,
          color: "#F0E8DD",
          duration: 1,
          ease: "expo.out",
          overwrite: "auto",
        });
      };

      if (isMobile) {
        gsap.set(ctaArrow, { display: "none" });
        const press = () =>
          gsap.to(cta, {
            scale: 0.96,
            backgroundColor: "#795E49",
            duration: 0.1,
            overwrite: "auto",
          });
        const release = () => {
          gsap.to(cta, {
            scale: 1,
            backgroundColor: "#F0E8DD",
            duration: 0.2,
            overwrite: "auto",
          });
          gsap.to(ctaText, {
            x: 0,
            color: "#795E49",
            duration: 0.2,
            overwrite: "auto",
          });
        };
        cta.addEventListener("touchstart", press, { passive: true });
        cta.addEventListener("touchend", release, { passive: true });
        cta.addEventListener("touchcancel", release, { passive: true });
        cta.addEventListener("mousedown", press);
        cta.addEventListener("mouseup", release);
        cta.addEventListener("mouseleave", release);
      } else {
        gsap.set(ctaArrow, {
          display: "flex",
          autoAlpha: 0,
          x: -15,
          scale: 0.6,
          transformOrigin: "center",
        });
        cta.addEventListener("mouseenter", hoverIn);
        cta.addEventListener("mouseleave", idle);
      }
    }

    // -------------------------------------------------
    // B. OH-style intro line reveal
    // Only this paragraph animates; the form stays still.
    // -------------------------------------------------
    const modal = root.querySelector('[data-enq-modal="true"]');
    const intro = root.querySelector('[data-enq-intro-reveal="true"]');
    let introSplit = null;
    let introTimeline = null;

    const resetIntro = () => {
      if (!gsap || !introSplit) return;
      introTimeline?.kill();
      gsap.set(introSplit.lines, { yPercent: 150, opacity: 0 });
    };

    const revealIntro = () => {
      if (!gsap || !introSplit) return;
      introTimeline?.kill();
      introTimeline = gsap.fromTo(
        introSplit.lines,
        { yPercent: 150, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.03,
          ease: "power3.out",
          duration: 0.8,
          delay: 0.38,
        }
      );
    };

    if (gsap && window.SplitText && intro && modal) {
      gsap.registerPlugin(window.SplitText);
      document.fonts.ready.then(() => {
        introSplit = window.SplitText.create(intro, {
          type: "lines",
          linesClass: "enq-clean-intro-line",
          mask: "lines",
          autoSplit: true,
          deepSlice: true,
          onSplit: () => {
            resetIntro();
            if (modal.getAttribute("aria-hidden") === "false") revealIntro();
          },
        });
        resetIntro();

        new MutationObserver(() => {
          if (modal.getAttribute("aria-hidden") === "false") revealIntro();
          else resetIntro();
        }).observe(modal, {
          attributes: true,
          attributeFilter: ["aria-hidden"],
        });
      });
    }

    // -------------------------------------------------
    // C. Three-step enquiry form
    // -------------------------------------------------
    const form = root.querySelector('[data-enq-form-element="true"]');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll("[data-enq-step]"));
    const back = form.querySelector('[data-enq-form-action="back"]');
    const next = form.querySelector('[data-enq-form-action="next"]');
    const submit = form.querySelector('[data-enq-form-action="submit"]');
    const status = form.querySelector('[data-enq-form-status="true"]');
    let current = 0;

    const validateStep = () => {
      const required = steps[current]?.querySelectorAll(
        "input[required], textarea[required], select[required]"
      );
      for (const field of required || []) {
        if (!field.checkValidity()) {
          field.reportValidity();
          field.focus();
          return false;
        }
      }
      return true;
    };

    const showStep = (index, moveFocus = true) => {
      current = Math.max(0, Math.min(index, steps.length - 1));

      steps.forEach((step, stepIndex) => {
        const active = stepIndex === current;
        step.classList.toggle("is-active", active);
        step.setAttribute("aria-hidden", String(!active));
      });

      if (back) back.style.display = current > 0 ? "inline-flex" : "none";
      if (next)
        next.style.display =
          current < steps.length - 1 ? "inline-flex" : "none";
      if (submit)
        submit.style.display =
          current === steps.length - 1 ? "inline-flex" : "none";
      if (status) status.textContent = "";

      if (moveFocus) {
        const target = steps[current]?.querySelector(
          "input, textarea, select, button"
        );
        target?.focus({ preventScroll: true });
      }
    };

    back?.addEventListener("click", (event) => {
      event.preventDefault();
      showStep(current - 1);
    });
    next?.addEventListener("click", (event) => {
      event.preventDefault();
      if (validateStep()) showStep(current + 1);
    });

    form.addEventListener("submit", (event) => {
      if (!validateStep()) {
        event.preventDefault();
        return;
      }

      // Keep submission integration replaceable.
      // Listen for "enq:submit" in a future endpoint module if required.
      const detail = Object.fromEntries(new FormData(form).entries());
      form.dispatchEvent(
        new CustomEvent("enq:submit", {
          bubbles: true,
          detail,
        })
      );
    });

    showStep(0, false);
  });
})(0);

// =====================================================
// 37. Compact Nav Logo
// 功能：scroll 落去，中間大 logo 收起；左上角出返一個透明底嘅 LUVÉ 字標
//       (SVG，同中間 logo 一樣冇底冇框)，高度同 GET IN TOUCH 粒掣差唔多，
//       撳一下返 Home。出現／收起用 GET IN TOUCH 同一個 motion（由下向上）。
//       顏色：睇 logo 後面「實際」係咪深色 —
//         1. 任何 section 加 data-logo-tone="light" / "dark" 可以手動指定
//            （light = 用淺色 logo，dark = 用深色 logo），優先過自動判斷
//         2. 頂部漸淡遮罩出緊（即係後面係內文、細相）：logo 坐喺米色帶上，
//            一律用深色
//         3. 遮罩收起（全屏大相 / video / 深色大色塊經過頂部）：
//            直接量度 logo 正後面嗰笪嘅真實像素（相片、背景色、
//            漸變、半透明遮罩都計埋），夠暗就轉淺色 logo，夠光就用深色。
//            Video 讀唔到像素，就用佢個 poster 或者下面嘅顏色。
//         4. 張相未 load 好：暫時用舊規則（data-theme="dark" 而且後面
//            真係有相 / 影片 / 深色底先轉淺色）
//       Digital Card page（.lc-page 或 data-mini-logo="static"）：唔使 scroll，
//       一入頁就出，固定淺色，位置同以前個 lc-mini 一樣。
// =====================================================
(function initCompactNavLogo() {
  // The GET IN TOUCH / MENU pill size goes in straight away (not on "load"),
  // so the scripts that position the two pills measure the final size. When
  // it arrived late, a refresh half-way down the page could leave MENU a few
  // pixels lower than GET IN TOUCH.
  const pillStyle = document.createElement("style");
  pillStyle.textContent = `
    html body [data-enq-action=open].enq-trigger,html body .floating-burger-btn.floating-burger-btn{padding:9px 24px!important;min-height:0!important}
    html body [data-enq-action=open].enq-trigger .enq-trigger-text,html body .floating-burger-btn.floating-burger-btn .floating-cta-text{font-size:12px!important;line-height:14px!important}
    @media (max-width:991px){
      html body [data-enq-action=open].enq-trigger,html body .floating-burger-btn.floating-burger-btn{padding:6px 15px!important}
      html body [data-enq-action=open].enq-trigger .enq-trigger-text,html body .floating-burger-btn.floating-burger-btn .floating-cta-text{font-size:10px!important;line-height:12px!important}
    }
  `;
  document.head.appendChild(pillStyle);
  const start = () => {
    if (window.__LUVE_COMPACT_LOGO__ || typeof gsap === "undefined") return;
    const navLink = document.querySelector(".nav-logo-link");
    const navLogo = document.querySelector(".nav-logo-svg");
    const staticMode = !!document.querySelector(
      "[data-mini-logo='static'], .lc-page"
    );
    if (!navLink && !staticMode) return;
    // Pages without a real floating MENU pill keep their normal top nav: no
    // compact logo, no top fade. That covers pages still being set up and the
    // Contact page (its MENU is only a hidden helper and its nav never changes).
    const floatBtn = document.querySelector(".floating-burger-btn");
    if (
      !staticMode &&
      (!floatBtn ||
        floatBtn.hasAttribute("hidden") ||
        document.body.classList.contains("body-contact"))
    )
      return;
    window.__LUVE_COMPACT_LOGO__ = true;

    // LUVÉ wordmark = the nav logo's own paths, without "DESIGN & ARCHITECTURE"
    const WORDMARK =
      '<svg viewBox="20 6 794 248" aria-hidden="true" focusable="false"><g fill="currentColor">' +
      '<path d="M206.73,69.84h88.74v4.64h-22.82v113.53c0,33.03,8.17,58.31,49.3,58.31,27.33,0,50.42-17.03,50.42-52.12v-98.05c0-14.96-4.51-21.67-18.87-21.67h-8.17v-4.64h78.6v4.64h-30.15c-10.14,0-14.65,6.71-14.65,21.67v96.5c0,37.93-22.54,62.96-74.37,62.96-45.92,0-76.06-24.25-76.06-64.25v-116.88h-21.97v-4.64Z"/>' +
      '<path d="M423.93,69.84h94.65v4.64h-27.33l52.4,129.01,41.41-102.95c1.97-5.16,3.38-11.61,3.38-16.51,0-6.19-4.23-9.55-13.8-9.55h-7.33v-4.64h53.81v4.64h-4.51c-7.61,0-13.8,2.32-25.35,30.45l-61.97,150.68h-11.27l-74.09-181.13h-20v-4.64Z"/>' +
      '<path d="M654.23,246.84h22.82V74.48h-55.92v-4.64h190.58v51.35h-5.07v-3.61c0-23.48-18.87-43.09-52.4-43.09h-33.24v78.95h19.44c18.31,0,27.89-9.55,27.89-34.06v-2.84h5.07v81.53h-5.07v-5.93c0-18.32-9.58-34.06-27.89-34.06h-19.44v88.76h40.57c46.2,0,52.96-35.09,52.96-49.8v-3.61h5.07v58.05h-165.36v-4.64ZM750.86,23.4c6.76-12.39,7.61-14.19,16.06-14.19,7.89,0,10.7,2.58,10.7,6.45,0,1.81-2.25,5.93-6.76,10.32l-36.9,35.86h-3.66l20.56-38.44Z"/>' +
      '<path d="M22.3,246.48h22.82V74.12h-22.82v-4.64h92.12v4.64h-25.35v172.36h32.39c49.86,0,61.13-22.19,61.13-52.12v-5.16h5.07v61.93H22.3v-4.64Z"/>' +
      "</g></svg>";

    const style = document.createElement("style");
    style.textContent = `
      .nav-mini-logo{position:fixed;z-index:9998;top:22px;left:72px;display:block;overflow:hidden;pointer-events:none;padding-bottom:2px}
      .nav-mini-logo a{display:block;height:var(--mini-h,43px);color:var(--mini-c,#795e49);text-decoration:none;cursor:pointer;transition:color .45s ease,opacity .35s ease}
      .nav-mini-logo svg{display:block;height:100%;width:auto}
      @media (hover:hover){.nav-mini-logo a:hover{opacity:.7}}
      .nav-mini-logo a:focus-visible{outline:1px solid currentColor;outline-offset:4px}
      body.side-menu-open .nav-mini-logo{visibility:hidden}
      .nav-mini-logo{opacity:0;transition:opacity .45s ease}
      .nav-mini-logo.is-on{opacity:1}
      .nav-top-fade{position:fixed;left:0;right:0;top:0;height:var(--fade-h,110px);z-index:9990;pointer-events:none;opacity:0;transition:opacity .45s ease;background:linear-gradient(to bottom,var(--fade-c) 0,var(--fade-c) var(--fade-solid,60px),var(--fade-c0) 100%)}
      .nav-top-fade.is-on{opacity:1}
      body.side-menu-open .nav-top-fade{opacity:0}
      html body [data-enq-action=open].enq-trigger,html body .floating-burger-btn.floating-burger-btn{padding:9px 24px!important;min-height:0!important}
      html body [data-enq-action=open].enq-trigger .enq-trigger-text,html body .floating-burger-btn.floating-burger-btn .floating-cta-text{font-size:12px!important;line-height:14px!important}
      @media (max-width:991px){
        html body [data-enq-action=open].enq-trigger,html body .floating-burger-btn.floating-burger-btn{padding:6px 15px!important}
        html body [data-enq-action=open].enq-trigger .enq-trigger-text,html body .floating-burger-btn.floating-burger-btn .floating-cta-text{font-size:10px!important;line-height:12px!important}
      }
      @media (min-width:992px){
        body.nav-big-anim .nav-bar .nav-logo-link{transition:opacity .3s ease,visibility .3s ease,transform .3s ease}
        body.nav-big-hidden .nav-bar .nav-logo-link{opacity:0!important;visibility:hidden!important;transform:translateY(-12px)!important;pointer-events:none!important}
        body.nav-big-hidden.side-menu-open:not(.nav-menu-closing) .nav-bar .nav-logo-link{opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important;transition:opacity .75s ease .6s,visibility .75s ease .6s,transform 1s cubic-bezier(.16,1,.3,1) .6s}
      }
      .nav-mini-logo.is-static{top:28px;left:32px;--mini-h:34px;--mini-c:#f0e8dd}
      @media (max-width:767px){.nav-mini-logo.is-static{top:22px;left:20px;--mini-h:28px}}
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.className = "nav-mini-logo";
    wrap.innerHTML =
      '<a href="/" aria-label="LUVÉ — Home" tabindex="-1">' + WORDMARK + "</a>";
    document.body.appendChild(wrap);
    const link = wrap.firstElementChild;
    // The mini logo fades in / out together with the top fade band
    // (same .45s ease as .nav-top-fade), instead of rising from below.

    // Digital Card page: no scrolling, so the wordmark simply rises in once,
    // always light, where the old card-page mini logo used to sit.
    if (!navLink) {
      wrap.classList.add("is-static");
      wrap.style.pointerEvents = "auto";
      link.tabIndex = 0;
      wrap.style.transition = "opacity .9s ease";
      setTimeout(() => wrap.classList.add("is-on"), 450);
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");

    // All screen sizes: a band in the page colour behind the logo and the two pills
    // (solid behind them, then fading out), so text scrolling underneath
    // melts away instead of clashing. The pills are made a little smaller
    // (desktop and phones) so the whole header sits inside the solid part.
    // Hidden over photos, videos and dark sections.
    const fade = document.createElement("div");
    fade.className = "nav-top-fade";
    const bgm = (getComputedStyle(document.body).backgroundColor || "")
      .match(/\d+(\.\d+)?/g) || [244, 235, 226];
    fade.style.setProperty("--fade-c", `rgb(${bgm[0]},${bgm[1]},${bgm[2]})`);
    fade.style.setProperty("--fade-c0", `rgba(${bgm[0]},${bgm[1]},${bgm[2]},0)`);
    document.body.appendChild(fade);
    let toneLight = false;
    const baseColor = navLogo ? getComputedStyle(navLogo).color : "#795e49";
    const DARK_LOGO =
      baseColor === "rgb(240, 232, 221)" ? "#795e49" : baseColor;
    const LIGHT_LOGO = "#f0e8dd";
    let shown = false;

    // Top-left, mirroring the floating MENU pill: same top, same distance from
    // the edge, wordmark as tall as the GET IN TOUCH / MENU pills
    const place = () => {
      const pill =
        document.querySelector("[data-enq-action='open']") ||
        document.querySelector(".floating-burger-btn");
      const menu = document.querySelector(".floating-burger-btn");
      if (!pill || !menu) return;
      const r = menu.getBoundingClientRect();
      const s = getComputedStyle(menu);
      let ty = 0;
      try {
        if (s.transform && s.transform !== "none")
          ty = new DOMMatrixReadOnly(s.transform).m42 || 0;
      } catch (e) {}
      const h = pill.offsetHeight || r.height;
      if (!r.width || !h) return;
      // GET IN TOUCH's fixed holder carries the resting top (on phones MENU sits
      // inside it and the holder itself slides in)
      const mask = pill.closest && pill.closest("[data-enq-trigger-mask]");
      const maskTop = mask ? parseFloat(mask.style.top) : NaN;
      // The wordmark box includes the accent on the É, so the capital letters
      // sit 12% of the box height below its centre. Lift the box by that much
      // so the letters (not the accent) are centred on the pills.
      const pillTop = Number.isFinite(maskTop) ? maskTop : r.top - ty;
      wrap.style.top = Math.round(pillTop - h * 0.121) + "px";
      wrap.style.left = Math.max(16, Math.round(innerWidth - r.right)) + "px";
      wrap.style.setProperty("--mini-h", Math.round(h) + "px");
      // solid page colour down to just below the pills, then a soft fade out
      fade.style.setProperty("--fade-solid", Math.round(pillTop + h + 6) + "px");
      fade.style.setProperty("--fade-h", Math.round(pillTop + h + 34) + "px");
    };

    // ---- What is really behind the wordmark? ----
    const covers = (el, x, y) => {
      const b = el.getBoundingClientRect();
      return (
        b.width > 0 &&
        b.left <= x &&
        b.right >= x &&
        b.top <= y &&
        b.bottom >= y
      );
    };
    const isShown = (el) => {
      const c = getComputedStyle(el);
      return (
        c.display !== "none" &&
        c.visibility !== "hidden" &&
        parseFloat(c.opacity) > 0.2
      );
    };
    const darkColor = (str) => {
      const m = str && str.match(/rgba?\(([^)]+)\)/);
      if (!m) return false;
      const [r, g, b, a = 1] = m[1].split(",").map(parseFloat);
      if (a < 0.5) return false;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
    };
    // A photo / video / dark fill that actually paints under (x, y)
    const paintsDark = (sec, x, y) => {
      const media = sec.querySelectorAll("img, video");
      for (const m of media) {
        if (!covers(m, x, y) || !isShown(m)) continue;
        if (m.tagName === "IMG" && m.complete && m.naturalWidth > 0)
          return true;
        if (m.tagName === "VIDEO" && (m.readyState >= 2 || m.poster))
          return true;
      }
      const stack = document.elementsFromPoint(x, y);
      for (const el of stack) {
        if (el === wrap || wrap.contains(el)) continue;
        if (!sec.contains(el)) continue;
        const c = getComputedStyle(el);
        if (c.backgroundImage && c.backgroundImage !== "none") return true;
        if (darkColor(c.backgroundColor)) return true;
      }
      return false;
    };
    const innermost = (list, x, y) => {
      let hit = null;
      list.forEach((el) => {
        if (covers(el, x, y) && (!hit || hit.contains(el))) hit = el;
      });
      return hit;
    };

    // ---- Pixel sampler: how light or dark is the page right behind a box? ----
    // Reads the real pixels of photos (Webflow CDN allows this), background
    // colours, gradients and overlays at a small grid of points behind the
    // wordmark, and returns the average luminance (0 = black, 1 = white).
    // Videos can't be read (the server blocks it), so their poster image or
    // the colour underneath is used instead.
    const PX = (() => {
      const cache = new Map(); // url -> {w,h,d} | "wait" | "fail"
      let onReady = null;
      const SW = 96; // sample resolution (width) — tiny and fast
      const load = (url) => {
        if (cache.has(url)) return cache.get(url);
        cache.set(url, "wait");
        fetch(url, { mode: "cors", credentials: "omit" })
          .then((r) => (r.ok ? r.blob() : Promise.reject()))
          .then((b) => createImageBitmap(b))
          .then((bm) => {
            const w = SW;
            const h = Math.max(1, Math.round((bm.height / bm.width) * SW));
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            const x = c.getContext("2d", { willReadFrequently: true });
            x.drawImage(bm, 0, 0, w, h);
            cache.set(url, { w, h, iw: bm.width, ih: bm.height, d: x.getImageData(0, 0, w, h).data });
            if (bm.close) bm.close();
            if (onReady) onReady();
          })
          .catch(() => cache.set(url, "fail"));
        return "wait";
      };
      const lin = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const parseColor = (s) => {
        const m = s && s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
        return { l: lum(p[0], p[1], p[2]), a: p.length > 3 ? p[3] : 1 };
      };
      // average colour of a CSS gradient (good enough for overlays)
      const gradient = (s) => {
        const cs = s.match(/rgba?\([^)]+\)/g);
        if (!cs) return null;
        let l = 0, a = 0;
        cs.forEach((c) => {
          const p = parseColor(c);
          l += p.l * p.a;
          a += p.a;
        });
        a /= cs.length;
        return a > 0.02 ? { l: l / (a * cs.length), a } : null;
      };
      // where an image is drawn inside its box (object-fit / background-size)
      const placed = (box, iw, ih, fit, pos) => {
        let sx = box.width / iw, sy = box.height / ih;
        if (fit === "cover") sx = sy = Math.max(sx, sy);
        else if (fit === "contain") sx = sy = Math.min(sx, sy);
        else if (fit === "none" || fit === "auto") sx = sy = 1;
        const dw = iw * sx, dh = ih * sy;
        const pp = (pos || "50% 50%").split(" ");
        const pct = (v, def) => {
          if (!v) return def;
          if (v === "left" || v === "top") return 0;
          if (v === "right" || v === "bottom") return 1;
          if (v === "center") return 0.5;
          if (v.endsWith("%")) return parseFloat(v) / 100;
          return def;
        };
        const px = pct(pp[0], 0.5), py = pct(pp[1] || pp[0], 0.5);
        return { x: box.left + (box.width - dw) * px, y: box.top + (box.height - dh) * py, w: dw, h: dh };
      };
      const pick = (img, pl, x, y) => {
        const u = Math.floor(((x - pl.x) / pl.w) * img.w);
        const v = Math.floor(((y - pl.y) / pl.h) * img.h);
        if (u < 0 || v < 0 || u >= img.w || v >= img.h) return null;
        const i = (v * img.w + u) * 4;
        const d = img.d;
        return { l: lum(d[i], d[i + 1], d[i + 2]), a: d[i + 3] / 255 };
      };
      const inBox = (b, x, y) => b.width > 0 && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
      // real opacity = own opacity x every parent's (fading slides etc.)
      let opCache = new Map();
      const opacityOf = (el) => {
        if (!el || el === document.body || el === document.documentElement) return 1;
        if (opCache.has(el)) return opCache.get(el);
        const c = getComputedStyle(el);
        const v = c.visibility === "hidden" || c.display === "none" ? 0 : parseFloat(c.opacity) * opacityOf(el.parentElement);
        opCache.set(el, v);
        return v;
      };
      // colour layer an element paints at (x, y): {l, a} | "wait" | null
      const layer = (el, x, y) => {
        const c = getComputedStyle(el);
        if (c.visibility === "hidden" || c.display === "none") return null;
        const op = opacityOf(el);
        if (op < 0.05) return null;
        // must really cover the point (some hidden layers keep hit-testing
        // through their children while having no size themselves)
        if (!inBox(el.getBoundingClientRect(), x, y)) return null;
        const out = [];
        if (el.tagName === "IMG") {
          const src = el.currentSrc || el.src;
          if (src && el.complete && el.naturalWidth) {
            const img = load(src);
            if (img === "wait") return "wait";
            if (img !== "fail") {
              const p = pick(img, placed(el.getBoundingClientRect(), el.naturalWidth, el.naturalHeight, c.objectFit, c.objectPosition), x, y);
              if (p) out.push(p);
            }
          }
        } else if (el.tagName === "VIDEO") {
          // can't read video pixels: use its poster if it has one, otherwise
          // assume a darkish film (our hero / reel videos are)
          if (!el.poster) out.push({ l: 0.15, a: 1 });
          else {
            const img = load(el.poster);
            if (img === "wait") return "wait";
            if (img !== "fail") {
              const p = pick(img, placed(el.getBoundingClientRect(), img.iw, img.ih, c.objectFit, c.objectPosition), x, y);
              if (p) out.push(p);
            }
          }
        }
        if (el.tagName !== "IMG" && el.tagName !== "VIDEO") {
          const bi = c.backgroundImage;
          if (bi && bi !== "none") {
            const u = bi.match(/url\(["']?([^"')]+)["']?\)/);
            if (u) {
              const img = load(u[1]);
              if (img === "wait") return "wait";
              if (img !== "fail") {
                const sz = c.backgroundSize;
                const fit = sz === "cover" || sz === "contain" ? sz : sz === "auto" ? "none" : "fill";
                const p = pick(img, placed(el.getBoundingClientRect(), img.iw, img.ih, fit, c.backgroundPosition), x, y);
                if (p) out.push(p);
              }
            } else {
              const g = gradient(bi);
              if (g) out.push(g);
            }
          }
          const bc = parseColor(c.backgroundColor);
          if (bc && bc.a > 0.02) out.push(bc);
        }
        if (!out.length) return null;
        // image over its own background colour
        let l = 0, a = 0;
        for (let i = out.length - 1; i >= 0; i--) {
          l = l * (1 - out[i].a) + out[i].l * out[i].a;
          a = a + out[i].a * (1 - a);
        }
        return { l: a ? l / a : 0, a: a * op };
      };
      // the stack of elements painting at (x, y), top first; adds photos that
      // don't take pointer events (they are skipped by elementsFromPoint)
      let media = [];
      const stackAt = (x, y, skip) => {
        const st = document.elementsFromPoint(x, y).filter((e) => !skip(e));
        const extra = [];
        media.forEach((m) => {
          if (st.includes(m.el) || !inBox(m.r, x, y)) return;
          extra.push(m.el);
        });
        extra.forEach((m) => {
          const i = st.findIndex((e) => e.contains(m));
          if (i < 0) st.push(m);
          else st.splice(i, 0, m);
        });
        return st;
      };
      // luminance at one point: composite layers top-down until opaque
      const at = (x, y, skip) => {
        const st = stackAt(x, y, skip);
        const layers = [];
        let cover = 0;
        for (const el of st) {
          const L = layer(el, x, y);
          if (L === "wait") return "wait";
          if (!L) continue;
          layers.push(L);
          cover = cover + L.a * (1 - cover);
          if (cover > 0.97) break;
        }
        const base = parseColor(getComputedStyle(document.body).backgroundColor) || { l: 1 };
        let l = base.l;
        for (let i = layers.length - 1; i >= 0; i--) l = l * (1 - layers[i].a) + layers[i].l * layers[i].a;
        return l;
      };
      // average luminance behind a rectangle (grid of 5 x 3 points)
      const behind = (r, skip) => {
        opCache = new Map();
        // photos / videos overlapping the box (looked up once per call)
        media = [];
        document.querySelectorAll("img, video").forEach((el) => {
          if (skip(el)) return;
          const b = el.getBoundingClientRect();
          if (b.width && b.right >= r.left && b.left <= r.right && b.bottom >= r.top && b.top <= r.bottom)
            media.push({ el, r: b });
        });
        let sum = 0, n = 0, wait = 0;
        for (let i = 0; i < 5; i++)
          for (let j = 0; j < 3; j++) {
            const x = r.left + r.width * (0.1 + 0.2 * i);
            const y = r.top + r.height * (0.25 + 0.25 * j);
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
            const l = at(x, y, skip);
            if (l === "wait") wait++;
            else {
              sum += l;
              n++;
            }
          }
        if (!n || wait > n) return null;
        return sum / n;
      };
      return { behind, ready: (fn) => (onReady = fn) };
    })();
    // shared with section 39 (CTA buttons pick their colour the same way)
    window.__LUVE_PX = PX;

    // things that sit on top of the page and must not count as "behind"
    const skipUI = (e) =>
      e === wrap ||
      wrap.contains(e) ||
      e === fade ||
      !!(e.closest &&
        e.closest(
          ".cursor, [data-enq-trigger-mask], .floating-burger-btn, .anchor-scroll, .nav-bar"
        ));
    const LUM_DARK_LOGO = 0.38; // brighter than this -> brown wordmark
    const LUM_LIGHT_LOGO = 0.3; // darker than this -> light wordmark

    // Mini logo is always the dark brand colour: the top fade band now shows
    // whenever the mini logo / GET IN TOUCH / MENU are shown, so the wordmark
    // always sits on the page colour and no background detection is needed.
    const tone = () => {
      wrap.style.setProperty("--mini-c", DARK_LOGO);
      toneLight = false;
      updateFade();
    };
    // (old auto-tone, kept for reference — no longer used)
    const toneAuto = () => {
      const r = wrap.getBoundingClientRect();
      const x = r.left + Math.min(24, r.width / 2);
      const y = r.top + r.height / 2;
      let light = toneLight;
      // 1. Manual override in the Designer: data-logo-tone="light" | "dark"
      const forced = innermost(
        document.querySelectorAll("[data-logo-tone]"),
        x,
        y
      );
      // The page-colour band (top fade) shows unless a full-screen photo,
      // video or dark block is passing under the top; while it shows, the
      // wordmark sits on the page colour, so it is simply the brown one.
      photoTop = photoBehindTop();
      const bandOn =
        scrolledNow &&
        !photoTop &&
        !document.body.classList.contains("side-menu-open");
      if (forced) {
        light = forced.getAttribute("data-logo-tone") === "light";
      } else if (bandOn) {
        light = false;
      } else {
        // 2. Automatic: measure the real pixels right behind the wordmark.
        //    Between the two thresholds keep the current colour, so it
        //    doesn't flicker on mid-tone photos.
        const l = r.width ? PX.behind(r, skipUI) : null;
        if (l !== null) {
          if (l < LUM_LIGHT_LOGO) light = true;
          else if (l > LUM_DARK_LOGO) light = false;
        } else {
          // 3. Photo not readable yet: the old rule (dark section with a
          //    photo / video / dark fill really painted there)
          const sec = innermost(
            document.querySelectorAll('[data-theme="dark"]'),
            x,
            y
          );
          light = !!sec && paintsDark(sec, x, y);
        }
      }
      wrap.style.setProperty("--mini-c", light ? LIGHT_LOGO : DARK_LOGO);
      toneLight = light;
      updateFade();
    };
    // at most ~10 measurements a second while scrolling, plus one at the end
    let toneT = 0,
      toneTimer = 0;
    const requestTone = () => {
      if (!shown) return;
      const now = performance.now();
      clearTimeout(toneTimer);
      if (now - toneT > 100) {
        toneT = now;
        tone();
      }
      toneTimer = setTimeout(() => {
        toneT = performance.now();
        shown && tone();
      }, 120);
    };
    PX.ready(requestTone);

    // Is a full-screen photo / video (hero, banner) or a dark block passing
    // under the top band? Then the page-colour fade would look like a stripe
    // across it, so keep it off. Project photos inside the content (shorter
    // than ~3/4 of the screen) keep the fade, so text never clashes with the
    // logo and pills while reading.
    let photoTop = false;
    const photoBehindTop = () => {
      const band =
        parseFloat(fade.style.getPropertyValue("--fade-h")) || 90;
      const big = innerHeight * 0.75;
      for (const m of document.querySelectorAll("img, video")) {
        if (wrap.contains(m)) continue;
        const b = m.getBoundingClientRect();
        if (b.bottom <= 0 || b.top >= band || b.width < innerWidth * 0.4)
          continue;
        if (m.tagName === "IMG" && !(m.complete && m.naturalWidth > 0))
          continue;
        if (!isShown(m) || getComputedStyle(m).position === "fixed") continue;
        if (m.tagName === "VIDEO" || b.height >= big) return true;
      }
      for (const el of document.elementsFromPoint(innerWidth / 2, 8)) {
        if (el === fade || wrap.contains(el)) continue;
        if (el === document.body || el === document.documentElement) continue;
        const c = getComputedStyle(el);
        if (c.position === "fixed") continue;
        if (darkColor(c.backgroundColor) && el.offsetWidth >= innerWidth * 0.6)
          return true;
        if (c.backgroundImage !== "none" && el.offsetHeight >= big) return true;
      }
      return false;
    };

    let scrolledNow = false;
    const updateFade = () => {
      fade.classList.toggle(
        "is-on",
        scrolledNow && !document.body.classList.contains("side-menu-open")
      );
    };

    const setShown = (show) => {
      if (show === shown) return;
      shown = show;
      if (show) place();
      wrap.style.pointerEvents = show ? "auto" : "none";
      link.tabIndex = show ? 0 : -1;
      wrap.classList.toggle("is-on", show);
    };

    // Desktop: the big centre logo makes way once the page is scrolled (mobile
    // already hides it on scroll). Done with a body class + !important CSS so
    // other scripts touching the logo can't bring it back by accident.
    // When the side menu is opened from the floating MENU, the logo comes back
    // in its original centre position together with the menu, and leaves
    // again as the menu closes.
    let bigHidden = false;
    const setBigHidden = (hide) => {
      hide = hide && desktop.matches;
      if (hide === bigHidden) return;
      bigHidden = hide;
      if (hide && !document.body.classList.contains("nav-big-anim"))
        document.body.classList.add("nav-big-anim");
      document.body.classList.toggle("nav-big-hidden", hide);
      if (!hide && document.body.classList.contains("nav-menu-closing"))
        document.body.classList.remove("nav-menu-closing");
    };
    const markClosing = () => {
      if (document.body.classList.contains("side-menu-open"))
        document.body.classList.add("nav-menu-closing");
    };
    document.addEventListener(
      "click",
      (e) => {
        const t = e.target;
        if (!t || !t.closest) return;
        if (
          t.closest("[data-side-menu-close]") ||
          t.closest(".floating-burger-btn") ||
          t.classList.contains("side-menu-bg")
        )
          markClosing();
      },
      true
    );
    document.addEventListener(
      "keydown",
      (e) => e.key === "Escape" && markClosing(),
      true
    );
    new MutationObserver(() => {
      // only touch the class when it is really there: classList.remove()
      // rewrites the attribute even when nothing changes, which would
      // re-trigger this observer forever and freeze the page
      const bc = document.body.classList;
      if (!bc.contains("side-menu-open") && bc.contains("nav-menu-closing"))
        bc.remove("nav-menu-closing");
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Desktop: GET IN TOUCH's holder takes its top from MENU. If MENU was
    // re-positioned later (size change, fonts loading), copy the new top over
    // so the two pills always sit on one line.
    const pairPills = () => {
      const menuEl = document.querySelector(".floating-burger-btn");
      const maskEl = document.querySelector("[data-enq-trigger-mask]");
      if (!menuEl || !maskEl || maskEl.contains(menuEl)) return;
      const top = menuEl.style.top;
      if (top && maskEl.style.top !== top) maskEl.style.top = top;
    };
    if (window.FloatingCtaController && window.FloatingCtaController.syncFloatingPosition)
      window.FloatingCtaController.syncFloatingPosition();
    pairPills();

    const sync = () => {
      pairPills();
      const scrolled = window.scrollY > window.innerHeight * 0.15;
      scrolledNow = scrolled;
      setBigHidden(scrolled);
      setShown(scrolled && !document.body.classList.contains("side-menu-open"));
      updateFade();
      if (scrolled) {
        place();
        requestTone();
      }
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", () => {
      if (!desktop.matches && bigHidden) setBigHidden(false);
      place();
      sync();
    });
    // images that finish loading later can change what is behind the logo
    window.addEventListener("load", requestTone);
    new MutationObserver(sync).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    sync();
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();

// =====================================================
// 38. Contact Page — Mobile Scroll Lock
// 功能：手機 / 平板（< 992px）Contact page 未開 form 時成頁鎖死唔可以碌，
//       nav-bar 亦唔會因為碌動而有變化。開咗 form 之後，form 自己個框可以碌。
//       iPhone 嘅 100vh 比實際見到嘅畫面高（因為底部工具列），所以改用
//       100dvh，等成頁啱啱好放得落，冇多餘位可以碌。
// =====================================================
(function initContactScrollLock() {
  if (!document.body.classList.contains("body-contact")) return;
  document.documentElement.classList.add("is-contact-page");
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width:991px){
      html.is-contact-page,html.is-contact-page body{height:100%;overflow:hidden!important;overscroll-behavior:none}
      html.is-contact-page .section-contact{height:100vh;height:100dvh}
      html.is-contact-page .contact-body-form{height:100vh;height:100dvh;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
    }
  `;
  document.head.appendChild(style);
  const mq = window.matchMedia("(max-width: 991px)");
  const toTop = () => mq.matches && window.scrollY && window.scrollTo(0, 0);
  toTop();
  window.addEventListener("load", toTop);
  window.addEventListener("resize", toTop);
})();

// =====================================================
// 39. CTA Buttons — Pill Size & Contrast Colour
// 功能：Home（is-home / is-cta）、Process（is-process）、Profile（is-cta /
//       is-profile）同 Process FAQ section（is-faq）嘅 btn-wrapper 改成同 GET IN TOUCH / MENU 一樣大細
//       （電腦版 34px 高、12px 字；手機版 26px 高、10px 字）。
//       顏色跟後面嘅深淺：用 section 37 同一個方法量度掣後面嘅真實像素，
//       後面深色 → 淺色掣 + 啡色字（class "is-on-dark"，hover 轉啡色）；
//       後面淺色 → 保持啡色掣 + 淺色字。
//       另外手機版掣唔會闊過畫面，避免 Process page 可以左右碌。
// =====================================================
(function initCtaPills() {
  const SEL =
    ".btn-wrapper.is-home, .btn-wrapper.is-process, .btn-wrapper.is-cta, .btn-wrapper.is-profile, .btn-wrapper.is-faq";
  const T = "html body .btn-wrapper";
  const style = document.createElement("style");
  style.textContent = `
    ${T}.is-home,${T}.is-process,${T}.is-cta,${T}.is-profile,${T}.is-faq{padding:10px 24px!important;min-height:0!important;height:auto!important;flex-shrink:0!important;max-width:100%}
    ${T}.is-home .btn-text,${T}.is-process .btn-text,${T}.is-cta .btn-text,${T}.is-profile .btn-text,${T}.is-faq .btn-text{font-size:12px!important;line-height:14px!important}
    @media (max-width:991px){
      ${T}.is-home,${T}.is-process,${T}.is-cta,${T}.is-profile,${T}.is-faq{padding:7px 15px!important}
      ${T}.is-home .btn-text,${T}.is-process .btn-text,${T}.is-cta .btn-text,${T}.is-profile .btn-text,${T}.is-faq .btn-text{font-size:10px!important;line-height:12px!important}
      body .cta-section{overflow-x:clip}
    }
  `;
  document.head.appendChild(style);

  const start = () => {
    const buttons = [...document.querySelectorAll(SEL)];
    if (!buttons.length) return;
    const skip = (btn) => (e) =>
      btn.contains(e) ||
      !!(e.closest &&
        e.closest(
          ".nav-mini-logo, .nav-top-fade, .cursor, [data-enq-trigger-mask], .floating-burger-btn, .anchor-scroll, .nav-bar"
        ));
    const check = (btn) => {
      const PX = window.__LUVE_PX;
      if (!PX || btn.matches(":hover")) return;
      const r = btn.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      const l = PX.behind(r, skip(btn));
      if (l === null) return setTimeout(() => check(btn), 600); // photo still loading
      const dark = btn.classList.contains("is-on-dark");
      const next = l < 0.3 ? true : l > 0.38 ? false : dark;
      if (next === dark) return;
      btn.classList.toggle("is-on-dark", next);
      if (btn.__ctaSetIdle) btn.__ctaSetIdle(0.45);
    };
    const visible = new Set();
    const io = new IntersectionObserver((entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          visible.add(en.target);
          check(en.target);
        } else visible.delete(en.target);
      })
    );
    buttons.forEach((b) => io.observe(b));
    // backgrounds can move under the button (parallax), so re-check the
    // visible ones a few times a second while scrolling
    let last = 0;
    window.addEventListener(
      "scroll",
      () => {
        const now = performance.now();
        if (now - last < 250) return;
        last = now;
        visible.forEach(check);
      },
      { passive: true }
    );
    window.addEventListener("resize", () => visible.forEach(check));
  };
  if (document.readyState === "complete") setTimeout(start, 300);
  else window.addEventListener("load", () => setTimeout(start, 300));
})();

// =====================================================
// 40. Small Style Fixes — Hover Dot & FAQ Spacing
// 功能：1. 所有掣 hover 時出現嘅小波點（.btn-arrow）縮細到 7px，並且
//          垂直置中（掣縮細咗之後原本嘅位置會偏）。
//       2. FAQ 答案行距加大（原本 20px 字配 25.6px 行高，好密），
//          問題兩行時都唔會黐埋。
// =====================================================
(function initSmallStyleFixes() {
  const style = document.createElement("style");
  style.textContent = `
    html body .btn-arrow{width:7px!important;height:7px!important;min-width:7px!important;top:50%!important;bottom:auto!important;margin-top:-3.5px!important}
    html body [data-enq-root] .btn-arrow{width:7px!important;height:7px!important;min-width:7px!important;margin:-3.5px 0 0!important}
    html body .faq-item-body,html body .faq-item-body-inner,html body .faq-answer{line-height:1.7!important}
    html body .faq-answer{max-width:62ch}
    html body .faq-question{line-height:1.25!important}
  `;
  document.head.appendChild(style);
})();

// =====================================================
// 41. Process FAQ — Native Accordion + Image Crossfade
// 功能：Process Page 嘅 FAQ（Designer 入面 .lfq-* elements + CMS list）
//       撳題目開／收答案；左邊 .lfq-pics 跟住淡入淡出嗰題嘅 CMS 圖；
//       [data-lfq-enquire] 同答案入面 #get-in-touch 連結會打開 Enquiry panel
//       State CSS 喺頁面 "FAQ State CSS" embed
// =====================================================
(function () {
  function init() {
    var root = document.querySelector(".lfq");
    if (!root || root.dataset.lfqInit) return;
    root.dataset.lfqInit = "1";

    var rows = [].slice.call(root.querySelectorAll(".lfq-row"));
    var pics = root.querySelector(".lfq-pics");

    var openEnquiry = function (e) {
      if (e) e.preventDefault();
      var t = document.querySelector('[data-enq-action="open"]');
      if (t) t.click();
    };
    root
      .querySelectorAll('[data-lfq-enquire], .lfq-rich a[href="#get-in-touch"]')
      .forEach(function (a) {
        a.addEventListener("click", openEnquiry);
      });

    var imgs = rows.map(function (r) {
      var src = r.querySelector(".lfq-row-img");
      if (!pics || !src) return null;
      var p = document.createElement("img");
      p.alt = "";
      p.src = src.currentSrc || src.src;
      if (src.srcset) {
        p.srcset = src.srcset;
        p.sizes = "(max-width: 767px) 90vw, 380px";
      }
      pics.appendChild(p);
      return p;
    });

    var setOpen = function (i) {
      rows.forEach(function (r, k) {
        var on = k === i;
        r.classList.toggle("is-open", on);
        var q = r.querySelector(".lfq-q");
        if (q) q.setAttribute("aria-expanded", on ? "true" : "false");
      });
      imgs.forEach(function (p, k) {
        if (p) p.classList.toggle("is-on", k === i);
      });
    };

    rows.forEach(function (r, i) {
      var q = r.querySelector(".lfq-q");
      if (!q) return;
      q.setAttribute("role", "button");
      q.setAttribute("tabindex", "0");
      q.addEventListener("click", function () {
        setOpen(r.classList.contains("is-open") ? -1 : i);
      });
      q.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          q.click();
        }
      });
    });

    if (rows.length) setOpen(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// =====================================================
// 42. Back-to-Top — Round Button on Phones + Reliable Scroll
// 功能：手機（≤767px）所有頁面嘅 .anchor-scroll 變成細粒圓形啡色掣
//       （同 Digital Card 頁啲掣一樣），唔再遮住內容。
//       撳掣返頂：電腦用 Lenis；手機用自己嘅 easing 捲動，
//       因為網站冇載入 GSAP ScrollToPlugin，手機以前撳咗冇反應。
//       亦防止手機版成頁可以左右 scroll。
// =====================================================
(function initBackToTop() {
  var css = document.createElement("style");
  css.textContent =
    "@media (max-width:767px){" +
    "html,html body{overflow-x:clip}" +
    "html body .anchor-scroll{width:44px!important;height:44px!important;right:16px!important;bottom:calc(16px + env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;padding:0!important;border-radius:50%;background:#795e49;color:#f0e8dd;display:flex!important;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 10px 26px -10px rgba(48,30,18,.55);-webkit-tap-highlight-color:transparent}" +
    "html body .anchor-scroll::before{content:'';position:absolute;inset:-1px;border-radius:50%;background:#f0e8dd;clip-path:circle(0% at 50% 100%);transition:clip-path .55s cubic-bezier(.65,0,.35,1)}" +
    "html body .anchor-scroll:active::before{clip-path:circle(75% at 50% 50%)}" +
    "html body .anchor-scroll .anchor-arrow{position:relative;z-index:1;width:26px!important;height:26px!important;color:#f0e8dd!important;transition:color .45s ease}" +
    "html body .anchor-scroll:active .anchor-arrow{color:#795e49!important}" +
    // the double chevron sits 4/48 below the svg centre; lift it so it is
    // optically centred, and keep GSAP hover/show offsets off on phones
    "html body .anchor-scroll .anchor-arrow{transform:none!important;translate:none!important;display:flex!important;align-items:center;justify-content:center;margin:0!important}" +
    "html body .anchor-scroll .anchor-arrow svg{transform:translateY(-8.333%)}" +
    // circle and arrow are one unit: only .anchor-scroll fades in/out
    "html body .anchor-scroll .anchor-arrow{opacity:1!important;visibility:inherit!important}" +
    "}";
  document.head.appendChild(css);

  var touch = function () {
    return window.matchMedia("(hover:none),(pointer:coarse)").matches;
  };
  var busy = false;
  var toTop = function () {
    if (window.lenis && !touch()) {
      window.lenis.scrollTo(0, {
        duration: 1.2,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        force: true,
      });
      return;
    }
    if (busy) return;
    busy = true;
    var el = document.scrollingElement || document.documentElement;
    var from = el.scrollTop,
      t0 = performance.now(),
      dur = Math.min(1100, 450 + from / 12);
    var ease = function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      el.scrollTop = from * (1 - ease(p));
      if (p < 1) requestAnimationFrame(step);
      else {
        busy = false;
        if (window.lenis && window.lenis.scrollTo)
          window.lenis.scrollTo(0, { immediate: true, force: true });
      }
    };
    requestAnimationFrame(step);
  };

  // capture phase: runs before the older handlers (sections 07 / 17 / 18)
  // and stops them, so only one scroll happens
  var handle = function (e) {
    var a = e.target && e.target.closest && e.target.closest(".anchor-scroll");
    if (!a) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === "click" || touch()) toTop();
  };
  document.addEventListener("click", handle, true);
  document.addEventListener("touchend", handle, { capture: true, passive: false });
})();

// =====================================================
// 43. Project Page — More Section Header + Hide Empty Size
// 功能："More of {Project}" 標籤跟 Profile 頁 small-eyebrow-text
//       （手機置中、冇圓點；電腦版有圓點、靠左）。
//       "See All ＞" 細箭咀，同字垂直置中並排。
//       Size (sq. ft.) 冇資料嗰陣隱藏成格。
// =====================================================
(function initMoreHeader() {
  var css = document.createElement("style");
  css.textContent =
    // ── Native section (.more-*) — layout/typography live in Webflow Designer;
    //    only behaviour that Designer can't express is here ──
    "html body .more-strip-outer,html body .more-strip{cursor:none}" +
    "html body .more-strip{scrollbar-width:none;-ms-overflow-style:none;user-select:none;-webkit-user-select:none}" +
    "html body .more-strip::-webkit-scrollbar{display:none}" +
    "html body .more-item .more-item-img{position:relative!important;display:block!important;height:100%!important;width:auto!important;max-width:none!important;object-fit:cover!important;pointer-events:none;transition:transform .7s cubic-bezier(.22,1,.36,1)}" +
    "@media (hover:hover){html body .more-item:hover .more-item-img{transform:scale(1.04)}}" +
    "html body .more-arrow,html body .luve-more-arrow{transition:opacity .35s ease,transform .45s cubic-bezier(.65,0,.35,1);-webkit-tap-highlight-color:transparent}" +
    "@media (hover:hover){html body .is-prev.more-arrow:hover,html body .is-prev.luve-more-arrow:hover{transform:translateX(-3px)}html body .is-next.more-arrow:hover,html body .is-next.luve-more-arrow:hover{transform:translateX(3px)}}" +
    "html body .more-arrow.is-off,html body .luve-more-arrow.is-off{opacity:.2!important;pointer-events:none}" +
    "html body .more-arrow-icon .w-embed,html body .more-arrow-icon>div{width:100%;height:100%}" +
    // ── Fallback (script-built .luve-more-*), used only if the Designer section is missing ──
    "html body .luve-more-header{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:20px;margin-bottom:10px!important}" +
    "html body .luve-more-eyebrow{display:flex;align-items:center;gap:8px;padding:0!important;margin:0!important}" +
    "html body .luve-more-label{margin:0!important;padding:0!important;display:block!important;white-space:nowrap;font-family:var(--_typography---text-large-font-family);font-size:var(--_typography---text-large-font-size)!important;line-height:var(--_typography---text-large-line-height)!important;letter-spacing:var(--_typography---h4-letter-spacing)!important;text-transform:capitalize!important;font-weight:500;color:rgba(121,94,73,.6)}" +
    "html body .luve-more-label::before{content:none!important;display:none!important}" +
    "html body .luve-more-nav{display:flex;justify-content:space-between;align-items:center}" +
    "html body .luve-more-arrow{appearance:none;-webkit-appearance:none;background:none;border:0;padding:0;margin:0;width:56px;height:44px;display:flex;align-items:center;color:#795e49;opacity:.6}" +
    "html body .luve-more-arrow.is-next{justify-content:flex-end}" +
    "html body .luve-more-arrow svg{width:14px;height:26px;display:block}" +
    "@media (hover:hover){html body .luve-more-arrow:hover{opacity:1}}" +
    "@media (max-width:991px){html body .luve-more-label{font-weight:400}}" +
    "@media (hover:none){html body .luve-more-item:hover img{transform:none}}" +
    "@media (max-width:767px){" +
    "html body .luve-more-eyebrow{justify-content:center}" +
    "html body .luve-more-label{white-space:normal;text-align:center}" +
    "html body .luve-more-eyebrow .services-eyebrow-dot{display:none!important}" +
    "html body .luve-more-arrow{width:40px;height:32px}" +
    "html body .luve-more-arrow svg{width:9px;height:16px}" +
    "html body .luve-more-strip{padding-inline:11vw!important;gap:2vw!important}" +
    "html body .luve-more-item{width:78vw!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:4/5}" +
    "html body .luve-more-item img{width:100%!important;height:100%!important;object-fit:cover!important}" +
    "}" +
    // ── Phones: one photo centred per stop; neighbours smaller ──
    "@media (max-width:767px){" +
    "html body .more-strip,html body .luve-more-strip{scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y}" +
    "html body .is-strip-item{scroll-snap-align:center;scroll-snap-stop:always;transform:scale(.86);opacity:.7;transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .6s ease}" +
    "html body .is-strip-item.is-active{transform:scale(1);opacity:1}" +
    "html body .more-item .more-item-img{width:100%!important;height:100%!important}" +
    "}" +
    // project description (Rich Text): short paragraphs with breathing room
    "html body .project-content-paragraph.is-rich>*{margin:0 0 1em;font:inherit;letter-spacing:inherit;color:inherit}" +
    "html body .project-content-paragraph.is-rich>*:last-child{margin-bottom:0}";
  document.head.appendChild(css);

  // ── ＜ ＞ buttons + centred "active" photo on phones ──
  var strip = document.querySelector(".more-strip, .luve-more-strip");
  var prev = document.querySelector(".more-arrow.is-prev, .luve-more-arrow.is-prev");
  var next = document.querySelector(".more-arrow.is-next, .luve-more-arrow.is-next");
  if (strip) {
    var items = [].slice.call(strip.querySelectorAll(".is-strip-item"));
    var mq = window.matchMedia("(max-width:767px)");
    var padL = function () {
      return parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    };
    // scroll position that shows an item (centred on phones, left-aligned on desktop)
    var targetOf = function (it) {
      var max = strip.scrollWidth - strip.clientWidth;
      var x = mq.matches
        ? it.offsetLeft + it.offsetWidth / 2 - strip.clientWidth / 2
        : it.offsetLeft - padL();
      return Math.max(0, Math.min(max, x));
    };
    var current = function () {
      var best = 0,
        d = Infinity;
      items.forEach(function (it, i) {
        var dd = Math.abs(targetOf(it) - strip.scrollLeft);
        if (dd < d) {
          d = dd;
          best = i;
        }
      });
      return best;
    };
    var go = function (dir) {
      if (!items.length) return;
      var i = Math.max(0, Math.min(items.length - 1, current() + dir));
      strip.scrollTo({ left: targetOf(items[i]), behavior: "smooth" });
    };
    var bind = function (btn, dir) {
      if (!btn) return;
      btn.setAttribute("role", "button");
      btn.addEventListener(
        "click",
        function (e) {
          e.preventDefault(); // the Designer arrows are links (href="#")
          e.stopImmediatePropagation();
          go(dir);
        },
        true
      );
    };
    bind(prev, -1);
    bind(next, 1);

    // offsetLeft must be measured against the strip
    if (getComputedStyle(strip).position === "static") strip.style.position = "relative";

    var raf = 0;
    var update = function () {
      raf = 0;
      var max = strip.scrollWidth - strip.clientWidth;
      if (prev) prev.classList.toggle("is-off", strip.scrollLeft <= 4);
      if (next) next.classList.toggle("is-off", strip.scrollLeft >= max - 4);
      if (mq.matches) {
        var c = strip.scrollLeft + strip.clientWidth / 2,
          best = null,
          d = Infinity;
        items.forEach(function (it) {
          var dd = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c);
          if (dd < d) {
            d = dd;
            best = it;
          }
        });
        items.forEach(function (it) {
          it.classList.toggle("is-active", it === best);
        });
      }
    };
    strip.addEventListener(
      "scroll",
      function () {
        if (!raf) raf = requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 600);
  }

  // hide a project detail (e.g. Size) when its CMS value is empty
  document.querySelectorAll(".project-details-wrap").forEach(function (w) {
    var kids = w.children;
    if (kids.length < 2) return;
    var val = kids[kids.length - 1];
    if (
      val.classList.contains("w-dyn-bind-empty") ||
      !val.textContent.trim()
    )
      w.style.display = "none";
  });
})();
