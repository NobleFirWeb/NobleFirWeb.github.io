// Loading Screen Animation
document.addEventListener('DOMContentLoaded', function() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 33.33; // Approximate 3 steps to 100%
    document.getElementById('progressBar').style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      const loadingScreen = document.getElementById('loadingScreen');
      loadingScreen.style.transform = 'translateY(100%)';
      setTimeout(() => {
        loadingScreen.remove();
        animateHeroContent();
      }, 500); // Let the slide finish
    }
  }, 750); // 3 seconds total

  // Trigger rise animation for hero h1 and h2 after loading screen
  function animateHeroContent() {
    const heroH1 = document.querySelector('.hero-content h1[data-rise="true"]');
    const heroH2 = document.querySelector('.hero-content h2[data-rise="true"]');
    if (heroH1) heroH1.classList.add('visible');
    if (heroH2) heroH2.classList.add('visible');
  }
});


//Hero-Carousel Functionality
// Hero Carousel Initialization
document.addEventListener("DOMContentLoaded", function () {
  const heroCarousel = document.querySelector(".hero-carousel");
  const herocarouselInner = heroCarousel.querySelector(".hero-carousel-inner");
  const heroSlides = herocarouselInner.querySelectorAll(".hero-carousel-item");

  const prevSlideBtn = document.getElementById("nav-btn1");
  const nextSlideBtn = document.getElementById("nav-btn2");
  const currentSlideText = document.getElementById("current-slide");
  const totalSlidesText = document.getElementById("total-slides");

  let currentIndex = 0;
  const totalSlides = heroSlides.length;
  let slideInterval;

  // Set total slide count dynamically
  totalSlidesText.textContent = String(totalSlides).padStart(2, "0");

  function updateCarousel() {
    const offset = -currentIndex * 100;
    herocarouselInner.style.transform = `translateX(${offset}%)`;
    currentSlideText.textContent = String(currentIndex + 1).padStart(2, "0");
  }

  function goToNextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }

  function goToPreviousSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  function startAutoSlide() {
    slideInterval = setInterval(goToNextSlide, 5000);
  }

  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  nextSlideBtn.addEventListener("click", () => {
    goToNextSlide();
    resetAutoSlide();
  });

  prevSlideBtn.addEventListener("click", () => {
    goToPreviousSlide();
    resetAutoSlide();
  });

  // Start on page load
  updateCarousel();
  startAutoSlide();
});






// Smooth scrolling for navbar links
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.menu-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});


// Rise Animations
document.addEventListener('DOMContentLoaded', () => {
  const elementsToAnimate = document.querySelectorAll('[data-rise="true"]');

  const options = {
    threshold: 0.5,
  };

  const riseObserver = new IntersectionObserver((entries, riseObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        riseObserver.unobserve(entry.target);
      }
    });
  }, options);

  elementsToAnimate.forEach(element => {
    // Skip hero-content h1 and h2 since they animate manually
    if (
      element.matches('.hero-content h1') ||
      element.matches('.hero-content h2')
    ) return;
    riseObserver.observe(element);
  });

  setTimeout(() => {
    elementsToAnimate.forEach(element => {
      if (isInViewport(element)) {
        element.classList.add('visible');
      }
    });
  }, 4500);

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }
});



// Mobile Navigation Menu
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const openIcon = document.getElementById('openIcon');
const closeIcon = document.getElementById('closeIcon');
const menuLinks = document.querySelectorAll('.menu-links a'); // Get all anchor tags inside the menu-links class

menuToggle.addEventListener('click', function() {
  if (mobileMenu.style.right === '0px') {
    mobileMenu.style.right = '-100%';
    openIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  } else {
    mobileMenu.style.right = '0px';
    openIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  }
});


// Mobile Menu - Services Dropdown functionality
document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    this.parentElement.classList.toggle('open');
  });
});



