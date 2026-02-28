"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  id: number;
  workshopId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  capacity: number | null;
  bookedCount: number;
  createdAt: string;
}

interface WorkshopCalendarProps {
  workshopId?: number;
  onSlotSelect?: (slot: TimeSlot) => void;
  isHost?: boolean;
}

export default function WorkshopCalendar({ workshopId, onSlotSelect, isHost = false }: WorkshopCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty days for alignment
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Fetch time slots for current month
  useEffect(() => {
    fetchTimeSlots();
  }, [currentDate, workshopId]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      let url = '/api/workshops/time-slots?available=true';
      if (workshopId) {
        url = `/api/workshops/${workshopId}/time-slots`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const slots = await response.json();
        // Filter slots for current month
        const filteredSlots = slots.filter((slot: TimeSlot) => {
          return slot.date.startsWith(`${year}-${month}`);
        });
        setTimeSlots(filteredSlots);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return timeSlots.filter(slot => slot.date === dateStr);
  };

  // Check if date has available slots
  const hasAvailableSlots = (date: Date) => {
    const slots = getSlotsForDate(date);
    return slots.some(slot => 
      slot.isAvailable && 
      (slot.capacity === null || slot.bookedCount < slot.capacity)
    );
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedSlots = selectedDate ? timeSlots.filter(slot => slot.date === selectedDate) : [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {monthYear}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Select a date to view available time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-sm py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                
                const dateStr = formatDate(day);
                const isToday = dateStr === formatDate(new Date());
                const isSelected = dateStr === selectedDate;
                const hasSlots = hasAvailableSlots(day);
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => !isPast && handleDateClick(day)}
                    disabled={isPast}
                    className={`
                      aspect-square p-2 rounded-lg border-2 transition-all
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent'}
                      ${isToday ? 'bg-accent' : ''}
                      ${hasSlots ? 'hover:border-primary cursor-pointer' : ''}
                      ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
                      ${!hasSlots && !isPast ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                        {day.getDate()}
                      </span>
                      {hasSlots && (
                        <div className="w-1 h-1 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time slots for selected date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Available Times
          </CardTitle>
          <CardDescription>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Select a date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a date to view available time slots
            </p>
          ) : selectedSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No time slots available for this date
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSlots.map(slot => {
                const isAvailable = slot.isAvailable && 
                  (slot.capacity === null || slot.bookedCount < slot.capacity);
                const spotsLeft = slot.capacity !== null ? slot.capacity - slot.bookedCount : null;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => isAvailable && onSlotSelect?.(slot)}
                    disabled={!isAvailable}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-left
                      ${isAvailable ? 'hover:border-primary cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        {spotsLeft !== null && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{spotsLeft} spots left</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={isAvailable ? "default" : "secondary"}>
                        {isAvailable ? 'Available' : 'Full'}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
