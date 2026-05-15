// =============================================================================
// TABLE OF CONTENTS (目錄)
// =============================================================================
//
// 01. LUVE Home — Card Hover Effects (True Mask Effect)
// 02. Hero Slider — Auto Play & Nav Progress
// 03. Global Menus (Primary & Floating) — Navigation Logic
// 04. FAQ Accordion (General) — General Version
// 05. Contact Page — Form Switcher & Mobile Animations
//
// 07. Global Hover Effects — Links, Social Icons, Underlines
// 08. Back-to-Top Arrow — Color Detection & Scroll Logic
// 09. Custom Cursor — Desktop Only (Warm & Glass Effects)
// 10. CTA Button Hover — Standard Buttons
// 11. Swiper Slider Section — Gallery Components
// 12. Global Navbar Controller — Show/Hide & Theme Logic
// 13. Universal CTA Hover — Push Effect & Arrow Slide
// 14. Award Carousel — Infinite Scroll (Marquee)
// 15. Text Animations — Global SplitType (Slide Up, Fade In)
// 16. Process Page — Hero Motion
// 17. Process Page — Card Stacking Effect
// 18. Process Page — Navbar Theme Logic
// 19. Process Page — Anchor Scroll Display
// 20. Profile Page — Hero Scroll Parallax & Overlay
// 21. Studio Page — Team Member Hover
// 22. Helper Functions — Split Masks & Viewport Detection
// 23. Universal Line Reveal — Scroll Animation
// 24. Projects Page — Filter System & Entry Animation
// 25. Featured Projects — Reveal & Hover Effects
// 26. Navbar Reveal — Intro Animation
// 27. Smart Page Loader — Transition & Loading Bar
// 28. Footer — Real-time Clock & Status (HK Time)
// 29. Footer — Auto Copyright Year
// 30. Smooth Scroll (Lenis) & Parallax Elements
// 31. Project Gallery Reveal — Fade Out & Scale
// 32. Next Project Link — Reveal & Hover
// 33. Home Scroll Expansion — Video/Image Scale (Exo Ape Style)
// 34. Home Nav & Floating Button — Visibility Logic
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
// 03. UNIFIED Menu System (Single Side Menu)
// 功能：統一處理 nav-bar 同 floating button 既 menu
// + 加入「動畫中保護」(tl.isActive / tl.reversed) — 狂撳都唔亂
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // -----------------------------------------------------
  // Global State
  // -----------------------------------------------------
  window.__MENU_STATE__ = window.__MENU_STATE__ || {
    menuOpen: false, // ← 只需要一個狀態
  };

  const STATE = window.__MENU_STATE__;

  // 檢查係咪固定顏色頁面
  const isFixedColorPage =
    document.body.classList.contains("is-contact") ||
    !!document.querySelector(".is-contact") ||
    document.body.classList.contains("body-projects") ||
    !!document.querySelector(".body-projects");

  // Scroll Lock
  const lockScroll = () => {
    if (window.lenis) window.lenis.stop();
    else document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (window.lenis) window.lenis.start();
    else document.body.style.overflow = "";
  };

  // -----------------------------------------------------
  // Elements
  // -----------------------------------------------------
  const navBar = document.querySelector(".nav-bar");
  const navBurger = document.querySelector(".class-nav-burger");
  const floatingBtn = document.querySelector(".floating-burger-btn");

  const sideMenu = document.querySelector(".side-bar");
  const overlay = document.querySelector(".side-menu-bg");

  const navLogo = navBar?.querySelector(".nav-logo-svg");
  const navLogoLink = navBar?.querySelector(".nav-logo-link");
  const navBurgerLines = navBurger?.querySelectorAll(".hamburger-1-line") || [];

  if (!navBar || !navBurger || !sideMenu || !overlay) {
    console.error("Missing required menu elements");
    return;
  }

  // -----------------------------------------------------
  // Initial Setup
  // -----------------------------------------------------
  gsap.set(sideMenu, { xPercent: 100 });
  gsap.set(overlay, { autoAlpha: 0, display: "none", pointerEvents: "none" });

  // -----------------------------------------------------
  // Theme Control
  // -----------------------------------------------------
  const setMenuTheme = (isOpen) => {
    if (isFixedColorPage) return;

    const color = isOpen ? "#795e49" : "#f0e8dd";

    if (navLogo) {
      gsap.to(navLogo, {
        color,
        fill: color,
        duration: 1.0,
        overwrite: "auto",
      });
    }

    if (navBurgerLines.length) {
      gsap.to(navBurgerLines, {
        backgroundColor: color,
        duration: 1.0,
        overwrite: "auto",
      });
    }
  };

  // -----------------------------------------------------
  // Nav-bar Visibility Control
  // -----------------------------------------------------
  const showNavBar = () => {
    gsap.killTweensOf(navBar);
    gsap.to(navBar, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const hideNavBar = () => {
    gsap.killTweensOf(navBar);
    gsap.to(navBar, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // -----------------------------------------------------
  // Floating Button Control
  // -----------------------------------------------------
  const hideFloatingBtn = () => {
    if (!floatingBtn) return;
    gsap.killTweensOf(floatingBtn);
    floatingBtn.style.pointerEvents = "none";
    gsap.to(floatingBtn, {
      autoAlpha: 0,
      duration: 0.15,
      ease: "power1.out",
      overwrite: "auto",
    });
  };

  const showFloatingBtn = () => {
    if (!floatingBtn) return;
    // 只有當 scroll 夠遠先顯示
    if (window.scrollY > window.innerHeight * 0.15) {
      gsap.killTweensOf(floatingBtn);
      floatingBtn.style.pointerEvents = "auto";
      gsap.to(floatingBtn, {
        autoAlpha: 1,
        duration: 0.15,
        ease: "power1.out",
        overwrite: "auto",
      });
    }
  };

  // -----------------------------------------------------
  // Menu Timeline (動畫中保護核心)
  // -----------------------------------------------------
  const MENU_DUR = 0.6;
  const OVERLAY_DUR = 0.6;

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out", overwrite: "auto" },
  });

  // 開啟動畫：sideMenu 入 + overlay 淡入（同時）
  tl.to(sideMenu, { xPercent: 0, duration: MENU_DUR }, 0);
  tl.to(overlay, { autoAlpha: 1, duration: OVERLAY_DUR }, 0);

  // ✅ 初始視為「關閉狀態」：timeline 反向且停在 0
  tl.progress(0).reversed(true).pause();

  // timeline 完成（已開啟）
  tl.eventCallback("onComplete", () => {
    STATE.menuOpen = true;
  });

  // timeline 完全 reverse 完成（已關閉）
  tl.eventCallback("onReverseComplete", () => {
    STATE.menuOpen = false;

    gsap.set(overlay, { display: "none" });
    unlockScroll();

    // ★ 關閉後，根據 scroll 位置決定顯示邊個
    setTimeout(() => {
      if (window.scrollY > 10) {
        hideNavBar();
        showFloatingBtn();
      } else {
        showNavBar();
        hideFloatingBtn();
      }
    }, 50);
  });

  // -----------------------------------------------------
  // Menu Open/Close Functions (Timeline-based)
  // -----------------------------------------------------
  const openMenu = () => {
    // 如果已經開咗 / 或者正在向開方向行進，就唔重複
    if (!tl.reversed() || STATE.menuOpen) return;

    // ★ 一開始就視為 open（避免 ScrollTrigger 介入顯示邏輯）
    STATE.menuOpen = true;
    navBurger.classList.add("w--open");

    // ★ 開 menu 時強制顯示 nav-bar（咁 logo 就會出現）
    showNavBar();

    // ★ 隱藏 floating button
    hideFloatingBtn();

    // 設定 overlay
    gsap.set(overlay, { display: "block", pointerEvents: "auto" });

    // 鎖定 scroll
    lockScroll();

    // 設定主題
    setMenuTheme(true);

    // 動畫播放
    tl.play();
  };

  const closeMenu = () => {
    // 如果已經完全關閉（反向且 progress=0），就唔重複
    if (tl.reversed() && tl.progress() === 0) return;

    navBurger.classList.remove("w--open");

    // 設定主題
    setMenuTheme(false);

    // 停止 overlay 接收點擊（立即）
    gsap.set(overlay, { pointerEvents: "none" });

    // 動畫倒播（真正 STATE.menuOpen=false 會喺 onReverseComplete）
    tl.reverse();
  };

  // -----------------------------------------------------
  // Event Listeners
  // -----------------------------------------------------

  // Nav Burger Click (含動畫中保護)
  navBurger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // ★ 動畫中保護：正在播就即時反向（狂撳都唔亂）
    if (tl.isActive()) {
      if (tl.reversed()) openMenu();
      else closeMenu();
      return;
    }

    // 非動畫中：正常 toggle
    STATE.menuOpen ? closeMenu() : openMenu();
  });

  // Floating Button Click (含動畫中保護)
  if (floatingBtn) {
    floatingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (tl.isActive()) {
        if (tl.reversed()) openMenu();
        else closeMenu();
        return;
      }

      STATE.menuOpen ? closeMenu() : openMenu();
    });
  }

  // Overlay Click (點擊背景關閉)
  overlay.addEventListener("click", (e) => {
    if (e.target !== overlay) return;
    closeMenu();
  });

  // Side Menu Click (阻止關閉)
  sideMenu.addEventListener("click", (e) => e.stopPropagation());

  // ESC Key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && STATE.menuOpen) {
      closeMenu();
    }
  });

  // -----------------------------------------------------
  // Scroll-based Nav/Floating Button Visibility
  // (只在 menu 冇開既時候先控制)
  // -----------------------------------------------------
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      // ★ Menu 開緊就唔控制 visibility
      if (STATE.menuOpen) return;

      const scrollY = self.scroll();
      const threshold = window.innerHeight * 0.15;

      if (scrollY > 10) {
        hideNavBar();
      } else {
        showNavBar();
      }

      if (scrollY > threshold) {
        showFloatingBtn();
      } else {
        hideFloatingBtn();
      }
    },
  });

  // -----------------------------------------------------
  // Dark Theme Detection for Floating Button
  // -----------------------------------------------------
  if (floatingBtn) {
    const darkSections = document.querySelectorAll('[data-theme="dark"]');

    darkSections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 50px",
        end: "bottom 50px",
        onEnter: () => floatingBtn.classList.add("is-dark"),
        onEnterBack: () => floatingBtn.classList.add("is-dark"),
        onLeave: () => floatingBtn.classList.remove("is-dark"),
        onLeaveBack: () => floatingBtn.classList.remove("is-dark"),
      });
    });
  }
});

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
// 07. Global Hover Effects (Links, Socials, Underlines)
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
    ".footer-section a, .new-client-contact-link, .media-contact-link, .general-contact-link, .careers-contact-link, .footer-nav-link, a.w--current"
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
// 08. Back-to-Top Arrow (Color Detection)
// 功能：回到頂部箭頭，自動偵測背景顏色變色
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const arrow = document.querySelector(".anchor-arrow");
  if (!arrow) return;

  const LIGHT = "#f0e8dd";
  const DARK = "#795e49";
  const BRIGHT_THRESHOLD = 165;

  let ctaActiveCount = 0;
  let footerActiveCount = 0;

  const parseRGBA = (str) => {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return [+m[1], +m[2], +m[3], m[4] ? +m[4] : 1];
  };

  function detectBackground(svg) {
    const rect = svg.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    let el = document.elementFromPoint(x, y);
    let steps = 0;

    while (el && steps++ < 10) {
      const cs = getComputedStyle(el);
      if (el.tagName === "IMG" || cs.backgroundImage !== "none") return "image";
      const rgba = parseRGBA(cs.backgroundColor);
      if (rgba && rgba[3] > 0) {
        const lum = rgba[0] * 0.299 + rgba[1] * 0.587 + rgba[2] * 0.114;
        return lum > BRIGHT_THRESHOLD ? "light" : "dark";
      }
      el = el.parentElement;
    }
    return "light";
  }

  function tweenArrowColor(targetColor) {
    gsap.killTweensOf(arrow);
    gsap.to(arrow, {
      color: targetColor,
      duration: 0.35,
      delay: 0.06,
      ease: "power2.out",
      overwrite: "auto",
    });
    arrow.dataset.baseColor = targetColor;
  }

  function chooseColor(svg) {
    if (footerActiveCount > 0) return DARK;
    if (ctaActiveCount > 0) return LIGHT;

    const bg = detectBackground(svg);
    return bg === "image" || bg === "dark" ? LIGHT : DARK;
  }

  function refreshArrowColor() {
    tweenArrowColor(chooseColor(arrow));
  }

  const paths = arrow.querySelectorAll("path,line,polyline");
  const baseStroke = parseFloat(paths[0]?.getAttribute("stroke-width")) || 3;

  gsap.set(arrow, { willChange: "transform,color" });
  refreshArrowColor();

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

  let timer;
  const throttledRefresh = () => {
    clearTimeout(timer);
    timer = setTimeout(refreshArrowColor, 120);
  };
  window.addEventListener("scroll", throttledRefresh, { passive: true });
  window.addEventListener("resize", throttledRefresh);

  gsap.set(arrow, { autoAlpha: 0, scale: 0.85, y: 10 });

  window.addEventListener("scroll", () => {
    const show = window.scrollY > 600;
    gsap.to(arrow, {
      autoAlpha: show ? 1 : 0,
      scale: show ? 1 : 0.85,
      y: show ? 0 : 10,
      duration: show ? 0.6 : 0.5,
      ease: show ? "power2.out" : "power2.inOut",
    });
  });

  arrow.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 1.2,
      ease: "power3.inOut",
    });
  });

  const ctas = document.querySelectorAll(".section-cta");
  if (ctas.length) {
    const ioCTA = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) ctaActiveCount++;
          else ctaActiveCount = Math.max(0, ctaActiveCount - 1);
        });
        refreshArrowColor();
      },
      { threshold: 0.15 }
    );
    ctas.forEach((el) => ioCTA.observe(el));
  }

  const footer = document.querySelector(".footer-wrapper");
  if (footer) {
    const ioFooter = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) footerActiveCount++;
          else footerActiveCount = Math.max(0, footerActiveCount - 1);
        });
        refreshArrowColor();
      },
      { threshold: 0.15 }
    );
    ioFooter.observe(footer);
  }
});

