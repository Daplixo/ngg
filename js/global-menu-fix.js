/**
 * Global Menu Fix
 * This script runs immediately when loaded and fixes all menu-related issues
 */

(function() {
    console.log("🔄 Running global menu fix script");
    
    // Helper function to safely find and attach direct click handlers
    function fixClickHandler(selector, handler) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
            return false;
        }
        
        try {
            // Use direct onclick property for maximum reliability
            element.onclick = handler;
            console.log(`✅ Fixed handler for ${selector}`);
            return true;
        } catch (e) {
            console.error(`Failed to fix handler for ${selector}:`, e);
            return false;
        }
    }
    
    // Run the fix function immediately and after a short delay
    function runFix() {
        // Fix hamburger menu toggle
        fixClickHandler('#menu-toggle', function(e) {
            e.preventDefault();
            const sideMenu = document.querySelector('.side-menu');
            const sideMenuOverlay = document.querySelector('.side-menu-overlay');
            if (sideMenu && sideMenuOverlay) {
                console.log("📱 Menu toggle clicked (global fix)");
                sideMenu.classList.toggle('active');
                sideMenuOverlay.classList.toggle('active');
                this.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            }
        });
        
        // Fix side menu close button
        fixClickHandler('.side-menu-close', function() {
            console.log("📱 Close button clicked (global fix)");
            document.querySelector('.side-menu')?.classList.remove('active');
            document.querySelector('.side-menu-overlay')?.classList.remove('active');
            document.getElementById('menu-toggle')?.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        // Fix side menu overlay click
        fixClickHandler('.side-menu-overlay', function() {
            console.log("📱 Overlay clicked (global fix)");
            document.querySelector('.side-menu')?.classList.remove('active');
            this.classList.remove('active');
            document.getElementById('menu-toggle')?.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        // Fix feedback button
        fixClickHandler('#side-menu-feedback-btn', function() {
            console.log("📱 Feedback button clicked (global fix)");
            // Close side menu
            document.querySelector('.side-menu')?.classList.remove('active');
            document.querySelector('.side-menu-overlay')?.classList.remove('active');
            document.getElementById('menu-toggle')?.classList.remove('active');
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
        
        // Fix theme toggle
        fixClickHandler('#theme-toggle', function(e) {
            e.preventDefault();
            console.log("📱 Theme toggle clicked (global fix)");
            // Toggle theme directly
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update theme icons
            const moonIcon = document.getElementById('moon-icon');
            const sunIcon = document.getElementById('sun-icon');
            
            if (moonIcon && sunIcon) {
                if (newTheme === 'dark') {
                    moonIcon.style.opacity = '0';
                    sunIcon.style.opacity = '1';
                } else {
                    moonIcon.style.opacity = '1';
                    sunIcon.style.opacity = '0';
                }
            }
            
            // Also fix the settings buttons after theme change
            if (typeof window.fixSettingsButtons === 'function') {
                setTimeout(window.fixSettingsButtons, 100);
            }
        });
        
        // Fix settings button to toggle dropdown
        fixClickHandler('#settings-button', function(e) {
            e.preventDefault();
            console.log("📱 Settings button clicked (global fix)");
            const dropdown = document.getElementById('settings-dropdown');
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            
            if (dropdown) {
                dropdown.style.display = expanded ? 'none' : 'block';
            }
        });
        
        // Fix delete account button
        fixClickHandler('#delete-account-btn', function() {
            console.log("📱 Delete account button clicked (global fix)");
            if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                try {
                    // Clear localStorage except theme preference
                    const theme = localStorage.getItem('theme');
                    localStorage.clear();
                    if (theme) localStorage.setItem('theme', theme);
                    
                    alert('Account deleted successfully!');
                    location.reload();
                } catch (e) {
                    console.error("Error deleting account:", e);
                    alert("Failed to delete account data. Please try again.");
                }
            }
        });
    }
    
    // Run fix both immediately and after a delay to ensure it works
    runFix();
    setTimeout(runFix, 1000);
    
    // Make fix function available globally for manual execution
    window.fixAllMenuButtons = runFix;
    
    // Run fix now
    runFix();
    
    // Run fix after DOM loaded
    document.addEventListener('DOMContentLoaded', runFix);
    
    // Run fix after a delay to catch all elements
    setTimeout(runFix, 500);
    setTimeout(runFix, 1000);
    
    // Make sure theme toggle and delete account have consistent sizes
    function ensureConsistentButtonSizes() {
        const themeToggle = document.getElementById('theme-toggle');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        
        if (themeToggle && deleteAccountBtn) {
            const deleteStyle = window.getComputedStyle(deleteAccountBtn);
            
            // Force consistent styling
            themeToggle.style.width = '100%';
            themeToggle.style.boxSizing = 'border-box';
            themeToggle.style.padding = deleteStyle.padding;
        }
    }
    
    // Run this additional check for consistent button sizes
    setTimeout(ensureConsistentButtonSizes, 300);
    setTimeout(ensureConsistentButtonSizes, 800);
    
    // Make function available globally
    window.ensureConsistentButtonSizes = ensureConsistentButtonSizes;
    
    console.log("🔄 Global menu fix complete");
})();
