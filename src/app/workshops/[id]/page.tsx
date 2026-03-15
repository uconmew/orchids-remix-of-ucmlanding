"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { AuthDialog } from "@/components/workshops/AuthDialog";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Loader2, 
  Star, 
  ArrowLeft,
  UserCheck,
  CircleCheck,
  XCircle
} from "lucide-react";

interface Workshop {
  id: number;
  title: string;
  description: string;
  hostUserId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants: number | null;
  currentParticipants: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  meetingRoomId: string;
  category: string;
  programType?: "equip" | "awaken";
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  notes: string | null;
  registeredAt: string;
  attendedAt: string | null;
}

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notes, setNotes] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Check if user is a guest
  const isGuest = () => {
    const guestUser = localStorage.getItem("guest_user");
    return !!guestUser;
  };

  const getGuestName = () => {
    const guestUser = localStorage.getItem("guest_user");
    if (guestUser) {
      const guest = JSON.parse(guestUser);
      return guest.name;
    }
    return null;
  };

  useEffect(() => {
    if (workshopId) {
      fetchWorkshop();
    }
  }, [workshopId]);

  useEffect(() => {
    if (session?.user && workshopId) {
      checkRegistration();
    } else if (isGuest()) {
      // Guests are only auto-marked as registered for Awaken (Bible/Ministerial) sessions
      if (isAwaken()) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
      setCheckingRegistration(false);
    } else {
      setCheckingRegistration(false);
    }
  }, [session, workshopId, workshop]);

  const fetchWorkshop = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workshops?id=${workshopId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkshop(data);
      } else {
        toast.error("Failed to load workshop");
        router.push("/workshops");
      }
    } catch (error) {
      console.error("Error fetching workshop:", error);
      toast.error("Error loading workshop");
      router.push("/workshops");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      setCheckingRegistration(true);
      const response = await fetch(
        `/api/workshops/registrations/my?userId=${session?.user.id}&includeWorkshop=false`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        const registrations: Registration[] = await response.json();
        const registered = registrations.some(
          (reg) => reg.workshopId === parseInt(workshopId) && reg.status === "registered"
        );
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  // Determine if this session should be treated as Awaken (Bible/Ministerial studies)
  const isAwaken = () => {
    const type = workshop?.programType;
    if (type === "awaken") return true;
    const cat = (workshop?.category || "").toLowerCase();
    const title = (workshop?.title || "").toLowerCase();
    return cat.includes("bible") ||
      cat.includes("ministerial") ||
      title.includes("bible") ||
      title.includes("ministerial");
  };

  const handleRegister = async () => {
    // Awaken: allow guests; Equip: guests not allowed
    if (isAwaken()) {
      if (!session && !isGuest()) {
        // Prompt for guest name
        setShowAuthDialog(true);
        return;
      }
      if (isGuest()) {
        setIsRegistered(true);
        toast.success(`Welcome, ${getGuestName()}! You can now join the ${getProgramName()} session.`);
        return;
      }
    } else {
      // Equip: require authenticated account (no guests)
      if (isGuest()) {
        toast.error("Guests cannot join Equip workshops. Please sign in or create a free account.");
        setShowAuthDialog(true);
        return;
      }
      if (!session) {
        setShowAuthDialog(true);
        return;
      }
    }

    try {
      setRegistering(true);
      const response = await fetch(`/api/workshops/${workshopId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          userId: session!.user.id,
          userName: session!.user.name,
          userEmail: session!.user.email,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully registered for workshop!");
        setIsRegistered(true);
        setNotes("");
        fetchWorkshop();
      } else {
        if (data.code === "ALREADY_REGISTERED") {
          toast.error("You are already registered for this workshop");
          setIsRegistered(true);
        } else if (data.code === "WORKSHOP_FULL") {
          toast.error("This workshop is at full capacity");
        } else {
          toast.error(data.error || "Failed to register for workshop");
        }
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Error registering for workshop");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    // Guests can just clear their local storage
    if (isGuest()) {
      localStorage.removeItem("guest_user");
      setIsRegistered(false);
      toast.success("Guest access removed");
      return;
    }

    if (!session) return;

    try {
      setCancelling(true);
      const response = await fetch(
        `/api/workshops/${workshopId}/register?userId=${session.user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Registration cancelled");
        setIsRegistered(false);
        fetchWorkshop();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to cancel registration");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Error cancelling registration");
    } finally {
      setCancelling(false);
    }
  };

  const handleJoinLive = () => {
    // For awaken workshops, allow anyone to join (create auto-guest if needed)
    if (isAwaken()) {
      if (!session && !isGuest()) {
        // Create auto-guest for awaken workshops
        const autoGuestName = `Guest${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem("guest_user", JSON.stringify({
          name: autoGuestName,
          isGuest: true,
          joinedAt: new Date().toISOString()
        }));
        toast.success(`Joining as ${autoGuestName}`);
      }
      router.push(`/workshops/${workshopId}/live`);
      return;
    }

    // For equip workshops, require authentication and registration (no guests)
    if (session && isRegistered) {
      router.push(`/workshops/${workshopId}/live`);
      return;
    }

    if (!session) {
      // Show auth dialog
      setShowAuthDialog(true);
      return;
    }

    if (!isRegistered) {
      toast.error("You must register before joining this Equip workshop");
      return;
    }

    router.push(`/workshops/${workshopId}/live`);
  };

  const handleAuthSuccess = () => {
    // Close dialog and refresh
    setShowAuthDialog(false);
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 text-white animate-pulse">LIVE NOW</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500 text-white">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getProgramName = () => {
    return isAwaken() ? "Awaken" : "Equip";
  };

  const canRegister = () => {
    if (!workshop) return false;
    if (workshop.status !== "scheduled" && workshop.status !== "live") return false;
    if (workshop.maxParticipants && workshop.currentParticipants >= workshop.maxParticipants) {
      return false;
    }
    return true;
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Workshop Not Found</h2>
          <Button asChild>
            <Link href="/workshops">Back to Workshops</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/workshops">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {getProgramName()} Sessions
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workshop Image */}
            {workshop.imageUrl && (
              <div className="relative h-96 w-full overflow-hidden rounded-lg">
                <img
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
                {workshop.isFeatured && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                    <Star className="w-4 h-4 mr-1" />
                    Featured
                  </Badge>
                )}
                <div className="absolute top-4 left-4">
                  {getStatusBadge(workshop.status)}
                </div>
              </div>
            )}

            {/* Workshop Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{workshop.title}</CardTitle>
                    {workshop.category && (
                      <Badge variant="outline" className="w-fit">
                        {workshop.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date & Time Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workshop.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(workshop.startTime)} - {formatTime(workshop.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({workshop.durationMinutes} minutes)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {workshop.currentParticipants}
                        {workshop.maxParticipants && ` / ${workshop.maxParticipants}`}
                        {" registered"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Video className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Format</p>
                      <p className="text-sm text-muted-foreground">Virtual (Online)</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">About This {getProgramName()} Session</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                    {workshop.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{getProgramName()} Access</CardTitle>
                <CardDescription>
                  {workshop.status === "live"
                    ? isAwaken() 
                      ? "This Awaken session is live now - join anytime!"
                      : "This Equip session is currently in progress"
                    : workshop.status === "completed"
                    ? `This ${getProgramName()} session has ended`
                    : workshop.status === "cancelled"
                    ? `This ${getProgramName()} session has been cancelled`
                    : isAwaken()
                    ? "Open to all - no registration required!"
                    : "Equip workshops require a free account to join"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkingRegistration ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CircleCheck className="w-5 h-5" />
                      <span className="font-semibold">
                        {isGuest() ? `Joining as ${getGuestName()}` : "You're registered!"}
                      </span>
                    </div>
                    
                    {workshop.status === "live" && (
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        onClick={handleJoinLive}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join {getProgramName()} Now
                      </Button>
                    )}

                    {workshop.status === "scheduled" && (
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>{getProgramName()} starts on {formatDate(workshop.startTime)} at {formatTime(workshop.startTime)}</p>
                        <p className="text-xs">The join button will appear when the session goes live.</p>
                      </div>
                    )}

                    {(workshop.status === "scheduled" || workshop.status === "live") && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={handleCancelRegistration}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            {isGuest() ? "Remove Guest Access" : "Cancel Registration"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : canRegister() ? (
                  <div className="space-y-4">
                    {session && !isAwaken() && (
                      <div>
                        <Label htmlFor="notes">Notes or Questions (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any questions or special needs?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                    )}

                    {!session && !isGuest() && (
                      <div className="bg-muted/50 p-4 rounded-lg border border-border mb-4">
                        {isAwaken() ? (
                          <>
                            <p className="text-sm text-center text-muted-foreground mb-3">
                              This Awaken session is open to everyone!
                            </p>
                            <p className="text-xs text-center text-muted-foreground">
                              Click below to join - you can sign in later for additional features
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-center text-muted-foreground mb-3">
                              Equip workshops require a free account.
                            </p>
                            <p className="text-xs text-center text-muted-foreground">
                              Please sign in or create an account to join.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : session ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Join {getProgramName()}
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Join {getProgramName()}
                        </>
                      )}
                    </Button>

                    {workshop.maxParticipants && (
                      <p className="text-xs text-center text-muted-foreground">
                        {workshop.maxParticipants - workshop.currentParticipants} spots remaining
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <XCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-semibold mb-1">Registration Closed</p>
                    <p className="text-sm text-muted-foreground">
                      {workshop.maxParticipants && workshop.currentParticipants >= workshop.maxParticipants
                        ? `This ${getProgramName()} session is at full capacity`
                        : "Registration is no longer available"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectPath={`/workshops/${workshopId}`}
        onSuccess={handleAuthSuccess}
        allowGuest={isAwaken()}
      />

      <Footer />
    </div>
  );
}