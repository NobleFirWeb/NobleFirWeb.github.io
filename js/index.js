// site-scripts.js | Shared JavaScript for index.html and about.html
// STABLE BUILD: guarded modules + single init pipeline + intro gate integrated

/* --------------------------------
   GSAP + Plugins (already loaded in <head>)
--------------------------------- */
(() => {
if (window.__NF_SITE_INIT__) return;
window.__NF_SITE_INIT__ = true;
if (typeof gsap !== "undefined") {
  // Register only what exists to avoid hard crashes
  try {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
    if (typeof CustomEase !== "undefined") gsap.registerPlugin(CustomEase);

    if (typeof CustomEase !== "undefined") {
      CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
    }
  } catch (e) {
    console.error("[NF] GSAP plugin registration failed:", e);
  }
}

const NF = {
  afterPaint() {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  },
  afterFonts() {
    return document.fonts?.ready || Promise.resolve();
  },
  isIndex() {
    const p = window.location.pathname;
    return p.endsWith("/") || p.endsWith("/index.html") || p.endsWith("index.html");
  }
};

/* --------------------------------
   Global error visibility (temporary but useful)
   Leave this until things are stable.
--------------------------------- */
window.addEventListener("error", (e) => {
  console.error("[NF ERROR]", e.message, e.filename, e.lineno, e.colno);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[NF PROMISE ERROR]", e.reason);
});

/* --------------------------------
   Loader (INDEX ONLY) – your original logic preserved
--------------------------------- */
(function nfIndexLoader() {
  if (!NF.isIndex()) return;

  const loader = document.getElementById("nf-loader");
  const img = loader?.querySelector(".nf-loader__img");
  const page = document.getElementById("nf-page");

  // If loader markup missing, just signal ready
  if (!loader || !img || !page || typeof gsap === "undefined") {
    document.dispatchEvent(new Event("nf:loaderComplete"));
    return;
  }

  document.body.classList.add("nf-loading");

  const run = () => {
    const percentEl = document.getElementById("nf-loader-percent");
    const counterEl = document.querySelector(".nf-loader__counter");
    const prog = { v: 0 };

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    gsap.set(page, { autoAlpha: 0 });
    gsap.set(loader, { autoAlpha: 1 });
    gsap.set(img, { scale: 1, filter: "blur(0px)", autoAlpha: 1 });

    if (counterEl) gsap.set(counterEl, { autoAlpha: 1 });
    if (percentEl) percentEl.textContent = "0";

    tl.to({}, { duration: 1 });

    tl.addLabel("walk");

    tl.to(img, { duration: 3, scale: 10, z: 500, ease: "power4.in" }, "walk");

    if (percentEl) {
      tl.to(
        prog,
        {
          duration: 3.35,
          v: 100,
          ease: "none",
          onUpdate: () => {
            percentEl.textContent = Math.round(prog.v);
          }
        },
        "walk"
      );
    }

    tl.to(img, { duration: 0.5, autoAlpha: 0, filter: "blur(0px)", ease: "power2.out" }, "walk+=3");

    tl.to({}, { duration: 1 });

    if (counterEl) tl.to(counterEl, { autoAlpha: 0, duration: 0.5 }, ">");
    tl.to(loader, { autoAlpha: 0, duration: 0.35 }, "<");
    tl.to(page, { autoAlpha: 1, duration: 1.25 }, "<+0.1");

    tl.add(() => {
      loader.style.display = "none";
      document.body.classList.remove("nf-loading");
      document.dispatchEvent(new Event("nf:loaderComplete"));
    });
  };

  if (img.complete) run();
  else {
    img.addEventListener("load", run, { once: true });
    img.addEventListener(
      "error",
      () => {
        loader.style.display = "none";
        gsap.set(page, { autoAlpha: 1 });
        document.body.classList.remove("nf-loading");
        document.dispatchEvent(new Event("nf:loaderComplete"));
      },
      { once: true }
    );
  }
})();

/* --------------------------------
   Cursor
--------------------------------- */
function initCursor() {
  if (typeof gsap === "undefined") return;
  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const cursorX = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3.out" });
  const cursorY = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    cursorX(e.clientX);
    cursorY(e.clientY);
  });
}

