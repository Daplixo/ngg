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
        
        // Hide the keyboard when player wins
        UIManager.hideCustomKeyboard();

        if (gameState.level < 3) {
            UIManager.clearFeedback(); // Remove text message, just show notification
            UIManager.showWinNotification(`Correct! The number was ${gameState.randomNumber}. Level ${gameState.level} cleared!`);
            gameState.waitingForNextLevel = true;
            UIManager.elements.continueBtn.style.display = "inline-block";
        } else {
            gameState.finalWin = true;
            UIManager.clearFeedback(); // Remove text message
            UIManager.showWinNotification(`Correct! The number was ${gameState.randomNumber}. You cleared the final level!`);
            UIManager.elements.continueBtn.style.display = "inline-block";
        }
    }

    static continueNextLevel() {
        if (gameState.finalWin) {
            this.playAgain();
            return;
        }
        
        if (gameState.waitingForNextLevel) {
            gameState.waitingForNextLevel = false;
            gameState.nextLevel();
            UIManager.updateRangeInfo();
            this.resetUI();
        }
        
        UIManager.elements.continueBtn.style.display = "none";
    }

    static checkGuess(userGuess) {
        if (gameState.gameOver || gameState.hasWon) return;

        userGuess = userGuess.trim().toLowerCase();
        const numericGuess = parseInt(userGuess);
        if (isNaN(numericGuess) || numericGuess < 1 || numericGuess > gameState.maxNumber) {
            UIManager.setFeedback("Invalid input! Enter a number within the range.");
            UIManager.elements.feedback.style.color = "orange";
            UIManager.focusInput();
            return;
        }

        gameState.attempts++;

        // Calculate proximity for the past guesses feature
        const distance = Math.abs(numericGuess - gameState.randomNumber);
        const totalRange = gameState.maxNumber - 1;
        const normalizedDistance = distance / totalRange;
        const proximity = 1 - (normalizedDistance * normalizedDistance);
        
        // Simplified feedback - just say it's incorrect
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
            
            // Update proximity meter
            UIManager.updateProximityMeter(
                numericGuess, 
                gameState.randomNumber, 
                1, 
                gameState.maxNumber
            );
            
            if (gameState.attempts >= gameState.maxAttempts) {
                UIManager.clearFeedback(); // Remove text message, just show notification
                gameState.gameOver = true;
                UIManager.showGameOverNotification(`Game Over! The number was ${gameState.randomNumber}`);
                UIManager.showPlayAgainButton();
                
                // Hide the keyboard on game over
                UIManager.hideCustomKeyboard();
            } else {
                UIManager.setFeedback(feedback);
                UIManager.elements.feedback.style.color = "red";
                
                // Play wrong sound at reduced volume if available
                if (window.playWrongSound) {
                    window.playWrongSound(false);
                }
                
                // Refocus the input field after showing feedback
                setTimeout(UIManager.focusInput, 10);
            }
        }
        UIManager.updateAttempts();
    }

    static resetUI() {
        UIManager.hideWinNotification();
        UIManager.hideGameOverNotification();
        UIManager.hidePlayAgainButton();
        
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
        
        // Fix: Always check keyboard visibility when game is active
        if (window.innerWidth <= 768 && !gameState.gameOver && !gameState.hasWon) {
            UIManager.showCustomKeyboard();
        } else {
            UIManager.hideCustomKeyboard();
        }
        
        // Show keyboard again if conditions are met
        if (!gameState.gameOver && !gameState.hasWon) {
            UIManager.showCustomKeyboard();
        }
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
    }

    static playAgain() {
        this.restartGame(true);
        // The resetUI method will handle showing the keyboard
    }

    static handleKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (gameState.finalWin) {
                this.playAgain();
                return;
            }
            if (gameState.waitingForNextLevel) {
                gameState.waitingForNextLevel = false;
                gameState.nextLevel();
                UIManager.updateRangeInfo();
                this.resetUI();
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
}
