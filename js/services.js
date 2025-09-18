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
