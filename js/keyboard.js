/**
 * Custom keyboard handler for the Number Guessing Game
 * Manages input and provides a touch-friendly interface for number entry
 */

import { GameLogic } from './gameLogic.js';

// CRITICAL FIX: Completely replace the keyboard initialization function
export function initKeyboard() {
    console.log("Initializing custom keyboard");
    
    try {
        const userGuessInput = document.getElementById('userGuess');
        const keyboardButtons = document.querySelectorAll('.key-btn');
        
        if (!userGuessInput) {
            console.error("Input field not found");
            return;
        }
        
        if (!keyboardButtons.length) {
            console.error("Keyboard buttons not found");
            return;
        }
        
        // CRITICAL FIX: Force clear any existing event handlers using a cleaner approach
        keyboardButtons.forEach(button => {
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
        });
        
        // Get fresh references after replacement
        const freshKeyboardButtons = document.querySelectorAll('.key-btn');
        
        // Add click handlers for each button
        freshKeyboardButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get the key value from data attribute
                const key = this.getAttribute('data-key');
                
                // Process based on key type
                switch(key) {
                    case 'clear':
                        userGuessInput.value = '';
                        break;
                        
                    case 'enter':
                        // Direct reliable call to GameLogic
                        if (userGuessInput.value.trim()) {
                            console.log("Keyboard Enter pressed - submitting:", userGuessInput.value);
                            GameLogic.checkGuess(userGuessInput.value);
                            userGuessInput.value = '';
                        }
                        break;
                        
                    default:
                        // Add digit to input (if numeric)
                        if (/^\d$/.test(key) && userGuessInput.value.length < 5) {
                            userGuessInput.value += key;
                        }
                }
            });
        });
        
        // Make input readonly to prevent virtual keyboard
        userGuessInput.setAttribute('readonly', true);
        
        console.log("Keyboard initialization successful");
    } catch (error) {
        console.error("Keyboard initialization failed:", error);
    }
}
