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

        if (gameState.level < 3) {
            UIManager.setFeedback(`Congratulations! You won level ${gameState.level}!`, "win-message");
            UIManager.showWinNotification(`Level ${gameState.level} cleared! Tap Continue...`);
            gameState.waitingForNextLevel = true;
            UIManager.elements.continueBtn.style.display = "inline-block";
        } else {
            gameState.finalWin = true;
            UIManager.setFeedback("Congratulations! You won the game!", "win-message");
            UIManager.showWinNotification("You cleared the final level!");
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
                UIManager.setFeedback(
                    `Game Over! The correct number was ${gameState.randomNumber}. Try again.`,
                    "game-over"
                );
                gameState.gameOver = true;
                UIManager.showGameOverNotification("You ran out of attempts!");
                UIManager.showPlayAgainButton();
            } else {
                UIManager.setFeedback("Incorrect! Try again!");
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
        
        UIManager.setFeedback("Enter your guess and press Submit!");
        
        // Update to use CSS variables instead of hardcoded color
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            UIManager.elements.feedback.style.color = "var(--feedback-light)";
        } else {
            UIManager.elements.feedback.style.color = "#333";
        }
        
        UIManager.updateAttempts();
        
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
