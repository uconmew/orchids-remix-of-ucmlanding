/**
 * Comprehensive Workshop RBAC Configuration
 * Defines all roles and their permissions in the workshop system
 */

import { WorkshopRole } from "@/types/workshop";

export interface Permission {
  resource: string;
  action: string;
  description: string;
}

export interface RoleConfig {
  name: WorkshopRole;
  displayName: string;
  description: string;
  level: number; // Higher level = more authority
  color: string;
  icon: string;
  permissions: Permission[];
  canAssign: WorkshopRole[]; // Which roles this role can assign to others
}

/**
 * All available permissions in the workshop system
 */
export const ALL_PERMISSIONS: Record<string, Permission[]> = {
  session: [
    { resource: 'session', action: 'end', description: 'End the workshop for everyone' },
    { resource: 'session', action: 'lock', description: 'Lock/unlock the meeting' },
    { resource: 'session', action: 'record', description: 'Start/stop recording' },
    { resource: 'session', action: 'settings', description: 'Change session settings' },
  ],
  participants: [
    { resource: 'participants', action: 'view', description: 'View participant list' },
    { resource: 'participants', action: 'mute', description: 'Mute participants' },
    { resource: 'participants', action: 'muteAll', description: 'Mute all participants' },
    { resource: 'participants', action: 'remove', description: 'Remove participants from session' },
    { resource: 'participants', action: 'spotlight', description: 'Spotlight participants' },
    { resource: 'participants', action: 'admitWaiting', description: 'Admit waiting participants' },
  ],
  roles: [
    { resource: 'roles', action: 'view', description: 'View participant roles' },
    { resource: 'roles', action: 'assign', description: 'Assign roles to participants' },
    { resource: 'roles', action: 'assignHost', description: 'Assign host role' },
    { resource: 'roles', action: 'assignCoHost', description: 'Assign co-host role' },
  ],
  screen: [
    { resource: 'screen', action: 'share', description: 'Share screen' },
    { resource: 'screen', action: 'manageSharing', description: 'Manage who can share screen' },
  ],
  chat: [
    { resource: 'chat', action: 'send', description: 'Send chat messages' },
    { resource: 'chat', action: 'sendPrivate', description: 'Send private messages' },
    { resource: 'chat', action: 'manage', description: 'Delete messages and manage chat' },
    { resource: 'chat', action: 'disableForParticipants', description: 'Disable chat for participants' },
  ],
  whiteboard: [
    { resource: 'whiteboard', action: 'view', description: 'View whiteboard' },
    { resource: 'whiteboard', action: 'draw', description: 'Draw on whiteboard' },
    { resource: 'whiteboard', action: 'clear', description: 'Clear whiteboard' },
    { resource: 'whiteboard', action: 'manage', description: 'Manage whiteboard permissions' },
  ],
  polls: [
    { resource: 'polls', action: 'view', description: 'View polls' },
    { resource: 'polls', action: 'vote', description: 'Vote in polls' },
    { resource: 'polls', action: 'create', description: 'Create polls' },
    { resource: 'polls', action: 'manage', description: 'Edit and delete polls' },
    { resource: 'polls', action: 'viewResults', description: 'View poll results' },
  ],
  questions: [
    { resource: 'questions', action: 'ask', description: 'Ask questions' },
    { resource: 'questions', action: 'upvote', description: 'Upvote questions' },
    { resource: 'questions', action: 'answer', description: 'Answer questions' },
    { resource: 'questions', action: 'manage', description: 'Manage Q&A' },
  ],
  files: [
    { resource: 'files', action: 'view', description: 'View shared files' },
    { resource: 'files', action: 'upload', description: 'Upload files' },
    { resource: 'files', action: 'download', description: 'Download files' },
    { resource: 'files', action: 'delete', description: 'Delete files' },
  ],
  breakout: [
    { resource: 'breakout', action: 'view', description: 'View breakout rooms' },
    { resource: 'breakout', action: 'join', description: 'Join breakout rooms' },
    { resource: 'breakout', action: 'create', description: 'Create breakout rooms' },
    { resource: 'breakout', action: 'assign', description: 'Assign participants to rooms' },
    { resource: 'breakout', action: 'broadcast', description: 'Broadcast to all rooms' },
  ],
  video: [
    { resource: 'video', action: 'share', description: 'Share video' },
    { resource: 'video', action: 'control', description: 'Control shared video playback' },
    { resource: 'video', action: 'upload', description: 'Upload videos' },
  ],
  reactions: [
    { resource: 'reactions', action: 'send', description: 'Send reactions' },
    { resource: 'reactions', action: 'disable', description: 'Disable reactions for all' },
  ],
};

