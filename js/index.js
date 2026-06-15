// site-scripts.js | Shared JavaScript for index.html and about.html
// STABLE BUILD: guarded modules + single init pipeline + intro gate integrated

/* --------------------------------
//   GSAP + Plugins (already loaded in <head>)
--------------------------------- */

(() => {
  if (window.__NF_SITE_INIT__) return;
  window.__NF_SITE_INIT__ = true;

  if (typeof gsap !== "undefined") {
    // Register only what exists to avoid hard crashes
    try {
      if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
      if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
      if (typeof Flip !== "undefined") gsap.registerPlugin(Flip);
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
  //   Global error visibility (temporary but useful)
  //   Leave this until things are stable.
  --------------------------------- */
  window.addEventListener("error", (e) => {
    console.error("[NF ERROR]", e.message, e.filename, e.lineno, e.colno);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[NF PROMISE ERROR]", e.reason);
  });

  /* --------------------------------
  //   Loader (INDEX ONLY) â€“ progressive curtain-split loader
  --------------------------------- */
  (function nfIndexLoader() {
    if (!NF.isIndex()) return;

    const loader = document.getElementById("nf-loader");
    const page   = document.getElementById("nf-page");

    if (!loader || !page || typeof gsap === "undefined") {
      document.dispatchEvent(new Event("nf:loaderComplete"));
      return;
    }

    document.body.classList.add("nf-loading");

    const run = () => {
      const percentEl  = document.getElementById("nf-loader-percent");
      const counterEl  = loader.querySelector(".nf-loader__counter");
      const barWrap    = loader.querySelector(".nf-loader__bar");
      const barFill    = loader.querySelector(".nf-loader__bar-fill");
      const initials   = loader.querySelectorAll(".nf-loader__initial");
      const nameEl     = loader.querySelector(".nf-loader__name");
      const cityEl     = loader.querySelector(".nf-loader__city");
      const curtainTop = loader.querySelector(".nf-loader__curtain--top");
      const curtainBot = loader.querySelector(".nf-loader__curtain--bot");
      const prog = { v: 0 };

      // â”€â”€ Initial states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      gsap.set(page,     { autoAlpha: 0 });
      gsap.set(loader,   { autoAlpha: 1 });
      gsap.set(initials, { y: "101%" });
      gsap.set([nameEl, cityEl], { autoAlpha: 0, y: 10 });
      if (counterEl) gsap.set(counterEl, { autoAlpha: 0 });
      if (barWrap)   gsap.set(barWrap,   { autoAlpha: 0 });
      if (barFill)   gsap.set(barFill,   { width: "0%" });
      if (percentEl) percentEl.textContent = "0";

      const tl = gsap.timeline();

      // â”€â”€ Phase 1: Brand slide-up reveal (0 â†’ ~0.9s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Letters masked inside overflow:hidden wrappers â€” slide up into view
      tl.to(initials, {
        y: "0%",
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.08
      }, 0);

      tl.to(nameEl, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out"
      }, 0.42);

      tl.to(cityEl, {
        autoAlpha: 1,
        duration: 0.45,
        ease: "power2.out"
      }, 0.62);

      if (barWrap)   tl.to(barWrap,   { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.7);
      if (counterEl) tl.to(counterEl, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.7);

      // â”€â”€ Phase 2: Red bar fills + counter counts (0.8s â†’ 3.3s) â”€â”€
      const LOAD_START = 0.8;
      const LOAD_DUR   = 2.5;

      if (barFill) {
        tl.to(barFill, {
          width: "100%",
          duration: LOAD_DUR,
          ease: "power1.inOut"
        }, LOAD_START);
      }

      if (percentEl) {
        tl.to(prog, {
          v: 100,
          duration: LOAD_DUR,
          ease: "power1.inOut",
          onUpdate: () => { percentEl.textContent = Math.round(prog.v); }
        }, LOAD_START);
      }

      // â”€â”€ Phase 3: Brand exits upward (3.1s â†’ 3.55s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const EXIT_START = LOAD_START + LOAD_DUR - 0.2; // 3.1

      tl.to(nameEl, { autoAlpha: 0, y: -8,  duration: 0.32, ease: "power2.in" }, EXIT_START);
      tl.to(cityEl, { autoAlpha: 0,          duration: 0.28, ease: "power2.in" }, EXIT_START);
      // Letters slide back up through the overflow mask (reversed stagger)
      tl.to(initials, {
        y: "-101%",
        duration: 0.42,
        ease: "power3.in",
        stagger: { each: 0.06, from: "end" }
      }, EXIT_START + 0.06);
      if (counterEl) tl.to(counterEl, { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, EXIT_START);
      if (barWrap)   tl.to(barWrap,   { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, EXIT_START + 0.1);

      // â”€â”€ Phase 4: Curtain split reveals page (3.55s â†’ 4.2s) â”€â”€â”€â”€â”€
      const CURTAIN_START = EXIT_START + 0.45; // 3.55

      if (curtainTop && curtainBot) {
        tl.to(curtainTop, { y: "-100%", duration: 0.62, ease: "power3.inOut" }, CURTAIN_START);
        tl.to(curtainBot, { y: "100%",  duration: 0.62, ease: "power3.inOut" }, CURTAIN_START);
      } else {
        tl.to(loader, { autoAlpha: 0, duration: 0.5 }, CURTAIN_START);
      }

      tl.to(page, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, CURTAIN_START + 0.18);

      // â”€â”€ Cleanup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Fire loaderComplete AT curtain-start so the hero can begin
      // animating in sync with the curtains parting (not after)
      tl.add(() => {
        document.body.classList.remove("nf-loading");
        document.dispatchEvent(new Event("nf:loaderComplete"));
      }, CURTAIN_START);

      // Hide the loader element after curtains fully close
      tl.add(() => { loader.style.display = "none"; });
    };

    run();
  })();



  /* --------------------------------
  //   Cursor
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
  // NEW HERO (N | VIDEO | F)
  // ----------------------------
function initHeroNFVideo() {
  if (typeof gsap === "undefined") return;

  const hero = document.querySelector("#hero");
  if (!hero) return;

  const container = hero.querySelector(".hero-container");
  const row = hero.querySelector(".hero-row");
  const wrap = hero.querySelector(".video-wrap");
  const left = hero.querySelector(".left-char");
  const right = hero.querySelector(".right-char");
  const subline = hero.querySelector(".hero-subline[data-reveal='lines']");

  if (!container || !row || !wrap || !left || !right) return;

  // Clean up old hero triggers/tweens (safe for re-init)
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((st) => {
      const t = st.vars?.trigger;
      if (t === hero || t === container || t === wrap || t === row) st.kill();
    });
  }
  gsap.killTweensOf([wrap, left, right, row, "body"]);

  const targetW = () => Math.round(Math.min(900, window.innerWidth * 0.9));

  // Start states
  gsap.set([left, right], { autoAlpha: 0, willChange: "transform, opacity" });
  gsap.set(wrap, { autoAlpha: 0, width: 0, willChange: "width, opacity" });
  gsap.set(row, { yPercent: 0, willChange: "transform" });

  // Prepare subline to be hidden until we reveal it
  if (subline) {
    gsap.set(subline, { opacity: 1 }); // keep element available for SplitText
    // If SplitText is available, pre-split and set hidden line state now (prevents flash)
    if (typeof SplitText !== "undefined") {
      if (subline.dataset.nfHeroSubSplit !== "1") {
        SplitText.create(subline, { type: "lines", mask: "lines", linesClass: "nf-hero-subline" });
        subline.dataset.nfHeroSubSplit = "1";
      }
      const lines = subline.querySelectorAll(".nf-hero-subline");
      if (lines.length) gsap.set(lines, { yPercent: 110, opacity: 0 });
    } else {
      // fallback: just hide the whole line until we show it
      gsap.set(subline, { autoAlpha: 0 });
    }
  }

  // Timeline that will play WHEN you scroll into hero
  const tl = gsap.timeline({ paused: true });

  tl
    // Step 1: NF becomes visible
    .to([left, right], {
      autoAlpha: 1,
      duration: 0.35,
      ease: "power1.out",
      stagger: 0.06
    })

    // Step 2: video capsule becomes visible in the middle (still collapsed)
    .to(wrap, {
      autoAlpha: 1,
      duration: 0.2,
      ease: "none"
    }, ">-0.05")

    // Step 3: capsule reveal (small)
    .to(wrap, {
      width: 120,
      duration: 0.7,
      ease: "power2.inOut"
    })

    // Step 4: expand wide
    .to(wrap, {
      width: targetW,
      duration: 0.9,
      ease: "expo.out"
    }, ">-0.25")

    // Push letters outward
    .to(left, {
      xPercent: -20,
      duration: 0.8,
      ease: "back.out(1.4)"
    }, "<-0.45")
    .to(right, {
      xPercent: 20,
      duration: 0.8,
      ease: "back.out(1.4)"
    }, "<")

    // NEW: Once fully expanded, lift the whole row 5%
    .to(row, {
      yPercent: -10,
      duration: 0.55,
      ease: "power2.out"
    }, ">")

    // NEW: after 0.5s, reveal the subline using data-reveal=lines style
    .add(() => {
      if (!subline) return;

      // SplitText line reveal if available
      if (typeof gsap !== "undefined" && typeof SplitText !== "undefined") {
        const lines = subline.querySelectorAll(".nf-hero-subline");
        if (!lines.length) {
          // If for some reason it didn't split earlier, do it now
          SplitText.create(subline, { type: "lines", mask: "lines", linesClass: "nf-hero-subline" });
        }
        const finalLines = subline.querySelectorAll(".nf-hero-subline");
        gsap.to(finalLines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "osmo-ease",
          overwrite: true
        });
      } else {
        // fallback reveal
        gsap.to(subline, { autoAlpha: 1, duration: 0.4, ease: "power1.out" });
      }
    }, ">+0.5");

  // Play timeline when hero scrolls into view
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      once: true,
      onEnter: () => tl.play(0),
      invalidateOnRefresh: true
    });

    // Your pinned hero behavior
    gsap.to("body", {
      backgroundColor: "#0A0A0A",
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=1500",
        pin: true,
        scrub: 0,
        invalidateOnRefresh: true
      }
    });
  }

  // Keep responsive
  window.addEventListener("resize", () => {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(true);
  });
}

  /* --------------------------------
  //   Hero Video Scroll Grow
  --------------------------------- */
function initHeroVideoExpand() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const wrapper = document.querySelector("#heroVideoWrapper");
  if (!wrapper) return;

  // Kill previous triggers if re-init
  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === wrapper) st.kill();
  });

  // Initial state: tiny + slightly lower
  gsap.set(wrapper, {
    scale: 0.02,
    y: 80,
    transformOrigin: "center center",
    willChange: "transform"
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top bottom",
      end: "top +=75%",
      scrub: 1,
      // markers: true,
    }
  })
  .to(wrapper, {
    scale: 1,
    y: 0,
    ease: "none"
  });
}



  /* --------------------------------
  //   About text fill (moved from inline HTML)
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
  //   data-reveal="lines" (IntersectionObserver version you had)
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
        duration: 0.8,
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
  VALUES (Pinned left + Value Tabs)
  --------------------------------- */
function initHeaderPin() {
    const weBelieve = document.querySelector('.we-believe');
    const tabContainerTop = document.querySelector('.tab-container-top');

    if (!weBelieve || !tabContainerTop) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Pin only on viewports wide enough to use the two-column desktop layout.
    // On tablet/mobile (â‰¤768px) the layout stacks vertically and the pin is
    // not needed â€” the tab-layout margin-top is also reduced via CSS there.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        const st = ScrollTrigger.create({
            trigger: ".values-content",
            start: "top 50%",
            endTrigger: ".tab-container-top",
            // Dynamic end: release the pin when .tab-container-top's top edge
            // reaches the bottom of the pinned .we-believe + a gap.
            // .we-believe is frozen at ~50 % of the viewport height (matching
            // the "top 50%" start), so we use that as the reference rather than
            // a hard-coded pixel offset that breaks on tall / short viewports.
            end: () => {
                const pinnedTop = window.innerHeight * 0.5;
                const gap = 28;
                return `top ${pinnedTop + weBelieve.offsetHeight + gap}px`;
            },
            pin: weBelieve,
            pinSpacing: false,
            invalidateOnRefresh: true
        });

        // Clean up when matchMedia exits this breakpoint (e.g. window resize)
        return () => { st.kill(); };
    });
}


