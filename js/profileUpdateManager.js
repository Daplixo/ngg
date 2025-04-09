/**
 * Profile Update Manager
 * Handles real-time updates to the profile UI when statistics change
 */

class ProfileUpdateManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log("Initializing Profile Update Manager");
        
        // Set up event listeners for profile updates
        document.addEventListener('profileStatsUpdated', this.handleProfileUpdate.bind(this));
        
        // Create a MutationObserver to watch for changes to the profile section in the DOM
        this.setupDOMObserver();
    }
    
    setupDOMObserver() {
        // Watch for when the profile section gets added to the DOM
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const profileSection = node.querySelector('.profile-section') || 
                                                 (node.classList && node.classList.contains('profile-section') ? node : null);
                            
                            if (profileSection) {
                                console.log("Profile section detected in DOM, updating stats display");
                                this.refreshProfileStats();
                                
                                // Once we've found and updated the profile section, disconnect the observer
                                observer.disconnect();
                                break;
                            }
                        }
                    }
                }
            }
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    handleProfileUpdate(event) {
        console.log("Profile statistics updated event received", event.detail);
        this.refreshProfileStats();
    }
    
    refreshProfileStats() {
        try {
            // Get the current profile data
            const profileData = this.getProfileData();
            if (!profileData) return;
            
            // Update UI elements with the latest data
            this.updateGamesPlayedDisplay(profileData.gamesPlayed || 0);
            this.updateBestLevelDisplay(profileData.bestLevel || 1);
            
            // Also update any other profile stats that might be displayed
            this.updateWinsDisplay(profileData.totalWins || 0);
            this.updateAttemptsDisplay(profileData.totalAttempts || 0);
        } catch (error) {
            console.error("Error refreshing profile stats:", error);
        }
    }
    
    getProfileData() {
        try {
            const profileDataString = localStorage.getItem('userProfileData');
            return profileDataString ? JSON.parse(profileDataString) : null;
        } catch (error) {
            console.error("Error getting profile data:", error);
            return null;
        }
    }
    
    updateGamesPlayedDisplay(count) {
        const gamesPlayedElement = document.getElementById('gamesPlayed');
        if (gamesPlayedElement) {
            if (gamesPlayedElement.textContent !== String(count)) {
                console.log(`Updating games played display: ${gamesPlayedElement.textContent} -> ${count}`);
                gamesPlayedElement.textContent = count;
                
                // Add a highlight effect to draw attention to the change
                this.addUpdateAnimation(gamesPlayedElement);
            }
        }
    }
    
    updateBestLevelDisplay(level) {
        const bestLevelElement = document.getElementById('bestLevel');
        if (bestLevelElement) {
            if (bestLevelElement.textContent !== String(level)) {
                console.log(`Updating best level display: ${bestLevelElement.textContent} -> ${level}`);
                bestLevelElement.textContent = level;
                
                // Add a highlight effect to draw attention to the change
                this.addUpdateAnimation(bestLevelElement);
            }
        }
    }
    
    updateWinsDisplay(wins) {
        const winsElement = document.getElementById('totalWins');
        if (winsElement) {
            if (winsElement.textContent !== String(wins)) {
                console.log(`Updating total wins display: ${winsElement.textContent} -> ${wins}`);
                winsElement.textContent = wins;
                this.addUpdateAnimation(winsElement);
            }
        }
    }
    
    updateAttemptsDisplay(attempts) {
        const attemptsElement = document.getElementById('totalAttempts');
        if (attemptsElement) {
            if (attemptsElement.textContent !== String(attempts)) {
                console.log(`Updating total attempts display: ${attemptsElement.textContent} -> ${attempts}`);
                attemptsElement.textContent = attempts;
                this.addUpdateAnimation(attemptsElement);
            }
        }
    }
    
    addUpdateAnimation(element) {
        // Remove any existing animation class
        element.classList.remove('stat-updated');
        
        // Force a reflow by accessing offsetHeight
        void element.offsetHeight;
        
        // Add the animation class
        element.classList.add('stat-updated');
        
        // Remove the animation class after it completes
        setTimeout(() => {
            element.classList.remove('stat-updated');
        }, 1500);
    }
}

// Initialize the ProfileUpdateManager on page load
document.addEventListener('DOMContentLoaded', () => {
    window.profileUpdateManager = new ProfileUpdateManager();
});

export { ProfileUpdateManager };
