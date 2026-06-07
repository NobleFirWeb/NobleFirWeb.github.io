// Requires: gsap, SplitText, ScrollTrigger, CustomEase
gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase);

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

// Initialize the spinner: repeat text to fill the circle and set speed.
(function () {
    const spinner = document.querySelector(".text-spinner");
    if (!spinner) return;

    const textEl = spinner.querySelector("#spinnerText");
    const base = (spinner.getAttribute("data-text") || "LET’S GO! • ").trim();
    const speed = spinner.getAttribute("data-speed") || "12s";

    // Repeat the text enough times so the ring looks continuous
    let repeated = "";
    while (repeated.length < 80) repeated += base;
    textEl.textContent = repeated;

    // Set animation speed via CSS variable
    spinner.style.setProperty("--spin-duration", speed);
})();


var words = document.getElementsByClassName("word");
var wordArray = [];
var currentWord = 0;

words[currentWord].style.opacity = 1;
for (var i = 0; i < words.length; i++) {
    splitLetters(words[i]);
}

function changeWord() {
    var cw = wordArray[currentWord];
    var nw =
    currentWord == words.length - 1 ? wordArray[0] : wordArray[currentWord + 1];
    for (var i = 0; i < cw.length; i++) {
    animateLetterOut(cw, i);
    }

    for (var i = 0; i < nw.length; i++) {
    nw[i].className = "letter behind";
    nw[0].parentElement.style.opacity = 1;
    animateLetterIn(nw, i);
    }

    currentWord = currentWord == wordArray.length - 1 ? 0 : currentWord + 1;
}

function animateLetterOut(cw, i) {
    setTimeout(function () {
    cw[i].className = "letter out";
  }, i * 80);
}

function animateLetterIn(nw, i) {
    setTimeout(function () {
    nw[i].className = "letter in";
  }, 340 + i * 80);
}

function splitLetters(word) {
    var content = word.innerHTML;
    word.innerHTML = "";
    var letters = [];
    for (var i = 0; i < content.length; i++) {
    var letter = document.createElement("span");
    letter.className = "letter";
    letter.innerHTML = content.charAt(i);
    word.appendChild(letter);
    letters.push(letter);
    }

    wordArray.push(letters);
}

changeWord();
setInterval(changeWord, 3000);


