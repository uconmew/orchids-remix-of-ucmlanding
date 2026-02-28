"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  MoreVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  UserCog,
  Shield,
  User,
  Ban,
  MessageSquare,
  HandIcon,
  Sparkles,
} from 'lucide-react';
import { WorkshopParticipant, WorkshopRole } from '@/types/workshop';
import { getWorkshopPermissions, getRoleDisplayName, getRoleBadgeColor, canChangeParticipantRole } from '@/lib/workshop-permissions';

interface ParticipantsPanelProps {
  workshopId: string;
  currentUserId: string;
  currentUserRole: WorkshopRole;
  participants: WorkshopParticipant[];
  onRefresh: () => void;
}

export function ParticipantsPanel({
  workshopId,
  currentUserId,
  currentUserRole,
  participants,
  onRefresh,
}: ParticipantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const permissions = getWorkshopPermissions(currentUserRole);
  
  // Filter participants by search
  const filteredParticipants = participants.filter((p) =>
    p.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort: host first, then by role hierarchy, then alphabetically
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    
    const roleOrder: Record<WorkshopRole, number> = {
      host: 1,
      'co-host': 2,
      facilitator: 3,
      moderator: 4,
      presenter: 5,
      participant: 6,
    };
    
    const aOrder = roleOrder[a.role] || 999;
    const bOrder = roleOrder[b.role] || 999;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.userName.localeCompare(b.userName);
  });
  
  const handleMuteParticipant = async (participantId: number, mute: boolean) => {
    if (!permissions.canMuteParticipants) {
      console.error('You do not have permission to mute participants');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(
        `/api/workshops/${workshopId}/participants/${participantId}/mute`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mute }),
        }
      );
      
      if (response.ok) {
        console.log(mute ? 'Participant muted' : 'Participant unmuted');
        onRefresh();
      } else {
        const error = await response.json();
        console.error(error.error || 'Failed to update participant');
      }
    } catch (error) {
      console.error('Error muting participant:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveParticipant = async (participantId: number) => {
    if (!permissions.canRemoveParticipants) {
      console.error('You do not have permission to remove participants');
      return;
    }
    
    if (!confirm('Are you sure you want to remove this participant?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(
        `/api/workshops/${workshopId}/participants/${participantId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        console.log('Participant removed');
        onRefresh();
      } else {
        const error = await response.json();
        console.error(error.error || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeRole = async (participantId: number, currentRole: WorkshopRole, newRole: WorkshopRole) => {
    if (!permissions.canAssignRoles) {
      console.error('You do not have permission to change roles');
      return;
    }
    
    if (!canChangeParticipantRole(currentUserRole, currentRole, newRole)) {
      console.error('You cannot assign this role');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(
        `/api/workshops/${workshopId}/participants/${participantId}/role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      
      if (response.ok) {
        console.log(`Role changed to ${getRoleDisplayName(newRole)}`);
        onRefresh();
      } else {
        const error = await response.json();
        console.error(error.error || 'Failed to change role');
      }
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getRoleIcon = (role: WorkshopRole) => {
    switch (role) {
      case 'host':
        return <Crown className="w-3 h-3" />;
      case 'co-host':
        return <Shield className="w-3 h-3" />;
      case 'facilitator':
        return <UserCog className="w-3 h-3" />;
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      case 'presenter':
        return <Sparkles className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };
  
  const activeCount = participants.filter(p => p.status === 'active').length;
  const waitingCount = participants.filter(p => p.status === 'waiting').length;
  
  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participants ({activeCount})
          </CardTitle>
          {waitingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {waitingCount} waiting
            </Badge>
          )}
        </div>
        
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-1 pb-4">
            {sortedParticipants.map((participant) => {
              const isCurrentUser = participant.userId === currentUserId;
              const canManageThisParticipant = 
                !isCurrentUser && 
                permissions.canMuteParticipants;
              
              return (
                <div
                  key={participant.id}
                  className={`group flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors ${
                    isCurrentUser ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-white">
                        {participant.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Name and status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white truncate">
                          {participant.userName}
                          {isCurrentUser && ' (You)'}
                        </span>
                        {participant.hasHandRaised && (
                          <HandIcon className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      
                      {/* Role badge */}
                      <Badge
                        variant="outline"
                        className={`text-xs mt-0.5 ${getRoleBadgeColor(participant.role)} text-white border-0`}
                      >
                        {getRoleIcon(participant.role)}
                        <span className="ml-1">{getRoleDisplayName(participant.role)}</span>
                      </Badge>
                    </div>
                    
                    {/* Media status icons */}
                    <div className="flex items-center gap-1">
                      {participant.isMuted ? (
                        <MicOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Mic className="w-4 h-4 text-green-500" />
                      )}
                      
                      {participant.isVideoOff ? (
                        <VideoOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Video className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Actions menu */}
                  {canManageThisParticipant && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage Participant</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {permissions.canMuteParticipants && (
                          <DropdownMenuItem
                            onClick={() => handleMuteParticipant(participant.id, !participant.isMuted)}
                            disabled={loading}
                          >
                            {participant.isMuted ? (
                              <>
                                <Mic className="w-4 h-4 mr-2" />
                                Unmute
                              </>
                            ) : (
                              <>
                                <MicOff className="w-4 h-4 mr-2" />
                                Mute
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        
                        {permissions.canAssignRoles && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs">Change Role</DropdownMenuLabel>
                            
                            {(['co-host', 'facilitator', 'moderator', 'presenter', 'participant'] as WorkshopRole[]).map((role) => {
                              if (!canChangeParticipantRole(currentUserRole, participant.role, role)) {
                                return null;
                              }
                              
                              return (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => handleChangeRole(participant.id, participant.role, role)}
                                  disabled={loading || participant.role === role}
                                >
                                  {getRoleIcon(role)}
                                  <span className="ml-2">{getRoleDisplayName(role)}</span>
                                </DropdownMenuItem>
                              );
                            })}
                          </>
                        )}
                        
                        {permissions.canRemoveParticipants && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveParticipant(participant.id)}
                              disabled={loading}
                              className="text-red-500"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
            
            {sortedParticipants.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                {searchQuery ? 'No participants found' : 'No participants yet'}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}