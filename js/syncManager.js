import { UserProfile } from './userProfile.js';
import { apiService } from './api/apiService.js';
import { gameState } from './gameState.js';

export class SyncManager {
    constructor() {
        this.userProfile = new UserProfile();
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
        this.intervalId = null;
        this.initialized = false;
    }

    startSync() {
        if (this.initialized) return;
        
        console.log("📡 Starting background data synchronization...");
        this.performSync(); // immediate first attempt
        this.intervalId = setInterval(() => this.performSync(), this.syncInterval);
        console.log("✅ Background sync started with interval:", this.syncInterval);
        this.initialized = true;
    }

    stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.initialized = false;
            console.log("⏹️ Background sync stopped");
        }
    }

    async performSync() {
        try {
            console.log("🔄 Performing sync...");
            const profile = this.userProfile.getProfile();
            
            if (!profile) {
                console.log("⚠️ No profile to sync");
                return;
            }
            
            // If profile isn't synced with server, try to register it first
            // No longer need to check profile type since all profiles are account type
            if (!profile.syncedWithServer) {
                await this.registerProfileWithServer(profile);
            }
            
            // If profile is synced with server, update profile data
            if (profile.syncedWithServer) {
                await this.updateProfileOnServer(profile);
            }
            
            console.log("✅ Sync completed");
        } catch (error) {
            console.error("❌ Error during sync:", error);
        }
    }

    async registerProfileWithServer(profile) {
        try {
            // Use consistent username property - profile.username if it exists, otherwise profile.name
            const username = profile.username || profile.name;
            
            if (!username) {
                console.error("❌ Cannot register profile: Missing username");
                return { success: false, error: 'MISSING_USERNAME' };
            }
            
            console.log(`🔄 Checking if username ${username} exists before registration`);
            
            // Check if username already exists
            try {
                const exists = await apiService.checkUsernameExists(username);
                
                if (exists) {
                    console.log(`⚠️ Username ${username} already exists on server`);
                    
                    // Mark the profile as synced with server, so we can update it
                    profile.syncedWithServer = true;
                    
                    // Ensure username is always saved correctly in the profile
                    if (!profile.username) {
                        profile.username = username;
                    }
                    
                    this.userProfile.saveProfile(profile);
                    
                    // Update existing profile on server instead of creating a new one
                    await this.updateProfileOnServer(profile);
                    
                    return { success: true, message: 'Profile marked as synced with existing account' };
                }
                
                console.log(`✅ Username ${username} is available, registering...`);
                
                // Register the profile with the server
                try {
                    const result = await apiService.register({
                        username: username,
                        avatarId: profile.avatarId,
                        profilePicture: profile.picture
                    });
                    
                    if (result && result.token) {
                        console.log('✅ Profile successfully registered with server');
                        profile.syncedWithServer = true;
                        
                        // Ensure username is always saved correctly in the profile
                        if (!profile.username) {
                            profile.username = username;
                        }
                        
                        this.userProfile.saveProfile(profile);
                        apiService.setToken(result.token);
                        
                        // Sync stats immediately after successful registration
                        this.syncStats();
                        return { success: true, message: 'Profile registered successfully' };
                    }
                    
                    return { success: false, message: 'Registration failed' };
                } catch (registerError) {
                    // Handle 409 Conflict error specifically (username already exists)
                    if (registerError.message === 'Username already taken') {
                        console.log(`⚠️ Username ${username} already exists (caught during registration)`);
                        
                        // Mark the profile as synced with server
                        profile.syncedWithServer = true;
                        
                        // Ensure username is saved correctly
                        if (!profile.username) {
                            profile.username = username;
                        }
                        
                        this.userProfile.saveProfile(profile);
                        
                        // Update existing profile on server
                        await this.updateProfileOnServer(profile);
                        
                        return { success: true, message: 'Profile marked as synced with existing account' };
                    }
                    
                    // Re-throw any other errors
                    throw registerError;
                }
            } catch (error) {
                // If the error is from our register attempt with 409 status, it's already handled above
                if (error.message === 'Username already taken') {
                    throw error; // This will be caught by the outer catch block
                }
                
                // For connection errors or other issues checking username existence,
                // attempt direct registration and handle 409 errors there
                console.warn('Username check failed:', error);
                
                try {
                    const result = await apiService.register({
                        username: username,
                        avatarId: profile.avatarId,
                        profilePicture: profile.picture
                    });
                    
                    if (result && result.token) {
                        console.log('✅ Profile successfully registered with server');
                        profile.syncedWithServer = true;
                        
                        if (!profile.username) {
                            profile.username = username;
                        }
                        
                        this.userProfile.saveProfile(profile);
                        apiService.setToken(result.token);
                        
                        this.syncStats();
                        return { success: true, message: 'Profile registered successfully' };
                    }
                    
                    return { success: false, message: 'Registration failed' };
                } catch (registerError) {
                    // Handle 409 Conflict error
                    if (registerError.message === 'Username already taken') {
                        console.log(`⚠️ Username ${username} already exists (caught during registration)`);
                        
                        profile.syncedWithServer = true;
                        
                        if (!profile.username) {
                            profile.username = username;
                        }
                        
                        this.userProfile.saveProfile(profile);
                        await this.updateProfileOnServer(profile);
                        
                        return { success: true, message: 'Profile marked as synced with existing account' };
                    }
                    
                    throw registerError;
                }
            }
        } catch (error) {
            console.error('❌ Error registering profile with server:', error);
            return { success: false, error: error.message };
        }
    }
    
    // New method to update existing profile on server without registration
    async updateExistingProfileOnServer(profile) {
        try {
            if (!profile.username) {
                console.error("❌ Cannot update profile on server: Missing username");
                return false;
            }
            
            console.log(`🔄 Updating existing profile for ${profile.username} on server`);
            
            // Update profile data
            await apiService.updateProfile({
                username: profile.username,  // Only use profile.username
                gender: profile.gender,
                profilePicture: profile.picture,
                avatarId: profile.avatarId
            }).then(() => {
                console.log('✅ Profile data updated successfully');
            }).catch(err => {
                console.warn("❌ Failed to update profile:", err);
            });
            
            // Update stats data
            const statsToSync = {
                gamesPlayed: profile.gamesPlayed || 0,
                bestLevel: profile.bestLevel || 1,
                totalWins: profile.totalWins || 0,
                totalAttempts: profile.totalAttempts || 0
            };
            
            console.log(`📊 Syncing stats for existing user ${profile.username}:`, statsToSync);
            
            await apiService.updateUserStats(profile.username, statsToSync)
                .then(() => {
                    console.log('✅ Stats updated successfully for existing user');
                })
                .catch(err => {
                    console.warn(`❌ Error updating stats for existing user ${profile.username}:`, err);
                });
                
            return true;
        } catch (error) {
            console.error('❌ Error updating existing profile on server:', error);
            return false;
        }
    }

    // Keep existing handleExistingUsername method but update it to use username correctly
    handleExistingUsername(profile) {
        // FIX: Use consistent username handling
        const baseUsername = profile.username || profile.name;
        const newUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
        console.log(`🔄 Generating new username: ${newUsername}`);
        
        // Update the profile with the new username and save
        profile.username = newUsername;
        this.userProfile.saveProfile(profile);
        this.registerProfileWithServer(profile);
    }

    updateProfileOnServer(profile) {
        console.log("📤 Syncing profile data to server...");
        
        // Use consistent username handling
        const username = profile.username || profile.name;
        
        if (!username) {
            console.error("❌ Cannot update profile: Missing username");
            return;
        }
        
        // Update profile data
        apiService.updateProfile({
            username: username,
            gender: profile.gender,
            profilePicture: profile.picture,
            avatarId: profile.avatarId
        }).catch(err => {
            console.warn("❌ Failed to update profile:", err);
            console.log("🕒 Will automatically retry in the next sync cycle");
        });

        // Update stats data
        console.log("📤 Syncing stats to server...");
        apiService.updateUserStats(username, {
            gamesPlayed: profile.gamesPlayed || 0,
            bestLevel: profile.bestLevel || 1,
            totalWins: profile.totalWins || 0,
            totalAttempts: profile.totalAttempts || 0
        }).catch(err => {
            console.warn(`❌ Error syncing stats for user ${username}:`, err);
            console.log("🕒 Will automatically retry in the next sync cycle");
        });
    }
    
    // Add new method to sync stats specifically after a game ends
    syncGameStats(gameData) {
        try {
            const profile = this.userProfile.getProfile();
            if (!profile) {
                console.warn("No profile found for game stats sync");
                return;
            }
            
            // FIX: Use consistent username handling - this is critical for syncing
            const username = profile.username || profile.name;
            
            if (!username) {
                console.error("❌ Cannot sync game stats: Missing username");
                return;
            }
            
            // Always sync game stats regardless of syncedWithServer flag
            console.log(`🎮 Syncing game stats for ${username} after game completion...`);
            
            apiService.updateUserStats(username, {
                gamesPlayed: profile.gamesPlayed,
                bestLevel: profile.bestLevel,
                totalWins: profile.totalWins || 0,
                totalAttempts: profile.totalAttempts || 0
            }).then(() => {
                console.log("✅ Game stats synced successfully");
            }).catch(err => {
                console.warn(`❌ Error syncing game stats for user ${username}:`, err);
            });
        } catch (error) {
            console.error("Error attempting to sync game stats:", error);
        }
    }

    // Enhanced stats synchronization method
    syncStats() {
        try {
            console.log('🔄 SyncManager.syncStats() called');
            const profile = this.userProfile.getProfile();
            
            // Debug output for game state and target number
            console.log('🎯 Current game state:', 
                gameState ? {
                    level: gameState.level,
                    attempts: gameState.attempts,
                    maxAttempts: gameState.maxAttempts,
                    randomNumber: gameState.randomNumber,
                    gameOver: gameState.gameOver
                } : 'Not available');
            
            if (!profile) {
                console.warn('⚠️ No profile found for stats sync');
                return;
            }
            
            // FIX: Use consistent username handling - this is critical for syncing
            const username = profile.username || profile.name;
            
            if (!username) {
                console.warn('⚠️ Profile has no username, cannot sync stats');
                return;
            }
            
            // Always sync stats regardless of syncedWithServer flag
            const statsToSync = {
                gamesPlayed: profile.gamesPlayed || 0,
                bestLevel: profile.bestLevel || 1,
                totalWins: profile.totalWins || 0,
                totalAttempts: profile.totalAttempts || 0
            };
            
            console.log(`📊 Syncing stats for ${username}:`, statsToSync);
            
            apiService.updateUserStats(username, statsToSync)
                .then(response => {
                    console.log('✅ Stats synced successfully:', response);
                })
                .catch(error => {
                    console.error('❌ Failed to sync stats:', error);
                });
        } catch (error) {
            console.error('❌ Error in SyncManager.syncStats():', error);
        }
    }
}

// Delayed initialization to account for Render cold start
document.addEventListener('DOMContentLoaded', () => {
    console.log("🕒 Delaying sync initialization for 15 seconds to allow backend to warm up...");
    
    // Delay the start of sync to give Render time to spin up
    setTimeout(() => {
        console.log("⏰ Initializing sync manager after warm-up delay");
        const syncManager = new SyncManager();
        syncManager.startSync();
        window.syncManager = syncManager;
    }, 15000); // 15 second delay
});
