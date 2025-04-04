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
            profile.bestLevel = Math.max(profile.bestLevel || 1, gameData.level);
            this.saveProfile(profile);
        }
    }

    validateProfile(profileData) {
        const { name, age } = profileData;
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        const numAge = parseInt(age);
        if (isNaN(numAge) || numAge < 1 || numAge > 120) {
            throw new Error('Please enter a valid age between 1 and 120');
        }
        return true;
    }

    hasProfile() {
        return !!this.getProfile();
    }

    deleteProfile() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    }
}
