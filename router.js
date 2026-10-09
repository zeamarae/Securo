/**
 * Securo Unified Router v2.0
 * Works on: local dev, GitHub Pages, any static hosting
 * Strategy: Hash-based routing with clean URLs and proper navigation
 * Date: 2026-10-06
 */

(function () {
    'use strict';

    // Detect GitHub Pages base path (e.g. /Securo/) vs root (/)
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages
        ? '/' + window.location.pathname.split('/')[1] + '/'  // e.g. /Securo/
        : '/';

    /**
     * Get the clean route name from current URL
     * e.g. /role-selection.html  →  role-selection
     *      /Securo/login.html    →  login
     *      /#/login              →  login
     */
    function getCurrentRoute() {
        // Check hash first
        if (window.location.hash && window.location.hash.startsWith('#/')) {
            return window.location.hash.slice(2);
        }
        // (2026-07-13) Default route to landing; was role-selection
        return file || 'landing';
    }

    /**
     * Rewrite the browser URL to a clean hash route without reloading
     * e.g. /role-selection.html  →  /role-selection.html#/role-selection  (local)
     *      /Securo/login.html    →  /Securo/#/login  (GitHub Pages)
     */
    function cleanURL() {
        const path = window.location.pathname;
        const file = path.split('/').pop();

        if (!file.endsWith('.html')) return; // already clean or not an html page
        if (window.location.hash.startsWith('#/')) return; // already has clean hash

        const route = file.replace('.html', '');

        if (isGitHubPages) {
            // On GitHub Pages: /Securo/login.html → /Securo/#/login
            const cleanPath = basePath + '#/' + route;
            window.history.replaceState(null, '', cleanPath);
        } else {
            // On local dev: /login.html → /login.html#/login  (hides .html visually in address bar after #)
            window.history.replaceState(null, '', path + '#/' + route);
        }
    }

    /**
     * Navigate to a page — works in all environments
     */
    function navigate(page) {
        page = page.replace('.html', '').replace(/^\//, '');

        if (isGitHubPages) {
            window.location.href = basePath + page + '.html#/' + page;
        } else {
            window.location.href = page + '.html#/' + page;
        }
    }

    /**
     * Go back or fallback to a page
     */
    function goBack(fallback = 'login') {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate(fallback);
        }
    }

    /**
     * Intercept all link clicks and convert to hash navigation
     */
    function interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Skip external links, anchors, and special links
            if (!href || 
                href.startsWith('http') || 
                href.startsWith('//') || 
                href === '#' ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                return;
            }
            
            // If it's an internal .html link
            if (href.endsWith('.html')) {
                e.preventDefault();
                const pageName = href.replace('.html', '');
                navigate(pageName);
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
