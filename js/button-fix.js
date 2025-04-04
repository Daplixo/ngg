/**
 * Button Fix Script
 * This script ensures the Continue button displays properly after winning a level
 */

(function() {
    console.log("Running button fix script");
    
    function fixContinueButton() {
        // Check if we're in a state that should show the Continue button
        try {
            // Get game state - either from window.gameState or localStorage
            let gs;
            if (window.gameState) {
                gs = window.gameState;
            } else {
                const savedState = localStorage.getItem('numberGuessGameState');
                if (savedState) {
                    gs = JSON.parse(savedState);
                }
            }
            
            if (!gs) {
                console.log("No game state found to check");
                return;
            }
            
            // Check if we should show Continue button
            if ((gs.waitingForNextLevel || gs.finalWin) && (gs.hasWon || gs.gameOver)) {
                console.log("Should be showing Continue button - applying fix");
                
                // Get the button
                const playAgainBtn = document.getElementById('playAgainBtn');
                
                if (playAgainBtn) {
                    // Set button text
                    const buttonText = gs.finalWin ? "Play Again" : "Continue";
                    playAgainBtn.textContent = buttonText;
                    
                    // Apply styling directly
                    playAgainBtn.classList.add('continue-mode');
                    playAgainBtn.classList.remove('game-over');
                    playAgainBtn.style.backgroundColor = '#2eb82e';
                    
                    console.log("Applied continue styling to button");
                } else {
                    console.log("Play Again button not found");
                }
            } else if (gs.gameOver) {
                // If game is over but not waiting for next level, show "Play Again"
                const playAgainBtn = document.getElementById('playAgainBtn');
                if (playAgainBtn) {
                    playAgainBtn.textContent = "Play Again";
                    playAgainBtn.classList.remove('continue-mode');
                    playAgainBtn.classList.add('game-over');
                    console.log("Applied Play Again styling to button");
                }
            } else {
                // Default state - "Restart Level"
                const playAgainBtn = document.getElementById('playAgainBtn');
                if (playAgainBtn) {
                    playAgainBtn.textContent = "Restart Level";
                    playAgainBtn.classList.remove('continue-mode', 'game-over');
                    playAgainBtn.style.backgroundColor = ''; // Reset to default
                    console.log("Applied Restart Level styling to button");
                }
            }
        } catch (e) {
            console.error("Error in fixContinueButton:", e);
        }
    }
    
    // Run the fix immediately
    fixContinueButton();
    
    // Also run after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', fixContinueButton);
    
    // And add a delayed check for good measure
    setTimeout(fixContinueButton, 1000);
    
    // BUGFIX: Check for button state when game state changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'numberGuessGameState') {
            console.log("Game state changed, checking button state");
            setTimeout(fixContinueButton, 50);
        }
    });
    
    // Make fix function available globally
    window.fixContinueButton = fixContinueButton;
})();
