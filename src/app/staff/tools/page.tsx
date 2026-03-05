"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, Shield, BookOpen, Calendar, Heart, TrendingUp, UserCog, AlertCircle, 
  Loader2, Lock, Crown, Eye, EyeOff, Settings, Activity,
  BarChart3, Zap, ShieldCheck, Truck, Utensils, Home as HomeIcon,
  MessageSquare, Stethoscope, HandHeart, FileText, ClipboardList,
  GraduationCap, BriefcaseBusiness, Building, Phone, Car, UtensilsCrossed,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAuthorization, ACTION_CLEARANCE, CLEARANCE_LEVELS, DUTY_PERMISSIONS } from "@/hooks/useAuthorization";
import { ERROR_CODES } from "@/lib/error-codes";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function showErrorWithCode(code: string, reason?: string) {
  const errorDef = ERROR_CODES[code];
  const baseMessage = errorDef?.userFriendlyMessage || 'An error occurred';
  const fullMessage = reason 
    ? `${baseMessage} (Reason: ${reason})`
    : baseMessage;
  toast.error(`[${code}] ${fullMessage}`);
}

// Define all available staff tools with comprehensive permission requirements
// Tools are rendered ONLY if user meets ALL THREE criteria: permission clearance, duty clearance, AND level
interface StaffTool {
  id: string;
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  category: 'outreach' | 'ministry' | 'management' | 'administration' | 'system';
  // Requirements - ALL must be met for tool to be visible
  minPermissionClearance: number;  // Permission clearance required
  minDutyClearance: number;        // Duty clearance required (0 = no duty requirement)
  minLevel: number;                // Role level required (1-5, where 1 is highest)
  // Optional: specific permission key required
  requiredPermission?: string;     // e.g., 'transit:manage'
  requiredDuty?: string;           // e.g., 'outreachCoordination'
}

const STAFF_TOOLS: StaffTool[] = [
  // Outreach Tools
  {
    id: 'transit',
    href: '/admin/outreach/transit',
    icon: Car,
    title: 'UCON Transit',
    description: 'Manage transportation requests and scheduling',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    minLevel: 4,
    requiredPermission: 'transit:view',
    requiredDuty: 'outreachCoordination',
  },
  {
    id: 'nourish',
    href: '/admin/outreach/nourish',
    icon: UtensilsCrossed,
    title: 'UCON Nourish',
    description: 'Food distribution and pantry management',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    minLevel: 4,
    requiredDuty: 'outreachCoordination',
  },
  {
    id: 'haven',
    href: '/admin/outreach/haven',
    icon: HomeIcon,
    title: 'UCON Haven',
    description: 'Shelter and housing assistance',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    minLevel: 4,
    requiredDuty: 'outreachCoordination',
  },
  {
    id: 'neighbors',
    href: '/admin/outreach/neighbors',
    icon: Users,
    title: 'UCON Neighbors',
    description: 'Community engagement and partnerships',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
  },
  {
    id: 'voice',
    href: '/admin/outreach/voice',
    icon: MessageSquare,
    title: 'UCON Voice',
    description: 'Advocacy and policy engagement',
    category: 'outreach',
    minPermissionClearance: 50,
    minDutyClearance: 50,
    minLevel: 3,
  },
  {
    id: 'steps',
    href: '/admin/outreach/steps',
    icon: Stethoscope,
    title: 'UCON Steps',
    description: 'Recovery support and 12-step programs',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    minLevel: 4,
  },
  
  // Ministry Tools
  {
    id: 'workshops',
    href: '/admin/workshops',
    icon: BookOpen,
    title: 'Workshop Management',
    description: 'Create and manage EQUIP workshops',
    category: 'ministry',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
    requiredDuty: 'workshopFacilitation',
  },
  {
    id: 'events',
    href: '/admin/events',
    icon: Calendar,
    title: 'Event Management',
    description: 'Schedule and manage ministry events',
    category: 'ministry',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
    requiredDuty: 'eventCoordination',
  },
  {
    id: 'prayers',
    href: '/admin/prayers',
    icon: Heart,
    title: 'Prayer Wall',
    description: 'View and respond to prayer requests',
    category: 'ministry',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    minLevel: 5,
  },
  {
    id: 'testimonials',
    href: '/admin/testimonials',
    icon: FileText,
    title: 'Testimonials',
    description: 'Manage transformation stories',
    category: 'ministry',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
  },
  
  // Management Tools
  {
    id: 'convicts',
    href: '/admin/convicts',
    icon: Users,
    title: 'Convict Directory',
    description: 'View and manage community members',
    category: 'management',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
  },
  {
    id: 'members',
    href: '/admin/members',
    icon: ClipboardList,
    title: 'Member Management',
    description: 'Manage member registrations and profiles',
    category: 'management',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    minLevel: 4,
  },
  {
    id: 'careers',
    href: '/admin/careers',
    icon: BriefcaseBusiness,
    title: 'Career Management',
    description: 'Manage job postings and applications',
    category: 'management',
    minPermissionClearance: 50,
    minDutyClearance: 50,
    minLevel: 3,
  },
  {
    id: 'donations',
    href: '/admin/donations',
    icon: HandHeart,
    title: 'Donations',
    description: 'View and manage donations',
    category: 'management',
    minPermissionClearance: 50,
    minDutyClearance: 0,
    minLevel: 3,
  },
  
  // Administration Tools (Higher clearance required)
  {
    id: 'staff',
    href: '/admin/staff',
    icon: UserCog,
    title: 'Staff Management',
    description: 'Manage staff roles and clearances',
    category: 'administration',
    minPermissionClearance: 50,
    minDutyClearance: 0,
    minLevel: 3,
  },
  {
    id: 'authorization',
    href: '/admin/authorization',
    icon: Lock,
    title: 'Authorization Center',
    description: 'Manage permissions and clearances',
    category: 'administration',
    minPermissionClearance: 75,
    minDutyClearance: 0,
    minLevel: 2,
  },
  {
    id: 'roles',
    href: '/admin/roles',
    icon: Shield,
    title: 'Roles & Permissions',
    description: 'Configure system roles',
    category: 'administration',
    minPermissionClearance: 75,
    minDutyClearance: 0,
    minLevel: 2,
  },
  {
    id: 'audit',
    href: '/admin/audit',
    icon: Activity,
    title: 'Audit Logs',
    description: 'View system audit trails',
    category: 'administration',
    minPermissionClearance: 75,
    minDutyClearance: 0,
    minLevel: 2,
  },
  
  // System Tools (Highest clearance)
  {
    id: 'settings',
    href: '/admin/settings',
    icon: Settings,
    title: 'System Settings',
    description: 'Configure system settings',
    category: 'system',
    minPermissionClearance: 90,
    minDutyClearance: 0,
    minLevel: 1,
  },
];

