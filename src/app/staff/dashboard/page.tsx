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
  Loader2, Lock, Eye, EyeOff, Settings, Activity,
  BarChart3, Zap, ShieldCheck, Truck, Utensils, Home as HomeIcon,
  MessageSquare, Stethoscope, HandHeart, FileText, ClipboardList,
  GraduationCap, BriefcaseBusiness, Building, Phone, Car, UtensilsCrossed,
  ArrowRight, Wrench, LayoutDashboard, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useAuthorization, DUTY_PERMISSIONS, CLEARANCE_LEVELS } from "@/hooks/useAuthorization";
import { ERROR_CODES } from "@/lib/error-codes";

function showErrorWithCode(code: string, reason?: string) {
  const errorDef = ERROR_CODES[code];
  const baseMessage = errorDef?.userFriendlyMessage || 'An error occurred';
  const fullMessage = reason 
    ? `${baseMessage} (Reason: ${reason})`
    : baseMessage;
  toast.error(`[${code}] ${fullMessage}`);
}

// Dashboard widget definitions - visibility based on permission and duty clearance (NOT level)
interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  category: 'overview' | 'outreach' | 'ministry' | 'management' | 'quick-actions';
  minPermissionClearance: number;
  minDutyClearance: number;
  size?: 'small' | 'medium' | 'large';
  component?: 'stats' | 'activity' | 'tasks' | 'shortcuts' | 'calendar';
}

const DASHBOARD_WIDGETS: DashboardWidget[] = [
  // Overview widgets
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Your personalized dashboard',
    icon: LayoutDashboard,
    category: 'overview',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    size: 'large',
    component: 'stats',
  },
  {
    id: 'my-tasks',
    title: 'My Tasks',
    description: 'Your assigned tasks and duties',
    icon: ClipboardList,
    category: 'overview',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    size: 'medium',
    component: 'tasks',
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    description: 'Latest updates in your areas',
    icon: Activity,
    category: 'overview',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    size: 'medium',
    component: 'activity',
  },
  
  // Outreach widgets - require outreach duty
  {
    id: 'transit-overview',
    title: 'Transit Overview',
    description: 'Transportation requests and scheduling',
    icon: Car,
    href: '/admin/outreach/transit',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    size: 'medium',
  },
  {
    id: 'nourish-overview',
    title: 'Nourish Overview',
    description: 'Food distribution status',
    icon: UtensilsCrossed,
    href: '/admin/outreach/nourish',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    size: 'medium',
  },
  {
    id: 'haven-overview',
    title: 'Haven Overview',
    description: 'Shelter and housing status',
    icon: HomeIcon,
    href: '/admin/outreach/haven',
    category: 'outreach',
    minPermissionClearance: 25,
    minDutyClearance: 25,
    size: 'medium',
  },
  
  // Ministry widgets
  {
    id: 'workshops-overview',
    title: 'Workshops',
    description: 'Upcoming and active workshops',
    icon: BookOpen,
    href: '/admin/workshops',
    category: 'ministry',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    size: 'medium',
  },
  {
    id: 'events-overview',
    title: 'Events',
    description: 'Ministry events calendar',
    icon: Calendar,
    href: '/admin/events',
    category: 'ministry',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    size: 'medium',
  },
  {
    id: 'prayers-overview',
    title: 'Prayer Wall',
    description: 'Community prayer requests',
    icon: Heart,
    href: '/admin/prayers',
    category: 'ministry',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    size: 'medium',
  },
  
  // Management widgets - higher clearance
  {
    id: 'convicts-overview',
    title: 'Convict Directory',
    description: 'Community members overview',
    icon: Users,
    href: '/admin/convicts',
    category: 'management',
    minPermissionClearance: 25,
    minDutyClearance: 0,
    size: 'medium',
  },
  {
    id: 'staff-overview',
    title: 'Staff Directory',
    description: 'Staff members and roles',
    icon: UserCog,
    href: '/admin/staff',
    category: 'management',
    minPermissionClearance: 50,
    minDutyClearance: 0,
    size: 'medium',
  },
  {
    id: 'donations-overview',
    title: 'Donations',
    description: 'Recent donations and giving',
    icon: HandHeart,
    href: '/admin/donations',
    category: 'management',
    minPermissionClearance: 50,
    minDutyClearance: 0,
    size: 'medium',
  },
  
  // Quick action widgets
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'Frequently used tools',
    icon: Zap,
    category: 'quick-actions',
    minPermissionClearance: 0,
    minDutyClearance: 0,
    size: 'large',
    component: 'shortcuts',
  },
];

