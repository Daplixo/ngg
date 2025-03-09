import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { GameLogic } from './gameLogic.js';

// Shake animation function - make it global
window.addShake = function(element) {
  if (!element) return;
  
  // Add the class to trigger the animation
  element.classList.add('shake');
  
  // Remove focus to improve the visual effect
  element.blur();
  
  // Remove the class after the animation completes
  setTimeout(() => {
    if (element) {
      element.classList.remove('shake');
    }
  }, 500);
}

// Function to play wrong sound with volume control - make it global
window.playWrongSound = function(isGameOver = false) {
  // Get the existing game over sound element or create one if not already defined
  let gameOverSound = document.getElementById('gameOverSound');
  
  if (!gameOverSound) {
    // If the sound element doesn't exist yet, we'll look for it in the typical locations
    // Try common locations for the sound file
    const possiblePaths = [
      'assets/sounds/game-over.mp3',
      'assets/sounds/gameover.mp3',
      'assets/audio/game-over.mp3',
      'assets/audio/gameover.mp3'
    ];
    
    // Create audio element
    gameOverSound = new Audio();
    gameOverSound.id = 'gameOverSound';
    document.body.appendChild(gameOverSound);
    
    // Try each possible path
    for (const path of possiblePaths) {
      try {
        gameOverSound.src = path;
        break;
      } catch (e) {
        console.log(`Sound not found at ${path}`);
      }
    }
  }
  
  // Set volume based on whether it's game over or just a wrong guess
  gameOverSound.volume = isGameOver ? 1.0 : 0.3;
  
  // Reset sound to beginning if it's already playing
  gameOverSound.currentTime = 0;
  
  // Play the sound
  gameOverSound.play().catch(error => {
    console.log('Error playing sound:', error);
    // Browser might prevent autoplay, user needs to interact first
  });
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game state
    gameState.reset(true);

    // Get DOM elements
    UIManager.elements = {
        levelIndicator: document.getElementById('level-indicator'),
        rangeInfo: document.getElementById('range-info'),
        userGuess: document.getElementById('userGuess'),
        submitGuessBtn: document.getElementById('submitGuessBtn'),
        feedback: document.getElementById('feedback'),
        attempts: document.getElementById('attempts'),
        continueBtn: document.getElementById('continueBtn'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        restartBtn: document.getElementById('restartBtn'),
        winNotification: document.getElementById('winNotification'),
        gameOverNotification: document.getElementById('gameOverNotification')
    };
    
    // Add sound and animation effects (our additions)
    addSoundAndAnimationEffects();

    // Focus the input field immediately
    UIManager.elements.userGuess.focus();

    // Set submit button click event
    UIManager.elements.submitGuessBtn.addEventListener('click', () => {
        GameLogic.checkGuess(UIManager.elements.userGuess.value);
        UIManager.elements.userGuess.value = '';
        UIManager.elements.userGuess.focus();
    });

    // Set continue button click event
    UIManager.elements.continueBtn.addEventListener('click', () => {
        GameLogic.continueNextLevel();
    });

    // Set play again button click event
    UIManager.elements.playAgainBtn.addEventListener('click', () => {
        GameLogic.playAgain();
    });

    // Set restart button click event
    UIManager.elements.restartBtn.addEventListener('click', () => {
        GameLogic.restartGame();
    });

    // Set keypress event for enter key
    UIManager.elements.userGuess.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            GameLogic.handleKeyPress(event);
        }
    });

    // Initialize feedback modal
    initFeedbackModal();
});

// Add our sound and animation effects without disrupting existing code
function addSoundAndAnimationEffects() {
    // Add shake animation function to window
    window.addShake = function(element) {
        if (!element) return;
        
        // Add the class to trigger the animation
        element.classList.add('shake');
        
        // Remove focus to improve the visual effect
        element.blur();
        
        // Remove the class after the animation completes
        setTimeout(() => {
            if (element) {
                element.classList.remove('shake');
            }
        }, 500);
    };

    // Create programmatic sound instead of relying on external files
    window.playWrongSound = function(isGameOver = false) {
        try {
            // Create audio context
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // Configure oscillator
            oscillator.type = 'sine';
            oscillator.frequency.value = isGameOver ? 180 : 220; // Lower frequency for game over
            
            // Configure gain (volume)
            gainNode.gain.value = isGameOver ? 0.3 : 0.15; // Louder for game over
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Start and stop oscillator (short beep)
            oscillator.start();
            
            // Make game over sound longer
            const duration = isGameOver ? 0.8 : 0.2;
            
            // Stop after duration
            setTimeout(() => {
                oscillator.stop();
                // Disconnect nodes to prevent memory leaks
                oscillator.disconnect();
                gainNode.disconnect();
            }, duration * 1000);
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };
    
    // Keep input field focused at all times
    function keepInputFocused() {
        const inputElement = document.getElementById('userGuess');
        if (inputElement && !gameState.gameOver && !gameState.hasWon) {
            inputElement.focus();
        }
    }
    
    // Add focus event handlers
    window.addEventListener('click', function() {
        // Short delay to ensure clicks on buttons are processed first
        setTimeout(keepInputFocused, 50);
    });
    
    // Set interval to keep checking focus
    setInterval(keepInputFocused, 1000);
    
    // Initial focus
    setTimeout(keepInputFocused, 500);
}

// Initialize feedback modal
function initFeedbackModal() {
    // Get modal elements
    const modal = document.getElementById('feedbackModal');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const form = document.getElementById('feedbackForm');

    // Show modal when feedback button is clicked
    feedbackBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    // Hide modal when close button is clicked
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Hide modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
} 