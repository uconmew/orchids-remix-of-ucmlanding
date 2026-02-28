"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, Search, Plus, Edit2, Check, ChevronsUpDown, Copy, Eye, EyeOff, Shield, Settings, AlertTriangle, Lock, Crown, Loader2, Key, RefreshCw, X, Save, Phone, Mail, MapPin, Calendar, Monitor, DollarSign, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { useAuthorization, ACTION_CLEARANCE, CLEARANCE_LEVELS } from "@/hooks/useAuthorization";
import { ApprovalNotificationBadge } from "@/components/ApprovalNotificationBadge";
import { SensitiveChangeRequest } from "@/components/SensitiveChangeRequest";

interface Role {
  id: number;
  name: string;
  level: number;
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
  role: Role;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  registrationNumber?: string;
  userImage?: string | null;
  userGender?: string | null;
  userRace?: string | null;
  userEmergencyContactName?: string | null;
  userEmergencyContactPhone?: string | null;
  userEmergencyContactRelation?: string | null;
  userUcmEmployeeNumber?: string | null;
  userAddress?: string | null;
  userCity?: string | null;
  userState?: string | null;
  userZipCode?: string | null;
  userDepartment?: string | null;
  userMinistryPhone?: string | null;
  userHasDevice?: boolean | null;
  userCompensationType?: string | null;
  userBackgroundCheckDate?: string | null;
  userReferencesInfo?: unknown;
  userEnrollmentDate?: string | null;
  userCreatedAt?: string | null;
}

interface UserBasic {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  registrationNumber: string | null;
}

const STAFF_TITLES = [
  "Executive Director",
  "HR Manager",
  "Hiring Manager",
  "Workshop Facilitator",
  "Case Manager",
  "Outreach Coordinator",
  "Program Director",
  "Program Assistant",
  "Administrative Support",
  "Community Liaison",
  "Peer Counselor",
  "Volunteer Coordinator",
  "Communications Specialist",
  "Financial Coordinator",
];

const DEPARTMENTS = [
  "Executive",
  "Human Resources",
  "Outreach",
  "Programs",
  "Administration",
  "Communications",
  "Finance",
  "Pastoral",
  "Volunteer Services",
  "Community Services",
  "IT",
];