const CATEGORY_INFO = {
  overview: { label: 'Overview', icon: LayoutDashboard, color: 'bg-[#A92FFA]' },
  outreach: { label: 'Outreach Services', icon: HandHeart, color: 'bg-[#A92FFA]' },
  ministry: { label: 'Ministry Programs', icon: BookOpen, color: 'bg-[#F28C28]' },
  management: { label: 'Management', icon: ClipboardList, color: 'bg-blue-500' },
  'quick-actions': { label: 'Quick Actions', icon: Zap, color: 'bg-green-500' },
};

export default function StaffDashboardPage() {
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
  } = useAuthorization();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myTasks: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    activePrayers: 0,
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      try {
        // Fetch relevant stats based on permissions
        const [eventsRes, prayersRes] = await Promise.all([
          fetch('/api/events?limit=5'),
          fetch('/api/prayers?limit=5'),
        ]);
        
        if (eventsRes.ok) {
          const events = await eventsRes.json();
          setStats(prev => ({ ...prev, upcomingEvents: events.length }));
        }
        
        if (prayersRes.ok) {
          const prayers = await prayersRes.json();
          setStats(prev => ({ ...prev, activePrayers: prayers.length }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && !sessionLoading && !authLoading) {
      fetchDashboardData();
    } else if (!sessionLoading && !authLoading) {
      setLoading(false);
    }
  }, [userId, sessionLoading, authLoading]);

// Check staff-session and admin-session from both cookies AND localStorage
    // localStorage is used as fallback for iframe environments where third-party cookies may be blocked
    const [hasStaffSession, setHasStaffSession] = useState<boolean | null>(null);
    const [hasAdminSession, setHasAdminSession] = useState<boolean | null>(null);
    
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

        // Check if user has staff-session cookie (logged in via staff portal)
        if (!hasStaffSession) {
          showErrorWithCode('A1027', 'Staff session cookie not found - must log in via staff portal');
          router.push("/staff-login?reason=staff-login-required");
          return;
        }

        // Staff dashboard is for STAFF ONLY - admin users should use admin dashboard
        if (hasAdminSession) {
          toast.info("Admin users should use the Admin Dashboard");
          router.push("/admin");
          return;
        }
      }
    }, [sessionLoading, authLoading, authError, userId, router, hasStaffSession, hasAdminSession]);

  // Check if a widget is visible based on permission and duty clearance
  const isWidgetVisible = (widget: DashboardWidget): boolean => {
    // Check permission clearance
    if (permissionClearance < widget.minPermissionClearance) return false;
    
    // Check duty clearance (if required)
    if (widget.minDutyClearance > 0 && dutyClearance < widget.minDutyClearance) return false;
    
    return true;
  };

  // Filter and group widgets by category
  const visibleWidgetsByCategory = useMemo(() => {
    const result: Record<string, DashboardWidget[]> = {};
    
    DASHBOARD_WIDGETS.forEach(widget => {
      if (isWidgetVisible(widget)) {
        if (!result[widget.category]) {
          result[widget.category] = [];
        }
        result[widget.category].push(widget);
      }
    });
    
    return result;
  }, [permissionClearance, dutyClearance]);

  const handleSignOut = async () => {
    document.cookie = "staff-session=; path=/; max-age=0";
    await authClient.signOut();
    router.push("/staff-login");
  };

