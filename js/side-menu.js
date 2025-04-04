// Side menu debug script - standalone script for debugging
(function() {
    console.log("Initializing side menu debug script");
    
    // Add a helper function to toggle theme that can be called directly
    function toggleTheme() {
        console.log("Toggling theme directly");
        // Get the current theme
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        
        // Toggle theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        try {
            localStorage.setItem('theme', newTheme);
        } catch (e) {
            console.error('Could not save theme preference:', e);
        }
        
        console.log('Theme switched to:', newTheme);
    }
    
    // Make the function globally accessible
    window.toggleTheme = toggleTheme;
    
    // CRITICAL FIX: Initialize side menu functionality immediately instead of waiting for DOMContentLoaded
    // This ensures the event handlers are attached as soon as possible
    function initializeSideMenu() {
        console.log("Initializing side menu functionality directly");
        
        // Direct DOM manipulation for hamburger menu
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        const sideMenuClose = document.querySelector('.side-menu-close');
        
        if (!menuToggle || !sideMenu || !sideMenuOverlay || !sideMenuClose) {
            console.error("Side menu elements not found, will retry later");
            // If elements are not found, try again after a delay
            setTimeout(initializeSideMenu, 500);
            return;
        }
        
        console.log("Hamburger menu elements found, attaching handlers");
        
        // CRITICAL FIX: Use direct inline function instead of references that might be lost
        menuToggle.onclick = function(e) {
            e.preventDefault();
            console.log("Menu toggle clicked");
            
            // Toggle side menu and overlay
            sideMenu.classList.toggle('active');
            sideMenuOverlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        };
        
        // CRITICAL FIX: Use direct inline function for close button
        sideMenuClose.onclick = function() {
            console.log("Close button clicked");
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        
        // CRITICAL FIX: Use direct inline function for overlay
        sideMenuOverlay.onclick = function() {
            console.log("Overlay clicked");
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        
        console.log("Side menu handlers attached successfully");
    }
    
    // Run initialization immediately
    initializeSideMenu();
    
    // Then also try during DOMContentLoaded as a backup
    document.addEventListener('DOMContentLoaded', function() {
        // Call initialization again to ensure it runs
        initializeSideMenu();
        
        // Also set up settings dropdown functionality
        const settingsToggle = document.getElementById('settings-button');
        const settingsDropdown = document.getElementById('settings-dropdown');
        
        if (settingsToggle && settingsDropdown) {
            console.log("Settings dropdown elements found");
            
            // Toggle dropdown when clicking the settings button
            settingsToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle aria-expanded attribute
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                
                console.log("Settings dropdown toggled:", !expanded);
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!settingsToggle.contains(e.target) && !settingsDropdown.contains(e.target)) {
                    settingsToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close dropdown when side menu closes
            const sideMenuClose = document.querySelector('.side-menu-close');
            
            if (sideMenuClose) {
                sideMenuClose.addEventListener('click', function() {
                    settingsToggle.setAttribute('aria-expanded', 'false');
                });
            }
            
            // Also close dropdown when clicking on overlay
            const sideMenuOverlay = document.querySelector('.side-menu-overlay');
            if (sideMenuOverlay) {
                sideMenuOverlay.addEventListener('click', function() {
                    settingsToggle.setAttribute('aria-expanded', 'false');
                });
            }
            
            // Direct theme toggle attachment - simplest possible approach
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                console.log("Theme toggle found, adding direct click handler");
                
                // CRITICAL FIX: Use onclick instead of addEventListener
                themeToggle.onclick = function(e) {
                    console.log("Theme toggle clicked - using direct method");
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Call the global toggle function
                    window.toggleTheme();
                };
            } else {
                console.error("Theme toggle not found in settings dropdown");
            }
        }
    });
    
    // Check for saved theme on page load
    document.addEventListener('DOMContentLoaded', function() {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                console.log("Applied saved theme on page load:", savedTheme);
            }
        } catch (e) {
            console.error('Could not retrieve saved theme:', e);
        }
        
        // Delete Account functionality
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            console.log("Delete Account button found, adding click handler");
            
            deleteAccountBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Create and show the confirmation dialog
                showDeleteConfirmation();
            });
        }
    });
    
    // Function to show the delete confirmation dialog
    function showDeleteConfirmation() {
        // Create the confirmation dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000';
        
        // Create the confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.style.backgroundColor = 'var(--card-bg, #ffffff)';
        dialog.style.color = 'var(--text-color, #333333)';
        dialog.style.borderRadius = '8px';
        dialog.style.padding = '20px';
        dialog.style.maxWidth = '400px';
        dialog.style.width = '90%';
        dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        dialog.style.textAlign = 'center';
        
        // Add the warning content
        const title = document.createElement('h3');
        title.textContent = 'Delete Account Data';
        title.style.color = '#e74c3c';
        title.style.marginTop = '0';
        
        const message = document.createElement('p');
        message.textContent = 'This will delete all your game data including level progress, settings, and personal information. This action cannot be undone.';
        message.style.marginBottom = '20px';
        
        // Add the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '15px';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.border = 'none';
        cancelButton.style.backgroundColor = 'var(--btn-secondary, #6c757d)';
        cancelButton.style.color = 'white';
        cancelButton.style.cursor = 'pointer';
        
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Delete Data';
        confirmButton.style.padding = '8px 16px';
        confirmButton.style.borderRadius = '4px';
        confirmButton.style.border = 'none';
        confirmButton.style.backgroundColor = '#e74c3c';
        confirmButton.style.color = 'white';
        confirmButton.style.cursor = 'pointer';
        
        // Add event listeners
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        confirmButton.addEventListener('click', function() {
            // Delete all local storage data
            deleteAllUserData();
            
            // Remove the confirmation dialog
            document.body.removeChild(overlay);
            
            // Close the side menu
            const sideMenu = document.querySelector('.side-menu');
            const sideMenuOverlay = document.querySelector('.side-menu-overlay');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (sideMenu) sideMenu.classList.remove('active');
            if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Show success message
            showSuccessMessage();
            
            // Reload the page after a short delay
            setTimeout(function() {
                window.location.reload();
            }, 1500);
        });
        
        // Assemble the dialog
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        
        dialog.appendChild(title);
        dialog.appendChild(message);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    // Function to delete all user data
    function deleteAllUserData() {
        console.log("Deleting all user data from local storage");
        try {
            // Save theme preference temporarily
            const currentTheme = localStorage.getItem('theme');
            
            // Clear all localStorage
            localStorage.clear();
            
            // Restore theme preference if user wants to keep it
            if (currentTheme) {
                localStorage.setItem('theme', currentTheme);
            }
            
            console.log("All user data deleted successfully");
        } catch (e) {
            console.error("Error deleting user data:", e);
        }
    }
    
    // Function to show success message
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.textContent = 'All data deleted successfully!';
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = '#2ecc71';
        message.style.color = 'white';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '4px';
        message.style.zIndex = '10000';
        message.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        
        document.body.appendChild(message);
        
        // Remove the message after some time
        setTimeout(function() {
            document.body.removeChild(message);
        }, 3000);
    }
    
    console.log("Theme toggle and delete account handlers initialized");
})();
