"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ChevronRight, Check, Users, Calendar, ClipboardList, Megaphone, UserCheck, CalendarDays, FileText, Heart, Settings, BookOpen, Radio, Handshake, Cross, Brain, Lock, AlertTriangle, Tag, RefreshCcw, Loader2, Truck, Utensils, Home, MessageSquare, Stethoscope, GraduationCap, HandHeart, Plus, Minus, Search, Info, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { RESOURCE_DESCRIPTIONS, ACTION_DESCRIPTIONS, ResourceType, ActionType } from "@/lib/permissions";
import { PROGRAM_TAGS, PROGRAM_TAG_IDS, POSITION_TAGS, ALL_PROGRAM_PERMISSIONS, ProgramTagDefinition, ProgramPermission, CONVICT_DEFAULT_PERMISSIONS } from "@/lib/program-tags";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  description: string;
  level: number;
  createdAt: string;
}

interface RolePermission {
  id: number;
  roleId: number;
  resource: string;
  action: string;
  createdAt: string;
}

interface TagStats {
  tagCounts: { tag: string; count: number }[];
  totalUsers: number;
  usersWithTags: number;
  usersWithoutTags: number;
  tagDefinitions: Record<string, string>;
  tagRules: { level: number; tags: string[]; description: string }[];
}

interface ProgramTagUser {
  id: string;
  name: string;
  email: string;
  registrationNumber: string | null;
  programTags: { programTagId: string; isActive: boolean }[];
  programDuties: { dutyKey: string; programTagId: string; isActive: boolean }[];
  role?: { permissionClearance: number; dutyClearance: number };
}

// Clearance level descriptions for point system
const CLEARANCE_POINT_INFO = {
  0: { label: "Convict (Auto)", color: "bg-gray-500", description: "Default permissions for all registered users" },
  10: { label: "Basic Volunteer", color: "bg-green-500", description: "Entry-level volunteer duties" },
  15: { label: "Volunteer", color: "bg-green-600", description: "Standard volunteer capabilities" },
  20: { label: "Volunteer+", color: "bg-blue-500", description: "Enhanced volunteer with training" },
  25: { label: "Senior Volunteer", color: "bg-blue-600", description: "Experienced volunteer" },
  30: { label: "Lead Volunteer", color: "bg-indigo-500", description: "Can mentor others" },
  35: { label: "Staff Entry", color: "bg-purple-500", description: "Basic staff duties" },
  40: { label: "Staff", color: "bg-purple-600", description: "Standard staff capabilities" },
  45: { label: "Senior Staff", color: "bg-violet-500", description: "Enhanced staff responsibilities" },
  50: { label: "Supervisor", color: "bg-orange-500", description: "Supervisory duties" },
  55: { label: "Manager", color: "bg-orange-600", description: "Management capabilities" },
  60: { label: "Director", color: "bg-red-500", description: "Director-level access" },
  75: { label: "Executive", color: "bg-red-600", description: "Executive privileges" },
  90: { label: "Admin", color: "bg-gray-800", description: "Full administrative access" },
};

// Resource icon mapping (includes program tags as categories)
const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  members: Users,
  convicts: Users,
  workshops: BookOpen,
  sessions: Radio,
  attendance: ClipboardList,
  outreach: Megaphone,
  ministry: Handshake,
  pastoral: Cross,
  mental_health: Brain,
  volunteers: UserCheck,
  events: CalendarDays,
  content: FileText,
  prayers: Heart,
  system: Settings,
  // Program Tags as Permission Categories
  transit: Truck,
  nourish: Utensils,
  haven: Home,
  voice: MessageSquare,
  neighbors: Users,
  steps: Stethoscope,
  awaken: BookOpen,
  shepherd: Heart,
  equip: GraduationCap,
  bridge: HandHeart,
};

// Resource display order (function-based and ministry resources first, then program categories)
const resourceOrder = [
  'sessions',
  'attendance',
  'ministry',
  'pastoral',
  'mental_health',
  'outreach',
  'convicts',
  'workshops',
  'volunteers',
  'events',
  'content',
  'prayers',
  'system',
  'members', // Legacy, kept for backwards compatibility
  // Program Permission Categories (Track 3 - Outreach)
  'transit',
  'nourish',
  'haven',
  'voice',
  'neighbors',
  'steps',
  // Program Permission Categories (Track 2 - Open Services)
  'awaken',
  'shepherd',
  'equip',
  'bridge',
];

// Sensitive/confidential resources that need special highlighting
const sensitiveResources = ['pastoral', 'mental_health'];

// Program-based resources (tied to clearance point system)
const programResources = ['transit', 'nourish', 'haven', 'voice', 'neighbors', 'steps', 'awaken', 'shepherd', 'equip', 'bridge'];

// Track classifications for program resources
const outreachPrograms = ['transit', 'nourish', 'haven', 'voice', 'neighbors', 'steps'];
const openServicePrograms = ['awaken', 'shepherd', 'equip', 'bridge'];

