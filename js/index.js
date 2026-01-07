// site-scripts.js | Shared JavaScript for index.html and about.html

// ============================
// GSAP + SplitText Line Reveal + Index Loader 
// ============================

gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

(function nfIndexLoader() {
  // Only run on index.html (or site root)
  const path = window.location.pathname;
  const isIndex =
    path.endsWith("/") ||
    path.endsWith("/index.html") ||
    path.endsWith("index.html");

  if (!isIndex) return;

  const loader = document.getElementById("nf-loader");
  const img = loader?.querySelector(".nf-loader__img");
  const page = document.getElementById("nf-page");

  if (!loader || !img || !page || typeof gsap === "undefined") return;

  // Lock scroll + hide page
  document.body.classList.add("nf-loading");

  const run = () => {
    const percentEl = document.getElementById("nf-loader-percent");
    const counterEl = document.querySelector(".nf-loader__counter");
    const prog = { v: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" }
    });

    // Initial states
    gsap.set(page, { autoAlpha: 0 });
    gsap.set(loader, { autoAlpha: 1 });
    gsap.set(img, { scale: 1, filter: "blur(0px)", autoAlpha: 1 });

    if (counterEl) gsap.set(counterEl, { autoAlpha: 1 });
    if (percentEl) percentEl.textContent = "0";

    // --------------------------------
    // 1) Hold hallway still frame
    // --------------------------------
    tl.to({}, { duration: 1 });

    // --------------------------------
    // 2) Walk + counter
    // --------------------------------
    tl.addLabel("walk");

    tl.to(
      img,
      {
        duration: 3,
        scale: 10,
        z: 500,
        ease: "power4.in"
      },
      "walk"
    );

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

    // --------------------------------
    // 3) Fade to black
    // --------------------------------
    tl.to(
      img,
      {
        duration: 0.5,
        autoAlpha: 0,
        filter: "blur(0px)",
        ease: "power2.out"
      },
      "walk+=3"
    );

    // --------------------------------
    // 4) Hold on black
    // --------------------------------
    tl.to({}, { duration: 1 });

    // --------------------------------
    // 5) Fade loader out, page in
    // --------------------------------
    if (counterEl) {
      tl.to(counterEl, { autoAlpha: 0, duration: 0.5 }, ">");
    }

    tl.to(loader, { autoAlpha: 0, duration: 0.35 }, "<");
    tl.to(page, { autoAlpha: 1, duration: 1.25 }, "<+0.1");

    // --------------------------------
    // 6) HERO TITLE: split + animate
    // --------------------------------
    tl.call(
      () => {
        const runHeroReveal = () => {
          if (typeof SplitText === "undefined") {
            console.warn("[NF] SplitText missing.");
            return;
          }

          const heroEls = document.querySelectorAll("#hero [data-reveal='lines']");
          if (!heroEls.length) {
            console.warn("[NF] No hero elements found.");
            return;
          }

          // Split ONLY now (no flash)
          heroEls.forEach((el) => {
            if (el.dataset.nfSplit === "1") return;

            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              linesClass: "nf-line"
            });

            el.dataset.nfSplit = "1";
          });

          const heroLines = document.querySelectorAll("#hero .nf-line");
          if (!heroLines.length) return;

          // Put lines in start position (still invisible)
          gsap.set(heroLines, { yPercent: 45, opacity: 0 });

          // Reveal headings AFTER split
          gsap.set(heroEls, { opacity: 1 });

          // Animate lines
          gsap.to(heroLines, {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: "osmo-ease",
            delay: 0.15,
            overwrite: true,
            onComplete: () => {
              // Arm the video expand scroll effect once the title reveal is done
              
              ScrollTrigger.refresh(); // important after pin setup
            },
          });
        };

        // Fonts + layout must be ready
        (document.fonts?.ready || Promise.resolve())
          .then(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() =>
                  requestAnimationFrame(resolve)
                )
              )
          )
          .then(runHeroReveal);
      },
      null,
      ">+=0.05"
    );

    // --------------------------------
    // Cleanup
    // --------------------------------
    tl.add(() => {
      loader.style.display = "none";
      document.body.classList.remove("nf-loading");
    });
  };

  if (img.complete) {
    run();
  } else {
    img.addEventListener("load", run, { once: true });
    img.addEventListener(
      "error",
      () => {
        loader.style.display = "none";
        gsap.set(page, { autoAlpha: 1 });
        document.body.classList.remove("nf-loading");
      },
      { once: true }
    );
  }
})();

