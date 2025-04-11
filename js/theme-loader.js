/**
 * Theme Loader
 * Runs as early as possible to ensure smooth theme transitions
 */

(function() {
  // Load the CSS file immediately
  const link = document.createElement('link');
  link.id = 'theme-transition-css';
  link.rel = 'stylesheet';
  link.href = 'css/theme-transitions.css';
  
  // Add to document head
  document.head.appendChild(link);
  
  // Set up appropriate classes
  document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme to prevent flashing
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Load our smooth transition script
    const script = document.createElement('script');
    script.src = 'js/smooth-theme-transition.js';
    document.body.appendChild(script);
  });
  
  // Run earlier on page load
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }
})();
