document.addEventListener("DOMContentLoaded", function () {
    // Example: Smooth scrolling for navbar links
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
  
    // Observer options
    const options = {
      threshold: 0.5, // Trigger when 75% of the element is in the viewport
    };
  
    // Create an Intersection Observer
    const riseObserver = new IntersectionObserver((entries, riseObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // Add the 'visible' class
          riseObserver.unobserve(entry.target); // Stop observing the element after it has animated
        }
      });
    }, options);
  
    // Observe each element with the 'data-rise' attribute
    elementsToAnimate.forEach(element => {
      riseObserver.observe(element);
    });
  
    // Initial animation for elements that are already in the viewport
    setTimeout(() => {
      elementsToAnimate.forEach(element => {
        if (isInViewport(element)) {
          element.classList.add('visible');
        }
      });
    }, 4500); // Initial animation trigger after 4.5 seconds
  
    // Helper function to check if an element is in the viewport
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

// Add event listeners to close the menu when any link is clicked
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.style.right = '-100%'; // Close the menu
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
const carouselInner = document.querySelector('.carousel-inner');
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


// Loading Screen Animation
document.addEventListener('DOMContentLoaded', function() {
  let progress = 0;
  const interval = setInterval(() => {
      progress += 33.33; // Adjust the increment so it completes in about 3 seconds
      document.getElementById('progressBar').style.width = `${progress}%`;
      if (progress >= 100) {
          clearInterval(interval); // Stop the interval once progress is (nearly) 100%
          // Adjust timing to immediately start the slide down of the loading screen
          const loadingScreen = document.getElementById('loadingScreen');
          loadingScreen.style.transform = 'translateY(100%)'; // Slide down the loading screen
          setTimeout(() => loadingScreen.remove(), 500); // Remove the loading screen from DOM after it slides out
      }
  }, 750); // Adjust the interval to 750ms to match the 3-second total duration
});

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