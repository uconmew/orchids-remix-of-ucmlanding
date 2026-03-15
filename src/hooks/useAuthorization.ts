"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/lib/auth-client";

export type RoleTag = 'admin' | 'staff' | 'convict';

export interface UserClearance {
  userId: string;
  roleId: number;
  roleName: string;
  staffTitle: string | null;
  permissionClearance: number;
  dutyClearance: number;
  roleTags: RoleTag[];
  isStaff: boolean;
  isLoading: boolean;
  error: boolean;
}

export interface ClearanceLevel {
  level: number;
  name: string;
  description: string;
  minClearance: number;
}

export const CLEARANCE_LEVELS: ClearanceLevel[] = [
  { level: 1, name: "Level 1 - Executive", description: "Full system access, can see and manage everything", minClearance: 90 },
  { level: 2, name: "Level 2 - Management", description: "Based on permissions and duty, can manage most areas", minClearance: 75 },
  { level: 3, name: "Level 3 - Supervisor", description: "Limited management based on assigned duties", minClearance: 50 },
  { level: 4, name: "Level 4 - Staff", description: "Basic access with assigned permissions only", minClearance: 25 },
  { level: 5, name: "Level 5 - Volunteer/Convict", description: "Minimal access, view only for assigned areas", minClearance: 0 },
];

// Dashboard visibility configuration based on clearance
export const DASHBOARD_VISIBILITY = {
  // Routes with required clearance levels
  "/admin": { minClearance: 0, label: "Dashboard" },
  "/admin/authorization": { minClearance: 75, label: "Authorization" },
  "/admin/roles": { minClearance: 75, label: "Roles & Permissions" },
  "/admin/staff": { minClearance: 50, label: "Staff Management" },
  "/admin/members": { minClearance: 25, label: "Convicts" },
  "/admin/workshops": { minClearance: 25, label: "Workshops" },
  "/admin/events": { minClearance: 25, label: "Events" },
  "/admin/prayers": { minClearance: 0, label: "Prayer Wall" },
  "/admin/outreach/transit": { minClearance: 25, label: "Transit Management" },
  "/admin/settings": { minClearance: 90, label: "Settings" },
};

// Actions that require specific clearance
export const ACTION_CLEARANCE = {
  // Staff Management
  addStaff: 75,
  editStaffClearance: 75,
  deleteStaff: 90,
  viewAllStaff: 25,
  
  // Role Management
  manageRoles: 75,
  managePermissions: 75,
  createRoles: 90,
  deleteRoles: 90,
  
  // Convict Management
  viewAllConvicts: 25,
  editConvictClearance: 50,
  deleteConvicts: 75,
  assignConvictPermissions: 50,
  
  // Workshop Management
  manageWorkshops: 50,
  hostWorkshops: 25,
  createWorkshops: 50,
  deleteWorkshops: 75,
  
  // Event Management
  manageEvents: 50,
  createEvents: 25,
  deleteEvents: 50,
  
  // Prayer Wall
  managePrayers: 25,
  deletePrayers: 50,
  
  // System Settings
  viewSettings: 90,
  editSettings: 90,
  viewSystemHealth: 75,
  viewSecurityAlerts: 75,
  viewAdvancedAnalytics: 90,
};

// Duty-based actions - what specific duties allow
export const DUTY_PERMISSIONS = {
  // HR/Hiring duties
  hrManagement: {
    requiredDutyClearance: 75,
    allowedActions: ["addStaff", "editStaffClearance", "viewAllStaff"],
  },
  // Workshop facilitation duties
  workshopFacilitation: {
    requiredDutyClearance: 25,
    allowedActions: ["hostWorkshops", "createWorkshops", "manageWorkshops"],
  },
  // Event coordination duties
  eventCoordination: {
    requiredDutyClearance: 25,
    allowedActions: ["createEvents", "manageEvents"],
  },
  // Outreach duties
  outreachCoordination: {
    requiredDutyClearance: 25,
    allowedActions: ["viewAllConvicts", "managePrayers"],
  },
  // Administrative duties
  administration: {
    requiredDutyClearance: 50,
    allowedActions: ["viewAllConvicts", "viewAllStaff", "manageWorkshops", "manageEvents"],
  },
  // Executive duties
  executive: {
    requiredDutyClearance: 90,
    allowedActions: Object.keys(ACTION_CLEARANCE),
  },
};

