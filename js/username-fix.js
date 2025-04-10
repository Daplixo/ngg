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

      // Skip fixing guest accounts
      if (profile.type === 'guest') {
        console.log("✓ Guest profile detected, skipping username fix");
        return false;
      }
      
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
          
          // Save the updated profile back to localStorage
          localStorage.setItem('userProfileData', JSON.stringify(profile));
          
          console.log("✅ Username fixed successfully!");
          return true;
        }
      } else {
        // Don't force set the username to "daplixo" for all accounts
        // Only check regular accounts (not guests) that specifically need fixing
        if (!profile.type === 'guest' && (profile.username === "daplixo" || profile.name === "daplixo")) {
          console.log("✓ Username is already correct: daplixo");
          return false;
        }
        
        // Only fix accounts that need to be specifically set to daplixo
        // This might be a hardcoded case for the developer's account
        if (!profile.type === 'guest' && 
            (profile.username === "Daplixo" || profile.name === "Daplixo" || 
             profile.username === "DAPLIXO" || profile.name === "DAPLIXO")) {
          console.log(`🔧 Normalizing username case to "daplixo" (was "${profile.username || profile.name}")`);
          profile.username = "daplixo";
          profile.name = "daplixo";
          
          // Save the updated profile back to localStorage
          localStorage.setItem('userProfileData', JSON.stringify(profile));
          
          console.log("✅ Username normalized!");
          return true;
        }

        return false;
      }
      
      return false;
    } catch (error) {
      console.error("Error fixing username:", error);
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
