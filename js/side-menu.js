// Side menu debug script - standalone script for debugging
(function() {
    console.log("Initializing side menu debug script");
    
    document.addEventListener('DOMContentLoaded', function() {
        // Direct DOM manipulation for hamburger menu
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        const sideMenuClose = document.querySelector('.side-menu-close');
        
        console.log("Hamburger elements found:", {
            menuToggle: !!menuToggle,
            sideMenu: !!sideMenu,
            sideMenuOverlay: !!sideMenuOverlay,
            sideMenuClose: !!sideMenuClose
        });
        
        if (!menuToggle || !sideMenu || !sideMenuOverlay || !sideMenuClose) {
            console.error("Side menu elements not found in debug script");
            return;
        }
        
        // Add debug classes to make elements easier to identify
        menuToggle.classList.add('debug-menu-toggle');
        sideMenu.classList.add('debug-side-menu');
        
        // Direct click handler for the hamburger with slower animation
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("DEBUG: Menu toggle clicked");
            
            // Set slow transition for opening animation
            sideMenu.style.transitionDuration = '0.8s';
            
            // Toggle side menu and overlay
            sideMenu.classList.toggle('active');
            sideMenuOverlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            console.log("DEBUG: Side menu visibility:", sideMenu.classList.contains('active'));
        });
        
        // Close button handler with slower animation
        sideMenuClose.addEventListener('click', function() {
            console.log("DEBUG: Close button clicked");
            // Set slow transition for closing animation
            sideMenu.style.transitionDuration = '0.8s';
            
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        // Overlay click handler with slower animation
        sideMenuOverlay.addEventListener('click', function() {
            console.log("DEBUG: Overlay clicked");
            // Set slow transition for closing animation
            sideMenu.style.transitionDuration = '0.8s';
            
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        console.log("Side menu debug handlers attached");
    });
})();
