/**
 * Button Click Sound Effect
 * Adds click sound effect to all 3D-styled buttons
 */

(function() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initButtonClickSound();
    });

    // Initialize immediately as well in case DOM is already loaded
    initButtonClickSound();

    function initButtonClickSound() {
        // Select all 3D-styled buttons based on the selectors in 3d-buttons.scss
        const buttons = document.querySelectorAll(`
            button:not(.side-menu-button):not(.side-menu-close):not(.settings-toggle):not(#menu-toggle):not(.hamburger-menu):not(.edit-profile-btn),
            .submit-btn,
            #submitGuessBtn,
            #playAgainBtn,
            #continueBtn,
            #resetGameBtn,
            #restartBtn,
            .dropdown-option,
            .modal-button,
            .key-btn
        `);

        // Add click event listener to each button
        buttons.forEach(button => {
            button.addEventListener('click', playButtonClickSound);
        });

        // Also add event delegation for dynamically created buttons
        document.addEventListener('click', function(e) {
            const button = e.target.closest(`
                button:not(.side-menu-button):not(.side-menu-close):not(.settings-toggle):not(#menu-toggle):not(.hamburger-menu):not(.edit-profile-btn),
                .submit-btn,
                #submitGuessBtn,
                #playAgainBtn,
                #continueBtn,
                #resetGameBtn,
                #restartBtn,
                .dropdown-option,
                .modal-button,
                .key-btn
            `);
            
            if (button && e.target === button) {
                // Only play if the button itself was clicked, not a child element
                playButtonClickSound();
            }
        });
    }

    function playButtonClickSound() {
        // Use AudioManager if available, otherwise fall back to simple Audio API
        if (window.AudioManager && typeof window.AudioManager.playButtonClick === 'function') {
            window.AudioManager.playButtonClick();
        } else {
            // Fallback to simple Audio API if AudioManager is not yet loaded
            try {
                const sound = new Audio('assets/sounds/button-click.wav'); // Changed to .wav
                sound.volume = 0.5; // Set volume to 50%
                sound.play().catch(err => {
                    // Silent catch - most likely due to user not interacting with page yet
                    console.debug('Could not play button sound:', err);
                });
            } catch (err) {
                // Silently fail if audio cannot be played
                console.debug('Error playing button sound:', err);
            }
        }
    }
})();
