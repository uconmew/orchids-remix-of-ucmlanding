"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Search, UserCog, Users, 
  RefreshCw, Crown, Save, X, ChevronDown, ChevronRight,
  Calendar, BookOpen, HandHeart, Utensils, Truck, Home,
  MessageSquare, FileText, Settings, BarChart3, Heart,
  GraduationCap, Briefcase, ClipboardList, Bell, Lock,
  Tag, UserPlus, Fingerprint, Activity, Scale, Compass, Rocket,
  Handshake, Stethoscope, ShieldCheck, Car, Building2
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

// CLIENT-SIDE CONSTANTS (duplicated from role-tags.ts to avoid server-side imports)
const VALID_TAGS = [
  'convict', 'staff', 'admin', 'executive', 'director', 'coordinator', 'mentor', 'volunteer', 'facilitator',
  'counselor', 'chaplain', 'greeter', 'prayer_partner', 'small_group_leader', 'sponsor', 'driver',
  'awaken', 'transit', 'nourish', 'haven', 'voice', 'neighbors', 'steps', 'shepherd', 'equip', 'bridge',
] as const;

type ValidTag = typeof VALID_TAGS[number];

const TAG_CATEGORIES = {
  BASE_ROLE: 'base_role',
  POSITION: 'position',
  PROGRAM: 'program'
} as const;

function getTagCategory(tag: string): string {
  if (['convict', 'staff', 'admin', 'executive', 'director', 'coordinator', 'mentor', 'volunteer'].includes(tag)) {
    return TAG_CATEGORIES.BASE_ROLE;
  }
  if (['counselor', 'chaplain', 'greeter', 'prayer_partner', 'small_group_leader', 'sponsor', 'driver', 'facilitator'].includes(tag)) {
    return TAG_CATEGORIES.POSITION;
  }
  return TAG_CATEGORIES.PROGRAM;
}

interface Role {
  id: number;
  name: string;
  level: number;
  description: string | null;
}

interface UserRole {
  id: number;
  userId: string;
  roleId: number;
  staffTitle: string | null;
  permissionClearance: number;
  dutyClearance: number;
  assignedAt: string;
  assignedBy: string | null;
  isAdmin?: boolean;
  role: Role;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  registrationNumber?: string;
}

interface Convict {
  id: number;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  convictType: string;
  convictRole: string | null;
  status: string;
  clearanceLevel: number;
  dutyClearance: number;
}

interface RolePermission {
  id: number;
  roleId: number;
  resource: string;
  action: string;
}

interface UserTag {
  id: number;
  userId: string;
  tag: string;
  tagCategory: string;
}

const UCON_CLEARANCE_LEVELS = [
  { level: 1, name: "Executive Leadership", description: "Full system access, strategic decisions, executive authority", color: "bg-purple-600", textColor: "text-purple-600" },
  { level: 2, name: "Program Directors", description: "Department oversight, policy management, strategic leadership", color: "bg-orange-500", textColor: "text-orange-500" },
  { level: 3, name: "Ministry Coordinators", description: "Program management, team leadership, operational control", color: "bg-blue-500", textColor: "text-blue-500" },
  { level: 4, name: "Staff Members", description: "Day-to-day operations, direct service delivery", color: "bg-green-500", textColor: "text-green-500" },
  { level: 5, name: "Volunteers", description: "Limited access, supervised activities", color: "bg-gray-500", textColor: "text-gray-500" },
  { level: 6, name: "Mentors", description: "LDI graduates who mentor Convicts", color: "bg-teal-500", textColor: "text-teal-500" },
  { level: 7, name: "Convicts", description: "Registered community members, base level", color: "bg-slate-400", textColor: "text-slate-400" },
];

const CONVICT_DEFAULT_PERMISSIONS = [
  'transit:request_ride', 'transit:view_own_bookings', 'transit:cancel_own_request', 'transit:rate_driver',
  'nourish:request_food_assistance', 'nourish:view_pantry_hours', 'nourish:register_distribution_event',
  'haven:request_housing_assistance', 'haven:view_housing_resources', 'haven:submit_housing_application',
  'voice:request_advocacy', 'voice:submit_testimony', 'voice:join_advocacy_campaign',
  'neighbors:join_community_events', 'neighbors:suggest_projects',
  'steps:join_recovery_meeting', 'steps:request_sponsor', 'steps:access_recovery_resources',
  'awaken:attend_study', 'awaken:view_materials', 'awaken:submit_reflections',
  'shepherd:request_pastoral_counseling', 'shepherd:schedule_counseling', 'shepherd:access_devotionals',
  'equip:register_workshop', 'equip:view_materials', 'equip:submit_assignments',
  'bridge:request_mentor', 'bridge:schedule_meeting', 'bridge:submit_progress',
];

