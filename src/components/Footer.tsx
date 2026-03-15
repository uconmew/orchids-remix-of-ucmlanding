"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Sun, Moon, User, LogOut, LogIn, UserPlus, Shield, CircleCheck, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

function getStaffSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('staff-session=true'));
}

export default function Footer() {
  const { theme, toggleTheme } = useTheme();
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  
  // Role-based state
  const [roleLevel, setRoleLevel] = useState<number | null>(null);
  const [permissionClearance, setPermissionClearance] = useState<number>(0);
  const [isStaffSession, setIsStaffSession] = useState(false);

  // Fetch user role on session change
  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user-roles?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const highestRole = data.reduce((prev: any, curr: any) => 
                (curr.roleLevel < prev.roleLevel) ? curr : prev
              );
              setRoleLevel(highestRole.roleLevel || null);
              const maxPermission = Math.max(...data.map((r: any) => r.permissionClearance || 0));
              setPermissionClearance(maxPermission);
            } else {
              setRoleLevel(null);
              setPermissionClearance(0);
            }
          }
        } catch (error) {
          setRoleLevel(null);
          setPermissionClearance(0);
        }
      }
    };
    fetchUserRole();
  }, [session?.user?.id]);

  // Staff = role level 1-5 OR permission clearance >= 25
  // Admin = role level 1-2 OR permission clearance >= 75
  const isStaffOrAdmin = (roleLevel !== null && roleLevel <= 5) || permissionClearance >= 25;
  const isAdmin = (roleLevel !== null && roleLevel <= 2) || permissionClearance >= 75;

  // Check if logged in via staff portal (cookie-based)
  useEffect(() => {
    if (session?.user?.id) {
      setIsStaffSession(getStaffSessionCookie());
    } else {
      setIsStaffSession(false);
    }
  }, [session?.user?.id]);

  // Staff tools are only accessible if user logged in via staff portal
  const canAccessStaffTools = isStaffOrAdmin && isStaffSession;
  const canAccessAdminTools = isAdmin && isStaffSession;

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch(); // Update session state
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 border-b border-border pb-8">
          {/* Brand Section */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start space-x-4">
              {/* Social Icons - Vertical Column (LEFT SIDE) */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="Facebook" className="!text-orange-500">
                    <Facebook className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="Instagram" className="!text-orange-500">
                    <Instagram className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="Twitter" className="!text-orange-500">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="#" aria-label="YouTube" className="!text-orange-500">
                    <Youtube className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              
              {/* Logo + Title + Mission Statement (RIGHT SIDE) */}
              <div className="flex flex-col items-center space-y-3 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png"
                      alt="UCon Ministries Logo"
                      fill
                      className="object-contain" />
                  </div>
                  <h3 className="text-xl font-bold !whitespace-pre-line !text-orange-500">United Convict Ministries Inc.</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Transforming feelings of worthlessness into enduring purpose and dignity through unconditional connection and Christ's love.
                </p>
              </div>
            </div>
          </div>

            {/* Links Section - Single Row across full width */}
            <div className="flex flex-col md:flex-row flex-wrap justify-between gap-8 lg:gap-16 w-full mt-8 md:mt-0">
              {/* Ministry & Programs */}
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-lg font-semibold mb-4 border-b border-[#A92FFA]/20 pb-2">Ministry</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/ldi" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      LDI Program
                    </Link>
                  </li>
                  <li>
                    <Link href="/ldi-waitlist" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      LDI Waitlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Open Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/outreach" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Outreach
                    </Link>
                  </li>
                  <li>
                    <Link href="/workshops" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Workshops
                    </Link>
                  </li>
                  <li>
                    <Link href="/community-coalition" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Community Coalition
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources & Support */}
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-lg font-semibold mb-4 border-b border-[#F28C28]/20 pb-2">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/prayer-wall" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      Prayer Wall
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      Resource Hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      News & Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      Events Calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm text-muted-foreground hover:text-[#F28C28] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#F28C28]" />
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Get Involved */}
              <div className="flex-1 min-w-[150px]">
                <h4 className="text-lg font-semibold mb-4 border-b border-[#A92FFA]/20 pb-2">Get Involved</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/volunteer" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Volunteer
                    </Link>
                  </li>
                  <li>
                    <Link href="/donations" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Donate
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-sm text-muted-foreground hover:text-[#A92FFA] transition-colors flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-[#A92FFA]" />
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
        </div>

        {/* Contact Info Bar */}
        <div className="py-6 border-t border-b border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">2000 S Colorado Blvd T1 Ste 2
                </span>
              </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <a href="tel:+17206639243" className="text-sm text-muted-foreground hover:text-primary transition-colors !whitespace-pre-line !whitespace-pre-line">720.663.9243

              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <a href="mailto:info@uconministries.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                info@uconministries.org
              </a>
            </div>
          </div>
        </div>

        {/* Auth & Theme Section */}
        <div className="py-6 border-b border-border mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                aria-label="Toggle theme">
                {theme === "dark" ?
                <Sun className="w-5 h-5 text-[#F28C28]" /> :
                <Moon className="w-5 h-5 text-[#A92FFA]" />
                }
              </Button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              {isPending ?
              <div className="w-32 h-9 bg-muted animate-pulse rounded-md" /> :
              session?.user ?
              // ENHANCED: Contemporary logged-in user display
              <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-10 px-3 border-2 border-[#A92FFA]/20 bg-gradient-to-r from-[#A92FFA]/5 to-[#F28C28]/5 hover:from-[#A92FFA]/10 hover:to-[#F28C28]/10 transition-all duration-300 shadow-sm hover:shadow-md">
                        {/* User Avatar with Initials */}
                        <div className="relative">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {getUserInitials(session.user.name || 'U')}
                          </div>
                          {/* Online Status Indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground leading-none">
                            {session.user.name}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className="mt-1 h-4 text-[10px] px-1.5 bg-[#A92FFA]/10 text-[#A92FFA] border-0">
                            <CircleCheck className="w-2.5 h-2.5 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                              {getUserInitials(session.user.name || 'U')}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground leading-tight">
                                {session.user.name}
                              </p>
                              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="w-fit text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                            <CircleCheck className="w-3 h-3 mr-1" />
                            Session Active
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
<DropdownMenuSeparator />
                              {/* Admin users see Admin Tools - ONLY if logged in via staff portal */}
                              {canAccessAdminTools && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href="/admin" className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-[#A92FFA]" />
                                    <span>Admin Tools</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {canAccessAdminTools && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href="/admin/staff" className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-[#A92FFA]" />
                                    <span>Staff Tools</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {canAccessAdminTools && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href="/admin/settings" className="flex items-center">
                                    <Settings className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>Admin Settings</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {/* Staff (non-admin) see Staff Tools - ONLY if logged in via staff portal */}
                              {canAccessStaffTools && !canAccessAdminTools && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href="/admin" className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-[#A92FFA]" />
                                    <span>Staff Tools</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {/* Staff/Admin users who haven't logged in via staff portal - show prompt */}
                              {isStaffOrAdmin && !isStaffSession && (
                                <DropdownMenuItem asChild className="cursor-pointer bg-[#F28C28]/10 hover:bg-[#F28C28]/20">
                                  <Link href="/staff-login?reason=staff-login-required" className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-[#F28C28]" />
                                    <span className="text-[#F28C28]">Staff Portal Login Required</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {/* Everyone sees Convict Portal */}
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/convict-portal" className="flex items-center">
                                  <LayoutDashboard className="w-4 h-4 mr-2 text-[#F28C28]" />
                                  <span>Convict Portal</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> :

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
              }
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UCon Ministries. All rights reserved. | Transforming Lives Since 2024
          </p>
        </div>
      </div>
    </footer>);

}