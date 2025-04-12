/**
 * Keyboard Sound Preloader
 * Preloads the keyboard sound to eliminate delay when typing
 */

(function() {
    console.log("Keyboard sound preloader: Initializing");
    
    // Create a singleton audio context
    let audioContext = null;
    let keyboardSoundBuffer = null;
    let isPreloaded = false;
    
    // Function to preload and cache the keyboard sound
    async function preloadKeyboardSound() {
        if (isPreloaded) return;
        
        try {
            // Create audio context if needed
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            console.log("Preloading keyboard sound...");
            
            // Fetch and decode the audio file
            const response = await fetch('assets/sounds/keyboard-button.mp3');
            const arrayBuffer = await response.arrayBuffer();
            keyboardSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            console.log("Keyboard sound successfully preloaded");
            isPreloaded = true;
            
            // Make the preloaded sound available globally
            window.keyboardSoundSystem = {
                play: function(volume = 0.4) {
                    if (!audioContext || !keyboardSoundBuffer) return;
                    
                    try {
                        // Resume audio context if suspended
                        if (audioContext.state === 'suspended') {
                            audioContext.resume();
                        }
                        
                        // Create a new source node for each play
                        const source = audioContext.createBufferSource();
                        source.buffer = keyboardSoundBuffer;
                        
                        // Add volume control
                        const gainNode = audioContext.createGain();
                        gainNode.gain.value = volume;
                        
                        // Connect nodes and play
                        source.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        // Start immediately with no delay
                        source.start(0);
                    } catch (err) {
                        console.debug("Error playing preloaded keyboard sound:", err);
                    }
                }
            };
        } catch (error) {
            console.warn("Failed to preload keyboard sound:", error);
        }
    }
    
    // Try to preload after a short delay
    setTimeout(function() {
        if (document.visibilityState === 'visible') {
            preloadKeyboardSound();
        }
    }, 1000);
    
    // Also try to preload after user interaction
    const preloadAfterInteraction = function() {
        preloadKeyboardSound();
        document.removeEventListener('click', preloadAfterInteraction);
        document.removeEventListener('touchstart', preloadAfterInteraction);
        document.removeEventListener('keydown', preloadAfterInteraction);
    };
    
    document.addEventListener('click', preloadAfterInteraction);
    document.addEventListener('touchstart', preloadAfterInteraction);
    document.addEventListener('keydown', preloadAfterInteraction);
    
    // Also preload on visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            preloadKeyboardSound();
        }
    });
})();
