/**
 * Database Connection Manager
 * Handles checking and managing database connectivity
 * MODIFIED: Increased retry delay for Render cold starts
 */

import { apiConfig, isApiAvailable } from './api/apiConfig.js';
import { apiService } from './api/apiService.js';

// Status element ID
const STATUS_ELEMENT_ID = 'db-status-indicator';
// Track connection state to prevent unnecessary changes
let lastKnownState = null;
// Set a max retry count to avoid infinite attempts
let retryCount = 0;
const MAX_RETRIES = 5; // Increased from 3 to 5
// Track if there's a manual override
let manualOfflineMode = false;
// Increased retry delay for Render cold starts (now 10 seconds)
const RETRY_DELAY = 10000;

// Make sure all API references use 'http://localhost:5000'

// Create and inject the status indicator into the page - DISABLED
function createStatusIndicator() {
  // Disabled to remove UI elements
  return null;
}

// Update status indicator based on connection state - DISABLED
function updateStatusIndicator(isConnected, isManual = false) {
  // Disabled UI updates - log to console only
  console.log(`DB connection state: ${isConnected ? 'Connected' : 'Disconnected'}${isManual ? ' (manual)' : ''}`);
  lastKnownState = isConnected;
}

// Prevent other scripts from forcibly setting offline mode
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'api_offline_mode' && value === 'true' && lastKnownState === true && !manualOfflineMode) {
    console.warn('Attempted to set offline mode while connected - prevented');
    return;
  }
  originalSetItem.call(localStorage, key, value);
};

// Check database connection
export async function checkConnection(manual = false) {
  try {
    // If manual offline mode is enabled, respect that
    if (manualOfflineMode) {
      console.log("Manual offline mode enabled, staying offline");
      updateStatusIndicator(false, true);
      return false;
    }
    
    // If it's a manual check, force parameters to ensure proper checking
    if (manual) {
      console.log("Manual connection check initiated");
      // Don't reset offline mode yet, wait until we confirm connection
      retryCount = 0;
      apiService.available = null;
    }
    
    // Check API availability
    console.log("Checking API availability...");
    const isAvailable = await isApiAvailable();
    console.log(`API availability check result: ${isAvailable}`);
    
    // Update service state
    apiService.available = isAvailable;
    
    // Only update offline mode if successful or if manual check
    if (isAvailable) {
      apiService.offlineMode = false;
      apiConfig.isOfflineMode = false;
      retryCount = 0; // Reset retry count on success
    } else if (manual) {
      retryCount++;
      
      // If max retries reached, set offline mode
      if (retryCount >= MAX_RETRIES) {
        console.log(`Max retries (${MAX_RETRIES}) reached, switching to offline mode`);
        apiService.offlineMode = true;
        apiConfig.isOfflineMode = true;
      } else {
        console.log(`Backend still sleeping or unavailable. Attempt ${retryCount}/${MAX_RETRIES}`);
        console.log(`Waiting ${RETRY_DELAY/1000} seconds before retry...`);
        // Schedule another check after the increased delay
        setTimeout(() => checkConnection(true), RETRY_DELAY);
      }
    }
    
    // Update status (console only)
    updateStatusIndicator(isAvailable);
    
    return isAvailable;
  } catch (error) {
    console.error("Error checking connection:", error);
    updateStatusIndicator(false);
    return false;
  }
}

// Initialize connection checker
export function initConnectionChecker() {
  console.log("Initializing database connection checker (UI disabled)");
  
  // Initial check with a delay to avoid initial script blocking
  setTimeout(() => checkConnection(true), 3000); // Increased initial delay
  
  // Periodic checks - less frequent for Render cold starts
  setInterval(() => {
    if (!manualOfflineMode) {
      checkConnection();
    }
  }, 180000); // Check every 3 minutes
  
  // Check on online/offline events
  window.addEventListener('online', () => {
    if (!manualOfflineMode) {
      console.log("Browser reports online status, checking API...");
      checkConnection(true);
    }
  });
  
  window.addEventListener('offline', () => {
    console.log("Browser reports offline status, pausing API checks");
    apiConfig.isOfflineMode = true;
    updateStatusIndicator(false);
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initConnectionChecker);

// Expose manual toggle for console debugging
window.toggleDBOfflineMode = (offline) => {
  manualOfflineMode = offline;
  if (offline) {
    apiService.offlineMode = true;
    apiConfig.isOfflineMode = true;
  } else {
    checkConnection(true);
  }
  console.log(`Manual offline mode ${offline ? 'enabled' : 'disabled'}`);
  return offline;
};
