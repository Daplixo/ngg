// Super simple audio management
export const AudioManager = {
    // Use Audio constructor instead of DOM elements
    play(soundName) {
        try {
            let soundPath;
            
            // Map sound names to file paths
            if (soundName === "levelCleared") {
                soundPath = "assets/notification.wav";
            } else if (soundName === "gameOver") {
                soundPath = "assets/gameover.wav";
            } else {
                console.error(`Unknown sound: ${soundName}`);
                return;
            }
            
            // Create a new Audio instance each time (more reliable)
            const sound = new Audio(soundPath);
            sound.volume = 1.0;
            
            // Play and handle errors
            sound.play()
                .catch(error => console.error(`Error playing sound: ${soundName}`, error));
                
        } catch (error) {
            console.error("Audio play failed:", error);
        }
    },
    
    // For API compatibility, keep this method
    stop(soundName) {
        // No need to implement - we're using new Audio objects each time
    }
}; 