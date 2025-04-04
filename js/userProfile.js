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
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
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
        const { nickname, name } = profileData;
        if (!nickname || nickname.trim().length < 2) {
            throw new Error('Nickname must be at least 2 characters long');
        }
        if (nickname.trim().length > 20) {
            throw new Error('Nickname must be at most 20 characters long');
        }
        if (!name || name.trim().length < 2) {
            throw new Error('Username must be at least 2 characters long');
        }
        if (name.trim().length > 20) {
            throw new Error('Username must be at most 20 characters long');
        }
        return true;
    }

    hasProfile() {
        return !!this.getProfile();
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
}
