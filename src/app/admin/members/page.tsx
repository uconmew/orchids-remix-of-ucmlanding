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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Plus, Mail, Phone, Calendar, Shield, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Convict {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  convictType: string;
  convictRole: string | null;
  status: string;
  joinedAt: string;
  interests: string[] | string | null;
  notes: string | null;
}

const CONVICT_TYPES = [
  { value: "workshop_participant", label: "Workshop Participant" },
  { value: "outreach_participant", label: "Outreach Participant" },
  { value: "ministry_volunteer", label: "Ministry Volunteer" },
  { value: "newsletter_subscriber", label: "Newsletter Subscriber" },
  { value: "registered_user", label: "Registered User" },
];

const CONVICT_ROLES = [
  { value: "pastoral", label: "Pastoral" },
  { value: "outreach", label: "Outreach" },
  { value: "volunteer", label: "Volunteer" },
  { value: "staff", label: "Staff" },
];

const INTERESTS = [
  "financial_literacy",
  "job_training",
  "bible_study",
  "counseling",
  "mentorship",
  "addiction_recovery",
  "housing_assistance",
  "food_assistance",
  "transportation",
  "spiritual_growth",
];

export default function ConvictsManagement() {
  const [convicts, setConvicts] = useState<Convict[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for adding convict
  const [newConvict, setNewConvict] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    convictType: "",
    convictRole: "",
    interests: [] as string[],
    notes: "",
  });

  useEffect(() => {
    fetchConvicts();
  }, []);

  const fetchConvicts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/convicts", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const result = await response.json();
          const data = Array.isArray(result) ? result : result.data || [];
          // Ensure interests is always an array
          const normalizedData = data.map((convict: Convict) => ({
          ...convict,
          interests: Array.isArray(convict.interests) 
            ? convict.interests 
            : typeof convict.interests === 'string' 
              ? (convict.interests.startsWith('[') 
                  ? JSON.parse(convict.interests) 
                  : convict.interests.split(',').filter(Boolean))
              : []
        }));
        setConvicts(normalizedData);
      }
    } catch (error) {
      console.error("Error fetching convicts:", error);
      toast.error("Failed to load convicts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddConvict = async () => {
    if (!newConvict.firstName || !newConvict.lastName || !newConvict.email || !newConvict.convictType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/convicts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...newConvict,
          convictRole: newConvict.convictRole === "none" ? null : newConvict.convictRole || null,
        }),
      });

      if (response.ok) {
        toast.success("Convict added successfully");
        setIsAddDialogOpen(false);
        setNewConvict({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          convictType: "",
          convictRole: "",
          interests: [],
          notes: "",
        });
        fetchConvicts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add convict");
      }
    } catch (error) {
      console.error("Error adding convict:", error);
      toast.error("An error occurred");
    }
  };

  const filteredConvicts = convicts.filter((convict) => {
    const matchesSearch =
      convict.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convict.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convict.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || convict.convictType === selectedType;

    const matchesRole =
      selectedRole === "all" || convict.convictRole === selectedRole;

    return matchesSearch && matchesType && matchesRole;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Convicts Management</h1>
          <p className="text-muted-foreground">
            Manage all registered convicts - pastoral, outreach, volunteer, and staff
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Anyone who registers with UCON is a "Convict" - redeemed and transformed by Christ
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Convict
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Convict</DialogTitle>
              <DialogDescription>
                Register a new convict in the UCON Ministries system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={newConvict.firstName}
                    onChange={(e) =>
                      setNewConvict({ ...newConvict, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={newConvict.lastName}
                    onChange={(e) =>
                      setNewConvict({ ...newConvict, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newConvict.email}
                  onChange={(e) =>
                    setNewConvict({ ...newConvict, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={newConvict.phone}
                  onChange={(e) =>
                    setNewConvict({ ...newConvict, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convictType">Convict Type *</Label>
                  <Select
                    value={newConvict.convictType}
                    onValueChange={(value) =>
                      setNewConvict({ ...newConvict, convictType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONVICT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="convictRole">Role (Optional)</Label>
                  <Select
                    value={newConvict.convictRole}
                    onValueChange={(value) =>
                      setNewConvict({ ...newConvict, convictRole: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {CONVICT_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Interests</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {INTERESTS.map((interest) => (
                    <label
                      key={interest}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newConvict.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewConvict({
                              ...newConvict,
                              interests: [...newConvict.interests, interest],
                            });
                          } else {
                            setNewConvict({
                              ...newConvict,
                              interests: newConvict.interests.filter(
                                (i) => i !== interest
                              ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">
                        {interest.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the convict"
                  value={newConvict.notes}
                  onChange={(e) =>
                    setNewConvict({ ...newConvict, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddConvict} className="bg-[#A92FFA]">
                Add Convict
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - By Role */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {CONVICT_ROLES.map((role) => {
          const count = convicts.filter((c) => c.convictRole === role.value).length;
          return (
            <Card key={role.value}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {role.label}
                  </p>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Cards - By Type */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {CONVICT_TYPES.map((type) => {
          const count = convicts.filter((c) => c.convictType === type.value).length;
          return (
            <Card key={type.value}>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {type.label}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONVICT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {CONVICT_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Convicts List */}
      <Card>
        <CardHeader>
          <CardTitle>Convict Directory</CardTitle>
          <CardDescription>
            {filteredConvicts.length} convict{filteredConvicts.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading convicts...
            </div>
          ) : filteredConvicts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No convicts found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConvicts.map((convict) => (
                <ConvictCard key={convict.id} convict={convict} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConvictCard({ convict }: { convict: Convict }) {
  const getConvictTypeLabel = (type: string) => {
    return CONVICT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getConvictRoleLabel = (role: string | null) => {
    if (!role) return null;
    return CONVICT_ROLES.find((r) => r.value === role)?.label || role;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop_participant: "bg-[#A92FFA]",
      outreach_participant: "bg-[#F28C28]",
      ministry_volunteer: "bg-green-600",
      newsletter_subscriber: "bg-blue-600",
      registered_user: "bg-purple-600",
    };
    return colors[type] || "bg-gray-600";
  };

  const getRoleColor = (role: string | null) => {
    if (!role) return "bg-gray-500";
    const colors: Record<string, string> = {
      pastoral: "bg-indigo-600",
      outreach: "bg-orange-600",
      volunteer: "bg-green-600",
      staff: "bg-red-600",
    };
    return colors[role] || "bg-gray-600";
  };

  const interests = Array.isArray(convict.interests) ? convict.interests : [];

  return (
    <div className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4 flex-1">
        <div className={`w-12 h-12 ${getTypeColor(convict.convictType)} rounded-full flex items-center justify-center`}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold">
              {convict.firstName} {convict.lastName}
            </h3>
            <Badge className={`${getTypeColor(convict.convictType)} text-white text-xs`}>
              {getConvictTypeLabel(convict.convictType)}
            </Badge>
            {convict.convictRole && (
              <Badge className={`${getRoleColor(convict.convictRole)} text-white text-xs`}>
                <Briefcase className="w-3 h-3 mr-1" />
                {getConvictRoleLabel(convict.convictRole)}
              </Badge>
            )}
            <Badge variant={convict.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {convict.status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>{convict.email}</span>
            </div>
            {convict.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{convict.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>
                Joined {new Date(convict.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {interests.slice(0, 3).map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest.replace(/_/g, " ")}
                </Badge>
              ))}
              {interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{interests.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          View Details
        </Button>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </div>
    </div>
  );
}