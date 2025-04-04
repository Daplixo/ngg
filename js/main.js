import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { GameLogic } from './gameLogic.js';
import { UserProfileUI } from './userProfileUI.js';

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

// Function to play wrong sound with volume control - make it global
window.playWrongSound = (isGameOver = false) => {
    // Use the improved AudioManager method instead of the old implementation
    AudioManager.playBeep(isGameOver);
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize user profile first
    const profileUI = new UserProfileUI();
    await profileUI.init();

    // Only proceed with game initialization after profile setup
    if (profileUI.userProfile.hasProfile()) {
        // Initialize user profile
        const profileUI = new UserProfileUI();
        profileUI.init();
        
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
    
        // Make sure modals are closed on load
        UIManager.ensureModalsClosed();
    
        // Debug CSS loading status
        console.log("==== CSS/SCSS LOADING DEBUG ====");
        const allStylesheets = document.styleSheets;
        console.log("Total stylesheets:", allStylesheets.length);
        
        // Check if hamburger CSS is loaded
        let hamburgerStyleFound = false;
        let hamburgerRules = [];
        
        try {
            for (let i = 0; i < allStylesheets.length; i++) {
                try {
                    const rules = allStylesheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].selectorText && 
                            (rules[j].selectorText.includes('.hamburger-menu') ||
                             rules[j].selectorText.includes('.hamburger-line'))) {
                            hamburgerStyleFound = true;
                            hamburgerRules.push(rules[j].cssText);
                        }
                    }
                } catch (e) {
                    console.log("Couldn't access rules for stylesheet", i, "due to CORS");
                }
            }
        } catch (e) {
            console.error("Error inspecting stylesheets:", e);
        }
        
        console.log("Hamburger menu CSS found:", hamburgerStyleFound);
        if (hamburgerRules.length > 0) {
            console.log("Hamburger CSS rules found:", hamburgerRules);
        }
        
        // Debug DOM structure
        console.log("==== DOM STRUCTURE DEBUG ====");
        const hamburgerBtn = document.getElementById('menu-toggle');
        console.log("Hamburger button:", hamburgerBtn);
        
        if (hamburgerBtn) {
            console.log("Hamburger button styles:", window.getComputedStyle(hamburgerBtn));
            const lines = hamburgerBtn.querySelectorAll('.hamburger-line');
            console.log("Hamburger lines found:", lines.length);
            
            lines.forEach((line, i) => {
                console.log(`Line ${i+1} styles:`, window.getComputedStyle(line));
            });
        }
        
        // Initialize the side menu
        setupSideMenu();
        
        // Call this function after DOM is loaded
        fixThemeIcons();
    
        // Setup event listeners for feedback buttons (both in footer and side menu)
        const feedbackBtn = document.getElementById('feedbackBtn');
        const sideMenuFeedbackBtn = document.getElementById('side-menu-feedback-btn');
        const feedbackModal = document.getElementById('feedbackModal');
        
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', function() {
                console.log("Footer feedback button clicked");
                if (feedbackModal) {
                    // Use the modal's active class approach
                    feedbackModal.classList.add('active');
                    window.isModalOpen = true;
                    console.log("Modal should be open:", window.isModalOpen);
                }
            });
        }
        
        // Ensure side menu feedback button works
        if (sideMenuFeedbackBtn) {
            console.log("Side menu feedback button found:", sideMenuFeedbackBtn);
            
            // Remove any existing event listeners
            sideMenuFeedbackBtn.removeEventListener('click', handleSideMenuFeedback);
            
            // Add a new event listener with a named function for easier debugging
            sideMenuFeedbackBtn.addEventListener('click', handleSideMenuFeedback);
        }
    
        // Separate function for the side menu feedback handler
        function handleSideMenuFeedback() {
            console.log("Side menu feedback button clicked");
            
            // Close the side menu
            const sideMenu = document.querySelector('.side-menu');
            const sideMenuOverlay = document.querySelector('.side-menu-overlay');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (sideMenu) sideMenu.classList.remove('active');
            if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Open feedback modal directly
            if (feedbackModal) {
                console.log("Opening feedback modal");
                feedbackModal.classList.add('active');
                window.isModalOpen = true;
                console.log("Modal should be open:", window.isModalOpen);
            } else {
                console.error("Feedback modal not found!");
            }
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

// Setup dropdown menu functionality - Refined for better maintainability
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
    
    // Create a completely new arrow element - simpler design
    const dropdownArrow = document.createElement('span');
    dropdownArrow.className = 'dropdown-arrow';
    dropdownArrow.setAttribute('id', 'dropdown-arrow');
    dropdownArrow.setAttribute('aria-label', 'Toggle dropdown menu');
    dropdownArrow.setAttribute('tabindex', '0');
    
    // Position the arrow - append to container for proper positioning
    dropdownContainer.appendChild(dropdownArrow);
    
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
    
    // Add keyboard accessibility
    dropdownArrow.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
}

