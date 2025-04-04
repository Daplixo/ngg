/**
 * Direct Menu Fix Script
 * This script directly repairs the menu toggle functionality
 * It runs immediately and doesn't rely on any other scripts
 */

(function() {
    // Function to fix menu toggle
    function fixMenuToggle() {
        console.log("Running menu button fix script");
        
        // Get the critical elements
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        const sideMenuClose = document.querySelector('.side-menu-close');
        
        // If elements not found, retry later
        if (!menuToggle || !sideMenu || !sideMenuOverlay || !sideMenuClose) {
            console.log("Menu elements not found, retrying in 200ms");
            setTimeout(fixMenuToggle, 200);
            return;
        }
        
        console.log("Menu elements found, applying direct handlers");
        
        // Remove any existing click handlers by cloning and replacing
        const newMenuToggle = menuToggle.cloneNode(true);
        if (menuToggle.parentNode) {
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        }
        
        // Apply direct onclick handler to new button - using inline function for maximum compatibility
        newMenuToggle.setAttribute('onclick', `
            event.preventDefault();
            document.querySelector('.side-menu').classList.toggle('active');
            document.querySelector('.side-menu-overlay').classList.toggle('active');
            this.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            console.log('Menu toggle clicked [direct attribute handler]');
            return false;
        `);
        
        // Make sure the button is properly styled and visible
        newMenuToggle.style.cssText = 'cursor: pointer; pointer-events: auto; opacity: 1; visibility: visible; display: flex;';
        
        // Also apply handlers to close button and overlay - using setAttribute for maximum compatibility
        sideMenuClose.setAttribute('onclick', `
            document.querySelector('.side-menu').classList.remove('active');
            document.querySelector('.side-menu-overlay').classList.remove('active');
            document.getElementById('menu-toggle').classList.remove('active');
            document.body.classList.remove('menu-open');
            console.log('Close button clicked [direct attribute handler]');
            return false;
        `);
        
        sideMenuOverlay.setAttribute('onclick', `
            document.querySelector('.side-menu').classList.remove('active');
            this.classList.remove('active');
            document.getElementById('menu-toggle').classList.remove('active');
            document.body.classList.remove('menu-open');
            console.log('Overlay clicked [direct attribute handler]');
            return false;
        `);
        
        console.log("Menu functionality fixed successfully with direct attribute handlers");
    }
    
    // Run fix immediately
    fixMenuToggle();
    
    // Also run after DOM is fully loaded as backup
    document.addEventListener('DOMContentLoaded', fixMenuToggle);
    
    // Final check - run after a delay just to be sure
    setTimeout(fixMenuToggle, 1000);
    
    // Make fix function available globally for manual execution
    window.fixMenuToggle = fixMenuToggle;
})();