const CATEGORY_INFO = {
  outreach: { label: 'Outreach Services', icon: HandHeart, color: 'bg-[#A92FFA]' },
  ministry: { label: 'Ministry Programs', icon: BookOpen, color: 'bg-[#F28C28]' },
  management: { label: 'Management', icon: ClipboardList, color: 'bg-blue-500' },
  administration: { label: 'Administration', icon: Shield, color: 'bg-purple-600' },
  system: { label: 'System', icon: Settings, color: 'bg-gray-600' },
};

export default function StaffToolsPage() {
  const router = useRouter();
  const {
    userId,
    roleName,
    staffTitle,
    permissionClearance,
    dutyClearance,
    isStaff,
    isLoading: authLoading,
    error: authError,
    sessionLoading,
    currentLevel,
    hasDutyPermission,
  } = useAuthorization();

  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [hasStaffSession, setHasStaffSession] = useState<boolean | null>(null);
  const [hasAdminSession, setHasAdminSession] = useState<boolean | null>(null);

  // Check staff-session and admin-session from both cookies AND localStorage
  // localStorage is used as fallback for iframe environments where third-party cookies may be blocked
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

  // Fetch user's specific permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/role-permissions/check?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.permissions) {
            setUserPermissions(new Set(data.permissions.map((p: any) => `${p.resource}:${p.action}`)));
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && !sessionLoading && !authLoading) {
      fetchPermissions();
    } else if (!sessionLoading && !authLoading) {
      setLoading(false);
    }
  }, [userId, sessionLoading, authLoading]);

  // Redirect if not authorized
  useEffect(() => {
    if (!sessionLoading && !authLoading && hasStaffSession !== null && hasAdminSession !== null) {
      if (authError) {
        showErrorWithCode('A1019', 'Failed to verify user role from database');
        return;
      }

      if (!userId) {
        showErrorWithCode('A1001', 'No active session found');
        router.push("/staff-login");
        return;
      }

      // Check if user has EITHER staff-session OR admin-session cookie (logged in via staff portal)
      // Both staff AND admin users can access the tools page
      if (!hasStaffSession && !hasAdminSession) {
        showErrorWithCode('A1027', 'Staff session cookie not found - must log in via staff portal');
        router.push("/staff-login?reason=staff-login-required");
        return;
      }
    }
  }, [sessionLoading, authLoading, authError, userId, router, hasStaffSession, hasAdminSession]);

  // Check if a tool is visible based on ALL THREE criteria
  const isToolVisible = (tool: StaffTool): boolean => {
    // 1. Check permission clearance
    if (permissionClearance < tool.minPermissionClearance) return false;
    
    // 2. Check duty clearance (if required)
    if (tool.minDutyClearance > 0 && dutyClearance < tool.minDutyClearance) return false;
    
    // 3. Check level (currentLevel.level is 1-5 where 1 is highest)
    if (currentLevel.level > tool.minLevel) return false;
    
    // 4. Check specific permission if required
    if (tool.requiredPermission && !userPermissions.has(tool.requiredPermission)) {
      // Allow if user has high enough permission clearance (75+) to bypass specific permission check
      if (permissionClearance < 75) return false;
    }
    
    // 5. Check specific duty if required
    if (tool.requiredDuty) {
      const dutyConfig = DUTY_PERMISSIONS[tool.requiredDuty as keyof typeof DUTY_PERMISSIONS];
      if (dutyConfig && dutyClearance < dutyConfig.requiredDutyClearance) {
        // Allow if user has high enough permission clearance (75+) to bypass duty check
        if (permissionClearance < 75) return false;
      }
    }
    
    return true;
  };

  // Filter and group tools by category
  const visibleToolsByCategory = useMemo(() => {
    const result: Record<string, StaffTool[]> = {};
    
    STAFF_TOOLS.forEach(tool => {
      if (isToolVisible(tool)) {
        if (!result[tool.category]) {
          result[tool.category] = [];
        }
        result[tool.category].push(tool);
      }
    });
    
    return result;
  }, [permissionClearance, dutyClearance, currentLevel, userPermissions]);

  const totalVisibleTools = Object.values(visibleToolsByCategory).flat().length;
  const totalTools = STAFF_TOOLS.length;

  // Show loading while checking authorization
  if (sessionLoading || authLoading || loading || hasStaffSession === null || hasAdminSession === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading staff tools...</p>
        </div>
      </div>
    );
  }

    // Allow access if user has either staff-session OR admin-session (admin can access staff tools too)
    // Don't render if not logged in or has neither session
    if (!userId || (!hasStaffSession && !hasAdminSession)) {
      return null;
    }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-8 max-w-7xl mx-auto pt-32">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/staff-login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Staff Portal
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">Staff Tools</h1>
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
                Welcome, {staffTitle || roleName || 'Staff Member'}! Access your authorized tools below.
              </p>
            </div>
            
            {/* Clearance Info Card */}
            <Card className="border-2 border-[#A92FFA]/20 w-72">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Your Access</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-[#A92FFA]/10">
                      P: {permissionClearance}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-[#F28C28]/10">
                      D: {dutyClearance}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-500/10">
                      L: {currentLevel.level}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${permissionClearance}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {totalVisibleTools} of {totalTools} tools available
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Limited Access Notice */}
        {totalVisibleTools < totalTools && (
          <Alert className="mb-6 border-[#F28C28]/30 bg-[#F28C28]/5">
            <Eye className="h-4 w-4 text-[#F28C28]" />
            <AlertTitle className="text-[#F28C28]">Limited Tool Access</AlertTitle>
            <AlertDescription>
              Some tools are hidden based on your permission clearance ({permissionClearance}), 
              duty clearance ({dutyClearance}), and level ({currentLevel.level}). 
              Contact your supervisor for elevated access if needed.
            </AlertDescription>
          </Alert>
        )}

        {/* No Tools Available */}
        {totalVisibleTools === 0 && (
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-12 text-center">
              <EyeOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tools Available</h3>
              <p className="text-muted-foreground mb-4">
                You don't have access to any staff tools based on your current clearance levels.
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tools by Category */}
        {Object.entries(CATEGORY_INFO).map(([category, info]) => {
          const tools = visibleToolsByCategory[category];
          if (!tools || tools.length === 0) return null;

          const CategoryIcon = info.icon;

          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${info.color} text-white p-2 rounded-lg`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">{info.label}</h2>
                <Badge variant="outline">{tools.length} tool{tools.length !== 1 ? 's' : ''}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group"
                    >
                      <Card className="h-full hover:border-[#A92FFA]/50 hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className={`${info.color} text-white p-3 rounded-lg`}>
                              <ToolIcon className="w-6 h-6" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              L{tool.minLevel}+
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-3">{tool.title}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 flex-wrap">
                            {tool.minPermissionClearance > 0 && (
                              <Badge variant="outline" className="text-xs bg-[#A92FFA]/5">
                                P≥{tool.minPermissionClearance}
                              </Badge>
                            )}
                            {tool.minDutyClearance > 0 && (
                              <Badge variant="outline" className="text-xs bg-[#F28C28]/5">
                                D≥{tool.minDutyClearance}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Hidden Tools Count */}
        {totalVisibleTools < totalTools && totalVisibleTools > 0 && (
          <Card className="mt-8 border-dashed">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 justify-center text-muted-foreground">
                <EyeOff className="w-5 h-5" />
                <span>
                  {totalTools - totalVisibleTools} additional tool{totalTools - totalVisibleTools !== 1 ? 's' : ''} require higher clearance
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
