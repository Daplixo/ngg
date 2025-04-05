/**
 * API Connectivity Fix
 * This script helps diagnose and fix API connectivity issues
 * MODIFIED: Removed floating status indicators
 */

import { API_BASE_URL, isApiAvailable, apiConfig } from './api/apiConfig.js';
import { apiService } from './api/apiService.js';

console.log("🔍 API Connectivity Fix loaded - Silent mode");

// Create a simple status indicator - DISABLED
function createStatusIndicator() {
  // Return null to disable the UI indicator
  return null;
}

// Update status indicator - DISABLED
function updateStatusIndicator(status) {
  // Function disabled - no UI indicators
  console.log(`API Status: ${status} (indicator disabled)`);
}

// Check API status function
export async function checkAPIStatus(forcedCheck = false) {
  console.log("Checking API status silently...");
  
  try {
    // When forced, reset the offline mode
    if (forcedCheck) {
      apiService.offlineMode = false;
      apiConfig.isOfflineMode = false;
    }
    
    // Test against multiple endpoints for redundancy
    const pingEndpoints = [
      `${API_BASE_URL}/api/ping`,
      `${API_BASE_URL}/ping`,
      `${API_BASE_URL}/api` // Try root API path
    ];
    
    console.log("Trying multiple API endpoints for connectivity...");
    
    let connected = false;
    
    for (const endpoint of pingEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Successfully connected to: ${endpoint}`);
          connected = true;
          break;
        } else {
          console.log(`❌ Failed to connect to: ${endpoint}, status: ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ Error connecting to: ${endpoint}`, err);
      }
    }
    
    // Update service status but don't show UI
    apiService.available = connected;
    if (connected) {
      apiService.offlineMode = false;
      apiConfig.isOfflineMode = false;
    }
    
    return connected;
  } catch (error) {
    console.error("API status check failed:", error);
    return false;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing silent API connectivity check...");
  
  // Initial status check with delay
  setTimeout(() => checkAPIStatus(), 1000);
  
  // Periodic check (less frequent)
  setInterval(() => {
    if (!apiService.offlineMode) {
      checkAPIStatus();
    }
  }, 180000); // Check every 3 minutes
  
  // Check when coming back online
  window.addEventListener('online', () => {
    console.log("Browser reports online status, checking API...");
    checkAPIStatus(true);
  });
});

// Export direct connection checkers that bypass normal checks
export async function forceCheckAPI() {
  // Test the API directly
  try {
    console.log(`Force checking API at: ${API_BASE_URL}/api/ping`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/ping`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    console.error("Force API check failed:", error);
    return false;
  }
}

// Expose the API checker globally for debugging
window.checkAPI = async () => {
  console.log("Manual API check triggered from console");
  const result = await checkAPIStatus(true);
  console.log(`API check result: ${result ? 'Connected ✓' : 'Failed ✗'}`);
  return result;
};
