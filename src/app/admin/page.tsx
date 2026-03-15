"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, Shield, BookOpen, Calendar, Heart, TrendingUp, UserCog, AlertCircle, 
  Loader2, Search, Lock, Crown, Eye, EyeOff, Settings, FileText, Activity,
  BarChart3, Bell, Zap, Database, Key, ShieldCheck, AlertTriangle, Wrench
} from "lucide-react";
import { toast } from "sonner";
import { useAuthorization, ACTION_CLEARANCE, CLEARANCE_LEVELS, DASHBOARD_VISIBILITY, RoleTag } from "@/hooks/useAuthorization";
import { ERROR_CODES } from "@/lib/error-codes";

function showErrorWithCode(code: string, reason?: string, missingTag?: string) {
  const errorDef = ERROR_CODES[code];
  const baseMessage = errorDef?.userFriendlyMessage || 'An error occurred';
  const tagInfo = missingTag ? ` (couldn't verify [${missingTag}] tag)` : '';
  const reasonText = reason ? ` (Reason: ${reason}${tagInfo})` : tagInfo ? ` (Reason: ${tagInfo.slice(2, -1)})` : '';
  const fullMessage = `${baseMessage}${reasonText}`;
  toast.error(`[${code}] ${fullMessage}`, { duration: 8000 });
}

interface DashboardStats {
  totalMembers: number;
  workshopParticipants: number;
  outreachParticipants: number;
  volunteers: number;
  newsletterSubscribers: number;
  totalStaff: number;
  activeRoles: number;
  pendingApprovals: number;
  totalConvicts: number;
  activeWorkshops: number;
  upcomingEvents: number;
  prayerRequests: number;
}

// Define which stats are visible based on permission clearance, duty clearance, and role tags (NOT level)
const STATS_VISIBILITY = {
  totalMembers: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[], icon: Users, color: "bg-[#A92FFA]" },
  totalStaff: { minPermissionClearance: 50, minDutyClearance: 50, requiredTags: ['staff'] as RoleTag[], icon: UserCog, color: "bg-[#F28C28]" },
  activeRoles: { minPermissionClearance: 75, minDutyClearance: 0, requiredTags: ['admin'] as RoleTag[], icon: Shield, color: "bg-[#A92FFA]" },
  pendingApprovals: { minPermissionClearance: 50, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[], icon: AlertCircle, color: "bg-[#F28C28]" },
  totalConvicts: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[], icon: Users, color: "bg-purple-500" },
  activeWorkshops: { minPermissionClearance: 0, minDutyClearance: 25, requiredTags: ['staff'] as RoleTag[], icon: BookOpen, color: "bg-blue-500" },
  upcomingEvents: { minPermissionClearance: 0, minDutyClearance: 0, requiredTags: [] as RoleTag[], icon: Calendar, color: "bg-green-500" },
  prayerRequests: { minPermissionClearance: 0, minDutyClearance: 0, requiredTags: [] as RoleTag[], icon: Heart, color: "bg-pink-500" },
};

