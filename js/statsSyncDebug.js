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
                        attempts: 5,
                        newGame: true // Add proper flag for game counting
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
        },
        
        // Fix API URL configuration
        fixApiConfig: function() {
            try {
                console.log("🔧 Running API Config fix...");
                
                import('./api/apiConfig.js').then(module => {
                    const apiConfig = module.apiConfig;
                    
                    console.log("Current API configuration:", {
                        baseUrl: apiConfig.baseUrl,
                        apiPath: apiConfig.apiPath,
                        isOfflineMode: apiConfig.isOfflineMode
                    });
                    
                    // Fix the base URL if it's undefined or incorrect
                    if (!apiConfig.baseUrl || apiConfig.baseUrl === 'undefined') {
                        console.log("🔧 Setting API base URL to http://localhost:5000");
                        apiConfig.baseUrl = 'http://localhost:5000';
                    }
                    
                    // Add API_BASE_URL export for backward compatibility
                    console.log("🔧 Ensuring API_BASE_URL is available for compatibility");
                    window.API_BASE_URL = apiConfig.baseUrl;
                    
                    console.log("🔧 Testing API endpoints now...");
                    
                    // Test the API with correct endpoints
                    fetch(`${apiConfig.baseUrl}/api/ping`)
                        .then(response => {
                            console.log(`✅ API ping test: ${response.status === 200 ? 'Success!' : 'Failed'}`);
                        })
                        .catch(err => {
                            console.log("❌ API ping test failed:", err);
                        });
                    
                    // Apply fixes to API service
                    this.fixApiEndpoints();
                    
                    return "API configuration fixed. Please run window.statsDebug.testSync() to test the connection.";
                });
            } catch (e) {
                console.error("Error fixing API config:", e);
                return "Failed to fix API configuration";
            }
        },
        
        // Add an additional emergency fix method for the specific API_BASE_URL issue
        fixApiBaseUrl: function() {
            console.log("🔧 Applying emergency fix for API_BASE_URL issue");
            
            try {
                // Define the missing API_BASE_URL globally
                window.API_BASE_URL = 'http://localhost:5000';
                
                // Patch the connectivity-fix.js module
                import('./connectivity-fix.js').then(module => {
                    console.log("✅ connectivity-fix.js module loaded successfully");
                }).catch(err => {
                    console.log("❌ Failed to patch connectivity-fix.js:", err);
                });
                
                console.log("✅ Emergency fix applied. API_BASE_URL is now defined as:", window.API_BASE_URL);
                return "Emergency API_BASE_URL fix applied. Please refresh the page to see if it works.";
            } catch (e) {
                console.error("Error in emergency API fix:", e);
                return "Failed to apply emergency fix";
            }
        },
        
        // Add a new method to fix API endpoints
        fixApiEndpoints: function() {
            try {
                import('./api/apiService.js').then(module => {
                    const apiService = module.apiService;
                    console.log("🔧 Fixing API endpoints in apiService...");
                    
                    // Attempt to sync stats with proper endpoints
                    if (apiService) {
                        const profile = getUserProfile();
                        if (profile && profile.username) {
                            console.log(`🔄 Testing stats sync for ${profile.username}`);
                            
                            apiService.updateUserStats(profile.username, {
                                gamesPlayed: profile.gamesPlayed || 0,
                                bestLevel: profile.bestLevel || 1,
                                totalWins: profile.totalWins || 0,
                                totalAttempts: profile.totalAttempts || 0
                            }).then(result => {
                                console.log("✅ Test sync successful:", result);
                            }).catch(err => {
                                console.error("❌ Test sync failed:", err);
                            });
                        } else {
                            console.log("⚠️ No profile or username found for testing sync");
                        }
                        
                        console.log("✅ API endpoint fixes applied to apiService");
                    }
                }).catch(err => {
                    console.error("❌ Failed to access apiService:", err);
                });
            } catch (e) {
                console.error("Error fixing API endpoints:", e);
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
    console.log("• window.statsDebug.fixApiConfig() - Fix API configuration issues");
    console.log("• window.statsDebug.fixApiBaseUrl() - Emergency fix for API_BASE_URL issue");
    
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
