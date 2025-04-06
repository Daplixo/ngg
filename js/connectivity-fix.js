/**
 * API Connectivity Fix
 * This script helps diagnose and fix API connectivity issues
 * MODIFIED: Added early wakeup ping and better Render cold start handling
 */

import { API_BASE_URL, isApiAvailable, apiConfig } from './api/apiConfig.js';
import { apiService } from './api/apiService.js';

console.log("🔍 API Connectivity Fix loaded - Silent mode");

// Send a silent wakeup ping to Render immediately to warm up the backend
(function wakeupBackend() {
  const BACKEND_URL = 'http://localhost:5000/';
  
  console.log("🔥 Sending early wakeup ping to backend...");
  
  fetch(BACKEND_URL, { 
    method: 'GET',
    mode: 'no-cors', // Use no-cors to avoid CORS issues during wakeup
    cache: 'no-store'
  })
  .then(() => {
    console.log("📡 Wakeup ping sent to backend. This will help speed up the cold start.");
  })
  .catch(err => {
    console.log("⚠️ Wakeup ping failed, but this is expected during cold start:", err);
  });
})();

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
      `http://localhost:5000/api/ping`,
      `http://localhost:5000/ping`,
      `http://localhost:5000/api` // Try root API path
    ];
    
    console.log("Trying multiple API endpoints for connectivity...");
    
    let connected = false;
    
    for (const endpoint of pingEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Longer timeout for cold starts
        
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
        console.log(`❌ Error connecting to: ${endpoint} - Backend might be in cold start`, err);
      }
    }
    
    // Update service status but don't show UI
    apiService.available = connected;
    if (connected) {
      apiService.offlineMode = false;
      apiConfig.isOfflineMode = false;
      console.log("✅ API connection established");
    } else {
      console.log("⚠️ Backend still waking up or unavailable. Will retry later.");
    }
    
    return connected;
  } catch (error) {
    console.error("API status check failed:", error);
    console.log("⚠️ Backend appears to be in cold start or unavailable. Will retry later.");
    return false;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing silent API connectivity check...");
  
  // Initial status check with longer delay for cold start
  console.log("🕒 Waiting 5 seconds before first API check to allow backend to wake up...");
  setTimeout(() => {
    console.log("⏰ Performing initial API availability check");
    checkAPIStatus();
  }, 5000);
  
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
    console.log(`Force checking API at: http://localhost:5000/api/ping`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Longer timeout for cold starts
    
    const response = await fetch(`http://localhost:5000/api/ping`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log("✅ API is available");
      return true;
    } else {
      console.log("❌ API responded with error status:", response.status);
      console.log("🕒 Backend might be in cold start, waiting for it to initialize...");
      return false;
    }
  } catch (error) {
    console.error("Force API check failed:", error);
    console.log("⚠️ Backend might be in cold start or unavailable");
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
