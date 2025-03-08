import { gameState } from './gameState.js';
import { UIManager } from './uiManager.js';
import { AudioManager } from './audioManager.js';

// Debug flag
const DEBUG = true;

function log(message) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`);
    }
}

export const GameLogic = {
    handleWin() {
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
    },

    continueNextLevel() {
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
    },

    checkGuess(userGuess) {
        if (gameState.gameOver || gameState.hasWon) return;

        userGuess = userGuess.trim().toLowerCase();
        if (userGuess === "boobs") {
            this.handleWin();
            return;
        }

        const numericGuess = parseInt(userGuess);
        if (isNaN(numericGuess) || numericGuess < 1 || numericGuess > gameState.maxNumber) {
            UIManager.setFeedback("Invalid input! Enter a number within the range.");
            UIManager.elements.feedback.style.color = "orange";
            return;
        }

        gameState.attempts++;
        if (numericGuess === gameState.randomNumber) {
            this.handleWin();
        } else {
            if (gameState.attempts >= gameState.maxAttempts) {
                UIManager.setFeedback(
                    `Game Over! The correct number was ${gameState.randomNumber}. Try again.`,
                    "game-over"
                );
                gameState.gameOver = true;
                UIManager.showGameOverNotification("You ran out of attempts!");
                UIManager.showPlayAgainButton();
            } else {
                const hint = numericGuess > gameState.randomNumber ? "Your guess is high!" : "Your guess is low!";
                UIManager.setFeedback(`Wrong guess! ${hint} Try again.`);
                UIManager.elements.feedback.style.color = "red";
            }
        }
        UIManager.updateAttempts();
    },

    resetUI() {
        UIManager.hideWinNotification();
        UIManager.hideGameOverNotification();
        UIManager.hidePlayAgainButton();
        UIManager.setFeedback("");
        UIManager.elements.attempts.textContent = "";
        UIManager.elements.userGuess.value = "";
        UIManager.focusInput();
    },

    startGameMode() {
        UIManager.showGameUI();
        UIManager.updateRangeInfo();
        UIManager.focusInput();
    },

    restartGame(resetEverything = true) {
        if (resetEverything) {
            gameState.reset(true);
        }
        
        UIManager.updateRangeInfo();
        this.resetUI();
    },

    playAgain() {
        this.restartGame(true);
    },

    handleKeyPress(event) {
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
};
