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
        gameOverNotification: document.getElementById('gameOverNotification'),
        customKeyboard: document.getElementById("custom-keyboard")
    };
    
    // Try to load saved game state first, if that fails, initialize a new game
    const savedStateLoaded = gameState.loadState();
    
    if (!savedStateLoaded) {
        // No saved state, initialize a new game
        gameState.reset(true);
    } else {
        // Saved state loaded, update UI to match
        updateUIFromSavedState();
    }
    
    // Add sound and animation effects
    addSoundAndAnimationEffects();

    // Initialize theme
    initTheme();

    // Focus the input field immediately
    UIManager.elements.userGuess.focus();
    
    // Set up event listeners
    setupEventListeners();

    // Initialize feedback modal
    initFeedbackModal();

    // Initialize custom keyboard for mobile
    initCustomKeyboard();

    // Update UI elements including showing attempts
    UIManager.updateAttempts();
    
    // Set visibility of the custom keyboard based on game state and device
    updateKeyboardVisibility();
    
    // Show a notification about the restored game if state was loaded
    if (savedStateLoaded) {
        if (gameState.gameOver) {
            UIManager.showGameOverNotification(`Game restored. The number was ${gameState.randomNumber}`);
            UIManager.showPlayAgainButton();
        } else if (gameState.hasWon) {
            if (gameState.waitingForNextLevel) {
                UIManager.showWinNotification(`Game restored. You completed Level ${gameState.level}!`);
                UIManager.elements.continueBtn.style.display = "inline-block";
            } else if (gameState.finalWin) {
                UIManager.showWinNotification(`Game restored. You completed all levels!`);
                UIManager.elements.continueBtn.style.display = "inline-block";
            }
        } else {
            // Show a temporary notification about the restored game
            const tempNotification = document.createElement('div');
            tempNotification.textContent = `Game restored: Level ${gameState.level}, Attempts ${gameState.attempts}/${gameState.maxAttempts}`;
            tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#4d6fed;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
            document.body.appendChild(tempNotification);
            setTimeout(() => {
                tempNotification.style.opacity = '0';
                tempNotification.style.transition = 'opacity 0.5s';
                setTimeout(() => tempNotification.remove(), 500);
            }, 3000);
        }
    }
});

// Update UI to match the loaded game state
function updateUIFromSavedState() {
    UIManager.updateRangeInfo();
    UIManager.updateAttempts();
    
    // Update proximity meter if there are past guesses
    if (gameState.pastGuesses.length > 0) {
        const lastGuess = gameState.pastGuesses[gameState.pastGuesses.length - 1];
        UIManager.updateProximityMeter(
            lastGuess.value,
            gameState.randomNumber,
            1,
            gameState.maxNumber
        );
        UIManager.updatePastGuesses();
    }
    
    // Set up UI based on game state
    if (gameState.gameOver) {
        UIManager.hideCustomKeyboard();
    } else if (gameState.hasWon) {
        UIManager.hideCustomKeyboard();
        if (gameState.waitingForNextLevel || gameState.finalWin) {
            UIManager.elements.continueBtn.style.display = "inline-block";
        }
    }
}

// Set up event listeners for game controls
function setupEventListeners() {
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
}

// Update keyboard visibility based on game state and device
function updateKeyboardVisibility() {
    if (gameState.gameOver || gameState.hasWon) {
        UIManager.hideCustomKeyboard();
    } else {
        UIManager.showCustomKeyboard();
    }
}

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

// Initialize theme - simplified version using DOM attributes
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    // Check if user has previously chosen a theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon visibility
    if (savedTheme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
    
    themeToggle.addEventListener('click', () => {
        // Toggle theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', nextTheme);
        
        // Toggle icon visibility
        if (nextTheme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
        
        // Save user preference
        localStorage.setItem('theme', nextTheme);
    });
}

// Initialize the custom number keyboard for mobile devices
function initCustomKeyboard() {
    const customKeyboard = document.getElementById('custom-keyboard');
    const userGuessInput = document.getElementById('userGuess');
    
    if (!customKeyboard || !userGuessInput) return;
    
    // Make input readonly to prevent virtual/physical keyboard
    userGuessInput.setAttribute('readonly', true);
    
    // Add click handlers to all keyboard buttons
    const keyButtons = customKeyboard.querySelectorAll('.key-btn');
    
    keyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const keyValue = button.getAttribute('data-key');
            
            // Handle different key types
            if (keyValue === 'clear') {
                userGuessInput.value = '';
            } else if (keyValue === 'enter') {
                GameLogic.checkGuess(userGuessInput.value);
                userGuessInput.value = '';
            } else {
                // Don't add more digits than needed
                if (userGuessInput.value.length < 5) {
                    userGuessInput.value += keyValue;
                }
                
                // Optional: Add haptic feedback if device supports it
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
            }
            
            // Keep the input focused
            userGuessInput.focus();
        });
    });
    
    // Prevent default click behavior on input
    userGuessInput.addEventListener('click', (e) => {
        e.preventDefault();
        userGuessInput.blur(); // Remove focus to hide any keyboard
        
        // Optional: Visual feedback to show the input is active
        userGuessInput.classList.add('active-input');
        
        setTimeout(() => {
            userGuessInput.classList.remove('active-input');
        }, 300);
    });
    
    // Also add keyboard support for physical keyboards
    document.addEventListener('keydown', (e) => {
        // Make sure we're not in a modal or something
        if (window.isModalOpen) return;
        
        // Numbers 0-9
        if (/^[0-9]$/.test(e.key) && userGuessInput.value.length < 5) {
            userGuessInput.value += e.key;
        }
        // Backspace/Delete to clear
        else if (e.key === 'Backspace' || e.key === 'Delete') {
            userGuessInput.value = userGuessInput.value.slice(0, -1);
        }
        // Clear entire input with Escape
        else if (e.key === 'Escape') {
            userGuessInput.value = '';
        }
    });
}