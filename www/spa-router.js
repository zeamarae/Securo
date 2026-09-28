/**
 * Securo SPA Router - Single Page Application Routing
 * Uses Hash-based routing (works everywhere, including local servers)
 * Example URLs: yoursite.com/#/login, yoursite.com/#/terms
 * NO .html extensions visible!
 */

(function() {
    'use strict';

    const SPARouter = {
        // Initialize the router
        init() {
            // Automatically convert current URL to hash-based
            this.convertToHashURL();
            
            // Update all internal links
            this.interceptLinks();
            
            console.log('✓ SPA Router initialized - Clean URLs active!');
        },

        // Convert login.html to /#/login automatically
        convertToHashURL() {
            const path = window.location.pathname;
            const fileName = path.split('/').pop();
            
            // If we're on a .html page and no hash exists
            if (fileName.endsWith('.html') && !window.location.hash) {
                const pageName = fileName.replace('.html', '');
                
                // Replace URL without reload
                const newURL = window.location.origin + window.location.pathname.replace(fileName, '') + '#/' + pageName;
                window.history.replaceState(null, '', newURL);
            }
        },

        // Intercept all link clicks and convert to hash navigation
        interceptLinks() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (!link) return;
                
                const href = link.getAttribute('href');
                
                // Skip external links, anchors, and special links
                if (!href || 
                    href.startsWith('http') || 
                    href.startsWith('//') || 
                    href === '#' ||
                    href.startsWith('javascript:')) {
                    return;
                }
                
                // If it's an internal .html link
                if (href.endsWith('.html')) {
                    e.preventDefault();
                    const pageName = href.replace('.html', '');
                    this.navigate(pageName);
                }
            }, false);
        },

        // Navigate to a page
        navigate(page) {
            page = page.replace(/^\//, '').replace('.html', '');
            window.location.href = page + '.html#/' + page;
        },

        // Go back
        back(fallback = 'login') {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                this.navigate(fallback);
            }
        }
    };

    // Make it globally available
    window.SPARouter = SPARouter;
    window.navigateTo = (page) => SPARouter.navigate(page);
    window.goBack = (fallback) => SPARouter.back(fallback);

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SPARouter.init());
    } else {
        SPARouter.init();
    }

})();