// Add this new function to ensure dropdown arrow visibility
function ensureDropdownArrowVisible() {
    // Always just re-create the dropdown setup for maximum reliability
    setupDropdownMenu();
}

// Update keyboard visibility to always show keyboard regardless of game state
function updateKeyboardVisibility() {
    // Always show keyboard, regardless of game state
    UIManager.showCustomKeyboard();
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
    const modal = document.getElementById('feedbackModal');
    const btn = document.getElementById('feedbackBtn');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !btn) return;
    
    // Ensure modal is closed by default
    modal.classList.remove('active');
    window.isModalOpen = false;
    
    btn.addEventListener('click', () => {
        modal.classList.add('active');
        window.isModalOpen = true;
    });
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            window.isModalOpen = false;
        });
    }
    
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            window.isModalOpen = false;
        }
    });
    
    // Also handle form submission
    const form = modal.querySelector('form');
    if (form) {
        // Reset the flag after form is submitted
        setTimeout(() => {
            window.isModalOpen = false;
        }, 500);
    }
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
    
    // Check if user has previously chosen a theme, otherwise use dark as default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon visibility
    if (savedTheme === 'dark') {
        moonIcon.style.opacity = '0';
        sunIcon.style.opacity = '1';
    } else {
        moonIcon.style.opacity = '1';
        sunIcon.style.opacity = '0';
    }
    
    themeToggle.addEventListener('click', () => {
        // Toggle theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', nextTheme);
        
        // Toggle icon visibility
        if (nextTheme === 'dark') {
            moonIcon.style.opacity = '0';
            sunIcon.style.opacity = '1';
        } else {
            moonIcon.style.opacity = '1';
            sunIcon.style.opacity = '0';
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

// Setup side menu functionality
function setupSideMenu() {
    console.log("Setting up side menu...");
    
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const sideMenuOverlay = document.querySelector('.side-menu-overlay');
    const sideMenuClose = document.querySelector('.side-menu-close');
    
    console.log("Menu toggle element:", menuToggle);
    console.log("Side menu element:", sideMenu);
    console.log("Side menu overlay element:", sideMenuOverlay);
    console.log("Side menu close element:", sideMenuClose);
    
    if (!menuToggle || !sideMenu || !sideMenuOverlay || !sideMenuClose) {
        console.error("Side menu elements not found");
        return;
    }
    
    console.log("Side menu setup initialized");
    
    // Toggle menu when hamburger is clicked - Fix the event handler
    menuToggle.onclick = function(e) {
        e.preventDefault(); // Prevent default button behavior
        console.log("Menu toggle clicked");
        
        const isMenuOpen = sideMenu.classList.contains('active');
        
        // Toggle classes
        sideMenu.classList.toggle('active');
        sideMenuOverlay.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Update ARIA attributes
        menuToggle.setAttribute('aria-expanded', !isMenuOpen);
        
        // Log for debugging
        console.log("Side menu active:", sideMenu.classList.contains('active'));
        console.log("Menu toggle active:", menuToggle.classList.contains('active'));
    };
    
    // Close menu when X is clicked - Fix the event handler
    sideMenuClose.onclick = function() {
        sideMenu.classList.remove('active');
        sideMenuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    
    // Close menu when overlay is clicked - Fix the event handler
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

// Add this to the initTheme function or create a new function

function fixThemeIcons() {
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (!moonIcon || !sunIcon) return;
    
    // Set initial styles directly
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
    
    // Add this to the theme toggle event listener
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        if (nextTheme === 'dark') {
            // Switching to dark mode - sun icon visible
            setTimeout(() => {
                moonIcon.style.opacity = '0';
                sunIcon.style.opacity = '1';
                sunIcon.setAttribute('stroke', 'white');
            }, 50);
        } else {
            // Switching to light mode - moon icon visible
            setTimeout(() => {
                moonIcon.style.opacity = '1';
                moonIcon.setAttribute('stroke', '#333');
                sunIcon.style.opacity = '0';
            }, 50);
        }
    });
}