/**
 * Role configurations with their permissions
 */
export const WORKSHOP_ROLES: Record<WorkshopRole, RoleConfig> = {
  host: {
    name: 'host',
    displayName: 'Host',
    description: 'Full control over the workshop session with all administrative privileges',
    level: 100,
    color: 'text-purple-500 border-purple-500 bg-purple-500/10',
    icon: 'Crown',
    canAssign: ['host', 'co-host', 'facilitator', 'moderator', 'presenter', 'participant'],
    permissions: [
      // Session
      ...ALL_PERMISSIONS.session,
      // Participants
      ...ALL_PERMISSIONS.participants,
      // Roles
      ...ALL_PERMISSIONS.roles,
      // Screen
      ...ALL_PERMISSIONS.screen,
      // Chat
      ...ALL_PERMISSIONS.chat,
      // Whiteboard
      ...ALL_PERMISSIONS.whiteboard,
      // Polls
      ...ALL_PERMISSIONS.polls,
      // Questions
      ...ALL_PERMISSIONS.questions,
      // Files
      ...ALL_PERMISSIONS.files,
      // Breakout
      ...ALL_PERMISSIONS.breakout,
      // Video
      ...ALL_PERMISSIONS.video,
      // Reactions
      ...ALL_PERMISSIONS.reactions,
    ],
  },
  
  'co-host': {
    name: 'co-host',
    displayName: 'Co-Host',
    description: 'Can manage participants, mute/unmute, and assist with session management',
    level: 80,
    color: 'text-blue-500 border-blue-500 bg-blue-500/10',
    icon: 'UserCog',
    canAssign: ['facilitator', 'moderator', 'presenter', 'participant'],
    permissions: [
      // Session (limited)
      { resource: 'session', action: 'lock', description: 'Lock/unlock the meeting' },
      { resource: 'session', action: 'record', description: 'Start/stop recording' },
      { resource: 'session', action: 'settings', description: 'Change session settings' },
      // Participants
      ...ALL_PERMISSIONS.participants,
      // Roles (limited)
      { resource: 'roles', action: 'view', description: 'View participant roles' },
      { resource: 'roles', action: 'assign', description: 'Assign roles to participants' },
      { resource: 'roles', action: 'assignCoHost', description: 'Assign co-host role' },
      // Screen
      ...ALL_PERMISSIONS.screen,
      // Chat
      ...ALL_PERMISSIONS.chat,
      // Whiteboard
      ...ALL_PERMISSIONS.whiteboard,
      // Polls
      ...ALL_PERMISSIONS.polls,
      // Questions
      ...ALL_PERMISSIONS.questions,
      // Files
      ...ALL_PERMISSIONS.files,
      // Breakout
      ...ALL_PERMISSIONS.breakout,
      // Video
      ...ALL_PERMISSIONS.video,
      // Reactions
      { resource: 'reactions', action: 'send', description: 'Send reactions' },
    ],
  },
  
  facilitator: {
    name: 'facilitator',
    displayName: 'Facilitator',
    description: 'Can present, share screen, manage content, and moderate discussions',
    level: 60,
    color: 'text-green-500 border-green-500 bg-green-500/10',
    icon: 'Users',
    canAssign: ['presenter', 'participant'],
    permissions: [
      // Participants (view only)
      { resource: 'participants', action: 'view', description: 'View participant list' },
      { resource: 'participants', action: 'mute', description: 'Mute participants' },
      { resource: 'participants', action: 'spotlight', description: 'Spotlight participants' },
      // Roles (view only)
      { resource: 'roles', action: 'view', description: 'View participant roles' },
      // Screen
      ...ALL_PERMISSIONS.screen,
      // Chat
      { resource: 'chat', action: 'send', description: 'Send chat messages' },
      { resource: 'chat', action: 'sendPrivate', description: 'Send private messages' },
      { resource: 'chat', action: 'manage', description: 'Delete messages and manage chat' },
      // Whiteboard
      { resource: 'whiteboard', action: 'view', description: 'View whiteboard' },
      { resource: 'whiteboard', action: 'draw', description: 'Draw on whiteboard' },
      { resource: 'whiteboard', action: 'clear', description: 'Clear whiteboard' },
      { resource: 'whiteboard', action: 'manage', description: 'Manage whiteboard permissions' },
      // Polls
      { resource: 'polls', action: 'view', description: 'View polls' },
      { resource: 'polls', action: 'vote', description: 'Vote in polls' },
      { resource: 'polls', action: 'create', description: 'Create polls' },
      { resource: 'polls', action: 'manage', description: 'Edit and delete polls' },
      { resource: 'polls', action: 'viewResults', description: 'View poll results' },
      // Questions
      ...ALL_PERMISSIONS.questions,
      // Files
      ...ALL_PERMISSIONS.files,
      // Breakout (limited)
      { resource: 'breakout', action: 'view', description: 'View breakout rooms' },
      { resource: 'breakout', action: 'join', description: 'Join breakout rooms' },
      // Video
      ...ALL_PERMISSIONS.video,
      // Reactions
      { resource: 'reactions', action: 'send', description: 'Send reactions' },
    ],
  },
  
  moderator: {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Can manage chat, Q&A, and moderate participant interactions',
    level: 50,
    color: 'text-yellow-500 border-yellow-500 bg-yellow-500/10',
    icon: 'Shield',
    canAssign: ['participant'],
    permissions: [
      // Participants (view only)
      { resource: 'participants', action: 'view', description: 'View participant list' },
      { resource: 'participants', action: 'mute', description: 'Mute participants' },
      // Roles (view only)
      { resource: 'roles', action: 'view', description: 'View participant roles' },
      // Chat
      { resource: 'chat', action: 'send', description: 'Send chat messages' },
      { resource: 'chat', action: 'sendPrivate', description: 'Send private messages' },
      { resource: 'chat', action: 'manage', description: 'Delete messages and manage chat' },
      // Whiteboard (view only)
      { resource: 'whiteboard', action: 'view', description: 'View whiteboard' },
      // Polls
      { resource: 'polls', action: 'view', description: 'View polls' },
      { resource: 'polls', action: 'vote', description: 'Vote in polls' },
      { resource: 'polls', action: 'viewResults', description: 'View poll results' },
      // Questions
      { resource: 'questions', action: 'ask', description: 'Ask questions' },
      { resource: 'questions', action: 'upvote', description: 'Upvote questions' },
      { resource: 'questions', action: 'answer', description: 'Answer questions' },
      { resource: 'questions', action: 'manage', description: 'Manage Q&A' },
      // Files
      { resource: 'files', action: 'view', description: 'View shared files' },
      { resource: 'files', action: 'download', description: 'Download files' },
      // Breakout
      { resource: 'breakout', action: 'view', description: 'View breakout rooms' },
      { resource: 'breakout', action: 'join', description: 'Join breakout rooms' },
      // Reactions
      { resource: 'reactions', action: 'send', description: 'Send reactions' },
    ],
  },
  
  presenter: {
    name: 'presenter',
    displayName: 'Presenter',
    description: 'Can share screen and present content to participants',
    level: 40,
    color: 'text-orange-500 border-orange-500 bg-orange-500/10',
    icon: 'Monitor',
    canAssign: [],
    permissions: [
      // Participants (view only)
      { resource: 'participants', action: 'view', description: 'View participant list' },
      // Roles (view only)
      { resource: 'roles', action: 'view', description: 'View participant roles' },
      // Screen
      { resource: 'screen', action: 'share', description: 'Share screen' },
      // Chat
      { resource: 'chat', action: 'send', description: 'Send chat messages' },
      // Whiteboard (view only)
      { resource: 'whiteboard', action: 'view', description: 'View whiteboard' },
      { resource: 'whiteboard', action: 'draw', description: 'Draw on whiteboard' },
      // Polls
      { resource: 'polls', action: 'view', description: 'View polls' },
      { resource: 'polls', action: 'vote', description: 'Vote in polls' },
      // Questions
      { resource: 'questions', action: 'ask', description: 'Ask questions' },
      { resource: 'questions', action: 'upvote', description: 'Upvote questions' },
      // Files
      { resource: 'files', action: 'view', description: 'View shared files' },
      { resource: 'files', action: 'download', description: 'Download files' },
      // Breakout
      { resource: 'breakout', action: 'view', description: 'View breakout rooms' },
      { resource: 'breakout', action: 'join', description: 'Join breakout rooms' },
      // Reactions
      { resource: 'reactions', action: 'send', description: 'Send reactions' },
    ],
  },
  
  participant: {
    name: 'participant',
    displayName: 'Participant',
    description: 'Basic viewing and interaction permissions',
    level: 10,
    color: 'text-gray-500 border-gray-500 bg-gray-500/10',
    icon: 'User',
    canAssign: [],
    permissions: [
      // Participants (view only)
      { resource: 'participants', action: 'view', description: 'View participant list' },
      // Roles (view only)
      { resource: 'roles', action: 'view', description: 'View participant roles' },
      // Chat
      { resource: 'chat', action: 'send', description: 'Send chat messages' },
      // Whiteboard (view only)
      { resource: 'whiteboard', action: 'view', description: 'View whiteboard' },
      // Polls
      { resource: 'polls', action: 'view', description: 'View polls' },
      { resource: 'polls', action: 'vote', description: 'Vote in polls' },
      // Questions
      { resource: 'questions', action: 'ask', description: 'Ask questions' },
      { resource: 'questions', action: 'upvote', description: 'Upvote questions' },
      // Files
      { resource: 'files', action: 'view', description: 'View shared files' },
      { resource: 'files', action: 'download', description: 'Download files' },
      // Breakout
      { resource: 'breakout', action: 'view', description: 'View breakout rooms' },
      { resource: 'breakout', action: 'join', description: 'Join breakout rooms' },
      // Reactions
      { resource: 'reactions', action: 'send', description: 'Send reactions' },
    ],
  },
};

