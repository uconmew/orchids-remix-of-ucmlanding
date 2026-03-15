"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, DoorOpen, DoorClosed, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface BreakoutRoom {
  id: number;
  workshopId: number;
  roomName: string;
  roomNumber: number;
  maxParticipants: number | null;
  status: string;
  createdAt: string;
  assignments?: Assignment[];
}

interface Assignment {
  id: number;
  breakoutRoomId: number;
  userId: string;
  assignedAt: string;
  leftAt: string | null;
}

interface Participant {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  isHost: boolean;
}

interface BreakoutRoomsProps {
  workshopId: number;
  userId: string;
  isHost: boolean;
  participants: Participant[];
}

export default function BreakoutRooms({ workshopId, userId, isHost, participants }: BreakoutRoomsProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [roomCount, setRoomCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [workshopId]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms?includeAssignments=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        
        // Check if current user is in any room
        const userRoom = data.find((room: BreakoutRoom) => 
          room.assignments?.some(a => a.userId === userId && !a.leftAt)
        );
        setCurrentRoom(userRoom?.id || null);
      }
    } catch (error) {
      console.error('Error fetching breakout rooms:', error);
    }
  };

  const handleCreateRooms = async () => {
    if (roomCount < 2 || roomCount > 20) {
      toast.error('Room count must be between 2 and 20');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostUserId: userId,
          roomCount,
          maxParticipants: 10
        })
      });

      if (response.ok) {
        toast.success(`Created ${roomCount} breakout rooms`);
        await fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create breakout rooms');
      }
    } catch (error) {
      console.error('Error creating breakout rooms:', error);
      toast.error('Failed to create breakout rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (rooms.length === 0) {
      toast.error('Create breakout rooms first');
      return;
    }

    const nonHostParticipants = participants.filter(p => !p.isHost);
    if (nonHostParticipants.length === 0) {
      toast.error('No participants to assign');
      return;
    }

    // Distribute participants evenly across rooms
    const assignments: { userId: string; breakoutRoomId: number }[] = [];
    nonHostParticipants.forEach((participant, index) => {
      const roomIndex = index % rooms.length;
      assignments.push({
        userId: participant.userId,
        breakoutRoomId: rooms[roomIndex].id
      });
    });

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostUserId: userId,
          assignments
        })
      });

      if (response.ok) {
        toast.success('Participants assigned to breakout rooms');
        await fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign participants');
      }
    } catch (error) {
      console.error('Error assigning participants:', error);
      toast.error('Failed to assign participants');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        toast.success('Joined breakout room');
        setCurrentRoom(roomId);
        await fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        toast.success('Left breakout room');
        setCurrentRoom(null);
        await fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to leave room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAllRooms = async () => {
    if (!confirm('Are you sure you want to close all breakout rooms?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/breakout-rooms?hostUserId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('All breakout rooms closed');
        setRooms([]);
        setCurrentRoom(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to close rooms');
      }
    } catch (error) {
      console.error('Error closing rooms:', error);
      toast.error('Failed to close rooms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Breakout Rooms
            </CardTitle>
            <CardDescription>
              {rooms.length > 0 ? `${rooms.length} active rooms` : 'Create breakout rooms for group discussions'}
            </CardDescription>
          </div>
          {isHost && rooms.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleCloseAllRooms} disabled={loading}>
              Close All Rooms
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Host Controls */}
        {isHost && rooms.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                min={2}
                max={20}
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                placeholder="Number of rooms (2-20)"
                className="max-w-xs"
              />
              <Button onClick={handleCreateRooms} disabled={loading}>
                <DoorOpen className="w-4 h-4 mr-2" />
                Create Rooms
              </Button>
            </div>
          </div>
        )}

        {isHost && rooms.length > 0 && (
          <div className="mb-4">
            <Button onClick={handleAutoAssign} disabled={loading} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Auto-Assign Participants
            </Button>
          </div>
        )}

        {/* Rooms Grid */}
        {rooms.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => {
              const activeParticipants = room.assignments?.filter(a => !a.leftAt).length || 0;
              const isInThisRoom = currentRoom === room.id;
              
              return (
                <Card key={room.id} className={isInThisRoom ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.roomName}</CardTitle>
                      <Badge variant={room.status === 'active' ? 'default' : 'secondary'}>
                        {room.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {activeParticipants} {activeParticipants === 1 ? 'participant' : 'participants'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Participants in room */}
                    {room.assignments && room.assignments.filter(a => !a.leftAt).length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Participants:</p>
                        <ul className="space-y-1">
                          {room.assignments
                            .filter(a => !a.leftAt)
                            .map(assignment => {
                              const participant = participants.find(p => p.userId === assignment.userId);
                              return (
                                <li key={assignment.id} className="text-muted-foreground">
                                  • {participant?.userName || assignment.userId}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}

                    {/* Join/Leave button */}
                    {room.status === 'active' && (
                      <Button
                        variant={isInThisRoom ? 'outline' : 'default'}
                        size="sm"
                        className="w-full"
                        onClick={() => isInThisRoom ? handleLeaveRoom(room.id) : handleJoinRoom(room.id)}
                        disabled={loading || (currentRoom !== null && !isInThisRoom)}
                      >
                        {isInThisRoom ? (
                          <>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Leave Room
                          </>
                        ) : (
                          <>
                            <DoorOpen className="w-4 h-4 mr-2" />
                            Join Room
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {rooms.length === 0 && !isHost && (
          <div className="text-center py-8">
            <DoorClosed className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No breakout rooms available yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
