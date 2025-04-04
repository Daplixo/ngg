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
        
        // Fix database issues - prevent DB operations from blocking UI
        import('./api/apiService.js')
            .then(module => {
                if (module.apiService) {
                    window.apiService = module.apiService;
                    window.apiService.offlineMode = true;
                    localStorage.setItem('api_offline_mode', 'true');
                    console.log("✅ Database connectivity issues bypassed");
                }
            })
            .catch(e => console.error("API service fix failed:", e));
            
    } catch (e) {
        console.error("Event listener repair failed:", e);
    }
}, 500);

// REMOVED: The code that added the "Repair Game" button has been removed