/**
 * Get role configuration by role name
 */
export function getRoleConfig(role: WorkshopRole): RoleConfig {
  return WORKSHOP_ROLES[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: WorkshopRole,
  resource: string,
  action: string
): boolean {
  const roleConfig = getRoleConfig(role);
  return roleConfig.permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: WorkshopRole): Permission[] {
  return getRoleConfig(role).permissions;
}

/**
 * Group a role's permissions by resource for easier UI consumption
 */
export function getPermissionsByResource(role: WorkshopRole): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  getRolePermissions(role).forEach((perm) => {
    (grouped[perm.resource] ||= []).push(perm);
  });
  return grouped;
}

/**
 * Check if roleA can assign roleB to others
 */
export function canAssignRole(
  assignerRole: WorkshopRole,
  targetRole: WorkshopRole
): boolean {
  const assignerConfig = getRoleConfig(assignerRole);
  return assignerConfig.canAssign.includes(targetRole);
}

/**
 * Get roles that can be assigned by a given role
 */
export function getAssignableRoles(role: WorkshopRole): WorkshopRole[] {
  return getRoleConfig(role).canAssign;
}

/**
 * Compare two roles by their level
 * Returns: 1 if role1 > role2, -1 if role1 < role2, 0 if equal
 */
export function compareRoles(role1: WorkshopRole, role2: WorkshopRole): number {
  const level1 = getRoleConfig(role1).level;
  const level2 = getRoleConfig(role2).level;
  return level1 > level2 ? 1 : level1 < level2 ? -1 : 0;
}

