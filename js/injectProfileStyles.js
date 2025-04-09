/**
 * Dynamically injects the profile-stats.css stylesheet
 * Used when we can't directly modify index.html
 */

(function() {
    function injectStylesheet(href) {
        // Check if it's already loaded
        if (document.querySelector(`link[href="${href}"]`)) {
            console.log(`Stylesheet ${href} already loaded`);
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        console.log(`Dynamically injected stylesheet: ${href}`);
    }
    
    // Inject our profile stats styles
    injectStylesheet('css/profile-stats.css');
})();