// ----------------------------
// HERO TITLE (rise on scroll)
// ----------------------------
function initHeroTitleReveal() {
  if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;

  const hero = document.querySelector("#hero");
  if (!hero) return;

  const heroEls = hero.querySelectorAll("[data-reveal='lines']");
  if (!heroEls.length) return;

  // Split ONLY once (no duplicates)
  heroEls.forEach((el) => {
    if (el.dataset.nfHeroSplit === "1") return;

    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "nf-hero-line"
    });

    el.dataset.nfHeroSplit = "1";
  });

  const heroLines = hero.querySelectorAll(".nf-hero-line");
  if (!heroLines.length) return;

  // Ensure headings are not stuck invisible
  gsap.set(heroEls, { opacity: 1 });

  // Start state for rise
  gsap.set(heroLines, { yPercent: 45, opacity: 0 });
}

// Creates a ScrollTrigger that plays the rise when hero enters
function armHeroTitleRevealOnScroll() {
  if (typeof ScrollTrigger === "undefined") return;

  const hero = document.querySelector("#hero");
  if (!hero) return;

  // Prepare split/initial state once (so no flash)
  initHeroTitleReveal();

  ScrollTrigger.create({
    trigger: hero,
    start: "top 95%",
    once: true,
    onEnter: () => {
      const heroLines = hero.querySelectorAll(".nf-hero-line");
      if (!heroLines.length) return;

      gsap.to(heroLines, {
        yPercent: 0,
        opacity: 1,
        duration: 1.05,
        stagger: 0.12,
        ease: "osmo-ease",
        overwrite: true
      });
    }
  });
}


/* --------------------------------
   About text fill (moved from inline HTML)
--------------------------------- */
function initAboutTextFill() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof SplitText === "undefined") return;
  const el = document.querySelector(".about-text_home");
  if (!el) return;

  const aboutText = new SplitText(el, { type: "words, chars" });

  gsap.fromTo(
    aboutText.chars,
    { color: "#333333" },
    {
      color: "#ffffff",
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: "top bottom-=20%",
        end: "bottom top+=45%",
        scrub: 1,
        invalidateOnRefresh: true
      }
    }
  );
}

/* --------------------------------
   data-reveal="lines" (IntersectionObserver version you had)
--------------------------------- */
function initLineReveals({
  selector = '[data-reveal="lines"]',
  once = true,
  rootMargin = "0px 0px -10% 0px"
} = {}) {
  if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return;

  const items = els.map((el) => {
    if (el.dataset.nfSplit !== "1") {
      SplitText.create(el, { type: "lines", mask: "lines", linesClass: "nf-line" });
      el.dataset.nfSplit = "1";
    }

    const lines = el.querySelectorAll(".nf-line");
    gsap.set(lines, { yPercent: 110 });

    const tween = gsap.to(lines, {
      yPercent: 0,
      duration: 0.95,
      stagger: 0.15,
      ease: "osmo-ease",
      paused: true
    });

    return { el, tween };
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = items.find((x) => x.el === entry.target);
        if (!item) return;
        item.tween.play(0);
        if (once) io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin, threshold: 0.1 }
  );

  items.forEach((item) => io.observe(item.el));
}

/* --------------------------------
   nfTransition (Concept → Deployment)
--------------------------------- */
function initNFTransition() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section = document.querySelector("#nfTransition");
  if (!section) return;

  const inner = section.querySelector(".nf-transition__inner");
  const connector = section.querySelector(".nf-transition-connector");
  const media = section.querySelector(".nf-transition__media");
  const frames = Array.from(section.querySelectorAll(".nf-frame"));
  if (!inner || !connector || !media || frames.length === 0) return;

  const setFrame = (index) => frames.forEach((img, i) => img.classList.toggle("is-active", i === index));
  setFrame(0);
  let lastIndex = 0;

  const START_CONNECTOR_W = 64;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: media,
      start: "top 85%",
      endTrigger: section,
      end: "top top",
      scrub: 1,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        gsap.set([media, connector], { clearProps: "transform,width" });
        gsap.set(media, { x: 0 });
        gsap.set(connector, { width: START_CONNECTOR_W });
        setFrame(0);
        lastIndex = 0;
      },
      onUpdate: (self) => {
        const index = Math.min(4, Math.max(0, Math.round(self.progress * 4)));
        if (index !== lastIndex) {
          lastIndex = index;
          setFrame(index);
        }
      }
    }
  });

  tl.to(connector, {
    width: () => {
      const innerW = inner.clientWidth || window.innerWidth;
      if (window.matchMedia("(max-width: 480px)").matches) return Math.max(34, innerW * 0.50);
      return Math.max(64, innerW * 0.62);
    }
  }, 0);

  tl.to(media, {
    x: () => {
      if (window.matchMedia("(max-width: 480px)").matches) return 0;
      const innerW = inner.clientWidth || window.innerWidth;
      return innerW * 0.62;
    }
  }, 0);

  window.addEventListener("resize", () => ScrollTrigger.refresh());
}

