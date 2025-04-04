document.addEventListener('DOMContentLoaded', function() {
  const userDataForm = document.getElementById('userDataForm');
  
  if (userDataForm) {
    // Check if user data already exists
    const userData = getUserData();
    if (userData && userData.userName) {
      // If user data exists, skip the form and go directly to the game
      // You might want to redirect to the game page or hide the form
      console.log('User already registered:', userData.userName);
      // Uncomment the line below to redirect
      // window.location.href = 'game.html';
    }
    
    // Handle form submission
    userDataForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const userName = document.getElementById('userName').value.trim();
      const userEmail = document.getElementById('userEmail').value.trim();
      
      if (userName) {
        // Save user data to localStorage
        saveUserData({
          userName: userName,
          email: userEmail,
          createdAt: new Date().toISOString(),
          gameLevel: 1,
          highScore: 0,
          totalGames: 0,
          gamesWon: 0
        });
        
        console.log('User profile created:', userName);
        
        // Redirect to the game or close the form
        // window.location.href = 'game.html';
      }
    });
  }
});

// Helper function to save user data
function saveUserData(data) {
  try {
    localStorage.setItem('userData', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving user data:', e);
    return false;
  }
}

// Helper function to get user data
function getUserData() {
  try {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error retrieving user data:', e);
    return null;
  }
}
