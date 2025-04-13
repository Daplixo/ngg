/**
 * Initial Profile Setup
 * Handles the first-time user profile setup experience with Account option
 */

import { UserProfile } from './userProfile.js';
import { UserProfileUI } from './userProfileUI.js';
import { AVATARS, getAvatarIdByPath } from './config/avatarConfig.js';

// Set a global flag to indicate initialProfileSetup is active
window.initialProfileSetupActive = true;

export class InitialProfileSetup {
    constructor() {
        this.userProfile = new UserProfile();
        this.avatarOptions = AVATARS;
        this.tempProfileData = {}; // Store temporary profile data during the setup process
    }

    init() {
        // Check if a profile already exists
        if (!this.userProfile.hasProfile()) {
            console.log("No profile exists, showing account setup screen");
            // Show account setup directly instead of choice screen
            this.showAccountSetup();
        } else {
            console.log("Profile already exists, skipping setup");
            // Set flag to false since setup is not needed
            window.initialProfileSetupActive = false;
        }
    }

    showAccountSetup() {
        console.log("Showing account setup form");
        
        const modal = document.createElement('div');
        modal.className = 'modal-wrapper';
        modal.id = 'accountSetupModal';
        modal.style.zIndex = "100000";
        modal.style.display = "flex";
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
        
        // Add class to body for blur effect
        document.body.classList.add('initial-setup-active');
        
        // Simplified HTML structure for better mobile display
        modal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Create Your Account</h2>
                
                <form id="accountSetupForm">
                    <div class="input-fields">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" required 
                                   placeholder="Choose a unique username">
                        </div>
                        
                        <div class="form-group gender-selection">
                            <label>Gender</label>
                            <div class="gender-options">
                                <label class="gender-option" for="gender-male">
                                    <input type="radio" id="gender-male" name="gender" value="male" checked>
                                    <div class="gender-icon male">
                                        <i class="fa-solid fa-mars"></i>
                                    </div>
                                </label>
                                <label class="gender-option" for="gender-female">
                                    <input type="radio" id="gender-female" name="gender" value="female">
                                    <div class="gender-icon female">
                                        <i class="fa-solid fa-venus"></i>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions compact-buttons">
                        <button type="submit" style="color: white;">Continue</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for form submission
        document.getElementById('accountSetupForm').onsubmit = (e) => {
            e.preventDefault();
            console.log("Account info form submitted");
            this.handleAccountInfoSubmit(e.target);
        };
    }
    
