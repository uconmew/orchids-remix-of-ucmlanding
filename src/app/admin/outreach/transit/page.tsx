"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, Calendar, Clock, MapPin, Search, CheckCircle2, 
  XCircle, AlertCircle, Trash2, Edit, Plus, Info, ShieldCheck,
  User, Phone, Mail, Filter, ArrowUpDown, Play, Square, RefreshCw, Key, Copy
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Booking {
  id: number;
  userId: string;
  convictId: number | null;
  userName: string;
  userEmail: string;
  riderName: string | null;
  riderPhone: string | null;
  riderEmail: string | null;
  pickupLocation: string;
  destination: string;
  ridePurpose: string | null;
  specialNeeds: string | null;
  requestedTime: string;
  scheduledTime: string | null;
  status: string;
  termsAccepted: boolean;
  coComplianceAccepted: boolean;
  userNotes: string | null;
  staffNotes: string | null;
  staffRequirements: string | null;
  deniedReason: string | null;
  approvedBy: string | null;
  assignedDriverId: string | null;
  completedAt: string | null;
  driverName?: string;
  driverVehicle?: string;
  driverGender?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
}

interface Constraint {
  id: number;
  constraintType: string;
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string | null;
  endTime: string | null;
  maxCapacity: number | null;
  reason: string | null;
  requiresOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityData {
  defaults: {
    startTime: string;
    endTime: string;
    capacity: number;
    description: string;
  };
  constraints: Constraint[];
}

interface OverrideCode {
  id: number;
  code: string;
  generatedBy: string;
  usedBy: string | null;
  usedAt: string | null;
  isUsed: boolean;
  expiresAt: string;
  purpose: string;
  createdAt: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const RIDE_PURPOSE_LABELS: Record<string, string> = {
  job_interview: "Job Interview",
  medical: "Medical Appointment",
  court: "Court Date",
  housing: "Housing Connection",
  social_services: "Social Services",
  grocery: "Grocery Shopping",
  church: "Church/Religious",
  other: "Other",
};

const CONSTRAINT_TYPES = [
  { value: "closed", label: "Closed (All Day)" },
  { value: "unavailable", label: "Unavailable Time Window" },
  { value: "reduced_hours", label: "Reduced Hours" },
  { value: "reduced_capacity", label: "Reduced Capacity" },
];

export default function TransitManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [staffNotes, setStaffNotes] = useState("");
    const [deniedReason, setDeniedReason] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [assignedDriverId, setAssignedDriverId] = useState("");
    const [potentialDrivers, setPotentialDrivers] = useState<UserSummary[]>([]);
    
    const [isConstraintDialogOpen, setIsConstraintDialogOpen] = useState(false);
    const [editingConstraint, setEditingConstraint] = useState<Partial<Constraint> | null>(null);
    
    const [overrideCodes, setOverrideCodes] = useState<OverrideCode[]>([]);
    const [showAllCodes, setShowAllCodes] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [staffRequirementsInput, setStaffRequirementsInput] = useState("");
  
    useEffect(() => {
      fetchData();
      fetchDrivers();
      fetchOverrideCodes();
    }, []);
  
