"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Sun, Moon, User, LogOut, LogIn, UserPlus, Shield, CircleCheck, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useSession, signOut, clearAuthToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NotificationCenter from "./NotificationCenter";
import AlertCenter from "./AlertCenter";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionTimer } from "@/hooks/use-session-timer";

function getStaffSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('staff-session=true'));
}

function getAdminSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('admin-session=true'));
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [hasAnimationCompleted, setHasAnimationCompleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUserHovered, setIsUserHovered] = useState(false);
const [isMobileCardHovered, setIsMobileCardHovered] = useState(false);
    const [isStaffSession, setIsStaffSession] = useState(false);
    const [isAdminSession, setIsAdminSession] = useState(false);
    const userHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  const { formattedTime, isTimerVisible, isFadingOut, showRefresh, resetSession } = useSessionTimer();

  const [roleLevel, setRoleLevel] = useState<number | null>(null);
  const [permissionClearance, setPermissionClearance] = useState<number>(0);
  const [hasConvictTag, setHasConvictTag] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user-roles?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              // Get highest role (lowest level number = highest rank)
              const highestRole = data.reduce((prev: any, curr: any) => 
                (curr.roleLevel < prev.roleLevel) ? curr : prev
              );
              setUserRole(highestRole.roleName || 'convict');
              setRoleLevel(highestRole.roleLevel || null);
              // Also get permission clearance for determining admin access
              const maxPermission = Math.max(...data.map((r: any) => r.permissionClearance || 0));
              setPermissionClearance(maxPermission);
              // Check if user has "convict" role/tag
              const convictRole = data.find((r: any) => 
                r.roleName?.toLowerCase() === 'convict' || r.roleLevel === 10
              );
              setHasConvictTag(!!convictRole);
            } else {
              setUserRole('convict');
              setRoleLevel(null);
              setPermissionClearance(0);
              setHasConvictTag(true); // Default users are convicts
            }
          }
        } catch (error) {
          setUserRole('convict');
          setRoleLevel(null);
          setPermissionClearance(0);
          setHasConvictTag(true);
        }
      }
    };
    fetchUserRole();
  }, [session?.user?.id]);

  // Staff = role level 1-7 OR permission clearance >= 25
  // Admin = role level 1-2 OR permission clearance >= 75
  const isStaffOrAdmin = (roleLevel !== null && roleLevel <= 7) || permissionClearance >= 25;
  const isAdmin = (roleLevel !== null && roleLevel <= 2) || permissionClearance >= 75;

