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
        customKeyboard: document.getElementById("custom-keyboard"),
        restoreBtn: document.getElementById("restoreBtn"),
        previousGuess: document.getElementById("previous-guess")
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
        
        // Ensure any open modals are closed
        this.ensureModalsClosed();
    },

    updateRangeInfo() {
        // Update the input placeholder to show the current range
        const userGuessInput = document.getElementById('userGuess');
        if (userGuessInput) {
            userGuessInput.placeholder = `Enter a number (1-${gameState.maxNumber})`;
        }
        
        console.log(`Range updated: 1-${gameState.maxNumber}`);
    },

    updateLevelIndicator() {
        this.elements.levelIndicator.textContent = `Level ${gameState.level}`;
    },

    setFeedback(message, className = "") {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = className;
    },

    clearFeedback() {
        if (this.elements.feedback) {
            this.elements.feedback.textContent = '';
            this.elements.feedback.className = '';
            this.elements.feedback.style.display = 'none'; // Always hide feedback
        }
    },

    updateAttempts() {
        // First ensure the attempts element exists
        if (!this.elements.attempts) {
            this.elements.attempts = document.getElementById('attempts');
            
            // If it doesn't exist, create it
            if (!this.elements.attempts) {
                console.log("Creating attempts element dynamically");
                
                // Get or create the game indicators container
                let gameIndicatorsContainer = document.getElementById('game-indicators-container');
                if (!gameIndicatorsContainer) {
                    const headerCenter = document.querySelector('.header-center');
                    if (headerCenter) {
                        gameIndicatorsContainer = document.createElement('div');
                        gameIndicatorsContainer.id = 'game-indicators-container';
                        headerCenter.appendChild(gameIndicatorsContainer);
                    }
                }
                
                if (gameIndicatorsContainer) {
                    const attemptsElement = document.createElement('p');
                    attemptsElement.id = 'attempts';
                    gameIndicatorsContainer.appendChild(attemptsElement);
                    this.elements.attempts = attemptsElement;
                }
            }
        }

        // Update content and ensure visibility
        if (this.elements.attempts) {
            this.elements.attempts.textContent = `Attempts: ${gameState.attempts}/${gameState.maxAttempts}`;
            this.elements.attempts.setAttribute('data-count', `${gameState.attempts}/${gameState.maxAttempts}`);
            
            // Ensure visibility with consistent styling
            this.elements.attempts.style.display = 'inline-block';
            this.elements.attempts.style.visibility = 'visible';
            this.elements.attempts.style.opacity = '1';
            this.elements.attempts.style.whiteSpace = 'nowrap';
            this.elements.attempts.style.margin = '0';
            
            console.log("Updated attempts display:", this.elements.attempts.textContent);
        } else {
            console.error("Could not create or find attempts element");
        }
    },

    showWinNotification(message) {
        if (!this.elements.winNotification) {
            console.error("Win notification element not found");
            return;
        }
        
        // Make sure notification is visible
        this.elements.winNotification.style.display = "block";
        this.elements.winNotification.style.visibility = "visible";
        this.elements.winNotification.textContent = message;
        this.elements.winNotification.classList.add("show");
        
        // Play sound
        AudioManager.play("levelCleared");
        
        // Keep notification visible for 5 seconds
        setTimeout(() => {
            this.hideWinNotification();
        }, 5000);
        
        console.log("Win notification displayed:", message);
    },

    hideWinNotification(immediate = false) {
        const notification = this.elements.winNotification;
        
        if (immediate) {
            // Immediately hide without transition
            notification.classList.remove("show", "hide");
            notification.textContent = "";
            notification.style.display = "none";
        } else {
            // Standard gradual hide with transition
            notification.classList.add("hide");
            setTimeout(() => {
                notification.classList.remove("show", "hide");
            }, 300);
        }
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

    hideGameOverNotification(immediate = false) {
        const notification = this.elements.gameOverNotification;
        
        if (immediate) {
            // Immediately hide without transition
            notification.classList.remove("show", "hide");
            notification.textContent = "";
            notification.style.display = "none";
        } else {
            // Standard gradual hide with transition
            notification.classList.add("hide");
            setTimeout(() => {
                notification.classList.remove("show", "hide");
            }, 300);
        }
    },

    showPlayAgainButton() {
        const dropdownContainer = document.querySelector('.dropdown-container');
        
        // Check if button should be in "continue" mode
        const shouldBeContinueButton = gameState.waitingForNextLevel || gameState.finalWin;
        const isGameOver = gameState.gameOver && !gameState.waitingForNextLevel;
        
        // First update button text and style based on game state
        if (this.elements.playAgainBtn) {
            if (shouldBeContinueButton) {
                // Already in continue mode, don't change anything
                if (!this.elements.playAgainBtn.classList.contains('continue-mode')) {
                    const buttonText = gameState.finalWin ? "Play Again" : "Continue";
                    this.transformPlayAgainToContinue(buttonText);
                }
            } else if (isGameOver) {
                // Game over state
                if (this.elements.playAgainBtn.classList.contains('continue-mode')) {
                    this.elements.playAgainBtn.classList.remove('continue-mode');
                }
                this.elements.playAgainBtn.classList.add('game-over');
                this.elements.playAgainBtn.textContent = "Play Again";
            } else {
                // Normal gameplay state - "Restart Level"
                if (this.elements.playAgainBtn.classList.contains('continue-mode')) {
                    this.restorePlayAgainButton();
                } else {
                    this.elements.playAgainBtn.classList.remove('continue-mode', 'game-over');
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
        
        if (!proximityContainer || !proximityFill) {
            console.error("Proximity meter elements not found");
            return;
        }
        
        // Show the proximity meter - ensure it's visible with flex display
        proximityContainer.style.display = 'flex';
        proximityContainer.style.visibility = 'visible';
        
        // Make sure the proximity column is visible
        const proximityColumn = document.querySelector('.proximity-column');
        if (proximityColumn) {
            proximityColumn.style.display = 'flex';
            proximityColumn.style.visibility = 'visible';
        }
        
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
        
        console.log(`Updating proximity meter: ${boundedPercentage}%`);
        
        // Update for vertical meter (growing from bottom)
        proximityFill.style.width = '100%';
        proximityFill.style.height = `${boundedPercentage}%`;
        
        // Set color based on proximity percentage
        this.updateProximityColor(proximityFill, boundedPercentage);
        
        // Add a slight transition effect for smoother updates
        proximityFill.style.transition = 'height 0.3s ease-out, background-color 0.3s ease';
        
        // Ensure the proximity meter and its fill are visible
        const proximityMeter = document.getElementById('proximity-meter');
        if (proximityMeter) {
            proximityMeter.style.display = 'block';
            proximityMeter.style.visibility = 'visible';
        }
        
        proximityFill.style.display = 'block';
        proximityFill.style.visibility = 'visible';
    },

    // Add new method to set color based on proximity percentage
    updateProximityColor(element, percentage) {
        // Set color based on percentage ranges
        if (percentage < 20) {
            // Far away - bright red
            element.style.backgroundColor = 'var(--proximity-far-color)';
        } else if (percentage < 40) {
            // Medium far - orange
            element.style.backgroundColor = 'var(--proximity-medium-far-color)';
        } else if (percentage < 60) {
            // Medium - yellow
            element.style.backgroundColor = 'var(--proximity-medium-color)';
        } else if (percentage < 80) {
            // Close - light green
            element.style.backgroundColor = 'var(--proximity-close-color)';
        } else {
            // Very close - bright green
            element.style.backgroundColor = 'var(--proximity-very-close-color)';
        }
    },

    handleOrientationChange() {
        const proximityContainer = document.getElementById('proximity-container');
        const proximityFill = document.getElementById('proximity-fill');
        
        if (!proximityContainer || !proximityFill) return;
        
        // Reset for flipped vertical meter
        proximityFill.style.width = '100%';
        proximityFill.style.height = '0%';
        
        // Reset to default color when orientation changes
        proximityFill.style.backgroundColor = 'var(--proximity-far-color)';
    },

    updatePastGuesses() {
        // Ensure the proximity meter is visible and displayed correctly
        const proximityContainer = document.getElementById('proximity-container');
        const proximityColumn = document.querySelector('.proximity-column');
        
        if (proximityContainer) {
            // Force display as flex for the container
            proximityContainer.style.display = 'flex';
            proximityContainer.style.visibility = 'visible';
            
            // Make sure the proximity column is visible
            if (proximityColumn) {
                proximityColumn.style.display = 'flex';
                proximityColumn.style.visibility = 'visible';
            }
            
            // Ensure the meter and fill are visible
            const proximityMeter = document.getElementById('proximity-meter');
            const proximityFill = document.getElementById('proximity-fill');
            
            if (proximityMeter) {
                proximityMeter.style.display = 'block';
                proximityMeter.style.visibility = 'visible';
            }
            
            if (proximityFill) {
                proximityFill.style.display = 'block';
                proximityFill.style.visibility = 'visible';
            }
        }
    },

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
        // Don't actually hide the keyboard - just log the request
        console.log("Keyboard hide request ignored to maintain UI consistency");
        // Keep keyboard visible at all times for UI consistency
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

    updateRestoreButtonVisibility() {
        console.log("Dropdown reset menu is available through Play Again button");
    },

    transformPlayAgainToContinue(buttonText = "Continue") {
        const playAgainBtn = this.elements.playAgainBtn;
        if (!playAgainBtn) return;
        
        // Store the original style for later restoration
        playAgainBtn.dataset.originalBg = playAgainBtn.style.backgroundColor || '#666';
        playAgainBtn.dataset.originalText = playAgainBtn.textContent;
        
        // Change appearance to green Continue button
        playAgainBtn.textContent = buttonText; // Ensure text is explicitly set
        playAgainBtn.style.backgroundColor = '#2eb82e';
        
        // Add the continue mode class and remove any other state classes
        playAgainBtn.classList.add('continue-mode');
        playAgainBtn.classList.remove('game-over');
        
        // Log the change for debugging
        console.log(`Button transformed to: ${buttonText}`);
        
        // Ensure dropdown setup is refreshed after button transform
        setTimeout(() => {
            if (typeof window.setupDropdownMenu === 'function') {
                window.setupDropdownMenu();
            }
        }, 10);
    },

    restorePlayAgainButton() {
        const playAgainBtn = this.elements.playAgainBtn;
        if (!playAgainBtn) return;
        
        // Restore original styling
        if (playAgainBtn.dataset.originalBg) {
            playAgainBtn.style.backgroundColor = playAgainBtn.dataset.originalBg;
        } else {
            playAgainBtn.style.backgroundColor = ''; // Default color from CSS
        }
        
        // Update button text based on game state
        if (gameState.gameOver && !gameState.waitingForNextLevel) {
            playAgainBtn.textContent = "Play Again";
            playAgainBtn.classList.add('game-over');
            playAgainBtn.classList.remove('continue-mode');
        } else {
            playAgainBtn.textContent = "Restart Level";
            playAgainBtn.classList.remove('game-over', 'continue-mode');
        }
        
        // Remove continue mode class
        playAgainBtn.classList.remove('continue-mode');
        
        // Log the change for debugging
        console.log("Button restored to:", playAgainBtn.textContent);
        
        // Ensure dropdown setup is refreshed after button restore
        setTimeout(() => {
            if (typeof window.setupDropdownMenu === 'function') {
                window.setupDropdownMenu();
            }
        }, 10);
    },

    ensureDropdownArrow() {
        // Call the global setup function to ensure arrow visibility
        if (typeof window.setupDropdownMenu === 'function') {
            window.setupDropdownMenu();
        }
    },

    resetUI() {
        // Reset input field
        if (this.elements.userGuess) {
            this.elements.userGuess.value = '';
            // Make sure placeholder shows current range after reset
            this.elements.userGuess.placeholder = `Enter a number (1-${gameState.maxNumber})`;
        }
        
        // Clear feedback
        this.clearFeedback();
        
        // Update attempts display
        this.updateAttempts();
        
        // ADDED: Reset previous guess display
        this.resetPreviousGuess();
        
        // Clear any error messages
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.classList.remove('visible');
            errorMessage.className = 'error-message';
            errorMessage.textContent = '';
        }
    },

    ensureModalsClosed() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.classList.remove('active');
            window.isModalOpen = false;
        }
    },

    toggleModal(modal) {
        if (!modal) return;
        
        // Toggle the active class to show/hide the modal
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            window.isModalOpen = false;
        } else {
            modal.classList.add('active');
            window.isModalOpen = true;
        }
        
        console.log("Modal toggled:", modal.id, window.isModalOpen);
    },

    resetProximityMeter() {
        console.log("Resetting proximity meter");
        
        const proximityFill = document.getElementById('proximity-fill');
        if (proximityFill) {
            // Reset height to 0 (empty)
            proximityFill.style.width = '100%';
            proximityFill.style.height = '0%';
            
            // Reset color to default (far)
            proximityFill.style.backgroundColor = 'var(--proximity-far-color)';
            
            // Remove any transition to make reset instant
            proximityFill.style.transition = 'none';
            
            // Force reflow to apply changes immediately
            void proximityFill.offsetWidth;
            
            // Restore transition for future updates
            setTimeout(() => {
                proximityFill.style.transition = 'height 0.3s ease-out, background-color 0.3s ease';
            }, 50);
        }
    },

    updatePreviousGuess(guess) {
        // First ensure the previousGuess element exists
        if (!this.elements.previousGuess) {
            this.elements.previousGuess = document.getElementById('previous-guess');
            
            // If it still doesn't exist, create it
            if (!this.elements.previousGuess) {
                console.log("Creating previous guess element dynamically");
                
                // Get or create the game indicators container
                let gameIndicatorsContainer = document.getElementById('game-indicators-container');
                if (!gameIndicatorsContainer) {
                    const headerCenter = document.querySelector('.header-center');
                    if (headerCenter) {
                        gameIndicatorsContainer = document.createElement('div');
                        gameIndicatorsContainer.id = 'game-indicators-container';
                        headerCenter.appendChild(gameIndicatorsContainer);
                    }
                }
                
                if (gameIndicatorsContainer) {
                    const previousGuessElement = document.createElement('div');
                    previousGuessElement.id = 'previous-guess';
                    gameIndicatorsContainer.appendChild(previousGuessElement);
                    this.elements.previousGuess = previousGuessElement;
                }
            }
        }
        
        // Update content and ensure visibility
        if (this.elements.previousGuess) {
            this.elements.previousGuess.textContent = `Last Guess: ${guess}`;
            
            // Ensure visibility with consistent styling
            this.elements.previousGuess.style.display = 'inline-block';
            this.elements.previousGuess.style.visibility = 'visible';
            this.elements.previousGuess.style.opacity = '1';
            this.elements.previousGuess.style.whiteSpace = 'nowrap';
            this.elements.previousGuess.style.margin = '0';
            
            // Add highlight effect
            this.elements.previousGuess.classList.add('highlight');
            setTimeout(() => {
                if (this.elements.previousGuess) {
                    this.elements.previousGuess.classList.remove('highlight');
                }
            }, 1000);
            
            console.log("Updated previous guess display:", guess);
        } else {
            console.error("Could not create or find previous guess element");
        }
    },

    resetPreviousGuess() {
        if (!this.elements.previousGuess) {
            this.elements.previousGuess = document.getElementById('previous-guess');
        }
        
        if (this.elements.previousGuess) {
            this.elements.previousGuess.textContent = "Last Guess: --";
            this.elements.previousGuess.classList.remove('highlight');
            console.log("Reset previous guess display");
        } else {
            console.error("Previous guess element not found for reset");
        }
    }
};