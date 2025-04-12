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
    
    // CRITICAL FIX: Initialize side menu functionality immediately
    // IMPROVED FIX: Use a more reliable approach for event binding
    function initializeSideMenu() {
        console.log("Initializing side menu functionality with improved method");
        
        // Get all side menu elements
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        const sideMenuClose = document.querySelector('.side-menu-close');
        const sideMenuFeedbackBtn = document.getElementById('side-menu-feedback-btn');
        const settingsButton = document.getElementById('settings-button');
        const settingsDropdown = document.getElementById('settings-dropdown');
        const themeToggle = document.getElementById('theme-toggle');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        
        // Check if critical elements exist
        if (!menuToggle || !sideMenu || !sideMenuOverlay) {
            console.warn("Critical side menu elements not found, will retry in 300ms");
            setTimeout(initializeSideMenu, 300);
            return;
        }
        
        console.log("Side menu elements found:", {
            menuToggle: !!menuToggle,
            sideMenu: !!sideMenu,
            sideMenuOverlay: !!sideMenuOverlay,
            sideMenuClose: !!sideMenuClose,
            sideMenuFeedbackBtn: !!sideMenuFeedbackBtn,
            settingsButton: !!settingsButton,
            themeToggle: !!themeToggle,
            deleteAccountBtn: !!deleteAccountBtn
        });
        
        // CRITICAL FIX: Reset all event listeners by cloning elements
        // This is the most reliable way to ensure clean event handling
        
        // Fix main menu toggle button
        if (menuToggle) {
            const newMenuToggle = menuToggle.cloneNode(true);
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
            
            // Add explicit styles to make sure it's visible and clickable
            newMenuToggle.style.cursor = 'pointer';
            newMenuToggle.style.pointerEvents = 'auto';
            
            // Direct event handler that's less likely to be overridden
            newMenuToggle.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Menu toggle clicked", new Date().toISOString());
                
                // Toggle classes directly
                sideMenu.classList.toggle('active');
                sideMenuOverlay.classList.toggle('active');
                newMenuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            };
        }
        
        // Fix close button
        if (sideMenuClose) {
            const newSideMenuClose = sideMenuClose.cloneNode(true);
            sideMenuClose.parentNode.replaceChild(newSideMenuClose, sideMenuClose);
            
            newSideMenuClose.onclick = function() {
                console.log("Close button clicked");
                sideMenu.classList.remove('active');
                sideMenuOverlay.classList.remove('active');
                document.getElementById('menu-toggle')?.classList.remove('active');
                document.body.classList.remove('menu-open');
            };
        }
        
        // Fix overlay
        if (sideMenuOverlay) {
            const newSideMenuOverlay = sideMenuOverlay.cloneNode(true);
            sideMenuOverlay.parentNode.replaceChild(newSideMenuOverlay, sideMenuOverlay);
            
            newSideMenuOverlay.onclick = function() {
                console.log("Overlay clicked");
                sideMenu.classList.remove('active');
                newSideMenuOverlay.classList.remove('active');
                document.getElementById('menu-toggle')?.classList.remove('active');
                document.body.classList.remove('menu-open');
            };
        }
        
        // Fix feedback button
        if (sideMenuFeedbackBtn) {
            const newFeedbackBtn = sideMenuFeedbackBtn.cloneNode(true);
            sideMenuFeedbackBtn.parentNode.replaceChild(newFeedbackBtn, sideMenuFeedbackBtn);
            
            newFeedbackBtn.onclick = function() {
                console.log("Feedback button clicked");
                
                // Close the side menu first
                sideMenu.classList.remove('active');
                sideMenuOverlay.classList.remove('active');
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
            };
        }

        // Handle the leaderboard button
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        
        if (leaderboardBtn) {
            const newLeaderboardBtn = leaderboardBtn.cloneNode(true);
            leaderboardBtn.parentNode.replaceChild(newLeaderboardBtn, leaderboardBtn);
            
            newLeaderboardBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Leaderboard button clicked");
                
                // Get the parent element (side-menu-item) to append the notification to
                const leaderboardItem = this.closest('.side-menu-item');
                
                // Remove any existing notification first
                const existingNotification = leaderboardItem.querySelector('.orange-notification');
                if (existingNotification) {
                    existingNotification.remove();
                }
                
                // Create the orange notification
                const notification = document.createElement('div');
                notification.className = 'orange-notification';
                notification.textContent = 'Leaderboard coming soon!';
                notification.style.color = '#ff8c00'; // Orange color
                notification.style.fontSize = '0.85rem';
                notification.style.padding = '5px 0 0 38px'; // Align with the menu text (matches the icon width + margin)
                notification.style.fontWeight = '500';
                notification.style.transition = 'opacity 0.3s ease';
                
                // Add the notification below the button
                leaderboardItem.appendChild(notification);
                
                // Remove the notification after 3 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        // Fade out effect
                        notification.style.opacity = '0';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.remove();
                            }
                        }, 300); // Wait for fade out animation
                    }
                }, 3000);
            };
        }
        
        // Fix settings button and dropdown
        if (settingsButton && settingsDropdown) {
            const newSettingsButton = settingsButton.cloneNode(true);
            settingsButton.parentNode.replaceChild(newSettingsButton, settingsButton);
            
            newSettingsButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Settings button clicked");
                
                // Toggle dropdown based on aria-expanded attribute
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                
                // Actually show/hide the dropdown
                if (expanded) {
                    settingsDropdown.style.display = 'none';
                } else {
                    settingsDropdown.style.display = 'block';
                }
            };
        }
        
        // Fix theme toggle button
        if (themeToggle) {
            const newThemeToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
            
            newThemeToggle.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Theme toggle clicked");
                
                // Call global theme toggle function
                window.toggleTheme();
                
                // Close settings dropdown after action
                const settingsButton = document.getElementById('settings-button');
                if (settingsButton) {
                    settingsButton.setAttribute('aria-expanded', 'false');
                }
                const settingsDropdown = document.getElementById('settings-dropdown');
                if (settingsDropdown) {
                    settingsDropdown.style.display = 'none';
                }
            };
        }
        
        // Fix delete account button
        if (deleteAccountBtn) {
            const newDeleteAccountBtn = deleteAccountBtn.cloneNode(true);
            deleteAccountBtn.parentNode.replaceChild(newDeleteAccountBtn, deleteAccountBtn);
            
            newDeleteAccountBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Delete account button clicked");
                
                // Show confirmation dialog
                showDeleteConfirmation();
                
                // Close settings dropdown after action
                const settingsButton = document.getElementById('settings-button');
                if (settingsButton) {
                    settingsButton.setAttribute('aria-expanded', 'false');
                }
                const settingsDropdown = document.getElementById('settings-dropdown');
                if (settingsDropdown) {
                    settingsDropdown.style.display = 'none';
                }
            };
        }
        
        // Fix theme toggle button sizing to match delete account
        const styleFixForSettings = document.createElement('style');
        styleFixForSettings.textContent = `
            #theme-toggle {
                width: 100% !important;
                box-sizing: border-box !important;
                padding: 8px 12px !important;
                display: flex !important;
            }
            
            #theme-toggle .theme-option-content {
                display: flex !important;
                align-items: center !important;
                width: 100% !important;
            }
            
            #theme-toggle .icon-container,
            #delete-account-btn .icon-container {
                position: relative !important;
                width: 16px !important;
                height: 16px !important;
                min-width: 16px !important;
                margin-right: 12px !important;
                flex-shrink: 0 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            #theme-toggle span,
            #delete-account-btn span {
                font-size: 0.9rem !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            
            @media (max-width: 480px) {
                #theme-toggle,
                #delete-account-btn {
                    padding: 6px 10px !important;
                }
            }
        `;
        document.head.appendChild(styleFixForSettings);
        
        console.log("All side menu event handlers fixed and attached");
    }
    
    // Run initialization right away
    initializeSideMenu();
    
    // Also run after DOMContentLoaded as a backup
    document.addEventListener('DOMContentLoaded', initializeSideMenu);
    
    // Final check after everything has loaded
    window.addEventListener('load', initializeSideMenu);
    
    // Add a global function for manual execution from console if needed
    window.fixSideMenu = initializeSideMenu;
    
    // ADDITIONAL CRITICAL FIX: Create an emergency retry mechanism
    function emergencyMenuFix() {
        console.log("Running emergency side menu fix");
        
        // Fix the hamburger (menu toggle) button with a direct approach
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        
        if (menuToggle && sideMenu && sideMenuOverlay) {
            // Use direct attribute without any framework/library 
            menuToggle.setAttribute('onclick', `
                this.classList.toggle('active');
                document.querySelector('.side-menu').classList.toggle('active');
                document.querySelector('.side-menu-overlay').classList.toggle('active');
                document.body.classList.toggle('menu-open');
                console.log('Menu toggled via emergency fix');
                return false;
            `);
            
            // Make sure it's visible
            menuToggle.style.cssText = 'cursor: pointer; pointer-events: auto; opacity: 1; visibility: visible; display: flex;';
        }
    }
    
    // Run emergency fix after a short delay as last resort
    setTimeout(emergencyMenuFix, 2000);
    
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
        console.log("Deleting all user data");
        try {
            // Get user profile data before deleting
            const profileData = JSON.parse(localStorage.getItem('userProfileData'));
            const username = profileData?.name;
            
            // Save theme preference temporarily
            const currentTheme = localStorage.getItem('theme');
            
            // Clear all localStorage
            localStorage.clear();
            
            // Restore theme preference
            if (currentTheme) {
                localStorage.setItem('theme', currentTheme);
            }
            
            // If the profile was synced with server, delete from server as well
            if (username && profileData?.syncedWithServer) {
                import('./api/apiService.js').then(module => {
                    const apiService = module.apiService;
                    apiService.deleteAccountByUsername(username)
                        .then(() => {
                            console.log("Account deleted from server");
                        })
                        .catch(err => {
                            console.error("Failed to delete account from server:", err);
                        });
                });
            }
            
            console.log("All user data deleted successfully");
            showSuccessMessage();
            
            // Reload the page after a short delay so the success message is visible
            setTimeout(() => {
                location.reload();
            }, 1500);
        } catch (e) {
            console.error("Error deleting user data:", e);
            alert("An error occurred while deleting your account. Please try again.");
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