const PERMISSION_CATEGORIES = {
    "UCON TRANSIT (Web)": {
      icon: Truck,
      color: "text-cyan-600",
      permissions: [
        { key: "transit:request_ride", label: "Request Ride" },
        { key: "transit:view_own_bookings", label: "View Own Bookings" },
        { key: "transit:cancel_own_request", label: "Cancel Own Request" },
        { key: "transit:rate_driver", label: "Rate Driver" },
        { key: "transit:view_approved_rides", label: "View Approved Rides (Driver)" },
        { key: "transit:self_assign_driver", label: "Claim Ride (Driver)" },
        { key: "transit:complete_ride", label: "Complete Ride" },
        { key: "transit:log_mileage", label: "Log Mileage" },
        { key: "transit:approve_requests", label: "Approve Requests (Staff)" },
        { key: "transit:assign_drivers", label: "Assign Drivers (Staff)" },
        { key: "transit:manage_fleet", label: "Manage Fleet" },
        { key: "transit:generate_reports", label: "Generate Reports" },
      ]
    },
    "UCON NOURISH (Web)": {
      icon: Utensils,
      color: "text-amber-600",
      permissions: [
        { key: "nourish:request_food_assistance", label: "Request Assistance" },
        { key: "nourish:view_pantry_hours", label: "View Pantry Hours" },
        { key: "nourish:register_distribution_event", label: "Register for Event" },
        { key: "nourish:check_in_recipients", label: "Check-in Recipients (Vol)" },
        { key: "nourish:distribute_food", label: "Record Distribution" },
        { key: "nourish:manage_inventory", label: "Manage Inventory (Staff)" },
        { key: "nourish:create_events", label: "Create Events" },
        { key: "nourish:approve_deliveries", label: "Approve Deliveries" },
      ]
    },
    "UCON HAVEN (Web)": {
      icon: Home,
      color: "text-emerald-600",
      permissions: [
        { key: "haven:request_housing_assistance", label: "Request Assistance" },
        { key: "haven:submit_housing_application", label: "Submit Application" },
        { key: "haven:upload_documents", label: "Upload Documents" },
        { key: "haven:assist_intake", label: "Assist Intake (Vol)" },
        { key: "haven:process_applications", label: "Process Applications (Staff)" },
        { key: "haven:assign_housing", label: "Assign Housing" },
        { key: "haven:manage_waitlist", label: "Manage Waitlist" },
        { key: "haven:case_management", label: "Case Management" },
      ]
    },
    "UCON VOICE (Web)": {
      icon: MessageSquare,
      color: "text-indigo-600",
      permissions: [
        { key: "voice:request_advocacy", label: "Request Advocacy" },
        { key: "voice:submit_testimony", label: "Submit Testimony" },
        { key: "voice:join_advocacy_campaign", label: "Join Campaign" },
        { key: "voice:accompany_to_hearings", label: "Court Accompaniment (Vol)" },
        { key: "voice:document_cases", label: "Document Cases" },
        { key: "voice:represent_at_hearings", label: "Represent at Hearings (Staff)" },
        { key: "voice:coordinate_campaigns", label: "Coordinate Campaigns" },
        { key: "voice:policy_research", label: "Policy Research" },
      ]
    },
    "UCON AWAKEN (Web)": {
      icon: BookOpen,
      color: "text-purple-600",
      permissions: [
        { key: "awaken:attend_study", label: "Attend Study" },
        { key: "awaken:view_materials", label: "View Materials" },
        { key: "awaken:submit_reflections", label: "Submit Reflections" },
        { key: "awaken:lead_small_group", label: "Lead Small Group (Vol)" },
        { key: "awaken:facilitate_discussion", label: "Facilitate Discussion" },
        { key: "awaken:create_study_series", label: "Create Study Series (Staff)" },
        { key: "awaken:develop_curriculum", label: "Develop Curriculum" },
        { key: "awaken:oversee_groups", label: "Oversee All Groups" },
      ]
    },
    "UCON SHEPHERD (Web)": {
      icon: Heart,
      color: "text-red-600",
      permissions: [
        { key: "shepherd:request_pastoral_counseling", label: "Request Counseling" },
        { key: "shepherd:schedule_counseling", label: "Schedule Session" },
        { key: "shepherd:submit_prayer_request", label: "Submit Prayer Request" },
        { key: "shepherd:pray_with_others", label: "Lead Prayer (Vol)" },
        { key: "shepherd:follow_up_calls", label: "Make Follow-up Calls" },
        { key: "shepherd:provide_pastoral_counseling", label: "Provide Counseling (Staff)" },
        { key: "shepherd:crisis_intervention", label: "Crisis Intervention" },
        { key: "shepherd:confidential_case_notes", label: "Manage Confidential Notes" },
      ]
    },
    "UCON EQUIP (Web)": {
      icon: GraduationCap,
      color: "text-orange-600",
      permissions: [
        { key: "equip:register_workshop", label: "Register for Workshop" },
        { key: "equip:view_materials", label: "View Materials" },
        { key: "equip:submit_assignments", label: "Submit Assignments" },
        { key: "equip:assist_facilitator", label: "Assist Facilitator (Vol)" },
        { key: "equip:take_attendance", label: "Take Attendance" },
        { key: "equip:create_workshop", label: "Create Workshop (Staff)" },
        { key: "equip:facilitate_workshop", label: "Facilitate Workshop" },
        { key: "equip:issue_certificates", label: "Issue Certificates" },
      ]
    },
"UCON BRIDGE (Web)": {
    icon: Users,
    color: "text-teal-600",
    permissions: [
      { key: "bridge:request_mentor", label: "Request Mentor" },
      { key: "bridge:schedule_meeting", label: "Schedule Meeting" },
      { key: "bridge:submit_progress", label: "Submit Progress" },
      { key: "bridge:mentor_individuals", label: "Mentor Individuals (Vol)" },
      { key: "bridge:lead_peer_groups", label: "Lead Peer Groups" },
      { key: "bridge:match_mentor_mentee", label: "Match Pairs (Staff)" },
      { key: "bridge:supervise_mentors", label: "Supervise Mentors" },
      { key: "bridge:resolve_conflicts", label: "Resolve Conflicts" },
    ]
  },
  "UCON STEPS (Web)": {
    icon: Activity,
    color: "text-rose-600",
    permissions: [
      { key: "steps:join_recovery_meeting", label: "Join Recovery Meeting" },
      { key: "steps:request_sponsor", label: "Request Sponsor" },
      { key: "steps:submit_step_work", label: "Submit Step Work" },
      { key: "steps:access_recovery_resources", label: "Access Resources" },
      { key: "steps:share_at_meetings", label: "Share at Meetings (Vol)" },
      { key: "steps:sponsor_individuals", label: "Sponsor Individuals" },
      { key: "steps:lead_meeting", label: "Lead Meeting" },
      { key: "steps:coordinate_meetings", label: "Coordinate Meetings (Staff)" },
      { key: "steps:approve_sponsors", label: "Approve Sponsors" },
      { key: "steps:crisis_response", label: "Crisis Response" },
    ]
  },
  "UCON NEIGHBORS (Web)": {
    icon: Handshake,
    color: "text-lime-600",
    permissions: [
      { key: "neighbors:join_community_events", label: "Join Events" },
      { key: "neighbors:suggest_projects", label: "Suggest Projects" },
      { key: "neighbors:register_for_activities", label: "Register for Activities" },
      { key: "neighbors:lead_cleanup_teams", label: "Lead Cleanups (Vol)" },
      { key: "neighbors:organize_block_parties", label: "Organize Events" },
      { key: "neighbors:community_liaison", label: "Community Liaison" },
      { key: "neighbors:approve_projects", label: "Approve Projects (Staff)" },
      { key: "neighbors:manage_partnerships", label: "Manage Partnerships" },
      { key: "neighbors:budget_events", label: "Budget Events" },
    ]
  },
  "System & Staff Admin": {
      icon: Settings,
      color: "text-slate-700",
      permissions: [
        { key: "staff:create", label: "Add Staff" },
        { key: "staff:update", label: "Edit Staff" },
        { key: "staff:delete", label: "Remove Staff" },
        { key: "admin:settings", label: "System Settings" },
        { key: "admin:audit_logs", label: "View Audit Logs" },
        { key: "users:reset_password", label: "Reset Passwords" },
        { key: "hr:employee_files", label: "Access Employee Files" },
        { key: "finance:view_budget", label: "View Budget" },
      ]
    }
};

