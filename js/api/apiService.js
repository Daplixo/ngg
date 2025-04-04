/**
 * API Service for the Number Guessing Game
 * Handles all communication with the backend server
 */

import { API_BASE_URL, isApiAvailable } from './apiConfig.js';

export class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.available = null; // API availability status (null means not yet checked)
    
    // CRITICAL FIX: Add offline mode with force option
    this.offlineMode = localStorage.getItem('api_offline_mode') === 'true';
    
    // Check API availability on init - with timeout to prevent blocking
    setTimeout(() => this.checkAvailability(), 500);
  }

  // Check if the API is available
  async checkAvailability() {
    // CRITICAL FIX: Don't attempt connection if offline mode is enabled
    if (this.offlineMode) {
      console.log("API in offline mode - skipping availability check");
      this.available = false;
      return false;
    }
    
    try {
      // Add a short timeout to prevent long blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/ping`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      this.available = response.ok;
      console.log(`API status: ${this.available ? 'Available' : 'Unavailable'}`);
      return this.available;
    } catch (error) {
      this.available = false;
      console.warn('API availability check failed:', error);
      
      // CRITICAL FIX: If checking fails, enable offline mode automatically
      this.offlineMode = true;
      localStorage.setItem('api_offline_mode', 'true');
      console.log("Enabling offline mode automatically");
      
      return false;
    }
  }

  // CRITICAL FIX: Add method to toggle offline mode
  toggleOfflineMode(enabled) {
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
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['x-auth-token'] = this.token;
    }
    
    return headers;
  }

  // Execute API request with offline handling
  async executeRequest(endpoint, options, offlineErrorMessage) {
    // If we already know the API is unavailable, don't attempt the request
    if (this.available === false) {
      throw new Error(offlineErrorMessage || 'API is currently unavailable. Please try again later.');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred with the request');
      }
      
      return data;
    } catch (error) {
      // Check if it's a network error, which likely means API is down
      if (error.name === 'TypeError' && error.message.includes('network')) {
        this.available = false;
        throw new Error(offlineErrorMessage || 'Unable to connect to server. Please check your internet connection.');
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