/* --------------------------------
   Underline reveal (values + services)
--------------------------------- */
function initUnderlineReveals() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  function nfUnderlineReveal({ listSelector, itemSelector, start = "bottom bottom" }) {
    const list = document.querySelector(listSelector);
    const items = gsap.utils.toArray(itemSelector);
    if (!list || !items.length) return;

    gsap.set(items, { "--nf-underline": 0 });

    ScrollTrigger.create({
      trigger: list,
      start,
      invalidateOnRefresh: true,
      onEnter: () => {
        gsap.to(items, {
          "--nf-underline": 1,
          duration: 0.85,
          stagger: 0.08,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });
  }

  nfUnderlineReveal({ listSelector: ".value-list", itemSelector: ".value-item", start: "bottom bottom" });
  nfUnderlineReveal({ listSelector: ".nf-services-list", itemSelector: ".nf-service", start: "bottom bottom" });
}

/* --------------------------------
   Parallax images
--------------------------------- */
function initParallaxCards() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  document.querySelectorAll(".nf-card__media img").forEach((img) => {
    const card = img.closest(".nf-card");
    if (!card) return;

    gsap.to(img, {
      yPercent: 35,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  });
}

/* --------------------------------
   Text widget scroll (your original)
--------------------------------- */
function initTextWidgetScroll() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const widget = document.querySelector(".nf-text-widget");
  if (!widget) return;

  const rowStatic = widget.querySelector(".nf-text-row--static");
  const row2 = widget.querySelectorAll(".nf-text-row--slide")[0];
  const row3 = widget.querySelectorAll(".nf-text-row--slide")[1];

  if (!rowStatic || !row2 || !row3) return;

  const noble = widget.querySelector(".nf-word--noble");
  const fir = widget.querySelector(".nf-word--fir");
  const studio = widget.querySelector(".nf-word--studio");

  const track2 = row2.querySelector(".nf-text-track");
  const track3 = row3.querySelector(".nf-text-track");
  if (!noble || !fir || !studio || !track2 || !track3) return;

  const leftOf = (el) => el.getBoundingClientRect().left;

  const computeEndX = (targetWord, track) => {
    const nobleLeft = leftOf(noble);
    const targetLeft = leftOf(targetWord);
    return (nobleLeft - targetLeft) + gsap.getProperty(track, "x");
  };

  let endX2 = 0, endX3 = 0, startX2 = 0, startX3 = 0;

  const recalc = () => {
    gsap.set([track2, track3], { x: 0 });

    endX2 = computeEndX(fir, track2);
    endX3 = computeEndX(studio, track3);

    startX2 = endX2 + window.innerWidth * 0.35;
    startX3 = endX3 + window.innerWidth * 0.45;

    gsap.set(track2, { x: startX2 });
    gsap.set(track3, { x: startX3 });

    gsap.set([noble, fir, studio], { color: "#999" });

    row2.style.overflow = "hidden";
    row3.style.overflow = "hidden";
  };

  recalc();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: rowStatic,
      start: "top bottom",
      end: "+=120%",
      scrub: 1,
      invalidateOnRefresh: true,
      onRefreshInit: recalc,
      onUpdate: () => {
        row2.style.overflow = "visible";
        row3.style.overflow = "visible";
      }
    }
  });

  tl.to(noble, { color: "#ffffff", ease: "none" }, 0);
  tl.to(track2, { x: endX2, ease: "none" }, 0);
  tl.to(fir, { color: "#ffffff", ease: "none" }, 0.15);
  tl.to(track3, { x: endX3, ease: "none" }, 0);
  tl.to(studio, { color: "#ffffff", ease: "none" }, 0.2);

  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("resize", () => ScrollTrigger.refresh());
}

