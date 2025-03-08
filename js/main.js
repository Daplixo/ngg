import { gameState } from './gameState.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { GameLogic } from './gameLogic.js';

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Initialize game state
    gameState.reset(true);

    // Get DOM elements
    const userGuessInput = document.getElementById("userGuess");
    const submitGuessBtn = document.getElementById("submitGuessBtn");
    const continueBtn = document.getElementById("continueBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const restartBtn = document.getElementById("restartBtn");

    // Set up event listeners
    userGuessInput.addEventListener("keydown", (e) => GameLogic.handleKeyPress(e));
    
    submitGuessBtn.addEventListener("click", () => {
        GameLogic.checkGuess(userGuessInput.value);
    });

    continueBtn.addEventListener("click", () => GameLogic.continueNextLevel());
    playAgainBtn.addEventListener("click", () => GameLogic.playAgain());
    restartBtn.addEventListener("click", () => GameLogic.restartGame());

    // Focus on input
    userGuessInput.focus();

    // Feedback Modal Functionality
    const modal = document.getElementById("feedbackModal");
    const feedbackBtn = document.getElementById("feedbackBtn");
    const closeModal = document.querySelector(".close-modal");
    const feedbackForm = document.getElementById("feedbackForm");

    feedbackBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        feedbackForm.reset();
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            feedbackForm.reset();
        }
    });

    // FormSubmit handling
    feedbackForm.addEventListener("submit", (e) => {
        // Form will be handled by FormSubmit
        modal.style.display = "none";
        setTimeout(() => {
            showNotification("Thank you for your feedback!", "success");
        }, 1000);
    });

    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 