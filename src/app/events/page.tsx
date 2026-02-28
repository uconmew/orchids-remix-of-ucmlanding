"use client"

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Users, CalendarDays, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, RefreshCw, Loader2, Check, X, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  maxAttendees: number | null;
  requiresAuth: boolean;
  imageUrl: string | null;
  createdAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: string;
  imageUrl: string;
}

const defaultFormData: EventFormData = {
  title: "",
  description: "",
  eventType: "workshop",
  startDate: "",
  endDate: "",
  location: "",
  maxAttendees: "",
  imageUrl: "",
};

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function ContentCalendarPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(true);
  const [permissions, setPermissions] = useState<Permissions>({ canCreate: false, canEdit: false, canDelete: false });
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const eventTypes = [
    { value: "all", label: "All Events", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    { value: "workshop", label: "Workshops", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { value: "service", label: "Services", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    { value: "outreach", label: "Outreach", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { value: "meeting", label: "Meetings", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  ];

  const fetchEvents = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (selectedType !== "all") {
        params.append("event_type", selectedType);
      }
      
      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      if (showLoading) {
        toast.error("Failed to load events");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [selectedType]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [selectedType, fetchEvents]);

  // Live polling for real-time updates
  useEffect(() => {
    if (!isPolling) return;
    
    const pollInterval = setInterval(() => {
      fetchEvents(false);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, fetchEvents]);

  // Check user permissions when session loads
  useEffect(() => {
    const checkPermissions = async () => {
      if (sessionLoading) return;
      
      if (!session?.user?.id) {
        setPermissions({ canCreate: false, canEdit: false, canDelete: false });
        setPermissionsLoading(false);
        return;
      }

      try {
        const checkPerm = async (action: string) => {
          const res = await fetch('/api/role-permissions/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              resource: 'events',
              action
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data.hasPermission === true;
          }
          return false;
        };

        const [canCreate, canEdit, canDelete] = await Promise.all([
          checkPerm('create'),
          checkPerm('update'),
          checkPerm('delete')
        ]);

        setPermissions({ canCreate, canEdit, canDelete });
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissions({ canCreate: false, canEdit: false, canDelete: false });
      } finally {
        setPermissionsLoading(false);
      }
    };

    checkPermissions();
  }, [session, sessionLoading]);

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setEventDetailOpen(true);
    } else if (dayEvents.length > 1) {
      setSelectedEvent(dayEvents[0]);
      setEventDetailOpen(true);
    } else if (permissions.canCreate) {
      // Only open create dialog if user has permission
      const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 10, 0);
      setEditingEvent(null);
      setFormData({
        ...defaultFormData,
        startDate: clickedDate.toISOString().slice(0, 16),
      });
      setCreateEditOpen(true);
    }
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    const now = new Date();
    now.setHours(10, 0, 0, 0);
    setFormData({
      ...defaultFormData,
      startDate: now.toISOString().slice(0, 16),
    });
    setCreateEditOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate ? event.endDate.slice(0, 16) : "",
      location: event.location || "",
      maxAttendees: event.maxAttendees ? String(event.maxAttendees) : "",
      imageUrl: event.imageUrl || "",
    });
    setEventDetailOpen(false);
    setCreateEditOpen(true);
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Event deleted successfully");
        setEventDetailOpen(false);
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.startDate) {
      toast.error("Start date is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        location: formData.location.trim() || null,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        imageUrl: formData.imageUrl.trim() || null,
      };

      let response;
      if (editingEvent) {
        response = await fetch(`/api/events?id=${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast.success(editingEvent ? "Event updated!" : "Event created!");
        setCreateEditOpen(false);
        setFormData(defaultFormData);
        setEditingEvent(null);
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const typeObj = eventTypes.find(t => t.value === type);
    return typeObj?.color || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="mb-4 bg-[#A92FFA]">Content Calendar</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                Events & Schedule
              </h1>
              <p className="text-lg text-muted-foreground">
                Interactive calendar for all ministry events. Click any day to create or view events.
              </p>
            </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {permissions.canCreate && (
                  <Button onClick={handleCreateNew} className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Event
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => fetchEvents()}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
          </div>
          
          {/* Live indicator and permission status */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>Live updates {isPolling ? 'on' : 'off'}</span>
            <span className="mx-2">•</span>
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsPolling(!isPolling)}
              className="ml-2 h-6 px-2 text-xs"
            >
              {isPolling ? 'Pause' : 'Resume'}
            </Button>
            <span className="mx-2">•</span>
            {permissionsLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking access...
              </span>
            ) : session?.user ? (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                {permissions.canCreate || permissions.canEdit ? 'Editor access' : 'View only'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Sign in to edit
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {eventTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => setSelectedType(type.value)}
                size="sm"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar View */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-2xl">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Click on a day to view events or create new ones. {events.length} total event{events.length !== 1 ? 's' : ''}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A92FFA]" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm py-2 text-muted-foreground">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 1)}</span>
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {getDaysInMonth().map((day, index) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const today = isToday(day || 0);
                    return (
                      <div
                        key={index}
                        className={`min-h-20 sm:min-h-28 p-1 sm:p-2 border rounded-lg transition-all cursor-pointer ${
                          day 
                            ? `bg-background hover:bg-accent hover:border-[#A92FFA]/50 ${today ? 'ring-2 ring-[#A92FFA] ring-offset-2' : ''}`
                            : "bg-muted/30"
                        }`}
                        onClick={() => day && handleDayClick(day)}
                      >
                        {day && (
                          <>
                            <div className={`font-semibold text-sm mb-1 ${today ? 'text-[#A92FFA]' : ''}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.eventType)}`}
                                  title={event.title}
                                >
                                  <span className="hidden sm:inline">{event.title.slice(0, 15)}{event.title.length > 15 ? '...' : ''}</span>
                                  <span className="sm:hidden">{event.title.slice(0, 8)}{event.title.length > 8 ? '...' : ''}</span>
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                              {dayEvents.length === 0 && permissions.canCreate && (
                                  <div className="text-xs text-muted-foreground/50 text-center mt-4 hidden sm:block">
                                    <Plus className="w-3 h-3 inline" />
                                  </div>
                                )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          
            {events.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {permissions.canCreate ? 'Get started by creating your first event' : 'Check back soon for upcoming events'}
                  </p>
                  {permissions.canCreate && (
                    <Button onClick={handleCreateNew} className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
            <div className="grid gap-4">
              {events.slice(0, 10).map((event) => (
                <Card 
                  key={event.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventDetailOpen(true);
                  }}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`w-3 h-16 rounded-full ${getEventTypeColor(event.eventType).split(' ')[0]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(event.startDate)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    {permissions.canEdit && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(event);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Detail Dialog */}
      <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={getEventTypeColor(selectedEvent?.eventType || "")}>
                    {selectedEvent?.eventType}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedEvent.description}</p>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedEvent.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(selectedEvent.startDate)}
                      {selectedEvent.endDate && ` - ${formatTime(selectedEvent.endDate)}`}
                    </p>
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
                
                {selectedEvent.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Capacity</p>
                      <p className="text-sm text-muted-foreground">Maximum {selectedEvent.maxAttendees} attendees</p>
                    </div>
                  </div>
                )}
              </div>
              
                {(permissions.canEdit || permissions.canDelete) ? (
                  <div className="flex gap-3 pt-4 border-t">
                    {permissions.canEdit && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleEdit(selectedEvent)} 
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {permissions.canDelete && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(selectedEvent)}
                        disabled={deleting}
                        className="flex-1"
                      >
                        {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Sign in with appropriate permissions to edit or delete events</span>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={createEditOpen} onOpenChange={setCreateEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update the event details below." : "Fill in the details to create a new event."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="outreach">Outreach</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date/Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date/Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., UCon Ministries Center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingEvent ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