// Define quick actions with permission clearance, duty clearance, and role tag requirements (NOT level)
const QUICK_ACTIONS = [
  {
    href: "/staff/tools",
    icon: Wrench,
    title: "Staff Tools",
    description: "Access permission-based tools",
    minPermissionClearance: 0,
    minDutyClearance: 0,
    requiredTags: [] as RoleTag[],
    badge: "All Staff",
  },
  {
    href: "/admin/members",
    icon: Users,
    title: "Manage Convicts",
    description: "View and manage community members",
    minPermissionClearance: 0,
    minDutyClearance: 25,
    requiredTags: ['staff'] as RoleTag[],
    badge: "Staff",
  },
  {
    href: "/admin/staff",
    icon: UserCog,
    title: "Staff Management",
    description: "Manage staff roles and clearances",
    minPermissionClearance: 50,
    minDutyClearance: 50,
    requiredTags: ['staff'] as RoleTag[],
    badge: "Staff",
  },
  {
    href: "/admin/authorization",
    icon: Lock,
    title: "Authorization Center",
    description: "Manage permissions and clearances",
    minPermissionClearance: 75,
    minDutyClearance: 0,
    requiredTags: ['admin'] as RoleTag[],
    badge: "Admin",
  },
  {
    href: "/admin/roles",
    icon: Shield,
    title: "Roles & Permissions",
    description: "Configure system roles",
    minPermissionClearance: 75,
    minDutyClearance: 0,
    requiredTags: ['admin'] as RoleTag[],
    badge: "Admin",
  },
  {
    href: "/admin/workshops",
    icon: BookOpen,
    title: "Workshop Management",
    description: "Create and manage workshops",
    minPermissionClearance: 0,
    minDutyClearance: 25,
    requiredTags: ['staff'] as RoleTag[],
    badge: "Staff",
  },
  {
    href: "/admin/events",
    icon: Calendar,
    title: "Event Management",
    description: "Schedule ministry events",
    minPermissionClearance: 0,
    minDutyClearance: 25,
    requiredTags: ['staff'] as RoleTag[],
    badge: "Staff",
  },
  {
    href: "/admin/prayers",
    icon: Heart,
    title: "Prayer Wall",
    description: "View and manage prayer requests",
    minPermissionClearance: 0,
    minDutyClearance: 0,
    requiredTags: [] as RoleTag[],
    badge: "All Staff",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "System Settings",
    description: "Configure system settings",
    minPermissionClearance: 90,
    minDutyClearance: 0,
    requiredTags: ['admin'] as RoleTag[],
    badge: "Admin",
  },
  {
    href: "/auth-status",
    icon: Search,
    title: "Auth Status Tool",
    description: "Check user authentication status",
    minPermissionClearance: 75,
    minDutyClearance: 0,
    requiredTags: ['admin'] as RoleTag[],
    badge: "Admin",
  },
];

// Dashboard sections with permission clearance, duty clearance, and role tag requirements (NOT level)
const DASHBOARD_SECTIONS = {
  quickStats: { minPermissionClearance: 0, minDutyClearance: 0, title: "Quick Statistics", requiredTags: [] as RoleTag[] },
  memberDistribution: { minPermissionClearance: 0, minDutyClearance: 25, title: "Member Distribution", requiredTags: ['staff'] as RoleTag[] },
  recentActivity: { minPermissionClearance: 0, minDutyClearance: 0, title: "Recent Activity", requiredTags: [] as RoleTag[] },
  quickActions: { minPermissionClearance: 0, minDutyClearance: 0, title: "Quick Actions", requiredTags: [] as RoleTag[] },
  systemHealth: { minPermissionClearance: 75, minDutyClearance: 0, title: "System Health", requiredTags: ['admin'] as RoleTag[] },
  securityAlerts: { minPermissionClearance: 75, minDutyClearance: 0, title: "Security Alerts", requiredTags: ['admin'] as RoleTag[] },
  advancedAnalytics: { minPermissionClearance: 90, minDutyClearance: 0, title: "Advanced Analytics", requiredTags: ['admin'] as RoleTag[] },
};

