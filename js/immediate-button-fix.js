/**
 * Immediate Button Fix
 * This script runs as soon as it's loaded to ensure correct button text
 */

(function() {
    // Function to force the correct button text based on game state
    function forceCorrectButtonText() {
        try {
            // Get saved state from localStorage
            const savedState = localStorage.getItem('numberGuessGameState');
            if (!savedState) return;
            
            const gs = JSON.parse(savedState);
            const playAgainBtn = document.getElementById('playAgainBtn');
            
            if (!playAgainBtn) return;
            
            if ((gs.waitingForNextLevel || gs.finalWin) && (gs.hasWon || gs.gameOver)) {
                // Continue or Play Again for final win
                const buttonText = gs.finalWin ? "Play Again" : "Continue";
                playAgainBtn.textContent = buttonText;
                playAgainBtn.classList.add('continue-mode');
                playAgainBtn.classList.remove('game-over');
                playAgainBtn.style.backgroundColor = '#2eb82e';
                console.log("Immediate fix: Set button to", buttonText);
            } else if (gs.gameOver) {
                // Game Over state - Play Again
                playAgainBtn.textContent = "Play Again";
                playAgainBtn.classList.remove('continue-mode');
                playAgainBtn.classList.add('game-over');
                console.log("Immediate fix: Set button to Play Again (game over)");
            } else {
                // Normal gameplay - Restart Level
                playAgainBtn.textContent = "Restart Level";
                playAgainBtn.classList.remove('continue-mode', 'game-over');
                console.log("Immediate fix: Set button to Restart Level");
            }
        } catch (e) {
            console.error("Error in immediate button fix:", e);
        }
    }
    
    // Run immediately
    forceCorrectButtonText();
    
    // Also run after a small delay to catch late DOM changes
    setTimeout(forceCorrectButtonText, 300);
    
    // Make the function available globally for debugging
    window.forceCorrectButtonText = forceCorrectButtonText;
})();
