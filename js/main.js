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
    // Use the improved AudioManager method instead of the old implementation
    AudioManager.playBeep(isGameOver);
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
        customKeyboard: document.getElementById("custom-keyboard"),
        lastGuess: document.getElementById("last-guess"),
        lastGuessIndex: document.getElementById("guess-index"),
        prevGuessBtn: document.getElementById("prev-guess-btn"),
        nextGuessBtn: document.getElementById("next-guess-btn"),
        // Remove the restoreBtn reference since it's no longer in the HTML
        // restoreBtn: document.getElementById('restoreBtn')
    };
    
    // Try to load saved game state first, if that fails, initialize a new game
    const savedStateLoaded = gameState.loadState();
    
    // Initialize audio system early
    AudioManager.init();
    AudioManager.preloadSounds();
    
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
    
    // Update the Play Again button text immediately based on game state
    updatePlayAgainButtonText();

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
            tempNotification.textContent = "Game restored!"; // Updated to simpler message
            tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#4d6fed;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
            document.body.appendChild(tempNotification);
            setTimeout(() => {
                tempNotification.style.opacity = '0';
                tempNotification.style.transition = 'opacity 0.5s';
                setTimeout(() => tempNotification.remove(), 500);
            }, 3000);
        }
    }

    // Update restore button visibility at startup
    UIManager.updateRestoreButtonVisibility();
    
    // Add event listeners to resume audio context on interaction
    document.addEventListener('click', () => AudioManager.resumeAudio());
    document.addEventListener('touchstart', () => AudioManager.resumeAudio());
    document.addEventListener('keydown', () => AudioManager.resumeAudio());

    // Initialize guess navigation
    UIManager.initGuessNavigation();
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
    if (gameState.gameOver || gameState.hasWon) {
        UIManager.hideCustomKeyboard();
        // Always show the Play Again button with updated text
        UIManager.showPlayAgainButton();
        
        if (gameState.waitingForNextLevel || gameState.finalWin) {
            UIManager.elements.continueBtn.style.display = "inline-block";
        }
    } else {
        // Ensure Play Again button is shown with "Restart Level" text even for active games
        UIManager.showPlayAgainButton();
    }
    
    // Always check if we should show the restore button at the end
    UIManager.updateRestoreButtonVisibility();
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

    // Set play again button click event with arrow preservation
    UIManager.elements.playAgainBtn.addEventListener('click', (e) => {
        // Only process if we clicked the button itself, not the arrow
        if (!e.target.classList.contains('dropdown-arrow')) {
            console.log("Button clicked (not arrow)");
            if (UIManager.elements.playAgainBtn.classList.contains('continue-mode')) {
                GameLogic.continueNextLevel();
            } else {
                GameLogic.playAgain();
            }
            
            // IMPORTANT: Ensure dropdown arrow remains visible after action
            setTimeout(ensureDropdownArrowVisible, 50);
        } else {
            console.log("Arrow click detected, not triggering button action");
        }
    });

    // Set restart button click event
    UIManager.elements.restartBtn.addEventListener('click', () => {
        GameLogic.restartGame();
    });

    // Set up the reset game button in the dropdown menu
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', () => {
            GameLogic.restoreGame(); // This method performs the reset
            
            // IMPORTANT: Ensure dropdown arrow remains visible after action
            setTimeout(ensureDropdownArrowVisible, 50);
        });
    } else {
        console.error("Reset Game button not found in dropdown");
    }

    // Set keypress event for enter key
    UIManager.elements.userGuess.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            GameLogic.handleKeyPress(event);
        }
    });

    // Set up dropdown functionality
    setupDropdownMenu();
}

// Function to update the Play Again button text based on game state
function updatePlayAgainButtonText() {
    const playAgainBtn = UIManager.elements.playAgainBtn;
    if (playAgainBtn) {
        if (gameState.gameOver || gameState.hasWon) {
            playAgainBtn.textContent = "Play Again";
        } else {
            playAgainBtn.textContent = "Restart Level";
        }
    }
}

