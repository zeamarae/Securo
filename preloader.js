// (2026-07-13) Dramatic GSAP intro animation logic; was immediate app render
(function () {
    const OVERLAY_ID = 'securo-preloader-overlay';

    function ensureOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay && document.body) {
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.innerHTML = `
                <div class="securo-preloader-bg"></div>
                <div class="securo-preloader-content">
                    <div class="securo-preloader-logo-wrap">
                        <img src="logo with text.png" alt="Securo" class="securo-preloader-logo">
                        <div class="securo-preloader-shimmer"></div>
                    </div>
                    <div class="securo-preloader-indicator">
                        <span class="securo-preloader-status-text">INITIALIZING SECURE SYSTEMS</span>
                        <div class="securo-preloader-progress-track">
                            <div class="securo-preloader-progress-bar"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.prepend(overlay);
        }
        return overlay;
    }

    function ensureGSAP(callback) {
        if (window.gsap) {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = () => callback();
        script.onerror = () => dismissFallback();
        document.head.appendChild(script);
    }

    function dismissFallback() {
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) {
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.removeAttribute('data-preloader-active');
            }, 400);
        }
    }

    function runAnimation(onCompleteCallback) {
        const overlay = ensureOverlay();
        if (!overlay) return;

        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '999999';

        document.body.setAttribute('data-preloader-active', 'true');

        const logo = overlay.querySelector('.securo-preloader-logo');
        const shimmer = overlay.querySelector('.securo-preloader-shimmer');
        const indicator = overlay.querySelector('.securo-preloader-indicator');
        const progressBar = overlay.querySelector('.securo-preloader-progress-bar');
        const bg = overlay.querySelector('.securo-preloader-bg');

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.removeAttribute('data-preloader-active');
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.style.visibility = 'hidden';
                    overlay.style.pointerEvents = 'none';
                    overlay.style.zIndex = '-99999';
                }
                if (typeof onCompleteCallback === 'function') {
                    onCompleteCallback();
                }
            }
        });

        // 1. Initial State
        gsap.set(logo, { opacity: 0, scale: 0.72, y: 35 });
        gsap.set(indicator, { opacity: 0, y: 10 });
        gsap.set(progressBar, { width: '0%' });

        // 2. Clean logo entrance
        tl.to(logo, {
            duration: 0.8,
            opacity: 1,
            scale: 1.04,
            y: 0,
            ease: 'power4.out',
            delay: 0.1
        });

        // 3. Shimmer sweep across the 3D embossed logo
        if (shimmer) {
            tl.to(shimmer, {
                duration: 0.85,
                left: '180%',
                ease: 'power2.inOut'
            }, '-=0.5');
        }

        // 4. Reveal status text & fill progress track
        if (indicator) {
            tl.to(indicator, {
                duration: 0.4,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            }, '-=0.5');
        }

        if (progressBar) {
            tl.to(progressBar, {
                duration: 0.85,
                width: '100%',
                ease: 'power1.inOut'
            }, '-=0.4');
        }

        // 5. Logo subtle settle
        tl.to(logo, {
            duration: 0.45,
            scale: 1,
            ease: 'power2.out'
        }, '-=0.4');

        // 6. Dramatic Exit: Logo scale & rise, background fade
        tl.to(logo, {
            duration: 0.55,
            opacity: 0,
            scale: 1.08,
            y: -15,
            ease: 'power3.in'
        }, '+=0.25');

        if (indicator) {
            tl.to(indicator, {
                duration: 0.35,
                opacity: 0,
                ease: 'power2.in'
            }, '<');
        }

        if (bg) {
            tl.to(bg, {
                duration: 0.55,
                opacity: 0,
                ease: 'power2.inOut'
            }, '-=0.35');
        }

        tl.to(overlay, {
            duration: 0.45,
            opacity: 0,
            ease: 'power2.inOut'
        }, '-=0.3');
    }

    // (2026-07-13) Prevent duplicate preloader on page transitions; was replay all
    function runTransitionDismiss() {
        const overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        document.body.removeAttribute('data-preloader-active');
        if (window.gsap) {
            const progressBar = overlay.querySelector('.securo-preloader-progress-bar');
            if (progressBar) gsap.to(progressBar, { width: '100%', duration: 0.2, ease: 'power1.out' });
            gsap.to(overlay, {
                duration: 0.3,
                opacity: 0,
                delay: 0.1,
                ease: 'power2.inOut',
                onComplete: () => {
                    overlay.style.display = 'none';
                    overlay.style.visibility = 'hidden';
                    overlay.style.pointerEvents = 'none';
                    overlay.style.zIndex = '-99999';
                }
            });
        } else {
            dismissFallback();
        }
    }

    let isTransitioning = false;
    window.showSecuroPreloader = function (targetUrl) {
        if (isTransitioning) return;
        isTransitioning = true;
        sessionStorage.setItem('securo_transition_active', '1');
        const overlay = ensureOverlay();
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.visibility = 'visible';
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'all';
            overlay.style.zIndex = '999999';

            const logo = overlay.querySelector('.securo-preloader-logo');
            const bg = overlay.querySelector('.securo-preloader-bg');
            const indicator = overlay.querySelector('.securo-preloader-indicator');
            const progressBar = overlay.querySelector('.securo-preloader-progress-bar');

            if (window.gsap) {
                if (bg) gsap.set(bg, { opacity: 1 });
                if (logo) gsap.fromTo(logo, { opacity: 0, scale: 0.85, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' });
                if (indicator) gsap.set(indicator, { opacity: 1, y: 0 });
                if (progressBar) gsap.fromTo(progressBar, { width: '0%' }, { width: '85%', duration: 0.4, ease: 'power1.inOut' });
            } else {
                if (bg) bg.style.opacity = '1';
                if (logo) { logo.style.opacity = '1'; logo.style.transform = 'none'; }
                if (indicator) indicator.style.opacity = '1';
                if (progressBar) progressBar.style.width = '75%';
            }
        }
        if (targetUrl) {
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 360);
        }
    };

    // (2026-07-13) Intercept page link clicks to apply loading animation; was default jump
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:') || link.target === '_blank') {
            return;
        }
        if (href.endsWith('.html') || (!href.includes('://') && !href.startsWith('//'))) {
            e.preventDefault();
            window.showSecuroPreloader(href);
        }
    }, true);

    let hasInitialized = false;
    function initPreloader() {
        if (hasInitialized) return;
        hasInitialized = true;
        ensureOverlay();
        if (sessionStorage.getItem('securo_transition_active') === '1') {
            sessionStorage.removeItem('securo_transition_active');
            ensureGSAP(runTransitionDismiss);
        } else {
            ensureGSAP(runAnimation);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreloader);
    } else {
        initPreloader();
    }
})();
