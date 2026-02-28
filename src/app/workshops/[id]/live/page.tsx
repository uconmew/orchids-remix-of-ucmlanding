"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import Peer from "peerjs";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Users, 
  LogOut,
  Loader2,
  Phone,
  Settings,
  MessageSquare,
  MonitorUp,
  Grid3x3,
  Maximize2,
  BarChart3,
  HelpCircle,
  FileText,
  Palette,
  DoorOpen,
  Play,
  Circle,
  MonitorOff,
  PhoneOff,
  MoreVertical,
  ChevronUp,
  Lock,
  Unlock,
  HandIcon,
  X,
  Minimize2,
  Sidebar as SidebarIcon,
  UserCog,
  Bug,
  UserCircle,
  Clock,
  ArrowLeft,
  CircleCheck,
  ExternalLink,
  Copy,
  Home,
  BookOpen
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatPanel } from "@/components/workshops/ChatPanel";
import { ParticipantsPanel } from "@/components/workshops/ParticipantsPanel";
import { PollsPanel } from "@/components/workshops/PollsPanel";
import { QuestionsPanel } from "@/components/workshops/QuestionsPanel";
import { ReactionsPanel } from "@/components/workshops/ReactionsPanel";
import { FilesPanel } from "@/components/workshops/FilesPanel";
import WhiteboardCanvas from "@/components/workshops/WhiteboardCanvas";
import BreakoutRooms from "@/components/workshops/BreakoutRooms";
import VideoPlayer from "@/components/workshops/VideoPlayer";
import RecordingControls from "@/components/workshops/RecordingControls";
import { RoleManagementDialog } from "@/components/workshops/RoleManagementDialog";
import { PermissionDebugger } from "@/components/workshops/PermissionDebugger";
import { PermissionTooltip } from "@/components/workshops/PermissionTooltip";
import { useWorkshopPermissions } from "@/hooks/useWorkshopPermissions";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/workshop-permissions";
import { getRoleConfig } from "@/lib/workshop-roles-config";
import { checkAndNotify } from "@/lib/workshop-permission-helpers";
import type { WorkshopRole } from "@/types/workshop";

interface Workshop {
  id: number;
  title: string;
  description: string;
  hostUserId: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingRoomId: string;
}

interface Participant {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  peerId: string | null;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  role: WorkshopRole;
  hasHandRaised?: boolean;
  status: 'active' | 'waiting' | 'left';
  joinedAt: string;
  leftAt: string | null;
}

interface GuestUser {
  name: string;
  isGuest: boolean;
  joinedAt: string;
  token?: string;
}

// NEW: Remote stream interface
interface RemoteStream {
  userId: string;
  userName: string;
  stream: MediaStream;
  peerId: string;
}

type ViewLayout = "grid" | "spotlight" | "sidebar";
type SidebarView = "participants" | "chat" | "more" | null;

