/**
 * Auto-fixer for Number Guessing Game MongoDB issues
 * This script runs immediately to fix any connectivity issues
 */

console.log("🔧 Auto-fixing game functionality...");

// Emergency GameLogic and gameState access
(function importCriticalModules() {
    try {
        // Force GameLogic to be globally accessible
        import('./gameLogic.js')
            .then(module => {
                window.GameLogic = module.GameLogic;
                console.log("✅ GameLogic globally accessible");
                
                // Initialize game if needed
                if (!window._gameInitialized) {
                    setTimeout(() => {
                        try {
                            window.GameLogic.initGame();
                            window._gameInitialized = true;
                            console.log("✅ Game initialized via autofix");
                        } catch(e) {
                            console.error("Failed auto-initialization:", e);
                        }
                    }, 200);
                }
            })
            .catch(err => console.error("Failed to import GameLogic:", err));
        
        // Force gameState to be globally accessible
        import('./gameState.js')
            .then(module => {
                window.gameState = module.gameState;
                console.log("✅ gameState globally accessible");
            })
            .catch(err => console.error("Failed to import gameState:", err));
    } catch (e) {
        console.error("Module import failed:", e);
    }
})();

// Repair event listeners after a short delay
setTimeout(() => {
    try {
        // Fix submit button
        const submitBtn = document.getElementById('submitGuessBtn');
        const userGuess = document.getElementById('userGuess');
        
        if (submitBtn && userGuess) {
            const newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);
            
            newBtn.addEventListener('click', function() {
                if (window.GameLogic && window.GameLogic.checkGuess) {
                    window.GameLogic.checkGuess(userGuess.value);
                    userGuess.value = '';
                    userGuess.focus();
                } else {
                    console.error("GameLogic not available for submit");
                }
            });
            
            console.log("✅ Submit button repaired");
        }
        
        // Fix keyboard
        import('./keyboard.js')
            .then(module => {
                if (module.initKeyboard) {
                    module.initKeyboard();
                    console.log("✅ Custom keyboard initialized");
                }
            })
            .catch(e => console.error("Keyboard init failed:", e));
        
        // MODIFIED: Don't force offline mode, just initialize API service
        import('./api/apiService.js')
            .then(module => {
                if (module.apiService) {
                    window.apiService = module.apiService;
                    console.log("✅ API service initialized");
                }
            })
            .catch(e => console.error("API service init failed:", e));
            
    } catch (e) {
        console.error("Event listener repair failed:", e);
    }
}, 500);

// Add a periodic sync function to automatically sync with server
function setupPeriodicSync() {
    const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    setInterval(() => {
        try {
            // Only sync if user has a profile that's marked for server sync
            const userProfile = new UserProfile();
            const profile = userProfile.getProfile();
            
            if (profile && profile.syncedWithServer) {
                import('./api/apiService.js').then(module => {
                    const apiService = module.apiService;
                    if (apiService.token && !apiService.offlineMode) {
                        console.log("Performing periodic sync with server");
                        
                        // Sync profile stats
                        apiService.updateStats({
                            gamesPlayed: profile.gamesPlayed,
                            bestLevel: profile.bestLevel
                        }).catch(e => console.warn('Periodic stats sync failed:', e));
                        
                        // Fetch server profile to resolve any conflicts
                        apiService.getUserProfile().then(serverProfile => {
                            if (serverProfile) {
                                // Only update local profile if server has newer data
                                if (serverProfile.stats.bestLevel > profile.bestLevel) {
                                    profile.bestLevel = serverProfile.stats.bestLevel;
                                    userProfile.saveProfile(profile);
                                }
                                
                                // Update UI if needed
                                const profileUI = new UserProfileUI();
                                profileUI.updateProfileDisplay();
                            }
                        }).catch(e => console.warn('Periodic profile fetch failed:', e));
                    }
                }).catch(e => console.warn('API module load failed in periodic sync:', e));
            }
        } catch (e) {
            console.warn('Error in periodic sync:', e);
        }
    }, SYNC_INTERVAL);
}

// Set up periodic sync on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure everything else is loaded
    setTimeout(setupPeriodicSync, 10000);
});

// REMOVED: The code that added the "Repair Game" button has been removed