// Dashboard sections visibility configuration - based on permission clearance, duty clearance, and role tags (NOT level)
export const DASHBOARD_SECTIONS = {
  quickStats: { minPermissionClearance: 0, minDutyClearance: 0, title: "Quick Statistics", requiredTags: [] as RoleTag[] },
  memberDistribution: { minPermissionClearance: 0, minDutyClearance: 25, title: "Member Distribution", requiredTags: ['staff'] as RoleTag[] },
  recentActivity: { minPermissionClearance: 0, minDutyClearance: 0, title: "Recent Activity", requiredTags: [] as RoleTag[] },
  quickActions: { minPermissionClearance: 0, minDutyClearance: 0, title: "Quick Actions", requiredTags: [] as RoleTag[] },
  systemHealth: { minPermissionClearance: 75, minDutyClearance: 0, title: "System Health", requiredTags: ['admin'] as RoleTag[] },
  securityAlerts: { minPermissionClearance: 75, minDutyClearance: 0, title: "Security Alerts", requiredTags: ['admin'] as RoleTag[] },
  advancedAnalytics: { minPermissionClearance: 90, minDutyClearance: 0, title: "Advanced Analytics", requiredTags: ['admin'] as RoleTag[] },
};

// Stats visibility configuration - based on permission clearance, duty clearance, and role tags (NOT level)
export const STATS_VISIBILITY = {
  totalMembers: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[] },
  totalStaff: { minPermissionClearance: 50, minDutyClearance: 50, requiredTags: ['staff'] as RoleTag[] },
  activeRoles: { minPermissionClearance: 75, minDutyClearance: 0, requiredTags: ['admin'] as RoleTag[] },
  pendingApprovals: { minPermissionClearance: 50, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[] },
  totalConvicts: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[] },
  activeWorkshops: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[] },
  upcomingEvents: { minPermissionClearance: 0, minDutyClearance: 0, requiredTags: [] as RoleTag[] },
  prayerRequests: { minPermissionClearance: 0, minDutyClearance: 0, requiredTags: [] as RoleTag[] },
};

