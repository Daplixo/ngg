/**
 * Smooth Menu Transitions
 * This script optimizes the side menu animations for better performance
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', initSmoothMenuTransitions);

  // Variables to store key elements
  let sideMenu;
  let sideMenuOverlay;
  let menuToggle;
  let isTransitioning = false;
  let supportsHighPerformanceEffects = true;

  // Initialize optimized menu transitions
  function initSmoothMenuTransitions() {
    console.log("Initializing smooth menu transitions");
    
    // Get DOM elements
    sideMenu = document.querySelector('.side-menu');
    sideMenuOverlay = document.querySelector('.side-menu-overlay');
    menuToggle = document.getElementById('menu-toggle');
    
    // If elements don't exist, exit early
    if (!sideMenu || !sideMenuOverlay || !menuToggle) {
      console.warn("Menu elements not found, aborting smooth transitions setup");
      return;
    }

    // Detect low-performance devices
    checkDevicePerformance();
    
    // Replace existing event listeners with optimized versions
    setupOptimizedEventListeners();
  }

  // Check device performance to adjust effects accordingly
  function checkDevicePerformance() {
    // Check if device is likely to be low-performance
    const isLowPowerDevice = 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
      (window.devicePixelRatio < 2 || screen.width < 768);
      
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Set performance flag
    supportsHighPerformanceEffects = !(isLowPowerDevice || prefersReducedMotion);
    
    // Apply appropriate CSS class to body
    document.body.classList.toggle('high-performance-device', supportsHighPerformanceEffects);
    document.body.classList.toggle('low-performance-device', !supportsHighPerformanceEffects);
    
    console.log(`Device detected as ${supportsHighPerformanceEffects ? 'high' : 'low'} performance`);
  }

  // Setup optimized event listeners for menu interactions
  function setupOptimizedEventListeners() {
    // Remove any existing click handlers to prevent duplication
    menuToggle.removeEventListener('click', handleMenuToggle);
    sideMenuOverlay.removeEventListener('click', handleMenuClose);
    
    // Add optimized click handlers
    menuToggle.addEventListener('click', handleMenuToggle);
    sideMenuOverlay.addEventListener('click', handleMenuClose);
    
    // Add close button event listener if it exists
    const closeButton = document.querySelector('.side-menu-close');
    if (closeButton) {
      closeButton.removeEventListener('click', handleMenuClose);
      closeButton.addEventListener('click', handleMenuClose);
    }
    
    // Monitor transition end to reset state
    sideMenu.addEventListener('transitionend', function(e) {
      if (e.propertyName === 'transform') {
        isTransitioning = false;
      }
    });
  }

  // Handle menu toggle with debounce to prevent rapid clicking
  function handleMenuToggle(e) {
    e.preventDefault();
    
    // Prevent rapid clicking during transition
    if (isTransitioning) return;
    isTransitioning = true;
    
    // Optimize rendering by using requestAnimationFrame
    window.requestAnimationFrame(() => {
      toggleMenuState();
    });
    
    // Reset transitioning state after a short time as fallback
    setTimeout(() => {
      isTransitioning = false;
    }, 400); // slightly longer than transition duration
  }

  // Handle menu close
  function handleMenuClose(e) {
    e.preventDefault();
    
    // Only proceed if menu is open
    if (!sideMenu.classList.contains('active')) return;
    
    // Prevent rapid clicking during transition
    if (isTransitioning) return;
    isTransitioning = true;
    
    // Optimize rendering by using requestAnimationFrame
    window.requestAnimationFrame(() => {
      closeMenu();
    });
    
    // Reset transitioning state after a short time as fallback
    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }

  // Toggle menu state
  function toggleMenuState() {
    if (sideMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Open menu with optimized sequence
  function openMenu() {
    console.log("Opening menu with optimized transitions");
    
    // Add active class to body first (for blur effects)
    document.body.classList.add('menu-open');
    
    // Then add active classes to menu elements
    sideMenuOverlay.classList.add('active');
    sideMenu.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  // Close menu with optimized sequence
  function closeMenu() {
    console.log("Closing menu with optimized transitions");
    
    // Remove active classes from menu elements
    sideMenu.classList.remove('active');
    sideMenuOverlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    // Slightly delay removing body class for smoother transition
    setTimeout(() => {
      document.body.classList.remove('menu-open');
    }, 50);
  }
  
  // Expose utility functions for other scripts if needed
  window.smoothMenuTransitions = {
    openMenu: openMenu,
    closeMenu: closeMenu,
    checkDevicePerformance: checkDevicePerformance
  };
})();