// =====================================================
// 09. Custom Cursor — Desktop Only
// 功能：自訂游標（Warm Hover / Glass View Mode）
// =====================================================
(function () {
  const cursor = document.querySelector(".cursor");
  const cursorText = document.querySelector(".cursor-text");

  if (!cursor) return;

  const isDesktopWidth = window.matchMedia("(min-width: 992px)").matches;
  if (!isDesktopWidth) return;

  const BASE = {
    size: 20,
    growSize: 32,
    viewSize: 100,
    colorLight: "#795e49",
    borderLight: "rgba(0,0,0,0.08)",
    animDur: 0.15,
    visualDur: 0.3,
  };

  const WARM_BG = "rgba(121,94,73,0.14)";
  const GLASS_BG = "rgba(255, 255, 255, 0.1)";
  const GLASS_BORDER = "rgba(255, 255, 255, 0.2)";
  const GLASS_BACKDROP = "blur(8px)";
  const VIEW_TARGET =
    ".projects-next-link, .project-link-block, .project-image-wrapper, .testimonials-aside-wrap *";

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
    VIEW_TARGET,
  ].join(", ");

  const BG_HOVER_WHITELIST =
    ".section-cta, .footer-form-wrapper, .slide-nav-wrapper, .footer-legal-wrapper";

  document.querySelectorAll(WARM_HOVER_TARGETS).forEach((el) => {
    el.style.cursor = "none";
  });

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });

  let cx = innerWidth / 2;
  let cy = innerHeight / 2;

  window.addEventListener(
    "mousemove",
    (e) => {
      cx = e.clientX;
      cy = e.clientY;

      let moveDur;

      if (hoverMode === "view") {
        moveDur = 0.35;
      } else if (hoverMode === "warm") {
        moveDur = 0.16;
      } else {
        moveDur = 0.08;
      }

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

  const darkSecs = Array.from(document.querySelectorAll(".dark-bg"));
  let area = "light";
  let hoverMode = "none";

  const rectHit = (r) =>
    cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;

  function detectArea() {
    const next = darkSecs.some((s) => rectHit(s.getBoundingClientRect()))
      ? "dark"
      : "light";
    if (next !== area) {
      area = next;
      applyVisual();
    }
  }

  ["mousemove", "scroll", "resize"].forEach((evt) =>
    window.addEventListener(evt, detectArea)
  );

  function isImageOrBg(node) {
    if (node.closest(BG_HOVER_WHITELIST)) return false;
    let el = node;
    while (el && el !== document.body) {
      if (el.tagName === "IMG") return true;
      const cs = window.getComputedStyle(el);
      if (cs && cs.backgroundImage && cs.backgroundImage !== "none")
        return true;
      el = el.parentElement;
    }
    return false;
  }

  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    if (t.closest(VIEW_TARGET)) return setHover("view");
    if (isImageOrBg(t)) return setHover("none");
    if (t.closest(WARM_HOVER_TARGETS)) return setHover("warm");
    setHover("none");
  });

  document.addEventListener("pointerout", (e) => {
    const to = e.relatedTarget;
    if (!to || (!to.closest(WARM_HOVER_TARGETS) && !to.closest(VIEW_TARGET)))
      setHover("none");
  });

  function setHover(mode) {
    if (mode !== hoverMode) {
      hoverMode = mode;
      applyVisual();
    }
  }

  function applyVisual() {
    let size = BASE.size;
    let bg = BASE.colorLight;
    let border = BASE.borderLight;
    let backdrop = "none";
    let textAlpha = 0;

    if (hoverMode === "view") {
      size = BASE.viewSize;
      bg = GLASS_BG;
      border = GLASS_BORDER;
      backdrop = GLASS_BACKDROP;
      textAlpha = 1;
    } else if (hoverMode === "warm") {
      size = BASE.growSize;
      bg = WARM_BG;
      border = "rgba(0,0,0,0.12)";
      textAlpha = 0;
    }

    gsap.to(cursor, {
      width: size,
      height: size,
      backgroundColor: bg,
      borderColor: border,
      backdropFilter: backdrop,
      webkitBackdropFilter: backdrop,
      duration: BASE.visualDur,
      ease: "power2.out",
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
    gsap.to(cursor, { scale: 1.0, duration: 0.12, ease: "power2.out" })
  );

  gsap.fromTo(
    cursor,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: "power2.out", delay: 0.05 }
  );
})();