    showAvatarSetup() {
        console.log("Showing avatar setup form");
        
        // First, let's remove the previous modal
        const previousModal = document.getElementById('accountSetupModal');
        if (previousModal) {
            previousModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-wrapper';
        modal.id = 'avatarSetupModal';
        modal.style.zIndex = "100000";
        modal.style.display = "flex";
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
        
        // Keep the blur effect
        document.body.classList.add('initial-setup-active');
        
        // Compact layout for avatar selection
        modal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Choose Your Avatar</h2>
                
                <form id="avatarSetupForm">
                    <div class="avatar-section">
                        <div class="avatar-grid" id="avatarGrid">
                            <!-- Avatars will be added here by JavaScript -->
                        </div>
                        <input type="hidden" id="selectedAvatar" name="avatar" value="${this.avatarOptions[0].path}">
                        <input type="hidden" id="selectedAvatarId" name="avatarId" value="avatar_01">
                    </div>
                    
                    <div class="form-actions compact-buttons">
                        <button type="button" id="backBtn" style="color: #333; background-color: var(--btn-secondary);">Back</button>
                        <button type="submit" style="color: white;">Create</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup avatar grid
        this.setupAvatarGrid();
        
        // Add event listener for back button
        document.getElementById('backBtn').addEventListener('click', () => {
            modal.remove();
            this.showAccountSetup();
        });
        
        // Add event listener for form submission
        document.getElementById('avatarSetupForm').onsubmit = (e) => {
            e.preventDefault();
            console.log("Avatar setup form submitted");
            this.handleAvatarSetupSubmit(e.target);
        };
    }
    
    setupAvatarGrid() {
        const avatarGrid = document.getElementById('avatarGrid');
        if (!avatarGrid) {
            console.error("Avatar grid element not found");
            return;
        }
        
        console.log("Setting up avatar grid");
        AVATARS.forEach((avatar, index) => {
            const avatarElement = document.createElement('div');
            avatarElement.className = 'avatar-option';
            avatarElement.innerHTML = `<img src="${avatar.path}" alt="${avatar.alt}">`;
            
            // Select the first avatar by default
            if (index === 0) {
                avatarElement.classList.add('selected');
            }
            
            avatarElement.onclick = () => {
                // Remove selected class from all avatars
                document.querySelectorAll('#avatarGrid .avatar-option').forEach(avatar => {
                    avatar.classList.remove('selected');
                });
                
                // Add selected class to clicked avatar
                avatarElement.classList.add('selected');
                
                // Store both the path and avatarId
                document.getElementById('selectedAvatar').value = avatar.path;
                document.getElementById('selectedAvatarId').value = avatar.id;
            };
            
            avatarGrid.appendChild(avatarElement);
        });
    }
    
    // Step 1: Handle account info submission (username, gender)
    handleAccountInfoSubmit(form) {
        try {
            console.log("Handling account info submission");
            const formData = new FormData(form);
            
            // Validate form data
            const username = formData.get('username');
            const gender = formData.get('gender');
            
            if (!username) {
                throw new Error('Please enter a username');
            }
            
            // Store the data temporarily
            this.tempProfileData = {
                type: 'account',
                username: username,
                gender: gender,
                createdAt: new Date().toISOString(),
                gamesPlayed: 0,
                bestLevel: 1
            };
            
            // Show avatar setup screen
            this.showAvatarSetup();
            
        } catch (error) {
            console.error("Account info submission error:", error);
            alert(error.message || 'Error creating account. Please try again.');
        }
    }

    // Step 2: Handle avatar setup submission
    handleAvatarSetupSubmit(form) {
        try {
            console.log("Handling avatar setup submission");
            const formData = new FormData(form);
            
            // Get avatar data
            const avatarPath = formData.get('avatar') || this.avatarOptions[0].path;
            const avatarId = formData.get('avatarId') || getAvatarIdByPath(avatarPath);
            
            // Complete the profile data
            const profileData = {
                ...this.tempProfileData,
                picture: avatarPath,
                avatarId: avatarId
            };
            
            // Save profile locally
            if (this.userProfile.saveProfile(profileData)) {
                console.log("Account profile saved successfully:", profileData);
                
                // Initialize the profile UI to update the side menu
                const profileUI = new UserProfileUI();
                profileUI.initProfileSection();
                
                // Close the modal
                document.getElementById('avatarSetupModal').remove();
                
                // Remove the blur class
                document.body.classList.remove('initial-setup-active');
                
                this.handleProfileCreationComplete();
                
                // Register with server without blocking UI
                this.registerWithServer(profileData);
                
                // Dispatch a custom event that our menu-reinit script can listen for
                window.dispatchEvent(new CustomEvent('profileCreationComplete'));
                
                // Start the game directly without reload
                if (window.GameLogic) {
                    setTimeout(() => {
                        if (typeof window.reinitializeMenu === 'function') {
                            window.reinitializeMenu();
                        }
                        window.GameLogic.showStartGamePrompt();
                    }, 100);
                }
                
                return true;
            } else {
                console.error("Failed to save account profile");
                throw new Error('Failed to save account profile. Please try again.');
            }
        } catch (error) {
            console.error("Avatar setup error:", error);
            alert(error.message || 'Error creating account. Please try again.');
        }
    }
    
    // New method to handle server registration without blocking UI
    registerWithServer(profileData) {
        import('./api/apiService.js').then(module => {
            const apiService = module.apiService;
            
            // Create a unique email-like identifier and password for backend auth
            // This avoids asking the user for an email/password but still works with the backend
            const tempEmail = `user_${profileData.username}_${Date.now()}@numberguess.game`;
            const tempPassword = `pwd_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            
            // Register with server
            apiService.register({
                username: profileData.username,
                email: tempEmail,
                password: tempPassword,
                profilePicture: profileData.picture
            }).then(response => {
                console.log("Profile successfully registered with server");
                
                // Save the token for future API calls
                if (response && response.token) {
                    apiService.setToken(response.token);
                    
                    // Update the profile to mark it as synced with server
                    const profile = this.userProfile.getProfile();
                    if (profile) {
                        profile.syncedWithServer = true;
                        this.userProfile.saveProfile(profile);
                    }
                }
            }).catch(error => {
                console.warn("Server registration failed:", error);
                // If username is taken, we could auto-rename, but that might confuse users
                // For now, we'll just log the error and continue with local data
            });
        }).catch(error => {
            console.warn("Failed to load API service:", error);
        });
    }
    
    initProfileInSideMenu(profileData) {
        // This function ensures the profile section is visible in the side menu
        try {
            // Add the profile section to the side menu
            const sideMenu = document.querySelector('.side-menu');
            if (!sideMenu) return;
            
            // Find the side menu content
            const sideMenuContent = sideMenu.querySelector('.side-menu-content');
            if (!sideMenuContent) return;
            
            // Create profile section HTML
            const profileSectionHTML = `
                <div class="profile-section">
                    <div class="profile-picture-container">
                        <div class="profile-picture" id="profilePicDisplay">
                            <img src="${profileData.picture || 'assets/icons/default-profile.png'}" alt="Profile Picture">
                        </div>
                    </div>
                    <div class="profile-header">
                        <div class="profile-info">
                            <h3 id="profileName">${profileData.username || 'Player'}</h3>
                            <p id="profileAge">
                                <span>ID: ${profileData.username || 'Anonymous'}</span>
                            </p>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-label">Games Played</span>
                            <span class="stat-value" id="gamesPlayed">${profileData.gamesPlayed || 0}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Best Level</span>
                            <span class="stat-value" id="bestLevel">${profileData.bestLevel || 1}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert profile section at the beginning of side menu content
            sideMenuContent.insertAdjacentHTML('afterbegin', profileSectionHTML);
            
            console.log("Profile section added to side menu");
        } catch (error) {
            console.error("Error initializing profile in side menu:", error);
        }
    }

    handleProfileCreationComplete() {
        console.log("Profile creation completed");
        window.initialProfileSetupActive = false;
        
        // Properly reinitialize side menu functionality
        setTimeout(() => {
            console.log("Reinitializing side menu after profile creation");
            
            // Call all menu fix functions to ensure proper functionality
            if (window.fixSideMenu && typeof window.fixSideMenu === 'function') {
                window.fixSideMenu();
            }
            
            // Call global menu fix function if available
            if (window.globalMenuFix && typeof window.globalMenuFix === 'function') {
                window.globalMenuFix();
            }
            
            // Fix settings buttons specifically
            if (window.fixSettingsButtons && typeof window.fixSettingsButtons === 'function') {
                window.fixSettingsButtons();
            }
            
            // Force menu button fix
            if (window.fixMenuToggle && typeof window.fixMenuToggle === 'function') {
                window.fixMenuToggle();
            }
        }, 500);
    }
}

// Initialize on page load with direct function calls
console.log("Initial Profile Setup module loaded");

// Make sure this runs before anything else
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded - initializing profile setup immediately");
    const setupUi = new InitialProfileSetup();
    setupUi.init();
    window.profileSetupInitialized = true;
    
    // Also initialize the profile UI to ensure the side menu is updated
    setTimeout(() => {
        const profileUI = new UserProfileUI();
        profileUI.initProfileSection();
    }, 500);
});