// Check if logged in via staff portal (cookie-based)
    useEffect(() => {
      if (session?.user?.id) {
        setIsStaffSession(getStaffSessionCookie());
        setIsAdminSession(getAdminSessionCookie());
      } else {
        setIsStaffSession(false);
        setIsAdminSession(false);
      }
    }, [session?.user?.id]);

    // Admin tools require admin-session cookie (not just isAdmin role check)
    // Staff tools require staff-session cookie AND NOT admin-session (staff-only)
    const canAccessAdminTools = isAdmin && isAdminSession;
    const canAccessStaffTools = isStaffOrAdmin && isStaffSession && !isAdminSession;

  useEffect(() => {
    const handleAnimationStart = () => {
      setIsAnimationPlaying(true);
      setHasAnimationCompleted(false);
    };

    const handleAnimationComplete = () => {
      setIsAnimationPlaying(false);
      setTimeout(() => {
        setHasAnimationCompleted(true);
      }, 3600);
    };

    window.addEventListener('animationStarted', handleAnimationStart);
    window.addEventListener('wordShuffleComplete', handleAnimationComplete);

    if (typeof window !== 'undefined') {
      const isHomepage = window.location.pathname === '/';
      const hasSeenAnimation = localStorage.getItem('hero-animation-seen') === 'true';
      
      if (!isHomepage || hasSeenAnimation) {
        setHasAnimationCompleted(true);
      }
    }

    const fallbackTimer = setTimeout(() => {
      setHasAnimationCompleted(true);
    }, 10000);

    return () => {
      window.removeEventListener('animationStarted', handleAnimationStart);
      window.removeEventListener('wordShuffleComplete', handleAnimationComplete);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleSignOut = async () => {
    // Clear staff and admin session cookies
    document.cookie = "staff-session=; path=/; max-age=0";
    document.cookie = "admin-session=; path=/; max-age=0";
    setIsStaffSession(false);
    setIsAdminSession(false);
    
    await signOut();
    clearAuthToken();
    refetch();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserMouseEnter = () => {
    if (userHoverTimeout.current) clearTimeout(userHoverTimeout.current);
    setIsUserHovered(true);
  };

  const handleUserMouseLeave = () => {
    userHoverTimeout.current = setTimeout(() => {
      setIsUserHovered(false);
    }, 300);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
      isAnimationPlaying ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm border-b border-border'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className={`flex items-center space-x-3 transition-all duration-1000 ${
            hasAnimationCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png"
                  alt="UCon Ministries Logo"
                  fill
                  className="object-contain"
                  priority />
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">Ucon Ministries</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Where Your Past Becomes Your Purpose</p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <div className={`flex items-center space-x-4 transition-all duration-1000 delay-200 ${
              hasAnimationCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}>
              {[
                { name: "Home", href: "/", color: "!text-violet-400" },
                { name: "About", href: "/about" },
                { name: "LDI", href: "/ldi" },
                { name: "Services", href: "/services" },
                { name: "Outreach", href: "/outreach" },
                { name: "Workshops", href: "/workshops" },
                { name: "Prayer Wall", href: "/prayer-wall" },
                { name: "Donate", href: "/donations" },
                { name: "Contact", href: "/contact" },
              ].map((item) => (
                <Link key={item.name} href={item.href} className={`hover:text-primary transition-colors font-medium text-sm ${item.color || 'text-foreground'}`}>
                  {item.name}
                </Link>
              ))}
            </div>
            
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 transition-all duration-500 ${
                isAnimationPlaying ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''
              }`}
              aria-label="Toggle theme">
              {theme === "dark" ?
                <Sun className={`w-5 h-5 transition-colors duration-500 ${isAnimationPlaying ? 'text-[#F28C28] drop-shadow-[0_0_10px_rgba(242,140,40,0.8)]' : 'text-[#F28C28]'}`} /> :
                <Moon className={`w-5 h-5 transition-colors duration-500 ${isAnimationPlaying ? 'text-[#A92FFA] drop-shadow-[0_0_10px_rgba(169,47,250,0.8)]' : 'text-[#A92FFA]'}`} />
              }
            </Button>

              <AlertCenter />

              <NotificationCenter />

            <div className={`flex items-center space-x-4 transition-all duration-1000 delay-300 ${
              hasAnimationCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}>
              {isPending ? (
                <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
                ) : session?.user ? (
                  <div 
                    className="relative py-2"
                    onMouseEnter={handleUserMouseEnter}
                    onMouseLeave={handleUserMouseLeave}
                  >
                      <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                        isUserHovered ? 'border-[#A92FFA] bg-[#A92FFA]/5' : 'border-[#A92FFA]/20 bg-background hover:border-[#A92FFA]/50'
                      }`}>
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {isStaffSession ? <Shield className="w-4 h-4" /> : getUserInitials(session.user.name || 'U')}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <div className="hidden xl:flex flex-col items-start mr-1">
                          <span className="text-sm font-bold text-foreground leading-none">
                            {isStaffSession ? 'Staff Portal' : session.user.name}
                          </span>
                          <Badge variant="secondary" className="mt-1 h-4 text-[10px] px-1.5 bg-green-500/10 text-green-600 border-0">
                            {isStaffSession ? (isAdmin ? 'Admin' : 'Staff') : 'Active'}
                          </Badge>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isUserHovered ? 'rotate-180' : ''}`} />
                      </div>

                    <AnimatePresence>
                      {isUserHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-1 w-64 bg-background border-2 border-[#A92FFA]/30 rounded-xl shadow-2xl z-[100] overflow-hidden"
                        >
                            <div className="p-4 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 border-b border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                  {getUserInitials(session.user.name || 'U')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate">{session.user.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-2 space-y-1 bg-background">
                              <AnimatePresence>
                                {isTimerVisible && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ 
                                      opacity: isFadingOut ? 0 : 1, 
                                      height: "auto",
                                      transition: { 
                                        opacity: { duration: isFadingOut ? 5 : 0.3 } 
                                      }
                                    }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3 py-2 text-xs font-semibold text-orange-500 bg-orange-500/10 rounded-lg flex items-center justify-between mb-2 overflow-hidden"
                                  >
                                    <span>Session Expires:</span>
                                    <span className="font-mono">{formattedTime}</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              <AnimatePresence>
                                {showRefresh && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: isFadingOut ? 0 : 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: isFadingOut ? 5 : 0.2 }}
                                    onClick={resetSession}
                                    className="w-full flex items-center px-3 py-2 text-xs font-bold text-white bg-[#F28C28] hover:bg-[#F28C28]/90 rounded-lg transition-all duration-200 mb-2 shadow-sm"
                                  >
                                    <CircleCheck className="w-3 h-3 mr-2" />
                                    REFRESH SESSION
                                  </motion.button>
                                )}
                              </AnimatePresence>

<div className="space-y-0.5">
                                        {/* Admin users see Admin Tools - ONLY if logged in via staff portal with admin-session */}
                                        {canAccessAdminTools && (
                                          <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-gradient-to-r hover:from-[#A92FFA]/10 hover:to-[#F28C28]/10 transition-colors bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5 border border-[#A92FFA]/20">
                                            <Shield className="w-4 h-4 mr-3 text-[#A92FFA]" />
                                            Admin Tools
                                            <span className="ml-auto text-[10px] bg-[#A92FFA] text-white px-1.5 py-0.5 rounded">Default</span>
                                          </Link>
                                        )}
                                        {canAccessAdminTools && (
                                          <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                                            <Settings className="w-4 h-4 mr-3 text-blue-500" />
                                            Admin Settings
                                          </Link>
                                        )}
                                        {/* Staff (non-admin) see Staff Tools - ONLY if logged in via staff portal with staff-session (not admin-session) */}
                                        {canAccessStaffTools && (
                                          <Link href="/staff/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-[#A92FFA]/10 hover:text-[#A92FFA] transition-colors bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5 border border-[#A92FFA]/20">
                                            <Shield className="w-4 h-4 mr-3 text-[#A92FFA]" />
                                            Staff Dashboard
                                            <span className="ml-auto text-[10px] bg-[#F28C28] text-white px-1.5 py-0.5 rounded">Staff</span>
                                          </Link>
                                        )}
                                        {/* Admin users who haven't logged in via staff portal - show prompt */}
                                        {isAdmin && !isAdminSession && (
                                          <Link href="/staff-login?reason=staff-login-required" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-[#F28C28]/10 hover:bg-[#F28C28]/20 transition-colors border border-[#F28C28]/30">
                                            <Shield className="w-4 h-4 mr-3 text-[#F28C28]" />
                                            <span className="text-[#F28C28]">Admin Portal Login Required</span>
                                          </Link>
                                        )}
                                        {/* Staff users who haven't logged in via staff portal - show prompt */}
                                        {isStaffOrAdmin && !isAdmin && !isStaffSession && (
                                          <Link href="/staff-login?reason=staff-login-required" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-[#F28C28]/10 hover:bg-[#F28C28]/20 transition-colors border border-[#F28C28]/30">
                                            <Shield className="w-4 h-4 mr-3 text-[#F28C28]" />
                                            <span className="text-[#F28C28]">Staff Portal Login Required</span>
                                          </Link>
                                        )}
                                        {/* Convict Portal - Only show if user has convict tag AND is not admin (admin has their own tools) */}
                                        {hasConvictTag && !isAdmin && (
                                          <Link href="/convict-portal" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-[#F28C28]/10 hover:text-[#F28C28] transition-colors">
                                            <LayoutDashboard className="w-4 h-4 mr-3 text-[#F28C28]" />
                                            Convict Portal
                                          </Link>
                                        )}
                                <Link href="/change-password" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                                  <User className="w-4 h-4 mr-3 text-muted-foreground" />
                                  Account Settings
                                </Link>
                                
                                <div className="pt-2 mt-2 border-t border-border/50">
                                  <button 
                                    onClick={handleSignOut}
                                    className="w-full flex items-center px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 group"
                                  >
                                    <LogOut className="w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1" />
                                    LOG OUT
                                  </button>
                                </div>
                              </div>
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-[#A92FFA] hover:bg-[#A92FFA]/90" asChild>
                      <Link href="/register">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-[#F28C28] text-[#F28C28] hover:bg-[#F28C28]/10">
                      <Link href="/staff-login">
                        <Shield className="w-4 h-4 mr-2" />
                        Staff
                      </Link>
                    </Button>
                  </>
                )}
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-2">
              <AlertCenter />
              
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className={`h-9 w-9 p-0 transition-all duration-500 ${
                  isAnimationPlaying ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''
                }`}
                aria-label="Toggle theme">
              {theme === "dark" ?
                <Sun className={`w-5 h-5 transition-colors duration-500 ${isAnimationPlaying ? 'text-[#F28C28] drop-shadow-[0_0_10px_rgba(242,140,40,0.8)]' : 'text-[#F28C28]'}`} /> :
                <Moon className={`w-5 h-5 transition-colors duration-500 ${isAnimationPlaying ? 'text-[#A92FFA] drop-shadow-[0_0_10px_rgba(169,47,250,0.8)]' : 'text-[#A92FFA]'}`} />
              }
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md text-foreground hover:bg-accent transition-all duration-1000 ${
                hasAnimationCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && hasAnimationCompleted && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-fit min-w-[300px] max-w-[90%] bg-background/95 backdrop-blur-md border-l border-border z-50 lg:hidden flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border/20 flex justify-between items-center bg-background z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 relative">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6 overscroll-contain">
                <div className="flex flex-col space-y-1">
                  {[
                    { name: "Home", href: "/" },
                    { name: "About", href: "/about" },
                    { name: "LDI", href: "/ldi" },
                    { name: "Services", href: "/services" },
                    { name: "Outreach", href: "/outreach" },
                    { name: "Workshops", href: "/workshops" },
                    { name: "Prayer Wall", href: "/prayer-wall" },
                    { name: "Donate", href: "/donations" },
                    { name: "Contact", href: "/contact" },
                  ].map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="py-3 px-4 text-lg font-medium hover:bg-accent rounded-lg transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-border/20 space-y-4">
                  {isPending ? (
                    <div className="w-full h-12 bg-muted animate-pulse rounded-lg" />
                  ) : session?.user ? (
                      <div className="space-y-4">
                          <div 
                              className="p-4 bg-background relative overflow-hidden rounded-xl border-2 border-[#A92FFA]/30 shadow-lg transition-all duration-300 cursor-pointer select-none"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newState = !isMobileCardHovered;
                                setIsMobileCardHovered(newState);
                                // Auto-scroll to show expanded content when expanding
                                if (newState) {
                                  setTimeout(() => {
                                    const scrollContainer = document.querySelector('.overflow-y-auto.scrollbar-hide');
                                    if (scrollContainer) {
                                      const cardElement = e.currentTarget;
                                      const cardBottom = cardElement.getBoundingClientRect().bottom;
                                      const containerRect = scrollContainer.getBoundingClientRect();
                                      // Scroll the card into better view when expanded
                                      scrollContainer.scrollTo({ 
                                        top: scrollContainer.scrollTop + 200, 
                                        behavior: 'smooth' 
                                      });
                                    }
                                  }, 150);
                                }
                              }}
                            >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5 pointer-events-none" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                {isStaffSession ? <Shield className="w-6 h-6" /> : getUserInitials(session.user.name || 'U')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{isStaffSession ? 'Staff Portal' : session.user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Badge variant="secondary" className="w-full justify-center text-xs bg-green-500 text-white border-0 font-bold py-1">
                                <CircleCheck className="w-3 h-3 mr-1" />
                                {isStaffSession ? (isAdmin ? 'Admin Active' : 'Staff Active') : 'Session Active'}
                              </Badge>

                            <AnimatePresence>
                              {isTimerVisible && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ 
                                    opacity: isFadingOut ? 0 : 1, 
                                    height: "auto",
                                    transition: { opacity: { duration: isFadingOut ? 5 : 0.3 } }
                                  }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-3 py-2 text-xs font-semibold text-orange-500 bg-orange-500/10 rounded-lg flex items-center justify-between overflow-hidden"
                                >
                                  <span>Expires:</span>
                                  <span className="font-mono">{formattedTime}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <AnimatePresence>
                              {showRefresh && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: isFadingOut ? 0 : 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: isFadingOut ? 5 : 0.2 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetSession();
                                  }}
                                  className="w-full flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-[#F28C28] hover:bg-[#F28C28]/90 rounded-lg transition-all shadow-sm"
                                >
                                  <CircleCheck className="w-3 h-3 mr-2" />
                                  REFRESH SESSION
                                </motion.button>
                              )}
                            </AnimatePresence>

                            <AnimatePresence>
                              {isMobileCardHovered && (
<motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: "auto" }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="space-y-1 pt-2 border-t border-border/20 overflow-hidden"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {/* Admin users see Admin Tools - ONLY if logged in via staff portal with admin-session */}
                                              {canAccessAdminTools && (
                                                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-gradient-to-r hover:from-[#A92FFA]/10 hover:to-[#F28C28]/10 text-sm font-medium transition-colors bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5 border border-[#A92FFA]/20">
                                                  <Shield className="w-4 h-4 mr-3 text-[#A92FFA]" />
                                                  Admin Tools
                                                  <span className="ml-auto text-[10px] bg-[#A92FFA] text-white px-1.5 py-0.5 rounded">Default</span>
                                                </Link>
                                              )}
                                              {canAccessAdminTools && (
                                                <Link href="/admin/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-blue-500/10 text-sm font-medium transition-colors">
                                                  <Settings className="w-4 h-4 mr-3 text-blue-500" />
                                                  Admin Settings
                                                </Link>
                                              )}
                                              {/* Staff (non-admin) see Staff Tools - ONLY if logged in via staff portal with staff-session (not admin-session) */}
                                              {canAccessStaffTools && (
                                                <Link href="/staff/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-[#A92FFA]/10 text-sm font-medium transition-colors bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5 border border-[#A92FFA]/20">
                                                  <Shield className="w-4 h-4 mr-3 text-[#A92FFA]" />
                                                  Staff Dashboard
                                                  <span className="ml-auto text-[10px] bg-[#F28C28] text-white px-1.5 py-0.5 rounded">Staff</span>
                                                </Link>
                                              )}
                                              {/* Admin users who haven't logged in via staff portal - show prompt */}
                                              {isAdmin && !isAdminSession && (
                                                <Link href="/staff-login?reason=staff-login-required" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg bg-[#F28C28]/10 hover:bg-[#F28C28]/20 text-sm font-medium transition-colors border border-[#F28C28]/30">
                                                  <Shield className="w-4 h-4 mr-3 text-[#F28C28]" />
                                                  <span className="text-[#F28C28]">Admin Portal Login Required</span>
                                                </Link>
                                              )}
                                              {/* Staff users who haven't logged in via staff portal - show prompt */}
                                              {isStaffOrAdmin && !isAdmin && !isStaffSession && (
                                                <Link href="/staff-login?reason=staff-login-required" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg bg-[#F28C28]/10 hover:bg-[#F28C28]/20 text-sm font-medium transition-colors border border-[#F28C28]/30">
                                                  <Shield className="w-4 h-4 mr-3 text-[#F28C28]" />
                                                  <span className="text-[#F28C28]">Staff Portal Login Required</span>
                                                </Link>
                                              )}
                                              {/* Convict Portal - Only show if user has convict tag AND is not admin */}
                                              {hasConvictTag && !isAdmin && (
                                                <Link href="/convict-portal" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-[#F28C28]/10 text-sm font-medium transition-colors">
                                                  <LayoutDashboard className="w-4 h-4 mr-3 text-[#F28C28]" />
                                                  Convict Portal
                                                </Link>
                                              )}
                                    <Link href="/change-password" onClick={() => setIsMenuOpen(false)} className="flex items-center p-2 rounded-lg hover:bg-accent text-sm font-medium transition-colors">
                                      <User className="w-4 h-4 mr-3 text-muted-foreground" />
                                      Account Settings
                                    </Link>
                                    <button
                                      className="w-full flex items-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all group"
                                      onClick={() => {
                                        handleSignOut();
                                        setIsMenuOpen(false);
                                      }}
                                    >
                                      <LogOut className="w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1" />
                                      LOG OUT
                                    </button>
                                  </motion.div>
                              )}
                            </AnimatePresence>
                            
                            {!isMobileCardHovered && (
                              <div className="text-center pt-1 animate-pulse">
                                <ChevronDown className="w-4 h-4 mx-auto text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" className="w-full h-12 text-lg" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href="/login">
                          <LogIn className="w-5 h-5 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full h-12 text-lg bg-[#A92FFA] hover:bg-[#A92FFA]/90" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href="/register">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Register
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full h-12 text-lg border-[#F28C28] text-[#F28C28]" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href="/staff-login">
                          <Shield className="w-5 h-5 mr-2" />
                          Staff Portal
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