// =====================================================
// 10. CTA Button Hover (Standard)
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
// 11. Swiper Slider Section
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
// 12. Floating CTA Controller (Updated for Unified Menu)
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
// 13. Universal CTA Hover (Updated for Unified Menu)
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
      if (isFloating) gsap.set(btn, { backgroundColor: "#795e49" });

      // =========================================================
      //  手機版邏輯
      // =========================================================
      if (isMobile) {
        if (arrow) gsap.set(arrow, { display: "none" });
        if (text) gsap.set(text, { x: 0, color: "#f0e8dd" });

        const mobilePress = () => {
          gsap.to(btn, {
            scale: 0.96,
            backgroundColor: "#f0e8dd",
            duration: 0.1,
            ease: "power1.out",
            overwrite: "auto",
          });
          if (text) {
            gsap.to(text, {
              color: "#795e49",
              duration: 0.1,
              overwrite: "auto",
            });
          }
        };

        const mobileRelease = () => {
          gsap.to(btn, {
            scale: 1,
            backgroundColor: "#795e49",
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
          });
          if (text) {
            gsap.to(text, {
              color: "#f0e8dd",
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
          gsap.set(text, { x: 0, color: "#f0e8dd", "--line-width": "0%" });
          gsap.set(text, { "--line-left": "0", "--line-right": "auto" });
        }

        if (arrow) {
          gsap.set(arrow, {
            autoAlpha: 0,
            x: -15,
            scale: 0.6,
            backgroundColor: "transparent",
            borderColor: "#f0e8dd",
            display: "flex",
          });
        }

        btn.addEventListener("mouseenter", () => {
          if (anyMenuOpen()) return;

          gsap.to(btn, {
            backgroundColor: "#f0e8dd",
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
          });

          if (arrow) {
            gsap.to(arrow, {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              backgroundColor: "#795e49",
              borderColor: "#795e49",
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
              color: "#795e49",
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
          gsap.to(btn, {
            backgroundColor: "#795e49",
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
              color: "#f0e8dd",
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
          gsap.to(btn, { backgroundColor: "#795e49", duration: 0.2 });
          if (text)
            gsap.to(text, { x: 0, color: "#f0e8dd", "--line-width": "0%" });
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
// 14. Award Carousel — Infinite Scroll (Marquee)
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
// 15. Text Animations (Global SplitType)
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
// 16. Process Page — Hero Motion
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
// 17. Process Page — Card Stacking Effect (Desktop Only)
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
// 19. Process Page — Anchor Scroll (Optimized)
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
// 20. Profile Page — Hero Scroll Parallax (Projects Page Style)
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
// 21. Studio Page — Team Member Hover
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
// 22. Helper Functions (Split Masks & Viewport Detection)
// 功能：輔助工具（文字分割遮罩、可視區域偵測）
// =====================================================
gsap.registerPlugin(ScrollTrigger);

function fitSplitMasks(container) {
  if (!container) return;
  const parents = container.querySelectorAll(".split-parent");

  parents.forEach((parent) => {
    const child = parent.querySelector(".split-child");
    if (!child) return;

    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const childH = childRect.height || 0;
    const parentH = parentRect.height || 0;

    if (childH && parentH + 0.5 < childH) {
      parent.style.minHeight = childH + 2 + "px";
    }
  });
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= vh;
}

// =====================================================
// 23. Universal Line Reveal
// 功能：文字逐行顯示動畫 (.js-line-reveal)
// =====================================================
window.addEventListener("load", () => {
  console.log("GSAP: universal line reveal init");

  if (typeof SplitType === "undefined") {
    console.warn(
      "SplitType not found – check CDN <script src='https://unpkg.com/split-type'></script> in <head>"
    );
    return;
  }

  const elements = document.querySelectorAll(".js-line-reveal");
  console.log("[LineReveal] Found elements:", elements.length);

  elements.forEach((el) => {
    if (el.dataset.linesSplit === "true") return;
    if (!el.textContent.trim()) return;

    const split = new SplitType(el, {
      types: "lines",
      tagName: "div",
    });

    split.lines.forEach((line, index) => {
      const parent = document.createElement("div");
      parent.classList.add("split-parent");
      parent.style.overflow = "hidden";

      if (el.classList.contains("cta-heading")) {
        if (index === 0) parent.classList.add("is-left");
        else parent.classList.add("is-right");
      }

      const child = document.createElement("div");
      child.classList.add("split-child");
      child.innerHTML = line.innerHTML;

      parent.appendChild(child);
      line.replaceWith(parent);
    });

    el.dataset.linesSplit = "true";

    fitSplitMasks(el);

    const children = el.querySelectorAll(".split-child");
    if (!children.length) return;

    const baseAnim = {
      yPercent: 130,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
      stagger: 0.08,
    };

    if (isInViewport(el)) {
      gsap.from(children, { ...baseAnim, delay: 0.15 });
    } else {
      gsap.from(children, {
        ...baseAnim,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom 40%",
          once: true,
        },
      });
    }
  });
});

// =====================================================
// 24. Projects Page — Filter & Hover
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

  // --- 初始動畫 ---
  if (items.length > 0) {
    gsap.set(items, { y: 60, opacity: 0 });
    gsap.to(items, {
      y: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.2,
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
      const itemCat = item.getAttribute("data-category");
      const itemSize = item.getAttribute("data-size");
      const titleEl = item.querySelector(CONFIG.titleSelector);
      const itemTitle = titleEl ? titleEl.innerText.toLowerCase() : "";

      const matchSearch = itemTitle.includes(searchValue);
      const matchCat = catValue === "All" || (itemCat && itemCat === catValue);
      const matchSize =
        sizeValue === "All" || (itemSize && itemSize === sizeValue);

      if (matchSearch && matchCat && matchSize) {
        if (item.style.display === "none") {
          item.style.display = "block";
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
      gsap.fromTo(
        batch,
        {
          autoAlpha: 0, // Opacity: 0 + Visibility: hidden
          y: 80, // 初始位置：向下沉 80px
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.5, // ★ 慢動作：1.5秒
          ease: "power3.out", // ★ 配合 Lenis 嘅順滑感
          stagger: 0.2, // 每個 Item 之間 0.2s 延遲
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
// 27. Smart Page Loader (Bulletproof Version)
// =====================================================
function initSmartLoader() {
  const loader = document.querySelector(".page-loader");

  // 0. 安全檢查：如果沒有 Loader，確保頁面可見並退出
  if (!loader) {
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
    return;
  }

  const progressBar = document.querySelector(".loader-progress-bar");
  const logoMain = document.querySelector("#logo-main");
  const logoTagline = document.querySelector("#logo-tagline");
  const spinner = document.querySelector(".loader-spinner-wrap");
  const content = document.querySelector(".loader-content");

  // 防止重複執行的旗標
  let isExiting = false;

  // --- 1. 定義離場動畫 (Fade Out) ---
  const playExitAnimation = () => {
    if (isExiting) return; // 如果已經跑緊，唔好再跑
    isExiting = true;

    // 跑完 Progress Bar
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

          // [核心] 強制解鎖 Body
          gsap.set("body", { opacity: 1, visibility: "visible" });
          document.body.style.opacity = "1";
          document.body.style.visibility = "visible";

          // Reset 狀態
          if (progressBar) gsap.set(progressBar, { width: "0%", opacity: 0 });
          if (spinner) spinner.classList.remove("is-center");

          // [核心] 通知 ScrollTrigger 重新計算
          ScrollTrigger.refresh();

          // [核心] 處理錨點跳轉 (如果有)
          if (window.location.hash && window.lenis) {
            // 稍微延遲一點點讓佈局穩定
            setTimeout(() => {
              const target = document.querySelector(window.location.hash);
              if (target) window.lenis.scrollTo(target, { immediate: true });
            }, 100);
          }
        },
      });
  };

  // --- 2. Full Intro (首次載入) ---
  const playFullIntro = () => {
    // 顯示元素
    if (spinner) gsap.set(spinner, { opacity: 1 });
    if (logoMain) gsap.set(logoMain, { opacity: 1 });
    if (logoTagline) gsap.set(logoTagline, { opacity: 1 });

    if (progressBar) {
      gsap.set(progressBar, { opacity: 1, width: "0%" });
      gsap.to(progressBar, { width: "85%", duration: 2, ease: "power2.out" });
    }

    // Logo 動畫
    const introTL = gsap.timeline();
    if (logoMain) {
      introTL.fromTo(
        logoMain,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
    if (logoTagline) {
      introTL.fromTo(
        logoTagline,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }

    // [核心邏輯] 檢查載入狀態
    const checkLoad = () => {
      // 如果已經 Interactive (HTML讀完) 或 Complete (全頁讀完)，就可以當作 OK
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) =>
          window.addEventListener("load", resolve)
        );
      }
    };

    // 最少等待 0.8s
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));

    Promise.all([checkLoad(), minDelay]).then(() => {
      playExitAnimation();
    });

    // [終極保險絲] 無論 Promise 點樣，3.5秒後強制開門！
    setTimeout(() => {
      if (!isExiting) {
        console.warn("Loader timed out - Forcing exit.");
        playExitAnimation();
      }
    }, 3500);
  };

  // --- 3. Simple Intro (內部轉頁) ---
  const playSimpleIntro = () => {
    if (logoMain) gsap.set(logoMain, { opacity: 0 });
    if (logoTagline) gsap.set(logoTagline, { opacity: 0 });
    if (progressBar) gsap.set(progressBar, { opacity: 0 });

    if (spinner) {
      spinner.classList.add("is-center");
      gsap.set(spinner, { opacity: 1 });
    }

    // 轉頁檢查
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      playExitAnimation();
    } else {
      window.addEventListener("load", playExitAnimation);
      // 轉頁保險絲
      setTimeout(playExitAnimation, 2000);
    }
  };

  // --- 4. 判斷邏輯 ---
  try {
    const isInternal = sessionStorage.getItem("internal-transition");
    if (isInternal) {
      playSimpleIntro();
      sessionStorage.removeItem("internal-transition");
    } else {
      playFullIntro();
    }
  } catch (e) {
    // 如果 sessionStorage 報錯 (例如無痕模式限制)，直接行 Full Intro
    playFullIntro();
  }

  // --- 5. 連結點擊事件 ---
  const links = document.querySelectorAll("a");
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

      loader.style.display = "flex";
      gsap.set(loader, { opacity: 0 }); // 確保由 0 開始
      gsap.set(content, { opacity: 1, y: 0 });

      // 隱藏不必要的
      if (logoMain) gsap.set(logoMain, { opacity: 0 });
      if (logoTagline) gsap.set(logoTagline, { opacity: 0 });
      if (progressBar) gsap.set(progressBar, { opacity: 0 });

      // 顯示 spinner
      if (spinner) {
        spinner.classList.add("is-center");
        gsap.set(spinner, { opacity: 1 });
      }

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

// 立即執行
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
// 28. Footer — Real-time Clock & Status (HK Time)
// 功能：頁尾顯示香港時間及營業狀態
// =====================================================
function initFooterTime() {
  const timeSpan = document.getElementById("js-time");
  const stateSpan = document.getElementById("js-state");
  if (!timeSpan || !stateSpan) return;

  function updateTime() {
    const timeZone = "Asia/Hong_Kong";
    const openHour = 9;
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
// 29. Footer — Auto Copyright Year
// 功能：自動更新版權年份
// =====================================================
function initCurrentYear() {
  const yearSpan = document.querySelector("[data-current-year]");
  if (yearSpan) yearSpan.innerText = new Date().getFullYear();
}
initCurrentYear();

// =====================================================
// 30. Smooth Scroll (Lenis) & Hero Scroll Parallax
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
      lenis.scrollTo(this.getAttribute("href"));
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
// 31. Project Gallery Reveal
// 功能：專案內頁圖片滾動進入動畫 (Fade Out Mask + Scale Down)
// =====================================================
ScrollTrigger.refresh();

gsap.utils.toArray(".projects-gallery-item").forEach((item) => {
  let cover = item.querySelector(".projects-gallery-cover");
  let img = item.querySelector("img");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: item,
      start: "top 90%",
      once: true,
    },
  });

  tl.fromTo(
    cover,
    { autoAlpha: 1 },
    {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power3.out",
    }
  );

  if (img) {
    tl.fromTo(
      img,
      { scale: 1.2 },
      {
        scale: 1.0,
        duration: 0.6,
        ease: "power3.out",
      },
      "<"
    );
  }
});

// =====================================================
// 32. Next Project Link
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
// 33. Home Scroll Expansion (Video/Image Scale)
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

// =====================================================
// 35. Testimonials Aside Reveal (Perfect Sync)
// =====================================================
function initTestimonialReveal() {
  gsap.registerPlugin(ScrollTrigger);

  const wrap = document.querySelector(".testimonials-aside-wrap");
  if (!wrap) return;

  const cover = wrap.querySelector(".g-image-cover");
  const mainImg = wrap.querySelector(".testimonial-image-contain");
  const centerImg = wrap.querySelector(".hover-center-image");

  // --- 1. 初始狀態設定 ---
  if (cover) gsap.set(cover, { scaleY: 1, transformOrigin: "bottom center" });
  if (mainImg) gsap.set(mainImg, { scale: 1.2 });

  if (centerImg) {
    gsap.set(centerImg, {
      autoAlpha: 0,
      scale: 0.5,
      transformOrigin: "center center",
    });
  }

  // --- 3. Hover Animation (完全同步) ---
  // 統一變數：確保入同出嘅節奏一致
  const hoverDuration = 0.6;
  const hoverEase = "power3.out"; // 統一用這個曲線

  wrap.addEventListener("mouseenter", () => {
    // A. 中間圖彈出
    if (centerImg) {
      gsap.to(centerImg, {
        autoAlpha: 1,
        scale: 1,
        duration: hoverDuration,
        ease: hoverEase,
        overwrite: "auto",
      });
    }

    // B. 底圖變暗
    if (mainImg) {
      gsap.to(mainImg, {
        scale: 1.1,
        filter: "brightness(0.7)",
        duration: hoverDuration,
        ease: hoverEase,
        overwrite: "auto",
      });
    }
  });

  wrap.addEventListener("mouseleave", () => {
    // A. 中間圖消失
    if (centerImg) {
      gsap.to(centerImg, {
        autoAlpha: 0,
        scale: 0.5,
        duration: hoverDuration,
        ease: hoverEase,
        overwrite: "auto",
      });
    }

    // B. 底圖還原
    if (mainImg) {
      gsap.to(mainImg, {
        scale: 1,
        filter: "brightness(1)",
        duration: hoverDuration,
        ease: hoverEase,
        overwrite: "auto",
      });
    }
  });
}

// 執行
initTestimonialReveal();

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
// Global Scroll Reveal (Batch Version: Sequential Fade In)
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // 1. 定義要動畫化的元素
  // ★ 已加入 .featured-projects-size
  const selectorString =
    "h1, h2, h3, h4, h5, h6, p, img, .featured-project-item, .featured-projects-size, .animate-text";

  // 2. 獲取所有元素
  let elements = gsap.utils.toArray(selectorString);

  // 3. ★ 關鍵過濾 (Exclusions)
  elements = elements.filter((el) => {
    // 剔除 Nav Bar
    if (el.closest(".nav-bar")) return false;

    // 剔除 Footer
    if (el.closest(".footer-section")) return false;

    // 剔除 Button Wrapper
    if (el.closest(".btn-wrapper")) return false;

    // 剔除 Testimonials
    if (el.closest(".testimonials-aside-wrap")) return false;

    // 剔除 Video
    if (
      el.classList.contains("cover-about-video") ||
      el.closest(".cover-about-video")
    )
      return false;

    // 手動剔除
    if (el.closest(".no-global-fade")) return false;

    return true;
  });

  // 4. 設定初始狀態
  gsap.set(elements, { autoAlpha: 0 });

  // 5. 使用 Batch 賦予動畫
  ScrollTrigger.batch(elements, {
    start: "top 90%",
    once: true,

    onEnter: (batch) => {
      gsap.to(batch, {
        autoAlpha: 1,
        duration: 2.0,
        ease: "power2.out",
        stagger: 0.15, // 有次序顯示
        overwrite: true,
      });
    },
  });
});
