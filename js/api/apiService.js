/**
 * API Service for the Number Guessing Game
 * Handles all communication with the backend server
 */

import { API_BASE_URL, isApiAvailable, apiConfig, getFullApiUrl } from './apiConfig.js';

export class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.available = null; // API availability status (null means not yet checked)
    
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
      const response = await fetch(`${API_BASE_URL}/api/ping`, {
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
  toggleOfflineMode(enabled) {
    if (this.offlineMode === enabled) return; // No change needed
    
    this.offlineMode = enabled;
    localStorage.setItem('api_offline_mode', enabled ? 'true' : 'false');
    this.available = !enabled;
    console.log(`API offline mode ${enabled ? 'enabled' : 'disabled'}`);
    return this.offlineMode;
  }

  // Set auth token for API calls
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Create default headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    };
    
    if (this.token) {
      headers['x-auth-token'] = this.token;
    }
    
    return headers;
  }

  // Execute API request with offline handling
  async executeRequest(endpoint, options, offlineErrorMessage) {
    // If we already know the API is unavailable, don't attempt the request
    if (this.available === false || this.offlineMode) {
      console.warn(`Skipping API request to ${endpoint} - offline mode active`);
      throw new Error(offlineErrorMessage || 'API is currently unavailable. Please try again later.');
    }
    
    try {
      // FIXED: Use getFullApiUrl to ensure proper URL construction
      const fullUrl = getFullApiUrl(endpoint);
      console.log(`Executing API request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl, options);
      let data;
      
      try {
        data = await response.json();
      } catch (e) {
        // Handle non-JSON responses
        data = { message: 'Server returned non-JSON response' };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred with the request');
      }
      
      return data;
    } catch (error) {
      // Check if it's a network error, which likely means API is down
      if (error.name === 'TypeError' && error.message.includes('network')) {
        console.warn(`Network error on API request to ${endpoint}`);
        // Run an availability check to update status for future requests
        setTimeout(() => this.checkAvailability(), 1000);
      }
      
      throw error;
    }
  }

  // User registration
  async register(userData) {
    try {
      return await this.executeRequest('/auth/register', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      }, 'Unable to register account while offline. Your profile will be saved locally.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User login
  async login(credentials) {
    try {
      const data = await this.executeRequest('/auth/login', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      }, 'Unable to login while offline.');
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getUserProfile() {
    try {
      return await this.executeRequest('/users/profile', {
        method: 'GET',
        headers: this.getHeaders()
      }, 'Unable to fetch profile while offline.');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
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

  // Update user statistics
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

  // Delete user account
  async deleteAccount() {
    try {
      const data = await this.executeRequest('/users', {
        method: 'DELETE',
        headers: this.getHeaders()
      }, 'Unable to delete account while offline.');
      
      this.setToken(null);
      return data;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Get leaderboard data (by best level)
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
    const available = await isApiAvailable();
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