// Show loading while checking authorization
    if (sessionLoading || authLoading || loading || hasStaffSession === null || hasAdminSession === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    // Don't render if not logged in, no staff session, or has admin session (admin should use admin dashboard)
    if (!userId || !hasStaffSession || hasAdminSession) {
      return null;
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A92FFA]/5 via-background to-[#F28C28]/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Staff Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {staffTitle || roleName || 'Staff Member'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Clearance badges */}
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline" className="bg-[#A92FFA]/10">
                  P: {permissionClearance}
                </Badge>
                <Badge variant="outline" className="bg-[#F28C28]/10">
                  D: {dutyClearance}
                </Badge>
                <Badge className="bg-[#A92FFA]">
                  {currentLevel.name}
                </Badge>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href="/staff/tools">
                  <Wrench className="w-4 h-4 mr-2" />
                  Tools
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-2 border-[#A92FFA]/20 bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {staffTitle || roleName || 'Staff Member'}!
                </h2>
                <p className="text-muted-foreground">
                  Here's your personalized dashboard based on your permissions and duties.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Card className="border border-[#A92FFA]/20">
                  <CardContent className="py-3 px-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#A92FFA]">{stats.upcomingEvents}</p>
                      <p className="text-xs text-muted-foreground">Upcoming Events</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-[#F28C28]/20">
                  <CardContent className="py-3 px-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#F28C28]">{stats.activePrayers}</p>
                      <p className="text-xs text-muted-foreground">Active Prayers</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Widgets by Category */}
        {Object.entries(CATEGORY_INFO).map(([category, info]) => {
          const widgets = visibleWidgetsByCategory[category];
          if (!widgets || widgets.length === 0) return null;
          
          // Skip overview category header (it's the welcome section)
          if (category === 'overview') return null;

          const CategoryIcon = info.icon;

          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${info.color} text-white p-2 rounded-lg`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">{info.label}</h2>
                <Badge variant="outline">{widgets.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget) => {
                  const WidgetIcon = widget.icon;
                  
                  if (widget.href) {
                    return (
                      <Link
                        key={widget.id}
                        href={widget.href}
                        className="group"
                      >
                        <Card className="h-full hover:border-[#A92FFA]/50 hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className={`${info.color} text-white p-3 rounded-lg`}>
                                <WidgetIcon className="w-6 h-6" />
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#A92FFA] transition-colors" />
                            </div>
                            <CardTitle className="text-lg mt-3">{widget.title}</CardTitle>
                            <CardDescription>{widget.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2 flex-wrap">
                              {widget.minPermissionClearance > 0 && (
                                <Badge variant="outline" className="text-xs bg-[#A92FFA]/5">
                                  P≥{widget.minPermissionClearance}
                                </Badge>
                              )}
                              {widget.minDutyClearance > 0 && (
                                <Badge variant="outline" className="text-xs bg-[#F28C28]/5">
                                  D≥{widget.minDutyClearance}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  }
                  
                  return (
                    <Card key={widget.id} className="h-full">
                      <CardHeader className="pb-2">
                        <div className={`${info.color} text-white p-3 rounded-lg w-fit`}>
                          <WidgetIcon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-lg mt-3">{widget.title}</CardTitle>
                        <CardDescription>{widget.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {widget.component === 'shortcuts' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="justify-start" asChild>
                              <Link href="/admin/prayers">
                                <Heart className="w-4 h-4 mr-2" />
                                Prayers
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start" asChild>
                              <Link href="/admin/events">
                                <Calendar className="w-4 h-4 mr-2" />
                                Events
                              </Link>
                            </Button>
                            {permissionClearance >= 25 && (
                              <>
                                <Button variant="outline" size="sm" className="justify-start" asChild>
                                  <Link href="/admin/workshops">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Workshops
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start" asChild>
                                  <Link href="/admin/convicts">
                                    <Users className="w-4 h-4 mr-2" />
                                    Convicts
                                  </Link>
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick Actions Section */}
        {visibleWidgetsByCategory['quick-actions']?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 text-white p-2 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                    <Link href="/admin/prayers">
                      <Heart className="w-6 h-6 text-[#A92FFA]" />
                      <span>Prayer Wall</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                    <Link href="/admin/events">
                      <Calendar className="w-6 h-6 text-[#F28C28]" />
                      <span>Events</span>
                    </Link>
                  </Button>
                  {permissionClearance >= 25 && (
                    <>
                      <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                        <Link href="/admin/workshops">
                          <BookOpen className="w-6 h-6 text-[#A92FFA]" />
                          <span>Workshops</span>
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                        <Link href="/staff/tools">
                          <Wrench className="w-6 h-6 text-[#F28C28]" />
                          <span>All Tools</span>
                        </Link>
                      </Button>
                    </>
                  )}
                  {dutyClearance >= 25 && (
                    <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                      <Link href="/admin/outreach/transit">
                        <Car className="w-6 h-6 text-[#A92FFA]" />
                        <span>Transit</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Access Level Info */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Eye className="w-5 h-5" />
              <div>
                <p className="text-sm">
                  Your dashboard is customized based on your permission clearance ({permissionClearance}) and duty clearance ({dutyClearance}).
                </p>
                <p className="text-xs mt-1">
                  Contact your supervisor for additional access if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
