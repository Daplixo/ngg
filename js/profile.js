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
    
    // Don't override UserProfileUI - this was causing conflicts
    
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
  
  // Don't add the attachProfilePictureClick function - this was causing conflicts with userProfileUI
  
  // Wait a bit and then check if userProfileUI has initialized
  setTimeout(function() {
    // If userProfileUI is available, refresh the events
    if (window.userProfileUI) {
      console.log("Refreshing profile events from profile.js");
      window.userProfileUI.refreshProfileEvents();
    } else {
      console.log("Creating userProfileUI instance");
      // Try to create a userProfileUI instance
      import('./userProfileUI.js').then(module => {
        window.userProfileUI = new module.UserProfileUI();
        window.userProfileUI.refreshProfileEvents();
      }).catch(err => {
        console.error("Could not import UserProfileUI:", err);
      });
    }
  }, 1000);

  // Wait a bit and then check if userProfileUI has initialized
  setTimeout(function() {
    try {
        // Add a direct emergency click handler as a last resort
        const profilePic = document.querySelector("#profilePicDisplay");
        if (profilePic) {
            console.log("Adding emergency click handler to profile pic");
            profilePic.style.cursor = "pointer";
            profilePic.onclick = function() {
                console.log("Profile pic clicked (emergency handler)");
                if (window.userProfileUI) {
                    window.userProfileUI.simpleFallbackAvatarModal();
                } else {
                    // Create new instance if needed
                    import('./userProfileUI.js').then(module => {
                        window.userProfileUI = new module.UserProfileUI();
                        window.userProfileUI.simpleFallbackAvatarModal();
                    }).catch(err => {
                        console.error("Could not load UserProfileUI:", err);
                    });
                }
            };
            
            // Also add to image inside
            const img = profilePic.querySelector("img");
            if (img) {
                img.style.cursor = "pointer";
                img.onclick = function(e) {
                    e.stopPropagation();
                    if (profilePic.onclick) profilePic.onclick();
                };
            }
        }
    } catch (e) {
        console.error("Emergency handler error:", e);
    }
  }, 1000);
});
