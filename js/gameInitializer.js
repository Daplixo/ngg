/**
 * Game Initializer for Number Guessing Game
 * Responsible for properly setting up the game experience
 */

import { initKeyboard } from './keyboard.js';
import { gameState } from './gameState.js';
import { UIManager } from './uiManager.js';

export function initializeGame() {
    console.log("Initializing game...");
    
    // Reset game state
    resetGameState();
    
    // Initialize UI elements
    UIManager.showGameUI();
    UIManager.updateRangeInfo();
    
    // Initialize custom keyboard
    initKeyboard();
    
    // Generate the first random number
    gameState.generateTargetNumber();
    
    console.log("Game initialization complete");
}

export function resetGameState() {
    // Reset to initial values
    gameState.level = 1;
    gameState.attempts = 0;
    gameState.maxAttempts = 3;
    gameState.maxNumber = 10;
    gameState.targetNumber = null;
    gameState.pastGuesses = [];
    gameState.gameActive = true;
    
    console.log("Game state reset");
}

export function attachEventListeners() {
    console.log("Attaching game event listeners");
    
    // User guess submission
    const userGuessForm = document.getElementById('userGuess');
    const submitGuessBtn = document.getElementById('submitGuessBtn');
    
    if (submitGuessBtn && userGuessForm) {
        submitGuessBtn.addEventListener('click', function() {
            const guess = parseInt(userGuessForm.value);
            if (isNaN(guess) || guess < 1 || guess > gameState.maxNumber) {
                UIManager.showFeedback(`Please enter a number between 1 and ${gameState.maxNumber}.`, 'error');
                return;
            }
            
            gameState.checkGuess(guess);
            userGuessForm.value = '';
        });
    } else {
        console.error("Submit button or input not found");
    }
    
    // Continue to next level
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            gameState.nextLevel();
        });
    }
    
    // Play again (restart level)
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', function() {
            gameState.restartLevel();
        });
    }
    
    // Reset game
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
                resetGameState();
                gameState.generateTargetNumber();
                UIManager.showGameUI();
                UIManager.updateRangeInfo();
                UIManager.updateLevelIndicator();
                UIManager.clearFeedback();
                UIManager.clearPastGuesses();
            }
        });
    }
    
    console.log("Game event listeners attached");
}
