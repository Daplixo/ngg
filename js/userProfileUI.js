import { UserProfile } from './userProfile.js';
import { apiService } from './api/apiService.js';
import { getAvatarIdByPath } from './config/avatarConfig.js';

export class UserProfileUI {
    constructor() {
        this.userProfile = new UserProfile();
        this.api = apiService;
        this.setupModalHTML = `
            <div id="profileSetupModal" class="modal-wrapper">
                <div class="modal-content profile-setup">
                    <h2>Player Profile</h2>
                    <form id="profileSetupForm">
                        <div class="form-group">
                            <label for="profileNickname">Nickname</label>
                            <input type="text" id="profileNickname" name="nickname" required 
                                   minlength="2" maxlength="20" placeholder="Enter your nickname">
                        </div>
                        <div class="form-group">
                            <label for="profileName">Username</label>
                            <input type="text" id="profileName" name="name" required 
                                   minlength="2" maxlength="20" placeholder="Enter a unique username">
                        </div>
                        <div class="form-group">
                            <label for="profilePicture">Profile Picture (Optional)</label>
                            <input type="file" id="profilePicture" name="picture" 
                                   accept="image/*">
                            <div id="picturePreview" class="picture-preview"></div>
                            <input type="hidden" id="avatarId" name="avatarId" value="avatar_01">
                        </div>
                        <button type="submit" class="submit-btn">Start Playing</button>
                    </form>
                </div>
            </div>`;
        this.sideMenuProfileHTML = `
            <div class="profile-section">
                <div class="profile-picture-container">
                    <div class="profile-picture" id="profilePicDisplay">
                        <img src="assets/icons/default-profile.png" alt="Profile Picture">
                    </div>
                </div>
                <div class="profile-header">
                    <div class="profile-info">
                        <h3 id="profileName">Guest</h3>
                        <p id="profileAge">
                            <span>Age: -</span>
                        </p>
                    </div>
                    <button id="editProfileBtn" class="edit-profile-btn" aria-label="Edit profile">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-label">Games Played</span>
                        <span class="stat-value" id="gamesPlayed">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Best Level</span>
                        <span class="stat-value" id="bestLevel">1</span>
                    </div>
                </div>
            </div>`;
        
        // Listen for modal closed events to refresh profile display
        document.addEventListener('modalClosed', (event) => {
            // Check if it was an edit profile modal
            if (event.detail.id && 
                (event.detail.id.includes('editProfileModal') || 
                 event.detail.classes.includes('edit-profile-modal'))) {
                console.log('Edit profile modal closed, refreshing profile display');
                this.updateProfileDisplay();
                
                // Also update any stats that might be displayed in game UI
                if (window.profileUpdateManager) {
                    window.profileUpdateManager.refreshProfileStats();
                }
            }
        });
    }

    async init() {
        console.log("UserProfileUI initializing...");
        
        // CRITICAL FIX: Add error handling to prevent blocking
        try {
            // Always initialize the profile section in the side menu, even with initialProfileSetup
            this.initProfileSection();
            this.setupEventListeners();
            
            // Check if we need to show profile setup
            if (!window.profileSetupInitialized && !this.userProfile.hasProfile()) {
                console.log("No profile found, showing setup...");
                await this.showProfileSetup().catch(err => {
                    console.error("Error showing profile setup:", err);
                });
            } else {
                console.log("Profile found or handled by initialProfileSetup:", this.userProfile.getProfile());
            }
            
            // CRITICAL FIX: Don't block if server connection fails
            const serverProfilePromise = new Promise(async (resolve) => {
                try {
                    // Only try to fetch server profile if we have a token and API is available
                    if (this.api.token && !this.api.offlineMode) {
                        console.log("Fetching server profile...");
                        const serverProfile = await this.api.getUserProfile();
                        if (serverProfile) {
                            console.log("Server profile found, merging...");
                            const localProfile = this.userProfile.getProfile();
                            const mergedProfile = {
                                ...localProfile,
                                nickname: serverProfile.nickname,
                                name: serverProfile.username,
                                picture: serverProfile.profilePicture || localProfile?.picture,
                                gamesPlayed: serverProfile.stats.gamesPlayed,
                                bestLevel: serverProfile.stats.bestLevel,
                                syncedWithServer: true,
                                serverId: serverProfile._id
                            };
                            this.userProfile.saveProfile(mergedProfile);
                            this.updateProfileDisplay();
                        }
                    }
                    resolve();
                } catch (error) {
                    console.warn('Could not fetch server profile:', error);
                    if (error.message && error.message.includes('Token is not valid')) {
                        this.api.setToken(null);
                    }
                    
                    // Force offline mode to prevent future blocking attempts
                    if (this.api.toggleOfflineMode) {
                        this.api.toggleOfflineMode(true);
                    }
                    
                    resolve();
                }
            });
            
            // CRITICAL FIX: Set a timeout to prevent blocking even if the server is down
            // Fix bug: serverProfilePromise.resolve is not a function
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            
            // Wait for server profile but don't block initialization for too long
            await Promise.race([
                serverProfilePromise,
                timeoutPromise // 2-second timeout
            ]);
        } catch (e) {
            console.error("Error during profile initialization:", e);
        }
        
        console.log("UserProfileUI initialization complete");
        return true;
    }

