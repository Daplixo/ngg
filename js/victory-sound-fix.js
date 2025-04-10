/**
 * Victory Sound Fix
 * Preloads the victory sound to prevent delays when winning the game
 */

(function() {
    console.log("Victory sound fix: Preloading victory sound");
    
    // Create a preloaded audio element
    const victorySound = new Audio('assets/sounds/victory.mp3');
    
    // Set to low volume during preload
    victorySound.volume = 0.01;
    
    // Preload the audio file
    victorySound.preload = 'auto';
    
    // Load a small part of it and then pause it
    const preloadSound = () => {
        // Only try to play if user has interacted with the page
        if (document.hasFocus() && document.visibilityState === 'visible') {
            victorySound.play()
                .then(() => {
                    // Immediately pause after loading starts
                    setTimeout(() => {
                        victorySound.pause();
                        victorySound.currentTime = 0;
                        console.log("Victory sound preloaded successfully");
                    }, 50);
                })
                .catch(err => {
                    // This is expected if the user hasn't interacted yet
                    console.log("Victory sound will be preloaded after user interaction");
                });
        }
    };
    
    // Try to preload after a short delay
    setTimeout(preloadSound, 2000);
    
    // Also try again after user interaction
    document.addEventListener('click', function preloadAfterInteraction() {
        setTimeout(preloadSound, 100);
        // Remove the event listener after first interaction
        document.removeEventListener('click', preloadAfterInteraction);
    });
    
    // Store the preloaded sound in window object for later use
    window.preloadedVictorySound = victorySound;
})();
