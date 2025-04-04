/**
 * API Configuration for Number Guessing Game
 */

// Determine environment
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Set API URL based on environment
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000/api'  
  : 'https://your-production-api.com/api'; // Change this for production

// Configuration object
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for requests
  debug: isDevelopment // Enable debug logging in development
};

// Helper function to detect if the API is available
export async function isApiAvailable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/ping`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
}
