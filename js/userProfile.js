export class UserProfile {
    constructor() {
        this.storageKey = 'userProfileData';
        
        // If we're in a browser context, make this instance globally available
        if (typeof window !== 'undefined' && !window.UserProfile) {
            window.UserProfile = this;
            console.log('📝 UserProfile instance attached to global scope');
        }
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
            console.log('📊 Updating statistics for level', gameData.level, 'win:', gameData.hasWon);
            
            // Track if any stats were updated
            let statsUpdated = false;
            let updatedStats = {};
            
            // Only increment gamesPlayed when explicitly specified with newGame flag
            // AND we haven't already incremented it this session
            if (gameData.newGame === true) {
                // Check if this is a duplicate increment in the same session
                if (this._lastIncrementTime && 
                    (Date.now() - this._lastIncrementTime) < 5000) { // 5 seconds threshold
                    console.log('🎮 Preventing duplicate increment (too soon after last increment)');
                } else {
                    const oldGamesPlayed = profile.gamesPlayed || 0;
                    profile.gamesPlayed = oldGamesPlayed + 1;
                    this._lastIncrementTime = Date.now();
                    console.log('🎮 Incrementing games played count to:', profile.gamesPlayed);
                    statsUpdated = true;
                    updatedStats.gamesPlayed = profile.gamesPlayed;
                }
            } else {
                console.log('🎮 Not incrementing games played (not a new game)');
            }
            
            // Only update best level if the current level is higher
            if (gameData.level > (profile.bestLevel || 1)) {
                profile.bestLevel = gameData.level;
                statsUpdated = true;
                updatedStats.bestLevel = profile.bestLevel;
            }
            
            // Track total wins
            if (gameData.hasWon) {
                const oldWins = profile.totalWins || 0;
                profile.totalWins = oldWins + 1;
                statsUpdated = true;
                updatedStats.totalWins = profile.totalWins;
            }
            
            // Track total attempts
            const oldAttempts = profile.totalAttempts || 0;
            profile.totalAttempts = oldAttempts + gameData.attempts;
            statsUpdated = true;
            updatedStats.totalAttempts = profile.totalAttempts;
            
            // Save profile to localStorage
            this.saveProfile(profile);
            
            // Dispatch an event to notify other components that the profile has been updated
            if (statsUpdated) {
                document.dispatchEvent(new CustomEvent('profileStatsUpdated', { 
                    detail: updatedStats 
                }));
            }
            
            // Always sync stats with server, regardless of syncedWithServer flag
            console.log('🔄 Always triggering stats sync with server');
            this.syncStatsWithServer(profile);
            
            return true;
        }
        return false;
    }
    
    // New method specifically for syncing stats to server
    syncStatsWithServer(profile) {
        try {
            if (!profile) {
                console.error('❌ Cannot sync stats: No profile provided');
                return;
            }
            
            // FIX: Use consistent username handling
            const username = profile.username || profile.name;
            
            if (!username) {
                console.error('❌ Cannot sync stats: Missing username');
                return;
            }
            
            const statsToSync = {
                gamesPlayed: profile.gamesPlayed || 0,
                bestLevel: profile.bestLevel || 1,
                totalWins: profile.totalWins || 0,
                totalAttempts: profile.totalAttempts || 0
            };
            
            console.log(`📤 Syncing stats to server for ${username}:`, statsToSync);
            
            // First try to use existing SyncManager
            if (window.syncManager) {
                window.syncManager.syncStats();
                return;
            }
            
            // Otherwise load SyncManager dynamically
            import('./syncManager.js')
                .then(module => {
                    const syncManager = new module.SyncManager();
                    syncManager.syncStats();
                })
                .catch(err => {
                    console.error('❌ Failed to load SyncManager:', err);
                    
                    // Fallback: Try to use API service directly if SyncManager fails
                    import('./api/apiService.js')
                        .then(module => {
                            const apiService = module.apiService;
                            apiService.updateUserStats(username, statsToSync)
                                .then(() => console.log('✅ Stats synced via direct API call'))
                                .catch(err => console.error('❌ Direct API stats sync failed:', err));
                        })
                        .catch(apiErr => console.error('❌ Failed to load API service:', apiErr));
                });
        } catch (error) {
            console.error('❌ Error in syncStatsWithServer:', error);
        }
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

// Create a global instance if we're in a browser context
if (typeof window !== 'undefined' && !window.UserProfile) {
    window.UserProfile = new UserProfile();
    console.log('🌍 Global UserProfile instance created');
}