export default function AdminDashboard() {
  const router = useRouter();
  const {
    userId,
    roleName,
    staffTitle,
    permissionClearance,
    dutyClearance,
    roleTags,
    isStaff,
    isLoading: authLoading,
    error: authError,
    sessionLoading,
    canAccessRoute,
    canPerformAction,
    currentLevel,
    getClearanceLevel,
  } = useAuthorization();

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    workshopParticipants: 0,
    outreachParticipants: 0,
    volunteers: 0,
    newsletterSubscribers: 0,
    totalStaff: 0,
    activeRoles: 5,
    pendingApprovals: 0,
    totalConvicts: 0,
    activeWorkshops: 0,
    upcomingEvents: 0,
    prayerRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Check staff-session and admin-session from both cookies AND localStorage
  // localStorage is used as fallback for iframe environments where third-party cookies may be blocked
  const [hasStaffSession, setHasStaffSession] = useState<boolean | null>(null);
  const [hasAdminSession, setHasAdminSession] = useState<boolean | null>(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [systemAdminCheckComplete, setSystemAdminCheckComplete] = useState(false);
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Check cookies first
      const cookieStaffSession = document.cookie.split(';').some(c => c.trim().startsWith('staff-session=true'));
      const cookieAdminSession = document.cookie.split(';').some(c => c.trim().startsWith('admin-session=true'));
      
      // Also check localStorage as fallback for iframe environments
      const localStaffSession = typeof localStorage !== 'undefined' && localStorage.getItem('staff-session') === 'true';
      const localAdminSession = typeof localStorage !== 'undefined' && localStorage.getItem('admin-session') === 'true';
      
      // Use either source
      setHasStaffSession(cookieStaffSession || localStaffSession);
      setHasAdminSession(cookieAdminSession || localAdminSession);
    }
  }, []);
  
  useEffect(() => {
    const checkSystemAdmin = async () => {
      if (!userId) {
        setSystemAdminCheckComplete(true);
        return;
      }
      try {
        const response = await fetch(`/api/users/lookup?userId=${userId}`);
        if (response.ok) {
          const userData = await response.json();
          const email = userData.email?.toLowerCase() || '';
          const isSysAdmin = email.startsWith('admin@ucon') || email === 'admin@uconministries.org';
          setIsSystemAdmin(isSysAdmin);
        }
      } catch (error) {
        console.error('Error checking system admin status:', error);
      } finally {
        setSystemAdminCheckComplete(true);
      }
    };
    
    if (userId) {
      checkSystemAdmin();
    } else if (!sessionLoading) {
      setSystemAdminCheckComplete(true);
    }
  }, [userId, sessionLoading]);

  // Determine if user is admin (permission clearance >= 75 OR system admin)
  const isAdmin = permissionClearance >= 75 || isSystemAdmin;

  // Redirect if not authorized - Improved robustness
  useEffect(() => {
    // Only redirect if ALL loading states are finished AND system admin check is complete
    if (!sessionLoading && !authLoading && hasStaffSession !== null && hasAdminSession !== null && systemAdminCheckComplete) {
      // If there's an error fetching auth, don't redirect yet (prevents kicking user out on flaky API)
      if (authError) {
        console.log("Error fetching authorization, not redirecting");
        showErrorWithCode('A1019', 'Failed to verify user role from database');
        return;
      }

      // If there's no userId after both loads are finished, redirect to login
      if (!userId) {
        console.log("No userId found after loading, redirecting to staff-login");
        showErrorWithCode('A1001', 'No active session found');
        router.push("/staff-login");
        return;
      }

      // SYSTEM ADMIN BYPASS: If user is system admin, skip all other checks
      if (isSystemAdmin) {
        // System admin has full access - no need to check cookies or clearance
        return;
      }

      // Check if user has staff-session cookie (logged in via staff portal)
      if (!hasStaffSession) {
        showErrorWithCode('A1027', 'Staff session cookie not found - must log in via staff portal');
        router.push("/staff-login?reason=staff-login-required");
        return;
      }

      // Admin pages require admin-session cookie (not just staff-session)
      if (!hasAdminSession) {
        showErrorWithCode('A1028', 'Admin session cookie not found - could not verify Admin tag');
        router.push("/staff-login?reason=staff-login-required");
        return;
      }

      // If user is not an admin (permissionClearance < 75 AND not system admin), redirect to staff dashboard
      if (!isAdmin && !isSystemAdmin) {
        showErrorWithCode('A1025', `Permission clearance ${permissionClearance} is below required 75`);
        router.push("/staff/dashboard");
        return;
      }
      
      // If user is logged in but has no staff clearance (and not system admin)
      if (!isStaff && permissionClearance === 0 && !isSystemAdmin) {
        console.log("User has no staff privileges, redirecting to home");
        showErrorWithCode('A1015', 'No staff or admin role assigned to this account');
        router.push("/");
      }
    }
  }, [sessionLoading, authLoading, authError, userId, isStaff, isAdmin, permissionClearance, router, hasStaffSession, hasAdminSession, isSystemAdmin, systemAdminCheckComplete]);

  useEffect(() => {
    if (sessionLoading || authLoading || (!isStaff && !isSystemAdmin)) return;
    
    const fetchStats = async () => {
      try {
        const [membersRes, rolesRes, staffRes] = await Promise.all([
          fetch("/api/members/stats"),
          fetch("/api/roles"),
          fetch("/api/user-roles?userId=all"),
        ]);

        if (membersRes.ok) {
          const memberStats = await membersRes.json();
          setStats(prev => ({
            ...prev,
            totalMembers: memberStats.total || 0,
            workshopParticipants: memberStats.byType?.workshop_participant || 0,
            outreachParticipants: memberStats.byType?.outreach_participant || 0,
            volunteers: memberStats.byType?.volunteer || 0,
            newsletterSubscribers: memberStats.byType?.newsletter_subscriber || 0,
            totalConvicts: memberStats.byType?.convict || memberStats.total || 0,
          }));
        }

        if (rolesRes.ok) {
          const roles = await rolesRes.json();
          setStats(prev => ({
            ...prev,
            activeRoles: roles.length || 5,
          }));
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStats(prev => ({
            ...prev,
            totalStaff: staffData.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [sessionLoading, authLoading, isStaff, isSystemAdmin]);

  // Check if section is visible based on permission clearance + duty clearance + role tags (system admin sees all)
  const isSectionVisible = (sectionKey: keyof typeof DASHBOARD_SECTIONS) => {
    if (isSystemAdmin) return true;
    const config = DASHBOARD_SECTIONS[sectionKey];
    const hasPermissionClearance = permissionClearance >= config.minPermissionClearance;
    const hasDutyClearance = dutyClearance >= config.minDutyClearance;
    const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => roleTags?.includes(tag));
    // User needs (permission clearance OR duty clearance) AND must have required tags
    return (hasPermissionClearance || hasDutyClearance) && hasTags;
  };

  // Check if stat is visible based on permission clearance + duty clearance + role tags (system admin sees all)
  const isStatVisible = (statKey: keyof typeof STATS_VISIBILITY) => {
    if (isSystemAdmin) return true;
    const config = STATS_VISIBILITY[statKey];
    const hasPermissionClearance = permissionClearance >= config.minPermissionClearance;
    const hasDuty = dutyClearance >= config.minDutyClearance;
    const hasTags = config.requiredTags.length === 0 || config.requiredTags.some(tag => roleTags?.includes(tag));
    // User needs (permission clearance OR duty clearance) AND must have required tags
    return (hasPermissionClearance || hasDuty) && hasTags;
  };

  // Filter quick actions based on permission clearance + duty clearance + role tags (system admin gets all)
  const visibleQuickActions = QUICK_ACTIONS.filter(action => {
    if (isSystemAdmin) return true;
    const hasPermissionClearance = permissionClearance >= action.minPermissionClearance;
    const hasDuty = dutyClearance >= action.minDutyClearance;
    const hasTags = action.requiredTags.length === 0 || action.requiredTags.some(tag => roleTags?.includes(tag));
    // User needs (permission clearance OR duty clearance) AND must have required tags
    return (hasPermissionClearance || hasDuty) && hasTags;
  });

  // Show loading while checking authorization
  if (sessionLoading || authLoading || hasStaffSession === null || hasAdminSession === null || !systemAdminCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // SYSTEM ADMIN BYPASS: Skip all cookie checks for system admins
  if (isSystemAdmin) {
    // Continue to render - system admin has full access
  } else {
    // If admin-session cookie is false/missing, show redirecting message instead of endless loading
    if (!hasAdminSession) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#F28C28] mx-auto mb-4" />
            <p className="text-muted-foreground">Admin access required. Redirecting to staff login...</p>
          </div>
        </div>
      );
    }

    // If staff-session cookie is false/missing, show redirecting message
    if (!hasStaffSession) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#F28C28] mx-auto mb-4" />
            <p className="text-muted-foreground">Staff access required. Redirecting to staff login...</p>
          </div>
        </div>
      );
    }
  }

  // Don't render until authorized - must have admin session cookie AND be admin (or system admin)
  if (!isStaff && permissionClearance === 0 && !isSystemAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F28C28] mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying staff privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSystemAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F28C28] mx-auto mb-4" />
          <p className="text-muted-foreground">Admin privileges required. Redirecting to staff dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter quick actions: Admin sees admin tools only, Staff sees staff tools only
  const getFilteredQuickActions = () => {
    // Admin-only tools (clearance >= 75)
    const adminOnlyTools = ["/admin/authorization", "/admin/roles", "/admin/settings", "/auth-status"];
    // Staff tools (clearance 25-74)
    const staffTools = ["/admin/members", "/admin/workshops", "/admin/events", "/admin/prayers", "/staff/tools"];
    
    if (isAdmin) {
      // Admin sees admin-only tools + some staff tools that admins need
      return visibleQuickActions.filter(action => 
        adminOnlyTools.includes(action.href) || 
        action.href === "/admin/staff" ||
        action.href === "/admin/members" ||
        action.href === "/admin/workshops" ||
        action.href === "/admin/events"
      );
    } else {
      // Staff sees staff-only tools (not admin tools)
      return visibleQuickActions.filter(action => !adminOnlyTools.includes(action.href));
    }
  };

  const filteredQuickActions = getFilteredQuickActions();

  return (
    <div className="p-8">
      {/* Header with Clearance Badge */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}</h1>
              <Badge className={`${
                currentLevel.level <= 2 
                  ? 'bg-gradient-to-r from-[#A92FFA] to-[#F28C28]' 
                  : 'bg-[#A92FFA]'
              }`}>
                {currentLevel.level <= 2 ? (
                  <Crown className="w-3 h-3 mr-1" />
                ) : (
                  <Shield className="w-3 h-3 mr-1" />
                )}
                {currentLevel.name}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Welcome back, {staffTitle || roleName || 'Staff Member'}!
            </p>
          </div>
          
          {/* Clearance Info Card */}
          <Card className="border-2 border-[#A92FFA]/20 w-64">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Your Clearance</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs bg-[#A92FFA]/10">
                    P: {permissionClearance}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-[#F28C28]/10">
                    D: {dutyClearance}
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${permissionClearance}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clearance-based visibility notice for lower levels */}
      {permissionClearance < 50 && (
        <Alert className="mb-6 border-[#F28C28]/30 bg-[#F28C28]/5">
          <Eye className="h-4 w-4 text-[#F28C28]" />
          <AlertTitle className="text-[#F28C28]">Limited Dashboard View</AlertTitle>
          <AlertDescription>
            Some sections and statistics are hidden based on your clearance level ({permissionClearance}). 
            Contact your supervisor for elevated access if needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Grid - Filtered by clearance */}
      {isSectionVisible('quickStats') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isStatVisible('totalMembers') && (
            <StatCard
              title="Total Members"
              value={stats.totalMembers}
              icon={<Users className="w-5 h-5" />}
              color="bg-[#A92FFA]"
              loading={loading}
            />
          )}
          {isStatVisible('totalStaff') && (
            <StatCard
              title="Active Staff"
              value={stats.totalStaff}
              icon={<UserCog className="w-5 h-5" />}
              color="bg-[#F28C28]"
              loading={loading}
            />
          )}
          {isStatVisible('activeRoles') && (
            <StatCard
              title="Active Roles"
              value={stats.activeRoles}
              icon={<Shield className="w-5 h-5" />}
              color="bg-[#A92FFA]"
              loading={loading}
            />
          )}
          {isStatVisible('pendingApprovals') && (
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<AlertCircle className="w-5 h-5" />}
              color="bg-[#F28C28]"
              loading={loading}
            />
          )}
          {isStatVisible('upcomingEvents') && !isStatVisible('activeRoles') && (
            <StatCard
              title="Upcoming Events"
              value={stats.upcomingEvents}
              icon={<Calendar className="w-5 h-5" />}
              color="bg-green-500"
              loading={loading}
            />
          )}
          {isStatVisible('prayerRequests') && !isStatVisible('pendingApprovals') && (
            <StatCard
              title="Prayer Requests"
              value={stats.prayerRequests}
              icon={<Heart className="w-5 h-5" />}
              color="bg-pink-500"
              loading={loading}
            />
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Member Distribution - Level 4+ */}
        {isSectionVisible('memberDistribution') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#A92FFA]" />
                Member Distribution
              </CardTitle>
              <CardDescription>Breakdown by member type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MemberTypeRow
                label="Workshop Participants"
                count={stats.workshopParticipants}
                total={stats.totalMembers}
                color="bg-[#A92FFA]"
              />
              <MemberTypeRow
                label="Outreach Participants"
                count={stats.outreachParticipants}
                total={stats.totalMembers}
                color="bg-[#F28C28]"
              />
              <MemberTypeRow
                label="Volunteers"
                count={stats.volunteers}
                total={stats.totalMembers}
                color="bg-[#A92FFA]"
              />
              <MemberTypeRow
                label="Newsletter Subscribers"
                count={stats.newsletterSubscribers}
                total={stats.totalMembers}
                color="bg-[#F28C28]"
              />
            </CardContent>
          </Card>
        )}

        {/* Recent Activity - All Staff */}
        {isSectionVisible('recentActivity') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#F28C28]" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest ministry updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem
                icon={<Users className="w-4 h-4" />}
                title="New Member Registered"
                description="Marcus T. joined EQUIP workshop"
                time="2 hours ago"
              />
              <ActivityItem
                icon={<Shield className="w-4 h-4" />}
                title="Role Assignment"
                description="Sarah L. assigned as Workshop Facilitator"
                time="5 hours ago"
              />
              <ActivityItem
                icon={<Heart className="w-4 h-4" />}
                title="Prayer Request"
                description="New prayer submitted to community wall"
                time="1 day ago"
              />
              <ActivityItem
                icon={<BookOpen className="w-4 h-4" />}
                title="Workshop Completed"
                description="AWAKEN Bible Study session concluded"
                time="2 days ago"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* System Health Section - Level 2+ */}
      {isSectionVisible('systemHealth') && (
        <Card className="mb-8 border-2 border-[#A92FFA]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#A92FFA]" />
              System Health
              <Badge variant="outline" className="ml-2">Level 2+ Only</Badge>
            </CardTitle>
            <CardDescription>System status and health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-600">Database</span>
                </div>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-600">Auth Service</span>
                </div>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-600">Email Service</span>
                </div>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-medium text-yellow-600">API Rate</span>
                </div>
                <p className="text-sm text-muted-foreground">72% capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Alerts - Level 2+ */}
      {isSectionVisible('securityAlerts') && (
        <Card className="mb-8 border-2 border-[#F28C28]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F28C28]" />
              Security Overview
              <Badge variant="outline" className="ml-2">Level 2+ Only</Badge>
            </CardTitle>
            <CardDescription>Security alerts and audit log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">All systems secure</p>
                  <p className="text-xs text-muted-foreground">No unauthorized access attempts detected</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">Secure</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-[#A92FFA]/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#A92FFA]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Staff login from new location</p>
                  <p className="text-xs text-muted-foreground">Denver, CO - 2 hours ago</p>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Analytics - Level 1 Only */}
      {isSectionVisible('advancedAnalytics') && (
        <Card className="mb-8 border-2 border-gradient-to-r from-[#A92FFA] to-[#F28C28]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#A92FFA]" />
              Advanced Analytics
              <Badge className="ml-2 bg-gradient-to-r from-[#A92FFA] to-[#F28C28]">
                <Crown className="w-3 h-3 mr-1" />
                Executive Only
              </Badge>
            </CardTitle>
            <CardDescription>Comprehensive ministry analytics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Monthly Growth</p>
                <p className="text-2xl font-bold text-green-600">+23%</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-[#A92FFA]">87%</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Retention</p>
                <p className="text-2xl font-bold text-[#F28C28]">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Quick Actions - Filtered by clearance and role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#A92FFA]" />
              {isAdmin ? 'Admin Tools' : 'Staff Tools'}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? `Admin tools for system management (${filteredQuickActions.length} available)`
                : `Staff tools for daily operations (${filteredQuickActions.length} available)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuickActions.map((action) => (
                <QuickActionButton
                  key={action.href}
                  href={action.href}
                  icon={<action.icon className="w-5 h-5" />}
                  title={action.title}
                  description={action.description}
                  badge={action.badge}
                />
              ))}
            </div>
            
            {/* Show info about role-based tools */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>
                  {isAdmin 
                    ? "You're viewing admin-level tools. Staff tools are available in the Staff Tools page."
                    : "You're viewing staff-level tools. Additional admin tools require higher clearance."
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`${color} text-white p-2 rounded-lg`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold">
          {loading ? "..." : value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function MemberTypeRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-[#A92FFA]/30 transition-all"
    >
      <div className="w-10 h-10 bg-[#A92FFA]/10 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{title}</p>
          {badge && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-[#A92FFA]/10 text-[#A92FFA]">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