    showProfileSetup() {
        console.log("Showing profile setup modal");
        return new Promise((resolve) => {
            // Remove any existing modal
            const existingModal = document.getElementById('profileSetupModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            document.body.insertAdjacentHTML('beforeend', this.setupModalHTML);
            const modal = document.getElementById('profileSetupModal');
            modal.classList.add('active');

            const form = modal.querySelector('#profileSetupForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const success = await this.handleProfileSubmit(e.target);
                if (success) {
                    modal.remove();
                    resolve();
                }
            });

            // Add server sync option
            const modalContent = document.querySelector('.modal-content.profile-setup');
            if (modalContent) {
                const submitBtn = modalContent.querySelector('.submit-btn');
                if (submitBtn) {
                    const serverSyncDiv = document.createElement('div');
                    serverSyncDiv.className = 'server-sync-option';
                    serverSyncDiv.innerHTML = `
                        <label for="syncWithServer">
                            <input type="checkbox" id="syncWithServer" name="syncWithServer">
                            Save profile on server (enables leaderboards)
                        </label>
                        <div class="sync-fields" style="display: none;">
                            <div class="form-group">
                                <label for="profileEmail">Email</label>
                                <input type="email" id="profileEmail" name="email" placeholder="Enter your email">
                            </div>
                            <div class="form-group">
                                <label for="profilePassword">Password</label>
                                <input type="password" id="profilePassword" name="password" placeholder="Create a password">
                            </div>
                        </div>
                    `;
                    
                    submitBtn.parentNode.insertBefore(serverSyncDiv, submitBtn);
                    
                    const syncCheckbox = document.getElementById('syncWithServer');
                    const syncFields = document.querySelector('.sync-fields');
                    
                    syncCheckbox.addEventListener('change', function() {
                        syncFields.style.display = this.checked ? 'block' : 'none';
                    });
                }
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'profileSetupForm') {
                e.preventDefault();
                this.handleProfileSubmit(e.target);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'profilePicture') {
                this.handlePictureUpload(e);
            }
        });
    }

