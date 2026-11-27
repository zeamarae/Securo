// (2026-07-13) Dramatic GSAP intro animation logic; was immediate app render
(function () {
    const OVERLAY_ID = 'securo-preloader-overlay';

    function ensureOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay && document.body) {
            // (2026-07-13) Resolve preloader logo for all clean subroutes; was 5 dirs only
            const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
            const isRoot = cleanPath === '/' || cleanPath === '/index.html';
            const logoSrc = (isRoot ? '' : '../') + 'assets/images/logo with text.png';
            overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.innerHTML = `
                <div class="securo-preloader-bg"></div>
                <div class="securo-preloader-content">
                    <div class="securo-preloader-logo-wrap">
                        <img src="${logoSrc}" alt="Securo" class="securo-preloader-logo">
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

    // (2026-07-13) Guard late GSAP re-show & skip CDN wait in APK; was sticking
    let hasDismissed = false;
    function ensureGSAP(callback) {
        if (hasDismissed) return;
        if (window.gsap) {
            callback();
            return;
        }
        const isNative = Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
            window.location.protocol.startsWith('capacitor:') ||
            !!window.cordova;
        if (isNative) {
            setTimeout(dismissFallback, 320);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = () => { if (!hasDismissed) callback(); };
        script.onerror = () => dismissFallback();
        document.head.appendChild(script);
        // (2026-07-13) GSAP load timeout fallback; was hanging on offline/blocked CDN
        setTimeout(dismissFallback, 1200);
    }

    // (2026-07-13) Kill GSAP tweens & force-hide all overlays; was leaving stuck
    function dismissFallback() {
        hasDismissed = true;
        const overlays = document.querySelectorAll('#' + OVERLAY_ID);
        overlays.forEach((overlay) => {
            if (window.gsap) {
                try { gsap.killTweensOf(overlay); } catch (_) { }
            }
            overlay.classList.add('hidden');
            overlay.style.setProperty('display', 'none', 'important');
            overlay.style.setProperty('visibility', 'hidden', 'important');
            overlay.style.setProperty('pointer-events', 'none', 'important');
            overlay.style.setProperty('opacity', '0', 'important');
            setTimeout(() => {
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 250);
        });
        document.body?.removeAttribute('data-preloader-active');
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
                    overlay.classList.add('hidden');
                    overlay.style.setProperty('display', 'none', 'important');
                    overlay.style.setProperty('visibility', 'hidden', 'important');
                    overlay.style.setProperty('pointer-events', 'none', 'important');
                    overlay.style.setProperty('z-index', '-99999', 'important');
                    setTimeout(() => {
                        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    }, 250);
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
                    overlay.classList.add('hidden');
                    overlay.style.setProperty('display', 'none', 'important');
                    overlay.style.setProperty('visibility', 'hidden', 'important');
                    overlay.style.setProperty('pointer-events', 'none', 'important');
                    overlay.style.setProperty('z-index', '-99999', 'important');
                    setTimeout(() => {
                        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    }, 250);
                }
            });
        } else {
            dismissFallback();
        }
    }

    // (2026-07-13) Resolve relative portal URLs to clean root paths; was stacking
    // (2026-07-13) Keep absolute .html targets in Capacitor APK; was extensionless
    const IS_NATIVE_APK = Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
        window.location.protocol.startsWith('capacitor:') ||
        !!window.cordova;

    const PRELOADER_APK_ROUTES = {
        'index.html': '/public/role-selection.html',
        'index': '/public/role-selection.html',
        'admin/admin.html': '/admin/admin.html',
        'admin': '/admin/admin.html',
        'student/student.html': '/student/student.html',
        'student': '/student/student.html',
        'staff/staff.html': '/staff/staff.html',
        'staff': '/staff/staff.html',
        'parent/parent.html': '/parent/parent.html',
        'parent': '/parent/parent.html',
        'public/login.html': '/public/login.html',
        'login.html': '/public/login.html',
        'login': '/public/login.html',
        'public/role-selection.html': '/public/role-selection.html',
        'role-selection.html': '/public/role-selection.html',
        'role-selection': '/public/role-selection.html',
        'public/profile.html': '/public/profile.html',
        'profile.html': '/public/profile.html',
        'profile': '/public/profile.html',
        'public/settings.html': '/public/settings.html',
        'settings.html': '/public/settings.html',
        'settings': '/public/settings.html',
        'public/about.html': '/public/about.html',
        'about.html': '/public/about.html',
        'about': '/public/about.html',
        'public/hotlines.html': '/public/hotlines.html',
        'hotlines.html': '/public/hotlines.html',
        'hotlines': '/public/hotlines.html',
        'public/incident-report.html': '/public/incident-report.html',
        'incident-report.html': '/public/incident-report.html',
        'incident-report': '/public/incident-report.html',
        'public/permissions-onboarding.html': '/public/permissions-onboarding.html',
        'permissions-onboarding.html': '/public/permissions-onboarding.html',
        'permissions-onboarding': '/public/permissions-onboarding.html',
        'public/terms.html': '/public/terms.html',
        'terms.html': '/public/terms.html',
        'terms': '/public/terms.html'
    };

    const PRELOADER_CLEAN_ROUTES = {
        'index.html': '/',
        'admin/admin.html': '/admin/',
        'student/student.html': '/student/',
        'staff/staff.html': '/staff/',
        'parent/parent.html': '/parent/',
        'public/login.html': '/login/',
        'login.html': '/login/',
        'public/role-selection.html': '/role-selection/',
        'role-selection.html': '/role-selection/',
        'public/profile.html': '/profile/',
        'profile.html': '/profile/',
        'public/settings.html': '/settings/',
        'settings.html': '/settings/',
        'public/about.html': '/about/',
        'about.html': '/about/',
        'public/hotlines.html': '/hotlines/',
        'hotlines.html': '/hotlines/',
        'public/incident-report.html': '/incident-report/',
        'incident-report.html': '/incident-report/',
        'public/permissions-onboarding.html': '/permissions-onboarding/',
        'permissions-onboarding.html': '/permissions-onboarding/',
        'public/terms.html': '/terms/',
        'terms.html': '/terms/'
    };
    function normalizePreloaderTarget(url) {
        if (!url || (window.location.protocol !== 'http:' && window.location.protocol !== 'https:')) return url;
        if (/^https?:\/\//i.test(url)) return url;
        const [pathPart, rest] = url.split(/(?=[?#])/);
        if (IS_NATIVE_APK) {
            const cleaned = pathPart.replace(/^(?:\.\.\/|\.\/|\/)+/, '').replace(/\/+$/, '');
            const mappedApk = PRELOADER_APK_ROUTES[cleaned] || PRELOADER_APK_ROUTES[cleaned.split('/').pop()];
            return mappedApk ? (mappedApk + (rest || '')) : url;
        }
        if (url.startsWith('/')) return url;
        const stripped = pathPart.replace(/^(?:\.\.\/|\.\/)+/, '');
        const mapped = PRELOADER_CLEAN_ROUTES[stripped];
        return mapped ? (mapped + (rest || '')) : url;
    }

    let isTransitioning = false;
    window.showSecuroPreloader = function (targetUrl) {
        if (isTransitioning) return;
        isTransitioning = true;
        targetUrl = normalizePreloaderTarget(targetUrl);
        sessionStorage.setItem('securo_transition_active', '1');
        const overlay = ensureOverlay();
        if (overlay) {
            overlay.classList.remove('hidden');
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
        // (2026-07-13) Auto-dismiss transition overlay if page stays; was stuck forever
        setTimeout(() => {
            if (isTransitioning) {
                isTransitioning = false;
                sessionStorage.removeItem('securo_transition_active');
                dismissFallback();
            }
        }, 2500);
    };

    // (2026-07-13) Intercept page link clicks to apply loading animation; was default jump
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || link.hasAttribute('download')) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:') || link.target === '_blank') {
            return;
        }
        if (href.endsWith('.html') || (!href.includes('://') && !href.startsWith('//'))) {
            const normalized = normalizePreloaderTarget(href);
            if (normalized === window.location.pathname || normalized === window.location.pathname + window.location.search) {
                return;
            }
            e.preventDefault();
            window.showSecuroPreloader(normalized);
        }
    }, true);

    let hasInitialized = false;
    function initPreloader() {
        if (hasInitialized) return;
        hasInitialized = true;
        ensureOverlay();
        // (2026-07-13) Safety max timeout to avoid white screen freeze; was infinite wait
        setTimeout(dismissFallback, 1500);
        if (sessionStorage.getItem('securo_transition_active') === '1') {
            sessionStorage.removeItem('securo_transition_active');
            ensureGSAP(runTransitionDismiss);
        } else {
            ensureGSAP(runAnimation);
        }
    }

    // (2026-07-13) Clear stuck preloader on BFCache back/forward; was frozen on back
    window.addEventListener('pageshow', (e) => {
        if (e.persisted || isTransitioning) {
            isTransitioning = false;
            sessionStorage.removeItem('securo_transition_active');
            dismissFallback();
        }
    });

    window.addEventListener('pagehide', () => {
        isTransitioning = false;
        dismissFallback();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreloader);
    } else {
        initPreloader();
    }
})();