// Format elapsed time helper
const formatElapsedTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export default function LiveWorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { data: session, isPending: sessionLoading } = useSession();

  // Check for guest user
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  // NEW: User clearance state
  const [userClearance, setUserClearance] = useState<{
    permissionClearance: number;
    dutyClearance: number;
    hasHostPrivileges: boolean;
  } | null>(null);

  // Workshop state
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenVideoRef, setScreenVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // NEW: PeerJS state for video streaming
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const peerConnectionsRef = useRef<Map<string, any>>(new Map());
  const remoteVideoRefsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  // NEW: Waiting room state
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [waitingRoomEntryTime, setWaitingRoomEntryTime] = useState<Date | null>(null);
  const [waitingRoomElapsedTime, setWaitingRoomElapsedTime] = useState(0);
  const [waitingRoomChecking, setWaitingRoomChecking] = useState(true);
  
  // NEW: Pre-join media preview state
  const [isInitializingPreview, setIsInitializingPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // NEW: Enhanced preview state
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  
  // NEW: Foreground/Background state
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [wasVideoOnBeforeHidden, setWasVideoOnBeforeHidden] = useState(false);
  const [wasAudioOnBeforeHidden, setWasAudioOnBeforeHidden] = useState(false);
  
  // NEW: Device selection state
  const [availableDevices, setAvailableDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('default');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('default');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('default');
  
  // UI state
  const [viewLayout, setViewLayout] = useState<ViewLayout>("grid");
  const [sidebarView, setSidebarView] = useState<SidebarView>("chat");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waitingRoomPollRef = useRef<NodeJS.Timeout | null>(null);

  // NEW: Initialize PeerJS when joining workshop
  const initializePeer = async () => {
    try {
      console.log("🔗 Initializing PeerJS...");
      
      // Create unique peer ID based on user ID and timestamp
      const uniquePeerId = `${currentUserId}_${Date.now()}`;
      
      const newPeer = new Peer(uniquePeerId, {
        host: 'peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        debug: 2,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      newPeer.on('open', (id) => {
        console.log('✅ PeerJS connected with ID:', id);
        setMyPeerId(id);
        setPeer(newPeer);
        
        // Update participant with peer ID
        updateParticipantPeerId(id);
      });

      newPeer.on('error', (error) => {
        console.error('❌ PeerJS error:', error);
      });

      // Listen for incoming calls from other participants
      newPeer.on('call', (call) => {
        console.log('📞 Incoming call from:', call.peer);
        
        if (!localStream) {
          console.error('No local stream available to answer call');
          return;
        }

        // Answer the call with our stream
        call.answer(localStream);
        
        // Receive remote stream
        call.on('stream', (remoteStream) => {
          console.log('📺 Received remote stream from:', call.peer);
          addRemoteStream(call.peer, remoteStream);
        });

        call.on('close', () => {
          console.log('📵 Call closed with:', call.peer);
          removeRemoteStream(call.peer);
        });

        call.on('error', (error) => {
          console.error('Call error:', error);
        });

        peerConnectionsRef.current.set(call.peer, call);
      });

      newPeer.on('disconnected', () => {
        console.log('⚠️ PeerJS disconnected, attempting to reconnect...');
        newPeer.reconnect();
      });

      return newPeer;
    } catch (error) {
      console.error('Error initializing PeerJS:', error);
      return null;
    }
  };

  // NEW: Update participant with peer ID
  const updateParticipantPeerId = async (peerId: string) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      await fetch(`/api/workshops/${workshopId}/participants/${currentUserId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ peerId }),
      });

      console.log('✅ Updated participant with peer ID:', peerId);
    } catch (error) {
      console.error('Error updating peer ID:', error);
    }
  };

  // NEW: Connect to other participants
  const connectToParticipants = async (participantsList: Participant[]) => {
    if (!peer || !localStream || !myPeerId) {
      console.log('⏳ Not ready to connect:', { peer: !!peer, localStream: !!localStream, myPeerId });
      return;
    }

    console.log('🔗 Attempting to connect to participants:', participantsList.length);

    // Get active participants with peer IDs (excluding self)
    const activeParticipants = participantsList.filter(
      p => p.peerId && 
           p.userId !== currentUserId && 
           !p.leftAt &&
           p.status === 'active'
    );

    console.log('👥 Active participants to connect:', activeParticipants.map(p => ({
      name: p.userName,
      peerId: p.peerId,
      userId: p.userId
    })));

    for (const participant of activeParticipants) {
      const participantPeerId = participant.peerId!;
      
      // Skip if already connected
      if (peerConnectionsRef.current.has(participantPeerId)) {
        console.log('Already connected to:', participant.userName);
        continue;
      }

      try {
        console.log(`📞 Calling ${participant.userName} (${participantPeerId})...`);
        
        // Call the participant with our stream
        const call = peer.call(participantPeerId, localStream);

        if (!call) {
          console.error('Failed to create call for:', participant.userName);
          continue;
        }

        // Listen for their stream
        call.on('stream', (remoteStream) => {
          console.log(`📺 Received stream from ${participant.userName}`);
          addRemoteStream(participantPeerId, remoteStream, participant.userName);
        });

        call.on('close', () => {
          console.log(`📵 Call closed with ${participant.userName}`);
          removeRemoteStream(participantPeerId);
        });

        call.on('error', (error) => {
          console.error(`Call error with ${participant.userName}:`, error);
          removeRemoteStream(participantPeerId);
        });

        peerConnectionsRef.current.set(participantPeerId, call);
        console.log(`✅ Connected to ${participant.userName}`);
      } catch (error) {
        console.error(`Error calling ${participant.userName}:`, error);
      }
    }
  };

  // NEW: Add remote stream
  const addRemoteStream = (peerId: string, stream: MediaStream, userName?: string) => {
    console.log('➕ Adding remote stream:', peerId, userName);
    
    setRemoteStreams(prev => {
      // Check if stream already exists
      if (prev.some(s => s.peerId === peerId)) {
        console.log('Stream already exists, updating...');
        return prev.map(s => s.peerId === peerId ? { ...s, stream } : s);
      }

      // Find participant name if not provided
      const participant = participants.find(p => p.peerId === peerId);
      const name = userName || participant?.userName || 'Unknown';

      console.log(`✅ Added stream for ${name}`);
      return [...prev, {
        userId: participant?.userId || peerId,
        userName: name,
        stream,
        peerId
      }];
    });
  };

  // NEW: Remove remote stream
  const removeRemoteStream = (peerId: string) => {
    console.log('➖ Removing remote stream:', peerId);
    
    setRemoteStreams(prev => prev.filter(s => s.peerId !== peerId));
    peerConnectionsRef.current.delete(peerId);
    remoteVideoRefsRef.current.delete(peerId);
  };

  // NEW: Clean up peer connections
  const cleanupPeerConnections = () => {
    console.log('🧹 Cleaning up peer connections...');
    
    // Close all peer connections
    peerConnectionsRef.current.forEach((call, peerId) => {
      try {
        call.close();
      } catch (error) {
        console.error('Error closing call:', error);
      }
    });
    peerConnectionsRef.current.clear();

    // Close peer instance
    if (peer) {
      peer.destroy();
      setPeer(null);
      setMyPeerId(null);
    }

    // Clear remote streams
    setRemoteStreams([]);
    remoteVideoRefsRef.current.clear();
  };

  // NEW: Handle opening in new tab
  const handleOpenInNewTab = () => {
    const currentUrl = window.location.href;
    
    // Security check - ensure user has valid session or guest data
    const bearerToken = localStorage.getItem("bearer_token");
    const guestData = localStorage.getItem("guest_user");
    
    if (!bearerToken && !guestData) {
      return;
    }
    
    // Open in new tab
    const newWindow = window.open(currentUrl, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
      console.log("Workshop opened in new tab:", {
        workshopId,
        currentUrl,
        totalTabs: parseInt(localStorage.getItem(`workshop_${workshopId}_tabs`) || '1')
      });
    } else {
      console.error("Failed to open new tab. Please check your browser's popup blocker.");
    }
  };

  // NEW: Copy session link to clipboard
  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(currentUrl);
      console.log("Workshop link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // NEW: Track tab count on mount/unmount
  useEffect(() => {
    const multiTabKey = `workshop_${workshopId}_tabs`;
    const currentCount = parseInt(localStorage.getItem(multiTabKey) || '0');
    
    // Increment on mount
    localStorage.setItem(multiTabKey, (currentCount + 1).toString());
    
    // Decrement on unmount
    return () => {
      const count = parseInt(localStorage.getItem(multiTabKey) || '1');
      const newCount = Math.max(0, count - 1);
      localStorage.setItem(multiTabKey, newCount.toString());
      
      console.log("Tab closed, remaining tabs:", newCount);
    };
  }, [workshopId]);

  // NEW: Handle page visibility changes - stop media when in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
      
      console.log(`📱 Page visibility changed: ${isVisible ? 'FOREGROUND' : 'BACKGROUND'}`);
      
      if (!localStream) return;
      
      if (!isVisible) {
        // Page going to background - save current states and disable tracks
        console.log('⏸️ Pausing media tracks (background)');
        
        const videoTrack = localStream.getVideoTracks()[0];
        const audioTrack = localStream.getAudioTracks()[0];
        
        if (videoTrack) {
          setWasVideoOnBeforeHidden(!videoTrack.enabled);
          videoTrack.enabled = false; // Disable video in background
          console.log('📹 Video track disabled (background)');
        }
        
        if (audioTrack) {
          setWasAudioOnBeforeHidden(!audioTrack.enabled);
          audioTrack.enabled = false; // Disable audio in background
          console.log('🎤 Audio track disabled (background)');
        }
        
        // Stop audio monitoring while in background
        stopAudioLevelMonitoring();
        
      } else {
        // Page coming to foreground - restore previous states
        console.log('▶️ Resuming media tracks (foreground)');
        
        const videoTrack = localStream.getVideoTracks()[0];
        const audioTrack = localStream.getAudioTracks()[0];
        
        if (videoTrack && !wasVideoOnBeforeHidden) {
          videoTrack.enabled = true; // Re-enable video
          setIsVideoOff(false);
          console.log('📹 Video track re-enabled (foreground)');
        }
        
        if (audioTrack && !wasAudioOnBeforeHidden) {
          audioTrack.enabled = true; // Re-enable audio
          setIsMuted(false);
          console.log('🎤 Audio track re-enabled (foreground)');
        }
        
        // Restart audio monitoring
        if (audioTrack && !wasAudioOnBeforeHidden) {
          startAudioLevelMonitoring(localStream);
        }
        
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [localStream, wasVideoOnBeforeHidden, wasAudioOnBeforeHidden]);

  // NEW: Enumerate available media devices
  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAvailableDevices({
        audioInputs,
        videoInputs,
        audioOutputs
      });
      
      console.log('📱 Available devices:', {
        audioInputs: audioInputs.length,
        videoInputs: videoInputs.length,
        audioOutputs: audioOutputs.length
      });
      
      // Set defaults if not already set
      if (selectedAudioInput === 'default' && audioInputs.length > 0) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (selectedVideoInput === 'default' && videoInputs.length > 0) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }
      if (selectedAudioOutput === 'default' && audioOutputs.length > 0) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  // NEW: Enumerate devices on mount and when permissions granted
  useEffect(() => {
    if (localStream) {
      enumerateDevices();
    }
  }, [localStream]);

  // NEW: Switch to different audio input device
  const switchAudioInput = async (deviceId: string) => {
    if (!localStream) return;
    
    try {
      const audioTrack = localStream.getAudioTracks()[0];
      const wasEnabled = audioTrack?.enabled ?? true;
      
      // Stop current audio track
      if (audioTrack) {
        audioTrack.stop();
        localStream.removeTrack(audioTrack);
      }
      
      // Get new audio stream with selected device
      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      newAudioTrack.enabled = wasEnabled;
      
      // Add new audio track to existing stream
      localStream.addTrack(newAudioTrack);
      
      setSelectedAudioInput(deviceId);
      
      // Restart audio monitoring with new track
      stopAudioLevelMonitoring();
      startAudioLevelMonitoring(localStream);
      
      // Get device label
      const device = availableDevices.audioInputs.find(d => d.deviceId === deviceId);
      
      console.log('✓ Audio input switched:', device?.label);
    } catch (error) {
      console.error('Error switching audio input:', error);
    }
  };

  // NEW: Switch to different video input device
  const switchVideoInput = async (deviceId: string) => {
    if (!localStream) return;
    
    try {
      const videoTrack = localStream.getVideoTracks()[0];
      const wasEnabled = videoTrack?.enabled ?? true;
      
      // Stop current video track
      if (videoTrack) {
        videoTrack.stop();
        localStream.removeTrack(videoTrack);
      }
      
      // Get new video stream with selected device
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      });
      
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      newVideoTrack.enabled = wasEnabled;
      
      // Add new video track to existing stream
      localStream.addTrack(newVideoTrack);
      
      // Update video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setSelectedVideoInput(deviceId);
      
      // Get device label
      const device = availableDevices.videoInputs.find(d => d.deviceId === deviceId);
      
      console.log('✓ Video input switched:', device?.label);
    } catch (error) {
      console.error('Error switching video input:', error);
    }
  };

  // NEW: Fetch user clearance levels on mount
  useEffect(() => {
    const fetchUserClearance = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/users/lookup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: session.user.email }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const permClearance = data.userRole?.permissionClearance || 0;
          const dutyClearance = data.userRole?.dutyClearance || 0;
          
          // User has host privileges if EITHER clearance is 75+
          const hasHostPrivileges = permClearance >= 75 || dutyClearance >= 75;
          
          setUserClearance({
            permissionClearance: permClearance,
            dutyClearance: dutyClearance,
            hasHostPrivileges,
          });
          
          console.log('✅ User clearance loaded:', {
            permissionClearance: permClearance,
            dutyClearance: dutyClearance,
            hasHostPrivileges,
            email: session.user.email
          });
        }
      } catch (error) {
        console.error('Error fetching user clearance:', error);
      }
    };
    
    if (session?.user && !sessionLoading) {
      fetchUserClearance();
    }
  }, [session, sessionLoading]);

  useEffect(() => {
    // Check for guest user in localStorage
    const guestData = localStorage.getItem("guest_user");
    if (guestData) {
      try {
        const guest: GuestUser = JSON.parse(guestData);
        setGuestUser(guest);
        setCurrentUserName(guest.name);
        setCurrentUserId(`guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      } catch (error) {
        console.error("Error parsing guest data:", error);
      }
    }

    if (!session && !sessionLoading && !guestUser && !guestData) {
      console.error("No valid session - redirecting to login");
      router.push(`/login?redirect=/workshops/${workshopId}/live`);
      return;
    }

    if ((session || guestUser || guestData) && workshopId) {
      // Set user info from session if authenticated
      if (session) {
        setCurrentUserName(session.user.name || "User");
        setCurrentUserId(session.user.id);
      }
      
      fetchWorkshop();
      checkParticipantStatus();
    }

    return () => {
      stopPolling();
      stopWaitingRoomPoll();
      cleanup();
    };
  }, [session, sessionLoading, workshopId]);

  // NEW: Enhanced video ref effect with better error handling
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = localStream;
        console.log("Local video stream attached successfully", {
          streamActive: localStream.active,
          videoTracks: localStream.getVideoTracks().length,
          audioTracks: localStream.getAudioTracks().length
        });
      } catch (error) {
        console.error("Error attaching local stream to video element:", error);
      }
    }
  }, [localStream]);

  // ENHANCED: Initialize preview media when on pre-join screen
  useEffect(() => {
    console.log("🔍 Preview initialization effect triggered", {
      hasJoined,
      isJoining,
      isLoading,
      workshop: !!workshop,
      currentUserId: !!currentUserId,
      localStream: !!localStream,
      isInitializingPreview,
      shouldInitialize: !hasJoined && !isJoining && !isLoading && workshop && currentUserId && !localStream && !isInitializingPreview
    });

    // Only initialize when on pre-join screen and not already initialized
    if (!hasJoined && !isJoining && !isLoading && workshop && currentUserId && !localStream && !isInitializingPreview) {
      console.log("✅ Conditions met - Starting preview media initialization...");
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializePreviewMedia();
      }, 300);
    }

    return () => {
      // Cleanup audio monitoring when leaving pre-join
      if (!hasJoined) {
        stopAudioLevelMonitoring();
      }
    };
  }, [hasJoined, isJoining, isLoading, workshop, currentUserId, localStream, isInitializingPreview]);

  // ENHANCED: Check browser permissions first
  const checkMediaPermissions = async () => {
    setIsCheckingPermissions(true);
    setPreviewError(null);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera/microphone access");
      }

      // Try to query permissions (not all browsers support this)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          console.log("Browser permissions:", {
            camera: cameraPermission.state,
            microphone: micPermission.state
          });

          if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
            setHasPermissions(false);
            setPreviewError("Camera/microphone access denied. Please enable permissions in your browser settings.");
            return false;
          }
        } catch (permError) {
          console.log("Permission query not supported, will request directly");
        }
      }

      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPreviewError(error instanceof Error ? error.message : "Failed to check permissions");
      setHasPermissions(false);
      return false;
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  // ENHANCED: Initialize preview camera and microphone with better error handling
  const initializePreviewMedia = async () => {
    // Don't re-initialize if already in progress or already have stream
    if (isInitializingPreview || localStream) {
      console.log("Skipping initialization - already in progress or stream exists");
      return;
    }
    
    try {
      setIsInitializingPreview(true);
      setPreviewError(null);
      console.log("Requesting media permissions...");
      
      // First check permissions
      const hasPerms = await checkMediaPermissions();
      if (!hasPerms) {
        console.log("Permissions check failed");
        setIsInitializingPreview(false);
        return;
      }
      
      // Request media stream with fallbacks
      let stream: MediaStream | null = null;
      
      try {
        // Try with ideal quality first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (error) {
        console.warn("Failed to get ideal quality, trying basic constraints:", error);
        
        // Fallback to basic constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw fallbackError;
        }
      }
      
      if (!stream) {
        throw new Error("Failed to obtain media stream");
      }
      
      console.log("✓ Preview media stream obtained:", {
        streamId: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoEnabled: stream.getVideoTracks()[0]?.enabled,
        audioEnabled: stream.getAudioTracks()[0]?.enabled
      });
      
      setLocalStream(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      setHasPermissions(true);
      
      // Wait a tick for state to update, then attach to video element
      setTimeout(() => {
        if (localVideoRef.current && stream) {
          try {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play()
              .then(() => console.log("✓ Preview video playing"))
              .catch(e => console.error("Video play error:", e));
          } catch (attachError) {
            console.error("Error attaching stream to video element:", attachError);
          }
        }
      }, 100);
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream);
      
    } catch (error) {
      console.error("❌ Error initializing preview media:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      let userMessage = "Failed to access camera/microphone";
      
      if (errorMessage.includes("Permission denied") || 
          errorMessage.includes("NotAllowedError") ||
          errorMessage.includes("PermissionDeniedError")) {
        userMessage = "Camera/microphone access denied. Please allow permissions and try again.";
        setHasPermissions(false);
      } else if (errorMessage.includes("NotFoundError") || 
                 errorMessage.includes("DevicesNotFoundError")) {
        userMessage = "No camera or microphone found. Please connect devices.";
      } else if (errorMessage.includes("NotReadableError") || 
                 errorMessage.includes("TrackStartError")) {
        userMessage = "Camera/microphone is already in use by another application.";
      } else if (errorMessage.includes("OverconstrainedError")) {
        userMessage = "Camera doesn't support requested settings. Trying again...";
      }
      
      setPreviewError(userMessage);
      
    } finally {
      setIsInitializingPreview(false);
    }
  };

  // NEW: Manual retry initialization
  const retryInitialization = async () => {
    console.log("Manual retry requested");
    
    // Clean up existing stream first
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      setLocalStream(null);
    }
    
    stopAudioLevelMonitoring();
    setPreviewError(null);
    
    // Small delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retry initialization
    await initializePreviewMedia();
  };

  // NEW: Start monitoring audio levels for visual feedback
  const startAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        console.log("❌ No audio track found for monitoring");
        return;
      }

      console.log("🎤 Starting audio level monitoring...", {
        trackLabel: audioTrack.label,
        trackEnabled: audioTrack.enabled,
        trackReadyState: audioTrack.readyState
      });

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      // Configure analyser for better microphone level detection
      analyser.fftSize = 2048; // Increased for better resolution
      analyser.smoothingTimeConstant = 0.3; // Smooth but responsive
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      microphone.connect(analyser);
      
      // Resume audio context if suspended (required in some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log("✓ Audio context resumed");
        });
      }
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Use time domain data for better microphone level detection
      const dataArray = new Uint8Array(analyser.fftSize);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current || !audioContextRef.current) {
          console.log("⚠️ Audio monitoring stopped - refs cleared");
          return;
        }
        
        // Get time domain data (waveform)
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate RMS (Root Mean Square) for accurate volume level
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        
        // Convert to 0-100 scale with better sensitivity
        const normalizedLevel = Math.min(100, rms * 200); // Amplify for visibility
        
        setAudioLevel(normalizedLevel);
        
        // Log every 60 frames for debugging
        if (animationFrameRef.current && animationFrameRef.current % 60 === 0) {
          console.log("🎤 Audio level:", normalizedLevel.toFixed(1), "%", {
            rms: rms.toFixed(3),
            contextState: audioContextRef.current?.state,
            trackEnabled: audioTrack.enabled
          });
        }
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      
      console.log("✓ Audio level monitoring started", {
        fftSize: analyser.fftSize,
        contextState: audioContext.state,
        sampleRate: audioContext.sampleRate
      });
    } catch (error) {
      console.error("❌ Error starting audio level monitoring:", error);
    }
  };

  // NEW: Stop audio level monitoring
  const stopAudioLevelMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setAudioLevel(0);
  };

  // ENHANCED: Check host presence with clearance levels - SIMPLIFIED
  const checkHostPresence = async () => {
    if (!workshop || !currentUserId) return false;
    
    // CRITICAL FIX: Check if user is workshop creator OR has high clearance OR has admin.ucon.dev email
    const isWorkshopCreator = workshop.hostUserId === currentUserId;
    const hasHighClearance = userClearance?.hasHostPrivileges || false;
    const isAdminUconDev = session?.user?.email?.toLowerCase().endsWith('@admin.ucon.dev') || 
                          session?.user?.email?.toLowerCase() === 'admin.ucon.dev';
    
    if (isWorkshopCreator || hasHighClearance || isAdminUconDev) {
      console.log('✅ User has host access:', {
        isWorkshopCreator,
        hasHighClearance,
        isAdminUconDev,
        email: session?.user?.email,
        permissionClearance: userClearance?.permissionClearance,
        dutyClearance: userClearance?.dutyClearance,
        reason: isWorkshopCreator ? 'Workshop Creator' : 
                isAdminUconDev ? 'Admin Ucon Dev Domain' : 
                'High Clearance'
      });
      
      setIsHostPresent(true);
      setIsInWaitingRoom(false);
      setWaitingRoomChecking(false);
      
      return true;
    }

    try {
      const headers: HeadersInit = {};
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(`/api/workshops/${workshopId}/participants`, { headers });
      
      if (response.ok) {
        const participants: Participant[] = await response.json();
        
        // Check if host is in the room (active status, not left)
        const hostInRoom = participants.some(
          p => p.userId === workshop.hostUserId && 
               p.status === 'active' && 
               !p.leftAt
        );
        
        console.log("Host presence check:", {
          hostId: workshop.hostUserId,
          hostPresent: hostInRoom,
          totalParticipants: participants.length,
          activeParticipants: participants.filter(p => p.status === 'active' && !p.leftAt).length,
          workshopType: workshop.programType,
          userType: guestUser ? 'guest' : 'authenticated',
          guestAllowedForAwaken: workshop.programType === 'awaken' ? 'yes (but still needs host)' : 'n/a'
        });
        
        setIsHostPresent(hostInRoom);
        setWaitingRoomChecking(false);
        
        return hostInRoom;
      }
    } catch (error) {
      console.error("Error checking host presence:", error);
    }
    
    setWaitingRoomChecking(false);
    return false;
  };

  // NEW: Poll for host presence when in waiting room
  const startWaitingRoomPoll = () => {
    stopWaitingRoomPoll();
    
    waitingRoomPollRef.current = setInterval(async () => {
      const hostPresent = await checkHostPresence();
      
      // Fetch updated participant list to show live count
      await fetchParticipants();
      
      if (hostPresent) {
        console.log("🎉 Host has joined! Transitioning from waiting room...");
        setIsInWaitingRoom(false);
        setWaitingRoomEntryTime(null);
        setWaitingRoomElapsedTime(0);
        stopWaitingRoomPoll();
        
        // Update participant status from 'waiting' to 'active' in database
        try {
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };
          
          if (!guestUser) {
            headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
          }

          const updateResponse = await fetch(`/api/workshops/${workshopId}/participants/${currentUserId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: 'active' }),
          });

          if (updateResponse.ok) {
            console.log("✅ Updated status from waiting to active");
          }
        } catch (error) {
          console.error("Error updating participant status:", error);
        }
      }
    }, 5000); // Check every 5 seconds
  };

  const stopWaitingRoomPoll = () => {
    if (waitingRoomPollRef.current) {
      clearInterval(waitingRoomPollRef.current);
      waitingRoomPollRef.current = null;
    }
  };

  // NEW: Poll for workshop updates
  useEffect(() => {
    if (!workshop || !hasJoined) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/workshops/${workshopId}`, {
          headers: guestUser ? {
            'x-guest-token': guestUser.token
          } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setWorkshop(data);
        }
      } catch (error) {
        console.error("Failed to refresh workshop:", error);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [workshopId, workshop, hasJoined, guestUser]);

  // NEW: Update elapsed time in waiting room
  useEffect(() => {
    if (!isInWaitingRoom || !waitingRoomEntryTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - waitingRoomEntryTime.getTime()) / 1000);
      setWaitingRoomElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isInWaitingRoom, waitingRoomEntryTime]);

  const fetchWorkshop = async () => {
    try {
      setIsLoading(true);
      const headers: HeadersInit = {};
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(`/api/workshops?id=${workshopId}`, { headers });

      if (response.ok) {
        const data = await response.json();
        setWorkshop(data);

        if (data.status !== "live") {
          console.error("This workshop is not currently live");
          router.push(`/workshops/${workshopId}`);
        }
      } else {
        console.error("Failed to load workshop");
        router.push("/workshops");
      }
    } catch (error) {
      console.error("Error fetching workshop:", error);
      console.error("Error loading workshop");
      router.push("/workshops");
    } finally {
      setIsLoading(false);
    }
  };

  const checkParticipantStatus = async () => {
    try {
      const headers: HeadersInit = {};
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(`/api/workshops/${workshopId}/participants`, { headers });

      if (response.ok) {
        const data: Participant[] = await response.json();
        setParticipants(data);
        
        console.log("Participant status check:", {
          totalParticipants: data.length,
          activeParticipants: data.filter(p => p.status === 'active' && !p.leftAt).length,
          currentUserId
        });
        
        const currentParticipant = data.find(
          (p) => p.userId === currentUserId && !p.leftAt
        );
        setHasJoined(!!currentParticipant);
      }
    } catch (error) {
      console.error("Error checking participant status:", error);
    }
  };

  const startPolling = () => {
    pollIntervalRef.current = setInterval(() => {
      fetchParticipants();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // ENHANCED: Better participant fetching with logging
  const fetchParticipants = async () => {
    try {
      const headers: HeadersInit = {};
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(`/api/workshops/${workshopId}/participants`, { headers });

      if (response.ok) {
        const data: Participant[] = await response.json();
        setParticipants(data);
        
        console.log("Participants updated:", {
          total: data.length,
          active: data.filter(p => p.status === 'active' && !p.leftAt).length,
          waiting: data.filter(p => p.status === 'waiting').length,
          participants: data.map(p => ({ 
            name: p.userName, 
            status: p.status, 
            leftAt: p.leftAt,
            isActive: p.status === 'active' && !p.leftAt
          }))
        });
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  // ENHANCED: Better media initialization with detailed logging
  const initializeMedia = async (videoEnabled: boolean, audioEnabled: boolean) => {
    try {
      console.log("Initializing media devices...", { videoEnabled, audioEnabled });
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
      });
      
      console.log("Media stream obtained:", {
        streamId: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().map(t => ({
          id: t.id,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        })),
        audioTracks: stream.getAudioTracks().map(t => ({
          id: t.id,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        }))
      });
      
      setLocalStream(stream);
      setIsVideoOff(!videoEnabled);
      setIsMuted(!audioEnabled);
      
      // Ensure video element updates
      if (localVideoRef.current && videoEnabled) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(e => console.error("Video play error:", e));
      }
      
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      console.error("Failed to access camera/microphone. Please check permissions.");
      throw error;
    }
  };

  // ENHANCED: Join with NO waiting room for high clearance users
  const handleJoinWorkshop = async (videoEnabled: boolean, audioEnabled: boolean) => {
    if (!currentUserId || !currentUserName || !workshop) return;

    try {
      setIsJoining(true);
      
      // CRITICAL FIX: Check if user has host privileges BEFORE checking host presence
      const isWorkshopCreator = workshop.hostUserId === currentUserId;
      const hasHighClearance = userClearance?.hasHostPrivileges || false;
      
      // Skip waiting room check if user is creator OR has high clearance
      if (!isWorkshopCreator && !hasHighClearance) {
        // Only check host presence for regular users
        const hostPresent = await checkHostPresence();
        
        if (!hostPresent) {
          // Put regular user in waiting room
          setIsInWaitingRoom(true);
          setWaitingRoomEntryTime(new Date());
          setIsJoining(false);
          console.log("Regular user placed in waiting room");
          
          // ADD PARTICIPANT TO DATABASE WITH WAITING STATUS
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };
          
          if (!guestUser) {
            headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
          }

          try {
            const waitingResponse = await fetch(`/api/workshops/${workshopId}/participants`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                userId: currentUserId,
                userName: currentUserName,
                peerId: null,
                isHost: false,
                isGuest: !!guestUser,
                status: 'waiting'
              }),
            });

            if (waitingResponse.ok) {
              console.log("✅ Added to waiting room in database");
            } else {
              console.warn("Failed to add to waiting room database, but continuing...");
            }
          } catch (waitingError) {
            console.error("Error adding to waiting room:", waitingError);
          }
          
          // Fetch participants immediately to show initial count
          await fetchParticipants();
          
          startWaitingRoomPoll();
          return;
        }
      } else {
        console.log("High clearance user - bypassing waiting room", {
          isWorkshopCreator,
          hasHighClearance,
          permissionClearance: userClearance?.permissionClearance,
          dutyClearance: userClearance?.dutyClearance
        });
      }

      // Initialize media FIRST
      const stream = await initializeMedia(videoEnabled, audioEnabled);
      
      // Initialize PeerJS for video streaming
      await initializePeer();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      console.log("Joining workshop as:", {
        userId: currentUserId,
        userName: currentUserName,
        isHost: !guestUser && workshop?.hostUserId === currentUserId,
        isGuest: !!guestUser,
        clearance: userClearance
      });

      const response = await fetch(`/api/workshops/${workshopId}/participants`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          peerId: null, // Will be updated once PeerJS connects
          isHost: !guestUser && workshop?.hostUserId === currentUserId,
          isGuest: !!guestUser,
          status: 'active'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Joined workshop successfully");
        setHasJoined(true);
        setIsInWaitingRoom(false);
        startPolling();
        
        await fetchParticipants();
      } else {
        if (data.code === "NOT_REGISTERED" && !guestUser) {
          console.error("User not registered for workshop");
          router.push(`/workshops/${workshopId}`);
        } else if (data.code === "ALREADY_IN_SESSION") {
          console.log("User already in session");
          setHasJoined(true);
          setIsInWaitingRoom(false);
          startPolling();
          await fetchParticipants();
        } else {
          console.error("Failed to join:", data.error);
          cleanup();
        }
      }
    } catch (error) {
      console.error("Error joining workshop:", error);
      cleanup();
    } finally {
      setIsJoining(false);
    }
  };

  // NEW: Monitor participants and connect to new ones
  useEffect(() => {
    if (hasJoined && peer && localStream && participants.length > 0) {
      console.log('🔄 Participants changed, checking connections...');
      connectToParticipants(participants);
    }
  }, [participants, hasJoined, peer, localStream]);

  // NEW: Connect to participants once peer is ready
  useEffect(() => {
    if (myPeerId && localStream && hasJoined) {
      console.log('✅ Peer ready! Will connect to participants in 2 seconds...');
      
      // Give time for peer ID to propagate to database and for others to see us
      const connectTimer = setTimeout(() => {
        console.log('🔗 Connecting to existing participants...');
        fetchParticipants(); // Refresh participant list first
      }, 2000);

      return () => clearTimeout(connectTimer);
    }
  }, [myPeerId, hasJoined, localStream]);

  const handleLeaveWorkshop = async () => {
    if (!currentUserId) return;

    try {
      setIsLeaving(true);
      
      const headers: HeadersInit = {};
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(
        `/api/workshops/${workshopId}/participants?userId=${currentUserId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (response.ok) {
        console.log("Left workshop");
        cleanup();
        
        if (guestUser) {
          localStorage.removeItem("guest_user");
        }
        
        router.push(`/workshops/${workshopId}`);
      } else {
        const data = await response.json();
        console.error(data.error || "Failed to leave workshop");
      }
    } catch (error) {
      console.error("Error leaving workshop:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log("Audio toggled:", { enabled: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log("Video toggled:", { enabled: videoTrack.enabled });
      }
    }
  };

  const toggleHandRaise = () => {
    setHasHandRaised(!hasHandRaised);
  };

  // Enhanced screen share with permission check
  const startScreenShare = async () => {
    if (!checkAndNotify(currentParticipant?.role, 'screen', 'share', 'share your screen')) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  // Enhanced lock toggle with permission check
  const toggleLock = async () => {
    if (!checkAndNotify(currentParticipant?.role, 'session', 'lock', 'lock the meeting')) {
      return;
    }
    
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (!guestUser) {
        headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
      }

      const response = await fetch(`/api/workshops/${workshopId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isLocked: !isLocked }),
      });

      if (response.ok) {
        setIsLocked(!isLocked);
      }
    } catch (error) {
      console.error("Error toggling lock:", error);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // NEW: Live stats state for details card
  const [liveStats, setLiveStats] = useState({
    totalParticipants: 0,
    activeVideos: 0,
    activeMics: 0,
    duration: "0:00",
    streamQuality: "Good"
  });

  // NEW: Track session duration
  const sessionStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // CRITICAL FIX: Move activeParticipants declaration BEFORE it's used in useEffect
  const currentUser = session?.user || (guestUser ? { id: currentUserId, name: currentUserName } : null);
  const isHost = !guestUser && workshop?.hostUserId === currentUserId;
  const activeParticipants = participants.filter((p) => !p.leftAt && p.status === 'active');
  const currentParticipant = participants.find(p => p.userId === currentUserId && !p.leftAt);
  
  // Get workshop permissions for current user (guests have participant role)
  const permissions = useWorkshopPermissions(guestUser ? 'participant' : currentParticipant?.role);

  // NEW: Update live stats whenever participants change
  useEffect(() => {
    if (!hasJoined) return;

    const activeVideos = participants.filter(p => !p.isVideoOff && p.status === 'active' && !p.leftAt).length;
    const activeMics = participants.filter(p => !p.isMuted && p.status === 'active' && !p.leftAt).length;
    
    setLiveStats(prev => ({
      ...prev,
      totalParticipants: activeParticipants.length,
      activeVideos,
      activeMics
    }));
  }, [participants, hasJoined, activeParticipants.length]);

  // NEW: Track session duration
  useEffect(() => {
    if (hasJoined && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
      
      durationIntervalRef.current = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const now = new Date();
          const diff = Math.floor((now.getTime() - sessionStartTimeRef.current.getTime()) / 1000);
          const minutes = Math.floor(diff / 60);
          const seconds = diff % 60;
          setLiveStats(prev => ({
            ...prev,
            duration: `${minutes}:${seconds.toString().padStart(2, '0')}`
          }));
        }
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [hasJoined]);

  const cleanup = () => {
    stopPolling();
    stopWaitingRoomPoll();
    stopScreenShare();
    cleanupPeerConnections(); // NEW: Clean up peer connections
    
    // Reset waiting room state
    setIsInWaitingRoom(false);
    setWaitingRoomEntryTime(null);
    setWaitingRoomElapsedTime(0);
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }
    
    setHasJoined(false);
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto mb-4" />
          <p className="text-gray-400">Loading workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Workshop Not Found</h2>
          <Button onClick={() => router.push("/workshops")} className="bg-[#A92FFA]">
            Back to Workshops
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
        {/* ENHANCED Header with LIVE participant count AND Navigation Links */}
        <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3 flex-shrink-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    title="Navigate"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Navigate</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/workshops/${workshopId}`} className="cursor-pointer">
                      <DoorOpen className="w-4 h-4 mr-2" />
                      Workshop Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/workshops" className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      All Workshops
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/services" className="cursor-pointer">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <Home className="w-4 h-4 mr-2" />
                      Homepage
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white animate-pulse px-2 py-1">
                  <Circle className="w-2 h-2 fill-current mr-1" />
                  LIVE
                </Badge>
              {guestUser && (
                <Badge variant="outline" className="border-blue-500 text-blue-400 px-2 py-1">
                  <UserCircle className="w-3 h-3 mr-1" />
                  Guest
                </Badge>
              )}
              {isRecording && (
                <Badge className="bg-red-600 text-white animate-pulse px-2 py-1">
                  <Circle className="w-2 h-2 fill-current mr-1" />
                  REC
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold line-clamp-1">{workshop.title}</h1>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                {/* LIVE STATS: Real-time participant count */}
                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400">{activeParticipants.length}</span>
                  <span className="text-green-400">live</span>
                </div>
                {currentParticipant && !guestUser && (
                  <Badge 
                    variant="outline" 
                    className={`px-2 py-0 ${getRoleConfig(currentParticipant.role).color} text-xs`}
                  >
                    {getRoleConfig(currentParticipant.role).displayName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasJoined && (
              <>
                {/* NEW: Open in New Tab / Copy Link Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex"
                      title="Open in new tab or copy link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Session Options
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleOpenInNewTab} className="cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Session Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-gray-400">
                        💡 Open in multiple tabs to view from different devices
                      </p>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {process.env.NODE_ENV === 'development' && !guestUser && (
                  <PermissionDebugger currentRole={currentParticipant?.role} />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="hidden md:flex"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
                
                {!guestUser && (
                  <PermissionTooltip
                    resource="session"
                    action="settings"
                    currentRole={currentParticipant?.role}
                    disabled={!permissions.canChangeSettings}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettingsModal(true)}
                      disabled={!hasJoined}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PermissionTooltip>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* NEW: Waiting Room Screen */}
        {isInWaitingRoom ? (
          <div className="flex-1 flex gap-4 p-4">
            {/* Left side - Waiting info */}
            <Card className="w-96 bg-gray-900 border-gray-800 shadow-2xl flex-shrink-0">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Waiting for Host</h2>
                  <p className="text-gray-400 mb-4">
                    {workshop.title}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    The host hasn't joined yet. You'll be automatically admitted when they arrive.
                  </p>
                  {waitingRoomChecking ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking for host...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-yellow-500">
                      <Clock className="w-4 h-4" />
                      <span>Waiting in lobby...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Elapsed Time */}
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Time in Waiting Room
                    </h3>
                    <p className="text-2xl font-bold text-yellow-500">
                      {formatElapsedTime(waitingRoomElapsedTime)}
                    </p>
                  </div>

                  {/* Participant Count */}
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      Currently in Room
                    </h3>
                    <p className="text-2xl font-bold text-[#A92FFA]">
                      {participants.filter(p => !p.leftAt).length} participant{participants.filter(p => !p.leftAt).length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      // Remove from waiting room in database
                      try {
                        const headers: HeadersInit = {};
                        
                        if (!guestUser) {
                          headers.Authorization = `Bearer ${localStorage.getItem("bearer_token")}`;
                        }

                        await fetch(`/api/workshops/${workshopId}/participants?userId=${currentUserId}`, {
                          method: "DELETE",
                          headers,
                        });
                        console.log("✅ Removed from waiting room");
                      } catch (error) {
                        console.error("Error leaving waiting room:", error);
                      }
                      
                      router.push(`/workshops/${workshopId}`);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leave Waiting Room
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Chat */}
            <div className="flex-1">
              <Card className="h-full bg-gray-900 border-gray-800">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#A92FFA]" />
                      Waiting Room Chat
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Chat with others while waiting for the host
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatPanel 
                      workshopId={Number(workshopId)}
                      currentUserId={currentUser?.id || ''}
                      currentUserName={currentUser?.userName || guestUser?.name || 'Guest'}
                      isGuest={!!guestUser}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : !hasJoined ? (
          // ENHANCED Pre-join screen with better error handling
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-xl w-full bg-gray-900 border-gray-800 shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-full flex items-center justify-center">
                    <VideoIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
                  <p className="text-gray-400 mb-2">
                    {workshop.title}
                  </p>
                  {guestUser && (
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                      <UserCircle className="w-4 h-4" />
                      <span>Joining as: {guestUser.name}</span>
                    </div>
                  )}
                </div>

                {/* ENHANCED: Video Preview with error states */}
                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-gray-950 rounded-lg overflow-hidden border-2 border-gray-800">
                    {isInitializingPreview || isCheckingPermissions ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-12 h-12 animate-spin text-[#A92FFA] mx-auto" />
                          <div>
                            <p className="text-sm text-gray-400 font-medium mb-1">
                              {isCheckingPermissions ? "Checking permissions..." : "Initializing devices..."}
                            </p>
                            <p className="text-xs text-gray-500">
                              Please allow camera and microphone access
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : previewError ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                            <X className="w-8 h-8 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-400 mb-2">
                              {previewError}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              {hasPermissions === false ? 
                                "Grant permissions in your browser and click retry" :
                                "Check your devices and click retry"
                              }
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={retryInitialization}
                            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : localStream ? (
                      <>
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {isVideoOff && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-full flex items-center justify-center">
                                <span className="text-3xl font-semibold">
                                  {currentUserName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-400">Camera is off</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Preview controls overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          <Button
                            variant={isMuted ? "destructive" : "secondary"}
                            size="icon"
                            onClick={toggleMute}
                            className="rounded-full"
                          >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </Button>
                          <Button
                            variant={isVideoOff ? "destructive" : "secondary"}
                            size="icon"
                            onClick={toggleVideo}
                            className="rounded-full"
                          >
                            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <Button
                          variant="outline"
                          onClick={initializePreviewMedia}
                          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                        >
                          <VideoIcon className="w-4 h-4 mr-2" />
                          Start Camera & Microphone
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Audio Level Indicator - Only show when stream active */}
                  {localStream && !previewError && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Microphone Level
                        </span>
                        <span className={`font-medium ${
                          isMuted ? 'text-red-400' : 
                          audioLevel > 20 ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {isMuted ? 'Muted' : audioLevel > 5 ? 'Active' : 'Silent'}
                        </span>
                      </div>
                      
                      {/* Audio level bars */}
                      <div className="flex items-center gap-1 h-8 bg-gray-800 rounded-lg p-1">
                        {Array.from({ length: 20 }).map((_, i) => {
                          const threshold = (i + 1) * 5;
                          const isActive = !isMuted && audioLevel >= threshold;
                          
                          return (
                            <div
                              key={i}
                              className={`flex-1 h-full rounded transition-all duration-100 ${
                                isActive
                                  ? threshold > 80
                                    ? 'bg-red-500'
                                    : threshold > 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                              style={{
                                opacity: isActive ? 1 : 0.3
                              }}
                            />
                          );
                        })}
                      </div>
                      
                      {/* Helpful message */}
                      {!isMuted && audioLevel < 5 && (
                        <p className="text-xs text-yellow-500 flex items-center gap-1">
                          <span>🎤</span>
                          <span>Speak to test your microphone</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Join button - disabled if preview error */}
                <Button
                  className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-white py-6 text-lg font-semibold"
                  onClick={() => handleJoinWorkshop(!isVideoOff, !isMuted)}
                  disabled={isJoining || isInitializingPreview || !!previewError || !localStream}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : previewError ? (
                    <>
                      <X className="w-5 h-5 mr-2" />
                      Fix Issues to Join
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Join Workshop
                    </>
                  )}
                </Button>
                
                {previewError && (
                  <p className="text-xs text-center text-gray-500">
                    Resolve the camera/microphone issues above before joining
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main workshop interface
          <div className="flex-1 flex overflow-hidden">
            {/* Video Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
              {/* NEW: Live Stats Details Card - Floating at top */}
              <div className="absolute top-20 right-4 z-20 pointer-events-none">
                <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-800 shadow-2xl pointer-events-auto">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">Live Session Stats</h3>
                    </div>
                    
                    {/* Participant Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>Participants</span>
                        </div>
                        <span className="text-sm font-semibold text-green-400">
                          {liveStats.totalParticipants}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <VideoIcon className="w-3.5 h-3.5" />
                          <span>Active Cameras</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-400">
                          {liveStats.activeVideos}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mic className="w-3.5 h-3.5" />
                          <span>Active Mics</span>
                        </div>
                        <span className="text-sm font-semibold text-green-400">
                          {liveStats.activeMics}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Duration</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {liveStats.duration}
                        </span>
                      </div>
                    </div>
                    
                    {/* Connection Quality */}
                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Stream Quality</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-2 py-0">
                          {liveStats.streamQuality}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Screen share display */}
              {isScreenSharing && (
                <div className="relative flex-1 bg-black">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      <MonitorUp className="w-4 h-4 mr-2" />
                      You are presenting
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={stopScreenShare}
                    >
                      <MonitorOff className="w-4 h-4 mr-2" />
                      Stop Sharing
                    </Button>
                  </div>
                </div>
              )}

              {/* ENHANCED Video grid with remote streams */}
              {!isScreenSharing && (
                <div className="flex-1 p-4 overflow-auto">
                  <div className={`grid gap-3 h-full ${
                    (1 + remoteStreams.length) === 1 ? 'grid-cols-1' :
                    (1 + remoteStreams.length) === 2 ? 'grid-cols-2' :
                    (1 + remoteStreams.length) <= 4 ? 'grid-cols-2 lg:grid-cols-2' :
                    (1 + remoteStreams.length) <= 9 ? 'grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-2 lg:grid-cols-4'
                  }`}>
                    {/* Local video with enhanced display */}
                    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-[#A92FFA] group hover:border-[#F28C28] transition-colors">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      
                      {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-full flex items-center justify-center">
                              <span className="text-2xl font-semibold">
                                {currentUserName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">Camera is off</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced overlay info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Badge className="bg-[#A92FFA] text-white backdrop-blur-sm px-2 py-1 font-semibold">
                            {currentUserName} (You)
                            {guestUser && " - Guest"}
                          </Badge>
                          <div className="flex gap-1">
                            {isMuted ? (
                              <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                                <MicOff className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                <Mic className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Remote participant videos with actual streams */}
                    {remoteStreams.map((remoteStream) => {
                      const participant = participants.find(p => p.peerId === remoteStream.peerId);
                      
                      return (
                        <div
                          key={remoteStream.peerId}
                          className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-[#A92FFA] transition-colors"
                        >
                          <video
                            ref={(el) => {
                              if (el && remoteStream.stream) {
                                el.srcObject = remoteStream.stream;
                                remoteVideoRefsRef.current.set(remoteStream.peerId, el);
                              }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-black/70 text-white backdrop-blur-sm px-2 py-1">
                                  {remoteStream.userName}
                                </Badge>
                                {participant?.isHost && (
                                  <Badge variant="outline" className="border-[#A92FFA] text-[#A92FFA] px-1.5 py-0 text-xs">
                                    Host
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {participant?.isMuted && (
                                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                                    <MicOff className="w-4 h-4" />
                                  </div>
                                )}
                                {participant?.isVideoOff && (
                                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                                    <VideoOff className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show placeholder for participants without streams yet */}
                    {activeParticipants
                      .filter((p) => 
                        p.userId !== currentUserId && 
                        !remoteStreams.some(rs => rs.peerId === p.peerId)
                      )
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-[#A92FFA] transition-colors"
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                            <div className="text-center">
                              <div className="w-20 h-20 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-semibold">
                                  {participant.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm">{participant.userName}</p>
                              <p className="text-xs text-gray-500 mt-1">Connecting...</p>
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-black/70 text-white backdrop-blur-sm px-2 py-1">
                                  {participant.userName}
                                </Badge>
                                {participant.isHost && (
                                  <Badge variant="outline" className="border-[#A92FFA] text-[#A92FFA] px-1.5 py-0 text-xs">
                                    Host
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Reactions panel */}
              <div className="px-4 pb-2">
                <ReactionsPanel workshopId={workshopId} currentUserId={currentUserId} />
              </div>
            </div>

            {/* Sidebar */}
            {sidebarView && (
              <div className="w-80 lg:w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold">
                    {sidebarView === "participants" && "Participants"}
                    {sidebarView === "chat" && "Chat"}
                    {sidebarView === "more" && "More Tools"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarView(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  {sidebarView === "participants" && (
                    <ParticipantsPanel
                      workshopId={workshopId}
                      currentUserId={currentUserId}
                      currentUserRole={isHost ? "host" : "participant"}
                      participants={activeParticipants}
                      onRefresh={fetchParticipants}
                    />
                  )}
                  
                  {sidebarView === "chat" && (
                    <ChatPanel
                      workshopId={workshopId}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                    />
                  )}
                  
                  {sidebarView === "more" && (
                    <Tabs defaultValue="polls" className="h-full flex flex-col">
                      <TabsList className="w-full grid grid-cols-5 bg-gray-800 mx-4 mt-4">
                        <TabsTrigger value="polls" className="text-xs">
                          <BarChart3 className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="qa" className="text-xs">
                          <HelpCircle className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="files" className="text-xs">
                          <FileText className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="whiteboard" className="text-xs">
                          <Palette className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="breakout" className="text-xs">
                          <DoorOpen className="w-4 h-4" />
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="flex-1 overflow-hidden p-4">
                        <TabsContent value="polls" className="h-full m-0">
                          <PollsPanel
                            workshopId={workshopId}
                            currentUserId={currentUserId}
                            isHost={isHost}
                          />
                        </TabsContent>
                        
                        <TabsContent value="qa" className="h-full m-0">
                          <QuestionsPanel
                            workshopId={workshopId}
                            currentUserId={currentUserId}
                            isHost={isHost}
                          />
                        </TabsContent>
                        
                        <TabsContent value="files" className="h-full m-0">
                          <FilesPanel
                            workshopId={workshopId}
                            currentUserId={currentUserId}
                            isHost={isHost}
                          />
                        </TabsContent>
                        
                        <TabsContent value="whiteboard" className="h-full m-0">
                          <WhiteboardCanvas
                            workshopId={parseInt(workshopId)}
                            userId={currentUserId}
                            isHost={isHost}
                          />
                        </TabsContent>
                        
                        <TabsContent value="breakout" className="h-full m-0">
                          <BreakoutRooms
                            workshopId={parseInt(workshopId)}
                            userId={currentUserId}
                            isHost={isHost}
                            participants={activeParticipants}
                          />
                        </TabsContent>
                      </div>
                    </Tabs>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Control Bar with Device Selection */}
      {hasJoined && (
        <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 px-4 py-4 flex-shrink-0">
          <div className="container mx-auto flex items-center justify-between">
            {/* Left - Meeting info */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="hidden md:inline">{new Date().toLocaleTimeString()}</span>
            </div>
            
            {/* Center - Main controls with device selection */}
            <div className="flex items-center gap-2">
              {/* Microphone with device selection */}
              <DropdownMenu>
                <div className="relative group">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleMute}
                    className="rounded-full w-14 h-14"
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="center" className="w-64 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Microphone Settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {availableDevices.audioInputs.length > 0 ? (
                    <>
                      <div className="px-2 py-1 text-xs text-gray-400">Select Microphone:</div>
                      {availableDevices.audioInputs.map((device) => (
                        <DropdownMenuItem
                          key={device.deviceId}
                          onClick={() => switchAudioInput(device.deviceId)}
                          className={`cursor-pointer ${
                            selectedAudioInput === device.deviceId 
                              ? 'bg-[#A92FFA]/20 text-[#A92FFA]' 
                              : ''
                          }`}
                        >
                          {selectedAudioInput === device.deviceId && (
                            <CircleCheck className="w-4 h-4 mr-2" />
                          )}
                          <span className="flex-1 truncate">
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      No microphones detected
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Video with device selection */}
              <DropdownMenu>
                <div className="relative group">
                  <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleVideo}
                    className="rounded-full w-14 h-14"
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
                  </Button>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="center" className="w-64 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <VideoIcon className="w-4 h-4" />
                    Camera Settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {availableDevices.videoInputs.length > 0 ? (
                    <>
                      <div className="px-2 py-1 text-xs text-gray-400">Select Camera:</div>
                      {availableDevices.videoInputs.map((device) => (
                        <DropdownMenuItem
                          key={device.deviceId}
                          onClick={() => switchVideoInput(device.deviceId)}
                          className={`cursor-pointer ${
                            selectedVideoInput === device.deviceId 
                              ? 'bg-[#A92FFA]/20 text-[#A92FFA]' 
                              : ''
                          }`}
                        >
                          {selectedVideoInput === device.deviceId && (
                            <CircleCheck className="w-4 h-4 mr-2" />
                          )}
                          <span className="flex-1 truncate">
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      No cameras detected
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Screen Share - Permission-based */}
              {!guestUser && permissions.can('screen', 'share') ? (
                <PermissionTooltip
                  resource="screen"
                  action="share"
                  currentRole={currentParticipant?.role}
                  disabled={false}
                >
                  <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="lg"
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    className="rounded-full w-14 h-14"
                  >
                    {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
                  </Button>
                </PermissionTooltip>
              ) : !guestUser ? (
                <PermissionTooltip
                  resource="screen"
                  action="share"
                  currentRole={currentParticipant?.role}
                  disabled={true}
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    className="rounded-full w-14 h-14 opacity-50"
                  >
                    <MonitorUp className="w-6 h-6" />
                  </Button>
                </PermissionTooltip>
              ) : null}
              
              {/* Participants */}
              <Button
                variant={sidebarView === "participants" ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidebarView(sidebarView === "participants" ? null : "participants")}
                className="rounded-full w-14 h-14 relative"
              >
                <Users className="w-6 h-6" />
                {activeParticipants.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#A92FFA] text-white text-xs">
                    {activeParticipants.length}
                  </Badge>
                )}
              </Button>
              
              {/* Chat */}
              <Button
                variant={sidebarView === "chat" ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidebarView(sidebarView === "chat" ? null : "chat")}
                className="rounded-full w-14 h-14"
              >
                <MessageSquare className="w-6 h-6" />
              </Button>
              
              {/* Raise Hand (for non-management roles and guests) */}
              {(guestUser || !permissions.canManageParticipants) && (
                <Button
                  variant={hasHandRaised ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleHandRaise}
                  className="rounded-full w-14 h-14"
                  title="Raise hand to get attention"
                >
                  <HandIcon className="w-6 h-6" />
                </Button>
              )}
              
              {/* Role Management - Only for those who can assign roles (not guests) */}
              {!guestUser && permissions.canAssignRoles && (
                <PermissionTooltip
                  resource="roles"
                  action="assign"
                  currentRole={currentParticipant?.role}
                  disabled={false}
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowRoleManagement(true)}
                    className="rounded-full w-14 h-14"
                    title="Manage Participant Roles"
                  >
                    <UserCog className="w-6 h-6" />
                  </Button>
                </PermissionTooltip>
              )}
              
              {/* More */}
              <Button
                variant={sidebarView === "more" ? "default" : "secondary"}
                size="lg"
                onClick={() => setSidebarView(sidebarView === "more" ? null : "more")}
                className="rounded-full w-14 h-14"
              >
                <MoreVertical className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Right - Leave/End button with permission-based options */}
            <div>
              {!guestUser && permissions.canEndSession ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="destructive" size="lg" className="rounded-full px-6">
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-gray-800 border-gray-700">
                    <DropdownMenuItem onClick={handleLeaveWorkshop}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Meeting
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLeaveWorkshop}
                      className="text-red-500"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      End for Everyone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="destructive" 
                  size="lg" 
                  onClick={handleLeaveWorkshop}
                  className="rounded-full px-6"
                  disabled={isLeaving}
                >
                  {isLeaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <PhoneOff className="w-5 h-5 mr-2" />
                  )}
                  Leave
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Management Dialog */}
      {!guestUser && (
        <RoleManagementDialog
          open={showRoleManagement}
          onOpenChange={setShowRoleManagement}
          participants={activeParticipants}
          currentUserId={currentUserId}
          currentUserRole={currentParticipant?.role || "participant"}
          workshopId={workshopId}
          onRoleUpdate={fetchParticipants}
        />
      )}

      {/* Enhanced Settings Modal with Device Selection */}
      {!guestUser && (
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Workshop Settings</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure your workshop preferences and permissions
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="audio" className="w-full">
              <TabsList className={`grid ${permissions.canManageParticipants ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-800`}>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
                {permissions.canManageParticipants && <TabsTrigger value="host">Host</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="audio" className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4" />
                    Microphone
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
                    value={selectedAudioInput}
                    onChange={(e) => switchAudioInput(e.target.value)}
                  >
                    {availableDevices.audioInputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {availableDevices.audioInputs.length} microphone(s) detected
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4" />
                    Speaker/Output
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
                    value={selectedAudioOutput}
                    onChange={(e) => {
                      setSelectedAudioOutput(e.target.value);
                      console.log('Speaker selection updated');
                    }}
                  >
                    {availableDevices.audioOutputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {availableDevices.audioOutputs.length} speaker(s) detected
                  </p>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <p className="text-xs text-blue-200">
                    💡 Tip: Click the chevron above the mic/camera buttons for quick device switching
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="video" className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <VideoIcon className="w-4 h-4" />
                    Camera
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
                    value={selectedVideoInput}
                    onChange={(e) => switchVideoInput(e.target.value)}
                  >
                    {availableDevices.videoInputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {availableDevices.videoInputs.length} camera(s) detected
                  </p>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <p className="text-xs text-blue-200">
                    💡 Tip: You can switch cameras during the session without disconnecting
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show participant names</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable reactions</span>
                  <input type="checkbox" defaultChecked />
                </div>
                {currentParticipant && (
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm font-medium mb-2">Your Role & Permissions</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getRoleConfig(currentParticipant.role).color}>
                        {getRoleConfig(currentParticipant.role).displayName}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Level {getRoleConfig(currentParticipant.role).level}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Present', value: permissions.canPresent },
                        { label: 'Moderate', value: permissions.canModerate },
                        { label: 'Manage Roles', value: permissions.canAssignRoles },
                        { label: 'Record', value: permissions.canRecord },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1">
                          {item.value ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                          <span className="text-gray-400">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {permissions.canManageParticipants && (
                <TabsContent value="host" className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                    <div>
                      <div className="font-medium">Lock Meeting</div>
                      <div className="text-sm text-gray-400">Prevent new participants from joining</div>
                    </div>
                    <Button
                      variant={isLocked ? "default" : "outline"}
                      size="sm"
                      onClick={toggleLock}
                      disabled={!permissions.canLockSession}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                    <div>
                      <div className="font-medium">Mute All</div>
                      <div className="text-sm text-gray-400">Mute all participants</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MicOff className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {permissions.canRecord && (
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                      <div>
                        <div className="font-medium">Recording</div>
                        <div className="text-sm text-gray-400">Start/stop session recording</div>
                      </div>
                      <Button 
                        variant={isRecording ? "destructive" : "outline"} 
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? 'Stop' : 'Start'} Recording
                      </Button>
                    </div>
                  )}
                  
                  <div className="p-3 bg-[#A92FFA]/10 border border-[#A92FFA]/20 rounded-md">
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Your Role:</strong> {getRoleConfig(currentParticipant?.role || 'participant').displayName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getRoleConfig(currentParticipant?.role || 'participant').description}
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}