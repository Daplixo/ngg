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
                            <label for="profileUsername">Username</label>
                            <input type="text" id="profileUsername" name="username" required 
                                   minlength="2" maxlength="20" placeholder="Choose a unique username">
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
                            <span>ID: Anonymous</span>
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
                                username: serverProfile.username,
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
                username: formData.get('username'),
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
            
            // Add a slight delay and try again to make 100% sure the events are attached
            setTimeout(() => {
                console.log("Re-attaching profile events after delay");
                this.setupProfileEvents();
                
                // Add DIRECT click handler as a last resort
                const profilePic = document.querySelector("#profilePicDisplay");
                if (profilePic) {
                    const self = this;
                    profilePic.addEventListener('click', function() {
                        console.log("Emergency click handler triggered");
                        self.showAvatarEditProfile();
                    });
                }
            }, 200);
            
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
                // Use gender-specific nicknames: "Fuse" for male, "Iris" for female
                let displayName = 'Guest';
                if (profile.gender === 'male') {
                    displayName = 'Fuse';
                } else if (profile.gender === 'female') {
                    displayName = 'Iris';
                }
                nameElement.textContent = displayName;
            }
            
            if (ageElement) {
                const genderIcon = profile.gender === 'male' ? '♂️' : profile.gender === 'female' ? '♀️' : '⚧️';
                ageElement.textContent = `${genderIcon} ID: ${profile.username || 'Anonymous'}`;
            }
            
            if (picElement) {
                // FIX: Set a default image immediately to avoid white/empty image
                picElement.src = 'assets/icons/default-profile.png';
                
                // Use direct path instead of relying on dynamic import which might fail
                if (profile.picture) {
                    picElement.src = profile.picture;
                } else if (profile.avatarId) {
                    // If we have an avatarId but no picture, construct the path directly
                    const avatarNumber = profile.avatarId.split('_')[1];
                    if (avatarNumber) {
                        picElement.src = `assets/avatars/avatar${avatarNumber}.png`;
                    }
                }
                
                // Still keep error handler as fallback
                picElement.onerror = function() {
                    console.log('Profile image failed to load, using default icon');
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
            
            // Refresh profile events to ensure click handling works
            this.refreshProfileEvents();
        } catch (error) {
            console.error("Error updating profile display:", error);
        }
    }

    setupProfileEvents() {
        // Find the edit button and attach event listener
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            // Remove any existing event listeners by cloning and replacing
            const newEditBtn = editBtn.cloneNode(true);
            editBtn.parentNode.replaceChild(newEditBtn, editBtn);
            
            // Attach new event listener
            const self = this;
            newEditBtn.onclick = function() {
                self.showEditProfile();
            };
        }
        
        // Set up profile picture click separately
        this.setupProfilePictureClick();
    }

    // Add a dedicated method for profile picture events to improve reliability
    setupProfilePictureClick() {
        const profilePic = document.querySelector("#profilePicDisplay");
        if (!profilePic) return;
        
        profilePic.style.cursor = "pointer";
        
        // Remove existing click handlers by cloning
        const newProfilePic = profilePic.cloneNode(true);
        profilePic.parentNode.replaceChild(newProfilePic, profilePic);
        
        // Direct click handler with no fancy stuff
        newProfilePic.onclick = () => {
            this.simpleFallbackAvatarModal();
        };
        
        // Also handle the image inside with the same direct approach
        const img = newProfilePic.querySelector("img");
        if (img) {
            img.style.cursor = "pointer";
            img.onclick = () => {
                this.simpleFallbackAvatarModal();
            };
        }
    }

    // Simple reliable modal with no dependencies
    simpleFallbackAvatarModal() {
        // Clean up any existing modals first
        document.querySelectorAll('.avatar-modal').forEach(m => m.remove());
        
        const modal = document.createElement('div');
        modal.className = 'avatar-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '999999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const content = document.createElement('div');
        content.style.backgroundColor = 'var(--card-bg, white)';
        content.style.borderRadius = '8px';
        content.style.padding = '20px';
        content.style.maxWidth = '90%';
        content.style.width = '350px';
        
        content.innerHTML = `
            <h2 style="margin-top:0;text-align:center;">Choose Avatar</h2>
            <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:15px 0;"></div>
            <div style="text-align:center;margin-top:15px;display:flex;justify-content:space-between;">
                <button id="avatar-cancel" style="background:var(--btn-secondary, #e0e0e0);color:#000000;padding:10px 15px;border:none;border-radius:6px;cursor:pointer;font-weight:500;flex:1;margin-right:10px;">Cancel</button>
                <button id="avatar-save" style="background:var(--btn-primary, #4d6fed);color:white;padding:10px 15px;border:none;border-radius:6px;cursor:pointer;font-weight:500;flex:1;">Save</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const avatars = [
            {id: 'avatar_01', path: 'assets/avatars/avatar1.png'},
            {id: 'avatar_02', path: 'assets/avatars/avatar2.png'},
            {id: 'avatar_03', path: 'assets/avatars/avatar3.png'},
            {id: 'avatar_04', path: 'assets/avatars/avatar4.png'},
            {id: 'avatar_05', path: 'assets/avatars/avatar5.png'},
            {id: 'avatar_06', path: 'assets/avatars/avatar6.png'}
        ];
        
        const grid = document.getElementById('avatar-grid');
        let selectedAvatar = null;
        
        avatars.forEach(avatar => {
            const el = document.createElement('div');
            // Remove border completely, only show border when selected
            el.style.borderRadius = "8px";
            el.style.overflow = "hidden";
            el.style.cursor = "pointer";
            el.style.aspectRatio = "1";
            el.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"; // Add subtle shadow instead of border
            el.innerHTML = `<img src="${avatar.path}" style="width:100%;height:100%;object-fit:cover">`;
            
            el.onclick = function() {
                document.querySelectorAll('#avatar-grid div').forEach(div => {
                    div.style.border = "none"; // Remove border from all
                    div.style.transform = "scale(1)"; // Reset scale
                    div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"; // Reset shadow
                });
                el.style.border = "2px solid var(--btn-primary, #4d6fed)"; // Add border only to selected
                el.style.transform = "scale(1.05)"; // Slightly enlarge selected avatar
                el.style.boxShadow = "0 3px 10px rgba(77,111,237,0.4)"; // Enhanced shadow for selected
                selectedAvatar = avatar;
            };
            
            grid.appendChild(el);
        });
        
        document.getElementById('avatar-cancel').onclick = function() {
            modal.remove();
        };
        
        document.getElementById('avatar-save').onclick = () => {
            if (selectedAvatar) {
                const profile = this.userProfile.getProfile();
                if (profile) {
                    profile.picture = selectedAvatar.path;
                    profile.avatarId = selectedAvatar.id;
                    this.userProfile.saveProfile(profile);
                    
                    // Update display immediately
                    const img = document.querySelector('#profilePicDisplay img');
                    if (img) img.src = selectedAvatar.path;
                }
            }
            modal.remove();
        };
    }

    // Add this method to refresh profile events after profile updates
    refreshProfileEvents() {
        this.setupProfilePictureClick();
    }

    showEditProfile() {
        // Remove ALL existing edit profile modals from the DOM before creating a new one
        document.querySelectorAll('.edit-profile-modal').forEach(modal => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        const profile = this.userProfile.getProfile();
        
        // Generate a unique ID for this modal instance
        const modalId = 'editProfileModal_' + Date.now();
        
        const editModal = document.createElement('div');
        editModal.className = 'modal-wrapper edit-profile-modal';
        editModal.id = modalId;
        editModal.style.zIndex = "100000";
        
        // Simplified modal with only username and gender fields
        editModal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Edit Profile</h2>
                
                <form id="editProfileForm_${modalId}" class="edit-profile-form">
                    <div class="input-fields">
                        <div class="form-group">
                            <label for="editUsername_${modalId}">Username</label>
                            <input type="text" id="editUsername_${modalId}" name="username" value="${profile?.username || ''}" required 
                                   placeholder="Your unique username">
                        </div>
                        
                        <div class="form-group gender-selection">
                            <label>Gender</label>
                            <div class="gender-options">
                                <label class="gender-option" for="gender-male-${modalId}">
                                    <input type="radio" id="gender-male-${modalId}" name="gender" value="male" ${profile?.gender === 'male' ? 'checked' : ''}>
                                    <div class="gender-icon male">
                                        <i class="fa-solid fa-mars"></i>
                                    </div>
                                </label>
                                <label class="gender-option" for="gender-female-${modalId}">
                                    <input type="radio" id="gender-female-${modalId}" name="gender" value="female" ${profile?.gender === 'female' ? 'checked' : ''}>
                                    <div class="gender-icon female">
                                        <i class="fa-solid fa-venus"></i>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <input type="hidden" id="editSelectedAvatar_${modalId}" name="avatar" value="${profile?.picture || ''}">
                    <input type="hidden" id="editSelectedAvatarId_${modalId}" name="avatarId" value="${profile?.avatarId || 'avatar_01'}">
                    
                    <div class="form-actions compact-buttons">
                        <button type="button" id="editCancelBtn_${modalId}" class="cancel-btn" style="color: #333;">Cancel</button>
                        <button type="submit" class="submit-btn" style="color: white;">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(editModal);
        
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

    // Add a new method to handle avatar editing
    showAvatarEditProfile() {
        console.log("DEBUG: Avatar edit modal requested");
        
        try {
            // Use the correct modalManager methods that actually exist
            if (window.modalManager) {
                // Use hideAllModals instead of closeAllModals which doesn't exist
                const activeModals = document.querySelectorAll('.modal-wrapper.active');
                activeModals.forEach(modal => {
                    window.modalManager.hideModal(modal);
                });
            }
            
            // Remove ALL existing avatar edit modals from the DOM before creating a new one
            document.querySelectorAll('.avatar-edit-modal, .edit-profile-modal').forEach(modal => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
            
            // Force the body class to be correct
            document.body.classList.remove('modal-open');
            
            // Get profile or create default if none exists
            let profile = this.userProfile.getProfile();
            if (!profile) {
                console.warn("No user profile found, creating default");
                profile = {
                    username: 'Guest',
                    gender: 'male',
                    picture: 'assets/avatars/avatar1.png',
                    avatarId: 'avatar_01',
                    createdAt: new Date().toISOString(),
                    gamesPlayed: 0,
                    bestLevel: 1
                };
                this.userProfile.saveProfile(profile);
            }
            
            // Generate a unique ID for this modal instance
            const modalId = 'avatarEditModal_' + Date.now();
            
            // Create modal with higher z-index to ensure visibility
            const editModal = document.createElement('div');
            editModal.className = 'modal-wrapper edit-profile-modal avatar-edit-modal';
            editModal.id = modalId;
            editModal.style.zIndex = "1000000";
            editModal.style.position = "fixed";
            editModal.style.top = "0";
            editModal.style.left = "0";
            editModal.style.width = "100%";
            editModal.style.height = "100%";
            editModal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            editModal.style.display = "flex";
            editModal.style.justifyContent = "center";
            editModal.style.alignItems = "center";
            
            // Avatar-only edit modal with simplified structure
            editModal.innerHTML = `
                <div class="modal-content profile-setup">
                    <h2>Change Avatar</h2>
                    
                    <form id="avatarEditForm_${modalId}" class="edit-profile-form">
                        <div class="avatar-section">
                            <div class="avatar-grid" id="editAvatarGrid_${modalId}">
                                <!-- Avatars will be added here by JavaScript -->
                            </div>
                            <input type="hidden" id="editSelectedAvatar_${modalId}" name="avatar" value="${profile?.picture || 'assets/avatars/avatar1.png'}">
                            <input type="hidden" id="editSelectedAvatarId_${modalId}" name="avatarId" value="${profile?.avatarId || 'avatar_01'}">
                        </div>
                        
                        <div class="form-actions compact-buttons">
                            <button type="button" id="editCancelBtn_${modalId}" class="cancel-btn" style="color: #333;">Cancel</button>
                            <button type="submit" class="submit-btn" style="color: white;">Save Avatar</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(editModal);
            
            // Setup avatar grid with the unique ID - this adds the avatars to the grid
            this.setupEditAvatarGrid(profile?.avatarId || 'avatar_01', modalId);
            
            // Setup event listeners with reference to this modal instance
            this.setupAvatarEditEvents(editModal, modalId);
            
            // Show the modal directly without relying on modalManager
            editModal.style.display = "flex";
            editModal.style.visibility = "visible";
            editModal.style.opacity = "1";
            document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
            
        } catch (error) {
            console.error("Error creating avatar edit modal:", error);
            // Create simple fallback modal
            this.createFallbackAvatarModal();
        }
    }

    // Add a fallback method for avatar modal
    createFallbackAvatarModal() {
        try {
            // Simple fallback modal for avatar selection
            const modalId = 'fallbackAvatarModal_' + Date.now();
            const editModal = document.createElement('div');
            editModal.className = 'modal-wrapper edit-profile-modal avatar-edit-modal';
            editModal.id = modalId;
            editModal.style.zIndex = "100000";
            editModal.style.display = "flex";
            editModal.style.position = "fixed";
            editModal.style.top = "0";
            editModal.style.left = "0";
            editModal.style.width = "100%";
            editModal.style.height = "100%";
            editModal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            editModal.style.justifyContent = "center";
            editModal.style.alignItems = "center";
            
            // Basic avatar options
            editModal.innerHTML = `
                <div class="modal-content profile-setup" style="max-width: 90%; width: 350px; padding: 20px; background: var(--card-bg, #fff); border-radius: 8px;">
                    <h2 style="margin-top:0; text-align:center;">Choose Avatar</h2>
                    <div id="simple-avatar-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin:15px 0">
                    </div>
                    <div style="text-align:center; margin-top:15px;">
                        <button id="simple-cancel" style="background:#f5f5f5; padding:8px 15px; border:none; border-radius:4px; cursor:pointer; margin-right:10px;">Cancel</button>
                        <button id="simple-save" style="background:var(--btn-primary, #4d6fed); color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer;">Save</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editModal);
            
            // Add avatar options
            const avatarUrls = [
                'assets/avatars/avatar1.png',
                'assets/avatars/avatar2.png',
                'assets/avatars/avatar3.png',
                'assets/avatars/avatar4.png',
                'assets/avatars/avatar5.png',
                'assets/avatars/avatar6.png'
            ];
            
            let selectedAvatar = null;
            const grid = document.getElementById('simple-avatar-grid');
            
            avatarUrls.forEach((url, index) => {
                const avatarEl = document.createElement('div');
                avatarEl.style.border = "2px solid #ccc";
                avatarEl.style.borderRadius = "8px";
                avatarEl.style.overflow = "hidden";
                avatarEl.style.cursor = "pointer";
                avatarEl.style.aspectRatio = "1";
                avatarEl.dataset.url = url;
                avatarEl.dataset.id = `avatar_0${index + 1}`;
                
                avatarEl.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover">`;
                
                avatarEl.onclick = function() {
                    // Remove selected class from all avatars
                    document.querySelectorAll('#simple-avatar-grid div').forEach(el => {
                        el.style.border = "2px solid #ccc";
                    });
                    
                    // Add selected style
                    avatarEl.style.border = "2px solid var(--btn-primary, #4d6fed)";
                    selectedAvatar = {
                        url: url,
                        id: `avatar_0${index + 1}`
                    };
                };
                
                grid.appendChild(avatarEl);
            });
            
            // Add button handlers
            document.getElementById('simple-cancel').onclick = function() {
                if (editModal && editModal.parentNode) {
                    editModal.parentNode.removeChild(editModal);
                }
            };
            
            document.getElementById('simple-save').onclick = function() {
                if (selectedAvatar) {
                    try {
                        // Save the selected avatar
                        const profile = localStorage.getItem('userProfileData');
                        if (profile) {
                            const profileData = JSON.parse(profile);
                            profileData.picture = selectedAvatar.url;
                            profileData.avatarId = selectedAvatar.id;
                            localStorage.setItem('userProfileData', JSON.stringify(profileData));
                            
                            // Update the display immediately
                            const picElement = document.querySelector('#profilePicDisplay img');
                            if (picElement) {
                                picElement.src = selectedAvatar.url;
                            }
                        }
                    } catch (e) {
                        console.error('Error saving avatar selection:', e);
                    }
                }
                
                // Close the modal
                if (editModal && editModal.parentNode) {
                    editModal.parentNode.removeChild(editModal);
                }
            };
        } catch (e) {
            console.error('Error creating fallback avatar modal:', e);
            // Silent failure - no alerts
        }
    }

    setupAvatarEditEvents(modal, modalId) {
        const uniqueId = modalId || modal.id || '';
        const formId = uniqueId ? `avatarEditForm_${uniqueId}` : 'avatarEditForm';
        const cancelBtnId = uniqueId ? `editCancelBtn_${uniqueId}` : 'editCancelBtn';
        
        const form = modal.querySelector(`#${formId}`) || modal.querySelector('.edit-profile-form');
        
        // Handle Cancel button
        const cancelBtn = document.getElementById(cancelBtnId) || 
                          modal.querySelector('.cancel-btn');
                          
        if (cancelBtn) {
            // Create a click handler
            cancelBtn.onclick = () => {
                console.log("Cancel button clicked");
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    document.body.style.overflow = ""; // Re-enable scrolling
                }
            };
        }

        // Handle form submission
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                console.log("Avatar edit form submitted");
                this.handleAvatarEdit(form);
                
                // Remove the modal
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    document.body.style.overflow = ""; // Re-enable scrolling
                }
            };
        }
    }

    handleAvatarEdit(form) {
        const formData = new FormData(form);
        const currentProfile = this.userProfile.getProfile();
        
        const updatedProfile = {
            ...currentProfile,
            picture: formData.get('avatar'),
            avatarId: formData.get('avatarId')
        };

        try {
            this.userProfile.saveProfile(updatedProfile);
            
            // Sync changes with server
            this.syncProfileWithServer(updatedProfile);
            
            // This triggers an immediate update but we'll also refresh when the modal closes
            this.updateProfileDisplay();
            
            console.log("Avatar updated successfully");
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert(error.message || 'Error updating avatar');
        }
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
            username: formData.get('username'),
            gender: formData.get('gender'),
            // Get the avatar information from the form instead of keeping existing data
            picture: formData.get('avatar') || currentProfile.picture,
            avatarId: formData.get('avatarId') || currentProfile.avatarId
        };

        try {
            this.userProfile.validateProfile(updatedProfile);
            this.userProfile.saveProfile(updatedProfile);
            
            // Sync changes with server
            this.syncProfileWithServer(updatedProfile);
            
            // This triggers an immediate update but we'll also refresh when the modal closes
            this.updateProfileDisplay();
            
            console.log("Profile updated successfully:", updatedProfile.username);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.message || 'Error updating profile');
        }
    }

    // New method to sync profile changes with server
    syncProfileWithServer(profile) {
        if (!this.api.offlineMode && profile.username) {
            console.log("Syncing profile changes with server");
            this.api.updateProfile({
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

    // Add a proper setupEditAvatarGrid method which was likely missing or not implemented correctly
    setupEditAvatarGrid(selectedAvatarId, modalId) {
        console.log("Setting up avatar grid with ID:", modalId);
        
        // Use direct imports instead of dynamic imports which might fail
        const avatars = [
            {id: 'avatar_01', path: 'assets/avatars/avatar1.png', alt: 'Default Avatar'},
            {id: 'avatar_02', path: 'assets/avatars/avatar2.png', alt: 'Player Avatar 2'},
            {id: 'avatar_03', path: 'assets/avatars/avatar3.png', alt: 'Player Avatar 3'},
            {id: 'avatar_04', path: 'assets/avatars/avatar4.png', alt: 'Player Avatar 4'},
            {id: 'avatar_05', path: 'assets/avatars/avatar5.png', alt: 'Player Avatar 5'},
            {id: 'avatar_06', path: 'assets/avatars/avatar6.png', alt: 'Player Avatar 6'}
        ];
        
        const avatarGrid = document.getElementById(`editAvatarGrid_${modalId}`);
        if (!avatarGrid) {
            console.error("Avatar grid element not found:", `editAvatarGrid_${modalId}`);
            return;
        }
        
        console.log("Adding avatars to grid...");
        // Add avatars to the grid
        avatars.forEach((avatar) => {
            const avatarElement = document.createElement('div');
            avatarElement.className = 'avatar-option';
            
            // Set selected class if this is the current avatar
            if (avatar.id === selectedAvatarId) {
                avatarElement.classList.add('selected');
            }
            
            avatarElement.innerHTML = `<img src="${avatar.path}" alt="${avatar.alt || 'Avatar option'}">`;
            
            // Add click event to select this avatar
            avatarElement.addEventListener('click', () => {
                // Remove selected class from all avatars
                document.querySelectorAll(`#editAvatarGrid_${modalId} .avatar-option`).forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Add selected class to clicked avatar
                avatarElement.classList.add('selected');
                
                // Update hidden fields with avatar info
                document.getElementById(`editSelectedAvatar_${modalId}`).value = avatar.path;
                document.getElementById(`editSelectedAvatarId_${modalId}`).value = avatar.id;
                
                console.log(`Avatar selected: ${avatar.id}`);
            });
            
            avatarGrid.appendChild(avatarElement);
        });
        
        console.log("Avatar grid setup complete");
    }
}
