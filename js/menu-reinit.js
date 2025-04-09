/**
 * Menu Reinitialization Helper
 * This script ensures menu functionality is restored after profile creation
 * or any other operation that might break menu event listeners
 */

(function() {
    console.log("Initializing menu reinitialization helper");
    
    // Function to reinitialize all menu-related functionality
    function reinitializeMenu() {
        console.log("Reinitializing all menu functionality");
        
        // Call all available menu fix functions
        const fixFunctions = [
            'fixSideMenu',
            'globalMenuFix',
            'fixMenuToggle',
            'fixSettingsButtons',
            'initializeSideMenu'
        ];
        
        fixFunctions.forEach(funcName => {
            if (window[funcName] && typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                    console.log(`Successfully called ${funcName}`);
                } catch (err) {
                    console.error(`Error calling ${funcName}:`, err);
                }
            }
        });
        
        // Direct fix for settings dropdown
        const settingsButton = document.getElementById('settings-button');
        const settingsDropdown = document.getElementById('settings-dropdown');
        
        if (settingsButton && settingsDropdown) {
            // Remove existing listeners by cloning
            const newSettingsButton = settingsButton.cloneNode(true);
            settingsButton.parentNode.replaceChild(newSettingsButton, settingsButton);
            
            // Add fresh click handler
            newSettingsButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Settings button clicked (reinit)");
                
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                
                if (expanded) {
                    settingsDropdown.style.display = 'none';
                } else {
                    settingsDropdown.style.display = 'block';
                }
            });
        }
        
        // Direct fix for feedback button
        const feedbackBtn = document.getElementById('side-menu-feedback-btn');
        
        if (feedbackBtn) {
            // Remove existing listeners by cloning
            const newFeedbackBtn = feedbackBtn.cloneNode(true);
            feedbackBtn.parentNode.replaceChild(newFeedbackBtn, feedbackBtn);
            
            // Add fresh click handler
            newFeedbackBtn.addEventListener('click', function(e) {
                console.log("Feedback button clicked (reinit)");
                
                // Close the side menu
                const sideMenu = document.querySelector('.side-menu');
                const sideMenuOverlay = document.querySelector('.side-menu-overlay');
                const menuToggle = document.getElementById('menu-toggle');
                
                if (sideMenu) sideMenu.classList.remove('active');
                if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                
                // Show feedback modal
                const feedbackModal = document.getElementById('feedbackModal');
                if (feedbackModal) {
                    feedbackModal.style.display = "flex";
                    feedbackModal.style.visibility = "visible";
                    feedbackModal.style.opacity = "1";
                    feedbackModal.style.pointerEvents = "auto";
                    feedbackModal.classList.add('active');
                    window.isModalOpen = true;
                }
            });
        }
    }
    
    // Make function globally available
    window.reinitializeMenu = reinitializeMenu;
    
    // Run on load and after a short delay
    reinitializeMenu();
    setTimeout(reinitializeMenu, 1000);
    
    // Run after profile creation event if supported
    document.addEventListener('profileCreated', reinitializeMenu);
    
    // Listen for custom profile creation event
    window.addEventListener('profileCreationComplete', reinitializeMenu);
})();
