"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Calendar, Clock, Users, Video, Search, Loader2, Star, Filter, CircleCheck, DollarSign, MessageSquare, Briefcase, PenTool, Home, Heart, Target, BookOpen, GraduationCap, User, Radio, UserPlus, Play} from "lucide-react";

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
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkshopCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  skills: string[] | string | null;
  programType: string;
  sortOrder: number;
  isActive: boolean | number;
  createdAt: string;
  updatedAt: string;
  upcomingDate?: string;
  maxParticipants?: number | null;
  currentParticipants?: number;
}

interface BibleStudy {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  targetAudience: string | null;
  programType: string;
  isRecurring: boolean | number;
  isActive: boolean | number;
  createdAt: string;
  updatedAt: string;
  upcomingDate?: string;
}

// Unified item type for display
type UnifiedItem = {
  id: string;
  type: "workshop" | "equip" | "awaken";
  title: string;
  description: string;
  category?: string;
  status?: "scheduled" | "live" | "completed" | "cancelled" | "recurring";
  upcomingDate?: string | null;
  data: Workshop | WorkshopCategory | BibleStudy;
};

// Icon mapping for workshop categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  MessageSquare,
  Briefcase,
  PenTool,
  Home,
  Heart,
  Target,
  Users,
  BookOpen,
  GraduationCap,
};

// Helper function to check if an AWAKEN session is currently live
function isAwakenSessionLive(study: BibleStudy): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if today matches the study day
  if (currentDay !== study.dayOfWeek.toLowerCase()) {
    return false;
  }
  
  // Parse study times
  const [startHour, startMinute] = study.startTime.split(':').map(Number);
  const [endHour, endMinute] = study.endTime.split(':').map(Number);
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
}

