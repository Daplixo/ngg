// Simple fix to ensure proper column layout with full height
document.addEventListener('DOMContentLoaded', function() {
  // Ensure elements are properly displayed
  function adjustLayout() {
    const gameLayout = document.querySelector('.game-layout');
    const proximityColumn = document.querySelector('.proximity-column');
    const topLabel = document.querySelector('.proximity-label.top');
    const bottomLabel = document.querySelector('.proximity-label.bottom');
    const proximityContainer = document.getElementById('proximity-container');
    
    if (gameLayout && proximityColumn) {
      // Make sure the proximity column takes full height of the game layout
      proximityColumn.style.height = '100%';
      proximityColumn.style.padding = '0';
      
      if (proximityContainer && topLabel && bottomLabel) {
        // Calculate available height
        const columnHeight = proximityColumn.offsetHeight;
        const topHeight = topLabel.offsetHeight || 0;
        const bottomHeight = bottomLabel.offsetHeight || 0;
        
        // Set height directly to fill available space
        proximityContainer.style.height = (columnHeight - topHeight - bottomHeight) + 'px';
        proximityContainer.style.margin = '0';
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
