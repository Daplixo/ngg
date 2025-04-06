/**
 * Game Notification Fix
 * Ensures proper handling of game notifications
 */

(function() {
    console.log("Game notification fix loaded");
    
    // Fix double notifications issue
    document.addEventListener('DOMContentLoaded', function() {
        // Ensure we have notification containers
        const winNotification = document.getElementById('winNotification');
        const gameOverNotification = document.getElementById('gameOverNotification');
        
        // Clear any stray notifications on page load
        if (winNotification) {
            winNotification.textContent = '';
            winNotification.style.display = 'none';
            winNotification.classList.remove('show', 'hide');
        }
        
        if (gameOverNotification) {
            gameOverNotification.textContent = '';
            gameOverNotification.style.display = 'none';
            gameOverNotification.classList.remove('show', 'hide');
        }
        
        // Monitor for "game over" in GameLogic
        const originalHandleGameOver = window.GameLogic?.handleGameOver;
        if (window.GameLogic && originalHandleGameOver) {
            window.GameLogic.handleGameOver = function() {
                console.log("Notification fix: Intercepted handleGameOver call");
                
                // Make sure there's only one notification
                if (gameOverNotification) {
                    gameOverNotification.textContent = '';
                    gameOverNotification.style.display = 'none';
                    gameOverNotification.classList.remove('show', 'hide');
                }
                
                // Remove any temporary notifications
                document.querySelectorAll('div[data-notification-type]').forEach(el => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                });
                
                // Call original function
                return originalHandleGameOver.apply(this, arguments);
            };
        }
    });
})();
