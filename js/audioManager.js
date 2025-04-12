// Improved AudioManager with preloading and single audio context

// Create a single shared audio context at module level
let audioContext = null;
let audioInitialized = false;
let oscillatorNode = null;
let gainNode = null;

// Sound cache to avoid repeated loading
const soundCache = {};

export const AudioManager = {
    // Initialize audio context on first user interaction
    init() {
        if (audioInitialized) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create and cache the gain and oscillator nodes for beep sounds
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0; // Start silent
            
            // Create but don't start the oscillator
            oscillatorNode = audioContext.createOscillator();
            oscillatorNode.type = 'sine';
            oscillatorNode.connect(gainNode);
            oscillatorNode.start();
            
            audioInitialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Failed to initialize audio system:', error);
        }
    },

    // Preload sounds to avoid delays
    preloadSounds() {
        this.init();
        if (!audioContext) return;
        
        // Define sounds to preload
        const sounds = {
            'levelCleared': 'assets/notification.wav',
            'gameOver': 'assets/gameover.wav'
        };
        
        // Preload each sound
        Object.entries(sounds).forEach(([key, url]) => {
            fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    soundCache[key] = audioBuffer;
                    console.log(`Sound '${key}' preloaded`);
                })
                .catch(error => {
                    console.warn(`Failed to preload sound '${key}':`, error);
                });
        });
    },
    
    // Play sound with improved reliability
    play(soundName) {
        this.init();
        if (!audioContext) return;
        
        try {
            // Handle preloaded sounds
            if (soundCache[soundName]) {
                // Create a new source from the buffer
                const source = audioContext.createBufferSource();
                source.buffer = soundCache[soundName];
                source.connect(audioContext.destination);
                source.start(0);
                return;
            }
            
            // Fallback to loading the sound if not cached
            fetch(`assets/${soundName}.wav`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    // Cache for future use
                    soundCache[soundName] = audioBuffer;
                    
                    // Play the sound
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.start(0);
                })
                .catch(error => {
                    console.warn(`Failed to play sound '${soundName}':`, error);
                });
        } catch (error) {
            console.warn(`Error playing sound '${soundName}':`, error);
        }
    },
    
    // Play beep sound with immediate response (for wrong guesses)
    playBeep(isGameOver = false) {
        this.init();
        if (!audioContext || !oscillatorNode || !gainNode) return;
        
        try {
            // Reset the audio context if it's suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // Configure oscillator
            oscillatorNode.frequency.setValueAtTime(
                isGameOver ? 180 : 220, 
                audioContext.currentTime
            );
            
            // Set duration based on type
            const duration = isGameOver ? 0.8 : 0.15;
            
            // Use audio parameter automation for precise timing
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                isGameOver ? 0.3 : 0.15, 
                audioContext.currentTime + 0.01
            );
            gainNode.gain.linearRampToValueAtTime(
                0,
                audioContext.currentTime + duration
            );
        } catch (error) {
            console.warn('Error playing beep sound:', error);
        }
    },
    
    // Play victory sound
    playVictorySound() {
        try {
            // Use preloaded sound if available
            if (window.preloadedVictorySound) {
                console.log('Using preloaded victory sound');
                // Reset volume to normal level
                window.preloadedVictorySound.volume = 0.7;
                // Play the preloaded sound
                window.preloadedVictorySound.play().catch(err => {
                    console.warn('Could not play preloaded victory sound:', err);
                    // Fallback to creating a new audio object
                    this.playFallbackVictorySound();
                });
            } else {
                // Fallback if preloaded sound is not available
                this.playFallbackVictorySound();
            }
        } catch (error) {
            console.warn('Error playing victory sound:', error);
            // Try one more time with the fallback
            this.playFallbackVictorySound();
        }
    },
    
    // Fallback method to play victory sound if preloaded one fails
    playFallbackVictorySound() {
        try {
            // Create a new audio object for victory sound
            const victorySound = new Audio('assets/sounds/victory.mp3');
            
            // Set volume
            victorySound.volume = 0.7;
            
            // Play the sound
            victorySound.play().catch(err => {
                console.warn('Could not play victory sound:', err);
            });
        } catch (error) {
            console.warn('Error in fallback victory sound:', error);
        }
    },
    
    // Play button click sound with optimal performance
    playButtonClick() {
        this.init();
        if (!audioContext) return;
        
        try {
            // If sound is already cached, use it
            if (soundCache['buttonClick']) {
                // Create a new source from the buffer
                const source = audioContext.createBufferSource();
                source.buffer = soundCache['buttonClick'];
                
                // Create a gain node for volume control
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0.5; // 50% volume
                
                // Connect nodes
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Play the sound
                source.start(0);
                return;
            }
            
            // If not cached, load the sound - now using WAV file
            fetch('assets/sounds/button-click.wav')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    // Cache for future use
                    soundCache['buttonClick'] = audioBuffer;
                    
                    // Play the sound
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    
                    // Create a gain node for volume control
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 0.5; // 50% volume
                    
                    // Connect nodes
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Play the sound
                    source.start(0);
                })
                .catch(error => {
                    console.warn('Failed to play button click sound:', error);
                    this.playFallbackButtonClick();
                });
        } catch (error) {
            console.warn('Error in button click sound:', error);
            this.playFallbackButtonClick();
        }
    },
    
    // Fallback method to play button click sound if AudioContext fails
    playFallbackButtonClick() {
        try {
            // Create a new audio object - now using WAV file
            const buttonSound = new Audio('assets/sounds/button-click.wav');
            
            // Set volume
            buttonSound.volume = 0.5;
            
            // Play the sound
            buttonSound.play().catch(err => {
                console.debug('Could not play button click sound:', err);
            });
        } catch (error) {
            console.debug('Error in fallback button click sound:', error);
        }
    },
    
    // Resume audio context on user interaction
    resumeAudio() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(error => {
                console.warn('Failed to resume AudioContext:', error);
            });
        }
    }
};

// Initialize on page load for better responsiveness
document.addEventListener('DOMContentLoaded', () => {
    // Initialize on first user interaction to comply with browser policies
    const initOnInteraction = () => {
        AudioManager.init();
        AudioManager.preloadSounds();
        
        // Remove these listeners after first interaction
        document.removeEventListener('click', initOnInteraction);
        document.removeEventListener('touchstart', initOnInteraction);
        document.removeEventListener('keydown', initOnInteraction);
    };
    
    document.addEventListener('click', initOnInteraction);
    document.addEventListener('touchstart', initOnInteraction);
    document.addEventListener('keydown', initOnInteraction);
});