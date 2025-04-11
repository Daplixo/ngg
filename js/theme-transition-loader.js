/**
 * Theme Transition Loader
 * Loads theme transition CSS and JS as early as possible
 */

(function() {
  // Immediately load the CSS
  const link = document.createElement('link');
  link.id = 'theme-transitions-css';
  link.rel = 'stylesheet';
  link.href = 'css/theme-transitions.css';
  document.head.appendChild(link);
  
  // Load the JS after a slight delay to ensure document is ready
  window.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = 'js/smooth-theme-transition.js';
    document.body.appendChild(script);
  });
  
  // If DOMContentLoaded already fired, load JS immediately
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    const script = document.createElement('script');
    script.src = 'js/smooth-theme-transition.js';
    document.body.appendChild(script);
  }
})();
