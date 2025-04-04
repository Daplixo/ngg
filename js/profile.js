/**
 * Profile image handler for Number Guessing Game
 * Ensures the correct default image is displayed when no user image is available
 */

document.addEventListener('DOMContentLoaded', function() {
  // Function to update all profile images to use the correct default
  function updateProfileImages() {
    // First approach: Direct modification of existing images
    function fixImages() {
      // Find any profile pictures and update them
      const profileImgs = document.querySelectorAll('.profile-picture img');
      
      profileImgs.forEach(img => {
        // Set error handler
        img.onerror = function() {
          console.log('Profile image failed to load, using default icon');
          this.src = 'assets/defaultIcon.jpg';
        };
        
        // If src is the old default or empty, replace with our new default
        if (!img.src || 
            img.src.includes('default-profile.png') || 
            img.src === window.location.href) {
          console.log('Replacing default profile image with defaultIcon.jpg');
          img.src = 'assets/defaultIcon.jpg';
        }
      });
    }
    
    // Run immediately for any images already in the DOM
    fixImages();
    
    // Second approach: Override the UserProfileUI class methods
    // This ensures that new images added later will also use the correct path
    if (window.UserProfileUI) {
      const originalUpdateProfileDisplay = window.UserProfileUI.prototype.updateProfileDisplay;
      
      window.UserProfileUI.prototype.updateProfileDisplay = function() {
        // Call the original method
        originalUpdateProfileDisplay.apply(this, arguments);
        
        // Then make sure our image is correct
        const picElement = document.querySelector('#profilePicDisplay img');
        if (picElement && (!picElement.src || picElement.src.includes('default-profile.png'))) {
          picElement.src = 'assets/defaultIcon.jpg';
        }
      };
    }
    
    // Third approach: Watch for DOM changes to catch dynamically added profile images
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            // Check if this is a profile section or contains one
            if (node.classList && node.classList.contains('profile-section')) {
              shouldFix = true;
            } else if (node.querySelector && node.querySelector('.profile-section')) {
              shouldFix = true;
            }
          });
        }
      });
      
      if (shouldFix) {
        setTimeout(fixImages, 0); // Run on next tick to ensure DOM is ready
      }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also run periodically to catch any missed updates
    setInterval(fixImages, 1000);
  }

  // Initialize the profile image handler
  updateProfileImages();
  
  // Add script reference to the HTML to make sure profile.js is loaded
  const scriptRef = document.createElement('script');
  scriptRef.src = 'js/profile.js';
  if (!document.querySelector('script[src="js/profile.js"]')) {
    document.body.appendChild(scriptRef);
  }
});
