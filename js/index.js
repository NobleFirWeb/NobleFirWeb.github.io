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
  //   Loader (INDEX ONLY) – your original logic preserved
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
        revealIntroTitleLines();
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
      backgroundColor: "#0f0e0f",
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
  VALUES (Pinned left + scrolling right list)
  --------------------------------- */
  function initValuesPinnedScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const section = document.querySelector(".values-content");
    if (!section) return;

    const weBelieve = section.querySelector(".we-believe");
    const list = section.querySelector(".values-list") || section.querySelector("ul");
    if (!weBelieve || !list) return;

    const items = gsap.utils.toArray(list.querySelectorAll("li"));
    if (!items.length) return;

    const lastItem = items[items.length - 1];

    const cards = list ? gsap.utils.toArray(list.querySelectorAll(".value-item")) : [];




    // Kill old triggers for this section if you hot-reload / re-init
    ScrollTrigger.getAll().forEach((st) => {
      if (st?.vars?.trigger === section || st?.vars?.trigger === weBelieve) st.kill();
    });

    // Force a reliable start state (in case CSS didn’t apply or got overwritten)
    gsap.set(items, { opacity: 0, x: 80, willChange: "transform, opacity" });

    // Where is the "center line" of the pinned weBelieve element in the viewport?
    // Pinned at "top center" => its TOP sits at 50vh, so its CENTER is 50vh + half its height.
    const believeCenterY = () => {
      const h = weBelieve.offsetHeight || weBelieve.getBoundingClientRect().height || 0;
      return Math.round(window.innerHeight * 0.5 + h * 0.5);
    };

    // PIN weBelieve
    ScrollTrigger.create({
      trigger: weBelieve,
      start: "top center",

      // END when the center of the last <li> reaches the center of the pinned weBelieve
      endTrigger: lastItem,
      end: () => `center ${believeCenterY()}px`,

      pin: weBelieve,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,

      // markers: true,
    });

    // REVEAL each item when its center reaches the weBelieve center line
    items.forEach((item) => {
  // reveal on scroll
  gsap.to(item, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: "power2.out",
    overwrite: "auto",
    scrollTrigger: {
      trigger: item,
      start: () => `top ${believeCenterY()}px`,
      toggleActions: "play none none none",
      invalidateOnRefresh: true
    }
  });
});



  

    // Extra refresh hooks (your file already refreshes a lot, but this makes this section bulletproof)
    NF.afterFonts().then(NF.afterPaint).then(() => ScrollTrigger.refresh(true));
  }

  function initValuesStackedCards() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const section = document.querySelector("#valuesPin") || document.querySelector(".values-content");
    if (!section) return;

    const weBelieve = section.querySelector(".we-believe");
    const list = section.querySelector(".values-list");
    const cards = list ? gsap.utils.toArray(list.querySelectorAll(".value-item")) : [];
    if (!weBelieve || !list || !cards.length) return;

    const mm = window.matchMedia("(max-width: 768px)");
    const isMobile = mm.matches;

    // Kill ONLY triggers tied to this widget
    ScrollTrigger.getAll().forEach((st) => {
      const t = st.vars?.trigger;
      if (t === section || t === weBelieve || t === list || cards.includes(t)) st.kill();
    });

    // Ensure list is a stage
    gsap.set(list, { position: "relative", height: "100vh", overflow: "visible" });

    const cardH = () => (cards[0]?.getBoundingClientRect().height || 415);

    // top-peek ratio (each stacked card shows ~25% of its height)
    const peekRatio = 0.25;
    const stackDistance = () => Math.round(cardH() * peekRatio);

    // tighter scroll on mobile to avoid massive pin-spacer
    const stepScroll = () => {
      const h = cardH();
      return isMobile
        ? Math.max(window.innerHeight * 0.38, h * 0.55)
        : Math.max(window.innerHeight * 0.65, h * 0.95);
    };

    // cap end whitespace on mobile (≈ 30vh max)
    const holdScroll = () => {
      return isMobile
        ? Math.round(window.innerHeight * 0.30)
        : Math.max(window.innerHeight * 0.85, 650);
    };

    const totalScroll = () => stepScroll() * cards.length + holdScroll();

    // 10vh breathing room under pinned header on mobile
    const mobileGapPx = () => Math.round(window.innerHeight * 0.10);

    // deck placement:
    // - desktop: your tuned placement (negative top)
    // - mobile: place deck BELOW pinned header + gap
    const deckTop = () => {
      if (!isMobile) return Math.round(window.innerHeight * -0.4);
      const headerH = weBelieve.getBoundingClientRect().height || 0;
      return Math.round(headerH + mobileGapPx());
    };

    // Layer + baseline placement
    cards.forEach((card, i) => {
      gsap.set(card, {
        position: "absolute",
        top: deckTop(),
        left: 0,
        right: 0,
        margin: "0 auto",
        zIndex: i + 1,
        yPercent: 0
      });
    });

    // --- Glow animation (continuous, per-card) ---
    cards.forEach((card, i) => {
      gsap.to(card, {
        "--bg-x": i % 2 ? "80%" : "20%",
        "--bg-y": i % 2 ? "25%" : "85%",
        duration: 7 + i * 0.6,
        repeat: -1,
        yoyo: true,
        ease: "none",
      });
    });


    // Start all cards below the stage
    gsap.set(cards, { autoAlpha: 1, y: window.innerHeight });

    // Main pinned deck timeline (reversible because scrubbed)
    const deckTL = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: isMobile ? "top top+=10%" : "top center", // mobile starts a bit later
        end: () => `+=${totalScroll()}`,
        pin: list,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          // recalc header height + gap and re-place the deck
          cards.forEach((card) => gsap.set(card, { top: deckTop() }));
        }
        // markers: true,
      }
    });

    cards.forEach((card, i) => {
      const pos = stepScroll() * i;
      deckTL.to(
        card,
        {
          y: () => i * stackDistance(),
          duration: stepScroll() * 0.9,
          ease: "power2.out"
        },
        pos
      );
    });

    // Pin header:
    // - Desktop: keep your centered pin by pinning from top center
    // - Mobile: pin it to the TOP (stays in the “red box” at top)
    ScrollTrigger.create({
      trigger: section,
      start: isMobile ? "top top+=10%" : "top center",
      end: () => `+=${totalScroll()}`,
      pin: weBelieve,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true
      // markers: true,
    });

    // Refresh when layout is stable
    (document.fonts?.ready || Promise.resolve()).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh(true)));
    });
    window.addEventListener("resize", () => ScrollTrigger.refresh(true));
  }



  /* --------------------------------
  //   nfTransition (Concept → Deployment)
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
        end: "top 15%",
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
  //   Underline reveal (values + services)
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
  //   Parallax images
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
     MASTER INIT (THIS is the “don’t break the site” part)
  --------------------------------- */
  function initEverything() {
    try {
      initCursor();
      initNavToggle();
      initObserversAndUI();

      // ✅ NEW HERO (replaces old hero title reveal functionality)
      initHeroNFVideo();
      initHeroVideoExpand();

      // GSAP/ScrollTrigger pieces
      initAboutTextFill();
      initValuesStackedCards();
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
