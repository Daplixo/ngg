import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { GameLogic } from './gameLogic.js';
import { UserProfileUI } from './userProfileUI.js';
import { initKeyboard } from './keyboard.js';

// Add a global flag to track modal state
window.isModalOpen = false;

// Shake animation function - make it global
window.addShake = (element) => {
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

// Add a check to prevent premature profile initialization if our initialProfileSetup is active

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded');
    
    // Force initialize profile section in side menu if a profile exists
    try {
        const userProfile = new UserProfile();
        if (userProfile.hasProfile()) {
            console.log("Profile exists, initializing profile section in side menu");
            const profileUI = new UserProfileUI();
            profileUI.initProfileSection();
        } else {
            console.log("No profile exists yet");
        }
    } catch (error) {
        console.error("Error checking profile:", error);
    }

    // CRITICAL FIX: Ensure header elements are created dynamically
    createHeaderElements();

    // CRITICAL FIX: Initialize game first, then try profile
    try {
        // Initialize the game
        initializeGame();
        
        // Wait a moment before initializing profile to avoid blocking
        setTimeout(async () => {
            try {
                // Only initialize UserProfileUI if initialProfileSetup is not active
                // or if it didn't show its UI
                if (!window.initialProfileSetupActive || 
                    (window.initialProfileSetupInstance && 
                     window.initialProfileSetupInstance.userProfile.hasProfile())) {
                    console.log("Initializing UserProfileUI from main.js");
                    const profileUI = new UserProfileUI();
                    await profileUI.init();
                    console.log("Profile UI initialized successfully");
                } else {
                    console.log("Skipping UserProfileUI initialization - using initialProfileSetup");
                }
            } catch (error) {
                console.error("Failed to initialize profile UI:", error);
            }
        }, 500);
    } catch (e) {
        console.error("Critical initialization error:", e);
        // Last resort emergency game init
        try {
            GameLogic.initGame();
        } catch (innerError) {
            console.error("Emergency initialization also failed:", innerError);
        }
    }
    
    // Handle the delete account button
    setupDeleteAccount();
    
    // Initialize theme toggle
    fixThemeIcons();
    
    // Set up theme toggle function globally
    window.toggleTheme = function() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icons
        fixThemeIcons();
    };
    
    // Set up side menu
    setupSideMenu();
    
    // Initialize feedback modal
    initFeedbackModal();

    // Setup game initialization counter reset
    setupGameInitialization();

    // Function to create header elements dynamically
    function createHeaderElements() {
        console.log("Creating header elements dynamically");
        
        const headerCenter = document.querySelector('.header-center');
        if (!headerCenter) {
            console.error("Header center element not found");
            return;
        }
        
        // Clear any existing elements (to ensure clean state)
        headerCenter.innerHTML = '';
        
        // Critical fix: Ensure proper styling for header center element
        headerCenter.style.display = 'flex';
        headerCenter.style.justifyContent = 'center';
        headerCenter.style.alignItems = 'center';
        headerCenter.style.height = 'auto';
        headerCenter.style.padding = '0';
        headerCenter.style.margin = '0';
        
        // Create game indicators container with proper styling
        const gameIndicatorsContainer = document.createElement('div');
        gameIndicatorsContainer.id = 'game-indicators-container';
        // Critical styles to ensure alignment
        gameIndicatorsContainer.style.display = 'flex';
        gameIndicatorsContainer.style.flexDirection = 'row';
        gameIndicatorsContainer.style.alignItems = 'center';
        gameIndicatorsContainer.style.justifyContent = 'center';
        gameIndicatorsContainer.style.gap = '15px';
        gameIndicatorsContainer.style.width = '100%';
        gameIndicatorsContainer.style.height = 'auto';
        gameIndicatorsContainer.style.padding = '0';
        gameIndicatorsContainer.style.margin = '0';
        
        headerCenter.appendChild(gameIndicatorsContainer);
        
        // Create attempts counter with proper styling
        const attemptsElement = document.createElement('div');
        attemptsElement.id = 'attempts';
        attemptsElement.textContent = 'Attempts: 0/3';
        attemptsElement.setAttribute('data-count', '0/3');
        // Critical styles to ensure consistent height and vertical alignment - FIXED font size
        attemptsElement.style.display = 'inline-block';
        attemptsElement.style.margin = '0';
        attemptsElement.style.padding = '0';
        attemptsElement.style.lineHeight = '1.2';
        attemptsElement.style.verticalAlign = 'middle';
        attemptsElement.style.whiteSpace = 'nowrap';
        attemptsElement.style.minHeight = '24px'; // Fixed minimum height
        attemptsElement.style.fontSize = '0.85rem'; // FIXED: Set consistent font size
        
        gameIndicatorsContainer.appendChild(attemptsElement);
        
        // Create previous guess element with proper styling
        const previousGuessElement = document.createElement('div');
        previousGuessElement.id = 'previous-guess';
        previousGuessElement.textContent = 'Last Guess: --';
        // Critical styles to ensure consistent height and vertical alignment - FIXED font size
        previousGuessElement.style.display = 'inline-block';
        previousGuessElement.style.margin = '0';
        previousGuessElement.style.padding = '0';
        previousGuessElement.style.lineHeight = '1.2';
        previousGuessElement.style.verticalAlign = 'middle';
        previousGuessElement.style.whiteSpace = 'nowrap';
        previousGuessElement.style.minHeight = '24px'; // Fixed minimum height
        previousGuessElement.style.fontSize = '0.85rem'; // FIXED: Set consistent font size
        
        gameIndicatorsContainer.appendChild(previousGuessElement);
        
        // Make sure UIManager has references to these elements
        UIManager.elements.attempts = attemptsElement;
        UIManager.elements.previousGuess = previousGuessElement;
        
        console.log("Header elements created dynamically with consistent font size");
    }

    // Clear the game initialization flag when the page is unloaded
    window.addEventListener('beforeunload', function() {
        localStorage.removeItem('gameAlreadyInitialized');
    });
});

