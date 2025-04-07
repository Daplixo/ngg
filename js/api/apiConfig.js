/**
 * API Configuration Module
 * Central place to manage API endpoints and connection settings
 */

// API base URL - ensure it's always explicitly set to a valid URL
export const apiConfig = {
  // Base URL for API - CRITICAL: Must have a valid default
  baseUrl: 'http://localhost:5000',
  
  // Path for API endpoints
  apiPath: '/api',
  
  // Offline mode flag - used to disable API calls when server is unreachable
  isOfflineMode: false,
  
  // Token storage key for localStorage
  tokenKey: 'userToken',
  
  // Methods to get full API URL
  getApiUrl() {
    return this.baseUrl + this.apiPath;
  },
  
  // Method to get a full endpoint URL
  getEndpointUrl(endpoint) {
    return this.baseUrl + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
  }
};

// Helper function to detect if the API is available
export async function isApiAvailable() {
  try {
    console.log('Checking API availability...');
    const pingUrl = `${apiConfig.baseUrl}/api/ping`;
    console.log('Pinging API at:', pingUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('API is available and responding');
      return true;
    }
    
    console.warn(`API responded with status: ${response.status}`);
    return false;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
}

// For backward compatibility - to fix API_BASE_URL not found errors
export const API_BASE_URL = apiConfig.baseUrl;
export const getFullApiUrl = (endpoint) => apiConfig.getEndpointUrl(endpoint);
