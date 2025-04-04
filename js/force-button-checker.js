/**
 * Force Button Checker
 * Monitors for game state changes and ensures the button shows the correct text
 */

(function() {
    console.log("Starting button state monitor");
    
    // Function to check game state and update button accordingly
    function checkAndUpdateButton() {
        try {
            // Try to get game state from window or localStorage
            const gs = window.gameState || JSON.parse(localStorage.getItem('numberGuessGameState') || '{}');
            
            // Get button element
            const playAgainBtn = document.getElementById('playAgainBtn');
            if (!playAgainBtn) return;
            
            if ((gs.waitingForNextLevel || gs.finalWin) && (gs.hasWon || gs.gameOver)) {
                // Should be showing Continue/Play Again
                const text = gs.finalWin ? "Play Again" : "Continue";
                
                if (playAgainBtn.textContent !== text || !playAgainBtn.classList.contains('continue-mode')) {
                    console.log(`Button should be "${text}" - fixing`);
                    playAgainBtn.textContent = text;
                    playAgainBtn.classList.add('continue-mode');
                    playAgainBtn.classList.remove('game-over');
                    playAgainBtn.style.backgroundColor = '#2eb82e';
                }
            } else if (gs.gameOver) {
                // Game Over - should show Play Again
                if (playAgainBtn.textContent !== "Play Again" || playAgainBtn.classList.contains('continue-mode')) {
                    console.log("Button should be Play Again - fixing");
                    playAgainBtn.textContent = "Play Again";
                    playAgainBtn.classList.remove('continue-mode');
                    playAgainBtn.classList.add('game-over');
                    playAgainBtn.style.backgroundColor = '#e74c3c';
                }
            } else {
                // Regular gameplay - should show Restart Level
                if (playAgainBtn.textContent !== "Restart Level" || 
                    playAgainBtn.classList.contains('continue-mode') || 
                    playAgainBtn.classList.contains('game-over')) {
                    
                    console.log("Button should be Restart Level - fixing");
                    playAgainBtn.textContent = "Restart Level";
                    playAgainBtn.classList.remove('continue-mode', 'game-over');
                    playAgainBtn.style.backgroundColor = '';
                }
            }
        } catch (e) {
            console.error("Error in button state checker:", e);
        }
    }
    
    // Check initially
    checkAndUpdateButton();
    
    // Set up a periodic checker
    const checkInterval = setInterval(checkAndUpdateButton, 1000);
    
    // Monitor clicks on play again button to catch state transitions
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'playAgainBtn' || 
                         e.target.id === 'continueBtn')) {
            // Give time for state to update
            setTimeout(checkAndUpdateButton, 100);
            setTimeout(checkAndUpdateButton, 500);
        }
    });
    
    // Make checker available globally
    window.checkButtonState = checkAndUpdateButton;
})();
