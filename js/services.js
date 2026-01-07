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

// ===== Review Slider logic (no autoslide) =====
(() => {
  const track = document.querySelector('.nf-reviews__track');
  const slides = Array.from(document.querySelectorAll('.nf-review'));
  const prev = document.getElementById('nfPrev');
  const next = document.getElementById('nfNext');
  let index = 0;

  function go(i){
    index = (i + slides.length) % slides.length;          // wrap around
    const offset = -100 * index;                           // percent
    track.style.transform = `translateX(${offset}vw)`;     // slide by viewport widths
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  // keyboard support when section is focused
  document.getElementById('nf-reviews').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });
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


