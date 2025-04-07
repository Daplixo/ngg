/**
 * Username Fix Script
 * 
 * This script fixes issues with incorrect usernames in the profile data,
 * specifically addressing the problem where the system is trying to sync 
 * with "daplixo_5996" instead of the correct username "daplixo".
 */

(function() {
  console.log("🔧 Running username fix script...");
  
  // Function to fix the username in the profile
  function fixUsername() {
    try {
      // Get the profile data from localStorage
      const profileData = localStorage.getItem('userProfileData');
      if (!profileData) {
        console.log("❌ No profile data found in localStorage");
        return false;
      }
      
      // Parse the profile data
      const profile = JSON.parse(profileData);
      
      // Check if the username contains an underscore followed by numbers (like daplixo_5996)
      const wrongUsernamePattern = /^(.+)_\d+$/;
      
      if (profile.username && wrongUsernamePattern.test(profile.username)) {
        // Extract the base username (e.g., "daplixo" from "daplixo_5996")
        const match = profile.username.match(wrongUsernamePattern);
        if (match && match[1]) {
          const correctUsername = match[1];
          console.log(`🔧 Fixing username: changing "${profile.username}" to "${correctUsername}"`);
          
          // Update the username
          profile.username = correctUsername;
          
          // Also update the name field if it exists and has the wrong format
          if (profile.name && wrongUsernamePattern.test(profile.name)) {
            profile.name = correctUsername;
          }
          
          // Save the updated profile back to localStorage
          localStorage.setItem('userProfileData', JSON.stringify(profile));
          
          console.log("✅ Username fixed successfully!");
          return true;
        }
      } else if (profile.name && wrongUsernamePattern.test(profile.name) && (!profile.username || profile.username === '')) {
        // If username is missing but name has the pattern
        const match = profile.name.match(wrongUsernamePattern);
        if (match && match[1]) {
          const correctUsername = match[1];
          console.log(`🔧 Fixing name: changing "${profile.name}" to "${correctUsername}"`);
          
          // Update the name
          profile.name = correctUsername;
          
          // Also set the username field
          profile.username = correctUsername;
          
          // Save the updated profile back to localStorage
          localStorage.setItem('userProfileData', JSON.stringify(profile));
          
          console.log("✅ Username fixed successfully!");
          return true;
        }
      } else {
        // Check if the username and actual username are already set correctly
        if (profile.username === "daplixo" || profile.name === "daplixo") {
          console.log("✓ Username is already correct: daplixo");
          return false;
        }
        
        // Force set the username to "daplixo"
        console.log(`🔧 Setting username to "daplixo" (was "${profile.username || profile.name || 'not set'}")`);
        profile.username = "daplixo";
        profile.name = "daplixo";
        
        // Save the updated profile back to localStorage
        localStorage.setItem('userProfileData', JSON.stringify(profile));
        
        console.log("✅ Username set to daplixo!");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error fixing username:", error);
      return false;
    }
  }
  
  // Run the fix
  const result = fixUsername();
  
  // Reload the page if username was fixed to apply changes
  if (result) {
    console.log("🔄 Changes made to profile. Reloading page to apply changes...");
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
})();