// Program tag icons mapping
const programTagIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'web:transit': Truck,
  'web:nourish': Utensils,
  'web:haven': Home,
  'web:voice': MessageSquare,
  'web:neighbors': Users,
  'web:steps': Stethoscope,
  'web:awaken': BookOpen,
  'web:shepherd': Heart,
  'web:equip': GraduationCap,
  'web:bridge': HandHeart,
};

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [allPermissions, setAllPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagStats, setTagStats] = useState<TagStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Program Tags state
  const [programTagUsers, setProgramTagUsers] = useState<ProgramTagUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProgramTagUser | null>(null);
  const [programTagSearch, setProgramTagSearch] = useState("");
  const [loadingProgramTags, setLoadingProgramTags] = useState(false);
  const [savingProgramTags, setSavingProgramTags] = useState(false);
  const [mainTab, setMainTab] = useState<'roles' | 'program-tags'>('roles');

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
    fetchTagStats();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.id);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (mainTab === 'program-tags') {
      fetchProgramTagUsers();
    }
  }, [mainTab]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/roles", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        if (data.length > 0 && !selectedRole) {
          setSelectedRole(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/role-permissions?roleId=${roleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setRolePermissions(data);
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/role-permissions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setAllPermissions(data);
      }
    } catch (error) {
      console.error("Error fetching all permissions:", error);
    }
  };

  const fetchTagStats = async () => {
    try {
      const response = await fetch("/api/role-tags/sync");
      if (response.ok) {
        const data = await response.json();
        setTagStats(data);
      }
    } catch (error) {
      console.error("Error fetching tag stats:", error);
    }
  };

  const syncAllTags = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/role-tags/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncAll: true }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchTagStats();
      } else {
        toast.error("Failed to sync tags");
      }
    } catch (error) {
      console.error("Error syncing tags:", error);
      toast.error("Failed to sync tags");
} finally {
        setSyncing(false);
      }
    };

  const fetchProgramTagUsers = async () => {
    setLoadingProgramTags(true);
    try {
      const response = await fetch("/api/program-tags");
      if (response.ok) {
        const data = await response.json();
        setProgramTagUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching program tag users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingProgramTags(false);
    }
  };

  const toggleProgramTag = async (userId: string, programTagId: string, hasTag: boolean) => {
    setSavingProgramTags(true);
    try {
      if (hasTag) {
        await fetch("/api/program-tags", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, programTagId }),
        });
      } else {
        await fetch("/api/program-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, programTagId }),
        });
      }
      fetchProgramTagUsers();
      toast.success(hasTag ? "Tag removed" : "Tag added");
    } catch (error) {
      console.error("Error toggling program tag:", error);
      toast.error("Failed to update tag");
    } finally {
      setSavingProgramTags(false);
    }
  };

  const toggleDuty = async (userId: string, dutyKey: string, programTagId: string, hasDuty: boolean) => {
    setSavingProgramTags(true);
    try {
      await fetch("/api/program-tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          dutyKey,
          programTagId,
          action: hasDuty ? "remove" : "add",
        }),
      });
      fetchProgramTagUsers();
      toast.success(hasDuty ? "Duty removed" : "Duty added");
    } catch (error) {
      console.error("Error toggling duty:", error);
      toast.error("Failed to update duty");
    } finally {
      setSavingProgramTags(false);
    }
  };

  const userHasProgramTag = (user: ProgramTagUser, tagId: string) => {
    return user.programTags.some(t => t.programTagId === tagId && t.isActive);
  };

  const userHasDuty = (user: ProgramTagUser, dutyKey: string, programTagId?: string) => {
    return user.programDuties.some(d => 
      d.dutyKey === dutyKey && 
      d.isActive && 
      (!programTagId || d.programTagId === programTagId || d.programTagId === 'global')
    );
  };

  const filteredProgramTagUsers = programTagUsers.filter(u =>
    u.name?.toLowerCase().includes(programTagSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(programTagSearch.toLowerCase()) ||
    u.registrationNumber?.toLowerCase().includes(programTagSearch.toLowerCase())
  );

    const getRoleLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      1: "bg-red-600",
      2: "bg-orange-600",
      3: "bg-yellow-600",
      4: "bg-green-600",
      5: "bg-blue-600",
    };
    return colors[level] || "bg-gray-600";
  };

  // Group permissions by resource
  const groupPermissionsByResource = () => {
    const grouped: Record<string, { resource: string; action: string }[]> = {};
    
    // Get unique resource-action pairs from all permissions
    const uniquePairs = new Map<string, { resource: string; action: string }>();
    allPermissions.forEach((perm) => {
      const key = `${perm.resource}:${perm.action}`;
      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, { resource: perm.resource, action: perm.action });
      }
    });
    
    uniquePairs.forEach((pair) => {
      if (!grouped[pair.resource]) {
        grouped[pair.resource] = [];
      }
      grouped[pair.resource].push(pair);
    });
    
    return grouped;
  };

  const hasPermission = (resource: string, action: string) => {
    return rolePermissions.some((rp) => rp.resource === resource && rp.action === action);
  };

  const getResourceDescription = (resource: string): string => {
    return RESOURCE_DESCRIPTIONS[resource as ResourceType] || resource;
  };

  const getActionDescription = (action: string): string => {
    return ACTION_DESCRIPTIONS[action as ActionType] || action;
  };

  const groupedPermissions = groupPermissionsByResource();
  
  // Sort resources by defined order
  const sortedResources = Object.keys(groupedPermissions).sort((a, b) => {
    const indexA = resourceOrder.indexOf(a);
    const indexB = resourceOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Function-based access control - permissions align with actual job duties
          </p>
          
          {/* Main Tabs */}
          <div className="mt-4">
            <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'roles' | 'program-tags')}>
              <TabsList>
                <TabsTrigger value="roles" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Role Hierarchy
                </TabsTrigger>
                <TabsTrigger value="program-tags" className="gap-2">
                  <Tag className="w-4 h-4" />
                  Program Tags
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {mainTab === 'roles' ? (
          <>
          <div className="space-y-3 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Function-Based Model:</strong> Both volunteers and staff receive permissions based on their assigned duties - not just their role level.
                If you don't facilitate sessions, you don't get moderator permissions. If you're not taking attendance, you don't get attendance system access.
              </p>
            </div>
            
            {/* Ministry Duty Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Handshake className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Ministry</span>
                </div>
                <p className="text-xs text-muted-foreground">Support, teaching, discipleship</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Outreach</span>
                </div>
                <p className="text-xs text-muted-foreground">Field work, resource distribution</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Cross className="w-4 h-4 text-amber-500" />
                  <Lock className="w-3 h-3 text-amber-500" />
                <span className="text-sm font-medium">Pastoral</span>
              </div>
              <p className="text-xs text-muted-foreground">Counseling, visits (confidential)</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-emerald-500" />
                <Lock className="w-3 h-3 text-emerald-500" />
                <span className="text-sm font-medium">Mental Health</span>
              </div>
              <p className="text-xs text-muted-foreground">Peer support, referrals (privacy-compliant)</p>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Privacy & Legal Compliance</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Pastoral</strong> permissions maintain clergy-penitent privilege standards.
                  <strong> Mental Health</strong> permissions follow HIPAA-style confidentiality and are law-abiding.
                  All sensitive data access requires explicit duty assignment - never automatic based on role level.
                </p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Role Hierarchy Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <CardDescription>
            5-level hierarchy from Executive Leadership to Volunteers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles
              .sort((a, b) => a.level - b.level)
              .map((role, index) => (
                <div key={role.id}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 ${getRoleLevelColor(role.level)} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {role.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{role.name}</h3>
                        <Badge variant="outline">Level {role.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedRole?.id === role.id ? "default" : "outline"}
                      onClick={() => setSelectedRole(role)}
                    >
                      View Permissions
                    </Button>
                  </div>
                  {index < roles.length - 1 && (
                    <div className="ml-5 my-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
))}
            </div>
          </CardContent>
        </Card>

        {/* Role Tags Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#A92FFA] rounded-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Role Tags</CardTitle>
                  <CardDescription>
                    Access tags automatically assigned based on role level
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={syncAllTags}
                disabled={syncing}
                variant="outline"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Sync All Tags
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tagStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-[#A92FFA]">{tagStats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{tagStats.usersWithTags}</p>
                    <p className="text-sm text-muted-foreground">With Tags</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-amber-600">{tagStats.usersWithoutTags}</p>
                    <p className="text-sm text-muted-foreground">Without Tags</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Tag Types</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {['admin', 'staff', 'convict'].map((tag) => {
                    const count = tagStats.tagCounts.find(t => t.tag === tag)?.count || 0;
                    const colors: Record<string, string> = {
                      admin: 'bg-red-500',
                      staff: 'bg-blue-500',
                      convict: 'bg-green-500',
                    };
                    return (
                      <div key={tag} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${colors[tag]} text-white capitalize`}>{tag}</Badge>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tagStats.tagDefinitions[tag]}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-3">Tag Assignment Rules</h4>
                  <div className="space-y-2">
                    {tagStats.tagRules.map((rule) => (
                      <div key={rule.level} className="flex items-center gap-3 text-sm">
                        <div className={`w-8 h-8 ${getRoleLevelColor(rule.level)} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                          {rule.level}
                        </div>
                        <span className="font-medium min-w-[150px]">{rule.description}</span>
                        <div className="flex gap-1">
                          {rule.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Loading tag statistics...</p>
            )}
          </CardContent>
        </Card>

        {/* Selected Role Permissions */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${getRoleLevelColor(selectedRole.level)} rounded-full flex items-center justify-center`}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>{selectedRole.name} Permissions</CardTitle>
                <CardDescription>
                  {rolePermissions.length} permission
                  {rolePermissions.length !== 1 ? "s" : ""} granted based on job functions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedResources.length > 0 ? (
              <Tabs defaultValue={sortedResources[0]}>
                  <TabsList className="flex flex-wrap h-auto gap-1 justify-start">
                    {sortedResources.map((resource) => {
                      const IconComponent = resourceIcons[resource] || Settings;
                      const grantedCount = groupedPermissions[resource]?.filter(
                        (p) => hasPermission(p.resource, p.action)
                      ).length || 0;
                      const isSensitive = sensitiveResources.includes(resource);
                      const isProgram = programResources.includes(resource);
                      const isOutreach = outreachPrograms.includes(resource);
                      const isOpenService = openServicePrograms.includes(resource);
                      
                      return (
                        <TabsTrigger 
                          key={resource} 
                          value={resource} 
                          className={`capitalize flex items-center gap-1.5 ${
                            isSensitive ? 'border-amber-500/50' : 
                            isOutreach ? 'border-[#A92FFA]/30 hover:border-[#A92FFA]' :
                            isOpenService ? 'border-[#F28C28]/30 hover:border-[#F28C28]' : ''
                          }`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${
                            isOutreach ? 'text-[#A92FFA]' : 
                            isOpenService ? 'text-[#F28C28]' : ''
                          }`} />
                          {resource.replace('_', ' ')}
                          {isSensitive && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                          {isProgram && (
                            <span className={`text-[8px] px-1 rounded ${
                              isOutreach ? 'bg-[#A92FFA]/20 text-[#A92FFA]' : 'bg-[#F28C28]/20 text-[#F28C28]'
                            }`}>
                              {isOutreach ? 'T3' : 'T2'}
                            </span>
                          )}
                          {grantedCount > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                              {grantedCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {sortedResources.map((resource) => {
                    const permissions = groupedPermissions[resource] || [];
                    const grantedCount = permissions.filter((p) => hasPermission(p.resource, p.action)).length;
                    const isSensitive = sensitiveResources.includes(resource);
                    const isProgram = programResources.includes(resource);
                    const isOutreach = outreachPrograms.includes(resource);
                    const isOpenService = openServicePrograms.includes(resource);
                    
                    return (
                      <TabsContent key={resource} value={resource} className="mt-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <div>
                              <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                                {(() => {
                                  const IconComponent = resourceIcons[resource] || Settings;
                                  return <IconComponent className={`w-5 h-5 ${
                                    isOutreach ? 'text-[#A92FFA]' : 
                                    isOpenService ? 'text-[#F28C28]' : 'text-primary'
                                  }`} />;
                                })()}
                                {resource.replace('_', ' ')} Permissions
                                {isSensitive && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-amber-500/20 text-amber-600 border-amber-500/50">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Confidential
                                  </Badge>
                                )}
                                {isProgram && (
                                  <Badge variant="outline" className={`ml-2 text-xs ${
                                    isOutreach 
                                      ? 'bg-[#A92FFA]/20 text-[#A92FFA] border-[#A92FFA]/50' 
                                      : 'bg-[#F28C28]/20 text-[#F28C28] border-[#F28C28]/50'
                                  }`}>
                                    <Tag className="w-3 h-3 mr-1" />
                                    {isOutreach ? 'Track 3' : 'Track 2'}
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {getResourceDescription(resource)}
                              </p>
                          </div>
                          <Badge variant="outline">
                            {grantedCount} / {permissions.length} granted
                          </Badge>
                        </div>
                        
                        {isSensitive && (
                          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 mb-4">
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-amber-600">Privacy Notice:</strong> These permissions involve sensitive information.
                              {resource === 'pastoral' && ' Pastoral counseling maintains clergy-penitent privilege.'}
                              {resource === 'mental_health' && ' Mental health support follows HIPAA-style confidentiality and mandatory reporting requirements.'}
                            </p>
                          </div>
                        )}

                        {/* Program resource info banner */}
                        {programResources.includes(resource) && (
                          <div className={`p-3 rounded-lg border mb-4 ${
                            outreachPrograms.includes(resource) 
                              ? 'bg-[#A92FFA]/10 border-[#A92FFA]/30' 
                              : 'bg-[#F28C28]/10 border-[#F28C28]/30'
                          }`}>
                            <p className="text-xs text-muted-foreground">
                              <strong className={outreachPrograms.includes(resource) ? 'text-[#A92FFA]' : 'text-[#F28C28]'}>
                                {outreachPrograms.includes(resource) ? 'Track 3 - Outreach Program:' : 'Track 2 - Open Services Program:'}
                              </strong> Permissions are controlled by the clearance point system. 
                              Convicts (0 pts) get base access. Elevated permissions require volunteer (15+ pts) or staff (35+ pts) clearance plus assigned duties.
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <PermissionCard
                              key={`${permission.resource}:${permission.action}`}
                              resource={permission.resource}
                              action={permission.action}
                              description={getActionDescription(permission.action)}
                              granted={hasPermission(permission.resource, permission.action)}
                              isSensitive={isSensitive}
                              isProgram={programResources.includes(resource)}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No permissions configured yet.
              </p>
)}
            </CardContent>
          </Card>
        )}
        </>
          ) : (
            /* Program Tags Tab Content - Enhanced with Permission/Duty Management */
            <ProgramTagsManager
              programTagUsers={programTagUsers}
              loadingProgramTags={loadingProgramTags}
              filteredProgramTagUsers={filteredProgramTagUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              programTagSearch={programTagSearch}
              setProgramTagSearch={setProgramTagSearch}
              savingProgramTags={savingProgramTags}
              toggleProgramTag={toggleProgramTag}
              toggleDuty={toggleDuty}
              userHasProgramTag={userHasProgramTag}
              userHasDuty={userHasDuty}
            />
          )}
      </div>
    );
  }

function PermissionCard({
  resource,
  action,
  description,
  granted,
  isSensitive = false,
  isProgram = false,
}: {
  resource: string;
  action: string;
  description: string;
  granted: boolean;
  isSensitive?: boolean;
  isProgram?: boolean;
}) {
  // Highlight function-based permissions
  const isFunctionBased = [
    'engage', 'facilitate', 'moderate', 
    'view_attendance', 'take_attendance', 'manage_attendance',
    'field_work', 'resource_distribution', 'community_liaison',
    'support', 'teach', 'disciple',
    'counsel', 'pray_support', 'crisis_intervention', 'spiritual_guidance', 'visit', 'sacramental',
    'assess', 'peer_support', 'refer', 'document_confidential', 'safety_plan', 'resource_connect'
  ].includes(action);

  // Highlight point-based permissions (program-specific)
  const isPointBased = [
    'request', 'register', 'view_own', 'dispatch', 'manage_inventory',
    'manage_cases', 'lead_meeting', 'mentor', 'generate_reports'
  ].includes(action);

  // Get track info for program resources
  const isOutreach = outreachPrograms.includes(resource);
  const isOpenServices = openServicePrograms.includes(resource);
  
  return (
    <div
      className={`p-4 rounded-lg border ${
        granted
          ? isSensitive 
            ? "border-amber-500 bg-amber-500/5"
            : isProgram && isOutreach
              ? "border-[#A92FFA] bg-[#A92FFA]/5"
              : isProgram && isOpenServices
                ? "border-[#F28C28] bg-[#F28C28]/5"
                : "border-[#A92FFA] bg-[#A92FFA]/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {resource}:{action}
            </code>
            {granted && (
              <Check className={`w-4 h-4 ${
                isSensitive ? 'text-amber-500' : 
                isProgram && isOpenServices ? 'text-[#F28C28]' : 'text-[#A92FFA]'
              }`} />
            )}
            {isFunctionBased && (
              <Badge variant="outline" className="text-xs bg-secondary/20 text-secondary-foreground border-secondary/50">
                Function-Based
              </Badge>
            )}
            {isPointBased && (
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-600 border-blue-500/50">
                <Zap className="w-3 h-3 mr-1" />
                Point-Based
              </Badge>
            )}
            {isProgram && isOutreach && (
              <Badge variant="outline" className="text-xs bg-[#A92FFA]/20 text-[#A92FFA] border-[#A92FFA]/50">
                Track 3
              </Badge>
            )}
            {isProgram && isOpenServices && (
              <Badge variant="outline" className="text-xs bg-[#F28C28]/20 text-[#F28C28] border-[#F28C28]/50">
                Track 2
              </Badge>
            )}
            {isSensitive && granted && (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Program Tags Icons mapping for all 10 programs
const PROGRAM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'web:transit': Truck,
  'web:nourish': Utensils,
  'web:haven': Home,
  'web:voice': MessageSquare,
  'web:neighbors': Users,
  'web:steps': Stethoscope,
  'web:awaken': BookOpen,
  'web:shepherd': Heart,
  'web:equip': GraduationCap,
  'web:bridge': HandHeart,
};

// Program colors
const PROGRAM_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'web:transit': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:nourish': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:haven': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:voice': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:neighbors': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:steps': { border: 'border-[#A92FFA]', bg: 'bg-[#A92FFA]/10', text: 'text-[#A92FFA]' },
  'web:awaken': { border: 'border-[#F28C28]', bg: 'bg-[#F28C28]/10', text: 'text-[#F28C28]' },
  'web:shepherd': { border: 'border-[#F28C28]', bg: 'bg-[#F28C28]/10', text: 'text-[#F28C28]' },
  'web:equip': { border: 'border-[#F28C28]', bg: 'bg-[#F28C28]/10', text: 'text-[#F28C28]' },
  'web:bridge': { border: 'border-[#F28C28]', bg: 'bg-[#F28C28]/10', text: 'text-[#F28C28]' },
};

// Get clearance badge info
function getClearanceBadge(clearance: number) {
  const levels = Object.entries(CLEARANCE_POINT_INFO).reverse();
  for (const [level, info] of levels) {
    if (clearance >= parseInt(level)) {
      return info;
    }
  }
  return CLEARANCE_POINT_INFO[0];
}

interface ProgramTagsManagerProps {
  programTagUsers: ProgramTagUser[];
  loadingProgramTags: boolean;
  filteredProgramTagUsers: ProgramTagUser[];
  selectedUser: ProgramTagUser | null;
  setSelectedUser: (user: ProgramTagUser | null) => void;
  programTagSearch: string;
  setProgramTagSearch: (search: string) => void;
  savingProgramTags: boolean;
  toggleProgramTag: (userId: string, programTagId: string, hasTag: boolean) => void;
  toggleDuty: (userId: string, dutyKey: string, programTagId: string, hasDuty: boolean) => void;
  userHasProgramTag: (user: ProgramTagUser, tagId: string) => boolean;
  userHasDuty: (user: ProgramTagUser, dutyKey: string, programTagId?: string) => boolean;
}

function ProgramTagsManager({
  programTagUsers,
  loadingProgramTags,
  filteredProgramTagUsers,
  selectedUser,
  setSelectedUser,
  programTagSearch,
  setProgramTagSearch,
  savingProgramTags,
  toggleProgramTag,
  toggleDuty,
  userHasProgramTag,
  userHasDuty,
}: ProgramTagsManagerProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'permissions'>('programs');

  const toggleProgramExpanded = (programId: string) => {
    setExpandedPrograms(prev => {
      const next = new Set(prev);
      if (next.has(programId)) {
        next.delete(programId);
      } else {
        next.add(programId);
      }
      return next;
    });
  };

  // Get all permissions for a program by role
  const getProgramPermissionsByRole = (programTagId: string) => {
    const perms = ALL_PROGRAM_PERMISSIONS[programTagId];
    if (!perms) return { convict: [], volunteer: [], staff: [] };
    return perms;
  };

  // Check if user meets clearance for a permission
  const userMeetsClearance = (user: ProgramTagUser, minClearance: number) => {
    return (user.role?.permissionClearance || 0) >= minClearance;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Program Tags System:</strong> Assign program-specific access to users. 
                Only users with <Badge variant="outline" className="mx-1">volunteer</Badge>, 
                <Badge variant="outline" className="mx-1">staff</Badge>, or 
                <Badge variant="outline" className="mx-1">mentor</Badge> tags appear here.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Convicts (all registered users)</strong> automatically receive base permissions for all programs without tag assignment.
                Tags are only needed for elevated volunteer/staff permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Point System Reference */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F28C28]" />
              Clearance Point System Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CLEARANCE_POINT_INFO).slice(0, 8).map(([level, info]) => (
                <Tooltip key={level}>
                  <TooltipTrigger>
                    <Badge variant="outline" className={`${info.color} text-white text-xs`}>
                      {level}+ = {info.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{info.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User List - Narrower */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Eligible Users
              </CardTitle>
              <CardDescription className="text-xs">
                Volunteer/Staff/Mentor only
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={programTagSearch}
                  onChange={(e) => setProgramTagSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingProgramTags ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1">
                    {filteredProgramTagUsers.map((u) => {
                      const clearanceInfo = getClearanceBadge(u.role?.permissionClearance || 0);
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className={`w-full p-2 text-left rounded-lg border transition-colors ${
                            selectedUser?.id === u.id
                              ? "border-[#A92FFA] bg-[#A92FFA]/5"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{u.name}</p>
                            <Badge variant="outline" className={`${clearanceInfo.color} text-white text-[9px] px-1`}>
                              {u.role?.permissionClearance || 0}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {u.programTags.filter(t => t.isActive).slice(0, 4).map((t) => (
                              <span key={t.programTagId} className="text-[8px] px-1 rounded bg-muted">
                                {t.programTagId.replace('web:', '')}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                    {filteredProgramTagUsers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No eligible users found
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Program Tags & Permissions Assignment - Wider */}
          <Card className="lg:col-span-9">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {selectedUser ? selectedUser.name : "Select a User"}
                  </CardTitle>
                  {selectedUser && (
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`${getClearanceBadge(selectedUser.role?.permissionClearance || 0).color} text-white`}>
                        Permission: {selectedUser.role?.permissionClearance || 0}
                      </Badge>
                      <Badge variant="outline">
                        Duty: {selectedUser.role?.dutyClearance || 0}
                      </Badge>
                    </CardDescription>
                  )}
                </div>
                {selectedUser && (
                  <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as any)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="programs" className="text-xs px-3">Programs</TabsTrigger>
                      <TabsTrigger value="permissions" className="text-xs px-3">Permissions</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  {activeSubTab === 'programs' ? (
                    <>
                      {/* Outreach Programs (Track 3) */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-[#A92FFA]" />
                          Track 3 - Outreach Programs (6)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.values(PROGRAM_TAGS).filter(p => p.track === 'outreach').map((program) => {
                            const hasTag = userHasProgramTag(selectedUser, program.id);
                            const IconComponent = PROGRAM_ICONS[program.id] || Tag;
                            const colors = PROGRAM_COLORS[program.id];
                            const perms = getProgramPermissionsByRole(program.id);
                            const totalPerms = perms.volunteer.length + perms.staff.length;
                            
                            return (
                              <Collapsible 
                                key={program.id}
                                open={expandedPrograms.has(program.id)}
                                onOpenChange={() => toggleProgramExpanded(program.id)}
                              >
                                <div
                                  className={`rounded-lg border transition-all ${
                                    hasTag ? `${colors.border} ${colors.bg}` : "border-border hover:border-[#A92FFA]/50"
                                  }`}
                                >
                                  <div
                                    className="p-3 cursor-pointer"
                                    onClick={() => toggleProgramTag(selectedUser.id, program.id, hasTag)}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Checkbox checked={hasTag} className="pointer-events-none" />
                                      <IconComponent className={`w-4 h-4 ${colors.text}`} />
                                      <span className="text-xs font-medium flex-1">{program.name}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{program.description}</p>
                                  </div>
                                  {hasTag && (
                                    <CollapsibleTrigger asChild>
                                      <button className="w-full px-3 pb-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                                        {expandedPrograms.has(program.id) ? (
                                          <ChevronUp className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                        {totalPerms} duties available
                                      </button>
                                    </CollapsibleTrigger>
                                  )}
                                </div>
                                <CollapsibleContent>
                                  <ProgramDutiesPanel
                                    program={program}
                                    user={selectedUser}
                                    permissions={perms}
                                    toggleDuty={toggleDuty}
                                    userHasDuty={userHasDuty}
                                    userMeetsClearance={userMeetsClearance}
                                  />
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </div>
                      </div>

                      {/* Open Services Programs (Track 2) */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#F28C28]" />
                          Track 2 - Open Services Programs (4)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.values(PROGRAM_TAGS).filter(p => p.track === 'open_services').map((program) => {
                            const hasTag = userHasProgramTag(selectedUser, program.id);
                            const IconComponent = PROGRAM_ICONS[program.id] || Tag;
                            const colors = PROGRAM_COLORS[program.id];
                            const perms = getProgramPermissionsByRole(program.id);
                            const totalPerms = perms.volunteer.length + perms.staff.length;
                            
                            return (
                              <Collapsible 
                                key={program.id}
                                open={expandedPrograms.has(program.id)}
                                onOpenChange={() => toggleProgramExpanded(program.id)}
                              >
                                <div
                                  className={`rounded-lg border transition-all ${
                                    hasTag ? `${colors.border} ${colors.bg}` : "border-border hover:border-[#F28C28]/50"
                                  }`}
                                >
                                  <div
                                    className="p-3 cursor-pointer"
                                    onClick={() => toggleProgramTag(selectedUser.id, program.id, hasTag)}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Checkbox checked={hasTag} className="pointer-events-none" />
                                      <IconComponent className={`w-4 h-4 ${colors.text}`} />
                                      <span className="text-xs font-medium flex-1">{program.name}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{program.description}</p>
                                  </div>
                                  {hasTag && (
                                    <CollapsibleTrigger asChild>
                                      <button className="w-full px-3 pb-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                                        {expandedPrograms.has(program.id) ? (
                                          <ChevronUp className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                        {totalPerms} duties available
                                      </button>
                                    </CollapsibleTrigger>
                                  )}
                                </div>
                                <CollapsibleContent>
                                  <ProgramDutiesPanel
                                    program={program}
                                    user={selectedUser}
                                    permissions={perms}
                                    toggleDuty={toggleDuty}
                                    userHasDuty={userHasDuty}
                                    userMeetsClearance={userMeetsClearance}
                                  />
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Duties Summary */}
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Active Duties ({selectedUser.programDuties.filter(d => d.isActive).length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.programDuties.filter(d => d.isActive).length > 0 ? (
                            selectedUser.programDuties.filter(d => d.isActive).map((d) => (
                              <Badge key={`${d.dutyKey}-${d.programTagId}`} variant="secondary" className="text-xs">
                                {d.dutyKey.replace(/_/g, ' ')}
                                {d.programTagId !== 'global' && (
                                  <span className="ml-1 text-[10px] opacity-60">
                                    ({d.programTagId.replace('web:', '')})
                                  </span>
                                )}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No active duties assigned</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Permissions View */
                    <PermissionsOverview user={selectedUser} userHasProgramTag={userHasProgramTag} />
                  )}

                  {savingProgramTags && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a User</p>
                  <p className="text-sm">Choose a user from the list to manage their program tags and duties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Program Duties Panel - Shows assignable duties within a program
function ProgramDutiesPanel({
  program,
  user,
  permissions,
  toggleDuty,
  userHasDuty,
  userMeetsClearance,
}: {
  program: ProgramTagDefinition;
  user: ProgramTagUser;
  permissions: Record<string, ProgramPermission[]>;
  toggleDuty: (userId: string, dutyKey: string, programTagId: string, hasDuty: boolean) => void;
  userHasDuty: (user: ProgramTagUser, dutyKey: string, programTagId?: string) => boolean;
  userMeetsClearance: (user: ProgramTagUser, minClearance: number) => boolean;
}) {
  // Get unique duties from volunteer and staff permissions
  const allDuties = new Map<string, { duty: string; minClearance: number; role: string; description: string }>();
  
  [...(permissions.volunteer || []), ...(permissions.staff || [])].forEach(perm => {
    if (perm.requiredDuty && !allDuties.has(perm.requiredDuty)) {
      allDuties.set(perm.requiredDuty, {
        duty: perm.requiredDuty,
        minClearance: perm.minClearance,
        role: perm.baseRole,
        description: perm.displayName,
      });
    }
  });

  const duties = Array.from(allDuties.values()).sort((a, b) => a.minClearance - b.minClearance);

  if (duties.length === 0) {
    return (
      <div className="p-3 bg-muted/50 rounded-b-lg text-xs text-muted-foreground">
        No specific duties for this program
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted/30 rounded-b-lg space-y-2">
      <p className="text-[10px] text-muted-foreground font-medium mb-2">Assignable Duties:</p>
      <div className="space-y-1">
        {duties.map(({ duty, minClearance, role, description }) => {
          const hasDuty = userHasDuty(user, duty, program.id);
          const meetsClearance = userMeetsClearance(user, minClearance);
          const clearanceInfo = getClearanceBadge(minClearance);
          
          return (
            <div
              key={duty}
              className={`flex items-center gap-2 p-2 rounded border text-xs transition-all ${
                hasDuty 
                  ? "border-green-500 bg-green-500/10" 
                  : meetsClearance 
                    ? "border-border hover:border-muted-foreground cursor-pointer"
                    : "border-border/50 opacity-50"
              }`}
              onClick={() => meetsClearance && toggleDuty(user.id, duty, program.id, hasDuty)}
            >
              <Checkbox checked={hasDuty} disabled={!meetsClearance} className="pointer-events-none" />
              <span className="flex-1 capitalize">{duty.replace(/_/g, ' ')}</span>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className={`text-[9px] ${clearanceInfo.color} text-white`}>
                    {minClearance}+
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Requires {minClearance}+ clearance ({clearanceInfo.label})</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Permissions Overview - Shows all permissions user has across programs
function PermissionsOverview({
  user,
  userHasProgramTag,
}: {
  user: ProgramTagUser;
  userHasProgramTag: (user: ProgramTagUser, tagId: string) => boolean;
}) {
  const userClearance = user.role?.permissionClearance || 0;
  const userDuties = user.programDuties.filter(d => d.isActive).map(d => d.dutyKey);
  const userTags = user.programTags.filter(t => t.isActive).map(t => t.programTagId);

  // Build permission list
  const permissions: { program: string; key: string; name: string; level: string; clearance: number; hasAccess: boolean }[] = [];

  // Add convict default permissions (always have access)
  CONVICT_DEFAULT_PERMISSIONS.forEach(key => {
    const [program] = key.split(':');
    permissions.push({
      program,
      key,
      name: key.split(':')[1]?.replace(/_/g, ' ') || key,
      level: 'Convict',
      clearance: 0,
      hasAccess: true,
    });
  });

  // Add elevated permissions based on tags and clearance
  Object.entries(ALL_PROGRAM_PERMISSIONS).forEach(([programTagId, perms]) => {
    const hasTag = userTags.includes(programTagId);
    if (!hasTag) return;

    [...(perms.volunteer || []), ...(perms.staff || [])].forEach(perm => {
      const meetsClearance = userClearance >= perm.minClearance;
      const hasDuty = !perm.requiredDuty || userDuties.includes(perm.requiredDuty);
      
      permissions.push({
        program: programTagId.replace('web:', ''),
        key: perm.key,
        name: perm.displayName,
        level: perm.baseRole,
        clearance: perm.minClearance,
        hasAccess: meetsClearance && hasDuty,
      });
    });
  });

  // Group by access status
  const activePerms = permissions.filter(p => p.hasAccess);
  const lockedPerms = permissions.filter(p => !p.hasAccess);

  return (
    <div className="space-y-6">
      {/* Active Permissions */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Active Permissions ({activePerms.length})
        </h4>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activePerms.slice(0, 50).map((perm, i) => (
              <div key={`${perm.key}-${i}`} className="p-2 rounded border border-green-500/30 bg-green-500/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{perm.name}</span>
                  <Badge variant="outline" className="text-[9px]">{perm.program}</Badge>
                </div>
                <code className="text-[10px] text-muted-foreground">{perm.key}</code>
              </div>
            ))}
          </div>
          {activePerms.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2">+ {activePerms.length - 50} more permissions</p>
          )}
        </ScrollArea>
      </div>

      {/* Locked Permissions */}
      {lockedPerms.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Locked Permissions ({lockedPerms.length})
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lockedPerms.slice(0, 30).map((perm, i) => (
                <div key={`${perm.key}-${i}`} className="p-2 rounded border border-border bg-muted/30 text-xs opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{perm.name}</span>
                    <Badge variant="outline" className="text-[9px]">{perm.clearance}+ needed</Badge>
                  </div>
                  <code className="text-[10px] text-muted-foreground">{perm.key}</code>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}