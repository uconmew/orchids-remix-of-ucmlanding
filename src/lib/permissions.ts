/**
 * UCon Ministries Permission System
 * 
 * Provides utilities for checking user permissions and roles
 * across the ministry management platform.
 * 
 * Function-Based Access Model:
 * - Permissions align with actual job functions, not just titles
 * - If you don't facilitate sessions, you don't get moderator permissions
 * - If you're not taking attendance, you don't get attendance system access
 * 
 * Privacy & Legal Compliance:
 * - Mental health permissions follow HIPAA-style confidentiality
 * - Pastoral permissions maintain clergy-penitent privilege standards
 * - All sensitive data access requires explicit duty assignment
 */

export type ResourceType = 
  | 'members'
  | 'convicts'  // Registered users (pastoral, outreach, volunteer, staff)
  | 'workshops'
  | 'sessions'  // Session engagement, facilitation, moderation
  | 'attendance' // Attendance tracking system
  | 'outreach'
  | 'volunteers'
  | 'events'
  | 'content'
  | 'prayers'
  | 'system'
  // NEW: Ministry-specific duty resources
  | 'ministry'      // General ministry support and coordination
  | 'pastoral'      // Pastoral care - counseling, spiritual guidance, crisis support
  | 'mental_health' // Mental health support - privacy-compliant, law-abiding
  // NEW: Program Permission Categories (10 programs)
  | 'transit'       // UCON TRANSIT - Transportation services
  | 'nourish'       // UCON NOURISH - Food distribution
  | 'haven'         // UCON HAVEN - Housing & shelter
  | 'voice'         // UCON VOICE - Advocacy & justice
  | 'neighbors'     // UCON NEIGHBORS - Community engagement
  | 'steps'         // UCON STEPS - 12-step recovery
  | 'awaken'        // UCON AWAKEN - Bible studies
  | 'shepherd'      // UCON SHEPHERD - Pastoral care (program)
  | 'equip'         // UCON EQUIP - Workshops & skills
  | 'bridge';       // UCON BRIDGE - Mentorship

export type ActionType = 
  // General CRUD
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  // Workshop/Session specific
  | 'manage_participants'
  | 'host'
  // Session-specific function-based actions
  | 'engage'      // Participate in sessions (all Convicts)
  | 'facilitate'  // Lead/facilitate a session (assigned facilitators only)
  | 'moderate'    // Moderate chat, mute users, manage breakout rooms (facilitators + mods)
  // Attendance-specific actions
  | 'view_attendance'   // See attendance records
  | 'take_attendance'   // Mark attendance
  | 'manage_attendance' // Export, analyze, modify attendance
  // Outreach-specific actions
  | 'coordinate'
  | 'field_work'        // NEW: On-the-ground outreach activities
  | 'resource_distribution' // NEW: Distribute food, supplies, etc.
  | 'community_liaison' // NEW: Interface with community partners
  // Volunteer management
  | 'review'
  | 'approve'
  | 'assign'
  // Events
  | 'manage_registrations'
  // Content
  | 'publish'
  // Prayers
  | 'reply'
  // System administration
  | 'manage_roles'
  | 'manage_permissions'
  | 'view_analytics'
  | 'manage_settings'
  // NEW: Ministry-specific actions
  | 'support'           // Provide general ministry support
  | 'teach'             // Teach/instruct in ministry context
  | 'disciple'          // One-on-one discipleship
  // NEW: Pastoral-specific actions (confidential)
  | 'counsel'           // Provide pastoral counseling
  | 'pray_support'      // Dedicated prayer support ministry
  | 'crisis_intervention' // Crisis response and intervention
  | 'spiritual_guidance'  // Spiritual direction and guidance
  | 'visit'             // Hospital/home visits
  | 'sacramental'       // Sacramental duties (communion, baptism prep)
  // NEW: Mental health-specific actions (privacy-compliant, law-abiding)
  | 'assess'            // Initial mental health screening (non-clinical)
  | 'peer_support'      // Peer support (trained, non-licensed)
  | 'refer'             // Refer to licensed professionals
  | 'document_confidential' // Document with strict privacy controls
  | 'safety_plan'       // Crisis safety planning
  | 'resource_connect'  // Connect to mental health resources
  // NEW: Program-specific actions (aligned with point system)
  | 'request'           // Submit requests (Convict level - 0 points)
  | 'register'          // Register for services (Convict level - 0 points)
  | 'view_own'          // View own records (Convict level - 0 points)
  | 'dispatch'          // Dispatch/assign (Staff level - 40+ points)
  | 'manage_inventory'  // Manage inventory (Staff level - 35+ points)
  | 'manage_cases'      // Case management (Staff level - 45+ points)
  | 'lead_meeting'      // Lead meetings/groups (Volunteer level - 20+ points)
  | 'mentor'            // Mentor others (Volunteer level - 25+ points)
  | 'generate_reports'; // Generate reports (Staff level - 40+ points)

