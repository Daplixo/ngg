/**
 * Keyboard Re-initialization
 * Force re-initializes the keyboard to ensure it works
 */

(function() {
    console.log("Keyboard re-initialization script loaded");
    
    function reinitializeKeyboard() {
        try {
            // Try to import and run keyboard initialization again
            import('./keyboard.js').then(module => {
                if (module && module.initKeyboard) {
                    console.log("Forcing keyboard re-initialization...");
                    module.initKeyboard();
                    console.log("Keyboard re-initialized successfully");
                }
            }).catch(err => {
                console.error("Error importing keyboard module:", err);
            });
        } catch (err) {
            console.error("Error in keyboard re-initialization:", err);
        }
    }
    
    // Wait for DOM content to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Give time for other scripts to initialize first
        setTimeout(reinitializeKeyboard, 500);
    });
    
    // Also run after a delay regardless of DOM state
    setTimeout(reinitializeKeyboard, 1000);
    
    // Make the function globally available for manual fixing if needed
    window.reinitializeKeyboard = reinitializeKeyboard;
})();