(function(){
  const section = document.querySelector('#skills');
  if (!section) return;

  const items = Array.from(section.querySelectorAll('.skill'));
  const img   = section.querySelector('#skills-image');

  if (!items.length || !img) return;

  function activate(item){
    items.forEach(li => {
      const isActive = li === item;
      li.classList.toggle('skill--active', isActive);
      const btn = li.querySelector('.skill__row');
      if (btn) btn.setAttribute('aria-expanded', String(isActive));
    });

    const url = item.getAttribute('data-img');
    const alt = item.getAttribute('data-alt') || '';
    if (url) {
      img.style.opacity = 0;
      const preload = new Image();
      preload.onload = () => {
        img.src = url;
        img.alt = alt;
        img.style.opacity = 1;
      };
      preload.src = url;
    }
  }

  // init: ensure one active (first has skill--active in HTML)
  const initial = items.find(li => li.classList.contains('skill--active')) || items[0];
  if (initial) activate(initial);

  items.forEach(li => {
    const btn = li.querySelector('.skill__row');
    if (!btn) return;

    // Hover and focus activate
    btn.addEventListener('mouseenter', () => activate(li));
    btn.addEventListener('focus', () => activate(li));

    // Click also locks selection
    btn.addEventListener('click', () => activate(li));
  });

  // Arrow key navigation for accessibility
  const list = section.querySelector('.skills__ul');
  list.addEventListener('keydown', (e) => {
    const keys = ['ArrowUp','ArrowDown','Home','End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const current = items.findIndex(li => li.classList.contains('skill--active'));
    let idx = current;

    if (e.key === 'ArrowDown') idx = Math.min(items.length - 1, current + 1);
    if (e.key === 'ArrowUp')   idx = Math.max(0, current - 1);
    if (e.key === 'Home')      idx = 0;
    if (e.key === 'End')       idx = items.length - 1;

    const target = items[idx];
    activate(target);
    const btn = target.querySelector('.skill__row');
    if (btn) btn.focus();
  });
})();

// Counter functionality
(() => {
  const statsSection =
    document.getElementById("statsSection") || document.getElementById("stats");
  const counters = document.querySelectorAll(".counter");
  if (!statsSection || !counters.length) return;

  let hasAnimated = false;

  // Format numbers with commas when requested
  const formatNumber = (n, useCommas) =>
    useCommas ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : n.toString();

  const animateCounter = (el) => {
    // Backward compatible: data-count-to (preferred) OR data-target
    const target =
      Number(el.getAttribute("data-count-to") ?? el.getAttribute("data-target")) || 0;

    const suffix = el.getAttribute("data-suffix") ?? "";
    const prefix = el.getAttribute("data-prefix") ?? "";
    const useCommas = (el.getAttribute("data-format") || "").toLowerCase() === "commas";
    // Default to 2000ms if not provided
    const duration = Math.max(300, Number(el.getAttribute("data-duration")) || 2000);

    const startTime = performance.now();
    const startVal = 0;

    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Ease-out cubic for a nice finish
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      el.textContent = `${prefix}${formatNumber(current, useCommas)}${suffix}`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure exact final value
        el.textContent = `${prefix}${formatNumber(target, useCommas)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          statsSection.classList.add("visible");
          counters.forEach(animateCounter);
          hasAnimated = true;
          obs.disconnect(); // don’t run again
        }
      });
    },
    {
      threshold: 0.5, // roughly half the section in view
      root: null,
      rootMargin: "0px",
    }
  );

  observer.observe(statsSection);
})();

// ===== Review Slider — GSAP Draggable Carousel =====
(() => {
  const stage   = document.getElementById('nfStage');
  const track   = document.getElementById('nfTrack');
  const prevBtn = document.getElementById('nfPrev');
  const nextBtn = document.getElementById('nfNext');
  const counter = document.getElementById('nfCounter');
  const dotsWrap = document.getElementById('nfDots');
  if (!stage || !track) return;

  const cards = Array.from(track.querySelectorAll('.nf-card-review'));
  const dots  = Array.from(dotsWrap ? dotsWrap.querySelectorAll('.nf-dot') : []);
  const N     = cards.length;
  let current = 0;
  let autoTimer = null;

  // padding offset so the active card starts just inside the left edge
  const SIDE_PEEK = () => stage.getBoundingClientRect().width * 0.05;

  function cardWidth() {
    return cards[0] ? cards[0].getBoundingClientRect().width : 0;
  }

  function gap() {
    const style = window.getComputedStyle(track);
    return parseFloat(style.columnGap) || 24;
  }

  function targetX(idx) {
    return SIDE_PEEK() - idx * (cardWidth() + gap());
  }

  function updateCards(idx) {
    cards.forEach((c, i) => {
      const active = i === idx;
      c.classList.toggle('is-active', active);
      gsap.to(c, {
        opacity: active ? 1 : 0.45,
        scale:   active ? 1 : 0.97,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  }

  function updateDots(idx) {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  function updateCounter(idx) {
    if (!counter) return;
    const pad = n => String(n).padStart(2, '0');
    counter.innerHTML = `<em>${pad(idx + 1)}</em>&nbsp;/&nbsp;${pad(N)}`;
  }

  function goTo(idx, animate = true) {
    current = ((idx % N) + N) % N;
    const x = targetX(current);
    if (animate) {
      gsap.to(track, { x, duration: 0.55, ease: 'osmo-ease' });
    } else {
      gsap.set(track, { x });
    }
    updateCards(current);
    updateDots(current);
    updateCounter(current);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Init
  gsap.set(track, { x: targetX(0) });
  updateCards(0);
  updateDots(0);
  updateCounter(0);
  startAuto();

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Dot clicks
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  // Keyboard
  const section = document.getElementById('nf-reviews');
  if (section) {
    section.setAttribute('tabindex', '-1');
    section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
    });
  }

  // Drag / pointer
  let startX = 0, startTrackX = 0, dragging = false, moved = false;
  const DRAG_THRESHOLD = 6;
  const SNAP_THRESHOLD = 60;

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    stopAuto();
    dragging = true;
    moved = false;
    startX = e.clientX;
    startTrackX = gsap.getProperty(track, 'x');
    stage.setPointerCapture(e.pointerId);
    gsap.killTweensOf(track);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > DRAG_THRESHOLD) moved = true;
    if (moved) {
      gsap.set(track, { x: startTrackX + dx });
    }
  });

  stage.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (moved) {
      if (dx < -SNAP_THRESHOLD)      goTo(current + 1);
      else if (dx > SNAP_THRESHOLD)  goTo(current - 1);
      else                            goTo(current);
    } else {
      goTo(current);
    }
    startAuto();
  });

  stage.addEventListener('pointercancel', () => {
    if (dragging) { dragging = false; goTo(current); startAuto(); }
  });

  // Prevent click propagation on drag
  stage.addEventListener('click', (e) => { if (moved) e.stopPropagation(); }, true);

  // Recalculate on resize
  window.addEventListener('resize', () => gsap.set(track, { x: targetX(current) }), { passive: true });
})();



// ===== Hero Entrance (GSAP — replaces CSS abFadeUp) =====
(function () {
    const headline = document.querySelector('.ab-hero-headline');
    const sub      = document.querySelector('.ab-hero-sub');
    const right    = document.querySelector('.ab-hero-right');
    if (!headline || !sub || !right) return;

    // Reset opacity so the elements are invisible before GSAP fires
    gsap.set([headline, sub, right], { opacity: 0, y: 28 });

    const tl = gsap.timeline({ defaults: { ease: 'osmo-ease', duration: 0.9 } });
    tl.to(headline, { opacity: 1, y: 0 }, 0.05)
      .to(sub,      { opacity: 1, y: 0 }, 0.22)
      .to(right,    { opacity: 1, y: 0 }, 0.38);
})();


// ===== Skills list — ScrollTrigger stagger-in =====
(function () {
    const items = Array.from(document.querySelectorAll('.skill'));
    if (!items.length) return;

    gsap.set(items, { opacity: 0, x: 40 });

    ScrollTrigger.create({
        trigger: '.skills__ul',
        start: 'top 80%',
        onEnter: () => {
            gsap.to(items, {
                opacity: 1,
                x: 0,
                duration: 0.7,
                stagger: 0.07,
                ease: 'osmo-ease'
            });
        },
        once: true
    });
})();


// ===== Stats bg word — parallax scrub =====
(function () {
    const bg = document.querySelector('.nf-stats__bg');
    if (!bg) return;

    gsap.to(bg, {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
            trigger: '.nf-stats',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });
})();


// ===== Vibes numbers — horizontal parallax scrub =====
(function () {
    const vibe1num = document.querySelector('#vibe-1 .vibe-num');
    const vibe2num = document.querySelector('#vibe-2 .vibe-num');
    const vibe3num = document.querySelector('#vibe-3 .vibe-num');
    const vibe4num = document.querySelector('#vibe-4 .vibe-num');

    function addParallax(el, xStart, xEnd) {
        if (!el) return;
        gsap.fromTo(el,
            { x: xStart },
            {
                x: xEnd,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.vibe-row'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2
                }
            }
        );
    }

    addParallax(vibe1num, -40, 40);
    addParallax(vibe2num, 40, -40);
    addParallax(vibe3num, -40, 40);
    addParallax(vibe4num, 40, -40);
})();


// ===== Founder bio toggle (GSAP height tween) =====
(function () {
    const toggle   = document.querySelector('.nf-founder__toggle');
    const expanded = document.getElementById('founderExpanded');
    if (!toggle || !expanded) return;

    let open = false;

    // Set initial state
    gsap.set(expanded, { height: 0, opacity: 0, overflow: 'hidden' });

    toggle.addEventListener('click', () => {
        open = !open;
        toggle.setAttribute('aria-expanded', String(open));
        expanded.setAttribute('aria-hidden', String(!open));

        const label = toggle.querySelector('.nf-founder__toggle-label');

        if (open) {
            if (label) label.textContent = 'Read Less';
            gsap.to(expanded, {
                height: 'auto',
                opacity: 1,
                duration: 0.6,
                ease: 'osmo-ease'
            });
        } else {
            if (label) label.textContent = 'Read More';
            gsap.to(expanded, {
                height: 0,
                opacity: 0,
                duration: 0.45,
                ease: 'power2.inOut'
            });
        }
    });
})();
