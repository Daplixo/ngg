/**
 * Initial Profile Setup
 * Handles the first-time user profile setup experience with Account and Guest options
 */

import { UserProfile } from './userProfile.js';
import { UserProfileUI } from './userProfileUI.js';

// Set a global flag to indicate initialProfileSetup is active
window.initialProfileSetupActive = true;

export class InitialProfileSetup {
    constructor() {
        this.userProfile = new UserProfile();
        this.avatarOptions = [
            'assets/avatars/avatar1.png',
            'assets/avatars/avatar2.png',
            'assets/avatars/avatar3.png',
            'assets/avatars/avatar4.png',
            'assets/avatars/avatar5.png',
            'assets/avatars/avatar6.png'
        ];
    }

    init() {
        console.log("InitialProfileSetup init called");
        // Check if user already has a profile
        if (this.userProfile.hasProfile()) {
            console.log("Profile already exists, skipping initial setup");
            return false;
        }

        console.log("No profile found, showing initial choice screen");
        // Show the initial choice screen
        this.showChoiceScreen();
        return true;
    }

    showChoiceScreen() {
        console.log("Showing choice screen");
        
        // Create the initial choice modal
        const modal = document.createElement('div');
        modal.className = 'modal-wrapper';
        modal.id = 'initialChoiceModal';
        modal.style.zIndex = "100000";
        modal.style.display = "flex";
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
        
        modal.innerHTML = `
            <div class="modal-content profile-choice">
                <h2>Welcome to Number Guessing Game!</h2>
                <p>Choose how you'd like to play:</p>
                
                <div class="choice-buttons">
                    <button id="createAccountBtn" class="choice-btn account-btn">Create an Account</button>
                    <button id="guestModeBtn" class="choice-btn guest-btn">Play as Guest</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add direct onclick handlers for better compatibility
        document.getElementById('createAccountBtn').onclick = () => {
            console.log("Create Account button clicked");
            modal.remove();
            this.showAccountSetup(); // Show account setup form
        };
        
        document.getElementById('guestModeBtn').onclick = () => {
            console.log("Guest button clicked");
            modal.remove();
            this.showGuestSetup(); // Show guest setup form
        };
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
                        
                        <div class="form-group">
                            <label for="nickname">Nickname</label>
                            <input type="text" id="nickname" name="nickname" required 
                                   placeholder="How others will see you">
                        </div>
                    </div>
                    
                    <div class="avatar-section">
                        <label>Choose an Avatar</label>
                        <div class="avatar-grid" id="avatarGrid">
                            <!-- Avatars will be added here by JavaScript -->
                        </div>
                        <input type="hidden" id="selectedAvatar" name="avatar" value="${this.avatarOptions[0]}">
                    </div>
                    
                    <div class="form-actions compact-buttons">
                        <button type="button" id="backToChoiceBtn" style="color: #333;">Back</button>
                        <button type="submit" style="color: white;">Create</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add avatars to the grid
        this.setupAvatarGrid();
        
        // Add event listeners
        document.getElementById('backToChoiceBtn').onclick = () => {
            console.log("Back button clicked");
            modal.remove();
            this.showChoiceScreen();
        };
        
        document.getElementById('accountSetupForm').onsubmit = (e) => {
            e.preventDefault();
            console.log("Account form submitted");
            this.handleAccountSetup(e.target);
        };
    }
    
    showGuestSetup() {
        console.log("Showing guest setup form");
        
        const modal = document.createElement('div');
        modal.className = 'modal-wrapper';
        modal.id = 'guestSetupModal';
        modal.style.zIndex = "100000";
        modal.style.display = "flex";
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
        
        modal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Play as Guest</h2>
                
                <form id="guestSetupForm">
                    <div class="input-fields">
                        <div class="form-group">
                            <label for="guestNickname">Nickname</label>
                            <input type="text" id="guestNickname" name="nickname" required 
                                   placeholder="What should we call you?">
                        </div>
                    </div>
                    
                    <div class="form-actions compact-buttons">
                        <button type="button" id="guestBackBtn" style="color: #333;">Back</button>
                        <button type="submit" style="color: white;">Start</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('guestBackBtn').onclick = () => {
            console.log("Guest back button clicked");
            modal.remove();
            this.showChoiceScreen();
        };
        
        document.getElementById('guestSetupForm').onsubmit = (e) => {
            e.preventDefault();
            console.log("Guest form submitted");
            this.handleGuestSetup(e.target);
        };
    }
    
    setupAvatarGrid() {
        const avatarGrid = document.getElementById('avatarGrid');
        if (!avatarGrid) {
            console.error("Avatar grid element not found");
            return;
        }
        
        console.log("Setting up avatar grid");
        this.avatarOptions.forEach((avatarSrc, index) => {
            const avatarElement = document.createElement('div');
            avatarElement.className = 'avatar-option';
            avatarElement.innerHTML = `<img src="${avatarSrc}" alt="Avatar ${index + 1}">`;
            
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
                document.getElementById('selectedAvatar').value = avatarSrc;
            };
            
            avatarGrid.appendChild(avatarElement);
        });
    }
    
    // Modified handleAccountSetup method to update the profile in the side menu
    handleAccountSetup(form) {
        try {
            console.log("Handling account setup");
            const formData = new FormData(form);
            
            // Validate form data
            const username = formData.get('username');
            const nickname = formData.get('nickname');
            const avatar = formData.get('avatar') || this.avatarOptions[0];
            
            if (!username || username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }
            
            if (!nickname) {
                throw new Error('Please enter a nickname');
            }
            
            // Create profile data
            const profileData = {
                type: 'account',
                name: username,
                nickname: nickname,
                picture: avatar,
                createdAt: new Date().toISOString(),
                gamesPlayed: 0,
                bestLevel: 1
            };
            
            // Save profile locally
            if (this.userProfile.saveProfile(profileData)) {
                console.log("Profile saved successfully:", profileData);
                
                // Initialize the profile UI to update the side menu
                const profileUI = new UserProfileUI();
                profileUI.initProfileSection();
                
                alert('Account created successfully! Welcome, ' + nickname + '!');
                
                // Close the modal and reload to start the game
                document.getElementById('accountSetupModal').remove();
                location.reload();
            } else {
                console.error("Failed to save profile");
                throw new Error('Failed to save profile. Please try again.');
            }
        } catch (error) {
            console.error("Account setup error:", error);
            alert(error.message || 'Error creating account. Please try again.');
        }
    }
    
    // Modified handleGuestSetup method to update the profile in the side menu
    handleGuestSetup(form) {
        try {
            console.log("Handling guest setup");
            const formData = new FormData(form);
            
            // Validate form data
            const nickname = formData.get('nickname');
            const avatar = formData.get('avatar') || this.avatarOptions[0];
            
            if (!nickname) {
                throw new Error('Please enter a nickname');
            }
            
            // Create profile data
            const profileData = {
                type: 'guest',
                name: 'guest_' + Date.now(),
                nickname: nickname,
                picture: avatar,
                createdAt: new Date().toISOString(),
                gamesPlayed: 0,
                bestLevel: 1
            };
            
            // Save profile locally
            if (this.userProfile.saveProfile(profileData)) {
                console.log("Guest profile saved successfully:", profileData);
                
                // Initialize the profile UI to update the side menu
                const profileUI = new UserProfileUI();
                profileUI.initProfileSection();
                
                // Close the modal
                document.getElementById('guestSetupModal').remove();
                
                // Reload the page to start the game with the new profile
                location.reload();
            } else {
                console.error("Failed to save guest profile");
                throw new Error('Failed to save guest profile. Please try again.');
            }
        } catch (error) {
            console.error("Guest setup error:", error);
            alert(error.message || 'Error setting up guest profile. Please try again.');
        }
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
                            <h3 id="profileName">${profileData.nickname || 'Player'}</h3>
                            <p id="profileAge">
                                <span>ID: ${profileData.name || 'Anonymous'}</span>
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
