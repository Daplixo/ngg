/**
 * API Service for the Number Guessing Game
 * Handles all communication with the backend server
 */

import { apiConfig } from './apiConfig.js';

export class ApiService {
  constructor() {
    // CRITICAL: Make sure the API URL is always set
    this.apiUrl = apiConfig.baseUrl;
    this.token = localStorage.getItem(apiConfig.tokenKey);
    this.offlineMode = apiConfig.isOfflineMode || false;
    this.available = null; // Will be determined by connectivity check
    
    // FIXED: Don't start in offline mode unless explicitly set
    this.offlineMode = localStorage.getItem('api_offline_mode') === 'true';
    
    // FIXED: Always check availability once on init but with a delay
    setTimeout(() => this.checkAvailability(), 1500);
  }

  // Check if the API is available
  async checkAvailability() {
    // Don't attempt connection if manual offline mode is enabled
    if (this.offlineMode) {
      console.log("API in offline mode - skipping availability check");
      this.available = false;
      return false;
    }
    
    try {
      console.log("ApiService: Running availability check...");
      // Add a short timeout to prevent long blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // FIXED: Use the correct ping endpoint with /api
      const response = await fetch(`${apiConfig.baseUrl}/api/ping`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      
      // FIXED: Handle response
      const data = await response.json();
      console.log("API ping response:", data);
      
      const result = response.ok;
      console.log(`API status check: ${result ? 'Available ✓' : 'Unavailable ✗'}`);
      
      this.available = result;
      return this.available;
    } catch (error) {
      console.warn('API availability check failed:', error);
      return false;
    }
  }

  // Toggle offline mode
  toggleOfflineMode(isOffline = null) {
    // If isOffline is not provided, toggle the current state
    this.offlineMode = isOffline !== null ? isOffline : !this.offlineMode;
    console.log(`API Service ${this.offlineMode ? 'offline' : 'online'} mode ${this.offlineMode ? 'enabled' : 'disabled'}`);
    
    // Also update the global config
    apiConfig.isOfflineMode = this.offlineMode;
    
    return this.offlineMode;
  }

  // Set token for authentication
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(apiConfig.tokenKey, token);
    } else {
      localStorage.removeItem(apiConfig.tokenKey);
    }
  }

  // Helper method to get all the required headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Execute request with better error handling
  async executeRequest(endpoint, options, offlineMessage = 'Cannot perform this action while offline') {
    try {
      if (this.offlineMode) {
        console.log(`[API] Offline mode active, skipping request to ${endpoint}`);
        throw new Error(offlineMessage);
      }

      // CRITICAL FIX: Make sure we add /api prefix to all endpoints
      // If the endpoint already starts with /api, don't add it again
      let apiEndpoint = endpoint;
      if (!endpoint.startsWith('/api') && !endpoint.startsWith('http')) {
        apiEndpoint = `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      }

      // Construct the full URL
      const fullUrl = apiEndpoint.startsWith('http') 
        ? apiEndpoint 
        : `${apiConfig.baseUrl}${apiEndpoint}`;
        
      console.log(`Executing API request to: ${fullUrl}`);
      console.log(`${options.method} ${fullUrl}`);
      
      const response = await fetch(fullUrl, options);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP Error ${response.status}`;

        // Standardize error messages for specific status codes
        if (response.status === 409) {
          throw new Error('Username already taken');
        } else if (response.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      return await response.json();
    } catch (error) {
      // Pass through our own Error objects unchanged
      throw error;
    }
  }

  // User registration - FIXED endpoint
  async register(userData) {
    try {
      // Make sure avatarId is included in the request
      if (userData.profilePicture && !userData.avatarId) {
        // Extract avatar ID from the profile picture path if it's not provided directly
        const avatarMatch = userData.profilePicture.match(/avatar(\d+)\.png$/);
        if (avatarMatch) {
          userData.avatarId = `avatar_${avatarMatch[1].padStart(2, '0')}`;
        } else {
          userData.avatarId = 'avatar_01'; // Default
        }
      }
      
      // Simplify the registration payload - remove email and password
      const payload = {
        username: userData.username,
        nickname: userData.nickname,
        avatarId: userData.avatarId || 'avatar_01',
        profilePicture: userData.profilePicture
      };

      return await this.executeRequest('/auth/register', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      }, 'Unable to register account while offline. Your profile will be saved locally.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User login - FIXED endpoint
  async login(credentials) {
    try {
      const response = await this.executeRequest('/auth/login', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      }, 'Unable to login while offline. Please try again when connected.');
      
      if (response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get user profile - FIXED endpoint
  async getUserProfile() {
    try {
      return await this.executeRequest('/users/profile', {
        method: 'GET',
        headers: this.getHeaders()
      }, 'Unable to fetch profile while offline. Using local data.');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile - FIXED endpoint
  async updateProfile(profileData) {
    try {
      return await this.executeRequest('/users/profile', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      }, 'Unable to update profile while offline. Changes saved locally.');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update user statistics - FIXED endpoint
  async updateStats(statsData) {
    try {
      return await this.executeRequest('/users/stats', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(statsData)
      }, 'Unable to update stats while offline. Changes saved locally.');
    } catch (error) {
      console.error('Update stats error:', error);
      // Don't throw this error, just log it - we don't want to break the game flow for stats updates
      return null;
    }
  }

  // Update user statistics by username - FIXED endpoint
  async updateStatsByUsername(username, stats) {
    try {
      if (!username) {
        console.error("❌ Cannot update stats: Missing username");
        return null;
      }
      
      console.log(`📊 Updating stats for ${username}:`, stats);
      
      return await this.executeRequest('/users/stats', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, stats })
      }, 'Unable to update stats while offline. Changes saved locally.');
    } catch (error) {
      console.error(`[API] Error updating stats for ${username}:`, error);
      // Don't throw this error, just log it - we don't want to break the game flow for stats updates
      return null;
    }
  }

  // Update user statistics - FIXED endpoint
  async updateUserStats(username, stats) {
    try {
      if (!username) {
        console.error("❌ [API] Cannot update stats: Missing username");
        return null;
      }
      
      console.log(`📤 [API] Sending stats update for ${username}:`, stats);
      
      return await this.executeRequest('/users/stats', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, stats })
      }, 'Unable to sync stats while offline. Will try again later.');
    } catch (error) {
      console.error(`❌ [API] Stats update failed for ${username}:`, error);
      return null;
    }
  }

  // Delete user account - FIXED endpoint
  async deleteAccount() {
    try {
      return await this.executeRequest('/users', {
        method: 'DELETE',
        headers: this.getHeaders()
      }, 'Unable to delete account while offline.');
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Delete user account by username - FIXED endpoint
  async deleteAccountByUsername(username) {
    try {
      return await this.executeRequest(`/users/${username}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      }, 'Unable to delete account while offline.');
    } catch (error) {
      console.error(`Delete account error for ${username}:`, error);
      throw error;
    }
  }

  // Check if username exists - FIXED endpoint
  async checkUsernameExists(username) {
    try {
      const response = await this.executeRequest(`/auth/username/${username}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return response.exists;
    } catch (error) {
      console.error('Username check error:', error);
      return false;
    }
  }

  // Get leaderboard data (by best level) - FIXED endpoint
  async getLeaderboardByLevel(limit = 10) {
    try {
      return await this.executeRequest(`/leaderboard/best-level?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      }, 'Unable to fetch leaderboard while offline.');
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  // Logout (client-side only)
  logout() {
    this.setToken(null);
    return true;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Immediately check availability on module load
setTimeout(async () => {
  console.log("Initial API availability check...");
  try {
    const available = await apiService.checkAvailability();
    console.log(`Initial API check result: ${available ? 'Available ✓' : 'Unavailable ✗'}`);
    
    // Update the service instance
    apiService.available = available;
    
    // When available, reset offline mode
    if (available) {
      apiService.offlineMode = false;
      apiConfig.isOfflineMode = false;
    }
  } catch (err) {
    console.error("Error during initial API check:", err);
  }
}, 500);