    async handleProfileSubmit(form) {
        try {
            const formData = new FormData(form);
            const preview = document.getElementById('picturePreview');
            const profileData = {
                nickname: formData.get('nickname'),
                username: formData.get('name'), // Store form name as username
                picture: preview?.dataset?.image || null,
                avatarId: formData.get('avatarId') || 'avatar_01',
                createdAt: new Date().toISOString(),
                gamesPlayed: 0,
                bestLevel: 1
            };

            // If picture is from an avatar, extract avatarId from path
            if (profileData.picture && !profileData.avatarId) {
                profileData.avatarId = getAvatarIdByPath(profileData.picture);
            }

            // Check if username already exists
            try {
                const exists = await this.api.checkUsernameExists(profileData.username);
                if (exists) {
                    throw new Error('Username already taken. Please choose another.');
                }
            } catch (error) {
                if (error.message === 'Username already taken. Please choose another.') {
                    throw error; // Pass through username conflict error
                }
                // If it's a connection error, continue with local profile creation
                console.warn('Username check failed:', error);
            }

            this.userProfile.validateProfile(profileData);
            this.userProfile.saveProfile(profileData);

            const syncWithServer = formData.get('syncWithServer');
            if (syncWithServer) {
                try {
                    const result = await this.api.register({
                        username: profileData.username,
                        nickname: profileData.nickname,
                        avatarId: profileData.avatarId,
                        profilePicture: profileData.picture
                    });
                    
                    if (result && result.token) {
                        profileData.syncedWithServer = true;
                        this.userProfile.saveProfile(profileData);
                        
                        alert('Profile created and synced with server!');
                    }
                } catch (error) {
                    if (error.status === 409) {
                        throw new Error('Username already taken. Please choose another.');
                    }
                    alert(`Server sync failed: ${error.message}. Profile saved locally only.`);
                }
            }

            this.updateProfileDisplay();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    handlePictureUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5242880) {
                alert('Image file is too large. Please choose an image under 5MB.');
                return;
            }
            
            const reader = new FileReader();
            const inputId = event.target.id;
            const previewId = inputId === 'profilePicture' ? 'picturePreview' : 'editPicturePreview';
            
            reader.onload = (e) => {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    preview.dataset.image = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    initProfileSection() {
        console.log("Initializing profile section in side menu");
        const sideMenu = document.querySelector('.side-menu');
        if (!sideMenu) {
            console.error("Side menu not found in DOM!");
            return false;
        }
        
        try {
            // Remove existing profile if any
            const existingProfile = sideMenu.querySelector('.profile-section');
            if (existingProfile) {
                existingProfile.remove();
            }
            
            // Find the side menu content
            let sideMenuContent = sideMenu.querySelector('.side-menu-content');
            if (!sideMenuContent) {
                console.warn("Side menu content not found, creating...");
                sideMenuContent = document.createElement('div');
                sideMenuContent.className = 'side-menu-content';
                sideMenu.appendChild(sideMenuContent);
            }
            
            // Insert profile at the beginning of the side menu content
            // CRITICAL FIX: Use innerHTML instead of insertAdjacentHTML to ensure replacement
            const currentContent = sideMenuContent.innerHTML;
            sideMenuContent.innerHTML = this.sideMenuProfileHTML + currentContent;
            
            this.updateProfileDisplay();
            this.setupProfileEvents();
            console.log("Profile section initialized");
            return true;
        } catch (error) {
            console.error("Error initializing profile section:", error);
            return false;
        }
    }

    updateProfileDisplay() {
        console.log("Updating profile display");
        try {
            const profile = this.userProfile.getProfile();
            if (!profile) {
                console.warn("No profile found to display");
                return;
            }

            // CRITICAL FIX: Make sure these elements exist before setting their content
            const nameElement = document.getElementById('profileName');
            const ageElement = document.querySelector('#profileAge span');
            const picElement = document.querySelector('#profilePicDisplay img');
            
            if (nameElement) {
                nameElement.textContent = profile.nickname || profile.name || 'Guest';
            }
            
            if (ageElement) {
                ageElement.textContent = `ID: ${profile.name || 'Anonymous'}`;
            }
            
            if (picElement) {
                // Use the avatarId to determine the picture path
                if (profile.avatarId) {
                    // Import getAvatarPathById dynamically to avoid circular dependencies
                    import('./config/avatarConfig.js').then(module => {
                        picElement.src = module.getAvatarPathById(profile.avatarId);
                    }).catch(() => {
                        picElement.src = profile.picture || 'assets/icons/default-profile.png';
                    });
                } else {
                    picElement.src = profile.picture || 'assets/icons/default-profile.png';
                }
                
                picElement.onerror = function() {
                    this.src = 'assets/icons/default-profile.png';
                };
            }

            // Update stats with subtle animation
            const statsElements = {
                gamesPlayed: document.getElementById('gamesPlayed'),
                bestLevel: document.getElementById('bestLevel')
            };

            Object.entries(statsElements).forEach(([key, element]) => {
                if (element) {
                    const value = profile[key] || (key === 'bestLevel' ? 1 : 0);
                    
                    element.textContent = value;
                }
            });
            
            console.log("Profile display updated");
        } catch (error) {
            console.error("Error updating profile display:", error);
        }
    }

    setupProfileEvents() {
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditProfile());
        } else {
            console.warn("Edit profile button not found");
        }
        // Server sync button has been removed
    }

