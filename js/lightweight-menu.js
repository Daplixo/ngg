/**
 * Lightweight Menu System
 * Optimized for maximum performance across all devices
 * Replaces smooth-menu-transitions.js with minimal overhead
 */

(function() {
  // Execute immediately for fastest possible initialization
  runImmediately();
  
  // Also run after DOM content loaded as a backup
  document.addEventListener('DOMContentLoaded', runImmediately);
  
  function runImmediately() {
    // Main elements
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const sideMenuOverlay = document.querySelector('.side-menu-overlay');
    const closeButton = document.querySelector('.side-menu-close');
    
    if (!menuToggle || !sideMenu || !sideMenuOverlay) {
      // If elements are missing, try again shortly
      setTimeout(runImmediately, 50);
      return;
    }
    
    // Check for low performance devices
    detectDeviceCapabilities();
    
    // Remove any existing event listeners and attach new optimized ones
    optimizeMenuHandlers();
    
    // Make our functions globally available for other scripts to use
    window.lightweightMenu = {
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu,
      refresh: optimizeMenuHandlers
    };
    
    console.log("Lightweight menu system initialized");
    
    /**
     * Core Functions
     */
    
    // Detect device capabilities and set appropriate body classes
    function detectDeviceCapabilities() {
      const isLowPower = 
        // Check for mobile devices
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        // Check for reduced motion preference
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        // Check for slow devices based on hardware concurrency
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      
      // Add appropriate class to body
      document.body.classList.toggle('low-performance-device', isLowPower);
      
      // Log device classification
      console.log("Device classified as:", isLowPower ? "low-performance" : "high-performance");
    }
    
    // Set up optimized event handlers
    function optimizeMenuHandlers() {
      // Remove any existing handlers to prevent duplication
      removeExistingHandlers();
      
      // Add direct inline handlers for maximum performance
      menuToggle.onclick = handleMenuToggle;
      sideMenuOverlay.onclick = closeMenu;
      if (closeButton) closeButton.onclick = closeMenu;
      
      // Handle keyboard events for accessibility
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
          closeMenu();
        }
      });
    }
    
    // Clean up existing handlers
    function removeExistingHandlers() {
      menuToggle.onclick = null;
      sideMenuOverlay.onclick = null;
      if (closeButton) closeButton.onclick = null;
    }
    
    // Toggle menu state with debouncing to prevent rapid clicks
    let isProcessingClick = false;
    function handleMenuToggle(e) {
      e.preventDefault();
      
      // Prevent multiple rapid clicks
      if (isProcessingClick) return;
      isProcessingClick = true;
      
      // Toggle menu
      toggleMenu();
      
      // Reset click processing flag after a short delay
      setTimeout(() => {
        isProcessingClick = false;
      }, 300);
    }
    
    // Toggle menu state
    function toggleMenu() {
      if (sideMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }
    
    // Open menu with optimal performance
    function openMenu() {
      // Set body class first (reduces perceived lag)
      document.body.classList.add('menu-open');
      
      // Use requestAnimationFrame for smoother visual updates
      requestAnimationFrame(() => {
        sideMenu.classList.add('active');
        sideMenuOverlay.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
      });
    }
    
    // Close menu with optimal performance
    function closeMenu() {
      // Remove classes immediately for responsive feel
      sideMenu.classList.remove('active');
      sideMenuOverlay.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      
      // Small delay before removing body class for smoother transition
      setTimeout(() => {
        document.body.classList.remove('menu-open');
      }, 50);
    }
  }
})();
