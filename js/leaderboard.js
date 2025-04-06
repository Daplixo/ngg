import { getAvatarPathById } from './config/avatarConfig.js';

export class Leaderboard {
    constructor() {
        // ...existing code...
    }

    async loadLeaderboard() {
        try {
            // ...existing code...
            
            // Display leaderboard data
            const leaderboardEl = document.getElementById('leaderboard-list');
            leaderboardEl.innerHTML = '';
            
            players.forEach((player, index) => {
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                const avatarPath = getAvatarPathById(player.avatarId) || 'assets/icons/default-profile.png';
                
                const playerEl = document.createElement('li');
                playerEl.className = `leaderboard-item ${rankClass}`;
                playerEl.innerHTML = `
                    <div class="rank">${index + 1}</div>
                    <div class="player-avatar">
                        <img src="${avatarPath}" alt="${player.nickname}'s avatar">
                    </div>
                    <div class="player-info">
                        <div class="player-name">${player.nickname}</div>
                        <div class="player-username">@${player.username}</div>
                    </div>
                    <div class="player-score">Level ${player.stats.bestLevel}</div>
                `;
                
                leaderboardEl.appendChild(playerEl);
            });
            
            // ...existing code...
        } catch (error) {
            // ...existing code...
        }
    }

    // ...existing code...
}