// Add event listeners to close the menu when any link is clicked
menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-toggle')) {
      e.preventDefault();
      return;
    }
    mobileMenu.style.right = '-100%';
    openIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  });
});





// FAQ functionality 
document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            item.classList.toggle("active");

            // Change plus to minus and vice versa
            const icon = question.querySelector(".icon");
            icon.textContent = item.classList.contains("active") ? "−" : "+";
        });
    });
});



// ServicesInfinite Carousel
const carousel = document.querySelector('.carousel');
const carouselInner = document.querySelector('.services-carousel-inner');
const carouselItems = Array.from(carouselInner.children);

// Clone the carousel items to create an infinite loop effect
carouselItems.forEach(item => {
    const clone = item.cloneNode(true);
    carouselInner.appendChild(clone);
});

// Intersection Observer to start/stop the carousel
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            carousel.style.animationPlayState = 'running';
        } else {
            carousel.style.animationPlayState = 'paused';
        }
    });
}, { threshold: 0.5 });

observer.observe(carousel);






// Hero text dynamic updates
document.addEventListener('DOMContentLoaded', function() {
  const titles = ['Succeed.', 
                  'Thrive.', 
                  'Innovate.', 
                  'Grow.',
                  'Transform.',
                  'Excel.',
                  'Connect.',
                  'Elevate.',
              ];
  let currentTitleIndex = 0;
  const titleElement = document.querySelector('.text-updates');

  // Function to update title
  function updateTitle() {
    // Fade out the title
    titleElement.classList.remove('visible');

    // Wait for the fade out animation, then change the text and fade in
    setTimeout(() => {
      titleElement.textContent = titles[currentTitleIndex];
      titleElement.classList.add('visible');

      // Update the index for the next title
      currentTitleIndex = (currentTitleIndex + 1) % titles.length;
    }, 3500); // This should match the CSS transition time
  }

  // Initial call to set the first title
  updateTitle();

  // Set an interval to update the title every 2.5 seconds
  setInterval(updateTitle, 3500);
});


// Sticky Nav becomes sticky at About Section
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");
  const aboutSection = document.getElementById("about");

  function handleScroll() {
      const aboutPosition = aboutSection.getBoundingClientRect().top;

      if (aboutPosition <= 0) {
          navbar.classList.add("sticky");
      } else {
          navbar.classList.remove("sticky");
      }
  }

  window.addEventListener("scroll", handleScroll);
});


// Reviews Carousel
(() => {
  const carousel = document.querySelector('sl-carousel.aspect-ratio');
  const aspectRatio = document.querySelector('sl-select[name="aspect"]');

  aspectRatio.addEventListener('sl-change', () => {
    carousel.style.setProperty('--aspect-ratio', aspectRatio.value);
  });
})();

//FAQs Close all other details when one is in view
const container = document.querySelector('.details-group-example');

// Close all other details when one is shown
container.addEventListener('sl-show', event => {
  if (event.target.localName === 'sl-details') {
    [...container.querySelectorAll('sl-details')].map(details => (details.open = event.target === details));
  }
});


// Stat Counter Animation
document.addEventListener("DOMContentLoaded", () => {
  const statsSection = document.getElementById("statsSection");
  const counters = document.querySelectorAll(".counter");
  let hasAnimated = false;

  const animateCounters = () => {
      counters.forEach(counter => {
          const updateCounter = () => {
              const target = +counter.getAttribute("data-target");
              const suffix = counter.getAttribute("data-suffix") || "";
              const count = +counter.innerText.replace(/\D/g, "");
              const increment = target / 100;
              if (count < target) {
                  counter.innerText = Math.ceil(count + increment) + suffix;
                  setTimeout(updateCounter, 30);
              } else {
                  counter.innerText = target + suffix;
              }
          };
          updateCounter();
      });
  };

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
              statsSection.classList.add("visible");
              animateCounters();
              hasAnimated = true;
          }
      });
  }, { threshold: 0.5 });

  observer.observe(statsSection);
});