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
        
        // Apply direct onclick handler to new button
        newMenuToggle.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Menu button clicked [direct handler]");
            
            // Toggle classes
            sideMenu.classList.toggle('active');
            sideMenuOverlay.classList.toggle('active');
            newMenuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        };
        
        // Make sure the button is properly styled
        newMenuToggle.style.cursor = 'pointer';
        newMenuToggle.style.pointerEvents = 'auto';
        
        // Also apply handlers to close button and overlay
        sideMenuClose.onclick = function() {
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            newMenuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        
        sideMenuOverlay.onclick = function() {
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            newMenuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        
        console.log("Menu functionality fixed successfully");
    }
    
    // Run fix immediately
    fixMenuToggle();
    
    // Also run after DOM is fully loaded as backup
    document.addEventListener('DOMContentLoaded', fixMenuToggle);
    
    // Final check - run after a delay just to be sure
    setTimeout(fixMenuToggle, 1000);
})();
