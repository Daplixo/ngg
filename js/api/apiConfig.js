/**
 * API Configuration for Number Guessing Game
 */

// Determine environment
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Set API URL based on environment - ensure URL is properly formatted
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000/api'  
  : 'https://number-guessing-backend-fumk.onrender.com/api'; // Verified production URL

// Configuration object
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for requests
  debug: isDevelopment, // Enable debug logging in development
  
  // Add offline mode check
  get isOfflineMode() {
    return localStorage.getItem('api_offline_mode') === 'true';
  }
};

// Helper function to detect if the API is available
export async function isApiAvailable() {
  // Check if offline mode is already enabled in localStorage
  if (apiConfig.isOfflineMode) {
    console.log("API availability check skipped - offline mode already active");
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Ensure we're using the full URL including /api suffix
    const pingUrl = `${API_BASE_URL}/ping`;
    console.log(`Checking API availability at: ${pingUrl}`);
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("API is available and responding");
      return true;
    } else {
      console.warn(`API responded with status: ${response.status}`);
      // If API responds but with error, fallback to offline mode
      localStorage.setItem('api_offline_mode', 'true');
      return false;
    }
  } catch (error) {
    console.warn('API availability check failed:', error);
    // On error (timeout, network failure, etc), fallback to offline mode
    localStorage.setItem('api_offline_mode', 'true');
    return false;
  }
}

// Add a utility function to normalize API request URLs
export function getFullApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If the API_BASE_URL already ends with /api, make sure we don't add it again
  return `${API_BASE_URL}/${normalizedEndpoint}`;
}