// Handle delete account
function setupDeleteAccount() {
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                try {
                    const profileUI = new UserProfileUI();
                    const profile = profileUI.userProfile.getProfile();
                    
                    // Delete from server if connected
                    if (profile && profile.syncedWithServer) {
                        try {
                            await profileUI.api.deleteAccount();
                        } catch (error) {
                            console.error('Error deleting server account:', error);
                        }
                    }
                    
                    // Delete local profile
                    profileUI.userProfile.deleteProfile();
                    
                    // Show the profile setup again
                    await profileUI.showProfileSetup();
                    profileUI.initProfileSection();
                    
                    // Reset game state
                    GameLogic.restoreGame();
                    
                    alert('Account deleted successfully!');
                } catch (error) {
                    console.error('Error during account deletion:', error);
                    alert('Failed to delete account: ' + error.message);
                }
            }
        });
    }
}

// Initialize the game
function initializeGame() {
    console.log('Initializing game...');
    
    // Initialize keyboard
    initKeyboard();
    
    // Reset or load game state
    const hasSavedGame = gameState.loadState();
    
    // Check if this is the first game after profile creation
    if (window.isFirstGameAfterProfileCreation) {
        console.log("This is the first game after profile creation");
        window.isFirstGameAfterProfileCreation = false;
        window.gameCounterIncrementedThisSession = true; // Set flag to prevent double counting
    }
    
    if (!hasSavedGame) {
        // Start a new game if no saved game
        GameLogic.initGame();
    } else {
        // Update UI from saved state
        updateUIFromSavedState();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Show keyboard
    UIManager.showCustomKeyboard();
    
    console.log('Game initialization complete');
}

// CRITICAL FIX: Combined and improved updateUIFromSavedState function
// Make sure we correctly update UI when game state changes
function updateUIFromSavedState() {
    console.log("Updating UI from saved state");
    
    // Update basic UI elements
    UIManager.updateRangeInfo();
    UIManager.updateAttempts();
    UIManager.updateLevelIndicator();
    UIManager.updatePastGuesses();
    
    // Update proximity meter if there are past guesses
    if (gameState.pastGuesses.length > 0) {
        const lastGuess = gameState.pastGuesses[gameState.pastGuesses.length - 1];
        UIManager.updateProximityMeter(
            lastGuess.value,
            gameState.randomNumber,
            1,
            gameState.maxNumber
        );
    }
    
    // Set up UI based on game state
    if (gameState.gameOver || gameState.hasWon) {
        // Always show the Play Again button with the appropriate text
        UIManager.showPlayAgainButton();
        
        if (gameState.waitingForNextLevel || gameState.finalWin) {
            console.log("Game is waiting for next level or final win");
            
            // BUGFIX: Force button transformation to continue mode
            const buttonText = gameState.finalWin ? "Play Again" : "Continue";
            UIManager.transformPlayAgainToContinue(buttonText);
            
            // Ensure the button has the continue-mode class and correct style
            const playAgainBtn = UIManager.elements.playAgainBtn;
            if (playAgainBtn) {
                playAgainBtn.classList.add('continue-mode');
                playAgainBtn.classList.remove('game-over');
                playAgainBtn.style.backgroundColor = '#2eb82e';
                playAgainBtn.textContent = buttonText;
                console.log("Forced button to continue mode:", buttonText);
            }
        } else if (gameState.gameOver) {
            // Apply game over styling
            const playAgainBtn = UIManager.elements.playAgainBtn;
            if (playAgainBtn) {
                playAgainBtn.textContent = "Play Again";
                playAgainBtn.classList.remove('continue-mode');
                playAgainBtn.classList.add('game-over');
                console.log("Applied game over styling to button");
            }
        }
    } else {
        // Ensure Play Again button is shown with "Restart Level" text for active games
        UIManager.showPlayAgainButton();
        const playAgainBtn = UIManager.elements.playAgainBtn;
        if (playAgainBtn) {
            playAgainBtn.textContent = "Restart Level";
            playAgainBtn.classList.remove('continue-mode', 'game-over');
            console.log("Set button to Restart Level");
        }
    }
    
    // Show keyboard for all states
    UIManager.showCustomKeyboard();
}

// Set up event listeners for game controls
function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Clear existing event listeners by cloning elements
    cloneAndReplaceElement('submitGuessBtn');
    cloneAndReplaceElement('continueBtn');
    cloneAndReplaceElement('playAgainBtn');
    cloneAndReplaceElement('resetGameBtn');
    cloneAndReplaceElement('userGuess');
    
    // Add fresh event listeners to the new elements
    const submitGuessBtn = document.getElementById('submitGuessBtn');
    const userGuessInput = document.getElementById('userGuess');
    const continueBtn = document.getElementById('continueBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');
    
    if (submitGuessBtn && userGuessInput) {
        submitGuessBtn.addEventListener('click', () => {
            GameLogic.checkGuess(userGuessInput.value);
            userGuessInput.value = '';
            userGuessInput.focus();
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            GameLogic.continueNextLevel();
        });
    }

    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', (e) => {
            // Only process if we clicked the button itself, not the arrow
            if (!e.target.classList.contains('dropdown-arrow')) {
                if (playAgainBtn.classList.contains('continue-mode')) {
                    GameLogic.continueNextLevel();
                } else {
                    GameLogic.playAgain();
                }
                
                // Ensure dropdown arrow remains visible after action
                setTimeout(() => setupDropdownMenu(), 50);
            }
        });
    }

    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', () => {
            // Call the new explicit method instead of restoreGame
            GameLogic.startNewGame();
            
            // Close dropdown menu after reset
            const dropdownContainer = document.querySelector('.dropdown-container');
            if (dropdownContainer) {
                dropdownContainer.classList.remove('active');
            }
        });
    }

    if (userGuessInput) {
        userGuessInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                GameLogic.handleKeyPress(event);
            }
        });
    }

    // Set up dropdown menu
    setupDropdownMenu();
    
    console.log("Event listeners set up successfully");
}

