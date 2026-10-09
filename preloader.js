// (2026-07-13) Dramatic GSAP intro animation logic; was immediate app render
(function () {
    const OVERLAY_ID = 'securo-preloader-overlay';

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

    function runAnimation() {
        const overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;

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
            }
        });

        // 1. Initial State
        gsap.set(logo, { opacity: 0, scale: 0.72, y: 35 });
        // (2026-07-13) Set initial y offset for bottom indicator; was -10
        gsap.set(indicator, { opacity: 0, y: 10 });
        gsap.set(progressBar, { width: '0%' });

        // (2026-07-13) Clean logo entrance without drop-shadow; was purple filter
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureGSAP(runAnimation);
        });
    } else {
        ensureGSAP(runAnimation);
    }
})();
