"use client";

import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Pin,
  MoreVertical,
  User,
  Crown,
  Shield,
  Sparkles,
  MonitorUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Participant {
  id: number;
  userId: string;
  userName: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  role: 'host' | 'co-host' | 'facilitator' | 'moderator' | 'presenter' | 'participant';
  hasHandRaised?: boolean;
  status: 'active' | 'waiting' | 'left';
}

interface VideoGridProps {
  workshopId: string;
  participants: Participant[];
  currentUserId: string;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  viewLayout: "grid" | "spotlight" | "sidebar";
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoOff: boolean;
  isMuted: boolean;
}

export function VideoGrid({
  workshopId,
  participants,
  currentUserId,
  localStream,
  screenStream,
  isScreenSharing,
  viewLayout,
  localVideoRef,
  isVideoOff,
  isMuted,
}: VideoGridProps) {
  const screenShareRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenStream && screenShareRef.current) {
      screenShareRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-3 h-3" />;
      case 'co-host':
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      case 'presenter':
      case 'facilitator':
        return <Sparkles className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'host':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'co-host':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'facilitator':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'moderator':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'presenter':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const currentParticipant = participants.find(p => p.userId === currentUserId);

  // Screen share takes priority
  if (isScreenSharing && screenStream) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
          <video
            ref={screenShareRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-blue-600 text-white flex items-center gap-2">
              <MonitorUp className="w-3 h-3" />
              Screen Sharing
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <ParticipantThumbnail
            userName="You"
            isCurrentUser={true}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            localVideoRef={localVideoRef}
            role={currentParticipant?.role || 'participant'}
          />

          {participants
            .filter(p => p.userId !== currentUserId)
            .slice(0, 8)
            .map((participant) => (
              <ParticipantThumbnail
                key={participant.id}
                userName={participant.userName}
                isCurrentUser={false}
                isMuted={participant.isMuted}
                isVideoOff={participant.isVideoOff}
                role={participant.role}
                hasHandRaised={participant.hasHandRaised}
              />
            ))}
        </div>
      </div>
    );
  }

  // Spotlight view
  if (viewLayout === "spotlight") {
    const mainParticipant = participants[0] || currentParticipant;
    const isMainCurrentUser = mainParticipant?.userId === currentUserId;

    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
          {isMainCurrentUser ? (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  isVideoOff && "hidden"
                )}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-gray-600" />
                    </div>
                    <p className="text-xl font-medium text-white">You</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-semibold text-white">
                    {mainParticipant?.userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-xl font-medium text-white">{mainParticipant?.userName}</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
              {isMainCurrentUser ? "You" : mainParticipant?.userName}
            </Badge>
            {mainParticipant?.role && mainParticipant.role !== 'participant' && (
              <Badge className={cn("border", getRoleBadgeColor(mainParticipant.role))}>
                {getRoleIcon(mainParticipant.role)}
                <span className="ml-1 capitalize">{mainParticipant.role}</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {!isMainCurrentUser && currentParticipant && (
            <ParticipantThumbnail
              userName="You"
              isCurrentUser={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              localVideoRef={localVideoRef}
              role={currentParticipant.role}
            />
          )}

          {participants
            .filter(p => p.userId !== currentUserId && p.id !== mainParticipant?.id)
            .slice(0, 8)
            .map((participant) => (
              <ParticipantThumbnail
                key={participant.id}
                userName={participant.userName}
                isCurrentUser={false}
                isMuted={participant.isMuted}
                isVideoOff={participant.isVideoOff}
                role={participant.role}
                hasHandRaised={participant.hasHandRaised}
              />
            ))}
        </div>
      </div>
    );
  }

  // Grid view
  const allParticipantsIncludingCurrent = [
    { 
      ...currentParticipant, 
      isCurrentUser: true,
      isMuted,
      isVideoOff,
    },
    ...participants.filter(p => p.userId !== currentUserId),
  ].filter(Boolean);

  const gridCols = getGridColumns(allParticipantsIncludingCurrent.length);

  return (
    <div className={cn(
      "h-full grid gap-3 auto-rows-fr",
      gridCols
    )}>
      {allParticipantsIncludingCurrent.map((participant, index) => {
        if (!participant) return null;
        
        const isCurrentUser = 'isCurrentUser' in participant && participant.isCurrentUser;
        
        return (
          <ParticipantCard
            key={isCurrentUser ? 'current-user' : participant.id}
            participant={participant as Participant}
            isCurrentUser={isCurrentUser}
            localVideoRef={isCurrentUser ? localVideoRef : undefined}
            currentUserMuted={isMuted}
            currentUserVideoOff={isVideoOff}
          />
        );
      })}
    </div>
  );
}

function getGridColumns(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  if (count <= 9) return "grid-cols-3";
  if (count <= 12) return "grid-cols-4";
  return "grid-cols-4";
}

interface ParticipantCardProps {
  participant: Participant;
  isCurrentUser: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  currentUserMuted?: boolean;
  currentUserVideoOff?: boolean;
}

function ParticipantCard({
  participant,
  isCurrentUser,
  localVideoRef,
  currentUserMuted,
  currentUserVideoOff,
}: ParticipantCardProps) {
  const isMuted = isCurrentUser ? currentUserMuted : participant.isMuted;
  const isVideoOff = isCurrentUser ? currentUserVideoOff : participant.isVideoOff;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-3 h-3" />;
      case 'co-host':
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      case 'presenter':
      case 'facilitator':
        return <Sparkles className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'host':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'co-host':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'facilitator':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'moderator':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'presenter':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden group hover:ring-2 hover:ring-[#A92FFA] transition-all">
      {isCurrentUser && localVideoRef ? (
        <>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover",
              isVideoOff && "hidden"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">Camera Off</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-semibold text-white">
                {participant.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            {isVideoOff && <p className="text-sm text-gray-400">Camera Off</p>}
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/60 backdrop-blur-sm hover:bg-black/80"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pin className="w-4 h-4 mr-2" />
              Pin Video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 text-xs truncate max-w-[120px]">
              {isCurrentUser ? "You" : participant.userName}
            </Badge>
            {participant.role && participant.role !== 'participant' && (
              <Badge className={cn("text-xs border", getRoleBadgeColor(participant.role))}>
                {getRoleIcon(participant.role)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isMuted ? (
              <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                <MicOff className="w-3 h-3" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center">
                <Mic className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>

      {participant.hasHandRaised && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-yellow-500 text-black animate-bounce">
            ✋ Hand Raised
          </Badge>
        </div>
      )}
    </div>
  );
}

interface ParticipantThumbnailProps {
  userName: string;
  isCurrentUser: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  role: string;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  hasHandRaised?: boolean;
}

function ParticipantThumbnail({
  userName,
  isCurrentUser,
  isMuted,
  isVideoOff,
  role,
  localVideoRef,
  hasHandRaised,
}: ParticipantThumbnailProps) {
  return (
    <div className="relative w-32 h-24 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#A92FFA] cursor-pointer group">
      {isCurrentUser && localVideoRef ? (
        <>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover",
              isVideoOff && "hidden"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-1 left-1 right-1">
        <Badge className="bg-black/60 backdrop-blur-sm text-white text-xs border-0 truncate">
          {isCurrentUser ? "You" : userName}
        </Badge>
      </div>

      {isMuted && (
        <div className="absolute top-1 right-1">
          <div className="w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-3 h-3" />
          </div>
        </div>
      )}

      {hasHandRaised && (
        <div className="absolute top-1 left-1">
          <Badge className="bg-yellow-500 text-black text-xs p-0.5">✋</Badge>
        </div>
      )}
    </div>
  );
}