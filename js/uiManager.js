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
        customKeyboard: document.getElementById("custom-keyboard") // Add this line
    },

    showGameUI() {
        this.elements.rangeInfo.style.display = "inline-block";
        this.elements.userGuess.style.display = "block";
        this.elements.submitGuessBtn.style.display = "inline-block";
        this.updateLevelIndicator();
        
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

    updateAttempts() {
        this.elements.attempts.textContent = `Attempts: ${gameState.attempts}/${gameState.maxAttempts}`;
    },

    showWinNotification(message) {
        this.elements.winNotification.textContent = message;
        this.elements.winNotification.classList.add("show");
        AudioManager.play("levelCleared");
        // Increased duration to 4 seconds since it's the only feedback now
        setTimeout(() => {
            this.hideWinNotification();
        }, 4000);
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
        // Increased duration to 4 seconds since it's the only feedback now
        setTimeout(() => {
            this.hideGameOverNotification();
        }, 4000);
    },

    hideGameOverNotification() {
        const notification = this.elements.gameOverNotification;
        notification.classList.add("hide");
        setTimeout(() => {
            notification.classList.remove("show", "hide");
        }, 300);
    },

    showPlayAgainButton() {
        this.elements.playAgainBtn.style.display = "inline-block";
    },

    hidePlayAgainButton() {
        this.elements.playAgainBtn.style.display = "none";
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

    // Update method to show the custom keyboard unconditionally
    showCustomKeyboard() {
        if (this.elements.customKeyboard) {
            this.elements.customKeyboard.style.display = 'block';
            
            // Ensure input is readonly to prevent virtual/physical keyboard
            if (this.elements.userGuess) {
                this.elements.userGuess.setAttribute('readonly', true);
            }
        }
    },
    
    // Method to hide the custom keyboard
    hideCustomKeyboard() {
        if (this.elements.customKeyboard) {
            this.elements.customKeyboard.style.display = 'none';
        }
    }
};