function initFlipButtons() {
  let wrappers = document.querySelectorAll('[data-flip-button="wrap"]');
  
  wrappers.forEach((wrapper) => {
    let buttons = wrapper.querySelectorAll('[data-flip-button="button"]');
    let bg = wrapper.querySelector('[data-flip-button="bg"]');
    
    buttons.forEach(function (button) {
      // Handle mouse enter
      button.addEventListener("mouseenter", function () {
        const state = Flip.getState(bg);
        this.appendChild(bg);
        Flip.from(state, {
          duration: 0.4,
        });
      });

      // Handle focus for keyboard navigation
      button.addEventListener("focus", function () {
        const state = Flip.getState(bg);
        this.appendChild(bg);
        Flip.from(state, {
          duration: 0.4,
        });
      });

      // Handle mouse leave
      button.addEventListener("mouseleave", function () {
        const state = Flip.getState(bg);
        const activeLink = wrapper.querySelector(".active");
        activeLink.appendChild(bg);
        Flip.from(state, {
          duration: 0.4,
        });
      });

      // Handle blur to reset background for keyboard navigation
      button.addEventListener("blur", function () {
        const state = Flip.getState(bg);
        const activeLink = wrapper.querySelector(".active");
        activeLink.appendChild(bg);
        Flip.from(state, {
          duration: 0.4,
        });
      });
    });
  });
}

