/**
 * Securo Router - Clean URL Handler
 * Handles navigation without .html extensions
 * Works in both web and Capacitor environments
 */

(function() {
    'use strict';

    const Router = {
        /**
         * Navigate to a page without .html extension
         * @param {string} path - Path without .html (e.g., 'terms', 'login')
         */
        navigate(path) {
            // Remove leading slash if present
            path = path.replace(/^\//, '');
            
            // Check if we're in a Capacitor/Cordova environment or file protocol
            const isApp = window.Capacitor || window.cordova || window.location.protocol === 'file:';
            
            if (isApp) {
                // In app environment, use .html extension
                window.location.href = path + '.html';
            } else {
                // In web environment, use clean URL
                // Check if .html is already in the path
                if (path.endsWith('.html')) {
                    path = path.replace('.html', '');
                }
                window.location.href = '/' + path;
            }
        },

        /**
         * Go back to previous page or fallback to a default page
         * @param {string} fallback - Fallback page without .html (e.g., 'login')
         */
        back(fallback = 'login') {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                this.navigate(fallback);
            }
        },

        /**
         * Get proper href for links based on environment
         * @param {string} path - Path without .html
         * @returns {string} - Proper href
         */
        getHref(path) {
            path = path.replace(/^\//, '').replace('.html', '');
            const isApp = window.Capacitor || window.cordova || window.location.protocol === 'file:';
            return isApp ? path + '.html' : '/' + path;
        },

        /**
         * Initialize router - convert all internal links to use clean URLs
         */
        init() {
            // Update all links on page load
            document.addEventListener('DOMContentLoaded', () => {
                this.updateLinks();
            });

            // Also update if called after DOM is already loaded
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                this.updateLinks();
            }
        },

        /**
         * Update all internal links to use proper URLs
         */
        updateLinks() {
            const isApp = window.Capacitor || window.cordova || window.location.protocol === 'file:';
            
            // Don't modify links in app environment (they already have .html)
            if (isApp) return;

            // Get all internal links
            const links = document.querySelectorAll('a[href*=".html"]');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    // Remove .html extension for web
                    const cleanHref = href.replace('.html', '');
                    link.setAttribute('href', cleanHref);
                }
            });
        }
    };

    // Make Router globally available
    window.SecuroRouter = Router;

    // Auto-initialize
    Router.init();
})();