/* --------------------------------
   INTRO GATE (pinned overlay)
   IMPORTANT: init AFTER other triggers are created, then refresh.
--------------------------------- */
function initIntroGate() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const intro = document.querySelector("#nf-intro");
  if (!intro) return;

  const blackPanel = intro.querySelector(".nf-intro__panel--black");
  const scrollCue = intro.querySelector(".nf-intro__scrollcue");
  if (!blackPanel || !scrollCue) return;

  // Kill any previous intro triggers
  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === intro) st.kill();
  });

  gsap.killTweensOf(scrollCue);
  gsap.set(scrollCue, { autoAlpha: 1, y: 0 });

  gsap.to(scrollCue, {
    y: 10,
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "+=180%",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
    .to(blackPanel, { yPercent: -100, ease: "none" }, 0)
    .to(scrollCue, { autoAlpha: 0, ease: "none" }, 0.35);
}

/* --------------------------------
   New Nav functionality (guarded)
--------------------------------- */
function initNavToggle() {
  const navToggleBtn = document.getElementById("btn-nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (!navToggleBtn || !navMenu) return;

  function toggleNav(expand) {
    navToggleBtn.setAttribute("aria-expanded", String(expand));
    navMenu.setAttribute("aria-hidden", String(!expand));
    navMenu.toggleAttribute("inert", !expand);

    if (expand) document.addEventListener("click", handleOutsideClick);
    else document.removeEventListener("click", handleOutsideClick);
  }

  function handleOutsideClick(event) {
    if (!navMenu.contains(event.target) && !navToggleBtn.contains(event.target)) {
      toggleNav(false);
    }
  }

  navToggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = navToggleBtn.getAttribute("aria-expanded") === "true";
    toggleNav(!isExpanded);
  });

  navMenu.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => toggleNav(false));
  });
}

/* --------------------------------
   DOMContentLoaded observers (rise/slide/sticky) – your original
--------------------------------- */
function initObserversAndUI() {
  // Sticky navbar
  const navbar = document.querySelector(".navbar");
  const aboutSection = document.getElementById("about");
  if (navbar && aboutSection) {
    window.addEventListener("scroll", () => {
      const aboutTop = aboutSection.getBoundingClientRect().top;
      navbar.classList.toggle("sticky", aboutTop <= 0);
    });
  }

  // Rise
  const riseElements = document.querySelectorAll("[data-rise='true']");
  if (riseElements.length) {
    const riseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            riseObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    riseElements.forEach((el) => riseObserver.observe(el));
  }

  // Slide
  const slideElements = document.querySelectorAll('[slide-right="true"], [slide-left="true"]');
  if (slideElements.length) {
    const slideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            slideObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    slideElements.forEach((el) => slideObserver.observe(el));
  }

  // Modal (guarded)
  const dialog = document.querySelector(".dialog-width");
  if (dialog) {
    const openButton = dialog.nextElementSibling;
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    if (openButton && closeButton) {
      openButton.addEventListener("click", () => dialog.show());
      closeButton.addEventListener("click", () => dialog.hide());
    }
  }
}

/* --------------------------------
   MASTER INIT (THIS is the “don’t break the site” part)
--------------------------------- */
function initEverything() {
  try {
    initCursor();
    initNavToggle();
    initObserversAndUI();

    // GSAP/ScrollTrigger pieces
    initAboutTextFill();
    initNFTransition();
    initUnderlineReveals();
    initParallaxCards();
    initTextWidgetScroll();

    // Line reveals after fonts (to get correct wraps)
    NF.afterFonts()
      .then(NF.afterPaint)
      .then(() => initLineReveals())
      .catch(() => initLineReveals());

    // IMPORTANT: Intro pin LAST, then refresh once
    initIntroGate();

    armHeroTitleRevealOnScroll();

    if (typeof ScrollTrigger !== "undefined") {
      NF.afterFonts().then(NF.afterPaint).then(() => ScrollTrigger.refresh(true));
    }
  } catch (e) {
    console.error("[NF] initEverything crashed:", e);
  }
  ScrollTrigger.sort();              // ensures pinned triggers are ordered correctly
ScrollTrigger.clearScrollMemory(); // prevents weird scroll restoration states

// refresh after fonts + 2 paints (layout stable)
(document.fonts?.ready || Promise.resolve()).then(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });
});

// also refresh after ALL assets (images/video) settle
window.addEventListener("load", () => {
  ScrollTrigger.refresh(true);
}, { once: true });
}

// DOM ready
window.addEventListener("DOMContentLoaded", () => {
  // Index: wait for loader completion if loader exists
  if (NF.isIndex() && document.getElementById("nf-loader")) {
    document.addEventListener("nf:loaderComplete", initEverything, { once: true });
  } else {
    initEverything();
  }
});
})();

/* --------------------------------
   END OF FILE
--------------------------------- */