export function useAuthorization() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [clearance, setClearance] = useState<UserClearance>({
    userId: "",
    roleId: 0,
    roleName: "",
    staffTitle: null,
    permissionClearance: 0,
    dutyClearance: 0,
    roleTags: [],
    isStaff: false,
    isLoading: true,
    error: false,
  });

    useEffect(() => {
      const fetchClearance = async () => {
        // If we're still determining the session, don't do anything yet
        if (sessionLoading) return;

        if (!session?.user?.id) {
          console.log("No session user ID found, setting loading false");
          setClearance(prev => ({ ...prev, isLoading: false }));
          return;
        }

        console.log("Fetching clearance for user:", session.user.id);
        try {
          // Fetch user roles and role tags in parallel
          const [rolesResponse, tagsResponse] = await Promise.all([
            fetch(`/api/user-roles?userId=${session.user.id}`),
            fetch(`/api/role-tags?userId=${session.user.id}`)
          ]);
          
          let roleTags: RoleTag[] = [];
          if (tagsResponse.ok) {
            const tagsData = await tagsResponse.json();
            // API returns array of { id, userId, tag, ... } - extract just the tag names
            if (Array.isArray(tagsData)) {
              roleTags = tagsData.map((t: any) => t.tag?.toLowerCase() as RoleTag).filter(Boolean);
            } else if (tagsData.tags && Array.isArray(tagsData.tags)) {
              roleTags = tagsData.tags.map((t: any) => (typeof t === 'string' ? t : t.tag)?.toLowerCase() as RoleTag).filter(Boolean);
            }
          }
          
          if (rolesResponse.ok) {
            const data = await rolesResponse.json();
            console.log("User roles fetched:", data);
            if (data.length > 0) {
              // Get the highest clearance role for this user
              const highestClearance = data.reduce((max: any, curr: any) => {
                const currPermission = curr.permissionClearance || 0;
                const maxPermission = max?.permissionClearance || 0;
                return currPermission > maxPermission ? curr : max;
              }, null);

              setClearance({
                userId: session.user.id,
                roleId: highestClearance.roleId,
                roleName: highestClearance.roleName || highestClearance.role?.name || "Unknown",
                staffTitle: highestClearance.staffTitle,
                permissionClearance: highestClearance.permissionClearance || 0,
                dutyClearance: highestClearance.dutyClearance || 0,
                roleTags,
                isStaff: true,
                isLoading: false,
                error: false,
              });
            } else {
              console.log("User has no staff roles, assigning Convict role");
              // User has no staff role - they're a regular user/convict
              setClearance({
                userId: session.user.id,
                roleId: 0,
                roleName: "Convict",
                staffTitle: null,
                permissionClearance: 0,
                dutyClearance: 0,
                roleTags: roleTags.length > 0 ? roleTags : ['convict'],
                isStaff: false,
                isLoading: false,
                error: false,
              });
            }
          } else {
            console.error("Failed to fetch user roles:", rolesResponse.status);
            setClearance(prev => ({ ...prev, isLoading: false, error: true }));
          }
        } catch (error) {
          console.error("Error fetching clearance:", error);
          setClearance(prev => ({ ...prev, isLoading: false, error: true }));
        }
      };

      fetchClearance();
    }, [session?.user?.id, sessionLoading]);


  // Get clearance level info
  const getClearanceLevel = useCallback((permissionClearance: number): ClearanceLevel => {
    const level = CLEARANCE_LEVELS.find(l => permissionClearance >= l.minClearance);
    return level || CLEARANCE_LEVELS[CLEARANCE_LEVELS.length - 1];
  }, []);

  // Check if user can access a route
  const canAccessRoute = useCallback((route: string): boolean => {
    const config = DASHBOARD_VISIBILITY[route as keyof typeof DASHBOARD_VISIBILITY];
    if (!config) return true; // Allow unknown routes by default
    return clearance.permissionClearance >= config.minClearance;
  }, [clearance.permissionClearance]);

  // Check if user can perform an action (based on permission clearance)
  const canPerformAction = useCallback((action: keyof typeof ACTION_CLEARANCE): boolean => {
    const requiredClearance = ACTION_CLEARANCE[action];
    return clearance.permissionClearance >= requiredClearance;
  }, [clearance.permissionClearance]);

  // Check if user can perform an action based on duty clearance
  const canPerformDutyAction = useCallback((action: keyof typeof ACTION_CLEARANCE): boolean => {
    const requiredClearance = ACTION_CLEARANCE[action];
    // User can perform if they have sufficient permission OR duty clearance
    return clearance.permissionClearance >= requiredClearance || 
           clearance.dutyClearance >= requiredClearance;
  }, [clearance.permissionClearance, clearance.dutyClearance]);

  // Check if user has specific duty clearance
  const hasDutyClearance = useCallback((requiredDuty: number): boolean => {
    return clearance.dutyClearance >= requiredDuty;
  }, [clearance.dutyClearance]);

  // Check if user has a specific duty permission
  const hasDutyPermission = useCallback((dutyKey: keyof typeof DUTY_PERMISSIONS, action: string): boolean => {
    const dutyConfig = DUTY_PERMISSIONS[dutyKey];
    if (!dutyConfig) return false;
    
    // Check if user has required duty clearance AND action is in allowed list
    return clearance.dutyClearance >= dutyConfig.requiredDutyClearance &&
           dutyConfig.allowedActions.includes(action);
  }, [clearance.dutyClearance]);

  // Check if user has required role tags
  const hasRequiredTags = useCallback((requiredTags: RoleTag[]): boolean => {
    if (requiredTags.length === 0) return true;
    return requiredTags.every(tag => clearance.roleTags.includes(tag));
  }, [clearance.roleTags]);

  // Check if user has any of the specified role tags
  const hasAnyTag = useCallback((tags: RoleTag[]): boolean => {
    if (tags.length === 0) return true;
    return tags.some(tag => clearance.roleTags.includes(tag));
  }, [clearance.roleTags]);

  // Check if a dashboard section is visible (uses permission clearance + duty clearance + role tags - NOT level)
  const isSectionVisible = useCallback((sectionKey: keyof typeof DASHBOARD_SECTIONS): boolean => {
    const config = DASHBOARD_SECTIONS[sectionKey];
    const hasPermissionClearance = clearance.permissionClearance >= config.minPermissionClearance;
    const hasDutyClearance = clearance.dutyClearance >= config.minDutyClearance;
    const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => clearance.roleTags.includes(tag));
    // User needs (permission clearance OR duty clearance) AND must have required tags
    return (hasPermissionClearance || hasDutyClearance) && hasTags;
  }, [clearance.permissionClearance, clearance.dutyClearance, clearance.roleTags]);

  // Check if a stat is visible (uses permission clearance + duty clearance + role tags - NOT level)
  const isStatVisible = useCallback((statKey: keyof typeof STATS_VISIBILITY): boolean => {
    const config = STATS_VISIBILITY[statKey];
    const hasPermissionClearance = clearance.permissionClearance >= config.minPermissionClearance;
    const hasDuty = clearance.dutyClearance >= config.minDutyClearance;
    const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => clearance.roleTags.includes(tag));
    // User needs (permission clearance OR duty clearance) AND must have required tags
    return (hasPermissionClearance || hasDuty) && hasTags;
  }, [clearance.permissionClearance, clearance.dutyClearance, clearance.roleTags]);

  // Get visible navigation items for this user
  const getVisibleNavItems = useCallback(() => {
    return Object.entries(DASHBOARD_VISIBILITY)
      .filter(([_, config]) => clearance.permissionClearance >= config.minClearance)
      .map(([route, config]) => ({ route, label: config.label }));
  }, [clearance.permissionClearance]);

  // Get visible dashboard sections (uses permission clearance + duty clearance + role tags - NOT level)
  const getVisibleSections = useCallback(() => {
    return Object.entries(DASHBOARD_SECTIONS)
      .filter(([_, config]) => {
        const hasPermissionClearance = clearance.permissionClearance >= config.minPermissionClearance;
        const hasDutyClearance = clearance.dutyClearance >= config.minDutyClearance;
        const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => clearance.roleTags.includes(tag));
        return (hasPermissionClearance || hasDutyClearance) && hasTags;
      })
      .map(([key, config]) => ({ key, ...config }));
  }, [clearance.permissionClearance, clearance.dutyClearance, clearance.roleTags]);

  // Get visible stats (uses permission clearance + duty clearance + role tags - NOT level)
  const getVisibleStats = useCallback(() => {
    return Object.entries(STATS_VISIBILITY)
      .filter(([_, config]) => {
        const hasPermissionClearance = clearance.permissionClearance >= config.minPermissionClearance;
        const hasDuty = clearance.dutyClearance >= config.minDutyClearance;
        const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => clearance.roleTags.includes(tag));
        return (hasPermissionClearance || hasDuty) && hasTags;
      })
      .map(([key]) => key);
  }, [clearance.permissionClearance, clearance.dutyClearance, clearance.roleTags]);

  // Get allowed actions for user
  const getAllowedActions = useCallback(() => {
    return Object.entries(ACTION_CLEARANCE)
      .filter(([_, requiredClearance]) => 
        clearance.permissionClearance >= requiredClearance || 
        clearance.dutyClearance >= requiredClearance
      )
      .map(([action]) => action);
  }, [clearance.permissionClearance, clearance.dutyClearance]);

  // Check if user can assign a specific clearance level
  const canAssignClearance = useCallback((targetClearance: number): boolean => {
    // Users can only assign clearance levels equal to or below their own
    return clearance.permissionClearance >= targetClearance;
  }, [clearance.permissionClearance]);

  // Get max clearance user can assign
  const maxAssignableClearance = useMemo(() => {
    return clearance.permissionClearance;
  }, [clearance.permissionClearance]);

  // Current clearance level
  const currentLevel = useMemo(() => {
    return getClearanceLevel(clearance.permissionClearance);
  }, [clearance.permissionClearance, getClearanceLevel]);

  // Check if user has override authority over a target user
  const hasOverrideAuthority = useCallback((targetTags: string[]): boolean => {
    // Executive can override anyone
    if (clearance.roleTags.includes('executive')) return true;
    
    // Director can override coordinator, staff, volunteer
    if (clearance.roleTags.includes('director')) {
      return !targetTags.includes('executive') && !targetTags.includes('director');
    }
    
    // Coordinator can override staff, volunteer (within program scope)
    if (clearance.roleTags.includes('coordinator')) {
      return !targetTags.includes('executive') && 
             !targetTags.includes('director') && 
             !targetTags.includes('coordinator');
    }
    
    return false;
  }, [clearance.roleTags]);

  return {
    ...clearance,
    sessionLoading,
    getClearanceLevel,
    canAccessRoute,
    canPerformAction,
    canPerformDutyAction,
    hasDutyClearance,
    hasDutyPermission,
    hasRequiredTags,
    hasAnyTag,
    isSectionVisible,
    isStatVisible,
    getVisibleNavItems,
    getVisibleSections,
    getVisibleStats,
    getAllowedActions,
    canAssignClearance,
    maxAssignableClearance,
    currentLevel,
    hasOverrideAuthority,
  };
}

export default useAuthorization;