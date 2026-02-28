"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hash,
  UserCheck,
  Clock,
  Book,
  FilePlus,
  Activity,
  UserPlus,
  Car,
  Settings2,
  Save,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Convict {
  id: number;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  convictType: string;
  convictRole: string | null;
  status: string;
  clearanceLevel: number;
  dutyClearance: number;
  interests: any;
  notes: string | null;
  joinedAt: string;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConvictGroup {
  id: number;
  name: string;
  description: string | null;
  groupType: string;
  memberCount?: number;
  memberRole?: string;
  joinedAt?: string;
}

interface BookRequest {
  id: number;
  bookTitle: string;
  bookAuthor: string | null;
  resourceType: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

const CONVICT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "workshop_participant", label: "Workshop Participant" },
  { value: "outreach_participant", label: "Outreach Participant" },
  { value: "ministry_volunteer", label: "Ministry Volunteer" },
  { value: "newsletter_subscriber", label: "Newsletter Subscriber" },
  { value: "registered_user", label: "Registered User" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const RESOURCE_TYPES = [
  { value: "book", label: "Book" },
  { value: "bible", label: "Bible" },
  { value: "workbook", label: "Workbook" },
  { value: "devotional", label: "Devotional" },
  { value: "study_guide", label: "Study Guide" },
  { value: "other", label: "Other Material" },
];

export default function ConvictDirectory() {
  const [convicts, setConvicts] = useState<Convict[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [convictTypeFilter, setConvictTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConvict, setSelectedConvict] = useState<Convict | null>(null);
  const [activeDialogTab, setActiveDialogTab] = useState("profile");
  
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [loadingBookRequests, setLoadingBookRequests] = useState(false);
  
  const [convictGroups, setConvictGroups] = useState<ConvictGroup[]>([]);
  const [allGroups, setAllGroups] = useState<ConvictGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [showBookRequestModal, setShowBookRequestModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTransitModal, setShowTransitModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [bookRequestForm, setBookRequestForm] = useState({
    bookTitle: "",
    bookAuthor: "",
    resourceType: "book",
    reason: "",
    notes: "",
  });

  const [editProfileForm, setEditProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    convictType: "",
    status: "",
    notes: "",
  });

  const [transitForm, setTransitForm] = useState({
    pickupLocation: "",
    destination: "",
    requestedTime: "",
    ridePurpose: "appointment",
    specialNeeds: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const fetchActivities = useCallback(async (convictId: number) => {
    setLoadingActivities(true);
    try {
      const res = await fetch(`/api/convicts/${convictId}/activity`);
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const fetchBookRequests = useCallback(async (convictId: number) => {
    setLoadingBookRequests(true);
    try {
      const res = await fetch(`/api/book-requests?convictId=${convictId}`);
      if (res.ok) {
        setBookRequests(await res.json());
      }
    } catch (err) {
      console.error("Error fetching book requests:", err);
    } finally {
      setLoadingBookRequests(false);
    }
  }, []);

  const fetchConvictGroups = useCallback(async (convictId: number) => {
    setLoadingGroups(true);
    try {
      const [membershipRes, allGroupsRes] = await Promise.all([
        fetch(`/api/convict-groups?convictId=${convictId}`),
        fetch(`/api/convict-groups`),
      ]);
      if (membershipRes.ok) {
        setConvictGroups(await membershipRes.json());
      }
      if (allGroupsRes.ok) {
        setAllGroups(await allGroupsRes.json());
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConvict) {
      if (activeDialogTab === "activity") {
        fetchActivities(selectedConvict.id);
      } else if (activeDialogTab === "books") {
        fetchBookRequests(selectedConvict.id);
      } else if (activeDialogTab === "groups") {
        fetchConvictGroups(selectedConvict.id);
      }
    }
  }, [selectedConvict, activeDialogTab, fetchActivities, fetchBookRequests, fetchConvictGroups]);

  const fetchConvicts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());
      
      if (searchTerm) params.set("search", searchTerm);
      if (emailFilter) params.set("email", emailFilter);
      if (phoneFilter) params.set("phone", phoneFilter);
      if (addressFilter) params.set("address", addressFilter);
      if (userIdFilter) params.set("userId", userIdFilter);
      if (convictTypeFilter && convictTypeFilter !== "all") params.set("convictType", convictTypeFilter);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/convicts?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setConvicts(result.data || result);
        setTotal(result.total || (result.data ? result.data.length : result.length));
      } else {
        toast.error("Failed to load convicts");
      }
    } catch (error) {
      console.error("Error fetching convicts:", error);
      toast.error("Error loading convict directory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, emailFilter, phoneFilter, addressFilter, userIdFilter, convictTypeFilter, statusFilter]);

  useEffect(() => {
    fetchConvicts();
  }, [fetchConvicts]);

  const clearFilters = () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneFilter("");
    setAddressFilter("");
    setUserIdFilter("");
    setConvictTypeFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters = searchTerm || emailFilter || phoneFilter || addressFilter || userIdFilter || 
    (convictTypeFilter && convictTypeFilter !== "all") || (statusFilter && statusFilter !== "all");

  const totalPages = Math.ceil(total / limit);

  const handleSubmitBookRequest = async () => {
    if (!selectedConvict || !bookRequestForm.bookTitle) {
      toast.error("Book title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/book-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convictId: selectedConvict.id,
          requestedBy: "admin",
          ...bookRequestForm,
        }),
      });
      if (res.ok) {
        toast.success("Book request created successfully");
        setShowBookRequestModal(false);
        setBookRequestForm({ bookTitle: "", bookAuthor: "", resourceType: "book", reason: "", notes: "" });
        fetchBookRequests(selectedConvict.id);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create book request");
      }
    } catch (error) {
      toast.error("Error creating book request");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToGroup = async (groupId: number) => {
    if (!selectedConvict) return;
    setSaving(true);
    try {
      const res = await fetch("/api/convict-groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          convictId: selectedConvict.id,
          action: "add",
        }),
      });
      if (res.ok) {
        toast.success("Added to group successfully");
        fetchConvictGroups(selectedConvict.id);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add to group");
      }
    } catch (error) {
      toast.error("Error adding to group");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromGroup = async (groupId: number) => {
    if (!selectedConvict) return;
    setSaving(true);
    try {
      const res = await fetch("/api/convict-groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          convictId: selectedConvict.id,
          action: "remove",
        }),
      });
      if (res.ok) {
        toast.success("Removed from group");
        fetchConvictGroups(selectedConvict.id);
      } else {
        toast.error("Failed to remove from group");
      }
    } catch (error) {
      toast.error("Error removing from group");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedConvict) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/convicts/${selectedConvict.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfileForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedConvict(updated);
        toast.success("Profile updated successfully");
        setShowEditProfileModal(false);
        fetchConvicts();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedConvict) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/convicts/${selectedConvict.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedConvict(updated);
        toast.success(`Status updated to ${newStatus}`);
        fetchConvicts();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTransitRequest = async () => {
    if (!selectedConvict || !transitForm.pickupLocation || !transitForm.destination || !transitForm.requestedTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/outreach/transit/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convictId: selectedConvict.id,
          riderName: `${selectedConvict.firstName} ${selectedConvict.lastName}`,
          riderEmail: selectedConvict.email,
          riderPhone: selectedConvict.phone || "",
          userId: selectedConvict.userId,
          ...transitForm,
          status: "pending",
          termsAccepted: true,
          coComplianceAccepted: true,
        }),
      });
      if (res.ok) {
        toast.success("Transit request submitted successfully");
        setShowTransitModal(false);
        setTransitForm({ pickupLocation: "", destination: "", requestedTime: "", ridePurpose: "appointment", specialNeeds: "", notes: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit transit request");
      }
    } catch (error) {
      toast.error("Error submitting transit request");
    } finally {
      setSaving(false);
    }
  };

  const openEditProfileModal = () => {
    if (!selectedConvict) return;
    setEditProfileForm({
      firstName: selectedConvict.firstName,
      lastName: selectedConvict.lastName,
      email: selectedConvict.email,
      phone: selectedConvict.phone || "",
      address: selectedConvict.address || "",
      city: selectedConvict.city || "",
      state: selectedConvict.state || "",
      zipCode: selectedConvict.zipCode || "",
      convictType: selectedConvict.convictType,
      status: selectedConvict.status,
      notes: selectedConvict.notes || "",
    });
    setShowEditProfileModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      workshop_participant: "bg-purple-500",
      outreach_participant: "bg-orange-500",
      ministry_volunteer: "bg-blue-500",
      newsletter_subscriber: "bg-teal-500",
      registered_user: "bg-gray-500",
    };
    const labels: Record<string, string> = {
      workshop_participant: "Workshop",
      outreach_participant: "Outreach",
      ministry_volunteer: "Volunteer",
      newsletter_subscriber: "Newsletter",
      registered_user: "Registered",
    };
    return <Badge className={colors[type] || "bg-gray-400"}>{labels[type] || type}</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#A92FFA]" />
            Convict Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search and manage all convicts (staff profiles are managed in Staff Management)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-[#A92FFA] text-[#A92FFA]" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && <Badge className="ml-2 bg-[#A92FFA]">!</Badge>}
          </Button>
          <Button onClick={fetchConvicts} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Convicts
          </CardTitle>
          <CardDescription>
            Search by name, email, phone, address, or ID. Total: {total} convicts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, address, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input
                  placeholder="Filter by email..."
                  value={emailFilter}
                  onChange={(e) => { setEmailFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input
                  placeholder="Filter by phone..."
                  value={phoneFilter}
                  onChange={(e) => { setPhoneFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address
                </Label>
                <Input
                  placeholder="Filter by address..."
                  value={addressFilter}
                  onChange={(e) => { setAddressFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Hash className="w-3 h-3" /> User ID
                </Label>
                <Input
                  placeholder="Filter by user ID..."
                  value={userIdFilter}
                  onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <User className="w-3 h-3" /> Convict Type
                </Label>
                <Select value={convictTypeFilter} onValueChange={(v) => { setConvictTypeFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    {CONVICT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Status
                </Label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" /> Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-[#A92FFA]" />
              <span className="ml-2 text-muted-foreground">Loading convicts...</span>
            </div>
          ) : convicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No convicts found</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters to see all convicts
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convicts.map((convict) => (
                    <TableRow key={convict.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{convict.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{convict.firstName} {convict.lastName}</span>
                          {convict.userId && (
                            <span className="text-xs text-muted-foreground">User: {convict.userId.substring(0, 8)}...</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{convict.email}</TableCell>
                      <TableCell className="text-sm">{convict.phone || "-"}</TableCell>
                      <TableCell>{getTypeBadge(convict.convictType)}</TableCell>
                      <TableCell>{getStatusBadge(convict.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {convict.joinedAt ? format(new Date(convict.joinedAt), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedConvict(convict); setActiveDialogTab("profile"); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Convict Detail Dialog */}
      <Dialog open={!!selectedConvict} onOpenChange={(open) => !open && setSelectedConvict(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedConvict && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#A92FFA]/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-[#A92FFA]" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedConvict.firstName} {selectedConvict.lastName}</DialogTitle>
                      <DialogDescription>Convict Profile - ID #{selectedConvict.id}</DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mr-8">
                    {getTypeBadge(selectedConvict.convictType)}
                    {getStatusBadge(selectedConvict.status)}
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profile</TabsTrigger>
                  <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-1" /> Activity</TabsTrigger>
                  <TabsTrigger value="books"><Book className="w-4 h-4 mr-1" /> Books</TabsTrigger>
                  <TabsTrigger value="groups"><Users className="w-4 h-4 mr-1" /> Groups</TabsTrigger>
                  <TabsTrigger value="actions"><Settings2 className="w-4 h-4 mr-1" /> Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm border-b pb-2">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{selectedConvict.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedConvict.phone || "Not provided"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span>
                            {selectedConvict.address
                              ? `${selectedConvict.address}, ${selectedConvict.city || ""} ${selectedConvict.state || ""} ${selectedConvict.zipCode || ""}`
                              : "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm border-b pb-2">Account Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-mono">{selectedConvict.userId || "No linked account"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Joined: {selectedConvict.joinedAt ? format(new Date(selectedConvict.joinedAt), "PP") : "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Last Activity: {selectedConvict.lastActivityAt ? format(new Date(selectedConvict.lastActivityAt), "PPp") : "Never"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedConvict.notes && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm border-b pb-2">Staff Notes</h3>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{selectedConvict.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="pt-4">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-[#A92FFA]" /></div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No activity logs found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {activities.map((activity, idx) => (
                        <Card key={idx} className="overflow-hidden border-l-4 border-l-[#A92FFA]">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="mb-1">{activity.type}</Badge>
                                <p className="text-sm font-medium">
                                  {activity.rideType || activity.distributionType || activity.workshopName || activity.careType || "Action recorded"}
                                </p>
                                {activity.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{activity.notes}"</p>}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{format(new Date(activity.timestamp), "MMM d, HH:mm")}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="books" className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Book/Resource Requests</h3>
                    <Button size="sm" onClick={() => setShowBookRequestModal(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Add Request
                    </Button>
                  </div>
                  {loadingBookRequests ? (
                    <div className="flex items-center justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin" /></div>
                  ) : bookRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Book className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p>No book requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {bookRequests.map((req) => (
                        <Card key={req.id}>
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{req.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">{req.bookAuthor || "Unknown Author"} • {req.resourceType}</p>
                            </div>
                            <Badge variant={req.status === "fulfilled" ? "default" : req.status === "pending" ? "secondary" : "outline"}>{req.status}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="groups" className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Group Memberships</h3>
                    <Button size="sm" onClick={() => setShowGroupModal(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Add to Group
                    </Button>
                  </div>
                  {loadingGroups ? (
                    <div className="flex items-center justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin" /></div>
                  ) : convictGroups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p>Not a member of any groups</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {convictGroups.map((group) => (
                        <Card key={group.id}>
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{group.name}</p>
                              <p className="text-xs text-muted-foreground">{group.groupType} • {group.memberRole || "member"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromGroup(group.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="pt-4 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-[#A92FFA]" onClick={() => setShowBookRequestModal(true)}>
                      <Book className="w-5 h-5 text-[#A92FFA]" />
                      <span className="text-xs font-medium">Book Request</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500" onClick={() => setShowGroupModal(true)}>
                      <UserPlus className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-medium">Add to Group</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500" onClick={() => setShowTransitModal(true)}>
                      <Car className="w-5 h-5 text-orange-500" />
                      <span className="text-xs font-medium">Transit Request</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500" onClick={openEditProfileModal}>
                      <FilePlus className="w-5 h-5 text-green-500" />
                      <span className="text-xs font-medium">Edit Profile</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border">
                    <h4 className="text-sm font-semibold mb-3">Quick Status Update</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={selectedConvict.status === "active" ? "default" : "outline"} className="text-green-600" onClick={() => handleUpdateStatus("active")} disabled={saving}>
                        <Check className="w-3 h-3 mr-1" /> Active
                      </Button>
                      <Button size="sm" variant={selectedConvict.status === "inactive" ? "default" : "outline"} className="text-yellow-600" onClick={() => handleUpdateStatus("inactive")} disabled={saving}>
                        Inactive
                      </Button>
                      <Button size="sm" variant={selectedConvict.status === "suspended" ? "default" : "outline"} className="text-red-600" onClick={() => handleUpdateStatus("suspended")} disabled={saving}>
                        Suspended
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-6 border-t flex justify-end items-center">
                <Button variant="outline" onClick={() => setSelectedConvict(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Book Request Modal */}
      <Dialog open={showBookRequestModal} onOpenChange={setShowBookRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Book className="w-5 h-5 text-[#A92FFA]" /> Add Book Request</DialogTitle>
            <DialogDescription>Request a book or resource for {selectedConvict?.firstName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Book Title *</Label>
              <Input value={bookRequestForm.bookTitle} onChange={(e) => setBookRequestForm({ ...bookRequestForm, bookTitle: e.target.value })} placeholder="Enter book title" />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input value={bookRequestForm.bookAuthor} onChange={(e) => setBookRequestForm({ ...bookRequestForm, bookAuthor: e.target.value })} placeholder="Enter author name" />
            </div>
            <div className="space-y-2">
              <Label>Resource Type</Label>
              <Select value={bookRequestForm.resourceType} onValueChange={(v) => setBookRequestForm({ ...bookRequestForm, resourceType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                          {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={bookRequestForm.reason} onChange={(e) => setBookRequestForm({ ...bookRequestForm, reason: e.target.value })} placeholder="Why is this resource needed?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookRequestModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitBookRequest} disabled={saving}>{saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Group Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-500" /> Add to Group</DialogTitle>
            <DialogDescription>Select a group for {selectedConvict?.firstName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto py-4">
            {allGroups.filter(g => !convictGroups.find(cg => cg.id === g.id)).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Already a member of all available groups</p>
            ) : (
              allGroups.filter(g => !convictGroups.find(cg => cg.id === g.id)).map((group) => (
                <Card key={group.id} className="cursor-pointer hover:border-blue-500" onClick={() => { handleAddToGroup(group.id); setShowGroupModal(false); }}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.groupType} • {group.memberCount || 0} members</p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-500" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transit Request Modal */}
      <Dialog open={showTransitModal} onOpenChange={setShowTransitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Car className="w-5 h-5 text-orange-500" /> Submit Transit Request</DialogTitle>
            <DialogDescription>Book a transit ride for {selectedConvict?.firstName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pickup Location *</Label>
              <Input value={transitForm.pickupLocation} onChange={(e) => setTransitForm({ ...transitForm, pickupLocation: e.target.value })} placeholder="Enter pickup address" />
            </div>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input value={transitForm.destination} onChange={(e) => setTransitForm({ ...transitForm, destination: e.target.value })} placeholder="Enter destination address" />
            </div>
            <div className="space-y-2">
              <Label>Requested Time *</Label>
              <Input type="datetime-local" value={transitForm.requestedTime} onChange={(e) => setTransitForm({ ...transitForm, requestedTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ride Purpose</Label>
              <Select value={transitForm.ridePurpose} onValueChange={(v) => setTransitForm({ ...transitForm, ridePurpose: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Medical Appointment</SelectItem>
                  <SelectItem value="court">Court Date</SelectItem>
                  <SelectItem value="job_interview">Job Interview</SelectItem>
                  <SelectItem value="housing">Housing Visit</SelectItem>
                  <SelectItem value="workshop">Workshop/Event</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Special Needs</Label>
              <Input value={transitForm.specialNeeds} onChange={(e) => setTransitForm({ ...transitForm, specialNeeds: e.target.value })} placeholder="Wheelchair, etc." />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={transitForm.notes} onChange={(e) => setTransitForm({ ...transitForm, notes: e.target.value })} placeholder="Additional information" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitTransitRequest} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Car className="w-4 h-4 mr-2" />} Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FilePlus className="w-5 h-5 text-green-500" /> Edit Profile</DialogTitle>
            <DialogDescription>Update {selectedConvict?.firstName}'s profile information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={editProfileForm.firstName} onChange={(e) => setEditProfileForm({ ...editProfileForm, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={editProfileForm.lastName} onChange={(e) => setEditProfileForm({ ...editProfileForm, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editProfileForm.email} onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editProfileForm.phone} onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Input value={editProfileForm.address} onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={editProfileForm.city} onChange={(e) => setEditProfileForm({ ...editProfileForm, city: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={editProfileForm.state} onChange={(e) => setEditProfileForm({ ...editProfileForm, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input value={editProfileForm.zipCode} onChange={(e) => setEditProfileForm({ ...editProfileForm, zipCode: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Convict Type</Label>
              <Select value={editProfileForm.convictType} onValueChange={(v) => setEditProfileForm({ ...editProfileForm, convictType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONVICT_TYPES.filter(t => t.value !== "all").map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editProfileForm.status} onValueChange={(v) => setEditProfileForm({ ...editProfileForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter(s => s.value !== "all").map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Staff Notes</Label>
              <Textarea value={editProfileForm.notes} onChange={(e) => setEditProfileForm({ ...editProfileForm, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfileModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={saving} className="bg-green-500 hover:bg-green-600">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
