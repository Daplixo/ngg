/**
 * Enhanced Stats Synchronization Debugger
 * 
 * This script helps verify that stats are correctly syncing to the backend
 * and specifically checks for username consistency issues.
 */

(function() {
    // Add the debug tools to the global window object
    window.statsDebug = {
        // Display current profile stats with username debugging
        showStats: function() {
            try {
                const profile = getUserProfile();
                if (!profile) {
                    console.log("❌ No user profile found");
                    return;
                }
                
                // Check for potential username issues
                if (!profile.username) {
                    console.error("⚠️ CRITICAL: Profile is missing username property!");
                } else if (profile.name && profile.name !== profile.username) {
                    console.warn("⚠️ INCONSISTENCY: profile.name differs from profile.username!");
                    console.warn(`   username: "${profile.username}" vs name: "${profile.name}"`);
                }
                
                console.log("📊 Current User Stats:", {
                    username: profile.username || "MISSING",
                    name: profile.name || "N/A",
                    nickname: profile.nickname,
                    syncedWithServer: !!profile.syncedWithServer,
                    gamesPlayed: profile.gamesPlayed || 0,
                    bestLevel: profile.bestLevel || 1,
                    totalWins: profile.totalWins || 0,
                    totalAttempts: profile.totalAttempts || 0
                });
            } catch (e) {
                console.error("Error accessing stats:", e);
            }
        },
        
        // Method to fix profile username issues
        fixUsername: function() {
            try {
                const profile = getUserProfile();
                if (!profile) {
                    console.log("❌ No user profile found to fix");
                    return;
                }
                
                // Check if there are issues to fix
                if (!profile.username && profile.name) {
                    console.log(`🔧 Setting missing username to: ${profile.name}`);
                    profile.username = profile.name;
                    saveUserProfile(profile);
                    console.log("✅ Username fixed");
                } else if (!profile.username && !profile.name) {
                    console.error("❌ Cannot fix username: Both username and name are missing!");
                } else {
                    console.log("✅ No username issues detected");
                }
                
                this.showStats();
            } catch (e) {
                console.error("Error fixing username:", e);
            }
        },
        
        // Manually trigger a stats sync
        triggerSync: function() {
            console.log("🔄 Manually triggering stats sync");
            try {
                import('./syncManager.js').then(module => {
                    const syncManager = new module.SyncManager();
                    syncManager.syncStats();
                    console.log("✅ Sync triggered");
                }).catch(err => {
                    console.error("❌ Failed to load SyncManager:", err);
                });
            } catch (e) {
                console.error("Error triggering sync:", e);
            }
        },
        
        // Simulate a game completion to test sync
        simulateGame: function(win = true, level = 1) {
            console.log(`🎮 Simulating game completion: ${win ? 'WIN' : 'LOSS'} at level ${level}`);
            try {
                import('./userProfile.js').then(module => {
                    const userProfile = new module.UserProfile();
                    
                    userProfile.updateStatistics({
                        level: level,
                        hasWon: win,
                        attempts: 5
                    });
                    
                    console.log("✅ Game simulation complete");
                    this.showStats();
                }).catch(err => {
                    console.error("❌ Failed to load UserProfile:", err);
                });
            } catch (e) {
                console.error("Error simulating game:", e);
            }
        },
        
        // Helper for testing username-specific sync
        testSync: function() {
            try {
                const profile = getUserProfile();
                if (!profile) {
                    console.log("❌ No user profile found");
                    return;
                }
                
                if (!profile.username) {
                    console.error("❌ Cannot test sync: Missing username in profile");
                    return;
                }
                
                console.log(`🔄 Testing sync for username: ${profile.username}`);
                
                import('./api/apiService.js').then(module => {
                    const apiService = module.apiService;
                    apiService.updateUserStats(profile.username, {
                        gamesPlayed: profile.gamesPlayed || 0,
                        bestLevel: profile.bestLevel || 1,
                        totalWins: profile.totalWins || 0,
                        totalAttempts: profile.totalAttempts || 0
                    }).then(response => {
                        console.log("✅ Test sync successful:", response);
                    }).catch(error => {
                        console.error("❌ Test sync failed:", error);
                    });
                }).catch(err => {
                    console.error("Failed to load API service:", err);
                });
            } catch (e) {
                console.error("Error in test sync:", e);
            }
        }
    };
    
    // Helper function to get user profile
    function getUserProfile() {
        try {
            // Try to get it from window if already loaded
            if (window.userProfile && typeof window.userProfile.getProfile === 'function') {
                return window.userProfile.getProfile();
            }
            
            // Otherwise load from localStorage
            const profileData = localStorage.getItem('userProfileData');
            return profileData ? JSON.parse(profileData) : null;
        } catch (e) {
            console.error("Error getting user profile:", e);
            return null;
        }
    }
    
    // Helper function to save user profile
    function saveUserProfile(profile) {
        try {
            localStorage.setItem('userProfileData', JSON.stringify(profile));
            return true;
        } catch (e) {
            console.error("Error saving user profile:", e);
            return false;
        }
    }
    
    // Add console message to indicate debug tools are available
    console.log("📊 Enhanced Stats Sync Debug Tools loaded. Available commands:");
    console.log("• window.statsDebug.showStats() - Show current profile stats");
    console.log("• window.statsDebug.fixUsername() - Fix username issues");
    console.log("• window.statsDebug.triggerSync() - Manually trigger stats sync");
    console.log("• window.statsDebug.testSync() - Test direct username sync");
    console.log("• window.statsDebug.simulateGame(win, level) - Simulate game completion");
    
    // Run an initial scan for username issues
    setTimeout(() => {
        try {
            const profile = getUserProfile();
            if (profile && !profile.username && profile.name) {
                console.warn("⚠️ WARNING: Detected profile with missing username property!");
                console.warn("   Run window.statsDebug.fixUsername() to fix this issue");
            }
        } catch (e) {
            // Silent catch
        }
    }, 2000);
})();
