/**
 * Debug helper for Number Guessing Game
 * Helps diagnose and fix runtime issues
 */

// Expose a browser-based debug function 
window.debugGame = function() {
    console.log("====================== GAME DEBUG ======================");
    
    // Check for module loading issues
    console.log("1. Module availability check:");
    try {
        console.log("- GameLogic methods:", Object.keys(window.GameLogic || {}));
        console.log("- GameState properties:", Object.keys(window.gameState || {}));
    } catch (e) {
        console.log("Error accessing modules:", e);
    }
    
    // Check DOM elements
    console.log("2. UI element check:");
    const criticalElements = [
        'userGuess', 'submitGuessBtn', 'playAgainBtn', 'continueBtn',
        'feedback', 'proximity-meter', 'proximity-fill'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`- ${id}: ${element ? 'Found' : 'MISSING'}`);
        if (element) {
            console.log(`  > Display: ${window.getComputedStyle(element).display}`);
            console.log(`  > Visibility: ${window.getComputedStyle(element).visibility}`);
        }
    });
    
    // Check current game state
    console.log("3. Game state check:");
    try {
        const gs = window.gameState || {};
        console.log(`- Level: ${gs.level}`);
        console.log(`- Max Number: ${gs.maxNumber}`);
        console.log(`- Random Number: ${gs.randomNumber}`);
        console.log(`- Game Over: ${gs.gameOver}`);
        console.log(`- Has Won: ${gs.hasWon}`);
    } catch (e) {
        console.log("Error accessing game state:", e);
    }
    
    // Force GameLogic restoration
    console.log("4. Attempting GameLogic restoration...");
    try {
        // Force imports to be globally available for debugging
        import('./gameLogic.js')
            .then(module => {
                window.GameLogic = module.GameLogic;
                console.log("GameLogic module imported to window object");
            })
            .catch(err => console.error("Failed to import GameLogic:", err));
            
        import('./gameState.js')
            .then(module => {
                window.gameState = module.gameState;
                console.log("gameState module imported to window object");
            })
            .catch(err => console.error("Failed to import gameState:", err));
    } catch (e) {
        console.log("Failed to restore modules:", e);
    }
    
    console.log("=======================================================");
    
    return "Debug complete. Check browser console for details.";
};

/**
 * Debug helper for Number Guessing Game
 * Helps diagnose and fix MongoDB connection issues
 */

// Force reconnect and restore functionality
window.fixGame = function() {
    console.log("🔧 Attempting to fix game functionality...");
    
    try {
        // 1. Make game state and logic globally accessible for debugging
        import('./gameState.js')
            .then(module => {
                window.gameState = module.gameState;
                console.log("✓ Game state module loaded");
            });
            
        import('./gameLogic.js')
            .then(module => {
                window.GameLogic = module.GameLogic;
                console.log("✓ Game logic module loaded");
                
                // Initialize the game after modules are loaded
                setTimeout(() => {
                    if (window.GameLogic && window.GameLogic.initGame) {
                        window.GameLogic.initGame();
                        console.log("✓ Game initialized");
                    }
                }, 300);
            });
        
        // 2. Check API & MongoDB connection status
        import('./api/apiService.js')
            .then(module => {
                window.apiService = module.apiService;
                console.log("✓ API service module loaded");
                
                // Disable API temporarily to prevent blocking
                window.apiService.available = false;
                console.log("⚠️ API functionality temporarily disabled to prevent blocking");
            });
        
        // 3. Reset any broken event listeners
        setTimeout(() => {
            // Get key DOM elements
            const submitBtn = document.getElementById('submitGuessBtn');
            const userGuess = document.getElementById('userGuess');
            
            if (submitBtn && userGuess) {
                // Clone and replace to remove old listeners
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                
                // Add fresh event listener
                newSubmitBtn.addEventListener('click', function() {
                    if (window.GameLogic && window.GameLogic.checkGuess) {
                        window.GameLogic.checkGuess(userGuess.value);
                        userGuess.value = '';
                        userGuess.focus();
                    }
                });
                
                console.log("✓ Submit button event handler restored");
            }
            
            // Setup keyboard
            try {
                import('./keyboard.js').then(module => {
                    if (module.initKeyboard) {
                        module.initKeyboard();
                        console.log("✓ Custom keyboard initialized");
                    }
                });
            } catch (e) {
                console.error("Failed to initialize keyboard:", e);
            }
        }, 500);
        
        return "Fix attempt complete. Game functionality should be restored.";
    } catch (e) {
        console.error("Error during fix attempt:", e);
        return "Fix attempt failed. See console for details.";
    }
};

// Run diagnostic
window.diagnoseMongoDB = function() {
    console.log("🔍 Diagnosing MongoDB connection issues...");
    
    // Check for API config
    try {
        import('./api/apiConfig.js')
            .then(module => {
                console.log("API Base URL:", module.API_BASE_URL);
                console.log("API Debug Mode:", module.apiConfig?.debug);
                
                // Test server ping
                fetch(`${module.API_BASE_URL}/ping`)
                    .then(response => response.json())
                    .then(data => console.log("Server ping response:", data))
                    .catch(err => console.error("Server ping failed:", err));
            });
    } catch (e) {
        console.error("Failed to load API config:", e);
    }
    
    return "MongoDB diagnostics running. Check console for details.";
};

// Auto-run fix when the page loads with a delay to ensure DOM is ready
setTimeout(() => {
    console.log("%c📢 Game repair tools available!", "color: #4CAF50; font-size: 16px; font-weight: bold;");
    console.log("%cType window.fixGame() to restore game functionality", "color: #2196F3;");
    console.log("%cType window.diagnoseMongoDB() to check server connection", "color: #2196F3;");
}, 1000);

// Add console message to notify about debug feature
console.log("%cGame Debug Helper", "color: #2eb82e; font-size: 14px; font-weight: bold;");
console.log("%cType window.debugGame() in console to diagnose issues", "color: #666;");

// Self-executing function to check for critical errors on load
(function() {
    // Check for common initial errors
    if (!window.gameState || !window.GameLogic) {
        console.warn("Game modules not properly loaded into window scope.");
    }
})();
