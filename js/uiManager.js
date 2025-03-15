import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';

export const UIManager = {
    elements: {
        userGuess: document.getElementById("userGuess"),
        submitGuessBtn: document.getElementById("submitGuessBtn"),
        feedback: document.getElementById("feedback"),
        attempts: document.getElementById("attempts"),
        rangeInfo: document.getElementById("range-info"),
        continueBtn: document.getElementById("continueBtn"),
        playAgainBtn: document.getElementById("playAgainBtn"),
        restartBtn: document.getElementById("restartBtn"),
        winNotification: document.getElementById("winNotification"),
        gameOverNotification: document.getElementById("gameOverNotification"),
        levelIndicator: document.getElementById("level-indicator"),
        pastGuessesContainer: document.getElementById("past-guesses-container"),
        pastGuesses: document.getElementById("past-guesses"),
        customKeyboard: document.getElementById("custom-keyboard"), // Add this line
        restoreBtn: document.getElementById("restoreBtn")
    },

    showGameUI() {
        this.elements.rangeInfo.style.display = "inline-block";
        this.elements.userGuess.style.display = "block";
        this.elements.submitGuessBtn.style.display = "inline-block";
        this.updateLevelIndicator();
        
        // Always show the Play Again button with the appropriate text
        this.showPlayAgainButton();
        
        // Always show custom keyboard
        this.showCustomKeyboard();
    },

    updateRangeInfo() {
        this.elements.rangeInfo.textContent = `Guess the number (1-${gameState.maxNumber})`;
        this.updateLevelIndicator();
    },

    updateLevelIndicator() {
        this.elements.levelIndicator.textContent = `Level ${gameState.level}`;
    },

    setFeedback(message, className = "") {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = className;
    },

    // Add a new method to clear the feedback area
    clearFeedback() {
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = '';
    },

    // Update attempts display method to ensure visibility
    updateAttempts() {
        if (!this.elements.attempts) {
            console.error("Attempts display element not found");
            return;
        }
        
        // Make attempts display consistent
        this.elements.attempts.textContent = `Attempts: ${gameState.attempts}/${gameState.maxAttempts}`;
        
        // Ensure the container and element are visible
        const container = document.getElementById('attempts-container');
        if (container) {
            container.style.display = 'block';
            container.style.visibility = 'visible';
        }
        
        this.elements.attempts.style.display = 'inline-block';
        this.elements.attempts.style.visibility = 'visible';
        
        console.log("Updated attempts display:", this.elements.attempts.textContent);
    },

    showWinNotification(message) {
        this.elements.winNotification.textContent = message;
        this.elements.winNotification.classList.add("show");
        AudioManager.play("levelCleared");
        // Increased to 5 seconds to give time to read the number
        setTimeout(() => {
            this.hideWinNotification();
        }, 5000);
    },

    hideWinNotification() {
        const notification = this.elements.winNotification;
        notification.classList.add("hide");
        setTimeout(() => {
            notification.classList.remove("show", "hide");
        }, 300);
    },

    showGameOverNotification(message) {
        this.elements.gameOverNotification.textContent = message;
        this.elements.gameOverNotification.classList.add("show");
        AudioManager.play("gameOver");
        // Increased to 5 seconds to give time to read the number
        setTimeout(() => {
            this.hideGameOverNotification();
        }, 5000);
    },

    hideGameOverNotification() {
        const notification = this.elements.gameOverNotification;
        notification.classList.add("hide");
        setTimeout(() => {
            notification.classList.remove("show", "hide");
        }, 300);
    },

    showPlayAgainButton() {
        const dropdownContainer = document.querySelector('.dropdown-container');
        
        // Check if button should be in "continue" mode
        const shouldBeContinueButton = gameState.waitingForNextLevel || gameState.finalWin;
        
        // First update button text and style based on game state
        if (this.elements.playAgainBtn) {
            if (shouldBeContinueButton) {
                // Already in continue mode, don't change anything
                if (!this.elements.playAgainBtn.classList.contains('continue-mode')) {
                    const buttonText = gameState.finalWin ? "Play Again" : "Continue";
                    this.transformPlayAgainToContinue(buttonText);
                }
            } else {
                // Not in continue mode
                if (this.elements.playAgainBtn.classList.contains('continue-mode')) {
                    this.restorePlayAgainButton();
                } else if (gameState.gameOver || gameState.hasWon) {
                    this.elements.playAgainBtn.textContent = "Play Again";
                } else {
                    this.elements.playAgainBtn.textContent = "Restart Level";
                }
            }
        }
        
        if (dropdownContainer) {
            // Ensure the container is always visible
            dropdownContainer.style.display = "block";
            
            if (this.elements.playAgainBtn) {
                this.elements.playAgainBtn.style.display = "inline-block";
            }
        } else {
            // Fallback to just showing the button if container not found
            if (this.elements.playAgainBtn) {
                this.elements.playAgainBtn.style.display = "inline-block";
            }
        }

        // CRITICAL FIX: Make sure the arrow is visible after showing button
        setTimeout(() => this.ensureDropdownArrow(), 10);
    },

    hidePlayAgainButton() {
        const dropdownContainer = document.querySelector('.dropdown-container');
        if (dropdownContainer) {
            dropdownContainer.style.display = "none";
            this.elements.playAgainBtn.style.display = "none";
        } else {
            // Fallback to just hiding the button if container not found
            this.elements.playAgainBtn.style.display = "none";
        }
    },

    focusInput() {
        const userGuessInput = document.getElementById('userGuess');
        if (userGuessInput) {
            userGuessInput.focus();
            
            // Allow a small delay for mobile browsers
            setTimeout(() => {
                userGuessInput.focus();
            }, 100);
        }
    },

    updateProximityMeter(guess, target, min, max) {
        // Don't update if guess is invalid
        if (isNaN(guess) || guess < min || guess > max) return;
        
        // Get the proximity container
        const proximityContainer = document.getElementById('proximity-container');
        const proximityFill = document.getElementById('proximity-fill');
        
        if (!proximityContainer || !proximityFill) return;
        
        // Show the proximity meter - it's always vertical now
        proximityContainer.style.display = 'flex';
        
        // Calculate how close the guess is to the target
        const totalRange = max - min;
        const distance = Math.abs(guess - target);
        
        // Use a non-linear algorithm to make proximity feel more accurate
        // This will make small distances feel more significant
        // and create more noticeable changes when getting closer
        
        // Normalize distance to a 0-1 scale
        const normalizedDistance = distance / totalRange;
        
        // Apply a quadratic curve for better sensitivity when closer to the target
        // Square the normalized distance and invert it
        // This creates more visual feedback as you get closer
        const proximityValue = 1 - (normalizedDistance * normalizedDistance);
        
        // Apply exponential scaling for even more accurate feeling
        // This formula creates a slow start and rapid movement as you get very close
        const curvedProximity = Math.pow(proximityValue, 1.5);
        
        // Convert to percentage for the meter fill
        const percentage = curvedProximity * 100;
        
        // Ensure percentage is between 0-100
        const boundedPercentage = Math.max(0, Math.min(100, percentage));
        
        // Update for flipped vertical meter (growing from top)
        proximityFill.style.width = '100%';
        proximityFill.style.height = `${boundedPercentage}%`;
    },

    // Add a method to handle orientation changes for the proximity meter
    handleOrientationChange() {
        const proximityContainer = document.getElementById('proximity-container');
        const proximityFill = document.getElementById('proximity-fill');
        
        if (!proximityContainer || !proximityFill) return;
        
        // Reset for flipped vertical meter
        proximityFill.style.width = '100%';
        proximityFill.style.height = '0%';
        
        // Also update past guesses
        this.updatePastGuesses();
    },

    // Update the past guesses method to show only the last guess
    updatePastGuesses() {
        const lastGuessElement = document.getElementById("last-guess");
        
        if (!lastGuessElement) return;
        
        // Show the last guess if there are any guesses
        if (gameState.pastGuesses.length > 0) {
            const lastGuess = gameState.pastGuesses[gameState.pastGuesses.length - 1];
            const proximityLevel = Math.floor(lastGuess.proximity * 4);
            
            // Update the last guess display
            lastGuessElement.textContent = lastGuess.value;
            lastGuessElement.className = `proximity-${proximityLevel}`;
            lastGuessElement.classList.add('show');
        } else {
            lastGuessElement.className = '';
            lastGuessElement.textContent = '';
            lastGuessElement.classList.remove('show');
        }
    },

    // Improved custom keyboard display methods
    showCustomKeyboard() {
        if (this.elements.customKeyboard) {
            // Make sure keyboard is fully visible
            this.elements.customKeyboard.style.display = 'block';
            this.elements.customKeyboard.style.visibility = 'visible';
            this.elements.customKeyboard.style.opacity = '1';
            
            // Ensure consistent styling for function buttons
            const clearBtn = this.elements.customKeyboard.querySelector('.key-clear');
            const enterBtn = this.elements.customKeyboard.querySelector('.key-enter');
            
            if (clearBtn) {
                clearBtn.style.fontSize = '0.8rem';
            }
            
            if (enterBtn) {
                enterBtn.style.fontSize = '0.8rem';
            }
            
            // Ensure input is readonly to prevent virtual keyboard
            if (this.elements.userGuess) {
                this.elements.userGuess.setAttribute('readonly', true);
                setTimeout(() => this.elements.userGuess.focus(), 0);
            }
            
            console.log("Custom keyboard shown and styled");
        }
    },

    hideCustomKeyboard() {
        if (this.elements.customKeyboard) {
            this.elements.customKeyboard.style.display = 'none';
            console.log("Custom keyboard hidden");
        }
    },

    showRestoreButton() {
        if (this.elements.restoreBtn) {
            this.elements.restoreBtn.style.display = "inline-block";
        }
    },

    hideRestoreButton() {
        if (this.elements.restoreBtn) {
            this.elements.restoreBtn.style.display = "none";
        }
    },

    // Update this method to work with the dropdown menu instead
    updateRestoreButtonVisibility() {
        // No special visibility logic needed anymore - the dropdown
        // is shown whenever the Play Again button is shown
        
        // We previously made this do nothing, but we should at least log something for debugging
        console.log("Dropdown reset menu is available through Play Again button");
    },

    // New method to transform Play Again button into Continue button
    transformPlayAgainToContinue(buttonText = "Continue") {
        const playAgainBtn = this.elements.playAgainBtn;
        if (!playAgainBtn) return;
        
        // Store the original style for later restoration
        playAgainBtn.dataset.originalBg = playAgainBtn.style.backgroundColor || '#666';
        playAgainBtn.dataset.originalText = playAgainBtn.textContent;
        
        // Change appearance to green Continue button
        playAgainBtn.textContent = buttonText; // Ensure text is explicitly set
        playAgainBtn.style.backgroundColor = '#2eb82e';
        
        // Add the continue mode class
        playAgainBtn.classList.add('continue-mode');
        
        // Log the change for debugging
        console.log(`Button transformed to: ${buttonText}`);
        
        // Ensure dropdown setup is refreshed after button transform
        setTimeout(() => {
            if (typeof window.setupDropdownMenu === 'function') {
                window.setupDropdownMenu();
            }
        }, 10);
    },

    // New method to restore Play Again button to original state
    restorePlayAgainButton() {
        const playAgainBtn = this.elements.playAgainBtn;
        if (!playAgainBtn) return;
        
        // Restore original styling
        if (playAgainBtn.dataset.originalBg) {
            playAgainBtn.style.backgroundColor = playAgainBtn.dataset.originalBg;
        } else {
            playAgainBtn.style.backgroundColor = '#666'; // Default color
        }
        
        // Update button text based on game state
        if (gameState.gameOver || gameState.hasWon) {
            playAgainBtn.textContent = "Play Again";
        } else {
            playAgainBtn.textContent = "Restart Level";
        }
        
        // Remove continue mode class
        playAgainBtn.classList.remove('continue-mode');
        
        // Ensure dropdown setup is refreshed after button restore
        setTimeout(() => {
            if (typeof window.setupDropdownMenu === 'function') {
                window.setupDropdownMenu();
            }
        }, 10);
    },

    // Add a new method to ensure dropdown arrow exists and is visible
    ensureDropdownArrow() {
        // Call the global setup function to ensure arrow visibility
        if (typeof window.setupDropdownMenu === 'function') {
            window.setupDropdownMenu();
        }
    }
};