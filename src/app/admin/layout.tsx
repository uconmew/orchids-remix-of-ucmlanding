"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Shield, UserCog, Calendar, Heart, BookOpen, Settings, Lock, AlertTriangle, Crown, Loader2, Search, ChevronLeft, ChevronRight, Menu, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthorization, DASHBOARD_VISIBILITY } from "@/hooks/useAuthorization";
import { ApprovalNotificationBadge } from "@/components/ApprovalNotificationBadge";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { 
    userId, 
    roleName, 
    staffTitle, 
    permissionClearance, 
    dutyClearance, 
    isStaff, 
    isLoading, 
    sessionLoading,
    canAccessRoute, 
    currentLevel,
    getClearanceLevel 
  } = useAuthorization();

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
  };

  // Check if user can access current route
  const hasAccess = canAccessRoute(pathname);

  // Navigation items with clearance requirements
  const navItems = [
    { href: "/admin", icon: <Home className="w-5 h-5" />, label: "Dashboard", minClearance: 0 },
  ];

  const authorizationItems = [
    { href: "/admin/authorization", icon: <Lock className="w-5 h-5" />, label: "Authorization", minClearance: 75 },
    { href: "/admin/roles", icon: <Shield className="w-5 h-5" />, label: "Roles & Permissions", minClearance: 75 },
    { href: "/admin/staff", icon: <UserCog className="w-5 h-5" />, label: "Staff Management", minClearance: 50 },
    { href: "/admin/convicts", icon: <Search className="w-5 h-5" />, label: "Convict Directory", minClearance: 50 },
  ];

    const operationsItems = [
      { href: "/admin/members", icon: <Users className="w-5 h-5" />, label: "Members", minClearance: 25 },
      { href: "/admin/workshops", icon: <BookOpen className="w-5 h-5" />, label: "Workshops", minClearance: 25 },
      { href: "/admin/events", icon: <Calendar className="w-5 h-5" />, label: "Events", minClearance: 25 },
      { href: "/admin/outreach/transit", icon: <Calendar className="w-5 h-5" />, label: "Transit", minClearance: 25 },
      { href: "/admin/prayers", icon: <Heart className="w-5 h-5" />, label: "Prayer Wall", minClearance: 0 },
    ];


  const systemItems = [
    { href: "/admin/settings", icon: <Settings className="w-5 h-5" />, label: "Settings", minClearance: 90 },
  ];

  // Filter items based on user's clearance
  const filterByAccess = (items: typeof navItems) => 
    items.filter(item => permissionClearance >= item.minClearance);

  const visibleAuthItems = filterByAccess(authorizationItems);
  const visibleOpsItems = filterByAccess(operationsItems);
  const visibleSystemItems = filterByAccess(systemItems);

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A92FFA]" />
          <p className="text-muted-foreground">Loading authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-card border-r border-border transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-3' : 'p-6'}`}>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-lg">UCon Admin</h1>
                  <p className="text-xs text-muted-foreground">Ministry Dashboard</p>
                </div>
              )}
            </Link>
          </div>

          {/* Collapse Toggle */}
          <button 
            onClick={toggleCollapsed}
            className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors z-50"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>

          {/* Navigation */}
          <nav className={`flex-1 p-2 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'p-4 space-y-2'}`}>
            {navItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                icon={item.icon} 
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              >
                {item.label}
              </NavLink>
            ))}
            
            {visibleAuthItems.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      Authorization
                    </p>
                  </div>
                )}
                {isCollapsed && <div className="border-t border-border my-2" />}
                {visibleAuthItems.map((item) => (
                  <NavLink 
                    key={item.href} 
                    href={item.href} 
                    icon={item.icon}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
            
            {visibleOpsItems.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      Ministry Operations
                    </p>
                  </div>
                )}
                {isCollapsed && <div className="border-t border-border my-2" />}
                {visibleOpsItems.map((item) => (
                  <NavLink 
                    key={item.href} 
                    href={item.href} 
                    icon={item.icon}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
            
            {visibleSystemItems.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      System
                    </p>
                  </div>
                )}
                {isCollapsed && <div className="border-t border-border my-2" />}
                {visibleSystemItems.map((item) => (
                  <NavLink 
                    key={item.href} 
                    href={item.href} 
                    icon={item.icon}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User Info with Clearance Display */}
          <div className={`p-3 border-t border-border ${isCollapsed ? 'px-2' : 'p-4'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                currentLevel.level <= 2 
                  ? 'bg-gradient-to-br from-[#A92FFA] to-[#F28C28]' 
                  : 'bg-[#A92FFA]'
              }`}>
                {currentLevel.level <= 2 ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">
                    {roleName?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {staffTitle || roleName || "User"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-1">
                      P:{permissionClearance}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1">
                      D:{dutyClearance}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {currentLevel.name}
              </p>
            )}
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Top Bar with Approval Notifications */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-end h-14 px-6">
              <ApprovalNotificationBadge />
            </div>
          </div>
          
          {!hasAccess ? (
          <div className="p-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You don't have sufficient clearance to access this page. 
                Required clearance: {DASHBOARD_VISIBILITY[pathname as keyof typeof DASHBOARD_VISIBILITY]?.minClearance || "Unknown"}. 
                Your clearance: {permissionClearance}.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Link href="/admin" className="text-[#A92FFA] hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children, 
  isActive,
  isCollapsed 
}: { 
  href: string; 
  icon: ReactNode; 
  children: ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-[#A92FFA]/10 text-[#A92FFA]' 
          : 'hover:bg-accent hover:text-accent-foreground'
      } ${isCollapsed ? 'justify-center px-2' : ''}`}
      title={isCollapsed ? String(children) : undefined}
    >
      {icon}
      {!isCollapsed && <span>{children}</span>}
    </Link>
  );
}