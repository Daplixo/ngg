/**
 * Header Alignment Fix
 * Ensures consistent alignment of header elements across all screen sizes
 */
(function() {
    // Apply consistent styling to header elements
    function fixHeaderAlignment() {
        // Target the header elements
        const gameHeader = document.querySelector('.game-header');
        const headerCenter = document.querySelector('.header-center');
        const gameIndicatorsContainer = document.getElementById('game-indicators-container');
        const attemptsElement = document.getElementById('attempts');
        const previousGuessElement = document.getElementById('previous-guess');
        const levelIndicator = document.getElementById('level-indicator');
        
        // Apply fixed styles to the header
        if (gameHeader) {
            gameHeader.style.display = 'flex';
            gameHeader.style.alignItems = 'center';
            gameHeader.style.minHeight = '46px';
        }
        
        // Fix header center alignment
        if (headerCenter) {
            headerCenter.style.display = 'flex';
            headerCenter.style.justifyContent = 'center';
            headerCenter.style.alignItems = 'center';
            headerCenter.style.position = 'static';
            headerCenter.style.transform = 'none';
            headerCenter.style.flex = '1';
        }
        
        // Fix game indicators container
        if (gameIndicatorsContainer) {
            gameIndicatorsContainer.style.display = 'flex';
            gameIndicatorsContainer.style.flexDirection = 'row';
            gameIndicatorsContainer.style.justifyContent = 'center';
            gameIndicatorsContainer.style.alignItems = 'center';
            gameIndicatorsContainer.style.gap = '15px';
            gameIndicatorsContainer.style.width = '100%';
            gameIndicatorsContainer.style.position = 'static';
            gameIndicatorsContainer.style.transform = 'none';
        }
        
        // Fix attempts element alignment
        if (attemptsElement) {
            attemptsElement.style.display = 'inline-flex';
            attemptsElement.style.alignItems = 'center';
            attemptsElement.style.justifyContent = 'center';
            attemptsElement.style.margin = '0';
            attemptsElement.style.padding = '0';
            attemptsElement.style.lineHeight = '1.2';
            attemptsElement.style.fontSize = '0.85rem';
            attemptsElement.style.minHeight = '24px';
            attemptsElement.style.height = '24px';
            attemptsElement.style.position = 'static';
            attemptsElement.style.transform = 'none';
            attemptsElement.style.top = 'auto';
            attemptsElement.style.left = 'auto';
        }
        
        // Fix previous guess element alignment
        if (previousGuessElement) {
            previousGuessElement.style.display = 'inline-flex';
            previousGuessElement.style.alignItems = 'center';
            previousGuessElement.style.justifyContent = 'center';
            previousGuessElement.style.margin = '0';
            previousGuessElement.style.padding = '0';
            previousGuessElement.style.lineHeight = '1.2';
            previousGuessElement.style.fontSize = '0.85rem';
            previousGuessElement.style.minHeight = '24px';
            previousGuessElement.style.height = '24px';
            previousGuessElement.style.position = 'static';
            previousGuessElement.style.transform = 'none';
            previousGuessElement.style.top = 'auto';
            previousGuessElement.style.left = 'auto';
        }
        
        // Fix level indicator alignment
        if (levelIndicator) {
            levelIndicator.style.display = 'inline-flex';
            levelIndicator.style.alignItems = 'center';
            levelIndicator.style.justifyContent = 'center';
            levelIndicator.style.fontSize = '0.85rem';
            levelIndicator.style.margin = '0';
            levelIndicator.style.padding = '0';
        }
    }
    
    // Run immediately to prevent initial layout shifts
    fixHeaderAlignment();
    
    // Run when DOM content has loaded
    document.addEventListener('DOMContentLoaded', fixHeaderAlignment);
    
    // Run when window is fully loaded
    window.addEventListener('load', fixHeaderAlignment);
    
    // Run on resize to maintain alignment during window size changes
    window.addEventListener('resize', fixHeaderAlignment);
    
    // Set up a mutation observer to detect any DOM changes in the header
    function observeHeaderChanges() {
        const gameHeader = document.querySelector('.game-header');
        if (!gameHeader) return;
        
        const observer = new MutationObserver(function(mutations) {
            fixHeaderAlignment();
        });
        
        observer.observe(gameHeader, { 
            childList: true, 
            subtree: true, 
            attributes: true 
        });
    }
    
    // Start observing once DOM is loaded
    document.addEventListener('DOMContentLoaded', observeHeaderChanges);
    
    // Check for dynamically created elements and ensure they exist
    function ensureHeaderElements() {
        const headerCenter = document.querySelector('.header-center');
        if (!headerCenter) return;
        
        // Create game indicators container if it doesn't exist
        let gameIndicatorsContainer = document.getElementById('game-indicators-container');
        if (!gameIndicatorsContainer) {
            gameIndicatorsContainer = document.createElement('div');
            gameIndicatorsContainer.id = 'game-indicators-container';
            headerCenter.appendChild(gameIndicatorsContainer);
        }
        
        // Create attempts element if it doesn't exist
        if (!document.getElementById('attempts')) {
            const attemptsElement = document.createElement('div');
            attemptsElement.id = 'attempts';
            attemptsElement.textContent = 'Attempts: 0/0';
            gameIndicatorsContainer.appendChild(attemptsElement);
        }
        
        // Create previous guess element if it doesn't exist
        if (!document.getElementById('previous-guess')) {
            const previousGuessElement = document.createElement('div');
            previousGuessElement.id = 'previous-guess';
            previousGuessElement.textContent = 'Last Guess: --';
            gameIndicatorsContainer.appendChild(previousGuessElement);
        }
        
        // Apply fixed alignment
        fixHeaderAlignment();
    }
    
    // Run this check after a small delay
    setTimeout(ensureHeaderElements, 100);
    
    // Also run periodically to ensure consistent alignment
    setInterval(fixHeaderAlignment, 1000);
})();
