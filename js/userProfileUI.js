import { UserProfile } from './userProfile.js';

export class UserProfileUI {
    constructor() {
        this.userProfile = new UserProfile();
        this.setupModalHTML = `
            <div id="profileSetupModal" class="modal-wrapper">
                <div class="modal-content profile-setup">
                    <h2>Welcome to Number Guessing Game!</h2>
                    <p>Please set up your profile to continue.</p>
                    <form id="profileSetupForm">
                        <div class="form-group">
                            <label for="profileName">Your Name</label>
                            <input type="text" id="profileName" name="name" required 
                                   minlength="2" placeholder="Enter your name">
                        </div>
                        <div class="form-group">
                            <label for="profileAge">Your Age</label>
                            <input type="number" id="profileAge" name="age" required 
                                   min="1" max="120" placeholder="Enter your age">
                        </div>
                        <div class="form-group">
                            <label for="profilePicture">Profile Picture (Optional)</label>
                            <input type="file" id="profilePicture" name="picture" 
                                   accept="image/*">
                            <div id="picturePreview" class="picture-preview"></div>
                        </div>
                        <button type="submit" class="submit-btn">Save Profile</button>
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
        if (!this.userProfile.hasProfile()) {
            await this.showProfileSetup();
        }
        this.initProfileSection();
        this.setupEventListeners();
    }

    showProfileSetup() {
        return new Promise((resolve) => {
            document.body.insertAdjacentHTML('beforeend', this.setupModalHTML);
            const modal = document.getElementById('profileSetupModal');
            modal.classList.add('active');

            // Add submit handler specifically for initial setup
            const form = modal.querySelector('#profileSetupForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleProfileSubmit(e.target);
                modal.remove();
                resolve();
            });
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
                name: formData.get('name'),
                age: formData.get('age'),
                picture: preview?.dataset?.image || null,
                createdAt: new Date().toISOString(),
                gamesPlayed: 0,
                bestLevel: 1
            };

            this.userProfile.validateProfile(profileData);
            this.userProfile.saveProfile(profileData);
            this.updateProfileDisplay();
            
            // Don't reload the page, just update the display
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    handlePictureUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5242880) { // 5MB max
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
        const sideMenu = document.querySelector('.side-menu');
        if (sideMenu) {
            // Remove existing profile if any
            const existingProfile = sideMenu.querySelector('.profile-section');
            if (existingProfile) {
                existingProfile.remove();
            }
            
            // Find or create side menu content
            let sideMenuContent = sideMenu.querySelector('.side-menu-content');
            if (!sideMenuContent) {
                sideMenuContent = document.createElement('div');
                sideMenuContent.className = 'side-menu-content';
                sideMenu.appendChild(sideMenuContent);
            }
            
            // Insert profile at the beginning of the side menu content
            sideMenuContent.insertAdjacentHTML('afterbegin', this.sideMenuProfileHTML);
            
            this.updateProfileDisplay();
            this.setupProfileEvents();
        }
    }

    updateProfileDisplay() {
        const profile = this.userProfile.getProfile();
        if (!profile) return;

        // Update name and age
        const nameElement = document.getElementById('profileName');
        const ageElement = document.querySelector('#profileAge span');
        const picElement = document.querySelector('#profilePicDisplay img');
        
        if (nameElement) nameElement.textContent = profile.name;
        if (ageElement) ageElement.textContent = `Age: ${profile.age}`;
        if (picElement) {
            if (profile.picture) {
                picElement.src = profile.picture;
            } else {
                picElement.src = 'assets/icons/default-profile.png';
            }
        }

        // Update stats with subtle animation
        const statsElements = {
            gamesPlayed: document.getElementById('gamesPlayed'),
            bestLevel: document.getElementById('bestLevel')
        };

        Object.entries(statsElements).forEach(([key, element]) => {
            if (element) {
                const value = profile[key] || (key === 'bestLevel' ? 1 : 0);
                
                // Add a small animation when updating stats
                element.classList.add('updating');
                setTimeout(() => {
                    element.textContent = value;
                    element.classList.remove('updating');
                }, 200);
            }
        });
    }

    setupProfileEvents() {
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditProfile());
        }
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
                        <label for="editName">Name</label>
                        <input type="text" id="editName" name="name" value="${profile?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editAge">Age</label>
                        <input type="number" id="editAge" name="age" value="${profile?.age || ''}" required>
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
        
        const updatedProfile = {
            ...currentProfile,
            name: formData.get('name'),
            age: formData.get('age'),
            picture: preview?.dataset?.image || currentProfile?.picture
        };

        try {
            this.userProfile.validateProfile(updatedProfile);
            this.userProfile.saveProfile(updatedProfile);
            this.updateProfileDisplay();
        } catch (error) {
            alert(error.message);
        }
    }
}
