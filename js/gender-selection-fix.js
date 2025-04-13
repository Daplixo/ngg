/**
 * Gender Selection Button Fix
 * Ensures proper gender-specific styling for browsers without :has() support
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply gender-specific styling on radio button change
    function setupGenderButtons() {
        // Find all gender radio buttons
        const maleRadios = document.querySelectorAll('input[id*="gender-male"]');
        const femaleRadios = document.querySelectorAll('input[id*="gender-female"]');
        
        // Function to update styling based on selection
        function updateGenderStyling(radio) {
            // Find parent gender option
            const parentOption = radio.closest('.gender-option');
            if (!parentOption) return;
            
            // Reset all options in this group
            const allOptions = parentOption.parentElement.querySelectorAll('.gender-option');
            allOptions.forEach(option => {
                option.style.borderColor = '';
                option.style.backgroundColor = '';
                option.classList.remove('male-selected', 'female-selected');
                const icon = option.querySelector('.gender-icon i');
                if (icon) {
                    icon.style.color = ''; 
                    // NEVER CHANGE FONT SIZE - REMOVE ALL SIZE CHANGES
                }
            });
            
            // Apply specific styling based on gender - ONLY CHANGE COLOR AND BORDER
            if (radio.id.includes('male') && radio.checked) {
                parentOption.style.borderColor = '#4d6fed';
                parentOption.style.backgroundColor = 'rgba(77, 111, 237, 0.1)';
                parentOption.classList.add('male-selected');
                const icon = parentOption.querySelector('.gender-icon i');
                if (icon) {
                    icon.style.color = '#4d6fed';
                    // NO FONT SIZE CHANGES ANYWHERE
                }
            } else if (radio.id.includes('female') && radio.checked) {
                parentOption.style.borderColor = '#e74c3c';
                parentOption.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                parentOption.classList.add('female-selected');
                const icon = parentOption.querySelector('.gender-icon i');
                if (icon) {
                    icon.style.color = '#e74c3c';
                    // NO FONT SIZE CHANGES ANYWHERE
                }
            }
        }
        
        // Make icons interactive too
        function setupIconClickHandlers() {
            // Get all gender icons
            const maleIcons = document.querySelectorAll('.gender-icon.male i');
            const femaleIcons = document.querySelectorAll('.gender-icon.female i');
            
            // Add click handlers to male icons
            maleIcons.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const parentOption = icon.closest('.gender-option');
                    if (!parentOption) return;
                    
                    const maleRadio = parentOption.querySelector('input[id*="gender-male"]');
                    if (maleRadio) {
                        maleRadio.checked = true;
                        maleRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
            
            // Add click handlers to female icons
            femaleIcons.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const parentOption = icon.closest('.gender-option');
                    if (!parentOption) return;
                    
                    const femaleRadio = parentOption.querySelector('input[id*="gender-female"]');
                    if (femaleRadio) {
                        femaleRadio.checked = true;
                        femaleRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
        }
        
        // Add event listeners to all gender radio buttons
        maleRadios.forEach(radio => {
            radio.addEventListener('change', () => updateGenderStyling(radio));
            // Initialize styling if already checked
            if (radio.checked) updateGenderStyling(radio);
        });
        
        femaleRadios.forEach(radio => {
            radio.addEventListener('change', () => updateGenderStyling(radio));
            // Initialize styling if already checked
            if (radio.checked) updateGenderStyling(radio);
        });
        
        // Setup icon click handlers
        setupIconClickHandlers();
    }
    
    // Run initial setup
    setupGenderButtons();
    
    // Force initial setup after a short delay (helps with dynamically loaded content)
    setTimeout(setupGenderButtons, 300);
    
    // Set up a mutation observer to handle dynamically created modals
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList.contains('modal-wrapper') || 
                         node.querySelector('.gender-option'))) {
                        setupGenderButtons();
                        // Also run after a short delay to ensure all elements are rendered
                        setTimeout(setupGenderButtons, 100);
                        break;
                    }
                }
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