export default function WorkshopsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workshopCategories, setWorkshopCategories] = useState<WorkshopCategory[]>([]);
  const [bibleStudies, setBibleStudies] = useState<BibleStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to keep session status accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Poll for live participant count updates every 10 seconds
  useEffect(() => {
    if (isLoading) return; // Don't poll while initially loading

    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch updated data for all types to get live participant counts
        const [workshopsRes, categoriesRes] = await Promise.all([
          fetch("/api/workshops?limit=50", { headers }),
          fetch("/api/equip-categories?isActive=true", { headers }),
        ]);
        
        if (workshopsRes.ok) {
          const updatedWorkshops = await workshopsRes.json();
          setWorkshops(updatedWorkshops);
        }

        if (categoriesRes.ok) {
          const updatedCategories = await categoriesRes.json();
          setWorkshopCategories(updatedCategories);
        }
        
        console.log("Live participant counts updated");
      } catch (error) {
        console.error("Error polling participant counts:", error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isLoading]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch all data in parallel
      const [workshopsRes, categoriesRes, studiesRes] = await Promise.all([
        fetch("/api/workshops?limit=50", { headers }),
        fetch("/api/equip-categories?isActive=true", { headers }),
        fetch("/api/awaken-studies?isActive=true", { headers }),
      ]);

      if (workshopsRes.ok) {
        const data = await workshopsRes.json();
        setWorkshops(data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setWorkshopCategories(data);
      }

      if (studiesRes.ok) {
        const data = await studiesRes.json();
        setBibleStudies(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading content");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle EQUIP registration
  const handleEquipRegister = (category: WorkshopCategory) => {
    if (!session) {
      toast.error("Please sign in to register for UCON EQUIP courses");
      router.push(`/login?redirect=${encodeURIComponent('/workshops')}`);
      return;
    }
    
    // Check capacity
    const maxParticipants = category.maxParticipants || 30;
    const currentParticipants = category.currentParticipants || 0;
    
    if (currentParticipants >= maxParticipants) {
      toast.error("This course is currently full. Please check back later.");
      return;
    }
    
    // TODO: Implement actual registration API call
    toast.success(`Registration request submitted for ${category.name}`);
  };

  // Handle AWAKEN guest join
  const handleAwakenJoin = (study: BibleStudy) => {
    const isLive = isAwakenSessionLive(study);
    
    if (!isLive) {
      toast.info(`This session runs on ${study.dayOfWeek}s from ${formatStudyTime(study.startTime)} to ${formatStudyTime(study.endTime)}`);
      return;
    }
    
    // Generate guest session token for non-authenticated users
    if (!session) {
      const guestToken = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('awaken_guest_token', guestToken);
      toast.success("Welcome! You've been assigned a guest session.");
    }
    
    // TODO: Navigate to actual session room
    toast.success(`Joining ${study.title}...`);
  };

  // Combine all items into unified list
  const unifiedItems: UnifiedItem[] = [
    ...workshops.map((w) => ({
      id: `workshop-${w.id}`,
      type: "workshop" as const,
      title: w.title,
      description: w.description,
      category: w.category,
      status: w.status,
      upcomingDate: w.startTime,
      data: w,
    })),
    ...workshopCategories.map((c) => ({
      id: `equip-${c.id}`,
      type: "equip" as const,
      title: c.name,
      description: c.description || "",
      category: "UCON EQUIP",
      status: "recurring" as const,
      upcomingDate: c.upcomingDate,
      data: c,
    })),
    ...bibleStudies.map((s) => ({
      id: `awaken-${s.id}`,
      type: "awaken" as const,
      title: s.title,
      description: s.description,
      category: "UCON AWAKEN",
      status: "recurring" as const,
      upcomingDate: s.upcomingDate,
      data: s,
    })),
  ];

  // Helper function to check if date is within next 24 hours
  const isWithin24Hours = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return date >= now && date <= in24Hours;
  };

  // Filter items based on search, category, and tab
  const filteredItems = unifiedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      item.category === selectedCategory ||
      (selectedCategory === "equip" && item.type === "equip") ||
      (selectedCategory === "awaken" && item.type === "awaken");

    // Filter by status tab
    let matchesTab = true;
    if (activeTab === "live") {
      matchesTab = item.status === "live";
    } else if (activeTab === "upcoming") {
      if (item.type === "workshop") {
        const workshop = item.data as Workshop;
        matchesTab = workshop.status === "scheduled" && isWithin24Hours(workshop.startTime);
      } else {
        matchesTab = isWithin24Hours(item.upcomingDate);
      }
    } else if (activeTab === "completed") {
      matchesTab = item.status === "completed";
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Count items by status for tab badges
  const liveCount = unifiedItems.filter((item) => item.status === "live").length;
  const upcomingCount = unifiedItems.filter((item) => {
    if (item.type === "workshop") {
      const workshop = item.data as Workshop;
      return workshop.status === "scheduled" && isWithin24Hours(workshop.startTime);
    }
    return isWithin24Hours(item.upcomingDate);
  }).length;
  const completedCount = unifiedItems.filter((item) => item.status === "completed").length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
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

  const formatStudyTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
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

  const getCapacityColor = (current: number, max: number | null) => {
    if (!max) return "text-muted-foreground";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const parseSkills = (skills: string[] | string | null): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    try {
      return JSON.parse(skills);
    } catch {
      return [];
    }
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return GraduationCap;
    return iconMap[iconName] || GraduationCap;
  };

  const renderWorkshopCard = (workshop: Workshop) => (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      {workshop.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={workshop.imageUrl}
            alt={workshop.title}
            className="w-full h-full object-cover"
          />
          {workshop.isFeatured && (
            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <div className="absolute top-3 left-3">{getStatusBadge(workshop.status)}</div>
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{workshop.title}</CardTitle>
        {workshop.category && (
          <Badge variant="outline" className="w-fit">
            {workshop.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{workshop.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(workshop.startTime)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(workshop.startTime)} - {formatTime(workshop.endTime)}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className={getCapacityColor(workshop.currentParticipants, workshop.maxParticipants)}>
              {workshop.currentParticipants}
              {workshop.maxParticipants && ` / ${workshop.maxParticipants}`}
              {" participants"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/workshops/${workshop.id}`} className="w-full">
          <Button className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90">
            {workshop.status === "live" ? (
              <>
                <Video className="w-4 h-4 mr-2" />
                Join Live
              </>
            ) : workshop.status === "scheduled" ? (
              "View Details"
            ) : (
              "View Recording"
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  const renderEquipCard = (category: WorkshopCategory) => {
    const IconComponent = getIconComponent(category.icon);
    const skills = parseSkills(category.skills);
    const maxParticipants = category.maxParticipants || 30;
    const currentParticipants = category.currentParticipants || 0;
    const capacityPercentage = (currentParticipants / maxParticipants) * 100;
    const seatsLeft = maxParticipants - currentParticipants;
    const isFull = seatsLeft <= 0;

    return (
      <Card className="flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-secondary-foreground" />
            </div>
            <Badge className="bg-secondary text-secondary-foreground">UCON EQUIP</Badge>
          </div>
          <CardTitle className="line-clamp-2 mt-3">{category.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {category.description && (
            <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
          )}
          {skills.length > 0 && (
            <ul className="space-y-2 text-sm mb-4">
              {skills.slice(0, 3).map((skill, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CircleCheck className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>{skill}</span>
                </li>
              ))}
              {skills.length > 3 && (
                <li className="text-muted-foreground text-xs">+{skills.length - 3} more skills</li>
              )}
            </ul>
          )}
          
          {/* Participant count and capacity progress */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Participants</span>
              </div>
              <span className={`font-medium ${isFull ? 'text-red-500' : capacityPercentage >= 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                {currentParticipants} / {maxParticipants}
              </span>
            </div>
            <Progress 
              value={capacityPercentage} 
              className="h-2"
            />
            <p className={`text-xs text-center ${isFull ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {isFull ? 'Course Full - Join Waitlist' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full ${isFull ? 'bg-muted hover:bg-muted/90' : 'bg-secondary hover:bg-secondary/90'}`}
            onClick={() => handleEquipRegister(category)}
            disabled={isFull}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isFull ? 'Join Waitlist' : 'Register (RSVP Required)'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderAwakenCard = (study: BibleStudy) => {
    const isLive = isAwakenSessionLive(study);
    
    return (
      <Card className="flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  LIVE NOW
                </Badge>
              )}
              <Badge className="bg-primary text-primary-foreground">UCON AWAKEN</Badge>
            </div>
          </div>
          <CardTitle className="line-clamp-2 mt-3">{study.title}</CardTitle>
          {study.subtitle && <CardDescription>{study.subtitle}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{study.description}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="capitalize">{study.dayOfWeek}s</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                {formatStudyTime(study.startTime)} - {formatStudyTime(study.endTime)}
              </span>
            </div>
            {study.targetAudience && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{study.targetAudience}</span>
              </div>
            )}
          </div>
          
          {/* Guest-friendly notice */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground">All are welcome!</span>
              {" "}No registration required. Join as a guest during session time.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full ${isLive ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
            onClick={() => handleAwakenJoin(study)}
            disabled={!isLive}
          >
            {isLive ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Join Session Now
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Session Not Active
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderItem = (item: UnifiedItem) => {
    switch (item.type) {
      case "workshop":
        return renderWorkshopCard(item.data as Workshop);
      case "equip":
        return renderEquipCard(item.data as WorkshopCategory);
      case "awaken":
        return renderAwakenCard(item.data as BibleStudy);
      default:
        return null;
    }
  };

  // Get unique categories for filter
  const categories = Array.from(
    new Set([
      ...workshops.map((w) => w.category).filter(Boolean),
      "UCON EQUIP",
      "UCON AWAKEN",
    ])
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="inline-flex items-center gap-2 bg-secondary mb-4">
            <GraduationCap className="w-4 h-4" />
            UCON VIRTUAL HUB
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Virtual Hub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our interactive workshops and Bible studies. Connect with others on the journey of transformation.
            Learn from experienced facilitators and build community from anywhere.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search workshops, courses, and studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="equip">UCON EQUIP</SelectItem>
                <SelectItem value="awaken">UCON AWAKEN</SelectItem>
                {categories
                  .filter((c) => c !== "UCON EQUIP" && c !== "UCON AWAKEN")
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs - Live Now, Upcoming, Completed, All */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {unifiedItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="w-3 h-3" />
              Live Now
              {liveCount > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0 animate-pulse">
                  {liveCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              Upcoming
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {upcomingCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {completedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground">
              {activeTab === "live"
                ? "No live sessions at the moment. Check back soon!"
                : activeTab === "completed"
                ? "No completed sessions yet."
                : searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Check back soon for new content"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={item.id}>{renderItem(item)}</div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!sessionLoading && !session && (
          <div className="mt-16 text-center p-8 bg-muted rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h3>
            <p className="text-muted-foreground mb-6">
              Create an account to register for UCON EQUIP courses. UCON AWAKEN sessions are open to all - join anytime as a guest!
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/register">Create Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}