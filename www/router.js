/**
 * Securo Router
 * Works on: local dev (127.0.0.1:5508), GitHub Pages (zeamarae.github.io/Securo/)
 * Strategy: keep .html for navigation but rewrite the visible URL using history.replaceState
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
        const file = window.location.pathname.split('/').pop().replace('.html', '');
        return file || 'role-selection';
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

    // Expose globally
    window.SecuroRouter = { navigate, goBack, getCurrentRoute, cleanURL, basePath, isGitHubPages };

    // Auto clean URL on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanURL);
    } else {
        cleanURL();
    }
})();
