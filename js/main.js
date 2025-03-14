import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { GameLogic } from './gameLogic.js';

// Add a global flag to track modal state
window.isModalOpen = false;

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
    // Keep input field focused at all times, unless modal is open
    function keepInputFocused() {
        // Skip refocusing if modal is open
        if (window.isModalOpen) return;
        
        const inputElement = document.getElementById('userGuess');
        if (inputElement && !gameState.gameOver && !gameState.hasWon) {
            inputElement.focus();
        }
    }
    
    // Add focus event handlers
    window.addEventListener('click', function() {
        // Short delay to ensure clicks on buttons are processed first
        // And skip if modal is open
        if (!window.isModalOpen) {
            setTimeout(keepInputFocused, 50);
        }
    });
    
    // Set interval to keep checking focus
    setInterval(function() {
        if (!window.isModalOpen) {
            keepInputFocused();
        }
    }, 1000);
    
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
        // Set flag to prevent game input focus
        window.isModalOpen = true;
        modal.classList.add('show');
        
        // Optional: Focus on the first form field after modal opens
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        }, 100);
    });

    // Hide modal when close button is clicked
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        // Reset flag when modal is closed
        setTimeout(() => {
            window.isModalOpen = false;
        }, 300); // Wait for modal animation to complete
    });

    // Hide modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            // Reset flag when modal is closed
            setTimeout(() => {
                window.isModalOpen = false;
            }, 300); // Wait for modal animation to complete
        }
    });
    
    // Also handle form submission
    form.addEventListener('submit', () => {
        // Reset the flag after form is submitted
        setTimeout(() => {
            window.isModalOpen = false;
        }, 500);
    });
}