    useEffect(() => {
      fetchOverrideCodes();
    }, [showAllCodes]);
  
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, availabilityRes] = await Promise.all([
          fetch("/api/admin/outreach/transit/bookings"),
          fetch("/api/admin/outreach/transit/availability")
        ]);
        
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (availabilityRes.ok) setAvailabilityData(await availabilityRes.json());
      } catch (error) {
        console.error("Error fetching transit data:", error);
        toast.error("Failed to load transit data");
      } finally {
        setLoading(false);
      }
    };

    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          setPotentialDrivers(await response.json());
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    const fetchOverrideCodes = async () => {
      try {
        const response = await fetch(`/api/admin/override-codes${showAllCodes ? '?showAll=true' : ''}`, {
          credentials: "include"
        });
        if (response.ok) {
          setOverrideCodes(await response.json());
        }
      } catch (error) {
        console.error("Error fetching override codes:", error);
      }
    };

  const formatExpirationTime = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleGenerateOverrideCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch("/api/admin/override-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          purpose: "transit_24h_bypass"
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const expiresTime = formatExpirationTime(data.expiresAt);
        fetchOverrideCodes();
        toast.success(
          `${data.code} - Expires ${expiresTime}`,
          {
            duration: 8000,
            action: {
              label: "Copy",
              onClick: () => {
                navigator.clipboard.writeText(data.code);
                toast.success("Copied!");
              },
            },
          }
        );
      } else {
        const errorMsg = data.code 
          ? `[${data.code}] ${data.error || data.message || 'Failed to generate code'}`
          : (data.error || data.message || 'Failed to generate code');
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error generating override code:", error);
      toast.error("An error occurred while generating the code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

    const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      toast.success("Copied!");
    };

    const handleDeleteOverrideCode = async (id: number, code: OverrideCode) => {
      const isExpired = new Date(code.expiresAt) < new Date();
      if (isExpired) {
        toast.error("Cannot delete expired codes");
        return;
      }
      if (code.isUsed) {
        toast.error("Cannot delete used codes - retained for audit purposes");
        return;
      }
      
      try {
        const response = await fetch(`/api/admin/override-codes?id=${id}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (response.ok) {
          toast.success("Code deleted");
          fetchOverrideCodes();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to delete code");
        }
      } catch (error) {
        toast.error("Failed to delete code");
      }
    };
  
    const handleUpdateStatus = async (id: number, status: string) => {
        try {
          const response = await fetch("/api/admin/outreach/transit/bookings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              id, 
              status, 
              staffNotes,
              deniedReason: ['denied', 'ineligible', 'deferral', 'loss'].includes(status) ? deniedReason : undefined,
              staffRequirements: status === 'need more information' ? staffRequirementsInput : undefined,
              scheduledTime,
              assignedDriverId: assignedDriverId || undefined
            }),
          });

        if (response.ok) {
          toast.success(`Booking ${status} successfully`);
          setIsBookingDialogOpen(false);
          fetchData();
        } else {
          toast.error("Failed to update booking status");
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await fetch(`/api/admin/outreach/transit/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete booking");
    }
  };

  const handleSaveConstraint = async () => {
    if (!editingConstraint) return;
    
    const method = editingConstraint.id ? "PATCH" : "POST";
    try {
      const response = await fetch("/api/admin/outreach/transit/availability", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingConstraint),
      });

      if (response.ok) {
        toast.success("Constraint saved");
        setIsConstraintDialogOpen(false);
        setEditingConstraint(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to save constraint");
    }
  };

  const handleDeleteConstraint = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/outreach/transit/availability?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Constraint removed");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to remove constraint");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (b.riderName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (b.pickupLocation?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (b.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'approved': return <Badge className="bg-green-600 text-white">Approved</Badge>;
        case 'denied': return <Badge variant="destructive">Denied</Badge>;
        case 'completed': return <Badge variant="secondary">Completed</Badge>;
        case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
        case 'in_progress': return <Badge className="bg-blue-600 text-white">In Progress</Badge>;
        case 'need more information': return <Badge className="bg-blue-400 text-white">Need Info</Badge>;
        case 'ineligible': return <Badge variant="destructive">Ineligible</Badge>;
        case 'deferral': return <Badge className="bg-amber-600 text-white">Deferral</Badge>;
        case 'loss': return <Badge variant="destructive">Loss</Badge>;
        default: return <Badge className="bg-[#F28C28] text-white">Pending</Badge>;
      }
    };
  
    const openBookingDialog = (booking: Booking) => {
          setSelectedBooking(booking);
          setStaffNotes(booking.staffNotes || "");
          setDeniedReason(booking.deniedReason || "");
          setScheduledTime(booking.scheduledTime || booking.requestedTime);
          setAssignedDriverId(booking.assignedDriverId || "");
          setPendingStatus(booking.status);
          setStaffRequirementsInput(booking.staffRequirements || "");
          setIsBookingDialogOpen(true);
        };

    const handleSaveChanges = async () => {
      if (!selectedBooking) return;
      await handleUpdateStatus(selectedBooking.id, pendingStatus);
    };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Transit Management</h1>
          <p className="text-muted-foreground">Manage ride requests, driver availability, and compliance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#F28C28]/10 border-[#F28C28]/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-[#F28C28]">{pendingCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-[#F28C28]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#A92FFA]/10 border-[#A92FFA]/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold text-[#A92FFA]">{bookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#A92FFA]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="bookings">Ride Requests</TabsTrigger>
            <TabsTrigger value="availability">Driver Availability</TabsTrigger>
            <TabsTrigger value="override">Override Codes</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Terms</TabsTrigger>
          </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Live Bookings</CardTitle>
                  <CardDescription>Real-time view of all transit requests from registered convicts.</CardDescription>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search bookings..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="need more information">Need Info</SelectItem>
                        <SelectItem value="ineligible">Ineligible</SelectItem>
                        <SelectItem value="deferral">Deferral</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No ride requests found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-[#A92FFA]" />
                            <p className="font-bold">{booking.riderName || booking.userName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.riderEmail || booking.userEmail}
                          </p>
                          {booking.riderPhone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {booking.riderPhone}
                            </p>
                          )}
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {getStatusBadge(booking.status)}
                            {booking.ridePurpose && (
                              <Badge variant="outline" className="text-xs">
                                {RIDE_PURPOSE_LABELS[booking.ridePurpose] || booking.ridePurpose}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                            <span className="line-clamp-2">{booking.pickupLocation}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                            <span className="line-clamp-2">{booking.destination}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(booking.requestedTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(booking.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {booking.specialNeeds && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Needs: {booking.specialNeeds}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {booking.termsAccepted && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Terms
                            </Badge>
                          )}
                          {booking.coComplianceAccepted && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <ShieldCheck className="w-3 h-3 mr-1" /> CO
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openBookingDialog(booking)}>
                          Manage
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteBooking(booking.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-[#A92FFA]" />
                    Default Operating Hours
                  </CardTitle>
                  <CardDescription>
                    Transit operates daily with these default settings. Add constraints below to restrict specific days/times.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Operating Hours</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availabilityData?.defaults?.startTime ? new Date(`2000-01-01T${availabilityData.defaults.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '4:00 AM'} - {availabilityData?.defaults?.endTime ? new Date(`2000-01-01T${availabilityData.defaults.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '10:00 PM'}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Daily Capacity</p>
                  <p className="text-2xl font-bold text-blue-600">{availabilityData?.defaults?.capacity || 20} rides/day</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Active Constraints</p>
                  <p className="text-2xl font-bold text-purple-600">{availabilityData?.constraints?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    Availability Constraints
                  </CardTitle>
                  <CardDescription>
                    Restrictions that override the default operating hours (e.g., holidays, reduced hours, closures)
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingConstraint({ constraintType: 'closed', requiresOverride: true });
                  setIsConstraintDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Constraint
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!availabilityData?.constraints || availabilityData.constraints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">No Constraints Active</p>
                  <p className="text-sm">Transit is operating normally during default hours (4 AM - 10 PM daily)</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availabilityData.constraints.map((constraint) => (
                    <div key={constraint.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          constraint.constraintType === 'closed' ? 'bg-red-500/20 text-red-500' :
                          constraint.constraintType === 'unavailable' ? 'bg-amber-500/20 text-amber-500' :
                          constraint.constraintType === 'reduced_hours' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          {constraint.constraintType === 'closed' ? <XCircle className="w-5 h-5" /> :
                           constraint.constraintType === 'unavailable' ? <AlertCircle className="w-5 h-5" /> :
                           <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={constraint.constraintType === 'closed' ? 'destructive' : 'outline'}>
                              {CONSTRAINT_TYPES.find(t => t.value === constraint.constraintType)?.label || constraint.constraintType}
                            </Badge>
                            {constraint.requiresOverride && (
                              <Badge variant="secondary" className="text-xs">Override Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {constraint.specificDate ? (
                              <>Date: {new Date(constraint.specificDate).toLocaleDateString()}</>
                            ) : constraint.dayOfWeek !== null ? (
                              <>Every {DAYS[constraint.dayOfWeek]}</>
                            ) : 'All days'}
                            {constraint.startTime && constraint.endTime && (
                              <> | {constraint.startTime} - {constraint.endTime}</>
                            )}
                            {constraint.maxCapacity && (
                              <> | Capacity: {constraint.maxCapacity}</>
                            )}
                          </p>
                          {constraint.reason && (
                            <p className="text-sm font-medium mt-1">{constraint.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingConstraint(constraint);
                          setIsConstraintDialogOpen(true);
                        }}>
                          <Edit className="w-3 h-3 mr-2" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteConstraint(constraint.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="override">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Override Codes</CardTitle>
                  <CardDescription className="text-xs">24-hour bypass codes</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={showAllCodes}
                      onChange={(e) => setShowAllCodes(e.target.checked)}
                      className="rounded w-3 h-3"
                    />
                    all
                  </label>
                  <Button 
                    onClick={handleGenerateOverrideCode} 
                    disabled={isGeneratingCode}
                    size="sm"
                    className="h-7 px-3 text-xs bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                  >
                    {isGeneratingCode ? "..." : "+ New"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {overrideCodes.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">
                  {showAllCodes ? 'No codes.' : 'No active codes.'}
                </p>
              ) : (
                <div className="space-y-1">
                  {overrideCodes
                    .filter(code => {
                      if (showAllCodes) return true;
                      if (code.isUsed) return false;
                      const expiresAt = new Date(code.expiresAt);
                      const now = new Date();
                      const thirtyMinsAfterExpiry = new Date(expiresAt.getTime() + 30 * 60 * 1000);
                      if (now > thirtyMinsAfterExpiry) return false;
                      return true;
                    })
                    .map((code) => {
                      const isExpired = new Date(code.expiresAt) < new Date();
                      const canDelete = !isExpired && !code.isUsed;
                      
                      return (
                        <div 
                          key={code.id} 
                          className={`flex items-center justify-between py-1.5 px-2 rounded text-sm ${
                            code.isUsed ? 'opacity-40' : isExpired ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold tracking-wider ${
                              code.isUsed ? 'text-muted-foreground line-through' : 
                              isExpired ? 'text-muted-foreground' : 'text-[#A92FFA]'
                            }`}>
                              {code.code}
                            </span>
                            <span className={`text-[10px] ${isExpired && !code.isUsed ? 'text-red-400' : 'text-muted-foreground'}`}>
                              {code.isUsed ? 'used' : isExpired ? `exp ${formatExpirationTime(code.expiresAt)}` : formatExpirationTime(code.expiresAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {!code.isUsed && !isExpired && (
                              <button 
                                className="p-1 hover:bg-muted rounded"
                                onClick={() => handleCopyCode(code.code)}
                              >
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                className="p-1 hover:bg-red-500/10 rounded"
                                onClick={() => handleDeleteOverrideCode(code.id, code)}
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              <p className="text-[9px] text-muted-foreground mt-3 text-center opacity-60">
                5 min expiry • archived 30 min after
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#A92FFA]" />
                Colorado Transit & Safety Compliance
              </CardTitle>
              <CardDescription>Required standards for UCON TRANSIT operations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg border-l-4 border-[#A92FFA]">
                <h3 className="font-bold mb-2">Driver Requirements</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Valid Colorado Driver's License</li>
                  <li>Clean driving record (last 3 years)</li>
                  <li>Background check clearance</li>
                  <li>Annual safety training completion</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg border-l-4 border-[#F28C28]">
                <h3 className="font-bold mb-2">Vehicle Standards</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Quarterly safety inspections</li>
                  <li>Colorado state registration & insurance</li>
                  <li>First aid kit & emergency equipment on board</li>
                  <li>ADA accessibility compliance where applicable</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">Terms of Use</h3>
                <p className="text-sm text-muted-foreground">
                  All rides provided by UCON Ministries are intended for essential services (medical, legal, employment).
                  Users must remain respectful, drug-free, and comply with safety instructions from the driver at all times.
                  Failure to comply may result in loss of transit privileges.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Ride Request</DialogTitle>
            <DialogDescription>Review and update status for {selectedBooking?.riderName || selectedBooking?.userName}.</DialogDescription>
          </DialogHeader>
          
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Status:</span>
                  {selectedBooking && getStatusBadge(selectedBooking.status)}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">From:</span> {selectedBooking?.pickupLocation}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">To:</span> {selectedBooking?.destination}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-muted-foreground">Requested:</span> {selectedBooking && new Date(selectedBooking.requestedTime).toLocaleString()}
                </div>
                {selectedBooking?.ridePurpose && (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="text-muted-foreground">Purpose:</span> {RIDE_PURPOSE_LABELS[selectedBooking.ridePurpose] || selectedBooking.ridePurpose}
                  </div>
                )}
                {selectedBooking?.specialNeeds && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span className="text-muted-foreground">Special Needs:</span> {selectedBooking.specialNeeds}
                  </div>
                )}
                {selectedBooking?.userNotes && (
                  <div className="mt-2 p-2 bg-background rounded italic text-xs">
                    "{selectedBooking.userNotes}"
                  </div>
                )}
                {selectedBooking?.driverName && (
                  <div className="mt-2 p-3 border border-[#A92FFA]/30 rounded bg-background">
                    <p className="text-[11px] font-bold text-[#A92FFA] uppercase">Assigned Driver</p>
                    <p className="text-sm">{selectedBooking.driverName}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedBooking.driverVehicle} | {selectedBooking.driverGender}</p>
                  </div>
                )}
              </div>
  
              <div className="space-y-2">
                <Label>Scheduled Time (for approval)</Label>
                <Input 
                  type="datetime-local" 
                  value={scheduledTime ? scheduledTime.slice(0, 16) : ''}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Driver</Label>
                <Select value={assignedDriverId} onValueChange={setAssignedDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a volunteer driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select 
                    value={pendingStatus} 
                    onValueChange={(val) => setPendingStatus(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="need more information">Need Info</SelectItem>
                      <SelectItem value="ineligible">Ineligible</SelectItem>
                      <SelectItem value="deferral">Deferral</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
  
              <div className="space-y-2">
                <Label>Staff Notes</Label>
                <Textarea 
                  placeholder="Internal notes for this ride..." 
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                />
              </div>
  
                <div className="space-y-2">
                  <Label>Reason (for denial/info/etc)</Label>
                  <Input 
                    placeholder="Explain why status changed..." 
                    value={deniedReason}
                    onChange={(e) => setDeniedReason(e.target.value)}
                  />
                </div>

                {pendingStatus === 'need more information' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-blue-600">
                      <Info className="w-4 h-4" />
                      Staff Requirements (Required)
                    </Label>
                    <Textarea 
                      placeholder="Specify what additional information the convict needs to provide (e.g., proof of appointment, doctor's note, etc.)..." 
                      value={staffRequirementsInput}
                      onChange={(e) => setStaffRequirementsInput(e.target.value)}
                      rows={3}
                      className="border-blue-500/30 focus:border-blue-500"
                    />
                    <p className="text-xs text-muted-foreground">This will be shown to the user in an alert so they know exactly what you need.</p>
                  </div>
                )}
              </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                onClick={handleSaveChanges}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConstraintDialogOpen} onOpenChange={setIsConstraintDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingConstraint?.id ? "Edit Constraint" : "Add Constraint"}</DialogTitle>
            <DialogDescription>
              Add restrictions to override the default operating hours (4 AM - 10 PM, capacity 20)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Constraint Type *</Label>
              <Select 
                value={editingConstraint?.constraintType} 
                onValueChange={(val) => setEditingConstraint({...editingConstraint, constraintType: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CONSTRAINT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Apply To</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Recurring Day</Label>
                  <Select 
                    value={editingConstraint?.dayOfWeek?.toString() ?? 'none'} 
                    onValueChange={(val) => setEditingConstraint({
                      ...editingConstraint, 
                      dayOfWeek: val === 'none' ? null : parseInt(val),
                      specificDate: val !== 'none' ? null : editingConstraint?.specificDate
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not recurring</SelectItem>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Specific Date</Label>
                  <Input 
                    type="date" 
                    value={editingConstraint?.specificDate || ''} 
                    onChange={(e) => setEditingConstraint({
                      ...editingConstraint, 
                      specificDate: e.target.value || null,
                      dayOfWeek: e.target.value ? null : editingConstraint?.dayOfWeek
                    })}
                  />
                </div>
              </div>
            </div>
            
            {editingConstraint?.constraintType !== 'closed' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={editingConstraint?.startTime || ''} 
                    onChange={(e) => setEditingConstraint({...editingConstraint, startTime: e.target.value || null})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={editingConstraint?.endTime || ''} 
                    onChange={(e) => setEditingConstraint({...editingConstraint, endTime: e.target.value || null})}
                  />
                </div>
              </div>
            )}

            {editingConstraint?.constraintType === 'reduced_capacity' && (
              <div className="space-y-2">
                <Label>Max Capacity (default: 20)</Label>
                <Input 
                  type="number" 
                  min="0"
                  max="20"
                  value={editingConstraint?.maxCapacity ?? ''} 
                  onChange={(e) => setEditingConstraint({...editingConstraint, maxCapacity: e.target.value ? parseInt(e.target.value) : null})}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason/Description</Label>
              <Input 
                placeholder="e.g., Holiday, Staff shortage, Maintenance..."
                value={editingConstraint?.reason || ''} 
                onChange={(e) => setEditingConstraint({...editingConstraint, reason: e.target.value || null})}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresOverride"
                checked={editingConstraint?.requiresOverride !== false}
                onChange={(e) => setEditingConstraint({...editingConstraint, requiresOverride: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="requiresOverride" className="cursor-pointer">
                Can be bypassed with override code
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConstraintDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#A92FFA]" onClick={handleSaveConstraint}>Save Constraint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
