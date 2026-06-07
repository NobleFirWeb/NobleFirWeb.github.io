// Requires: gsap, SplitText, CustomEase, ScrollTrigger
gsap.registerPlugin(SplitText, CustomEase, ScrollTrigger);

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

// ===== Cross-fade preview image on hover/focus (0.2s) =====
(() => {
  const root = document.querySelector(".nf-svcs-flip");
  if (!root) return;

  const current = root.querySelector(".nf-svcs__img--current");
  const next = root.querySelector(".nf-svcs__img--next");
  const links = root.querySelectorAll(".nf-svcs__link");

  // default to first item’s image if available
  if (links[0]?.dataset.img) current.src = links[0].dataset.img;

  function swap(url) {
    if (!url || current.src.endsWith(url)) return;
    next.src = url; // set up the next layer
    next.style.opacity = "1";
    setTimeout(() => {
      current.src = url; // commit
      next.style.opacity = "0";
    }, 200); // match CSS .2s
  }

  links.forEach((l) => {
    const u = l.dataset.img;
    l.addEventListener("mouseenter", () => swap(u));
    l.addEventListener("focusin", () => swap(u));
  });
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

  const SIDE_PEEK = () => stage.getBoundingClientRect().width * 0.05;
  const cardWidth = () => cards[0] ? cards[0].getBoundingClientRect().width : 0;
  const gap = () => parseFloat(window.getComputedStyle(track).columnGap) || 24;
  const targetX = idx => SIDE_PEEK() - idx * (cardWidth() + gap());

  function updateCards(idx) {
    cards.forEach((c, i) => {
      const active = i === idx;
      c.classList.toggle('is-active', active);
      gsap.to(c, { opacity: active ? 1 : 0.45, scale: active ? 1 : 0.97, duration: 0.4, ease: 'power2.out' });
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
    if (animate) gsap.to(track, { x, duration: 0.55, ease: 'power3.out' });
    else gsap.set(track, { x });
    updateCards(current);
    updateDots(current);
    updateCounter(current);
  }

  function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(current + 1), 4000); }
  function stopAuto()  { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  gsap.set(track, { x: targetX(0) });
  updateCards(0); updateDots(0); updateCounter(0);
  startAuto();

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  const section = document.getElementById('nf-reviews');
  if (section) {
    section.setAttribute('tabindex', '-1');
    section.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
    });
  }

  let startX = 0, startTrackX = 0, dragging = false, moved = false;
  const DRAG_THRESHOLD = 6, SNAP_THRESHOLD = 60;

  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    stopAuto(); dragging = true; moved = false;
    startX = e.clientX; startTrackX = gsap.getProperty(track, 'x');
    stage.setPointerCapture(e.pointerId);
    gsap.killTweensOf(track);
  });

  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > DRAG_THRESHOLD) moved = true;
    if (moved) gsap.set(track, { x: startTrackX + dx });
  });

  stage.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (moved) {
      if (dx < -SNAP_THRESHOLD) goTo(current + 1);
      else if (dx > SNAP_THRESHOLD) goTo(current - 1);
      else goTo(current);
    } else goTo(current);
    startAuto();
  });

  stage.addEventListener('pointercancel', () => { if (dragging) { dragging = false; goTo(current); startAuto(); } });
  stage.addEventListener('click', e => { if (moved) e.stopPropagation(); }, true);
  window.addEventListener('resize', () => gsap.set(track, { x: targetX(current) }), { passive: true });
})();


// ===== Services section scrollspy and smooth scroll =====
(() => {
  const sections = Array.from(document.querySelectorAll('.svc'));
  const railLinks = Array.from(document.querySelectorAll('.svc-rail__list a'));
  const linkById = new Map(railLinks.map(a => [a.getAttribute('href').slice(1), a]));

  // Highlight on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      railLinks.forEach(a => a.classList.remove('is-active'));
      const match = linkById.get(id);
      if (match) match.classList.add('is-active');
    });
  }, { threshold: 0.6 });

  sections.forEach(sec => io.observe(sec));

  // Smooth scroll on click
  railLinks.forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ===== NEW: toggle visibility of rail when services are in view =====
(() => {
  const rail = document.querySelector('.svc-rail');
  const serviceSections = document.querySelectorAll('.svc'); // your full screen panels

  if (!rail || !serviceSections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const anyVisible = entries.some(entry => entry.isIntersecting);
      if (anyVisible) {
        rail.classList.add('visible');
      } else {
        rail.classList.remove('visible');
      }
    },
    { threshold: 0.5 }
  );

  serviceSections.forEach(section => observer.observe(section));
})();


// ===== Brand Reveal — column entrance (ScrollTrigger) =====
(function () {
    const left  = document.querySelector('.nf-reveal__left');
    const right = document.querySelector('.nf-reveal__right');
    if (!left || !right) return;

    gsap.set(left,  { opacity: 0, x: -32 });
    gsap.set(right, { opacity: 0, x: 32 });

    ScrollTrigger.create({
        trigger: '.nf-reveal',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to(left,  { opacity: 1, x: 0, duration: 0.8, ease: 'osmo-ease' });
            gsap.to(right, { opacity: 1, x: 0, duration: 0.8, ease: 'osmo-ease', delay: 0.12 });
        }
    });
})();


// ===== Creative Process — staggered card entrance =====
(function () {
    const cards = Array.from(document.querySelectorAll('.nf-proc__card'));
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 36 });

    ScrollTrigger.create({
        trigger: '#nf-process',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: 'osmo-ease'
            });
        }
    });
})();


// ===== Services list — staggered row entrance =====
(function () {
    const items = Array.from(document.querySelectorAll('.nf-svcs__item'));
    if (!items.length) return;

    gsap.set(items, { opacity: 0, x: 28 });

    ScrollTrigger.create({
        trigger: '.nf-svcs__right',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to(items, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.06,
                ease: 'osmo-ease'
            });
        }
    });
})();


// ===== Why Partner — heading & content reveal =====
(function () {
    const heading = document.querySelector('.nf-why__heading');
    const content = document.querySelector('.nf-why__content');
    if (!heading || !content) return;

    gsap.set([heading, content], { opacity: 0, y: 28 });

    ScrollTrigger.create({
        trigger: '.nf-why',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            gsap.to(heading, { opacity: 1, y: 0, duration: 0.8, ease: 'osmo-ease' });
            gsap.to(content, { opacity: 1, y: 0, duration: 0.8, ease: 'osmo-ease', delay: 0.15 });
        }
    });
})();


