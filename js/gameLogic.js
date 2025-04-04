import { gameState } from './gameState.js';
import { UIManager } from './uiManager.js';
import { AudioManager } from './audioManager.js';
import { UserProfile } from './userProfile.js';

// CRITICAL FIX: Completely replace existing file with this single implementation
export const GameLogic = {
    // Initialize the game
    initGame() {
        console.log("Initializing game logic...");
        
        // Generate the first random number
        gameState.randomNumber = Math.floor(Math.random() * gameState.maxNumber) + 1;
        console.log(`Target number generated: ${gameState.randomNumber}`);
        
        // Reset UI elements
        this.resetUI();
        UIManager.updateRangeInfo();
        UIManager.updateLevelIndicator();
        UIManager.showPlayAgainButton();
        
        // Save initial state
        gameState.saveState();
    },
    
    checkGuess(userGuess) {
        console.log(`Checking guess: ${userGuess}`);
        
        if (gameState.gameOver || gameState.hasWon) return;

        userGuess = userGuess.toString().trim();
        const numericGuess = parseInt(userGuess);
        
        // Validate input
        if (isNaN(numericGuess) || numericGuess < 1 || numericGuess > gameState.maxNumber) {
            // MODIFIED: Use shorter error message
            this.showErrorMessage("Invalid input", 'invalid-input');
            
            if (window.addShake) {
                window.addShake(UIManager.elements.userGuess);
            }
            return;
        }

        // Increment attempts
        gameState.attempts++;
        
        // Update attempts display immediately
        UIManager.updateAttempts();
        
        // Calculate proximity for the meter
        const distance = Math.abs(numericGuess - gameState.randomNumber);
        const totalRange = gameState.maxNumber - 1;
        const normalizedDistance = distance / totalRange;
        const proximity = 1 - (normalizedDistance * normalizedDistance);
        
        // Add guess to history
        gameState.addGuess(numericGuess, proximity);
        
        // Update past guesses display
        UIManager.updatePastGuesses();

        // Check if guess is correct
        if (numericGuess === gameState.randomNumber) {
            this.handleWin();
        } else {
            this.handleIncorrectGuess(numericGuess);
        }
        
        // Save state after processing guess
        gameState.saveState();
    },
    
    handleWin() {
        console.log("Correct guess!");
        gameState.hasWon = true;
        
        // Clear any error messages
        this.clearErrorMessage();
        
        // Update user profile statistics
        try {
            const userProfile = new UserProfile();
            if (userProfile.hasProfile()) {
                userProfile.updateStatistics({ level: gameState.level });
            }
        } catch(e) {
            console.error("Error updating profile:", e);
        }
        
        // Check if this is the final level
        if (gameState.level >= 3) {
            gameState.finalWin = true;
            // Make sure to show the win notification
            UIManager.showWinNotification(`Congratulations! You've completed all levels! The number was ${gameState.randomNumber}.`);
        } else {
            gameState.waitingForNextLevel = true;
            // Simplified notification text - removed "Ready for level X?" question
            UIManager.showWinNotification(`Correct! The number was ${gameState.randomNumber}.`);
        }
        
        // Update UI to continue mode
        UIManager.transformPlayAgainToContinue(gameState.finalWin ? "Play Again" : "Continue");
        
        // Make this change immediately visible
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.textContent = gameState.finalWin ? "Play Again" : "Continue";
            playAgainBtn.classList.add('continue-mode');
            playAgainBtn.classList.remove('game-over');
            playAgainBtn.style.backgroundColor = '#2eb82e';
        }
        
        if (UIManager.elements.continueBtn) {
            UIManager.elements.continueBtn.style.display = "inline-block";
        }
        
        // Save game state
        gameState.saveState();
    },
    
    handleIncorrectGuess(guess) {
        // Determine if guess is too high or too low
        const isHigher = guess > gameState.randomNumber;
        
        // Show incorrect guess message
        // MODIFIED: Use shorter error message
        this.showErrorMessage("Incorrect guess", 'incorrect-guess');
        
        // MODIFIED: Remove the text feedback message - we'll use only the proximity meter
        // Clear any previous feedback text
        UIManager.clearFeedback();
        
        // Update the proximity meter
        UIManager.updateProximityMeter(guess, gameState.randomNumber, 1, gameState.maxNumber);
        
        // ADDED: Update previous guess display
        UIManager.updatePreviousGuess(guess);
        
        // Play sound effect
        if (window.playWrongSound) {
            window.playWrongSound(false);
        }
        
        // Add shake effect
        if (window.addShake) {
            window.addShake(UIManager.elements.userGuess);
        }
        
        // Check if game is over
        if (gameState.attempts >= gameState.maxAttempts) {
            this.handleGameOver();
        }
    },
    
    handleGameOver() {
        console.log("Game over");
        gameState.gameOver = true;
        
        // Clear feedback message
        UIManager.clearFeedback();
        
        // Play game over sound
        AudioManager.playBeep(true);
        
        // Update UI
        UIManager.showGameOverNotification(`Game Over! The number was ${gameState.randomNumber}.`);
        
        // Update UI to Play Again mode
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.textContent = "Play Again";
            playAgainBtn.classList.remove('continue-mode');
            playAgainBtn.classList.add('game-over');
        }
        
        UIManager.showPlayAgainButton();
        
        // Save game state
        gameState.saveState();
    },
    
    continueNextLevel() {
        console.log("Continuing to next level");
        
        // ADDED: Clear any existing win notification immediately
        UIManager.hideWinNotification(true);
        
        // ADDED: Reset previous guess display
        UIManager.resetPreviousGuess();
        
        if (gameState.finalWin) {
            // Complete reset if finished all levels
            this.restoreGame();
            return;
        }
        
        if (gameState.waitingForNextLevel) {
            // Store the new level number before updating state
            const newLevel = gameState.level + 1;
            
            // Set a flag to prevent playAgain from showing restart notification
            window._isLevelTransition = true;
            
            // Move to next level
            gameState.waitingForNextLevel = false;
            gameState.nextLevel();
            
            // Reset UI
            UIManager.clearFeedback();
            
            // Reset proximity meter for new level
            UIManager.resetProximityMeter();
            
            // ADDED: Update attempts display immediately to reflect new maxAttempts
            UIManager.updateAttempts();
            
            // BUGFIX: Explicitly restore button to "Restart Level" state
            const playAgainBtn = document.getElementById('playAgainBtn');
            if (playAgainBtn) {
                playAgainBtn.textContent = "Restart Level";
                playAgainBtn.classList.remove('continue-mode', 'game-over');
                playAgainBtn.style.backgroundColor = '';
                console.log("Button reset to Restart Level for new level");
            }
            
            UIManager.elements.continueBtn.style.display = "none";
            UIManager.updateRangeInfo();
            UIManager.updateLevelIndicator();
            UIManager.updatePastGuesses();
            
            // Show level start notification
            this.showLevelStartNotification(newLevel);
            
            // Clear the flag after notification is shown
            setTimeout(() => {
                window._isLevelTransition = false;
            }, 100);
        }
    },
    
    playAgain() {
        console.log("Play again triggered");
        
        // ADDED: Hide any existing notifications immediately
        UIManager.hideWinNotification(true);
        UIManager.hideGameOverNotification(true);
        
        // ADDED: Reset previous guess display
        UIManager.resetPreviousGuess();
        
        // If we're waiting for next level, make sure we don't restart the current one
        if (gameState.waitingForNextLevel) {
            this.continueNextLevel();
            return;
        }
        
        // Skip showing restart notification if we're in a level transition
        const isLevelTransition = window._isLevelTransition === true;
        
        // If game is not over or won, just restart the current level
        const restartCurrentLevel = !gameState.gameOver && !gameState.hasWon;
        
        if (restartCurrentLevel) {
            // Keep the current level but reset attempts and guesses
            const currentLevel = gameState.level;
            
            // Reset but keep level parameters
            gameState.reset(false);
            
            // Reset proximity meter for restarted level
            UIManager.resetProximityMeter();
            
            // Update UI for the restarted level
            UIManager.updateRangeInfo();
            this.resetUI();
            
            // Show a notification only if not in level transition
            if (!isLevelTransition) {
                this.showLevelRestartNotification(currentLevel);
            }
        } else {
            // Full game restart (original behavior)
            this.restartGame(true);
            
            // Reset proximity meter for new game
            UIManager.resetProximityMeter();
            
            // Show game restart notification
            this.showGameRestartNotification();
        }
    },
    
    restartGame(resetEverything = true) {
        console.log("Completely resetting game");
        
        // Full reset
        gameState.reset(resetEverything);
        
        // Reset UI
        UIManager.clearFeedback();
        UIManager.elements.continueBtn.style.display = "none";
        UIManager.updateRangeInfo();
        UIManager.updateLevelIndicator();
        UIManager.updateAttempts();
        UIManager.updatePastGuesses();
        UIManager.showCustomKeyboard();
        
        // ADDED: Reset previous guess display
        UIManager.resetPreviousGuess();
    },
    
    restoreGame() {
        console.log("Restoring fresh game");
        
        // Full reset
        gameState.reset(true);
        
        // Reset UI
        UIManager.clearFeedback();
        UIManager.elements.continueBtn.style.display = "none";
        UIManager.updateRangeInfo();
        UIManager.updateLevelIndicator();
        UIManager.updateAttempts();
        UIManager.restorePlayAgainButton();
        UIManager.updatePastGuesses();
        UIManager.showCustomKeyboard();
        
        // ADDED: Reset previous guess display
        UIManager.resetPreviousGuess();
        
        // Reset button state
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.textContent = "Restart Level";
            playAgainBtn.classList.remove('continue-mode', 'game-over');
            playAgainBtn.style.backgroundColor = '';
        }
        
        // Show notification
        this.showResetNotification();
    },
    
    resetUI() {
        UIManager.hideWinNotification();
        UIManager.hideGameOverNotification();
        UIManager.showPlayAgainButton();
        UIManager.elements.continueBtn.style.display = "none";
        UIManager.clearFeedback();
        UIManager.updateAttempts();
        
        // Reset proximity meter
        UIManager.resetProximityMeter();
        
        // ADDED: Reset previous guess display
        UIManager.resetPreviousGuess();
        
        if (UIManager.elements.userGuess) {
            UIManager.elements.userGuess.value = "";
            UIManager.elements.userGuess.focus();
        }
        
        UIManager.updatePastGuesses();
        UIManager.showCustomKeyboard();
        
        // Clear any error messages
        this.clearErrorMessage();
    },
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const userGuessInput = UIManager.elements.userGuess;
            if (userGuessInput && userGuessInput.value.trim()) {
                this.checkGuess(userGuessInput.value);
                userGuessInput.value = '';
            }
        }
    },
    
    showLevelStartNotification(level) {
        // First remove existing notifications
        const existingNotifications = document.querySelectorAll('div[data-notification-type]');
        existingNotifications.forEach(note => note.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = `Level ${level} started`;
        tempNotification.setAttribute('data-notification-type', 'level-start');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2eb82e;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        
        setTimeout(() => {
            tempNotification.style.transition = 'opacity 0.5s ease';
            tempNotification.style.opacity = '0';
            setTimeout(() => tempNotification.remove(), 500);
        }, 2000);
    },
    
    showLevelRestartNotification(level) {
        // First remove existing notifications
        const existingNotifications = document.querySelectorAll('div[data-notification-type]');
        existingNotifications.forEach(note => note.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = `Level ${level} restarted`;
        tempNotification.setAttribute('data-notification-type', 'level-restart');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8e44ad;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        
        setTimeout(() => {
            tempNotification.style.transition = 'opacity 0.5s ease';
            tempNotification.style.opacity = '0';
            setTimeout(() => tempNotification.remove(), 500);
        }, 2000);
    },
    
    showResetNotification() {
        // First remove existing notifications
        const existingNotifications = document.querySelectorAll('div[data-notification-type]');
        existingNotifications.forEach(note => note.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = "Game reset!";
        tempNotification.setAttribute('data-notification-type', 'reset');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e74c3c;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        
        setTimeout(() => {
            tempNotification.style.transition = 'opacity 0.5s ease';
            tempNotification.style.opacity = '0';
            setTimeout(() => tempNotification.remove(), 500);
        }, 2000);
    },
    
    showGameRestartNotification() {
        // First remove existing notifications
        const existingNotifications = document.querySelectorAll('div[data-notification-type]');
        existingNotifications.forEach(note => note.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = "Game Restarted";
        tempNotification.setAttribute('data-notification-type', 'game-restart');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e67e22;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        
        setTimeout(() => {
            tempNotification.style.transition = 'opacity 0.5s ease';
            tempNotification.style.opacity = '0';
            setTimeout(() => tempNotification.remove(), 500);
        }, 2000);
    },
    
    showErrorMessage(message, type = 'incorrect-guess') {
        const errorContainer = document.getElementById('error-message');
        if (!errorContainer) return;
        
        // Set the message and make it visible
        errorContainer.textContent = message;
        errorContainer.className = 'error-message ' + type + ' visible';
        
        // Hide message after a delay
        setTimeout(() => {
            if (errorContainer) {
                errorContainer.classList.remove('visible');
            }
        }, 3000);
    },
    
    clearErrorMessage() {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.classList.remove('visible');
            errorContainer.className = 'error-message';
            errorContainer.textContent = '';
        }
    }
};