function initTabSystem(){
  let wrappers = document.querySelectorAll('[data-tabs="wrapper"]')
  
  wrappers.forEach((wrapper) => {
    let nav = wrapper.querySelector('[data-tabs="nav"]')
    let buttons = nav.querySelectorAll('[data-tabs="button"]')
    let contentWrap = wrapper.querySelector('[data-tabs="content-wrap"]')
    let contentItems = contentWrap.querySelectorAll('[data-tabs="content-item"]')
    let visualWrap = wrapper.querySelector('[data-tabs="visual-wrap"]')
    let visualItems = visualWrap.querySelectorAll('[data-tabs="visual-item"]')

    let activeButton = buttons[0];
    let activeContent = contentItems[0];
    let activeVisual = visualItems[0];
    let isAnimating = false;

    function switchTab(index, initial = false) {
      if (!initial && (isAnimating || buttons[index] === activeButton)) return; // ignore click if the clicked button is already active 
      isAnimating = true; // keep track of whether or not one is moving, to prevent overlap

      const outgoingContent = activeContent;
      const incomingContent = contentItems[index];
      const outgoingVisual = activeVisual;
      const incomingVisual = visualItems[index];

      let outgoingLines = outgoingContent.querySelectorAll("[data-tabs-fade]") || [];
      let incomingLines = incomingContent.querySelectorAll("[data-tabs-fade]");

      const timeline = gsap.timeline({
        defaults:{
          ease:"power3.inOut"
        },
        onComplete: () => {
          if(!initial){
            outgoingContent && outgoingContent.classList.remove("active");
            outgoingVisual && outgoingVisual.classList.remove("active");            
          }
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;
        },
      });

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      timeline
        .to(outgoingLines, { y: "-2em", autoAlpha:0 }, 0)
        .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        .fromTo(incomingLines, { y: "2em", autoAlpha:0 }, { y: "0em", autoAlpha:1, stagger: 0.075 }, 0.4)
        .fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, "<");

      activeButton && activeButton.classList.remove("active");
      buttons[index].classList.add("active");
      activeButton = buttons[index];
    }

    switchTab(0, true); // on page load

    buttons.forEach((button, i) => {
      button.addEventListener("click", () => switchTab(i)); 
    });

    contentItems[0].classList.add("active");
    visualItems[0].classList.add("active");
    buttons[0].classList.add("active");    
  })
  
}



  /* --------------------------------
  //   Editorial Hero reveal (index only)
  --------------------------------- */
  function initEditorialHero() {
    if (typeof gsap === "undefined") return;
    const hLine1    = document.getElementById("hLine1");
    const hLine2    = document.getElementById("hLine2");
    const hLine3    = document.getElementById("hLine3");
    const eyebrow   = document.getElementById("heroEyebrow");
    const kicker    = document.getElementById("heroKicker");
    const meta      = document.getElementById("heroMeta");
    const scrollCue = document.getElementById("heroScrollCue");
    const navLogo   = document.querySelector(".navbar .logo-name");
    if (!hLine1) return;

    // Pre-hide: yPercent slides lines below overflow clip, autoAlpha as fallback
    gsap.set([hLine1, hLine2, hLine3], { yPercent: 115, autoAlpha: 0 });
    gsap.set([eyebrow, kicker, meta, scrollCue], { opacity: 0, y: 10 });
    if (navLogo) gsap.set(navLogo, { autoAlpha: 0 });

    const tl = gsap.timeline();
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.05);
    tl.to(hLine1,  { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "expo.out" }, 0.12);
    tl.to(hLine2,  { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "expo.out" }, 0.26);
    tl.to(hLine3,  { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "expo.out" }, 0.40);
    if (navLogo) tl.to(navLogo, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.28);
    tl.to(kicker,    { opacity: 1, y: 0, duration: 0.5,  ease: "power3.out" }, 0.55);
    tl.to(meta,      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.68);
    tl.to(scrollCue, { opacity: 1, y: 0, duration: 0.4,  ease: "power2.out" }, 0.80);
    tl.call(() => { if (eyebrow) eyebrow.classList.add("is-revealed"); }, [], 0.30);
  }


  /* --------------------------------
  //   Scroll Story — video morph + about text fill
  --------------------------------- */
  function initScrollStory() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof SplitText === "undefined") return;
    const ssVideoWrap = document.getElementById("ssVideoWrap");
    const ssDivider   = document.getElementById("ssDivider");
    const ssKicker    = document.getElementById("ssKicker");
    const ssHeading   = document.getElementById("ssHeading");
    const ssText      = document.getElementById("ssText");
    const ssLink      = document.getElementById("ssLink");
    if (!ssVideoWrap || !ssHeading || !ssText) return;

    const isMobile = window.innerWidth <= 768;

    const splitHeading = SplitText.create(ssHeading, { type: "words", wordsClass: "word" });
    const splitBody    = SplitText.create(ssText,    { type: "words", wordsClass: "word" });
    gsap.set([...splitHeading.words, ...splitBody.words], { color: "rgba(255,255,255,0.07)" });
    gsap.set([ssKicker, ssLink], { opacity: 0 });

    const finalVideoW = isMobile ? "90%"         : "48%";
    const finalVideoH = isMobile ? "38%"         : "64vh";
    const finalVideoT = isMobile ? "var(--nav-h)" : "calc(50% - 32vh)";
    const finalVideoL = isMobile ? "5%"          : "3%";
    const finalRadius = "14px";
    const pinEnd      = isMobile ? "+=110%"      : "+=180%";
    const scrubVal    = isMobile ? 1.2           : 1.8;

    const storyTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scrollStory",
        start: "top top",
        end: pinEnd,
        pin: true,
        scrub: scrubVal,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    storyTl.to(ssVideoWrap, {
      width: finalVideoW, height: finalVideoH,
      top: finalVideoT,   left: finalVideoL,
      borderRadius: finalRadius,
      ease: "power1.inOut", duration: 1
    }, 0);

    const ssCorners = ssVideoWrap.querySelectorAll(".ss-video-corner");
    storyTl.to(ssCorners, { opacity: 1, ease: "none", duration: 0.15 }, 1);

    storyTl.to(ssKicker, { opacity: 1, ease: "none", duration: 0.25 }, 0.1);

    storyTl.to(splitHeading.words, {
      color: "#ffffff",
      stagger: { each: isMobile ? 0.04 : 0.06, from: "start", ease: "none" },
      ease: "none", duration: 0.5
    }, 0.18);

    storyTl.to(splitBody.words, {
      color: "rgba(255,255,255,0.82)",
      stagger: { each: isMobile ? 0.018 : 0.025, from: "start", ease: "none" },
      ease: "none", duration: 0.6
    }, 0.38);

    if (!isMobile && ssDivider) {
      gsap.set(ssDivider, { left: "calc(3% + 48% + 1.5%)" });
      storyTl.to(ssDivider, { scaleY: 1, ease: "power2.out", duration: 0.18 }, 0.78);
    }

    if (ssLink) storyTl.to(ssLink, { opacity: 1, ease: "none", duration: 0.15 }, 0.88);
  }


  /* --------------------------------
  //   Values section animations
  --------------------------------- */
  function initValuesAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof SplitText === "undefined") return;

    const headline  = document.querySelector(".nf-values__headline");
    const statement = document.querySelector(".nf-values__statement");
    const kicker    = document.querySelector(".nf-values__kicker");
    const count     = document.querySelector(".nf-values__count");
    const rows      = document.querySelectorAll(".nf-value-row");
    const ctaText   = document.querySelector(".nf-values__cta-text");

    if (!headline) return;

    // ── Header: kicker, headline, count slide up on enter
    gsap.set([kicker, headline, count], { opacity: 0, y: 22 });
    ScrollTrigger.create({
      trigger: ".nf-values__header",
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(kicker,   { opacity: 1, y: 0, duration: 0.5,  ease: "power3.out" });
        gsap.to(headline, { opacity: 1, y: 0, duration: 0.8,  ease: "expo.out",   delay: 0.1 });
        gsap.to(count,    { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.35 });
      }
    });

    // ── Statement: slide in from right + fade in on enter
    if (statement) {
      gsap.set(statement, { opacity: 0, x: 40 });
      ScrollTrigger.create({
        trigger: ".nf-values__header",
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(statement, { opacity: 1, x: 0, duration: 0.8, ease: "expo.out", delay: 0.15 });
        }
      });
    }

    // ── Value rows: staggered fade + slide up when list enters
    if (rows.length) {
      gsap.set(rows, { opacity: 0, y: 26 });
      gsap.to(rows, {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".nf-values__list",
          start: "top 84%",
          toggleActions: "play none none none",
        }
      });
    }

    // ── CTA: simple rise on enter
    if (ctaText) {
      gsap.set(ctaText, { opacity: 0, y: 24 });
      gsap.to(ctaText, {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".nf-values__footer",
          start: "top bottom",
          toggleActions: "play none none none",
        }
      });
    }
  }


  /* --------------------------------
  //   nfTransition (Concept â†’ Deployment)
  --------------------------------- */
  function initNFTransition() {
    const section = document.querySelector("#nfTransition");
    const line = document.querySelector(".nf-connector-line");
    const media = document.querySelector(".nf-transition__media");
    const frames = gsap.utils.toArray(".nf-frame");

    if (!section || !line || !media) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Shared image-cycling callback â€” runs on all viewport sizes
    const cycleFrames = (self) => {
        const index = Math.round(self.progress * (frames.length - 1));
        frames.forEach((img, i) => img.classList.toggle("is-active", i === index));
    };

    const mm = gsap.matchMedia();

    // â”€â”€ Desktop (â‰¥769px): slide line + media card together â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    mm.add("(min-width: 769px)", () => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: media,
                start: "top 85%",
                end: "top 30%",
                scrub: 1,
                onUpdate: cycleFrames
            }
        });
        tl.to(line, { width: "50vw", ease: "none" }, 0);
        tl.to(media, { x: "55vw", ease: "none" }, 0);
        return () => { tl.kill(); };
    });

    // â”€â”€ Mobile (â‰¤768px): slide line + text only â€” media stays fixed â”€â”€â”€â”€â”€â”€â”€â”€â”€
    mm.add("(max-width: 768px)", () => {
        // Ensure no residual x offset from a previous desktop context
        gsap.set(media, { x: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: media,
                start: "top 85%",
                end: "top 30%",
                scrub: 1,
                onUpdate: cycleFrames
            }
        });
        tl.to(line, { width: "50vw", ease: "none" }, 0);
        // media.x intentionally omitted â€” images still cycle via onUpdate above
        return () => {
            tl.kill();
            gsap.set(media, { clearProps: "x" });
        };
    });
  }

  /* --------------------------------
  //   Underline reveal (Services)
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

    nfUnderlineReveal({ listSelector: ".nf-services-list", itemSelector: ".nf-service", start: "bottom bottom" });
  }


  /* --------------------------------
   Services hover (desktop only)
--------------------------------- */
function initServicesHover() {
  const panel = document.querySelector(".nf-services-panel");
  const list = document.querySelector(".nf-services-list");
  const links = panel ? Array.from(panel.querySelectorAll(".nf-service-link")) : [];
  if (!panel || !list || !links.length) return;

  // Desktop-only gating
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!mq.matches) return;

  // Respect reduced motion (optional, but good practice)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  // Inject background container if not present
  let bg = panel.querySelector(".nf-services-bg");
  if (!bg) {
    bg = document.createElement("div");
    bg.className = "nf-services-bg";
    bg.setAttribute("aria-hidden", "true");
    // Insert as first child so it sits behind content
    panel.insertBefore(bg, panel.firstChild);
  }

  // Map each service to a placeholder image
  // (Swap these paths later with your real assets)
  const serviceBgMap = {
    "web-design": "./img/web-design.jpg",
    "custom-development": "./img/web-dev.jpg",
    "ecommerce": "./img/ecommerce2.jpg",
    "managed-services": "./img/managed-services.jpg",
    "ai-integrations": "./img/ai-integrations.jpg"
  };

  // Helper to get key from href="#something"
  const getKeyFromLink = (a) => {
    const href = a.getAttribute("href") || "";
    const hash = href.startsWith("#") ? href.slice(1) : "";
    return hash || null;
  };

  // Build layers once
  const layersByKey = new Map();

  // Only create layers for keys that exist in markup (so it stays robust)
  links.forEach((a) => {
    const key = getKeyFromLink(a);
    if (!key || layersByKey.has(key)) return;

    const layer = document.createElement("div");
    layer.className = "nf-services-bg__layer";
    layer.dataset.key = key;

    const img = serviceBgMap[key] || "../img/placeholder-services-generic.jpg";
    layer.style.backgroundImage = `url("${img}")`;

    bg.appendChild(layer);
    layersByKey.set(key, layer);
  });

  // Title flip: wrap each .nf-service-title into 2 stacked identical lines
  links.forEach((a) => {
    const title = a.querySelector(".nf-service-title");
    if (!title) return;

    // prevent double-wrapping
    if (title.querySelector(".nf-title-flip")) return;

    const text = title.textContent.trim();
    title.textContent = "";

    const flip = document.createElement("span");
    flip.className = "nf-title-flip";

    const line1 = document.createElement("span");
    line1.className = "nf-title-flip__line";
    line1.textContent = text;

    const line2 = document.createElement("span");
    line2.className = "nf-title-flip__line";
    line2.textContent = text;

    flip.appendChild(line1);
    flip.appendChild(line2);
    title.appendChild(flip);
  });

  let activeKey = null;
  let activeLI = null;

  const setActive = (key, li) => {
    if (!key) return;

    // panel hover mode on
    panel.classList.add("is-hovering");

    // set active LI
    if (activeLI && activeLI !== li) activeLI.classList.remove("is-active");
    activeLI = li;
    if (activeLI) activeLI.classList.add("is-active");

    // swap background layer
    if (activeKey && activeKey !== key) {
      const prev = layersByKey.get(activeKey);
      if (prev) prev.classList.remove("is-active");
    }
    activeKey = key;

    const next = layersByKey.get(key);
    if (next) next.classList.add("is-active");
  };

  const clearActive = () => {
    panel.classList.remove("is-hovering");

    if (activeLI) activeLI.classList.remove("is-active");
    activeLI = null;

    if (activeKey) {
      const layer = layersByKey.get(activeKey);
      if (layer) layer.classList.remove("is-active");
    }
    activeKey = null;
  };

  // Hover handlers
  links.forEach((a) => {
    const li = a.closest(".nf-service");
    const key = getKeyFromLink(a);

    a.addEventListener("mouseenter", () => setActive(key, li));
    a.addEventListener("focusin", () => setActive(key, li)); // keyboard-friendly
  });

  // When cursor leaves the list/panel area, reverse everything
  list.addEventListener("mouseleave", clearActive);

  // If focus leaves the whole panel, clear state (keyboard)
  panel.addEventListener("focusout", (e) => {
    if (!panel.contains(e.relatedTarget)) clearActive();
  });
}


  /* --------------------------------
  //   Parallax images
  --------------------------------- */
  function initParallaxCards() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    document.querySelectorAll(".nf-card__media img").forEach((img) => {
      const card = img.closest(".nf-card");
      if (!card) return;
      // Featured card is a static header — skip parallax
      if (card.classList.contains("nf-card--featured")) return;

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
  //   Text widget scroll (your original)
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

  (function initLogoVisibility() {
  if (typeof ScrollTrigger === "undefined") return;

  const intro = document.querySelector("#nf-intro");
  const hero = document.querySelector("#hero");
  const navBtn = document.getElementById("btn-nav-toggle");
  if (!intro || !hero) return;


  const blackPanel = document.querySelector(".nf-intro__panel--black");
  if (blackPanel) {
  ScrollTrigger.create({
    trigger: blackPanel,
    start: "top top+=1",
    onEnter: () => document.body.classList.add("nf-logo-visible"),
    onLeaveBack: () => document.body.classList.remove("nf-logo-visible")
  });
}

  // Hide logo whenever menu opens, regardless of scroll position
  const setNavOpenClass = () => {
    const isOpen = navBtn?.getAttribute("aria-expanded") === "true";
    document.body.classList.toggle("nf-nav-open", !!isOpen);
  };

  // Run once, and whenever the button is clicked
  setNavOpenClass();
  navBtn?.addEventListener("click", () => {
    // Wait a tick so aria-expanded updates first
    requestAnimationFrame(setNavOpenClass);
  });

  // Also update if you toggle nav in other ways
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") requestAnimationFrame(setNavOpenClass);
  });
})();

  /* --------------------------------
     DOMContentLoaded observers (rise/slide/sticky) â€“ your original
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


  // ============================
  // INTRO TITLE LINE REVEAL
  // ============================
  function revealIntroTitleLines() {
    if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;

    const title = document.querySelector(".nf-intro__title[data-reveal='lines']");
    if (!title) return;

    if (title.dataset.nfIntroSplit !== "1") {
      SplitText.create(title, {
        type: "lines",
        mask: "lines",
        linesClass: "nf-line"
      });
      title.dataset.nfIntroSplit = "1";
    }

    const lines = title.querySelectorAll(".nf-line");
    if (!lines.length) return;

    gsap.set(lines, { yPercent: 110, opacity: 0 });
    gsap.set(title, { opacity: 1 });

    gsap.to(lines, {
      yPercent: 0,
      opacity: 1,
      duration: 0.95,
      stagger: 0.12,
      ease: "osmo-ease",
      overwrite: true
    });
  }

  /* --------------------------------
     MASTER INIT (THIS is the â€œdonâ€™t break the siteâ€ part)
  --------------------------------- */
  function initEverything() {
    try {
      initCursor();
      initNavToggle();
      initObserversAndUI();

      // HERO — editorial stack + scroll story
      initEditorialHero();
      initScrollStory();

      // Values section
      initValuesAnimations();

      // GSAP/ScrollTrigger pieces
      initHeaderPin();
      initFlipButtons();
      initTabSystem();
      initNFTransition();
      initUnderlineReveals();
      initServicesHover();
      initParallaxCards();
      initTextWidgetScroll();

      // Line reveals after fonts (to get correct wraps)
      NF.afterFonts()
        .then(NF.afterPaint)
        .then(() => initLineReveals())
        .catch(() => initLineReveals());

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
//   END OF FILE
--------------------------------- */