// Setup dropdown menu functionality - Complete rewrite for reliability
function setupDropdownMenu() {
    console.log("Setting up dropdown menu");
    
    const playAgainBtn = UIManager.elements.playAgainBtn;
    const dropdownContainer = document.querySelector('.dropdown-container');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!dropdownContainer || !playAgainBtn || !dropdownMenu) {
        console.error("Dropdown elements not found");
        return;
    }

    // First, remove any existing arrow to prevent duplicates
    const existingArrows = document.querySelectorAll('.dropdown-arrow');
    existingArrows.forEach(arrow => arrow.remove());
    
    // Create a completely new arrow element
    const dropdownArrow = document.createElement('span');
    dropdownArrow.className = 'dropdown-arrow';
    dropdownArrow.innerHTML = '▼';
    dropdownArrow.setAttribute('id', 'dropdown-arrow');
    
    // Direct style application for maximum reliability
    dropdownArrow.style.cssText = `
        position: absolute !important;
        right: 5px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 26px !important;
        height: 26px !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        border-radius: 50% !important;
        color: white !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        cursor: pointer !important;
        z-index: 9999 !important;
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        pointer-events: auto !important;
        user-select: none !important;
    `;
    
    // Add arrow to DOM - append to container for reliable positioning
    dropdownContainer.appendChild(dropdownArrow);
    
    // Position the arrow
    dropdownArrow.style.position = 'absolute';
    dropdownArrow.style.right = '10px';
    
    // Fix button styling to ensure text is centered
    playAgainBtn.style.position = 'relative';
    playAgainBtn.style.width = '100%';
    playAgainBtn.style.paddingRight = '36px';
    playAgainBtn.style.paddingLeft = '36px'; // Match right padding for visual centering
    playAgainBtn.style.textAlign = 'center';
    playAgainBtn.style.justifyContent = 'center';
    playAgainBtn.style.display = 'flex';
    playAgainBtn.style.alignItems = 'center';
    
    console.log("Arrow added:", dropdownArrow);
    
    // CRITICAL FIX: Separate click handling completely from the button
    // Use a simple flag to track dropdown state
    let dropdownActive = false;
    
    // Clear any existing click handlers on the arrow by using a direct click assignment
    dropdownArrow.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Arrow clicked directly");
        
        // Toggle dropdown state
        dropdownActive = !dropdownActive;
        
        // Apply the state to the class
        if (dropdownActive) {
            dropdownContainer.classList.add('active');
        } else {
            dropdownContainer.classList.remove('active');
        }
    };
    
    // Make sure clicking the button itself doesn't trigger the arrow
    playAgainBtn.onclick = function(e) {
        // Only process if we clicked the button itself, not the arrow
        if (e.target !== dropdownArrow && !dropdownArrow.contains(e.target)) {
            console.log("Button clicked (not arrow)");
            if (playAgainBtn.classList.contains('continue-mode')) {
                GameLogic.continueNextLevel();
            } else {
                GameLogic.playAgain();
            }
        } else {
            console.log("Arrow click intercepted");
            e.stopPropagation();
        }
    };
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function(event) {
        // Close only if we're not clicking the arrow or inside the dropdown
        if (dropdownActive && 
            event.target !== dropdownArrow && 
            !dropdownArrow.contains(event.target) && 
            !dropdownMenu.contains(event.target)) {
            
            dropdownActive = false;
            dropdownContainer.classList.remove('active');
        }
    });
    
    // Set up the reset game button in the dropdown menu
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.onclick = function() {
            GameLogic.restoreGame(); // This method performs the reset
            dropdownActive = false;
            dropdownContainer.classList.remove('active');
        };
    }
}

// Add this new function to ensure dropdown arrow visibility
function ensureDropdownArrowVisible() {
    // Always just re-create the dropdown setup for maximum reliability
    setupDropdownMenu();
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
    
    if (!themeToggle || !moonIcon || !sunIcon) {
        console.error('Theme toggle elements not found!');
        return;
    }
    
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
    
    if (!customKeyboard || !userGuessInput) {
        console.error("Keyboard elements not found");
        return;
    }
    
    // Make input readonly to prevent virtual keyboard
    userGuessInput.setAttribute('readonly', true);
    
    // Get all keyboard buttons and ensure their appearance
    const keyButtons = customKeyboard.querySelectorAll('.key-btn');
    
    // Ensure proper styling for function keys
    const clearBtn = customKeyboard.querySelector('.key-clear');
    const enterBtn = customKeyboard.querySelector('.key-enter');
    
    if (clearBtn) {
        clearBtn.style.fontSize = '0.8rem';
        clearBtn.style.backgroundColor = '#e74c3c';
        clearBtn.style.color = 'white';
    }
    
    if (enterBtn) {
        enterBtn.style.fontSize = '0.8rem';
        enterBtn.style.backgroundColor = '#2ecc71';
        enterBtn.style.color = 'white';
    }
    
    // Add click handlers to all keyboard buttons
    keyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const keyValue = button.getAttribute('data-key');
            console.log("Key pressed:", keyValue);
            
            // Handle different key types
            if (keyValue === 'clear') {
                userGuessInput.value = '';
            } else if (keyValue === 'enter') {
                console.log("Submitting guess:", userGuessInput.value);
                GameLogic.checkGuess(userGuessInput.value);
                userGuessInput.value = '';
            } else {
                // Don't add more digits than needed
                if (userGuessInput.value.length < 5) {
                    userGuessInput.value += keyValue;
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

// Add a function to manually test for a saved game
window.checkForSavedGame = function() {
    const result = gameState.hasSavedGame();
    console.log("Has saved game:", result);
    UIManager.updateRestoreButtonVisibility();
    return result;
};