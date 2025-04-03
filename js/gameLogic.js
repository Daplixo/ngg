import { gameState } from './gameState.js';
import { UIManager } from './uiManager.js';
import { AudioManager } from './audioManager.js';

// Set debug flag to false for production
const DEBUG = false;

function log(message) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`);
    }
}

export class GameLogic {
    static handleWin() {
        console.log(`[GAME] Player won level ${gameState.level}`);
        gameState.hasWon = true;
        
        // Save state after winning
        gameState.saveState();
        
        // Hide the keyboard when player wins
        UIManager.hideCustomKeyboard();

        if (gameState.level < 3) {
            UIManager.clearFeedback(); // Remove text message, just show notification
            UIManager.showWinNotification(`Correct! The number was ${gameState.randomNumber}. Level ${gameState.level} cleared!`);
            gameState.waitingForNextLevel = true;
            gameState.saveState(); // Save that we're waiting for next level
            
            // Transform the Play Again button into a Continue button
            // Always explicitly set text to "Continue" for levels 1-2
            UIManager.transformPlayAgainToContinue("Continue");
        } else {
            gameState.finalWin = true;
            gameState.saveState(); // Save final win state
            UIManager.clearFeedback(); // Remove text message
            UIManager.showWinNotification(`Correct! The number was ${gameState.randomNumber}. You cleared the final level!`);
            
            // For the final level, use "Play Again"
            UIManager.transformPlayAgainToContinue("Play Again");
        }
    }

    static showLevelStartNotification(level) {
        // First remove ALL existing notifications to prevent multiple notifications
        const allNotifications = document.querySelectorAll('div[style*="position:fixed"][style*="top:20px"]');
        allNotifications.forEach(notification => notification.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = `Level ${level} started`;
        tempNotification.setAttribute('data-notification-type', 'level-start');
        tempNotification.setAttribute('id', 'level-start-notification');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2eb82e;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        
        // Use animation frame for smoother rendering
        requestAnimationFrame(() => {
            // Ensure the notification is visible for a moment before fading
            setTimeout(() => {
                // Check if the element still exists before modifying it
                if (document.getElementById('level-start-notification')) {
                    tempNotification.style.transition = 'opacity 0.5s ease';
                    tempNotification.style.opacity = '0';
                    setTimeout(() => {
                        if (document.getElementById('level-start-notification')) {
                            tempNotification.remove();
                        }
                    }, 500);
                }
            }, 2000);
        });
    }

    static continueNextLevel() {
        console.log("[DEBUG] continueNextLevel called");
        
        if (gameState.finalWin) {
            console.log("[DEBUG] Final win detected, doing clean restart");
            // Do a clean restart without using playAgain
            gameState.reset(true);
            UIManager.updateRangeInfo();
            this.resetUI();
            return;
        }
        
        if (gameState.waitingForNextLevel) {
            console.log("[DEBUG] Waiting for next level, continuing to level " + (gameState.level + 1));
            
            // Store the new level number before updating state
            const newLevel = gameState.level + 1;
            
            // Set a flag to prevent playAgain from showing restart notification
            window._isLevelTransition = true;
            
            // Update game state
            gameState.waitingForNextLevel = false;
            gameState.nextLevel(); // This already saves state
            UIManager.updateRangeInfo();
            this.resetUI();
            
            // Show level start notification using the new level number
            // Slight delay to ensure UI is updated first
            console.log("[DEBUG] Showing level start notification for level", newLevel);
            setTimeout(() => {
                this.showLevelStartNotification(newLevel);
                // Clear the flag after notification is shown
                window._isLevelTransition = false;
            }, 10);
            
            // Reset the button style back to normal
            UIManager.restorePlayAgainButton();
        }
        
        // Hide the original continue button (if it was being used)
        UIManager.elements.continueBtn.style.display = "none";
    }

    static checkGuess(userGuess) {
        if (gameState.gameOver || gameState.hasWon) return;

        userGuess = userGuess.trim().toLowerCase();
        const numericGuess = parseInt(userGuess);
        if (isNaN(numericGuess) || numericGuess < 1 || numericGuess > gameState.maxNumber) {
            // Simplified error message, just "Invalid input!"
            UIManager.setFeedback("Invalid input!");
            UIManager.elements.feedback.style.color = "orange";
            UIManager.focusInput();
            return;
        }

        gameState.attempts++;
        gameState.saveState(); // Save after incrementing attempts

        // Update attempts display immediately
        UIManager.updateAttempts();

        // Calculate proximity for the past guesses feature
        const distance = Math.abs(numericGuess - gameState.randomNumber);
        const totalRange = gameState.maxNumber - 1;
        const normalizedDistance = distance / totalRange;
        const proximity = 1 - (normalizedDistance * normalizedDistance);
        
        const feedback = "Incorrect! Try again.";
        
        // Add guess with proximity to gameState
        gameState.addGuess(numericGuess, proximity);
        
        // Update past guesses display
        UIManager.updatePastGuesses();

        if (numericGuess === gameState.randomNumber) {
            this.handleWin();
        } else {
            // Get the input element for shake effect
            const inputElement = document.getElementById('userGuess');
            
            // Add shake effect if the function is available
            if (window.addShake) {
                window.addShake(inputElement);
            }
            
            // Play the wrong sound BEFORE updating UI for faster response
            if (window.playWrongSound) {
                window.playWrongSound(false);
            }
            
            // Update proximity meter
            UIManager.updateProximityMeter(
                numericGuess, 
                gameState.randomNumber, 
                1, 
                gameState.maxNumber
            );
            
            if (gameState.attempts >= gameState.maxAttempts) {
                UIManager.clearFeedback();
                gameState.gameOver = true;
                gameState.saveState();
                
                // Play game over sound directly via AudioManager for reliability
                AudioManager.playBeep(true);
                
                UIManager.showGameOverNotification(`Game Over! The number was ${gameState.randomNumber}`);
                UIManager.showPlayAgainButton();
                UIManager.hideCustomKeyboard();
            } else {
                UIManager.setFeedback(feedback);
                UIManager.elements.feedback.style.color = "red";
                
                // Already played wrong sound at the start
                
                setTimeout(UIManager.focusInput, 10);
            }
        }
        
        // Ensure attempts display is updated
        UIManager.updateAttempts();
    }

    static resetUI() {
        UIManager.hideWinNotification();
        UIManager.hideGameOverNotification();
        // Remove the line that hides the Play Again button
        // UIManager.hidePlayAgainButton();
        
        // Instead, ensure the button is shown with the appropriate text
        UIManager.showPlayAgainButton();
        
        UIManager.elements.continueBtn.style.display = "none";
        UIManager.elements.restartBtn.style.display = "none";
        
        // Remove the explicit feedback message when restarting or changing levels
        UIManager.clearFeedback();
        
        // Update to use CSS variables instead of hardcoded color
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            UIManager.elements.feedback.style.color = "var(--feedback-light)";
        } else {
            UIManager.elements.feedback.style.color = "#333";
        }
        
        UIManager.updateAttempts(); // This will now show "Attempts: 0/X"
        
        // Reset fill position for flipped vertical meter
        const proximityFill = document.getElementById('proximity-fill');
        if (proximityFill) {
            proximityFill.style.width = '100%';
            proximityFill.style.height = '0%';
        }
        
        UIManager.elements.userGuess.value = "";
        UIManager.focusInput();
        
        // Also reset past guesses display
        UIManager.updatePastGuesses();
        
        // Always show keyboard regardless of game state
        UIManager.showCustomKeyboard();
        
        // Remove conditional checks to display keyboard
        // Always display the keyboard for UI consistency
    }

    static startGameMode() {
        UIManager.showGameUI();
        UIManager.updateRangeInfo();
        UIManager.focusInput();
    }

    static restartGame(resetEverything = true) {
        if (resetEverything) {
            gameState.reset(true);
        }
        
        UIManager.updateRangeInfo();
        this.resetUI();
        
        // This call is no longer needed since we're using dropdown
        // UIManager.updateRestoreButtonVisibility();
    }

    static playAgain() {
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
            const currentMaxNumber = gameState.maxNumber;
            const currentMaxAttempts = gameState.maxAttempts;
            
            // Reset but keep level parameters
            gameState.attempts = 0;
            gameState.gameOver = false;
            gameState.hasWon = false;
            gameState.finalWin = false;
            gameState.waitingForNextLevel = false;
            gameState.pastGuesses = [];
            gameState.randomNumber = Math.floor(Math.random() * currentMaxNumber) + 1;
            
            // Save the reset state
            gameState.saveState();
            
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
        }
        
        // Show keyboard again if needed
        UIManager.showCustomKeyboard();
    }

    static showLevelRestartNotification(level) {
        // First remove ALL existing notifications
        const allNotifications = document.querySelectorAll('div[style*="position:fixed"][style*="top:20px"]');
        allNotifications.forEach(notification => notification.remove());
        
        // Skip if we're in a level transition
        if (window._isLevelTransition === true) {
            console.log("[DEBUG] Skipping restart notification during level transition");
            return;
        }
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = `Level ${level} restarted`;
        tempNotification.setAttribute('data-notification-type', 'level-restart');
        tempNotification.setAttribute('id', 'level-restart-notification');
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8e44ad;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        setTimeout(() => {
            // Check if the element still exists before modifying it
            if (document.getElementById('level-restart-notification')) {
                tempNotification.style.opacity = '0';
                tempNotification.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (document.getElementById('level-restart-notification')) {
                        tempNotification.remove();
                    }
                }, 500);
            }
        }, 2000);
    }

    static handleKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            console.log("[DEBUG] Enter key pressed, game state:", 
                gameState.finalWin ? "finalWin" : 
                gameState.waitingForNextLevel ? "waitingForNextLevel" : 
                gameState.gameOver ? "gameOver" : "normal");
                
            if (gameState.finalWin) {
                console.log("[DEBUG] Final win, restarting game");
                // Use restartGame directly instead of playAgain to avoid showing restart notification
                this.restartGame(true);
                return;
            }
            
            if (gameState.waitingForNextLevel) {
                console.log("[DEBUG] Waiting for next level, continuing to level " + (gameState.level + 1));
                
                // Set transition flag to true
                window._isLevelTransition = true;
                
                // Store the new level number before updating state
                const newLevel = gameState.level + 1;
                
                // Update game state
                gameState.waitingForNextLevel = false;
                gameState.nextLevel(); // This already saves state
                UIManager.updateRangeInfo();
                this.resetUI();
                
                // Show level start notification using the new level number
                // Slight delay to ensure UI is updated first
                console.log("[DEBUG] Showing level start notification for level", newLevel);
                setTimeout(() => {
                    this.showLevelStartNotification(newLevel);
                    // Clear the flag after notification is shown
                    window._isLevelTransition = false;
                }, 10);
                
                // Reset the button style back to normal
                UIManager.restorePlayAgainButton();
                
                UIManager.elements.continueBtn.style.display = "none";
                return;
            }
            
            if (gameState.gameOver) {
                this.restartGame();
            } else {
                this.checkGuess(UIManager.elements.userGuess.value);
            }
        } else if (event.key === " ") {
            event.preventDefault();
            this.restartGame();
        }
    }
    
    // Method to reset the game state completely - replaces restoreGame
    static restoreGame() {
        console.log('[GAME] Performing full game reset');
        
        // Remove confirmation dialog and directly reset the game
        // Clear the saved state
        gameState.clearSavedState();
        
        // Reset to initial game state
        gameState.level = 1;
        gameState.maxNumber = 10;
        gameState.maxAttempts = 3;
        gameState.attempts = 0;
        gameState.randomNumber = Math.floor(Math.random() * 10) + 1;
        gameState.gameOver = false;
        gameState.hasWon = false;
        gameState.waitingForNextLevel = false;
        gameState.finalWin = false;
        gameState.pastGuesses = [];
        
        // Update UI completely
        UIManager.updateRangeInfo();
        UIManager.updateAttempts();
        this.resetUI();
        
        // Show a temporary notification about the reset
        this.showResetNotification();
        
        // Show keyboard for a fresh game
        UIManager.showCustomKeyboard();
        
        return true;
    }
    
    static showResetNotification() {
        // First remove ALL existing notifications
        const allNotifications = document.querySelectorAll('div[style*="position:fixed"][style*="top:20px"]');
        allNotifications.forEach(notification => notification.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = "Reset successful!";
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e74c3c;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        setTimeout(() => {
            tempNotification.style.opacity = '0';
            tempNotification.style.transition = 'opacity 0.5s';
            setTimeout(() => tempNotification.remove(), 500);
        }, 3000);
    }
    
    static showGameRestoredNotification() {
        // First remove ALL existing notifications
        const allNotifications = document.querySelectorAll('div[style*="position:fixed"][style*="top:20px"]');
        allNotifications.forEach(notification => notification.remove());
        
        const tempNotification = document.createElement('div');
        tempNotification.textContent = "Game restored!";
        tempNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8e44ad;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(tempNotification);
        setTimeout(() => {
            tempNotification.style.opacity = '0';
            tempNotification.style.transition = 'opacity 0.5s';
            setTimeout(() => tempNotification.remove(), 500);
        }, 3000);
    }
    
    static showErrorNotification(message) {
        // First remove ALL existing notifications
        const allNotifications = document.querySelectorAll('div[style*="position:fixed"][style*="top:20px"]');
        allNotifications.forEach(notification => notification.remove());
        
        const errorNotification = document.createElement('div');
        errorNotification.textContent = message;
        errorNotification.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e74c3c;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
        document.body.appendChild(errorNotification);
        setTimeout(() => {
            errorNotification.style.opacity = '0';
            errorNotification.style.transition = 'opacity 0.5s';
            setTimeout(() => errorNotification.remove(), 500);
        }, 3000);
    }
}
