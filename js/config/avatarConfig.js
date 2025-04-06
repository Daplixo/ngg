/**
 * Avatar configuration for Number Guessing Game
 * Maps avatar IDs to image paths
 */

export const AVATARS = [
  {
    id: 'avatar_01',
    path: 'assets/avatars/avatar1.png',
    alt: 'Default Avatar'
  },
  {
    id: 'avatar_02',
    path: 'assets/avatars/avatar2.png',
    alt: 'Player Avatar 2'
  },
  {
    id: 'avatar_03',
    path: 'assets/avatars/avatar3.png',
    alt: 'Player Avatar 3'
  },
  {
    id: 'avatar_04',
    path: 'assets/avatars/avatar4.png',
    alt: 'Player Avatar 4'
  },
  {
    id: 'avatar_05',
    path: 'assets/avatars/avatar5.png',
    alt: 'Player Avatar 5'
  },
  {
    id: 'avatar_06',
    path: 'assets/avatars/avatar6.png',
    alt: 'Player Avatar 6'
  }
];

// Helper function to get avatar path by ID
export function getAvatarPathById(avatarId) {
  const avatar = AVATARS.find(avatar => avatar.id === avatarId);
  return avatar ? avatar.path : AVATARS[0].path; // Default to first avatar if not found
}

// Helper function to get avatar ID from path
export function getAvatarIdByPath(path) {
  const avatar = AVATARS.find(avatar => avatar.path === path);
  return avatar ? avatar.id : AVATARS[0].id; // Default to first avatar if not found
}

// Export default for compatibility
export default AVATARS;
