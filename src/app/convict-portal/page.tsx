"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Settings, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  Heart,
  Truck,
  Shield,
  Clock,
  ArrowRight,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Check,
  MapPin,
  Phone,
  Car,
  Pencil,
  X,
  Navigation2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function ConvictPortalPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [transitBookings, setTransitBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [originalBooking, setOriginalBooking] = useState<any | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    transitRides: 0,
    volunteerHours: 0,
    totalDonations: 0,
    bridgeConnections: 0,
    workshopsAttended: 0,
    prayersRequested: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const fetchActivities = async () => {
    if (!session) return;
    try {
      const response = await fetch('/api/outreach-activity?service=all_finalized&limit=10');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const fetchStats = async () => {
    if (!session) return;
    try {
      const response = await fetch('/api/convicts/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    if (!session) return;
    try {
      const response = await fetch('/api/outreach/transit/book', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTransitBookings(data);
      }
    } catch (error) {
      console.error('Error fetching transit bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      if (isPending) return;
      
      if (!session && retryCount < 5) {
        // Increase retry attempts and delay to allow cookies to propagate in iframe
        await new Promise(resolve => setTimeout(resolve, 800));
        await refetch();
        setRetryCount(prev => prev + 1);
        return;
      }
      
      if (!session) {
        // If still no session, use window.location for redirect to clear any stale state
        window.location.href = "/login?redirect=/convict-portal";
      }
    };
    
    checkSession();
  }, [session, isPending, retryCount, refetch]);

  useEffect(() => {
    if (session) {
      fetchBookings();
      fetchStats();
      fetchActivities();
    }
  }, [session]);

  const handleCancelBooking = async (id: number) => {
    // In a real app we'd use a nice dialog, but for now let's at least use toasts
    if (!confirm("Are you sure you want to cancel this ride request?")) return;
    
    const promise = fetch(`/api/outreach/transit/book?id=${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cancel booking");
      }
      fetchBookings();
      fetchStats(); // Update stats in case it was a completed ride (though completed rides shouldn't be cancellable)
      return "Booking cancelled successfully";
    });

    toast.promise(promise, {
      loading: 'Cancelling booking...',
      success: (data) => data,
      error: (err) => err.message,
    });
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    setIsSubmittingEdit(true);
    try {
      const response = await fetch('/api/outreach/transit/book', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBooking),
      });
      
      if (response.ok) {
        toast.success("Ride request updated successfully");
        setEditingBooking(null);
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("An error occurred while updating the booking");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-[#A92FFA]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back, {session.user.name}</h1>
            <p className="text-muted-foreground">Your personal transformation journey dashboard</p>
          </div>
          <Badge className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] px-4 py-1 text-sm font-bold">
            Active Convict Member
          </Badge>
          </div>

          {/* APPROVED RIDE HUD - Shows approved/in_progress rides prominently */}
          {transitBookings
            .filter(b => {
              const status = (b.status || '').toLowerCase();
              return status === 'approved' || status === 'in_progress' || status === 'in progress';
            })
            .map((booking) => {
              const isPickedUp = ['in_progress', 'in progress'].includes((booking.status || '').toLowerCase());
              const appointmentTime = booking.scheduledTime || booking.requestedTime;
              return (
                <Card key={`hud-${booking.id}`} className="mb-6 border-2 border-green-500/40 bg-gradient-to-r from-green-500/5 to-[#A92FFA]/5 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-green-500" />
                        </div>
                        {isPickedUp ? 'Ride In Progress' : 'Upcoming Approved Ride'}
                      </CardTitle>
                      <Badge className={isPickedUp ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}>
                        {isPickedUp ? 'IN PROGRESS' : 'APPROVED'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Appointment Time */}
                      <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                        <Calendar className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Appointment</p>
                          <p className="text-sm font-semibold">
                            {new Date(appointmentTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-sm font-medium text-[#A92FFA]">
                            {new Date(appointmentTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        </div>
                      </div>

                      {/* Pickup & Drop-off */}
                      <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <div className="w-px h-4 bg-muted-foreground/30" />
                          <Navigation2 className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Route</p>
                          <p className="text-xs font-medium truncate" title={booking.pickupLocation}>{booking.pickupLocation}</p>
                          <p className="text-[10px] text-muted-foreground my-0.5">to</p>
                          <p className="text-xs font-medium truncate" title={booking.destination}>{booking.destination}</p>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                        <User className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Driver Details</p>
                          {booking.assignedDriverId ? (
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{booking.driverName || 'Volunteer Driver'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Car className="w-3 h-3" />
                                <span>{booking.driverVehicle || 'Standard Vehicle'}</span>
                              </div>
                              {booking.driverGender && (
                                <p className="text-xs text-muted-foreground">{booking.driverGender}</p>
                              )}
                              {booking.driverPhone && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="w-3 h-3 text-green-500" />
                                  <a href={`tel:${booking.driverPhone}`} className="text-[#A92FFA] hover:underline font-medium">
                                    {booking.driverPhone}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Awaiting driver assignment</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - only show modify/cancel if rider hasn't been picked up */}
                    {!isPickedUp && (
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-[#A92FFA]/30 hover:bg-[#A92FFA]/10 hover:text-[#A92FFA]"
                          onClick={() => {
                            setOriginalBooking({...booking});
                            setEditingBooking({...booking});
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Modify Ride
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Ride
                        </Button>
                      </div>
                    )}

                    {isPickedUp && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-blue-600 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Your ride is currently in progress. Sit tight!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 border-2 border-[#A92FFA]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#A92FFA]" />
                Your Progress
              </CardTitle>
              <CardDescription>Transformation milestones and upcoming activities</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#A92FFA]" />
                      Member Status: Registered
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have full access to Open Ministry Services and Outreach programs.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/services">Explore Services</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="border-[#F28C28] text-[#F28C28] hover:bg-[#F28C28]/10">
                        <Link href="/volunteer">Volunteer Now</Link>
                      </Button>
                    </div>
                  </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                      <div className="p-3 bg-background border rounded-lg hover:border-[#A92FFA] transition-colors">
                        <p className="text-2xl font-bold text-[#A92FFA]">{stats.transitRides}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Transit Rides</p>
                      </div>
                      <div className="p-3 bg-background border rounded-lg hover:border-[#F28C28] transition-colors">
                        <p className="text-2xl font-bold text-[#F28C28]">{stats.volunteerHours}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Volunteer Hours</p>
                      </div>
                      <div className="p-3 bg-background border rounded-lg hover:border-[#A92FFA] transition-colors">
                        <p className="text-2xl font-bold text-[#A92FFA]">${stats.totalDonations}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Donations</p>
                      </div>
                      <div className="p-3 bg-background border rounded-lg hover:border-[#F28C28] transition-colors">
                        <p className="text-2xl font-bold text-[#F28C28]">{stats.bridgeConnections}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Bridge Connections</p>
                      </div>
                      <div className="p-3 bg-background border rounded-lg hover:border-[#A92FFA] transition-colors">
                        <p className="text-2xl font-bold text-[#A92FFA]">{stats.workshopsAttended}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Workshops</p>
                      </div>
                      <div className="p-3 bg-background border rounded-lg hover:border-[#F28C28] transition-colors">
                        <p className="text-2xl font-bold text-[#F28C28]">{stats.prayersRequested}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Prayers</p>
                      </div>
                    </div>

                </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#F28C28]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F28C28]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link href="/services">
                  <Calendar className="w-4 h-4 text-[#F28C28]" />
                  Book a Workshop
                </Link>
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link href="/outreach">
                  <Truck className="w-4 h-4 text-[#A92FFA]" />
                  Request Transportation
                </Link>
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link href="/prayer-wall">
                  <MessageSquare className="w-4 h-4 text-[#F28C28]" />
                  Prayer Wall
                </Link>
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link href="/ldi">
                  <ArrowRight className="w-4 h-4 text-[#A92FFA]" />
                  Apply to LDI Program
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#F28C28]" />
                  Giving & Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Total Lifetime Giving</span>
                    <span className="text-lg font-bold text-[#F28C28]">${stats.totalDonations}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Your contributions fuel our mission to transform lives. Every dollar helps provide shelter, food, and spiritual guidance to those in need.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/donations">Make a Donation</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#A92FFA]" />
                  Bridge & Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-lg font-bold text-[#A92FFA]">{stats.bridgeConnections}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    The UCON BRIDGE program connects you with mentors and peers who have walked the same path. These connections are the bedrock of lasting transformation.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/services">Join a Bridge Group</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#A92FFA]" />
                  Transit Request
                </CardTitle>
                <CardDescription>Track your ride requests and status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : transitBookings.filter(b => {
                    const status = (b.status || '').toLowerCase().replace(/_/g, ' ').trim();
                    return ['approved', 'pending', 'more info needed', 'need more information', 'in_progress', 'in progress', 'deferral'].includes(status);
                  }).length > 0 ? (
                    <div className="space-y-4">
                      {transitBookings
                        .filter(b => {
                          const status = (b.status || '').toLowerCase().replace(/_/g, ' ').trim();
                          return ['approved', 'pending', 'more info needed', 'need more information', 'in_progress', 'in progress', 'deferral'].includes(status);
                        })
                        .map((booking) => (
                        <div key={booking.id} className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">
                                  {new Date(booking.requestedTime).toLocaleDateString()} at {new Date(booking.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {booking.pickupLocation} → {booking.destination}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                    <Badge 
                                      variant={
                                        ['approved', 'completed'].includes((booking.status || '').toLowerCase()) ? 'default' : 
                                        ['denied', 'declined', 'cancelled', 'ineligible', 'suspended', 'loss'].includes((booking.status || '').toLowerCase()) ? 'destructive' : 
                                        'secondary'
                                      }
                                      className={
                                        (booking.status || '').toLowerCase() === 'approved' ? 'bg-green-500 hover:bg-green-600' : 
                                        (booking.status || '').toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30' :
                                        (booking.status || '').toLowerCase() === 'in_progress' || (booking.status || '').toLowerCase() === 'in progress' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                        ['more_info_needed', 'more info needed', 'need more information', 'deferral'].includes((booking.status || '').toLowerCase().replace(/_/g, ' ')) ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30' :
                                        ''
                                      }
                                    >
                                      {(booking.status || '').toUpperCase().replace(/_/g, ' ')}
                                    </Badge>
                                     {!['completed', 'cancelled', 'denied', 'declined', 'ineligible', 'suspended', 'loss', 'in_progress', 'in progress'].includes((booking.status || '').toLowerCase()) && (
                                  <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px]"
                                        onClick={() => {
                                          setOriginalBooking({...booking});
                                          setEditingBooking({...booking});
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {['more_info_needed', 'more info needed', 'need more information'].includes((booking.status || '').toLowerCase().replace(/_/g, ' ')) && (
                                <div className="mt-3 space-y-2">
                                  {booking.staffRequirements && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
                                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">What Staff Needs From You:</p>
                                      <p className="text-sm text-blue-700">{booking.staffRequirements}</p>
                                    </div>
                                  )}
                                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Your Response</label>
                                <textarea
                                  className="w-full p-3 text-sm rounded-lg border-2 border-blue-200 bg-blue-50/30 focus:border-blue-400 outline-none transition-all"
                                  placeholder={booking.staffRequirements || "Please provide the additional information requested by staff..."}
                                  rows={4}
                                  maxLength={5000}
                                  value={booking.userNotes || ''}
                                  onChange={(e) => {
                                    const updated = transitBookings.map(b => 
                                      b.id === booking.id ? { ...b, userNotes: e.target.value } : b
                                    );
                                    setTransitBookings(updated);
                                  }}
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-muted-foreground">
                                    {booking.userNotes?.length || 0} / 5000 characters
                                  </span>
                                  <Button 
                                    size="sm" 
                                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={async () => {
                                      setIsSubmittingEdit(true);
                                      try {
                                        const response = await fetch('/api/outreach/transit/book', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            id: booking.id,
                                            userNotes: booking.userNotes,
                                            status: 'pending' // Move back to pending after providing info
                                          }),
                                        });
                                        if (response.ok) {
                                          toast.success("Information submitted. Your request is now pending review.");
                                          fetchBookings();
                                        } else {
                                          const err = await response.json();
                                          toast.error(err.error || "Failed to submit info");
                                        }
                                      } catch (err) {
                                        toast.error("An error occurred");
                                      } finally {
                                        setIsSubmittingEdit(false);
                                      }
                                    }}
                                    disabled={isSubmittingEdit}
                                  >
                                    {isSubmittingEdit ? "Submitting..." : "Submit Information"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {booking.assignedDriverId && booking.status.toLowerCase() === 'approved' && (
                            <div className="mt-3 p-3 bg-background rounded border border-[#A92FFA]/20 space-y-2">
                              <p className="text-[11px] font-bold text-[#A92FFA] uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Assigned Driver Details
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <span className="text-muted-foreground">Driver:</span>
                                  <p className="font-medium">{booking.driverName || "Volunteer Driver"}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Vehicle:</span>
                                  <p className="font-medium">{booking.driverVehicle || "Standard Vehicle"}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Gender:</span>
                                  <p className="font-medium">{booking.driverGender || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {booking.status === 'denied' && booking.deniedReason && (
                            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                              Reason: {booking.deniedReason}
                            </p>
                          )}
                          {booking.status === 'pending' && (
                            <p className="text-[10px] text-muted-foreground italic">
                              Your ride has been successfully submitted. A transit staff member will review it and will approve or deny based on availability.
                            </p>
                          )}
                          {booking.status === 'approved' && !booking.assignedDriverId && (
                            <p className="text-[10px] text-blue-600 italic">
                              Ride approved! Waiting for a volunteer driver to accept the request.
                            </p>
                          )}
                        </div>
                      ))}
                    <Button variant="link" className="w-full text-xs text-[#A92FFA]" asChild>
                      <Link href="/outreach">Request Another Ride</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground italic">No ride requests found.</p>
                    <Button variant="link" className="mt-2 text-sm text-[#A92FFA]" asChild>
                      <Link href="/outreach">Book your first ride</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#A92FFA]" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Finalized outcomes and history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivities ? (
                  <div className="flex justify-center py-8">
                    <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'transit' ? 'bg-[#A92FFA]/10 text-[#A92FFA]' : 'bg-[#F28C28]/10 text-[#F28C28]'
                        }`}>
                          {activity.type === 'transit' ? <Truck className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-[8px] h-4 px-1 uppercase">
                              {activity.status}
                            </Badge>
                          </div>
                          {activity.details && (
                            <p className="text-[10px] mt-1 text-muted-foreground italic">
                              Note: {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground italic text-sm">No recent activity found.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Finalized ride requests and completed services will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#F28C28]" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm">{session.user.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm">{session.user.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm">{new Date(session.user.createdAt).toLocaleDateString()}</span>
                </div>
                <Button className="w-full mt-4" variant="secondary" asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {editingBooking && (
        <EditBookingModal
          editingBooking={editingBooking}
          originalBooking={originalBooking}
          isSubmittingEdit={isSubmittingEdit}
          onClose={() => {
            setEditingBooking(null);
            setOriginalBooking(null);
          }}
          onUpdate={handleUpdateBooking}
          onChange={(updated: any) => setEditingBooking(updated)}
        />
      )}

      <Footer />
    </div>
  );
}

interface AddressVerification {
  isValid: boolean;
  errors: { code: string; message: string; field?: string }[];
  formattedAddress?: string;
}

function EditBookingModal({ 
  editingBooking, 
  originalBooking,
  isSubmittingEdit, 
  onClose, 
  onUpdate,
  onChange
}: { 
  editingBooking: any;
  originalBooking: any;
  isSubmittingEdit: boolean;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onChange: (updated: any) => void;
}) {
  const [pickupVerification, setPickupVerification] = useState<AddressVerification | null>(null);
  const [destVerification, setDestVerification] = useState<AddressVerification | null>(null);
  const [isVerifyingPickup, setIsVerifyingPickup] = useState(false);
  const [isVerifyingDest, setIsVerifyingDest] = useState(false);

  const hasChanges = useMemo(() => {
    if (!originalBooking || !editingBooking) return false;
    return (
      editingBooking.pickupLocation !== originalBooking.pickupLocation ||
      editingBooking.destination !== originalBooking.destination ||
      editingBooking.requestedTime !== originalBooking.requestedTime ||
      editingBooking.userNotes !== originalBooking.userNotes
    );
  }, [editingBooking, originalBooking]);

  const isMoreInfoNeeded = ['more_info_needed', 'more info needed', 'need more information'].includes(
    (editingBooking?.status || '').toLowerCase().replace(/_/g, ' ')
  );

  const verifyAddress = async (address: string, type: 'pickup' | 'destination') => {
    if (!address.trim()) return;
    
    const setVerifying = type === 'pickup' ? setIsVerifyingPickup : setIsVerifyingDest;
    const setVerification = type === 'pickup' ? setPickupVerification : setDestVerification;
    
    setVerifying(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/address-verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify({ address }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setVerification(result);
      }
    } catch (error) {
      console.error('Error verifying address:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleUseSuggested = (type: 'pickup' | 'destination') => {
    const verification = type === 'pickup' ? pickupVerification : destVerification;
    if (verification?.formattedAddress) {
      const field = type === 'pickup' ? 'pickupLocation' : 'destination';
      onChange({...editingBooking, [field]: verification.formattedAddress});
      if (type === 'pickup') {
        setPickupVerification({ ...verification, isValid: true, errors: [] });
      } else {
        setDestVerification({ ...verification, isValid: true, errors: [] });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-2 border-[#A92FFA]/20 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Ride Request</CardTitle>
          <CardDescription>Update your transportation details</CardDescription>
        </CardHeader>
        <form onSubmit={onUpdate}>
          <CardContent className="space-y-4">
            {isMoreInfoNeeded && editingBooking.staffRequirements && (
              <div className="p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-600">Staff Requirements</p>
                    <p className="text-xs text-muted-foreground">Please address the following in your updated notes:</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 bg-blue-500/5 p-2 rounded mt-2">
                  {editingBooking.staffRequirements}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Pickup Location
              </label>
              <div className="relative">
                <input 
                  className={`w-full p-2 rounded border bg-background ${
                    pickupVerification ? (pickupVerification.isValid ? 'border-green-500' : 'border-amber-500') : ''
                  }`}
                  value={editingBooking.pickupLocation}
                  onChange={(e) => onChange({...editingBooking, pickupLocation: e.target.value})}
                  onBlur={() => verifyAddress(editingBooking.pickupLocation, 'pickup')}
                  placeholder="Full address (e.g., 123 Main St, Denver, CO 80202)"
                  required
                />
                {isVerifyingPickup && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                {!isVerifyingPickup && pickupVerification?.isValid && <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
              </div>
              {pickupVerification && !pickupVerification.isValid && pickupVerification.errors.length > 0 && (
                <div className="text-xs space-y-1">
                  {pickupVerification.errors.map((err, i) => (
                    <p key={i} className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      [{err.code}] {err.message}
                    </p>
                  ))}
                  {pickupVerification.formattedAddress && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300 text-xs font-medium mb-1">Suggested correction:</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-auto py-2 px-3 text-left justify-start border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        onClick={() => handleUseSuggested('pickup')}
                      >
                        <Check className="w-3 h-3 mr-2 flex-shrink-0 text-green-500" />
                        <span className="truncate">{pickupVerification.formattedAddress}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Destination
              </label>
              <div className="relative">
                <input 
                  className={`w-full p-2 rounded border bg-background ${
                    destVerification ? (destVerification.isValid ? 'border-green-500' : 'border-amber-500') : ''
                  }`}
                  value={editingBooking.destination}
                  onChange={(e) => onChange({...editingBooking, destination: e.target.value})}
                  onBlur={() => verifyAddress(editingBooking.destination, 'destination')}
                  placeholder="Full address (e.g., 456 Oak Ave, Denver, CO 80203)"
                  required
                />
                {isVerifyingDest && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                {!isVerifyingDest && destVerification?.isValid && <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
              </div>
              {destVerification && !destVerification.isValid && destVerification.errors.length > 0 && (
                <div className="text-xs space-y-1">
                  {destVerification.errors.map((err, i) => (
                    <p key={i} className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      [{err.code}] {err.message}
                    </p>
                  ))}
                  {destVerification.formattedAddress && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300 text-xs font-medium mb-1">Suggested correction:</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-auto py-2 px-3 text-left justify-start border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        onClick={() => handleUseSuggested('destination')}
                      >
                        <Check className="w-3 h-3 mr-2 flex-shrink-0 text-green-500" />
                        <span className="truncate">{destVerification.formattedAddress}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requested Time</label>
              <input 
                type="datetime-local"
                className="w-full p-2 rounded border bg-background"
                value={editingBooking.requestedTime?.slice(0, 16) || ''}
                onChange={(e) => onChange({...editingBooking, requestedTime: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                User Notes
                {isMoreInfoNeeded && <span className="text-blue-600 ml-1">(Please provide requested information)</span>}
              </label>
              <textarea 
                className={`w-full p-2 rounded border bg-background text-sm ${
                  isMoreInfoNeeded ? 'border-blue-500/50 focus:border-blue-500' : ''
                }`}
                rows={4}
                value={editingBooking.userNotes || ''}
                onChange={(e) => onChange({...editingBooking, userNotes: e.target.value})}
                placeholder={isMoreInfoNeeded ? "Please provide the information requested by staff..." : "Add any notes or special requirements..."}
              />
            </div>
          </CardContent>
          <div className="flex justify-between items-center gap-3 p-6 pt-0">
            {!hasChanges && (
              <p className="text-xs text-muted-foreground italic">Make changes to enable save</p>
            )}
            <div className="flex gap-3 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={isSubmittingEdit || !hasChanges}
                className={!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isSubmittingEdit ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