// Helper function to clone and replace an element to remove existing event listeners
function cloneAndReplaceElement(id) {
    const element = document.getElementById(id);
    if (element) {
        const clone = element.cloneNode(true);
        if (element.parentNode) {
            element.parentNode.replaceChild(clone, element);
        }
    }
}

// Setup dropdown menu functionality
function setupDropdownMenu() {
    console.log("Setting up dropdown menu");
    
    const playAgainBtn = document.getElementById('playAgainBtn');
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
    dropdownArrow.setAttribute('id', 'dropdown-arrow');
    dropdownArrow.setAttribute('aria-label', 'Toggle dropdown menu');
    dropdownArrow.setAttribute('tabindex', '0');
    
    // Position the arrow
    dropdownContainer.appendChild(dropdownArrow);
    
    // Use a simple flag to track dropdown state
    let dropdownActive = false;
    
    // Clear any existing click handlers on the arrow
    dropdownArrow.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle dropdown state
        dropdownActive = !dropdownActive;
        
        // Apply the state to the class
        if (dropdownActive) {
            dropdownContainer.classList.add('active');
        } else {
            dropdownContainer.classList.remove('active');
        }
    };
    
    // Setup click handlers for the entire document
    document.addEventListener('click', function(event) {
        // Close dropdown when clicking elsewhere
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
            GameLogic.restoreGame(); 
            dropdownActive = false;
            dropdownContainer.classList.remove('active');
        };
    }
    
    // Add keyboard accessibility
    dropdownArrow.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
}

// Make setupDropdownMenu available globally for other modules
window.setupDropdownMenu = setupDropdownMenu;