    showEditProfile() {
        const profile = this.userProfile.getProfile();
        const isGuestAccount = profile.type === 'guest';
        
        // Clean up any existing edit modals first to prevent duplicates
        if (window.modalManager) {
            window.modalManager.cleanupModals('edit-profile-modal');
        }
        
        // Generate a unique ID for this modal instance
        const modalId = 'editProfileModal_' + Date.now();
        
        const editModal = document.createElement('div');
        editModal.className = 'modal-wrapper edit-profile-modal';
        editModal.id = modalId;
        editModal.style.zIndex = "100000";
        
        editModal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Edit Profile</h2>
                
                <form id="editProfileForm_${modalId}" class="edit-profile-form">
                    <div class="input-fields">
                        <div class="form-group">
                            <label for="editNickname_${modalId}">Nickname</label>
                            <input type="text" id="editNickname_${modalId}" name="nickname" value="${profile?.nickname || ''}" required 
                                   placeholder="How others will see you">
                        </div>
                        
                        ${!isGuestAccount ? `
                        <div class="form-group">
                            <label for="editUsername_${modalId}">Username</label>
                            <input type="text" id="editUsername_${modalId}" name="name" value="${profile?.name || ''}" required 
                                   placeholder="Your unique username">
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="avatar-section">
                        <label>Avatar</label>
                        <div class="avatar-grid" id="editAvatarGrid_${modalId}">
                            <!-- Avatars will be added here by JavaScript -->
                        </div>
                        <input type="hidden" id="editSelectedAvatar_${modalId}" name="avatar" value="${profile?.picture || ''}">
                        <input type="hidden" id="editSelectedAvatarId_${modalId}" name="avatarId" value="${profile?.avatarId || 'avatar_01'}">
                    </div>
                    
                    <div class="form-actions compact-buttons">
                        <button type="button" id="editCancelBtn_${modalId}" class="cancel-btn" style="color: #333;">Cancel</button>
                        <button type="submit" class="submit-btn" style="color: white;">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(editModal);
        
        // Setup avatar grid with the unique ID
        this.setupEditAvatarGrid(profile?.avatarId, modalId);
        
        // Setup event listeners with reference to this modal instance
        this.setupEditProfileEvents(editModal, modalId);
        
        // Show the modal using the modal manager
        if (window.modalManager) {
            window.modalManager.showModal(editModal);
        } else {
            // Fallback if modal manager is not available
            editModal.style.display = "flex";
            editModal.style.visibility = "visible";
            editModal.style.opacity = "1";
            editModal.classList.add('active');
            window.isModalOpen = true;
        }
    }

    setupEditAvatarGrid(currentAvatarId = 'avatar_01', modalId) {
        const uniqueId = modalId || '';
        const gridId = uniqueId ? `editAvatarGrid_${uniqueId}` : 'editAvatarGrid';
        
        import('./config/avatarConfig.js').then(module => {
            const AVATARS = module.default;
            const avatarGrid = document.getElementById(gridId);
            
            if (!avatarGrid) {
                console.error("Avatar grid element not found:", gridId);
                return;
            }
            
            console.log(`Setting up avatar grid for edit profile: ${gridId}`);
            
            // Clear any existing content first
            avatarGrid.innerHTML = '';
            
            AVATARS.forEach((avatar) => {
                const avatarElement = document.createElement('div');
                avatarElement.className = 'avatar-option';
                avatarElement.innerHTML = `<img src="${avatar.path}" alt="${avatar.alt}">`;
                
                // Select the current avatar
                if (avatar.id === currentAvatarId) {
                    avatarElement.classList.add('selected');
                }
                
                avatarElement.onclick = () => {
                    // Remove selected class from all avatars in this specific grid
                    document.querySelectorAll(`#${gridId} .avatar-option`).forEach(av => {
                        av.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked avatar
                    avatarElement.classList.add('selected');
                    
                    // Store both the path and avatarId in the correct form fields with unique IDs
                    const avatarInput = document.getElementById(`editSelectedAvatar_${uniqueId}`) || 
                                       document.getElementById('editSelectedAvatar');
                    const avatarIdInput = document.getElementById(`editSelectedAvatarId_${uniqueId}`) || 
                                         document.getElementById('editSelectedAvatarId');
                    
                    if (avatarInput) avatarInput.value = avatar.path;
                    if (avatarIdInput) avatarIdInput.value = avatar.id;
                };
                
                avatarGrid.appendChild(avatarElement);
            });
        }).catch(error => {
            console.error("Failed to load avatar configuration:", error);
        });
    }

    setupEditProfileEvents(modal, modalId) {
        const uniqueId = modalId || modal.id || '';
        const formId = uniqueId ? `editProfileForm_${uniqueId}` : 'editProfileForm';
        const cancelBtnId = uniqueId ? `editCancelBtn_${uniqueId}` : 'editCancelBtn';
        
        const form = modal.querySelector(`#${formId}`) || modal.querySelector('.edit-profile-form');
        
        // Handle Cancel button
        const cancelBtn = document.getElementById(cancelBtnId) || 
                          modal.querySelector('.cancel-btn');
                          
        if (cancelBtn) {
            // Remove any existing event listeners first
            cancelBtn.removeEventListener('click', cancelBtn._clickHandler);
            
            // Create a new click handler
            cancelBtn._clickHandler = () => {
                if (window.modalManager) {
                    window.modalManager.closeAndRemoveModal(modal);
                } else {
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }
            };
            
            // Add the new event listener
            cancelBtn.addEventListener('click', cancelBtn._clickHandler);
        }

        // Handle form submission
        if (form) {
            // Remove any existing event listeners first
            form.removeEventListener('submit', form._submitHandler);
            
            // Create a new submit handler
            form._submitHandler = (e) => {
                e.preventDefault();
                this.handleProfileEdit(form);
                
                if (window.modalManager) {
                    window.modalManager.closeAndRemoveModal(modal);
                } else {
                    if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }
            };
            
            // Add the new event listener
            form.addEventListener('submit', form._submitHandler);
        }
    }
    
    handleProfileEdit(form) {
        const formData = new FormData(form);
        const currentProfile = this.userProfile.getProfile();
        
        const updatedProfile = {
            ...currentProfile,
            nickname: formData.get('nickname'),
            picture: formData.get('avatar'),
            avatarId: formData.get('avatarId')
        };
        
        // Only update username for non-guest profiles
        if (currentProfile.type !== 'guest') {
            updatedProfile.name = formData.get('name');
        }

        try {
            this.userProfile.validateProfile(updatedProfile);
            this.userProfile.saveProfile(updatedProfile);
            
            // Sync changes with server if this is a non-guest profile
            if (updatedProfile.type === 'account') {
                this.syncProfileWithServer(updatedProfile);
            }
            
            // This triggers an immediate update but we'll also refresh when the modal closes
            this.updateProfileDisplay();
            
            console.log("Profile updated successfully:", updatedProfile.nickname);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.message || 'Failed to update profile');
        }
    }

    // New method to sync profile changes with server
    syncProfileWithServer(profile) {
        if (!this.api.offlineMode && profile.username) {
            console.log("Syncing profile changes with server");
            this.api.updateProfile({
                nickname: profile.nickname,
                username: profile.username,
                profilePicture: profile.picture
            }).catch(error => {
                console.warn("Failed to sync profile with server:", error);
            });
        } else if (!profile.username) {
            console.error("❌ Cannot sync profile with server: Missing username");
        }
    }

    // We'll keep the showServerAccountOptions method to avoid breaking existing code,
    // but we won't call it anywhere
    showServerAccountOptions() {
        console.log("Server account options disabled");
        // Method kept for compatibility but functionality disabled
    }
}