export interface Permission {
  id: number;
  roleId: number;
  resource: string;
  action: string;
  createdAt: string;
}

export interface UserRole {
  id: number;
  userId: string;
  roleId: number;
  staffTitle: string | null;
  assignedAt: string;
  assignedBy: string | null;
  roleName: string;
  roleDescription: string | null;
  roleLevel: number;
}

/**
 * Check if user has a specific permission
 * 
 * @param userId - The user ID to check
 * @param resource - The resource type (e.g., 'members', 'workshops')
 * @param action - The action type (e.g., 'read', 'create')
 * @param token - Bearer token for authentication
 * @returns Promise<boolean> - True if user has permission
 */
export async function checkPermission(
  userId: string,
  resource: ResourceType,
  action: ActionType,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/role-permissions/check?userId=${userId}&resource=${resource}&action=${action}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasPermission === true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Get all roles assigned to a user
 * 
 * @param userId - The user ID to query
 * @param token - Bearer token for authentication
 * @returns Promise<UserRole[]> - Array of user roles with details
 */
export async function getUserRoles(
  userId: string,
  token: string
): Promise<UserRole[]> {
  try {
    const response = await fetch(
      `/api/user-roles?userId=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get user roles:', error);
    return [];
  }
}

/**
 * Get all permissions for a specific role
 * 
 * @param roleId - The role ID to query
 * @param token - Bearer token for authentication
 * @returns Promise<Permission[]> - Array of permissions
 */
export async function getRolePermissions(
  roleId: number,
  token: string
): Promise<Permission[]> {
  try {
    const response = await fetch(
      `/api/role-permissions?roleId=${roleId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch role permissions');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get role permissions:', error);
    return [];
  }
}

/**
 * Check if user has any of the specified roles
 * 
 * @param userId - The user ID to check
 * @param roleNames - Array of role names to check against
 * @param token - Bearer token for authentication
 * @returns Promise<boolean> - True if user has any of the roles
 */
export async function hasAnyRole(
  userId: string,
  roleNames: string[],
  token: string
): Promise<boolean> {
  try {
    const userRoles = await getUserRoles(userId, token);
    return userRoles.some(role => roleNames.includes(role.roleName));
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * Get the highest level role for a user (1 = highest authority)
 * 
 * @param userId - The user ID to check
 * @param token - Bearer token for authentication
 * @returns Promise<UserRole | null> - Highest level role or null
 */
export async function getHighestRole(
  userId: string,
  token: string
): Promise<UserRole | null> {
  try {
    const userRoles = await getUserRoles(userId, token);
    if (userRoles.length === 0) return null;
    
    // Sort by level (1 is highest)
    userRoles.sort((a, b) => a.roleLevel - b.roleLevel);
    return userRoles[0];
  } catch (error) {
    console.error('Failed to get highest role:', error);
    return null;
  }
}

/**
 * Role level definitions
 */
export const ROLE_LEVELS = {
  EXECUTIVE_LEADERSHIP: 1,
  PROGRAM_DIRECTORS: 2,
  MINISTRY_COORDINATORS: 3,
  STAFF_MEMBERS: 4,
  VOLUNTEERS: 5,
} as const;

/**
 * Role name constants
 */
export const ROLES = {
  EXECUTIVE_LEADERSHIP: 'Executive Leadership',
  PROGRAM_DIRECTORS: 'Program Directors',
  MINISTRY_COORDINATORS: 'Ministry Coordinators',
  STAFF_MEMBERS: 'Staff Members',
  VOLUNTEERS: 'Volunteers',
} as const;

/**
 * Check if user's highest role level meets minimum requirement
 * 
 * @param userId - The user ID to check
 * @param minimumLevel - Minimum role level required (1 = highest)
 * @param token - Bearer token for authentication
 * @returns Promise<boolean> - True if user meets level requirement
 */
export async function meetsRoleLevel(
  userId: string,
  minimumLevel: number,
  token: string
): Promise<boolean> {
  try {
    const highestRole = await getHighestRole(userId, token);
    if (!highestRole) return false;
    
    // Lower number = higher authority
    return highestRole.roleLevel <= minimumLevel;
  } catch (error) {
    console.error('Role level check failed:', error);
    return false;
  }
}

/**
 * Permission groups for common operations
 * Function-based: Only get permissions you actually need for your duties
 */
export const PERMISSION_GROUPS = {
  // NEW: Ministry support duties
  MINISTRY_SUPPORT: [
    { resource: 'ministry' as ResourceType, action: 'read' as ActionType },
    { resource: 'ministry' as ResourceType, action: 'support' as ActionType },
  ],
  
  MINISTRY_TEACHING: [
    { resource: 'ministry' as ResourceType, action: 'read' as ActionType },
    { resource: 'ministry' as ResourceType, action: 'support' as ActionType },
    { resource: 'ministry' as ResourceType, action: 'teach' as ActionType },
  ],
  
  MINISTRY_DISCIPLESHIP: [
    { resource: 'ministry' as ResourceType, action: 'read' as ActionType },
    { resource: 'ministry' as ResourceType, action: 'support' as ActionType },
    { resource: 'ministry' as ResourceType, action: 'disciple' as ActionType },
  ],
  
  // NEW: Outreach field duties
  OUTREACH_FIELD: [
    { resource: 'outreach' as ResourceType, action: 'read' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'field_work' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'resource_distribution' as ActionType },
  ],
  
  OUTREACH_COORDINATION: [
    { resource: 'outreach' as ResourceType, action: 'read' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'create' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'coordinate' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'community_liaison' as ActionType },
  ],
  
  // NEW: Pastoral care duties (confidential)
  PASTORAL_PRAYER: [
    { resource: 'pastoral' as ResourceType, action: 'read' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'pray_support' as ActionType },
  ],
  
  PASTORAL_VISITATION: [
    { resource: 'pastoral' as ResourceType, action: 'read' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'pray_support' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'visit' as ActionType },
  ],
  
  PASTORAL_COUNSELING: [
    { resource: 'pastoral' as ResourceType, action: 'read' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'counsel' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'crisis_intervention' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'spiritual_guidance' as ActionType },
  ],
  
  PASTORAL_FULL: [
    { resource: 'pastoral' as ResourceType, action: 'read' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'counsel' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'pray_support' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'crisis_intervention' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'spiritual_guidance' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'visit' as ActionType },
    { resource: 'pastoral' as ResourceType, action: 'sacramental' as ActionType },
  ],
  
  // NEW: Mental health duties (privacy-compliant, law-abiding)
  MENTAL_HEALTH_PEER_SUPPORT: [
    { resource: 'mental_health' as ResourceType, action: 'read' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'peer_support' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'resource_connect' as ActionType },
  ],
  
  MENTAL_HEALTH_SCREENING: [
    { resource: 'mental_health' as ResourceType, action: 'read' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'assess' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'refer' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'resource_connect' as ActionType },
  ],
  
  MENTAL_HEALTH_CRISIS: [
    { resource: 'mental_health' as ResourceType, action: 'read' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'assess' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'peer_support' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'safety_plan' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'refer' as ActionType },
  ],
  
  MENTAL_HEALTH_COORDINATOR: [
    { resource: 'mental_health' as ResourceType, action: 'read' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'assess' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'peer_support' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'refer' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'document_confidential' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'safety_plan' as ActionType },
    { resource: 'mental_health' as ResourceType, action: 'resource_connect' as ActionType },
  ],
  
  // Convict (member) management
  CONVICT_MANAGEMENT: [
    { resource: 'convicts' as ResourceType, action: 'read' as ActionType },
    { resource: 'convicts' as ResourceType, action: 'create' as ActionType },
    { resource: 'convicts' as ResourceType, action: 'update' as ActionType },
  ],
  // Legacy member management (for backwards compatibility)
  MEMBER_MANAGEMENT: [
    { resource: 'members' as ResourceType, action: 'read' as ActionType },
    { resource: 'members' as ResourceType, action: 'create' as ActionType },
    { resource: 'members' as ResourceType, action: 'update' as ActionType },
  ],
  
  // Session engagement - for participants only
  SESSION_ENGAGEMENT: [
    { resource: 'sessions' as ResourceType, action: 'engage' as ActionType },
  ],
  
  // Session facilitation - for facilitators who lead sessions
  SESSION_FACILITATION: [
    { resource: 'sessions' as ResourceType, action: 'engage' as ActionType },
    { resource: 'sessions' as ResourceType, action: 'facilitate' as ActionType },
  ],
  
  // Session moderation - for facilitators + mods
  SESSION_MODERATION: [
    { resource: 'sessions' as ResourceType, action: 'engage' as ActionType },
    { resource: 'sessions' as ResourceType, action: 'facilitate' as ActionType },
    { resource: 'sessions' as ResourceType, action: 'moderate' as ActionType },
  ],
  
  // Attendance viewing - for those who need to see records
  ATTENDANCE_VIEWING: [
    { resource: 'attendance' as ResourceType, action: 'view_attendance' as ActionType },
  ],
  
  // Attendance taking - for staff who mark attendance
  ATTENDANCE_TAKING: [
    { resource: 'attendance' as ResourceType, action: 'view_attendance' as ActionType },
    { resource: 'attendance' as ResourceType, action: 'take_attendance' as ActionType },
  ],
  
  // Attendance management - full control over attendance system
  ATTENDANCE_MANAGEMENT: [
    { resource: 'attendance' as ResourceType, action: 'view_attendance' as ActionType },
    { resource: 'attendance' as ResourceType, action: 'take_attendance' as ActionType },
    { resource: 'attendance' as ResourceType, action: 'manage_attendance' as ActionType },
  ],
  
  WORKSHOP_COORDINATION: [
    { resource: 'workshops' as ResourceType, action: 'create' as ActionType },
    { resource: 'workshops' as ResourceType, action: 'update' as ActionType },
    { resource: 'workshops' as ResourceType, action: 'manage_participants' as ActionType },
  ],
  OUTREACH_OPERATIONS: [
    { resource: 'outreach' as ResourceType, action: 'read' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'create' as ActionType },
    { resource: 'outreach' as ResourceType, action: 'coordinate' as ActionType },
  ],
  VOLUNTEER_MANAGEMENT: [
    { resource: 'volunteers' as ResourceType, action: 'read' as ActionType },
    { resource: 'volunteers' as ResourceType, action: 'review' as ActionType },
    { resource: 'volunteers' as ResourceType, action: 'approve' as ActionType },
  ],
  SYSTEM_ADMINISTRATION: [
    { resource: 'system' as ResourceType, action: 'manage_roles' as ActionType },
    { resource: 'system' as ResourceType, action: 'manage_permissions' as ActionType },
    { resource: 'system' as ResourceType, action: 'manage_settings' as ActionType },
  ],
} as const;

/**
 * Check if user has all permissions in a group
 * 
 * @param userId - The user ID to check
 * @param groupName - Permission group name
 * @param token - Bearer token for authentication
 * @returns Promise<boolean> - True if user has all permissions
 */
export async function hasPermissionGroup(
  userId: string,
  groupName: keyof typeof PERMISSION_GROUPS,
  token: string
): Promise<boolean> {
  try {
    const permissions = PERMISSION_GROUPS[groupName];
    const checks = await Promise.all(
      permissions.map(p => checkPermission(userId, p.resource, p.action, token))
    );
    return checks.every(hasPermission => hasPermission === true);
  } catch (error) {
    console.error('Permission group check failed:', error);
    return false;
  }
}

/**
 * Function-Based Permission Helpers
 * These help enforce the principle that permissions align with actual duties
 */

/**
 * Check if user can facilitate sessions (lead/teach)
 */
export async function canFacilitateSessions(
  userId: string,
  token: string
): Promise<boolean> {
  return checkPermission(userId, 'sessions', 'facilitate', token);
}

/**
 * Check if user can moderate sessions (chat, mute, breakout rooms)
 */
export async function canModerateSessions(
  userId: string,
  token: string
): Promise<boolean> {
  return checkPermission(userId, 'sessions', 'moderate', token);
}

/**
 * Check if user can take attendance
 */
export async function canTakeAttendance(
  userId: string,
  token: string
): Promise<boolean> {
  return checkPermission(userId, 'attendance', 'take_attendance', token);
}

/**
 * Check if user can view attendance records
 */
export async function canViewAttendance(
  userId: string,
  token: string
): Promise<boolean> {
  return checkPermission(userId, 'attendance', 'view_attendance', token);
}

/**
 * Resource descriptions for UI display
 */
export const RESOURCE_DESCRIPTIONS: Record<ResourceType, string> = {
  members: 'Member records and profiles (legacy)',
  convicts: 'Registered Convicts - pastoral, outreach, volunteer, staff',
  workshops: 'Workshop creation and management',
  sessions: 'Session engagement, facilitation, and moderation',
  attendance: 'Attendance tracking and management',
  outreach: 'Community outreach, advocacy, and first responder services',
  volunteers: 'Volunteer applications and assignments',
  events: 'Event creation and registrations',
  content: 'Blog posts and content publishing',
  prayers: 'Prayer wall moderation and responses',
  system: 'System settings, roles, and permissions',
  // NEW: Ministry duty resources
  ministry: 'General ministry support, teaching, and discipleship',
  pastoral: 'Pastoral care - counseling, spiritual guidance, and crisis support (confidential)',
  mental_health: 'Mental health peer support and referrals (privacy-compliant, law-abiding)',
  // NEW: Program Permission Categories (10 programs)
  transit: 'UCON TRANSIT - Transportation services (Track 3 Outreach)',
  nourish: 'UCON NOURISH - Food distribution and pantry (Track 3 Outreach)',
  haven: 'UCON HAVEN - Housing assistance and shelter (Track 3 Outreach)',
  voice: 'UCON VOICE - Advocacy and justice work (Track 3 Outreach)',
  neighbors: 'UCON NEIGHBORS - Community engagement (Track 3 Outreach)',
  steps: 'UCON STEPS - 12-step recovery program (Track 3 Outreach)',
  awaken: 'UCON AWAKEN - Bible studies and spiritual formation (Track 2 Open Services)',
  shepherd: 'UCON SHEPHERD - Pastoral care program (Track 2 Open Services)',
  equip: 'UCON EQUIP - Workshops and skills training (Track 2 Open Services)',
  bridge: 'UCON BRIDGE - Mentorship and peer support (Track 2 Open Services)',
};

/**
 * Action descriptions for UI display
 */
export const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  read: 'View records',
  create: 'Create new records',
  update: 'Edit existing records',
  delete: 'Remove records',
  export: 'Export data',
  manage_participants: 'Manage workshop participants',
  host: 'Host workshops/sessions',
  engage: 'Participate in sessions',
  facilitate: 'Lead/facilitate sessions',
  moderate: 'Moderate chat, mute users, manage breakout rooms',
  view_attendance: 'View attendance records',
  take_attendance: 'Mark attendance',
  manage_attendance: 'Export, analyze, modify attendance',
  coordinate: 'Coordinate outreach activities',
  field_work: 'Conduct on-the-ground outreach activities',
  resource_distribution: 'Distribute food, supplies, and resources',
  community_liaison: 'Interface with community partners and organizations',
  review: 'Review applications',
  approve: 'Approve applications',
  assign: 'Assign volunteers to tasks',
  manage_registrations: 'Manage event registrations',
  publish: 'Publish content',
  reply: 'Reply to prayers',
  manage_roles: 'Manage user roles',
  manage_permissions: 'Manage role permissions',
  view_analytics: 'View system analytics',
  manage_settings: 'Manage system settings',
  // NEW: Ministry actions
  support: 'Provide general ministry support and assistance',
  teach: 'Teach and instruct in ministry context',
  disciple: 'Conduct one-on-one discipleship relationships',
  // NEW: Pastoral actions (confidential)
  counsel: 'Provide confidential pastoral counseling',
  pray_support: 'Dedicated intercessory prayer support',
  crisis_intervention: 'Respond to spiritual/emotional crisis situations',
  spiritual_guidance: 'Provide spiritual direction and guidance',
  visit: 'Conduct hospital, home, or facility visits',
  sacramental: 'Perform sacramental duties (communion, baptism prep)',
  // NEW: Mental health actions (privacy-compliant)
  assess: 'Conduct initial mental health screenings (non-clinical)',
  peer_support: 'Provide trained peer support (non-licensed)',
  refer: 'Refer to licensed mental health professionals',
  document_confidential: 'Document with strict privacy controls',
  safety_plan: 'Assist with crisis safety planning',
  resource_connect: 'Connect individuals to mental health resources',
  // NEW: Program-specific actions (aligned with clearance point system)
  request: 'Submit service requests (Convict - 0 pts)',
  register: 'Register for programs/services (Convict - 0 pts)',
  view_own: 'View own records and history (Convict - 0 pts)',
  dispatch: 'Dispatch and assign resources (Staff - 40+ pts)',
  manage_inventory: 'Manage program inventory (Staff - 35+ pts)',
  manage_cases: 'Full case management access (Staff - 45+ pts)',
  lead_meeting: 'Lead meetings and groups (Volunteer - 20+ pts)',
  mentor: 'Mentor program participants (Volunteer - 25+ pts)',
  generate_reports: 'Generate analytics reports (Staff - 40+ pts)',
};