// site-scripts.js | Shared JavaScript for index.html and about.html



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
    threshold: 0.2 // trigger when 20% visible
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



// Web-Dev Shoelace UI tab group - Responsive
const tabGroup = document.getElementById('projects-nav');

function updateTabPlacement() {
  if (window.innerWidth <= 1024) {
    tabGroup.setAttribute('placement', 'top'); // Mobile/tablet
  } else {
    tabGroup.setAttribute('placement', 'start'); // Desktop
  }
}

window.addEventListener('resize', updateTabPlacement);
window.addEventListener('DOMContentLoaded', updateTabPlacement);



