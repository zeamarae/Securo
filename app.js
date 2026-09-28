/**
 * Securo App Router - Hash-based Navigation (SPA Style)
 * Works on ANY server including local development
 * Uses hash routing like React Router hash mode
 */

(function() {
    'use strict';

    // Page content storage
    const pages = {
        'login': 'login.html',
        'terms': 'terms.html',
        'admin': 'admin.html',
        'admin-login': 'admin-login.html',
        'profile': 'profile.html',
        'index': 'index.html',
        'role-selection': 'role-selection.html'
    };

    // Get current page from hash
    function getCurrentPage() {
        const hash = window.location.hash.slice(1) || 'login';
        return hash.replace(/^\//, ''); // Remove leading slash if present
    }

    // Navigate to a page using hash
    function navigate(page) {
        // Remove .html if present
        page = page.replace('.html', '');
        window.location.hash = page;
    }

    // Load page content
    function loadPage(pageName) {
        const fileName = pages[pageName] || pages['login'];
        
        // For now, just redirect to the actual file
        // In a true SPA, you'd load content via AJAX
        const currentFile = window.location.pathname.split('/').pop();
        const targetFile = fileName;
        
        if (currentFile !== targetFile) {
            window.location.href = targetFile + '#' + pageName;
        }
    }

    // Update all links to use hash navigation
    function updateLinks() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('//') || href === '#') return;
            
            // Check if it's an internal .html link
            if (href.endsWith('.html')) {
                e.preventDefault();
                const page = href.replace('.html', '');
                navigate(page);
            }
        });
    }

    // Clean URL in address bar (hide .html)
    function cleanURL() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        
        if (fileName.endsWith('.html') && !window.location.hash) {
            const pageName = fileName.replace('.html', '');
            window.history.replaceState(null, '', '#' + pageName);
        }
    }

    // Initialize
    function init() {
        cleanURL();
        updateLinks();
        
        // Handle hash changes
        window.addEventListener('hashchange', function() {
            const page = getCurrentPage();
            // You can add page transition logic here
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose global navigation function
    window.navigateTo = navigate;

})();
