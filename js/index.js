// site-scripts.js | Shared JavaScript for index.html and about.html

// Wait for DOM
window.addEventListener("DOMContentLoaded", () => {

  /*** LOADING SCREEN ***/
  const loadingScreen = document.getElementById("loadingScreen");
  const progressBar = document.getElementById("progressBar");
  if (loadingScreen && progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 33.33;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        loadingScreen.style.transform = "translateY(100%)";
        setTimeout(() => loadingScreen.remove(), 500);
        document.querySelectorAll(".hero-content [data-rise='true']").forEach(el => el.classList.add("visible"));
      }
    }, 750);
  }

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
  }, { threshold: 0.5 });

  riseElements.forEach(el => {
    if (!el.closest(".hero-content")) riseObserver.observe(el);
  });

  /*** HERO TEXT CYCLER ***/
  const textUpdates = document.querySelector(".text-updates");
  if (textUpdates) {
    const phrases = ['Succeed.', 'Thrive.', 'Innovate.', 'Grow.', 'Transform.', 'Excel.', 'Connect.', 'Elevate.'];
    let i = 0;
    setInterval(() => {
      textUpdates.classList.remove("visible");
      setTimeout(() => {
        textUpdates.textContent = phrases[i];
        textUpdates.classList.add("visible");
        i = (i + 1) % phrases.length;
      }, 500);
    }, 3500);
  }

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

  /*** COUNTER ANIMATION ***/
  const statsSection = document.getElementById("statsSection");
  const counters = document.querySelectorAll(".counter");
  let counterAnimated = false;

  if (statsSection && counters.length) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counterAnimated) {
          statsSection.classList.add("visible");
          counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            const suffix = counter.getAttribute("data-suffix") || "";
            let value = 0;
            const step = target / 100;
            const increment = () => {
              value += step;
              if (value < target) {
                counter.textContent = `${Math.ceil(value)}${suffix}`;
                setTimeout(increment, 30);
              } else {
                counter.textContent = `${target}${suffix}`;
              }
            };
            increment();
          });
          counterAnimated = true;
        }
      });
    }, { threshold: 0.5 });
    statObserver.observe(statsSection);
  }

  /*** SERVICES CAROUSEL (infinite scroll) ***/
  const servicesCarousel = document.querySelector('.carousel');
  const servicesInner = document.querySelector('.services-carousel-inner');
  if (servicesCarousel && servicesInner) {
    const clones = Array.from(servicesInner.children).map(child => child.cloneNode(true));
    clones.forEach(clone => servicesInner.appendChild(clone));

    const carouselObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        servicesCarousel.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.5 });

    carouselObserver.observe(servicesCarousel);
  }

  /*** HERO CAROUSEL ***/
  const heroCarousel = document.querySelector(".hero-carousel");
  if (heroCarousel) {
    const inner = heroCarousel.querySelector(".hero-carousel-inner");
    const items = inner?.querySelectorAll(".hero-carousel-item");
    const next = document.getElementById("nav-btn2");
    const prev = document.getElementById("nav-btn1");
    const current = document.getElementById("current-slide");
    const total = document.getElementById("total-slides");

    let index = 0;
    const count = items?.length || 0;
    let interval;

    if (total) total.textContent = String(count).padStart(2, "0");

    const update = () => {
      if (!inner) return;
      inner.style.transform = `translateX(-${index * 100}%)`;
      if (current) current.textContent = String(index + 1).padStart(2, "0");
    };

    const nextSlide = () => { index = (index + 1) % count; update(); };
    const prevSlide = () => { index = (index - 1 + count) % count; update(); };
    const startAuto = () => interval = setInterval(nextSlide, 5000);
    const resetAuto = () => { clearInterval(interval); startAuto(); };

    if (next) next.addEventListener("click", () => { nextSlide(); resetAuto(); });
    if (prev) prev.addEventListener("click", () => { prevSlide(); resetAuto(); });

    update();
    startAuto();
  }

  /*** FAQs (Plus/Minus toggle) ***/
  document.querySelectorAll(".faq-item .faq-question").forEach(question => {
    question.addEventListener("click", () => {
      const parent = question.closest(".faq-item");
      parent.classList.toggle("active");
      const icon = question.querySelector(".icon");
      if (icon) icon.textContent = parent.classList.contains("active") ? "−" : "+";
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
