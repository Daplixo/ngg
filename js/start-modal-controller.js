/**
 * Start Modal Controller - Ensures the Start Playing modal is only shown once
 */
(function() {
    console.log("Start Modal Controller initialized");
    
    // Global state tracking
    let modalAlreadyShown = false;
    let modalShowing = false;
    let profileCreationTime = null;
    
    // Function to patch GameLogic.showStartGamePrompt
    function patchGameLogic() {
        if (window.GameLogic && typeof window.GameLogic.showStartGamePrompt === 'function') {
            console.log("Patching GameLogic.showStartGamePrompt");
            
            // Store the original method
            const originalShowStartGamePrompt = window.GameLogic.showStartGamePrompt;
            
            // Replace with controlled version
            window.GameLogic.showStartGamePrompt = function() {
                // Skip if a profile was just created
                if (profileCreationTime && (Date.now() - profileCreationTime < 2000)) {
                    console.log("Start prompt suppressed - too soon after profile creation");
                    return;
                }
                
                // Skip if modal was already shown or is currently showing
                if (modalAlreadyShown || modalShowing) {
                    console.log("Start prompt suppressed - already shown or showing");
                    return;
                }
                
                console.log("Showing start prompt (controlled)");
                modalShowing = true;
                
                // Call original method
                originalShowStartGamePrompt.apply(this, arguments);
            };
            
            console.log("GameLogic.showStartGamePrompt successfully patched");
        }
    }
    
    // Patch InitialProfileSetup.handleProfileCreationComplete
    function patchProfileSetup() {
        // Find the InitialProfileSetup class
        if (window.InitialProfileSetup && window.InitialProfileSetup.prototype) {
            console.log("Patching InitialProfileSetup.handleProfileCreationComplete");
            
            // Store original method
            const originalHandleProfileCreationComplete = 
                window.InitialProfileSetup.prototype.handleProfileCreationComplete;
            
            // Replace with controlled version
            window.InitialProfileSetup.prototype.handleProfileCreationComplete = function() {
                console.log("Profile creation complete (controlled)");
                
                // Record profile creation time
                profileCreationTime = Date.now();
                modalAlreadyShown = true;
                
                // Remove any existing modal
                const existingModal = document.getElementById('startGamePrompt');
                if (existingModal && existingModal.parentNode) {
                    existingModal.parentNode.removeChild(existingModal);
                }
                
                // Call the original method
                originalHandleProfileCreationComplete.apply(this, arguments);
            };
            
            console.log("InitialProfileSetup.handleProfileCreationComplete successfully patched");
        }
    }
    
    // Function to initialize the controller
    function initialize() {
        // Attempt to patch both modules
        patchGameLogic();
        patchProfileSetup();
        
        // Set a global hook to control modal state
        window.setStartModalShown = function(shown) {
            modalAlreadyShown = shown;
            console.log("Start modal state set to:", shown);
        };
    }
    
    // Run on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initialize);
    
    // Also try immediately in case DOMContentLoaded already fired
    initialize();
    
    // Try again after a delay to ensure modules are loaded
    setTimeout(initialize, 500);
})();