const DUTY_CATEGORIES = {
    "Program Leadership": {
      icon: Crown,
      color: "text-yellow-600",
      duties: [
        { key: "duty:coordinator", label: "Program Coordinator" },
        { key: "duty:facilitator", label: "Workshop Facilitator" },
        { key: "duty:small_group_leader", label: "Small Group Leader" },
        { key: "duty:director", label: "Program Director" },
        { key: "duty:admin", label: "System Administrator" },
      ]
    },
    "Service Delivery": {
      icon: HandHeart,
      color: "text-pink-500",
      duties: [
        { key: "duty:driver", label: "Transit Driver" },
        { key: "duty:counselor", label: "Pastoral Counselor" },
        { key: "duty:chaplain", label: "Ordained Chaplain" },
        { key: "duty:mentor", label: "LDI Mentor" },
        { key: "duty:sponsor", label: "Recovery Sponsor" },
        { key: "duty:greeter", label: "Welcome & Check-in" },
        { key: "duty:prayer_partner", label: "Prayer Partner" },
      ]
    },
    "In-Person Transit Activities": {
      icon: Car,
      color: "text-cyan-600",
      duties: [
        { key: "inperson:transit:ride_completed", label: "Log Completed Rides" },
        { key: "inperson:transit:ride_canceled", label: "Log Canceled Rides" },
        { key: "inperson:transit:emergency_transport", label: "Emergency Transport" },
        { key: "inperson:transit:vehicle_maintenance", label: "Vehicle Maintenance Log" },
      ]
    },
    "In-Person Nourish Activities": {
      icon: Utensils,
      color: "text-amber-600",
      duties: [
        { key: "inperson:nourish:meal_served", label: "Log Meals Served" },
        { key: "inperson:nourish:food_box_distributed", label: "Log Food Boxes" },
        { key: "inperson:nourish:pantry_visit", label: "Log Pantry Visits" },
        { key: "inperson:nourish:inventory_stocked", label: "Log Inventory Stocking" },
      ]
    },
    "In-Person Haven Activities": {
      icon: Building2,
      color: "text-emerald-600",
      duties: [
        { key: "inperson:haven:shelter_night", label: "Log Shelter Nights" },
        { key: "inperson:haven:housing_placement", label: "Log Housing Placements" },
        { key: "inperson:haven:intake_completed", label: "Log Intakes" },
        { key: "inperson:haven:case_meeting", label: "Log Case Meetings" },
      ]
    },
    "In-Person Steps Activities": {
      icon: Stethoscope,
      color: "text-rose-600",
      duties: [
        { key: "inperson:steps:meeting_held", label: "Log Recovery Meetings" },
        { key: "inperson:steps:sponsorship_meeting", label: "Log Sponsorship Sessions" },
        { key: "inperson:steps:sobriety_milestone", label: "Log Sobriety Milestones" },
        { key: "inperson:steps:crisis_response", label: "Log Crisis Responses" },
      ]
    },
    "In-Person Awaken Activities": {
      icon: BookOpen,
      color: "text-purple-600",
      duties: [
        { key: "inperson:awaken:study_session", label: "Log Bible Studies" },
        { key: "inperson:awaken:small_group", label: "Log Small Groups" },
        { key: "inperson:awaken:testimony_shared", label: "Log Testimonies" },
        { key: "inperson:awaken:new_believer", label: "Log Faith Commitments" },
      ]
    },
    "In-Person Shepherd Activities": {
      icon: Heart,
      color: "text-red-600",
      duties: [
        { key: "inperson:shepherd:counseling_session", label: "Log Counseling Sessions" },
        { key: "inperson:shepherd:prayer_session", label: "Log Prayer Sessions" },
        { key: "inperson:shepherd:hospital_visit", label: "Log Hospital Visits" },
        { key: "inperson:shepherd:crisis_intervention", label: "Log Crisis Interventions" },
      ]
    }
};