// ============================
// Animate Video Container
// ============================
/*
gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin);

gsap.to("#heroVideoWrapper", {
  scaleX: 75/40,      // 75vw -> 100vw
  scaleY: 70/35,      // 60vh -> 100vh
  ease: "none",
  scrollTrigger: {
    trigger: "#heroVideoWrapper",
    start: "center center",  // ✅ locks when centered
    end: "+=120%",           // ✅ scroll distance for expansion
    scrub: 1,
    pin: true,
    anticipatePin: 1
    // markers: true
  }
});
*/


// VALUES SECTION (Rows 1–3)
// - Text + image parallax on scroll (by class / row trigger)
// - Paragraph reveal (SplitText lines) when image bottom becomes visible
// ============================

(function initValuesSectionGSAP() {
  if (typeof gsap === "undefined") return;

  // Ensure ScrollTrigger + SplitText + CustomEase are available
  if (typeof ScrollTrigger === "undefined") {
    console.warn("[NF] ScrollTrigger missing. Values animations not initialized.");
    return;
  }
  if (typeof SplitText === "undefined") {
    console.warn("[NF] SplitText missing. Paragraph line reveals will not run.");
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
  if (typeof CustomEase !== "undefined") gsap.registerPlugin(CustomEase);

  if (typeof CustomEase !== "undefined") {
    // Safe to call multiple times; GSAP will reuse the name
    CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
  }

  // ---------- Helper: SplitText line reveal ONCE ----------
  function nfRevealLinesOnce(el, { fromYPercent = 45, duration = 1.05, stagger = 0.08 } = {}) {
    if (!el) return;
    if (el.dataset.nfSplit === "1") return;
    if (typeof SplitText === "undefined") return;

    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "nf-line"
    });

    el.dataset.nfSplit = "1";

    const lines = el.querySelectorAll(".nf-line");
    if (!lines.length) return;

    // Put lines in start position while paragraph is still hidden
    gsap.set(lines, { yPercent: fromYPercent, opacity: 0 });

    // Reveal the paragraph element after splitting (prevents flash)
    gsap.set(el, { opacity: 1 });

    gsap.to(lines, {
      yPercent: 0,
      opacity: 1,
      duration,
      stagger,
      ease: typeof CustomEase !== "undefined" ? "osmo-ease" : "power3.out",
      overwrite: true
    });
  }

  // ---------- Helper: wait for fonts + 2 paint frames ----------
  function nfAfterFontsAndPaint(fn) {
    (document.fonts?.ready || Promise.resolve())
      .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      .then(fn)
      .catch(fn);
  }

  // ---------- Row 1: Quality ----------
  gsap.to(".filled-text1, .outline-text1", {
    x: 450,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(1)",
      start: "top bottom",
      end: "bottom top",
      force3D: true,
      modifiers: {
        x: v => Math.round(parseFloat(v)) + "px"
      },
      scrub: 1
    }
  });

  gsap.to(".quality-image", {
    x: -400,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(1)",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
      // markers: true
    }
  });

  ScrollTrigger.create({
    trigger: ".quality-image",
    start: "bottom bottom",
    once: true,
    onEnter: () => {
      const p = document.querySelector(".value-paragraph1");
      if (!p) return;
      nfAfterFontsAndPaint(() => nfRevealLinesOnce(p, { fromYPercent: 45, duration: 1.05, stagger: 0.08 }));
    }
  });

  // ---------- Row 2: Creativity ----------
  gsap.to(".filled-text2, .outline-text2", {
    x: -300,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(2)",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
      // markers: true
    }
  });

  gsap.to(".creativity-image", {
    x: 400,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(2)",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
      // markers: true
    }
  });

  ScrollTrigger.create({
    trigger: ".creativity-image",
    start: "bottom bottom",
    once: true,
    onEnter: () => {
      const p = document.querySelector(".value-paragraph2");
      if (!p) return;
      nfAfterFontsAndPaint(() => nfRevealLinesOnce(p, { fromYPercent: 45, duration: 1.05, stagger: 0.08 }));
    }
  });

  // ---------- Row 3: Collaboration ----------
  gsap.to(".filled-text3, .outline-text3", {
    x: 150,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(3)",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
      // markers: true
    }
  });

  gsap.to(".collab-image", {
    x: -350,
    ease: "none",
    scrollTrigger: {
      trigger: ".values .row:nth-child(3)",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
      // markers: true
    }
  });

  ScrollTrigger.create({
    trigger: ".collab-image",
    start: "bottom bottom",
    once: true,
    onEnter: () => {
      const p = document.querySelector(".value-paragraph3");
      if (!p) return;
      nfAfterFontsAndPaint(() => nfRevealLinesOnce(p, { fromYPercent: 45, duration: 1.05, stagger: 0.08 }));
    }
  });
})();