// Initialize feedback modal
function initFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    const sideMenuFeedbackBtn = document.getElementById('side-menu-feedback-btn');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !sideMenuFeedbackBtn) return;
    
    // Ensure modal is closed by default
    modal.classList.remove('active');
    modal.style.display = "none";
    window.isModalOpen = false;
    
    sideMenuFeedbackBtn.addEventListener('click', () => {
        // Close the side menu
        const sideMenu = document.querySelector('.side-menu');
        const sideMenuOverlay = document.querySelector('.side-menu-overlay');
        const menuToggle = document.getElementById('menu-toggle');

        if (sideMenu) sideMenu.classList.remove('active');
        if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Open feedback modal using modal manager if available
        if (window.modalManager) {
            window.modalManager.showModal('feedbackModal');
        } else {
            // Fallback to original behavior
            modal.style.display = "flex";
            modal.style.visibility = "visible";
            modal.style.opacity = "1";
            modal.style.pointerEvents = "auto";
            modal.classList.add('active');
            window.isModalOpen = true;
        }
    });
    
    // Close button handling is now managed by the modalManager
}

// Close modal helper
function closeModal(modal) {
    if (!modal) return;
    
    // Use modal manager if available
    if (window.modalManager) {
        window.modalManager.hideModal(modal);
    } else {
        // Fallback to original behavior
        modal.style.display = "none";
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";
        modal.classList.remove('active');
        window.isModalOpen = false;
    }
}

// Setup side menu functionality
function setupSideMenu() {
    console.log("Setting up side menu...");
    
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const sideMenuOverlay = document.querySelector('.side-menu-overlay');
    const sideMenuClose = document.querySelector('.side-menu-close');
    
    if (!menuToggle || !sideMenu || !sideMenuOverlay || !sideMenuClose) {
        console.error("Side menu elements not found");
        return;
    }
    
    // Toggle menu when hamburger is clicked
    menuToggle.onclick = function(e) {
        e.preventDefault();
        
        const isMenuOpen = sideMenu.classList.contains('active');
        
        // Toggle classes
        sideMenu.classList.toggle('active');
        sideMenuOverlay.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Update ARIA attributes
        menuToggle.setAttribute('aria-expanded', !isMenuOpen);
    };
    
    // Close menu when X is clicked
    sideMenuClose.onclick = function() {
        sideMenu.classList.remove('active');
        sideMenuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    
    // Close menu when overlay is clicked
    sideMenuOverlay.onclick = function() {
        sideMenu.classList.remove('active');
        sideMenuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    
    // Close menu on ESC key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initialize theme icons
function fixThemeIcons() {
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (!moonIcon || !sunIcon) return;
    
    // Set initial styles based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    if (currentTheme === 'dark') {
        // Dark mode - sun icon visible
        moonIcon.style.opacity = '0';
        sunIcon.style.opacity = '1';
        sunIcon.setAttribute('stroke', 'white');
    } else {
        // Light mode - moon icon visible
        moonIcon.style.opacity = '1'; 
        moonIcon.setAttribute('stroke', '#333');
        sunIcon.style.opacity = '0';
    }
}

// REMAINING HELPER FUNCTIONS (keep only the ones actually used)
function ensureDropdownArrowVisible() {
    setupDropdownMenu();
}

// Add our sound and animation effects without disrupting existing code
function addSoundAndAnimationEffects() {
    const keepInputFocused = () => {
        if (window.isModalOpen) return;
        
        const inputElement = document.getElementById('userGuess');
        if (inputElement && !gameState.gameOver && !gameState.hasWon) {
            inputElement.focus();
        }
    };
    
    window.addEventListener('click', () => {
        if (!window.isModalOpen) {
            setTimeout(keepInputFocused, 50);
        }
    });
    
    setInterval(() => {
        if (!window.isModalOpen) keepInputFocused();
    }, 1000);
    
    setTimeout(keepInputFocused, 500);
}

// Initialize sync manager for background data sync
import { SyncManager } from './syncManager.js';

// Set up automatic background sync
function initBackgroundSync() {
    const syncManager = new SyncManager();
    syncManager.startSync();
    window.syncManager = syncManager;
}

// Initialize after a delay to ensure other components are loaded
setTimeout(initBackgroundSync, 5000);

// Function to clear game initialization count on window close or tab close
// This ensures a fresh initialization count when the user returns
function setupGameInitialization() {
    // Clear the init count when the user deliberately closes the page
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('gameInitializationCount', '0');
    });
    
    // Also reset the counter if this is a fresh page load (not a refresh)
    if (performance.navigation && performance.navigation.type === 0) {
        localStorage.setItem('gameInitializationCount', '0');
    }
}

// Function to clear game initialization count on window close or tab close
window.addEventListener('beforeunload', function() {
    // Clear session flags when the page is unloaded
    window.gameCounterIncrementedThisSession = false;
    window.isFirstGameAfterProfileCreation = false;
    localStorage.removeItem('gameAlreadyInitialized');
});