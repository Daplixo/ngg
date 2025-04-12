/**
 * Author Modal Controller
 * Handles the author information modal display and interaction
 */

(function() {
  // Execute immediately for fastest possible initialization
  document.addEventListener('DOMContentLoaded', initAuthorModal);
  
  // Also try initializing immediately in case DOM is already loaded
  initAuthorModal();
  
  function initAuthorModal() {
    const authorInfo = document.querySelector('.author-info h3');
    const authorModal = document.getElementById('authorModal');
    
    if (!authorInfo || !authorModal) {
      console.log("Author modal elements not found, will retry later");
      // Retry a bit later in case elements are created dynamically
      setTimeout(initAuthorModal, 500);
      return;
    }
    
    console.log("Initializing author modal interaction");
    
    // Add click event to author name in footer
    authorInfo.addEventListener('click', function() {
      console.log("Author info clicked");
      authorModal.classList.add('active');
      document.body.classList.add('modal-open'); // Add blur effect class
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
    
    // Close modal when clicking the close button
    const closeAuthorModal = document.querySelector('.close-author-modal');
    if (closeAuthorModal) {
      closeAuthorModal.addEventListener('click', function() {
        authorModal.classList.remove('active');
        document.body.classList.remove('modal-open'); // Remove blur effect class
        document.body.style.overflow = ''; // Restore scrolling
      });
    }
    
    // Close modal when clicking outside the modal content
    authorModal.addEventListener('click', function(event) {
      if (event.target === authorModal) {
        authorModal.classList.remove('active');
        document.body.classList.remove('modal-open'); // Remove blur effect class
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && authorModal.classList.contains('active')) {
        authorModal.classList.remove('active');
        document.body.classList.remove('modal-open'); // Remove blur effect class
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
    
    console.log("Author modal initialized successfully");
  }
})();
