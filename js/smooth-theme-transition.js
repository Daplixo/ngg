/**
 * Smooth Theme Transition Module
 * Ensures all elements transition between themes at the same rate
 */

(function() {
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', initSmoothThemeTransition);
  
  // Run immediately in case DOM is already loaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initSmoothThemeTransition();
  }

  function initSmoothThemeTransition() {
    console.log('Initializing smooth theme transitions');
    
    // Store original toggleTheme function
    const originalToggleTheme = window.toggleTheme;
    
    // Override with our synchronized version
    window.toggleTheme = function() {
      // Get current theme
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Add transition class to enable hardware acceleration
      document.body.classList.add('theme-transitioning');
      
      // Apply new theme
      html.setAttribute('data-theme', newTheme);
      
      // Force a reflow to ensure transitions work properly
      void document.body.offsetHeight;
      
      // Save theme preference
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('Could not save theme preference:', e);
      }
      
      // Update theme icons
      updateThemeIcons(newTheme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 350); // slightly longer than transition duration
      
      // Call original function if it exists and is different
      if (originalToggleTheme && originalToggleTheme !== window.toggleTheme) {
        originalToggleTheme.call(window);
      }
      
      console.log('Theme switched to:', newTheme);
    };
    
    // Function to update icons consistently
    function updateThemeIcons(theme) {
      const moonIcon = document.getElementById('moon-icon');
      const sunIcon = document.getElementById('sun-icon');
      
      if (!moonIcon || !sunIcon) return;
      
      if (theme === 'dark') {
        // Dark mode - show sun icon
        moonIcon.style.opacity = '0';
        sunIcon.style.opacity = '1';
        // Ensure stroke color is correct
        sunIcon.setAttribute('stroke', 'white');
      } else {
        // Light mode - show moon icon
        moonIcon.style.opacity = '1';
        sunIcon.style.opacity = '0';
        // Ensure stroke color is correct
        moonIcon.setAttribute('stroke', '#333');
      }
    }
    
    // Set initial theme icon states
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateThemeIcons(currentTheme);
    
    // Load our CSS
    loadThemeTransitionCSS();
  }
  
  // Load the CSS only if it hasn't been loaded yet
  function loadThemeTransitionCSS() {
    if (document.getElementById('theme-transitions-css')) return;
    
    const link = document.createElement('link');
    link.id = 'theme-transitions-css';
    link.rel = 'stylesheet';
    link.href = 'css/theme-transitions.css';
    document.head.appendChild(link);
  }
})();
