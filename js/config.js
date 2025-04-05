/**
 * Configuration settings for the Number Guessing Game
 * Contains API endpoints and other global configuration
 */

const config = {
  // API endpoints
  api: {
    // Replace this URL with your Render deployment URL
    baseUrl: 'https://number-guessing-backend-fumk.onrender.com',
    
    // Specific endpoints
    endpoints: {
      userProfile: '/users',
      gameStats: '/stats',
      leaderboard: '/leaderboard',
      feedback: '/feedback'
    }
  },
  
  // Feature flags
  features: {
    enableSync: true,
    enableOfflineMode: true,
    debugMode: false
  }
};

// Make config available globally
window.gameConfig = config;

// Export for module usage
export default config;
