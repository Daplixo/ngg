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
        const editModal = document.createElement('div');
        editModal.className = 'modal-wrapper';
        editModal.id = 'editProfileModal';
        editModal.innerHTML = `
            <div class="modal-content profile-setup">
                <h2>Edit Profile</h2>
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editNickname">Nickname</label>
                        <input type="text" id="editNickname" name="nickname" value="${profile?.nickname || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editName">Username</label>
                        <input type="text" id="editName" name="name" value="${profile?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPicture">Change Picture</label>
                        <input type="file" id="editPicture" name="picture" accept="image/*">
                        <div id="editPicturePreview" class="picture-preview"></div>
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                </form>
            </div>`;

        document.body.appendChild(editModal);
        editModal.classList.add('active');

        this.setupEditProfileEvents(editModal);
    }

    setupEditProfileEvents(modal) {
        const form = modal.querySelector('#editProfileForm');
        const pictureInput = modal.querySelector('#editPicture');

        pictureInput.addEventListener('change', (e) => this.handlePictureUpload(e));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileEdit(form);
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    handleProfileEdit(form) {
        const formData = new FormData(form);
        const currentProfile = this.userProfile.getProfile();
        const preview = document.getElementById('editPicturePreview');
        
        let avatarId = formData.get('avatarId') || currentProfile?.avatarId || 'avatar_01';
        const picturePath = preview?.dataset?.image || currentProfile?.picture;
        
        // If picture has changed, update avatarId
        if (picturePath && picturePath !== currentProfile?.picture) {
            avatarId = getAvatarIdByPath(picturePath);
        }
        
        const updatedProfile = {
            ...currentProfile,
            nickname: formData.get('nickname'),
            name: formData.get('name'),
            picture: picturePath,
            avatarId: avatarId
        };

        try {
            this.userProfile.validateProfile(updatedProfile);
            this.userProfile.saveProfile(updatedProfile);
            
            // Sync changes with server if this is a non-guest profile
            if (updatedProfile.type === 'account') {
                this.syncProfileWithServer(updatedProfile);
            }
            
            this.updateProfileDisplay();
        } catch (error) {
            alert(error.message);
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
