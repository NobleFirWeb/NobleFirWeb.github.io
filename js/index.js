// site-scripts.js | Shared JavaScript for index.html and about.html

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

  // Lock scroll + hide page while loading
  document.body.classList.add("nf-loading");

  // Wait for the loader image so the first frame isn't a blank flash
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

  // 1) Hallway still frame for 1s
  tl.to({}, { duration: 1.0 });

  // Start walkdown + counter together (SYNCED)
  tl.addLabel("walk", ">");

  // 2) Walk down hallway: zoom to scale 7 over 3s
  tl.to(
    img,
    {
      duration: 3.0,
      z: 500,
      scale: 10,
      ease: "power4.in"
    },
    "walk"
  );

  // 2b) Counter: 0 -> 100 over the walk + fade-to-black time
  // Counter hits 100% exactly when the screen finishes turning black.
  if (percentEl) {
    tl.to(
      prog,
      {
        duration: 3.35, // 3.0s zoom + 0.35s fade-to-black
        v: 100,
        ease: "none",
        onUpdate: () => {
          percentEl.textContent = String(Math.round(prog.v));
        },
        onComplete: () => {
          percentEl.textContent = "100";
        }
      },
      "walk"
    );
  }

  // 3) Fade image out to reveal pure black (starts right after zoom ends)
  tl.to(
    img,
    {
      duration: .5,
      autoAlpha: 0,
      filter: "blur(0px)",
      ease: "power2.out"
    },
    "walk+=3.0"
  );

  // 4) Hold on black for 1s (counter stays visible at 100)
  tl.to({}, { duration: 1.0 });

  // 5) As index renders: fade out the counter, fade loader away, fade page in
  if (counterEl) {
    tl.to(counterEl, { duration: 0.5, autoAlpha: 0, ease: "power2.out" }, ">");
  }

  tl.to(loader, { duration: 0.35, autoAlpha: 0 }, "<");
  tl.to(page, { duration: 1.25, autoAlpha: 1, ease: "power2.out" }, "<+0.1");


  // Cleanup
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
        // If image fails, don't trap the user on black forever
        loader.style.display = "none";
        gsap.set(page, { autoAlpha: 1 });
        document.body.classList.remove("nf-loading");
      },
      { once: true }
    );
  }
})();

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