export default function AuthorizationManagement() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"staff" | "convicts">("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [staffList, setStaffList] = useState<UserRole[]>([]);
  const [convictsList, setConvictsList] = useState<Convict[]>([]);
  const [allUserTags, setAllUserTags] = useState<UserTag[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  
  const [selectedPerson, setSelectedPerson] = useState<UserRole | Convict | null>(null);
  
  const [editClearanceLevel, setEditClearanceLevel] = useState(5);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editStaffTitle, setEditStaffTitle] = useState("");
  const [editPermissions, setEditPermissions] = useState<Set<string>>(new Set());
  const [editDuties, setEditDuties] = useState<Set<string>>(new Set());
  const [editTags, setEditTags] = useState<Set<string>>(new Set());
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  
  const [expandedPermCategories, setExpandedPermCategories] = useState<Set<string>>(new Set());
  const [expandedDutyCategories, setExpandedDutyCategories] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, staffRes, convictsRes, permissionsRes, tagsRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/user-roles?userId=all"),
        fetch("/api/convicts"),
        fetch("/api/role-permissions?limit=500"),
        fetch("/api/role-tags")
      ]);

      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
      if (convictsRes.ok) {
        const data = await convictsRes.json();
        setConvictsList(data.data || []);
      }
      if (permissionsRes.ok) setRolePermissions(await permissionsRes.json());
      if (tagsRes.ok) setAllUserTags(await tagsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load authorization data");
    } finally {
      setLoading(false);
    }
  };

  const getAllPermissionKeys = () => {
    const allKeys = new Set<string>();
    Object.values(PERMISSION_CATEGORIES).forEach(cat => {
      cat.permissions.forEach(p => allKeys.add(p.key));
    });
    return allKeys;
  };

  const getAllDutyKeys = () => {
    const allKeys = new Set<string>();
    Object.values(DUTY_CATEGORIES).forEach(cat => {
      cat.duties.forEach(d => allKeys.add(d.key));
    });
    return allKeys;
  };

  const selectPerson = (person: UserRole | Convict) => {
    setSelectedPerson(person);
    const userId = 'roleId' in person ? person.userId : person.userId;
    
    // Get user's current tags
    const userTags = allUserTags.filter(t => t.userId === userId).map(t => t.tag);
    setEditTags(new Set(userTags));
    
    // Check if user has admin flag or tag
    const isAdmin = 'isAdmin' in person ? !!person.isAdmin : userTags.includes('admin');
    setEditIsAdmin(isAdmin);
    
    if ('roleId' in person) {
      const cl = Math.max(1, Math.min(7, 7 - Math.floor((person.permissionClearance || 0) / 15)));
      setEditClearanceLevel(cl);
      setEditRoleId(person.roleId);
      setEditStaffTitle(person.staffTitle || "");
      
      const hasAdminAccess = cl === 1 || (person.role?.level && person.role.level >= 80) || isAdmin;
      
      if (hasAdminAccess) {
        setEditPermissions(getAllPermissionKeys());
        setEditDuties(getAllDutyKeys());
      } else {
        const perms = rolePermissions
          .filter(p => p.roleId === person.roleId)
          .map(p => `${p.resource}:${p.action}`);
        setEditPermissions(new Set(perms));
        setEditDuties(new Set());
      }
    } else {
      const cl = Math.max(1, Math.min(7, 7 - Math.floor((person.clearanceLevel || 0) / 15)));
      setEditClearanceLevel(cl);
      setEditRoleId(null);
      setEditStaffTitle(person.convictRole || "");
      
      // Auto-select convict default permissions
      setEditPermissions(new Set(CONVICT_DEFAULT_PERMISSIONS));
      setEditDuties(new Set());
    }
    setExpandedPermCategories(new Set());
    setExpandedDutyCategories(new Set());
  };

  const handleSave = async () => {
    if (!selectedPerson) return;
    setSaving(true);
    
    const clearanceValue = (7 - editClearanceLevel) * 15;
    const userId = 'roleId' in selectedPerson ? selectedPerson.userId : selectedPerson.userId;
    
    // Determine tags to save, including admin if checked
    const tagsToSave = new Set(editTags);
    if (editIsAdmin) {
      tagsToSave.add('admin');
    } else {
      tagsToSave.delete('admin');
    }

    try {
      // 1. Save Clearance and Role
      if ('roleId' in selectedPerson) {
        await fetch(`/api/user-roles/${selectedPerson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              permissionClearance: clearanceValue, 
              dutyClearance: clearanceValue,
              roleId: editRoleId,
              staffTitle: editStaffTitle || null,
              isAdmin: editIsAdmin,
            }),

        });
      } else {
        await fetch(`/api/convicts/${selectedPerson.id}/clearance`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            clearanceLevel: clearanceValue, 
            dutyClearance: clearanceValue,
            convictRole: editStaffTitle || null,
          }),
        });
      }

// 2. Save Tags
        if (userId) {
          await fetch(`/api/role-tags/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              userId, 
              additionalTags: Array.from(tagsToSave) 
            }),
          });
        }

      // 3. Save Permissions (if custom or staff)
      if (editRoleId && editPermissions.size > 0) {
        const permArray = Array.from(editPermissions).map(p => {
          const [resource, action] = p.split(':');
          return { resource, action };
        });
        await fetch(`/api/role-permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: editRoleId, permissions: permArray }),
        });
      }
      
      toast.success("Authorization updated successfully");
      fetchData();
      setSelectedPerson(null);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("An error occurred during save");
    } finally {
      setSaving(false);
    }
  };

  const getClearanceInfo = (level: number) => {
    return UCON_CLEARANCE_LEVELS.find(l => l.level === level) || UCON_CLEARANCE_LEVELS[4];
  };

  const toggleTag = (tag: string) => {
    setEditTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const togglePermCategory = (cat: string) => {
    setExpandedPermCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleDutyCategory = (cat: string) => {
    setExpandedDutyCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const togglePermission = (perm: string) => {
    setEditPermissions(prev => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleDuty = (duty: string) => {
    setEditDuties(prev => {
      const next = new Set(prev);
      if (next.has(duty)) next.delete(duty);
      else next.add(duty);
      return next;
    });
  };

  const toggleAllInCategory = (category: string, type: 'permission' | 'duty') => {
    if (type === 'permission') {
      const cat = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
      if (!cat) return;
      const allKeys = cat.permissions.map(p => p.key);
      const allSelected = allKeys.every(k => editPermissions.has(k));
      setEditPermissions(prev => {
        const next = new Set(prev);
        if (allSelected) allKeys.forEach(k => next.delete(k));
        else allKeys.forEach(k => next.add(k));
        return next;
      });
    } else {
      const cat = DUTY_CATEGORIES[category as keyof typeof DUTY_CATEGORIES];
      if (!cat) return;
      const allKeys = cat.duties.map(d => d.key);
      const allSelected = allKeys.every(k => editDuties.has(k));
      setEditDuties(prev => {
        const next = new Set(prev);
        if (allSelected) allKeys.forEach(k => next.delete(k));
        else allKeys.forEach(k => next.add(k));
        return next;
      });
    }
  };

  const getPersonClearance = (person: UserRole | Convict): number => {
    if ('roleId' in person) {
      return Math.max(1, Math.min(7, 7 - Math.floor((person.permissionClearance || 0) / 15)));
    }
    return Math.max(1, Math.min(7, 7 - Math.floor((person.clearanceLevel || 0) / 15)));
  };

  const filteredStaff = staffList.filter(s =>
    s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staffTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRITICAL FILTER: Only show convicts with volunteer, staff, or mentor tags
  const taggedConvicts = convictsList.filter(c => {
    if (!c.userId) return false;
    const tags = allUserTags.filter(t => t.userId === c.userId).map(t => t.tag);
    return tags.some(tag => ['volunteer', 'staff', 'mentor'].includes(tag));
  });

  const filteredConvicts = taggedConvicts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.convictRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA]" />
            Authorization Control
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Web Service Permissions & Internal Role Auditing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPersonModal(true)} variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50">
            <UserPlus className="w-4 h-4 mr-2" />
            Promote Convict
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "staff" | "convicts")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="staff" className="text-xs">
                    <UserCog className="w-3 h-3 mr-1" />
                    Staff List
                  </TabsTrigger>
                  <TabsTrigger value="convicts" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    Volunteers/Mentors
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tagged users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">Loading...</p>
                ) : activeTab === "staff" ? (
                  filteredStaff.length === 0 ? (
                    <p className="text-center py-4 text-sm text-muted-foreground">No tagged staff found</p>
                  ) : (
                    filteredStaff.map(staff => {
                      const cl = getPersonClearance(staff);
                      const info = getClearanceInfo(cl);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => selectPerson(staff)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedPerson && 'roleId' in selectedPerson && selectedPerson.id === staff.id
                              ? 'bg-[#A92FFA]/10 border border-[#A92FFA]'
                              : 'hover:bg-accent border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${info.color}`}>
                              {cl}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{staff.userName || staff.userId}</p>
                              <p className="text-xs text-muted-foreground truncate">{staff.staffTitle || staff.role?.name}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${info.textColor}`}>
                              {info.name.split(' ')[0]}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  filteredConvicts.length === 0 ? (
                    <p className="text-center py-4 text-sm text-muted-foreground">No tagged volunteers found</p>
                  ) : (
                    filteredConvicts.map(convict => {
                      const cl = getPersonClearance(convict);
                      const info = getClearanceInfo(cl);
                      return (
                        <div
                          key={convict.id}
                          onClick={() => selectPerson(convict)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedPerson && !('roleId' in selectedPerson) && (selectedPerson as Convict).id === convict.id
                              ? 'bg-[#F28C28]/10 border border-[#F28C28]'
                              : 'hover:bg-accent border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${info.color}`}>
                              {cl}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{convict.firstName} {convict.lastName}</p>
                              <p className="text-xs text-muted-foreground truncate">{convict.convictRole || convict.convictType}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${info.textColor}`}>
                              {info.name.split(' ')[0]}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedPerson ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a qualified user to manage access tags</p>
                <p className="text-xs mt-2">Only users with volunteer/staff/mentor tags appear here.</p>
              </div>
            </Card>
          ) : (
            <Card className="max-h-[85vh] overflow-y-auto">
              <CardHeader className="pb-4 sticky top-0 bg-card z-10 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getClearanceInfo(editClearanceLevel).color}`}>
                      {editClearanceLevel}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {'roleId' in selectedPerson 
                          ? (selectedPerson.userName || selectedPerson.userId)
                          : `${(selectedPerson as Convict).firstName} ${(selectedPerson as Convict).lastName}`
                        }
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        {Array.from(editTags).join(', ') || 'No tags assigned'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPerson(null)}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? "Updating..." : "Apply Changes"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
<CardContent className="space-y-8 pt-6">
                      {/* ADMIN CAPABILITIES SECTION */}
                      <div className="p-4 bg-red-500/5 border-2 border-red-500/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 rounded-lg">
                              <ShieldCheck className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                                Admin Capabilities
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Grant full system administrative access (Level 1 authority)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox 
                                checked={editIsAdmin}
                                onCheckedChange={(checked) => {
                                  setEditIsAdmin(!!checked);
                                  if (checked) {
                                    // Grant all permissions when admin is enabled
                                    setEditPermissions(getAllPermissionKeys());
                                    setEditDuties(getAllDutyKeys());
                                    setEditClearanceLevel(1);
                                  }
                                }}
                              />
                              <span className="text-sm font-bold text-red-600">
                                {editIsAdmin ? "Admin Enabled" : "Enable Admin"}
                              </span>
                            </label>
                            {editIsAdmin && (
                              <Badge className="bg-red-600 text-white">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                ADMIN
                              </Badge>
                            )}
                          </div>
                        </div>
                        {editIsAdmin && (
                          <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-700">
                            <strong>Warning:</strong> This user will have full administrative access including system settings, 
                            user management, and all permissions. Use with caution.
                          </div>
                        )}
                      </div>

                      {/* LEVEL OVERRIDE AUTHORITY SECTION */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-500/20 rounded-xl space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <Crown className="w-4 h-4 text-purple-600" />
                          Level Override Authority
                          <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                            Approval Power
                          </Badge>
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          These tags grant elevated decision-making authority beyond standard clearance levels. 
                          Executives can override any decision. Directors can approve audit-level changes.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {/* Executive Tag */}
                          <label className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            editTags.has('executive') 
                              ? 'bg-purple-100 border-purple-500 shadow-lg' 
                              : 'bg-white border-muted hover:border-purple-300'
                          }`}>
                            <Checkbox 
                              checked={editTags.has('executive')} 
                              onCheckedChange={() => toggleTag('executive')}
                            />
                            <Crown className="w-6 h-6 text-purple-600" />
                            <span className="text-xs font-bold text-center">Executive</span>
                            <span className="text-[9px] text-muted-foreground text-center">Full override authority</span>
                          </label>
                          
                          {/* Director Tag */}
                          <label className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            editTags.has('director') 
                              ? 'bg-orange-100 border-orange-500 shadow-lg' 
                              : 'bg-white border-muted hover:border-orange-300'
                          }`}>
                            <Checkbox 
                              checked={editTags.has('director')} 
                              onCheckedChange={() => toggleTag('director')}
                            />
                            <Rocket className="w-6 h-6 text-orange-600" />
                            <span className="text-xs font-bold text-center">Director</span>
                            <span className="text-[9px] text-muted-foreground text-center">Audit approval power</span>
                          </label>
                          
                          {/* Coordinator Tag */}
                          <label className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            editTags.has('coordinator') 
                              ? 'bg-blue-100 border-blue-500 shadow-lg' 
                              : 'bg-white border-muted hover:border-blue-300'
                          }`}>
                            <Checkbox 
                              checked={editTags.has('coordinator')} 
                              onCheckedChange={() => toggleTag('coordinator')}
                            />
                            <Compass className="w-6 h-6 text-blue-600" />
                            <span className="text-xs font-bold text-center">Coordinator</span>
                            <span className="text-[9px] text-muted-foreground text-center">Program-level authority</span>
                          </label>
                        </div>
                      </div>


                    {/* TAGS STACKING SECTION */}
                  <div className="space-y-6">
                    <div className="p-4 bg-[#A92FFA]/5 border border-[#A92FFA]/20 rounded-xl space-y-4">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-[#A92FFA]">
                        <Tag className="w-4 h-4" />
                        Access & Audit Tags (Multiplicative Stacking)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* BASE ROLE TAGS */}
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Base Role Tags</Label>
                          <div className="space-y-1">
                            {VALID_TAGS.filter(t => getTagCategory(t) === TAG_CATEGORIES.BASE_ROLE).map(tag => (
                              <label key={tag} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-muted">
                                <Checkbox 
                                  checked={editTags.has(tag)} 
                                  onCheckedChange={() => toggleTag(tag)}
                                />
                                <span className="text-xs font-medium capitalize">{tag}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* POSITION TAGS */}
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Position Tags (Duties)</Label>
                          <div className="space-y-1">
                            {VALID_TAGS.filter(t => getTagCategory(t) === TAG_CATEGORIES.POSITION).map(tag => (
                              <label key={tag} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-muted">
                                <Checkbox 
                                  checked={editTags.has(tag)} 
                                  onCheckedChange={() => toggleTag(tag)}
                                />
                                <span className="text-xs font-medium capitalize">{tag.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* PROGRAM TAGS */}
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Program Scoping Tags</Label>
                          <div className="space-y-1">
                            {VALID_TAGS.filter(t => getTagCategory(t) === TAG_CATEGORIES.PROGRAM).map(tag => (
                              <label key={tag} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-muted">
                                <Checkbox 
                                  checked={editTags.has(tag)} 
                                  onCheckedChange={() => toggleTag(tag)}
                                />
                                <span className="text-xs font-medium capitalize text-orange-600">{tag}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* CLEARANCE SECTION */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 text-sm font-bold">
                        <Lock className="w-4 h-4 text-[#A92FFA]" />
                        Web Service Clearance (Points System)
                      </Label>
                      <div className="grid grid-cols-7 gap-1.5">
                        {UCON_CLEARANCE_LEVELS.map((level) => (
                          <button
                            key={level.level}
                            onClick={() => {
                              setEditClearanceLevel(level.level);
                              if (level.level === 1) {
                                setEditPermissions(getAllPermissionKeys());
                                setEditDuties(getAllDutyKeys());
                              }
                            }}
                            className={`p-2 rounded-lg border-2 transition-all text-center ${
                              editClearanceLevel === level.level
                                ? `${level.color} text-white border-transparent shadow-lg scale-105`
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                          >
                            <div className="text-lg font-bold">{level.level}</div>
                            <div className="text-[8px] leading-tight mt-0.5 font-bold">{level.name.split(' ')[0]}</div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground">CLEARANCE VALUE</span>
                          <Badge variant="outline" className="text-lg font-mono">{(7 - editClearanceLevel) * 15}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                          {getClearanceInfo(editClearanceLevel).description}
                        </p>
                      </div>
                    </div>

                    {/* ROLE INFO SECTION */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 text-sm font-bold">
                        <Scale className="w-4 h-4 text-[#F28C28]" />
                        Identification & Title
                      </Label>
                      
                      {'roleId' in selectedPerson ? (
                        <div className="space-y-3">
                          <Select 
                            value={editRoleId?.toString() || ""} 
                            onValueChange={(v) => {
                              const roleId = parseInt(v);
                              setEditRoleId(roleId);
                              const perms = rolePermissions
                                .filter(p => p.roleId === roleId)
                                .map(p => `${p.resource}:${p.action}`);
                              setEditPermissions(new Set(perms));
                            }}
                          >
                            <SelectTrigger className="font-medium">
                              <SelectValue placeholder="Select Database Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  <span className="flex items-center gap-2 font-bold">
                                    <Badge variant="outline" className="text-[10px] h-4">L{role.level}</Badge>
                                    {role.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={editStaffTitle}
                            onChange={(e) => setEditStaffTitle(e.target.value)}
                            placeholder="Official Staff Title"
                            className="font-medium"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            value={editStaffTitle}
                            onChange={(e) => setEditStaffTitle(e.target.value)}
                            placeholder="Volunteer Position Title"
                            className="font-bold"
                          />
                          <p className="text-[10px] text-orange-600 font-bold bg-orange-50 p-2 rounded">
                            Notice: This person is managed as a Tagged Volunteer. They do not have a full Staff database role.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PERMISSIONS & DUTIES ACCORDIONS */}
                  <div className="space-y-4">
                    <Tabs defaultValue="permissions" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="permissions" className="font-bold gap-2">
                          <Shield className="w-4 h-4" /> Web Service Access
                        </TabsTrigger>
                        <TabsTrigger value="duties" className="font-bold gap-2">
                          <Activity className="w-4 h-4" /> Physical Duties (Audit)
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="permissions" className="mt-4 space-y-4">
                        <div className="border rounded-xl overflow-hidden divide-y">
                          {Object.entries(PERMISSION_CATEGORIES).map(([category, data]) => {
                            const Icon = data.icon;
                            const isExpanded = expandedPermCategories.has(category);
                            const selectedCount = data.permissions.filter(p => editPermissions.has(p.key)).length;
                            const allSelected = selectedCount === data.permissions.length;
                            
                            return (
                              <div key={category} className={isExpanded ? "bg-muted/10" : ""}>
                                <button
                                  onClick={() => togglePermCategory(category)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                                >
                                  <span className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${data.color.replace('text-', 'bg-')}/10`}>
                                      <Icon className={`w-5 h-5 ${data.color}`} />
                                    </div>
                                    <div className="text-left">
                                      <p className="font-bold text-sm tracking-tight">{category}</p>
                                      <p className="text-[10px] text-muted-foreground">Manage {category.split(' ')[1]} digital features</p>
                                    </div>
                                    {selectedCount > 0 && (
                                      <Badge variant="secondary" className="text-[10px] font-bold">
                                        {selectedCount}
                                      </Badge>
                                    )}
                                  </span>
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                {isExpanded && (
                                  <div className="p-4 pt-0">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                                      <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={() => toggleAllInCategory(category, 'permission')}
                                      />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Toggle All {category}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {data.permissions.map(perm => (
                                        <label
                                          key={perm.key}
                                          className={`flex items-center gap-2 p-2 rounded-lg transition-all border ${
                                            editPermissions.has(perm.key) 
                                              ? 'bg-white border-[#A92FFA]/30 shadow-sm' 
                                              : 'bg-muted/30 border-transparent grayscale opacity-60'
                                          } hover:bg-white cursor-pointer`}
                                        >
                                          <Checkbox
                                            checked={editPermissions.has(perm.key)}
                                            onCheckedChange={() => togglePermission(perm.key)}
                                          />
                                          <span className="text-[11px] font-bold truncate">{perm.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="duties" className="mt-4 space-y-4">
                        <div className="border rounded-xl overflow-hidden divide-y">
                          {Object.entries(DUTY_CATEGORIES).map(([category, data]) => {
                            const Icon = data.icon;
                            const isExpanded = expandedDutyCategories.has(category);
                            const selectedCount = data.duties.filter(d => editDuties.has(d.key)).length;
                            const allSelected = selectedCount === data.duties.length;
                            
                            return (
                              <div key={category} className={isExpanded ? "bg-muted/10" : ""}>
                                <button
                                  onClick={() => toggleDutyCategory(category)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                                >
                                  <span className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${data.color.replace('text-', 'bg-')}/10`}>
                                      <Icon className={`w-5 h-5 ${data.color}`} />
                                    </div>
                                    <div className="text-left">
                                      <p className="font-bold text-sm tracking-tight">{category}</p>
                                      <p className="text-[10px] text-muted-foreground">Internal metric and audit logging</p>
                                    </div>
                                    {selectedCount > 0 && (
                                      <Badge variant="secondary" className="text-[10px] font-bold">
                                        {selectedCount}
                                      </Badge>
                                    )}
                                  </span>
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                {isExpanded && (
                                  <div className="p-4 pt-0">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                                      <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={() => toggleAllInCategory(category, 'duty')}
                                      />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Toggle All {category} Duties</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {data.duties.map(duty => (
                                        <label
                                          key={duty.key}
                                          className={`flex items-center gap-2 p-2 rounded-lg transition-all border ${
                                            editDuties.has(duty.key) 
                                              ? 'bg-white border-[#F28C28]/30 shadow-sm' 
                                              : 'bg-muted/30 border-transparent grayscale opacity-60'
                                          } hover:bg-white cursor-pointer`}
                                        >
                                          <Checkbox
                                            checked={editDuties.has(duty.key)}
                                            onCheckedChange={() => toggleDuty(duty.key)}
                                          />
                                          <span className="text-[11px] font-bold truncate">{duty.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <Alert className="border-[#A92FFA]/20 bg-[#A92FFA]/5">
                    <Compass className="h-4 w-4 text-[#A92FFA]" />
                    <AlertTitle className="text-xs font-bold text-[#A92FFA] uppercase tracking-widest">Audit Policy</AlertTitle>
                    <AlertDescription className="text-[10px] leading-relaxed italic">
                      These tags are for internal auditing, records, and web service access control. Physical in-person initiatives 
                      are not restricted by these digital tags but staff are required to log all physical involvement for metric tracking.
                    </AlertDescription>
                  </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* PROMOTION MODAL: Search ALL convicts to give them a tag */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  Promote to Volunteer/Staff
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAddPersonModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Search the entire directory to assign an initial role tag.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {convictsList
                  .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
                  .slice(0, 10)
                  .map(convict => (
                    <div key={convict.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent group">
                      <div>
                        <p className="font-bold text-sm">{convict.firstName} {convict.lastName}</p>
                        <p className="text-xs text-muted-foreground">{convict.email}</p>
                      </div>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        selectPerson(convict);
                        setShowAddPersonModal(false);
                        toast.info(`Configuring initial access for ${convict.firstName}`);
                      }}>
                        Select
                      </Button>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
