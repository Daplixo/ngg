/**
 * SyncManager - Handles automatic synchronization of user data with the server
 */

import { UserProfile } from './userProfile.js';
import { apiService } from './api/apiService.js';

export class SyncManager {
    constructor() {
        this.userProfile = new UserProfile();
        this.syncInterval = 5 * 60 * 1000; // Sync every 5 minutes
        this.intervalId = null;
    }

    /**
     * Start periodic background synchronization
     */
    startSync() {
        console.log("Starting background data synchronization...");
        // Run initial sync immediately
        this.performSync();
        
        // Then set up periodic sync
        this.intervalId = setInterval(() => this.performSync(), this.syncInterval);
        console.log("Background sync started with interval:", this.syncInterval);
    }
    
    /**
     * Stop background synchronization
     */
    stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Background sync stopped");
        }
    }
    
    /**
     * Perform a synchronization operation
     */
    performSync() {
        const profile = this.userProfile.getProfile();
        
        // Only sync if we have a profile
        if (profile) {
            console.log("Performing background sync with server for profile:", profile.nickname);
            
            // First register if not already registered
            if (!profile.syncedWithServer) {
                this.registerProfileWithServer(profile);
            } else {
                // Update existing profile data
                this.updateProfileOnServer(profile);
            }
        }
    }
    
    /**
     * Register a new profile with the server
     */
    registerProfileWithServer(profile) {
        // Generate a unique email-like ID and password
        const tempEmail = `user_${profile.name}_${Date.now()}@numberguess.game`;
        const tempPassword = `pwd_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        
        console.log("Registering profile with server:", profile.name);
        
        apiService.register({
            username: profile.name,
            nickname: profile.nickname,
            email: tempEmail,
            password: tempPassword,
            profilePicture: profile.picture
        }).then(response => {
            console.log("Profile successfully registered with server:", response);
            
            // Save the token for future API calls
            if (response && response.token) {
                apiService.setToken(response.token);
                
                // Update the profile to mark it as synced with server
                profile.syncedWithServer = true;
                profile.serverEmail = tempEmail; // Store for reference
                this.userProfile.saveProfile(profile);
                
                console.log("Profile marked as synced with server");
            }
        }).catch(error => {
            console.warn("Server registration failed:", error);
            
            // Check if the failure is due to the username already being taken
            if (error.message && error.message.includes('Username already taken')) {
                console.log("Username already exists, trying to login instead...");
                this.handleExistingUsername(profile, tempEmail, tempPassword);
            }
        });
    }
    
    /**
     * Handle case where username already exists
     */
    handleExistingUsername(profile, email, password) {
        // If username exists, we could either try to login or modify the username
        // For now, let's append a random number to make it unique
        const newUsername = `${profile.name}_${Math.floor(Math.random() * 10000)}`;
        profile.name = newUsername;
        this.userProfile.saveProfile(profile);
        
        // Try registering again with the new username
        this.registerProfileWithServer(profile);
    }
    
    /**
     * Update profile data on the server
     */
    updateProfileOnServer(profile) {
        if (!apiService.offlineMode) {
            // Update profile information
            apiService.updateProfile({
                nickname: profile.nickname,
                username: profile.name,
                profilePicture: profile.picture
            }).catch(error => {
                console.warn("Failed to update profile on server:", error);
            });
            
            // Update game statistics
            apiService.updateStats({
                gamesPlayed: profile.gamesPlayed,
                bestLevel: profile.bestLevel
            }).catch(error => {
                console.warn("Failed to update stats on server:", error);
            });
        }
    }
}

// Initialize SyncManager on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure everything else is loaded
    setTimeout(() => {
        const syncManager = new SyncManager();
        syncManager.startSync();
        
        // Store reference to reuse later
        window.syncManager = syncManager;
    }, 3000);
});
