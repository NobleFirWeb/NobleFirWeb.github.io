/* project.js — Noble Fir Studio Case Study Page
   GSAP intro + hero reveal + desktop drag slider + mobile phone swipe
---------------------------------------------------------------- */

(() => {
    const gsapReady = typeof gsap !== 'undefined';
    const stReady   = typeof ScrollTrigger !== 'undefined';

    if (gsapReady) {
        if (stReady) gsap.registerPlugin(ScrollTrigger);
    }

    /* ══════════════════════════════════════════════
       TITLE — word-stagger on load (matches about/services hero)
    ══════════════════════════════════════════════ */
    if (gsapReady && typeof SplitText !== 'undefined') {
        const title = document.querySelector('.cs-intro__title');
        const desc  = document.querySelector('.cs-intro__desc');

        if (title) {
            document.fonts.ready.then(() => {
                const split = SplitText.create(title, { type: 'words', mask: 'words' });
                gsap.set(split.words, { y: '105%', autoAlpha: 0 });
                gsap.to(split.words, {
                    y: 0, autoAlpha: 1,
                    stagger: 0.08, duration: 0.7, ease: 'power3.out', delay: 0.15
                });
            });
        }

        if (desc) {
            gsap.fromTo(desc,
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.5 }
            );
        }
    } else if (gsapReady) {
        const title = document.querySelector('.cs-intro__title');
        const desc  = document.querySelector('.cs-intro__desc');
        if (title) gsap.fromTo(title, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', delay: 0.15 });
        if (desc)  gsap.fromTo(desc,  { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7,  ease: 'power3.out', delay: 0.5 });
    }

    /* ══════════════════════════════════════════════
       SCROLL-BASED RISE — details headings + mobile heading
    ══════════════════════════════════════════════ */
    if (gsapReady && stReady) {
        // "The Task" — on page load (card is above fold after scroll)
        const taskHed = document.querySelector('.cs-details__block:first-child .cs-details__heading');
        if (taskHed) {
            gsap.fromTo(taskHed,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out',
                  scrollTrigger: { trigger: taskHed, start: 'top 88%', once: true } }
            );
        }

        // "The Solution" — scroll into view
        const solutionHed = document.querySelector('.cs-details__block:nth-child(2) .cs-details__heading');
        if (solutionHed) {
            gsap.fromTo(solutionHed,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out',
                  scrollTrigger: { trigger: solutionHed, start: 'top 88%', once: true } }
            );
        }

        // "Fully Responsive." — scroll into view
        const mobileHed = document.querySelector('.cs-mobile__hed');
        if (mobileHed) {
            if (typeof SplitText !== 'undefined') {
                document.fonts.ready.then(() => {
                    const split = SplitText.create(mobileHed, { type: 'words', mask: 'words' });
                    gsap.set(split.words, { y: '105%', autoAlpha: 0 });
                    ScrollTrigger.create({
                        trigger: mobileHed,
                        start: 'top 85%',
                        once: true,
                        onEnter: () => {
                            gsap.to(split.words, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6, ease: 'power3.out' });
                        }
                    });
                });
            } else {
                gsap.fromTo(mobileHed,
                    { autoAlpha: 0, y: 28 },
                    { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out',
                      scrollTrigger: { trigger: mobileHed, start: 'top 85%', once: true } }
                );
            }
        }
    }

    /* ══════════════════════════════════════════════
       HERO IMAGE WINDOW REVEAL
       The .cs-hero-img is taller than its container (.cs-hero-window).
       It starts pushed UP so only the bottom portion is visible
       (the top is hidden behind the .cs-intro section above).
       As the reveal-wrap scrolls past, GSAP scrubs y back to 0,
       progressively revealing the top of the image — like a window.
    ══════════════════════════════════════════════ */
    if (gsapReady && stReady) {
        const heroImg  = document.querySelector('.cs-hero-img');
        const revealWrap = document.querySelector('.cs-reveal-wrap');

        if (heroImg && revealWrap) {
            // Image is 140% tall; the overflow is 40% of container height.
            // As % of element height: 40 / 140 = ~28.57% — push up by this amount
            // so bottom of image is visible first.
            gsap.fromTo(heroImg,
                { y: '-28.57%' },
                {
                    y: '0%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: revealWrap,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    }
                }
            );
        }
    }

    /* ══════════════════════════════════════════════
       DESKTOP SCREENSHOT SLIDER — snap + prev/next
    ══════════════════════════════════════════════ */
    const slider    = document.getElementById('desktopSlider');
    const deskTrack = document.getElementById('desktopTrack');
    const deskDots  = document.querySelectorAll('.cs-slider-dot');
    const prevBtn   = document.getElementById('deskPrev');
    const nextBtn   = document.getElementById('deskNext');

    if (slider && deskTrack) {
        const slides = deskTrack.querySelectorAll('.cs-slide');
        let deskCurrent = 0;
        let deskStart = 0, deskDragging = false;

        function deskGoTo(idx) {
            deskCurrent = Math.max(0, Math.min(idx, slides.length - 1));
            const slideW = slides[0].offsetWidth + (slider.offsetWidth * 0.025);
            deskTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            deskTrack.style.transform  = `translateX(${-deskCurrent * slideW}px)`;
            deskDots.forEach((d, i) => d.classList.toggle('is-active', i === deskCurrent));
        }

        if (prevBtn) prevBtn.addEventListener('click', () => deskGoTo(deskCurrent - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => deskGoTo(deskCurrent + 1));
        deskDots.forEach(d => d.addEventListener('click', () => deskGoTo(+d.dataset.idx)));

        // Drag to slide
        slider.addEventListener('mousedown', (e) => {
            deskDragging = true;
            deskStart = e.clientX;
            slider.classList.add('is-dragging');
            deskTrack.style.transition = 'none';
        });
        window.addEventListener('mousemove', (e) => {
            if (!deskDragging) return;
            const slideW = slides[0].offsetWidth + (slider.offsetWidth * 0.025);
            const dx = deskStart - e.clientX;
            deskTrack.style.transform = `translateX(${-deskCurrent * slideW - dx}px)`;
        });
        window.addEventListener('mouseup', (e) => {
            if (!deskDragging) return;
            deskDragging = false;
            slider.classList.remove('is-dragging');
            const dx = deskStart - e.clientX;
            deskGoTo(Math.abs(dx) > 60 ? (dx > 0 ? deskCurrent + 1 : deskCurrent - 1) : deskCurrent);
        });

        let deskTouchStart = 0;
        slider.addEventListener('touchstart', (e) => {
            deskTouchStart = e.touches[0].clientX;
            deskTrack.style.transition = 'none';
        }, { passive: true });
        slider.addEventListener('touchmove', (e) => {
            const slideW = slides[0].offsetWidth + (slider.offsetWidth * 0.025);
            const dx = deskTouchStart - e.touches[0].clientX;
            deskTrack.style.transform = `translateX(${-deskCurrent * slideW - dx}px)`;
        }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const dx = deskTouchStart - e.changedTouches[0].clientX;
            deskGoTo(Math.abs(dx) > 40 ? (dx > 0 ? deskCurrent + 1 : deskCurrent - 1) : deskCurrent);
        });
    }

    /* ══════════════════════════════════════════════
       MOBILE PHONE SWIPE
    ══════════════════════════════════════════════ */
    const phoneScreen = document.querySelector('.cs-phone-screen');
    const phoneTrack  = document.getElementById('phoneTrack');
    const dots        = document.querySelectorAll('.cs-phone-dot');

    if (!phoneScreen || !phoneTrack || !dots.length) return;

    const slideCount = phoneTrack.children.length;
    let current = 0;
    let startTX = 0, dragging = false;

    function goTo(idx) {
        current = Math.max(0, Math.min(idx, slideCount - 1));
        phoneTrack.style.transform = `translateX(${-current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => goTo(+dot.dataset.idx));
    });

    // Touch swipe
    phoneScreen.addEventListener('touchstart', (e) => {
        startTX  = e.touches[0].clientX;
        dragging = true;
    }, { passive: true });

    phoneScreen.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const dx  = startTX - e.touches[0].clientX;
        const pct = (dx / phoneScreen.offsetWidth) * 100;
        phoneTrack.style.transition = 'none';
        phoneTrack.style.transform  = `translateX(${-current * 100 - pct}%)`;
    }, { passive: true });

    phoneScreen.addEventListener('touchend', (e) => {
        dragging = false;
        phoneTrack.style.transition = '';
        const dx = startTX - e.changedTouches[0].clientX;
        goTo(Math.abs(dx) > 40 ? (dx > 0 ? current + 1 : current - 1) : current);
    });

    // Mouse drag (desktop preview / testing)
    phoneScreen.addEventListener('mousedown', (e) => {
        dragging = true;
        startTX  = e.clientX;
        phoneScreen.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx  = startTX - e.clientX;
        const pct = (dx / phoneScreen.offsetWidth) * 100;
        phoneTrack.style.transition = 'none';
        phoneTrack.style.transform  = `translateX(${-current * 100 - pct}%)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        dragging = false;
        phoneScreen.classList.remove('is-dragging');
        phoneTrack.style.transition = '';
        const dx = startTX - e.clientX;
        goTo(Math.abs(dx) > 40 ? (dx > 0 ? current + 1 : current - 1) : current);
    });

})();
