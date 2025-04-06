/**
 * API Configuration for Number Guessing Game
 */

// MODIFIED: Use local development URL
export const API_BASE_URL = 'http://localhost:5000';

// Configuration object
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for requests
  
  // Add offline mode check
  get isOfflineMode() {
    return localStorage.getItem('api_offline_mode') === 'true';
  },
  
  // Add setter for offline mode
  set isOfflineMode(value) {
    localStorage.setItem('api_offline_mode', value ? 'true' : 'false');
  }
};

// Helper function to detect if the API is available
export async function isApiAvailable() {
  try {
    console.log("Checking API availability...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use the correct ping endpoint with /api
    const pingUrl = `${API_BASE_URL}/api/ping`;
    console.log(`Pinging API at: ${pingUrl}`);
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache' 
      },
      cache: 'no-store',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("API is available and responding");
      // Reset offline mode since API is available
      apiConfig.isOfflineMode = false;
      return true;
    } else {
      console.warn(`API responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
}

// Add a utility function to normalize API request URLs
export function getFullApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Always add /api to the path
  return `${API_BASE_URL}/api/${normalizedEndpoint}`;
}