const COMPENSATION_TYPES = [
  "Full-time Salaried",
  "Part-time Hourly",
  "Stipend",
  "Volunteer",
  "Contract",
  "Intern",
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const RACES = ["White", "Black or African American", "Hispanic or Latino", "Asian", "Native American", "Pacific Islander", "Two or More Races", "Other", "Prefer not to say"];

export default function StaffManagement() {
  const { 
    userId: currentUserId,
    permissionClearance,
    dutyClearance,
    currentLevel,
    canPerformAction,
    isLoading: authLoading,
    sessionLoading
  } = useAuthorization();

  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<"new" | "existing">("new");
  const [showPassword, setShowPassword] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserRole | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sensitive change request states
  const [isSensitiveChangeOpen, setIsSensitiveChangeOpen] = useState(false);
  const [pendingChangeType, setPendingChangeType] = useState<string>("");
  const [pendingChangeDetails, setPendingChangeDetails] = useState<Record<string, unknown>>({});
  const [pendingChangeTargetUserId, setPendingChangeTargetUserId] = useState<string>("");
  const [pendingChangeTargetName, setPendingChangeTargetName] = useState<string>("");

  // Authorization checks
  const canAddStaff = canPerformAction("addStaff");
  const canEditClearance = canPerformAction("editStaffClearance");

  // Form state for creating new staff
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    staffTitle: "",
    initialPassword: "",
    permissionClearance: 25,
    dutyClearance: 25,
  });

  // Form state for existing user
  const [existingUserAssignment, setExistingUserAssignment] = useState({
    userId: "",
    userName: "",
    roleId: "",
    staffTitle: "",
    permissionClearance: 25,
    dutyClearance: 25,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/users"),
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      await fetchUserRoles();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await fetch("/api/user-roles?userId=all");
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewStaff({ ...newStaff, initialPassword: password });
    toast.success("Password generated");
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newStaff.initialPassword);
    toast.success("Password copied to clipboard");
  };

  const handleAssignRole = async () => {
    if (!canAddStaff) {
      toast.error(`Insufficient clearance. Required: ${ACTION_CLEARANCE.addStaff}, Your clearance: ${permissionClearance}`);
      return;
    }

    if (assignmentMode === "new") {
      if (!newStaff.firstName || !newStaff.lastName || !newStaff.email || !newStaff.roleId) {
        toast.error("Please fill in all required fields");
        return;
      }

      let passwordToUse = newStaff.initialPassword;
      if (!passwordToUse) {
        passwordToUse = generatePassword();
        setNewStaff({ ...newStaff, initialPassword: passwordToUse });
      }

      try {
        const response = await fetch("/api/user-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: newStaff.firstName,
            lastName: newStaff.lastName,
            email: newStaff.email,
            phone: newStaff.phone,
            roleId: parseInt(newStaff.roleId),
            staffTitle: newStaff.staffTitle,
            initialPassword: passwordToUse,
            permissionClearance: newStaff.permissionClearance,
            dutyClearance: newStaff.dutyClearance,
            assignedBy: currentUserId || null,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const emailStatus = data.emailSent 
            ? "Verification email sent successfully!" 
            : data.emailError 
              ? `Account created but email failed: ${data.emailError}`
              : "Account created but email service not configured";

          toast.success(
            <div>
              <p className="font-semibold">Staff member created successfully!</p>
              <p className="text-sm mt-1">{emailStatus}</p>
              <p className="text-sm mt-2">Registration: {data.assignment?.registrationNumber}</p>
              <p className="text-sm">Email: {data.assignment?.userEmail}</p>
              {!data.emailSent && (
                <p className="text-sm font-mono bg-yellow-100 dark:bg-yellow-900 p-2 rounded mt-2">
                  Password: {data.initialPassword}
                </p>
              )}
              {data.initialPAC && (
                <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900 rounded">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Personal Access Code (PAC):</p>
                  <p className="text-lg font-mono font-bold tracking-widest">{data.initialPAC}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Save this code! It will only be shown once.</p>
                </div>
              )}
            </div>,
            { duration: 20000 }
          );
          setIsAddDialogOpen(false);
          setNewStaff({ 
            firstName: "", lastName: "", email: "", phone: "", 
            roleId: "", staffTitle: "", initialPassword: "",
            permissionClearance: 25, dutyClearance: 25,
          });
          fetchData();
        } else {
          toast.error(data.error || "Failed to create staff member");
        }
      } catch (error) {
        console.error("Error creating staff:", error);
        toast.error("An error occurred");
      }
    } else {
      if (!existingUserAssignment.userId || !existingUserAssignment.roleId) {
        toast.error("Please select a user and role");
        return;
      }

      try {
        const response = await fetch("/api/user-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: existingUserAssignment.userId,
            roleId: parseInt(existingUserAssignment.roleId),
            staffTitle: existingUserAssignment.staffTitle,
            permissionClearance: existingUserAssignment.permissionClearance,
            dutyClearance: existingUserAssignment.dutyClearance,
            assignedBy: currentUserId || null,
          }),
        });

        if (response.ok) {
          toast.success("Staff role assigned successfully");
          setIsAddDialogOpen(false);
          setExistingUserAssignment({ userId: "", userName: "", roleId: "", staffTitle: "", permissionClearance: 25, dutyClearance: 25 });
          fetchData();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to assign role");
        }
      } catch (error) {
        console.error("Error assigning role:", error);
        toast.error("An error occurred");
      }
    }
  };

  const openEditDialog = (staff: UserRole) => {
    setEditingStaff(staff);
    setEditForm({
      phone: staff.userPhone || "",
      address: staff.userAddress || "",
      city: staff.userCity || "",
      state: staff.userState || "",
      zipCode: staff.userZipCode || "",
      department: staff.userDepartment || "",
      ministryPhone: staff.userMinistryPhone || "",
      hasDevice: staff.userHasDevice || false,
      compensationType: staff.userCompensationType || "",
      backgroundCheckDate: staff.userBackgroundCheckDate || "",
      enrollmentDate: staff.userEnrollmentDate || "",
      gender: staff.userGender || "",
      race: staff.userRace || "",
      emergencyContactName: staff.userEmergencyContactName || "",
      emergencyContactPhone: staff.userEmergencyContactPhone || "",
      emergencyContactRelation: staff.userEmergencyContactRelation || "",
      bio: "",
    });
  };

  const handleSaveProfile = async () => {
    if (!editingStaff) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users?id=${editingStaff.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setEditingStaff(null);
        fetchData();
      } else {
        const data = await response.json();
        if (data.code === "SENSITIVE_FIELDS_DETECTED") {
          toast.error(`These fields require approval: ${data.sensitiveFields.join(", ")}`);
        } else {
          toast.error(data.error || "Failed to update profile");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const openSensitiveChange = (staff: UserRole, changeType: string, details: Record<string, unknown>) => {
    setPendingChangeType(changeType);
    setPendingChangeDetails(details);
    setPendingChangeTargetUserId(staff.userId);
    setPendingChangeTargetName(staff.userName || staff.userId);
    setIsSensitiveChangeOpen(true);
  };

  const filteredStaff = userRoles.filter((ur) => {
    const matchesSearch =
      ur.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.staffTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.userUcmEmployeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.userDepartment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.role?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" || ur.roleId.toString() === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getClearanceLevelName = (clearance: number) => {
    const level = CLEARANCE_LEVELS.find(l => clearance >= l.minClearance);
    return level?.name || "Level 5 - Volunteer";
  };

  if (sessionLoading || authLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#A92FFA]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff roles, titles, clearance levels, and profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/authorization">
              <Shield className="w-4 h-4 mr-2" />
              Authorization Center
            </Link>
          </Button>
          {canAddStaff ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>
                    Create a new staff member or assign a role to an existing user.
                  </DialogDescription>
                </DialogHeader>
              
                <Tabs value={assignmentMode} onValueChange={(v) => setAssignmentMode(v as "new" | "existing")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">Create New Staff</TabsTrigger>
                    <TabsTrigger value="existing">Assign to Existing User</TabsTrigger>
                  </TabsList>

                  <TabsContent value="new" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input placeholder="First name" value={newStaff.firstName} onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })} />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input placeholder="Last name" value={newStaff.lastName} onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" placeholder="email@example.com" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input type="tel" placeholder="(555) 123-4567" value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Role *</Label>
                        <Select value={newStaff.roleId} onValueChange={(value) => setNewStaff({ ...newStaff, roleId: value })}>
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>{role.name} (Level {role.level})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Employment Title</Label>
                        <Select value={newStaff.staffTitle} onValueChange={(value) => setNewStaff({ ...newStaff, staffTitle: value })}>
                          <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
                          <SelectContent>
                            {STAFF_TITLES.map((title) => (
                              <SelectItem key={title} value={title}>{title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-medium flex items-center gap-2"><Lock className="w-4 h-4" />Initial Clearance</h4>
                      <div>
                        <div className="flex justify-between mb-2"><Label className="text-sm">Permission</Label><Badge variant="outline">{newStaff.permissionClearance}</Badge></div>
                        <Slider value={[newStaff.permissionClearance]} onValueChange={([v]) => setNewStaff({ ...newStaff, permissionClearance: v })} max={100} step={5} />
                        <p className="text-xs text-muted-foreground mt-1">{getClearanceLevelName(newStaff.permissionClearance)}</p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2"><Label className="text-sm">Duty</Label><Badge variant="outline">{newStaff.dutyClearance}</Badge></div>
                        <Slider value={[newStaff.dutyClearance]} onValueChange={([v]) => setNewStaff({ ...newStaff, dutyClearance: v })} max={100} step={5} />
                        <p className="text-xs text-muted-foreground mt-1">{getClearanceLevelName(newStaff.dutyClearance)}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Initial Password *</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={newStaff.initialPassword} onChange={(e) => setNewStaff({ ...newStaff, initialPassword: e.target.value })} />
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Button type="button" variant="outline" onClick={handleGeneratePassword}>Generate</Button>
                        {newStaff.initialPassword && <Button type="button" variant="outline" onClick={handleCopyPassword}><Copy className="w-4 h-4" /></Button>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">User will be required to change on first login</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="existing" className="space-y-4 pt-4">
                    <div>
                      <Label>Select User *</Label>
                      <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between">
                            {existingUserAssignment.userId ? existingUserAssignment.userName : "Search and select user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0">
                          <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandList>
                              <CommandEmpty>No users found.</CommandEmpty>
                              <CommandGroup>
                                {users.map((u) => (
                                  <CommandItem key={u.id} value={`${u.name} ${u.email}`} onSelect={() => { setExistingUserAssignment({ ...existingUserAssignment, userId: u.id, userName: u.name }); setUserSearchOpen(false); }}>
                                    <Check className={`mr-2 h-4 w-4 ${existingUserAssignment.userId === u.id ? "opacity-100" : "opacity-0"}`} />
                                    <div className="flex-1">
                                      <p className="font-medium">{u.name}</p>
                                      <p className="text-sm text-muted-foreground">{u.email}</p>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Select value={existingUserAssignment.roleId} onValueChange={(value) => setExistingUserAssignment({ ...existingUserAssignment, roleId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>{role.name} (Level {role.level})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Employment Title</Label>
                      <Select value={existingUserAssignment.staffTitle} onValueChange={(value) => setExistingUserAssignment({ ...existingUserAssignment, staffTitle: value })}>
                        <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
                        <SelectContent>
                          {STAFF_TITLES.map((title) => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-medium flex items-center gap-2"><Lock className="w-4 h-4" />Clearance</h4>
                      <div>
                        <div className="flex justify-between mb-2"><Label className="text-sm">Permission</Label><Badge variant="outline">{existingUserAssignment.permissionClearance}</Badge></div>
                        <Slider value={[existingUserAssignment.permissionClearance]} onValueChange={([v]) => setExistingUserAssignment({ ...existingUserAssignment, permissionClearance: v })} max={100} step={5} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2"><Label className="text-sm">Duty</Label><Badge variant="outline">{existingUserAssignment.dutyClearance}</Badge></div>
                        <Slider value={[existingUserAssignment.dutyClearance]} onValueChange={([v]) => setExistingUserAssignment({ ...existingUserAssignment, dutyClearance: v })} max={100} step={5} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAssignRole} className="bg-[#A92FFA]">
                    {assignmentMode === "new" ? "Create Staff" : "Assign Role"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled className="bg-muted text-muted-foreground">
              <Lock className="w-4 h-4 mr-2" />Insufficient Clearance
            </Button>
          )}
        </div>
      </div>

      {/* Current User Clearance Info */}
      <Card className="mb-6 border-2 border-[#A92FFA]/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentLevel.level <= 2 ? 'bg-gradient-to-br from-[#A92FFA] to-[#F28C28]' : 'bg-[#A92FFA]'}`}>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Your Authorization Level</p>
                <p className="text-sm text-muted-foreground">{currentLevel.name}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Badge variant="outline" className="bg-[#A92FFA]/10 border-[#A92FFA]">P: {permissionClearance}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Permission</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="bg-[#F28C28]/10 border-[#F28C28]">D: {dutyClearance}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Duty</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, UCM#, department, title, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            {filteredStaff.length} staff member{filteredStaff.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading staff data...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No staff members found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Photo</TableHead>
                    <TableHead>UCM #</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Ministry Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Race</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>BG Check</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Compensation</TableHead>
                    <TableHead>Clearance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <StaffTableRow
                      key={staff.id}
                      staff={staff}
                      canEdit={canEditClearance}
                      onEdit={() => openEditDialog(staff)}
                      onSensitiveChange={(type, details) => openSensitiveChange(staff, type, details)}
                      getClearanceLevelName={getClearanceLevelName}
                      roles={roles}
                      isLevel1={currentLevel.level === 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => { if (!open) setEditingStaff(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#A92FFA]" />
              Edit Staff Profile - {editingStaff?.userName}
            </DialogTitle>
            <DialogDescription>
              Update profile information. Sensitive fields (name, email, UCM#) require approval.
            </DialogDescription>
          </DialogHeader>

          {editingStaff && (
            <div className="space-y-6 py-4">
              {/* Sensitive fields notice */}
              <Alert className="border-amber-500/30 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-600">Sensitive Fields</AlertTitle>
                <AlertDescription>
                  Name ({editingStaff.userName}), Email ({editingStaff.userEmail}), and UCM# ({editingStaff.userUcmEmployeeNumber || "N/A"}) changes require approval.
                  Use the &quot;Request Change&quot; button below for these.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSensitiveChange(editingStaff, "staff_name_change", {
                    currentName: editingStaff.userName,
                    field: "name",
                  })}
                >
                  <Lock className="w-3 h-3 mr-1" /> Request Name Change
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSensitiveChange(editingStaff, "email_change", {
                    currentEmail: editingStaff.userEmail,
                    field: "email",
                  })}
                >
                  <Lock className="w-3 h-3 mr-1" /> Request Email Change
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Phone className="w-4 h-4" /> Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Personal Phone</Label>
                    <Input value={editForm.phone as string} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Ministry Phone</Label>
                    <Input value={editForm.ministryPhone as string} onChange={(e) => setEditForm({ ...editForm, ministryPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</h3>
                <div>
                  <Label>Street Address</Label>
                  <Input value={editForm.address as string} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={editForm.city as string} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={editForm.state as string} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input value={editForm.zipCode as string} onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gender</Label>
                    <Select value={editForm.gender as string} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Race</Label>
                    <Select value={editForm.race as string} onValueChange={(v) => setEditForm({ ...editForm, race: v })}>
                      <SelectTrigger><SelectValue placeholder="Select race" /></SelectTrigger>
                      <SelectContent>
                        {RACES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Emergency Contact</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={editForm.emergencyContactName as string} onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={editForm.emergencyContactPhone as string} onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Relation</Label>
                    <Input value={editForm.emergencyContactRelation as string} onChange={(e) => setEditForm({ ...editForm, emergencyContactRelation: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4" /> Employment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Select value={editForm.department as string} onValueChange={(v) => setEditForm({ ...editForm, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Compensation Type</Label>
                    <Select value={editForm.compensationType as string} onValueChange={(v) => setEditForm({ ...editForm, compensationType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {COMPENSATION_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Enrollment Date</Label>
                    <Input type="date" value={editForm.enrollmentDate as string} onChange={(e) => setEditForm({ ...editForm, enrollmentDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Background Check Date</Label>
                    <Input type="date" value={editForm.backgroundCheckDate as string} onChange={(e) => setEditForm({ ...editForm, backgroundCheckDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Has Ministry Device?</Label>
                    <Select value={editForm.hasDevice ? "yes" : "no"} onValueChange={(v) => setEditForm({ ...editForm, hasDevice: v === "yes" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sensitive Change Request Dialog */}
      <SensitiveChangeRequest
        isOpen={isSensitiveChangeOpen}
        onClose={() => setIsSensitiveChangeOpen(false)}
        requestType={pendingChangeType}
        targetUserId={pendingChangeTargetUserId}
        targetUserName={pendingChangeTargetName}
        changeDetails={pendingChangeDetails}
        onSuccess={() => {
          toast.success("Change request submitted. Awaiting approval.");
        }}
      />
    </div>
  );
}

function StaffTableRow({
  staff,
  canEdit,
  onEdit,
  onSensitiveChange,
  getClearanceLevelName,
  roles,
  isLevel1,
}: {
  staff: UserRole;
  canEdit: boolean;
  onEdit: () => void;
  onSensitiveChange: (type: string, details: Record<string, unknown>) => void;
  getClearanceLevelName: (clearance: number) => string;
  roles: Role[];
  isLevel1?: boolean;
}) {
  const [isPACDialogOpen, setIsPACDialogOpen] = useState(false);
  const [hasPAC, setHasPAC] = useState(false);
  const [generatedPAC, setGeneratedPAC] = useState<string | null>(null);
  const [isPACLoading, setIsPACLoading] = useState(false);
  const [isEditingClearance, setIsEditingClearance] = useState(false);
  const [editPermissionClearance, setEditPermissionClearance] = useState(staff.permissionClearance || 0);
  const [editDutyClearance, setEditDutyClearance] = useState(staff.dutyClearance || 0);
  const [editRoleId, setEditRoleId] = useState(staff.roleId?.toString() || "");

  useEffect(() => {
    const checkPAC = async () => {
      try {
        const response = await fetch(`/api/staff/pac?userId=${staff.userId}`);
        if (response.ok) {
          const data = await response.json();
          setHasPAC(data.hasPAC);
        }
      } catch {}
    };
    checkPAC();
  }, [staff.userId]);

  const handleGeneratePAC = async (regenerate = false) => {
    setIsPACLoading(true);
    try {
      const response = await fetch("/api/staff/pac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: staff.userId, regenerate }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.requiresDualApproval) {
          toast.success(data.message);
          setIsPACDialogOpen(false);
        } else {
          setGeneratedPAC(data.pac);
          setHasPAC(true);
          toast.success(data.message);
        }
      } else if (data.requiresDualApproval) {
        onSensitiveChange("pac_change", {
          action: regenerate ? "regenerate_pac" : "generate_pac",
          targetUserId: staff.userId,
          targetUserName: staff.userName,
        });
        setIsPACDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to generate PAC");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsPACLoading(false);
    }
  };

  const handleSaveClearance = () => {
    onSensitiveChange("role_change", {
      newRoleId: editRoleId ? parseInt(editRoleId) : staff.roleId,
      newPermissionClearance: editPermissionClearance,
      newDutyClearance: editDutyClearance,
      previousPermissionClearance: staff.permissionClearance,
      previousDutyClearance: staff.dutyClearance,
      previousRoleId: staff.roleId,
    });
    setIsEditingClearance(false);
  };

  const isHighLevel = (staff.permissionClearance || 0) >= 75;
  const emergencyContact = staff.userEmergencyContactName 
    ? `${staff.userEmergencyContactName} (${staff.userEmergencyContactRelation || "N/A"}) ${staff.userEmergencyContactPhone || ""}`
    : "Not set";
  const address = [staff.userAddress, staff.userCity, staff.userState, staff.userZipCode].filter(Boolean).join(", ") || "Not set";

  return (
    <>
      <TableRow className={isHighLevel ? "bg-[#A92FFA]/5" : ""}>
        <TableCell>
          {staff.userImage ? (
            <img src={staff.userImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${isHighLevel ? 'bg-gradient-to-br from-[#A92FFA] to-[#F28C28]' : 'bg-muted-foreground/50'}`}>
              {(staff.userName || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {staff.userUcmEmployeeNumber || staff.registrationNumber || "N/A"}
        </TableCell>
        <TableCell className="font-medium">{staff.userName || "Unknown"}</TableCell>
        <TableCell className="text-xs">{staff.userEmail || "N/A"}</TableCell>
        <TableCell className="text-xs">{staff.userPhone || "N/A"}</TableCell>
        <TableCell className="text-xs">{staff.userMinistryPhone || "N/A"}</TableCell>
        <TableCell>
          <Badge variant={isHighLevel ? "default" : "secondary"} className="text-xs whitespace-nowrap">
            {staff.role?.name || "N/A"}
          </Badge>
        </TableCell>
        <TableCell className="text-xs">{staff.staffTitle || "N/A"}</TableCell>
        <TableCell className="text-xs">{staff.userDepartment || "N/A"}</TableCell>
        <TableCell className="text-xs">{staff.userGender || "N/A"}</TableCell>
        <TableCell className="text-xs">{staff.userRace || "N/A"}</TableCell>
        <TableCell className="text-xs max-w-[150px] truncate" title={emergencyContact}>{emergencyContact}</TableCell>
        <TableCell className="text-xs max-w-[150px] truncate" title={address}>{address}</TableCell>
        <TableCell className="text-xs">{staff.userEnrollmentDate || (staff.assignedAt ? new Date(staff.assignedAt).toLocaleDateString() : "N/A")}</TableCell>
        <TableCell className="text-xs">{staff.userBackgroundCheckDate || "N/A"}</TableCell>
        <TableCell className="text-center">
          {staff.userHasDevice ? (
            <Badge variant="default" className="text-xs bg-green-600">Yes</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">No</Badge>
          )}
        </TableCell>
        <TableCell className="text-xs">{staff.userCompensationType || "N/A"}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] bg-[#A92FFA]/10 border-[#A92FFA]">P:{staff.permissionClearance || 0}</Badge>
            <Badge variant="outline" className="text-[10px] bg-[#F28C28]/10 border-[#F28C28]">D:{staff.dutyClearance || 0}</Badge>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {canEdit && (
              <>
                <Button size="sm" variant="ghost" onClick={onEdit} title="Edit Profile">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditPermissionClearance(staff.permissionClearance || 0);
                  setEditDutyClearance(staff.dutyClearance || 0);
                  setEditRoleId(staff.roleId?.toString() || "");
                  setIsEditingClearance(true);
                }} title="Edit Clearance">
                  <Settings className="w-3 h-3" />
                </Button>
                {isLevel1 && (
                  <Button size="sm" variant="ghost" onClick={() => setIsPACDialogOpen(true)} title="PAC Management">
                    <Key className="w-3 h-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* PAC Dialog */}
      <Dialog open={isPACDialogOpen} onOpenChange={(open) => { setIsPACDialogOpen(open); if (!open) setGeneratedPAC(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-[#A92FFA]" />PAC Management</DialogTitle>
            <DialogDescription>Manage PAC for {staff.userName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Shield className="w-5 h-5 text-[#A92FFA]" />
              <div>
                <p className="text-sm font-medium">Status: {hasPAC ? "PAC Set" : "No PAC"}</p>
              </div>
            </div>
            {generatedPAC && (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Save This Code!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-4 py-2 rounded text-2xl font-mono font-bold tracking-widest">{generatedPAC}</code>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedPAC); toast.success("Copied"); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              {!hasPAC ? (
                <Button onClick={() => handleGeneratePAC(false)} disabled={isPACLoading} className="flex-1 bg-[#A92FFA]">
                  {isPACLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                  Generate PAC
                </Button>
              ) : (
                <Button onClick={() => handleGeneratePAC(true)} disabled={isPACLoading} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate PAC
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clearance Dialog */}
      <Dialog open={isEditingClearance} onOpenChange={setIsEditingClearance}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-[#A92FFA]" />Edit Clearance & Role</DialogTitle>
            <DialogDescription>Update for {staff.userName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>UCM Role Level</Label>
              <Select value={editRoleId} onValueChange={setEditRoleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>Level {role.level} - {role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label className="text-sm">Permission Clearance</Label><Badge variant="outline">{editPermissionClearance}</Badge></div>
              <Slider value={[editPermissionClearance]} onValueChange={([v]) => setEditPermissionClearance(v)} max={100} step={5} />
              <p className="text-xs text-muted-foreground">{getClearanceLevelName(editPermissionClearance)}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label className="text-sm">Duty Clearance</Label><Badge variant="outline">{editDutyClearance}</Badge></div>
              <Slider value={[editDutyClearance]} onValueChange={([v]) => setEditDutyClearance(v)} max={100} step={5} />
              <p className="text-xs text-muted-foreground">{getClearanceLevelName(editDutyClearance)}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground"><strong>Note:</strong> Changes require approval from another Level 1 or 2 staff member.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditingClearance(false)}>Cancel</Button>
            <Button onClick={handleSaveClearance} className="bg-[#A92FFA]"><Check className="w-4 h-4 mr-2" />Request Approval</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