// Requires: gsap, SplitText, CustomEase
gsap.registerPlugin(SplitText, CustomEase);

// Ease from the CodePen
CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

function initLineReveals({
  selector = '[data-reveal="lines"]',
  once = true,
  rootMargin = "0px 0px -10% 0px" // trigger a bit before fully in view
} = {}) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return;

  // If reduced motion: just show everything immediately
  if (prefersReducedMotion) return;

  // Split + prep each element
  const items = els.map((el) => {
    // Split into LINES only + mask lines
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "nf-line"
    });

    const lines = el.querySelectorAll(".nf-line");

    // Start hidden (pushed down)
    gsap.set(lines, { yPercent: 110 });

    // Build the animation (paused until in view)
    const tween = gsap.to(lines, {
      yPercent: 0,
      duration: 0.95,
      stagger: 0.15,
      ease: "osmo-ease",
      paused: true
    });

    return { el, tween };
  });

  // Trigger on scroll (no ScrollTrigger needed)
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

// Wait for fonts so line breaks are correct (same idea as the CodePen)
document.fonts.ready.then(() => {
  initLineReveals();
});


// Wait for DOM
window.addEventListener("DOMContentLoaded", () => {

  /*** STICKY NAVBAR ***/
  const navbar = document.querySelector(".navbar");
  const aboutSection = document.getElementById("about");
  if (navbar && aboutSection) {
    window.addEventListener("scroll", () => {
      const aboutTop = aboutSection.getBoundingClientRect().top;
      navbar.classList.toggle("sticky", aboutTop <= 0);
    });
  }



  /*** RISE ANIMATION ***/
  const riseElements = document.querySelectorAll("[data-rise='true']");
  const riseObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        riseObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.5 
  });

  //Observe the Rise Elements
  riseElements.forEach(el => riseObserver.observe(el));

  /*** SLIDE ANIMATION ***/
const slideElements = document.querySelectorAll('[slide-right="true"], [slide-left="true"]');

// Create observer
const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            slideObserver.unobserve(entry.target); // stop observing once revealed
        }
    });
}, {
    threshold: 0.5 // trigger when 30% visible
});

// Observe each slide element
slideElements.forEach(el => slideObserver.observe(el));



  /*** MOBILE NAVIGATION ***/
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const openIcon = document.getElementById("openIcon");
  const closeIcon = document.getElementById("closeIcon");

  if (menuToggle && mobileMenu && openIcon && closeIcon) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.style.right === "0px";
      mobileMenu.style.right = isOpen ? "-100%" : "0px";
      openIcon.style.display = isOpen ? "block" : "none";
      closeIcon.style.display = isOpen ? "none" : "block";
      document.body.classList.toggle("no-scroll", !isOpen);
    });

    // Dropdown toggle
    mobileMenu.querySelectorAll(".dropdown-toggle").forEach(toggle => {
      toggle.addEventListener("click", e => {
        e.preventDefault();
        toggle.parentElement.classList.toggle("open");
      });
    });

    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", e => {
        if (!link.classList.contains("dropdown-toggle")) {
          mobileMenu.style.right = "-100%";
          openIcon.style.display = "block";
          closeIcon.style.display = "none";
        }
      });
    });
  }

  /*** SMOOTH SCROLLING FOR ANCHORS ***/
  document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });



  /*** Shoelace FAQs - one open at a time ***/
  const faqContainer = document.querySelector(".details-group-example");
  if (faqContainer) {
    faqContainer.addEventListener("sl-show", event => {
      if (event.target.localName === "sl-details") {
        faqContainer.querySelectorAll("sl-details").forEach(el => {
          if (el !== event.target) el.open = false;
        });
      }
    });
  }

  /*** Reviews Carousel (Shoelace) ***/
  const slCarousel = document.querySelector("sl-carousel.aspect-ratio");
  const aspectControl = document.querySelector("sl-select[name='aspect']");
  if (slCarousel && aspectControl) {
    aspectControl.addEventListener("sl-change", () => {
      slCarousel.style.setProperty("--aspect-ratio", aspectControl.value);
    });
  }
});


// About us popup modal
const dialog = document.querySelector('.dialog-width');
const openButton = dialog.nextElementSibling;
const closeButton = dialog.querySelector('sl-button[slot="footer"]');

openButton.addEventListener('click', () => dialog.show());
closeButton.addEventListener('click', () => dialog.hide());







