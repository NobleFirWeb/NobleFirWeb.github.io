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


