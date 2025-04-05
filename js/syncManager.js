import { UserProfile } from './userProfile.js';
import { apiService } from './api/apiService.js';

export class SyncManager {
    constructor() {
        this.userProfile = new UserProfile();
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
        this.intervalId = null;
    }

    startSync() {
        console.log("📡 Starting background data synchronization...");
        this.performSync(); // immediate
        this.intervalId = setInterval(() => this.performSync(), this.syncInterval);
        console.log("✅ Background sync started with interval:", this.syncInterval);
    }

    stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("⏹️ Background sync stopped");
        }
    }

    async performSync() {
        const profile = this.userProfile.getProfile();

        if (!profile) return;

        console.log("🔄 Syncing profile:", profile.nickname);

        // Avoid syncing if offline or unavailable
        if (apiService.offlineMode || apiService.available === false) {
            console.warn("⚠️ Skipping sync — offline mode or API unavailable.");
            return;
        }

        if (!profile.syncedWithServer) {
            await this.registerProfileWithServer(profile);
        } else {
            this.updateProfileOnServer(profile);
        }
    }

    async registerProfileWithServer(profile) {
        const tempEmail = `user_${profile.name}_${Date.now()}@numberguess.game`;
        const tempPassword = `pwd_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

        console.log("📤 Registering profile with server:", profile.name);

        try {
            const response = await apiService.register({
                username: profile.name,
                nickname: profile.nickname,
                email: tempEmail,
                password: tempPassword,
                profilePicture: profile.picture
            });

            if (response && response.token) {
                apiService.setToken(response.token);
                profile.syncedWithServer = true;
                profile.serverEmail = tempEmail;
                this.userProfile.saveProfile(profile);
                console.log("✅ Profile successfully synced with server");
            }
        } catch (error) {
            console.warn("❌ Server registration failed:", error);

            if (error.message && error.message.includes('Username already taken')) {
                this.handleExistingUsername(profile);
            }
        }
    }

    handleExistingUsername(profile) {
        profile.name = `${profile.name}_${Math.floor(Math.random() * 10000)}`;
        this.userProfile.saveProfile(profile);
        this.registerProfileWithServer(profile);
    }

    updateProfileOnServer(profile) {
        apiService.updateProfile({
            nickname: profile.nickname,
            username: profile.name,
            profilePicture: profile.picture
        }).catch(err => {
            console.warn("❌ Failed to update profile:", err);
        });

        apiService.updateStats({
            gamesPlayed: profile.gamesPlayed,
            bestLevel: profile.bestLevel
        }).catch(err => {
            console.warn("❌ Failed to update stats:", err);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const syncManager = new SyncManager();
        syncManager.startSync();
        window.syncManager = syncManager;
    }, 3000);
});
