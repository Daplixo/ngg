/**
 * Form Refresh Handler
 * Automatically refreshes the page after returning from form submission
 */

(function() {
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Form refresh handler initialized");
    
    // Check if we're returning from a form submission
    if (sessionStorage.getItem("feedbackSent") === "true") {
      const name = sessionStorage.getItem("feedbackName") || "friend";
      
      // Show thank you message
      alert("Thank you for your feedback, " + name + "!");
      
      // Clear the session storage
      sessionStorage.removeItem("feedbackSent");
      sessionStorage.removeItem("feedbackName");
      
      // Force a page refresh to ensure all scripts are reloaded properly
      console.log("Refreshing page to restore full functionality...");
      window.location.reload(true); // true forces reload from server, not cache
    }
  });
})();
