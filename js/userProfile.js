export class UserProfile {
    constructor() {
        this.storageKey = 'userProfileData';
    }

    getProfile() {
        try {
            const profile = localStorage.getItem(this.storageKey);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    saveProfile(profileData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(profileData));
            
            // Trigger server sync when profile is saved
            this.triggerServerSync(profileData);
            
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    }

    // New method to trigger immediate server sync
    triggerServerSync(profileData) {
        // Don't try to sync if we're in a module context without access to window
        if (typeof window !== 'undefined') {
            // If SyncManager is loaded, use it
            if (window.syncManager) {
                window.syncManager.performSync();
            } else {
                // Otherwise, load SyncManager dynamically
                import('./syncManager.js').then(module => {
                    const syncManager = new module.SyncManager();
                    syncManager.performSync();
                }).catch(err => {
                    console.warn('Could not load SyncManager for immediate sync:', err);
                });
            }
        }
    }

    updateStatistics(gameData) {
        const profile = this.getProfile();
        if (profile) {
            profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
            
            // Only update best level if the current level is higher
            if (gameData.level > (profile.bestLevel || 1)) {
                profile.bestLevel = gameData.level;
            }
            
            this.saveProfile(profile);
            
            return true;
        }
        return false;
    }

    validateProfile(profileData) {
        const { nickname, username } = profileData;
        
        if (!nickname || nickname.trim().length < 2) {
            throw new Error('Nickname must be at least 2 characters long');
        }
        
        if (nickname.trim().length > 20) {
            throw new Error('Nickname must be at most 20 characters long');
        }
        
        if (!username || username.trim().length < 2) {
            throw new Error('Username must be at least 2 characters long');
        }
        
        if (username.trim().length > 20) {
            throw new Error('Username must be at most 20 characters long');
        }
        
        return true;
    }

    // Update hasProfile method to include debugging
    hasProfile() {
        const profile = this.getProfile();
        console.log("Profile check:", profile ? "Found profile" : "No profile found");
        return !!profile;
    }

    deleteProfile() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Profile deleted from local storage');
            return true;
        } catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    }
    
    // New method to check if profile is guest type
    isGuestProfile() {
        const profile = this.getProfile();
        return profile && profile.type === 'guest';
    }
}
