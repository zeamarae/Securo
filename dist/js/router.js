/**
 * Securo Unified Router v2.0
 * Works on: local dev, GitHub Pages, any static hosting
 * Strategy: Hash-based routing with clean URLs and proper navigation
 * Date: 2026-10-06
 */

(function () {
    'use strict';

    // (2026-07-13) Apply role-staff class early in head for blue theme; was delayed
    try {
        const urlRole = new URLSearchParams(window.location.search).get('role');
        const activeRole = String(urlRole || localStorage.getItem('securo_preferred_role') || localStorage.getItem('securo_user_role') || '').toLowerCase();
        document.documentElement.classList.toggle('role-staff', activeRole === 'staff');
    } catch (_) { }

    // Detect GitHub Pages base path (e.g. /Securo/) vs root (/)
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages
        ? '/' + window.location.pathname.split('/')[1] + '/'  // e.g. /Securo/
        : '/';

    // (2026-07-13) Short extensionless route map; was long hash #/.. paths
    const SHORT_ROUTES = {
        'index': '/',
        'landing': '/',
        'admin': '/admin/',
        'student': '/student/',
        'staff': '/staff/',
        'parent': '/parent/',
        'login': '/login/',
        'role-selection': '/role-selection/',
        'profile': '/profile/',
        'settings': '/settings/',
        'about': '/about/',
        'hotlines': '/hotlines/',
        'incident-report': '/incident-report/',
        'permissions-onboarding': '/permissions-onboarding/',
        'terms': '/terms/'
    };

    function resolveShortRoute(rawTarget) {
        const str = String(rawTarget || '').trim();
        const [pathOnly, queryPart] = str.split('?');
        const cleanFile = pathOnly.split('#')[0].replace(/\/$/, '').split('/').pop().replace(/\.html$/i, '').toLowerCase();
        const route = SHORT_ROUTES[cleanFile];
        if (!route) return null;
        const prefix = isGitHubPages ? basePath.replace(/\/$/, '') : '';
        return prefix + route + (queryPart ? `?${queryPart}` : '');
    }

    function getCurrentRoute() {
        const clean = window.location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/i, '');
        return clean || 'landing';
    }

    function cleanURL() {
        if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
        const target = resolveShortRoute(window.location.pathname + window.location.search);
        const keepHash = window.location.hash && !window.location.hash.startsWith('#/') ? window.location.hash : '';
        if (target && (window.location.pathname + window.location.search + window.location.hash) !== (target + keepHash)) {
            window.history.replaceState(null, '', target + keepHash);
        }
    }

    function navigate(page) {
        const shortUrl = resolveShortRoute(page);
        if (shortUrl && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
            window.location.href = shortUrl;
            return;
        }
        window.location.href = page;
    }

    function goBack(fallback = 'login') {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate(fallback);
        }
    }

    function interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href ||
                href.startsWith('http') ||
                href.startsWith('//') ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                return;
            }
            if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
            const shortUrl = resolveShortRoute(href);
            if (shortUrl) {
                e.preventDefault();
                window.location.href = shortUrl;
            }
        }, false);
    }

    /**
     * Show a toast notification
     */
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `securo-toast securo-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            background: ${type === 'error' ? '#d11f34' : type === 'success' ? '#0f9b67' : '#5a1fe0'};
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Expose globally
    window.SecuroRouter = { 
        navigate, 
        goBack, 
        getCurrentRoute, 
        cleanURL, 
        basePath, 
        isGitHubPages,
        showToast
    };

    // Legacy support
    window.navigateTo = navigate;
    window.goBack = goBack;

    // Auto clean URL on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cleanURL();
            interceptLinks();
        });
    } else {
        cleanURL();
        interceptLinks();
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();
