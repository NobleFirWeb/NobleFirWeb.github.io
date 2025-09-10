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