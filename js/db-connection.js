/**
 * Database Connection Manager
 * Handles checking and managing database connectivity
 * MODIFIED: Removed UI elements
 */

import { apiConfig, isApiAvailable } from './api/apiConfig.js';
import { apiService } from './api/apiService.js';

// Status element ID
const STATUS_ELEMENT_ID = 'db-status-indicator';
// Track connection state to prevent unnecessary changes
let lastKnownState = null;
// Set a max retry count to avoid infinite attempts
let retryCount = 0;
const MAX_RETRIES = 3;
// Track if there's a manual override
let manualOfflineMode = false;

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
    } else if (manual) {
      retryCount++;
      
      // If max retries reached, set offline mode
      if (retryCount >= MAX_RETRIES) {
        console.log(`Max retries (${MAX_RETRIES}) reached, switching to offline mode`);
        apiService.offlineMode = true;
        apiConfig.isOfflineMode = true;
      } else {
        console.log(`Connection failed, retry ${retryCount}/${MAX_RETRIES}`);
        // Schedule another check after a delay
        setTimeout(() => checkConnection(true), 3000);
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
  setTimeout(() => checkConnection(true), 1500);
  
  // Periodic checks - less frequent to avoid switching back and forth
  setInterval(() => {
    if (!manualOfflineMode) {
      checkConnection();
    }
  }, 120000); // Check every 2 minutes
  
  // Check on online/offline events
  window.addEventListener('online', () => {
    if (!manualOfflineMode) {
      checkConnection(true);
    }
  });
  
  window.addEventListener('offline', () => {
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
