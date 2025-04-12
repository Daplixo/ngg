/**
 * Keyboard Sound Effect
 * Adds custom sound effect specifically for the calculator-style keyboard buttons
 */

(function() {
    // Dedicated keyboard button sound function with optimized playback
    function playKeyboardButtonSound() {
        // First attempt to use the preloaded sound system for instant playback
        if (window.keyboardSoundSystem && typeof window.keyboardSoundSystem.play === 'function') {
            window.keyboardSoundSystem.play(0.4);
            return;
        }
        
        // Fallback to standard audio if preloaded sound isn't available
        try {
            const sound = new Audio('assets/sounds/keyboard-button.mp3');
            sound.volume = 0.4; 
            
            // Force immediate playback with high priority
            sound.preload = 'auto';
            sound.currentTime = 0;
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.debug('Could not play keyboard button sound:', err);
                });
            }
        } catch (err) {
            console.debug('Error playing keyboard button sound:', err);
        }
    }
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // We'll let keyboard.js handle the button functionality
        // Just expose the sound function globally
        console.log("Keyboard sound effect initialized");
    });

    // Make the function available globally 
    window.playKeyboardButtonSound = playKeyboardButtonSound;
})();