/**
 * Get all available roles sorted by level (highest first)
 */
export function getAllRolesSorted(): RoleConfig[] {
  return Object.values(WORKSHOP_ROLES).sort((a, b) => b.level - a.level);
}

/**
 * Default role for new participants
 */
export const DEFAULT_PARTICIPANT_ROLE: WorkshopRole = 'participant';

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<WorkshopRole, string> = {
  host: 'Has complete control over all workshop features and can manage all participants',
  'co-host': 'Can assist the host by managing participants, content, and session settings',
  facilitator: 'Can present content, manage discussions, and moderate participant activities',
  moderator: 'Focuses on managing chat, Q&A, and ensuring productive participant interactions',
  presenter: 'Limited to presenting content and sharing screen with basic interaction features',
  participant: 'Standard attendee with viewing and basic interaction capabilities',
};

/**
 * Validate if a role transition is allowed
 * @param assignerRole - The role of the person making the change
 * @param currentRole - The current role of the target participant
 * @param newRole - The desired new role
 * @returns Object with valid boolean and optional reason string
 */
export function validateRoleTransition(
  assignerRole: WorkshopRole,
  currentRole: WorkshopRole,
  newRole: WorkshopRole
): { valid: boolean; reason?: string } {
  const assignerConfig = getRoleConfig(assignerRole);
  const currentConfig = getRoleConfig(currentRole);
  const newConfig = getRoleConfig(newRole);

  // Can't assign if you don't have permission to assign the new role
  if (!canAssignRole(assignerRole, newRole)) {
    return {
      valid: false,
      reason: `${assignerConfig.displayName} cannot assign ${newConfig.displayName} role`
    };
  }

  // Can't demote someone with higher or equal level (unless you're host)
  if (assignerRole !== 'host' && currentConfig.level >= assignerConfig.level) {
    return {
      valid: false,
      reason: `Cannot change role of ${currentConfig.displayName} (equal or higher authority)`
    };
  }

  // Host can do anything
  if (assignerRole === 'host') {
    return { valid: true };
  }

  // Can't promote someone to your level or higher
  if (newConfig.level >= assignerConfig.level) {
    return {
      valid: false,
      reason: `Cannot promote to ${newConfig.displayName} (equal or higher than your level)`
    };
  }

  return { valid: true };
}