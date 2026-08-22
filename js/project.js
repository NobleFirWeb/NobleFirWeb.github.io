/* project.js — Noble Fir Studio Case Study Page
   Desktop drag slider + mobile phone swipe
---------------------------------------------------------------- */

(() => {
    /* ── Desktop screenshot drag slider ── */
    const slider = document.getElementById('desktopSlider');
    const track  = document.getElementById('desktopTrack');

    if (slider && track) {
        let startX = 0, scrollLeft = 0, isDragging = false;

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            slider.classList.add('is-dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x    = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.4;
            slider.scrollLeft = scrollLeft - walk;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            slider.classList.remove('is-dragging');
        });

        // Touch support
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            scrollLeft  = slider.scrollLeft;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            const dx = touchStartX - e.touches[0].clientX;
            slider.scrollLeft = scrollLeft + dx;
        }, { passive: true });

        // Enable native scroll on the track container
        slider.style.overflowX = 'auto';
        slider.style.scrollbarWidth = 'none';
        slider.style.msOverflowStyle = 'none';
    }

    /* ── Mobile phone swipe ── */
    const phoneScreen = document.querySelector('.cs-phone-screen');
    const phoneTrack  = document.getElementById('phoneTrack');
    const dots        = document.querySelectorAll('.cs-phone-dot');

    if (!phoneScreen || !phoneTrack || !dots.length) return;

    const slideCount = phoneTrack.children.length;
    let current = 0;
    let startTX = 0, startSL = 0, dragging = false;

    function goTo(idx) {
        current = Math.max(0, Math.min(idx, slideCount - 1));
        phoneTrack.style.transform = `translateX(${-current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    // Dot clicks
    dots.forEach(dot => {
        dot.addEventListener('click', () => goTo(+dot.dataset.idx));
    });

    // Touch swipe
    phoneScreen.addEventListener('touchstart', (e) => {
        startTX = e.touches[0].clientX;
        dragging = true;
    }, { passive: true });

    phoneScreen.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const dx = startTX - e.touches[0].clientX;
        const pct = (dx / phoneScreen.offsetWidth) * 100;
        phoneTrack.style.transition = 'none';
        phoneTrack.style.transform = `translateX(${-current * 100 - pct}%)`;
    }, { passive: true });

    phoneScreen.addEventListener('touchend', (e) => {
        dragging = false;
        phoneTrack.style.transition = '';
        const dx = startTX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) {
            goTo(dx > 0 ? current + 1 : current - 1);
        } else {
            goTo(current);
        }
    });

    // Mouse drag for desktop testing
    phoneScreen.addEventListener('mousedown', (e) => {
        dragging = true;
        startTX = e.clientX;
        phoneScreen.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging || !phoneScreen.contains(e.target) && !dragging) return;
        if (!dragging) return;
        const dx = startTX - e.clientX;
        const pct = (dx / phoneScreen.offsetWidth) * 100;
        phoneTrack.style.transition = 'none';
        phoneTrack.style.transform = `translateX(${-current * 100 - pct}%)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        dragging = false;
        phoneScreen.classList.remove('is-dragging');
        phoneTrack.style.transition = '';
        const dx = startTX - e.clientX;
        if (Math.abs(dx) > 40) {
            goTo(dx > 0 ? current + 1 : current - 1);
        } else {
            goTo(current);
        }
    });

})();
