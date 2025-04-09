// Simple fix to ensure proper column layout with full height
document.addEventListener('DOMContentLoaded', function() {
  // Ensure elements are properly displayed
  function adjustLayout() {
    const gameLayout = document.querySelector('.game-layout');
    const proximityColumn = document.querySelector('.proximity-column');
    const topLabel = document.querySelector('.proximity-label.top');
    const bottomLabel = document.querySelector('.proximity-label.bottom');
    const proximityContainer = document.getElementById('proximity-container');
    const gameWrapper = document.querySelector('.game-wrapper');
    const gameContainer = document.getElementById('game-container');
    
    // Fix game vertical alignment
    if (gameWrapper && gameContainer) {
      // Enforce vertical centering
      gameWrapper.style.display = 'flex';
      gameWrapper.style.flexDirection = 'column';
      gameWrapper.style.justifyContent = 'center';
      gameWrapper.style.alignItems = 'center';
      gameWrapper.style.minHeight = 'calc(100vh - 130px)';
      
      // Make sure the game container doesn't have margins that would offset it
      gameContainer.style.margin = 'auto';
    }
    
    // Fix header elements - ensure consistent heights and FONT SIZE
    const gameHeader = document.querySelector('.game-header');
    const gameIndicatorsContainer = document.getElementById('game-indicators-container');
    
    if (gameHeader) {
      gameHeader.style.height = 'auto';
      gameHeader.style.minHeight = window.innerHeight <= 600 ? '42px' : (window.innerHeight <= 800 ? '46px' : '50px');
    }
    
    if (gameIndicatorsContainer) {
      gameIndicatorsContainer.style.display = 'flex';
      gameIndicatorsContainer.style.alignItems = 'center';
      gameIndicatorsContainer.style.justifyContent = 'center';
      gameIndicatorsContainer.style.width = '100%';
      gameIndicatorsContainer.style.padding = '0';
      gameIndicatorsContainer.style.margin = '0';
      gameIndicatorsContainer.style.height = 'auto';
      
      const attempts = document.getElementById('attempts');
      const previousGuess = document.getElementById('previous-guess');
      
      // Ensure attempts indicator has consistent height and FONT SIZE
      if (attempts) {
        attempts.style.margin = '0';
        attempts.style.padding = '0';
        attempts.style.lineHeight = '1.2';
        attempts.style.verticalAlign = 'middle';
        attempts.style.minHeight = '24px';
        attempts.style.height = 'auto';
        attempts.style.fontSize = '0.85rem'; // FIXED: Set consistent font size regardless of screen height
      }
      
      if (previousGuess) {
        previousGuess.style.margin = '0';
        previousGuess.style.padding = '0';
        previousGuess.style.lineHeight = '1.2';
        previousGuess.style.verticalAlign = 'middle';
        previousGuess.style.minHeight = '24px';
        previousGuess.style.height = 'auto';
        previousGuess.style.fontSize = '0.85rem'; // FIXED: Set consistent font size regardless of screen height
      }
    }
    
    // Fix proximity meter layout
    if (gameLayout && proximityColumn) {
      // Make sure the proximity column takes full height of the game layout
      proximityColumn.style.height = '100%';
      proximityColumn.style.padding = '0';
      proximityColumn.style.display = 'flex';
      proximityColumn.style.flexDirection = 'column';
      proximityColumn.style.justifyContent = 'space-between';
      proximityColumn.style.visibility = 'visible';
      
      if (proximityContainer && topLabel && bottomLabel) {
        // Calculate available height
        const columnHeight = proximityColumn.offsetHeight;
        const topHeight = topLabel.offsetHeight || 0;
        const bottomHeight = bottomLabel.offsetHeight || 0;
        
        // Set height directly to fill available space
        proximityContainer.style.height = (columnHeight - topHeight - bottomHeight - 10) + 'px';
        proximityContainer.style.margin = '0';
        proximityContainer.style.display = 'flex';
        proximityContainer.style.visibility = 'visible';
        proximityContainer.style.flex = '1';
      }
    }
  }
  
  // Run immediately
  adjustLayout();
  
  // Also run after a short delay to ensure DOM is fully rendered
  setTimeout(adjustLayout, 100);
  
  // Run on resize and orientation change
  window.addEventListener('resize', adjustLayout);
  window.addEventListener('orientationchange', function() {
    setTimeout(adjustLayout, 300);
  });
  
  // Run periodically to ensure it stays correct
  setInterval(adjustLayout, 2000);
});
