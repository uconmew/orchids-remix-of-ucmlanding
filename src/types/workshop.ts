/**
 * Workshop System Type Definitions
 * Comprehensive types for the interactive workshop platform
 */

// Workshop Roles & Permissions
export type WorkshopRole = 
  | 'host'           // Full control - creator of workshop
  | 'co-host'        // Near-full control - assigned by host
  | 'facilitator'    // Can present, moderate, manage breakouts
  | 'moderator'      // Can mute, manage chat, answer questions
  | 'presenter'      // Can share screen, present
  | 'participant';   // Basic engagement only

export interface WorkshopPermissions {
  // Participant Management
  canMuteParticipants: boolean;
  canRemoveParticipants: boolean;
  canAssignRoles: boolean;
  canAdmitFromWaitingRoom: boolean;
  
  // Content & Presentation
  canShareScreen: boolean;
  canShareVideo: boolean;
  canUseWhiteboard: boolean;
  canUploadFiles: boolean;
  
  // Session Control
  canStartRecording: boolean;
  canEndMeeting: boolean;
  canLockMeeting: boolean;
  canCreateBreakoutRooms: boolean;
  canBroadcastMessage: boolean;
  
  // Interaction
  canCreatePolls: boolean;
  canManageChat: boolean;
  canAnswerQuestions: boolean;
  canSpotlight: boolean;
  
  // Settings
  canChangeSettings: boolean;
  canViewReports: boolean;
}

// Participant Status & Info
export interface WorkshopParticipant {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  userEmail?: string;
  peerId: string | null;
  
  // Role & Status
  role: WorkshopRole;
  isHost: boolean;
  status: 'active' | 'waiting' | 'left';
  
  // Media Status
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpotlighted: boolean;
  
  // Engagement
  hasHandRaised: boolean;
  lastActivity: string;
  joinedAt: string;
  leftAt: string | null;
  
  // Network Info
  connectionQuality?: 'excellent' | 'good' | 'poor';
  bandwidth?: number;
}

// Workshop Settings
export interface WorkshopSettings {
  // General
  allowParticipantsToUnmute: boolean;
  allowParticipantsToShareScreen: boolean;
  allowParticipantsToRename: boolean;
  
  // Chat
  allowParticipantChat: boolean;
  allowPrivateChat: boolean;
  allowFileSharing: boolean;
  
  // Security
  requireWaitingRoom: boolean;
  requirePassword: boolean;
  lockAfterStart: boolean;
  onlyAuthenticatedUsers: boolean;
  
  // Recording
  autoRecording: boolean;
  recordingConsent: boolean;
  
  // Reactions
  allowReactions: boolean;
  allowHandRaise: boolean;
  
  // Breakout Rooms
  autoAssignBreakoutRooms: boolean;
  allowParticipantsToChooseRoom: boolean;
}

// Video Layout Options
export type VideoLayout = 
  | 'gallery'      // Grid view - all equal
  | 'speaker'      // Focus on active speaker
  | 'spotlight'    // Focus on pinned participant
  | 'sidebar';     // Main + sidebar thumbnails

// Screen Share State
export interface ScreenShare {
  participantId: number;
  participantName: string;
  streamId: string;
  startedAt: string;
  quality: 'high' | 'standard' | 'low';
}

// Reaction Types
export type ReactionType = 
  | 'applause'
  | 'thumbsup'
  | 'heart'
  | 'laugh'
  | 'surprised'
  | 'thinking'
  | 'celebrate'
  | 'pray';

// Chat Message Types
export interface ChatMessage {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  message: string;
  messageType: 'public' | 'private' | 'system';
  recipientId: string | null;
  recipientName?: string;
  mentions?: string[];
  attachments?: ChatAttachment[];
  reactions?: { [emoji: string]: string[] };
  sentAt: string;
  editedAt?: string;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

// Poll Types
export interface Poll {
  id: number;
  workshopId: number;
  question: string;
  options: PollOption[];
  allowMultipleAnswers: boolean;
  isAnonymous: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  endsAt: string | null;
  isActive: boolean;
  totalVotes: number;
}

export interface PollOption {
  index: number;
  text: string;
  votes: number;
  percentage: number;
  voters?: string[];
}

// Q&A Types
export interface Question {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  question: string;
  upvotes: number;
  upvotedBy: string[];
  isAnswered: boolean;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: string;
  askedAt: string;
}

// Breakout Room Types
export interface BreakoutRoom {
  id: number;
  workshopId: number;
  roomName: string;
  roomNumber: number;
  maxParticipants: number | null;
  status: 'active' | 'closed';
  participants: BreakoutParticipant[];
  createdAt: string;
  closedAt?: string;
}

export interface BreakoutParticipant {
  userId: string;
  userName: string;
  joinedAt: string;
  leftAt?: string;
}

// Recording Types
export interface Recording {
  id: number;
  workshopId: number;
  recordingUrl: string;
  duration: number;
  fileSize: number;
  transcriptUrl?: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
}

// Waiting Room Types
export interface WaitingParticipant {
  userId: string;
  userName: string;
  userEmail?: string;
  joinedWaitingRoomAt: string;
  requestMessage?: string;
}

// Analytics Types
export interface WorkshopAnalytics {
  workshopId: number;
  totalParticipants: number;
  peakParticipants: number;
  averageParticipants: number;
  totalDuration: number;
  
  // Engagement
  chatMessages: number;
  questionsAsked: number;
  pollsCreated: number;
  reactionsGiven: number;
  
  // Attendance
  attendanceRate: number;
  averageStayDuration: number;
  
  // Technical
  averageConnectionQuality: number;
  disconnections: number;
  
  // Recording
  recordingDuration?: number;
  recordingSize?: number;
}

// Network Quality
export interface NetworkQuality {
  participantId: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  bandwidth: number;
  latency: number;
  packetLoss: number;
  timestamp: string;
}

// Workshop Event Types (for real-time updates)
export type WorkshopEvent = 
  | { type: 'participant_joined'; data: WorkshopParticipant }
  | { type: 'participant_left'; data: { participantId: number } }
  | { type: 'participant_muted'; data: { participantId: number; isMuted: boolean } }
  | { type: 'participant_video_toggled'; data: { participantId: number; isVideoOff: boolean } }
  | { type: 'screen_share_started'; data: ScreenShare }
  | { type: 'screen_share_stopped'; data: { participantId: number } }
  | { type: 'hand_raised'; data: { participantId: number; raised: boolean } }
  | { type: 'role_changed'; data: { participantId: number; newRole: WorkshopRole } }
  | { type: 'chat_message'; data: ChatMessage }
  | { type: 'reaction'; data: { participantId: number; reaction: ReactionType } }
  | { type: 'poll_created'; data: Poll }
  | { type: 'poll_ended'; data: { pollId: number } }
  | { type: 'question_asked'; data: Question }
  | { type: 'question_answered'; data: { questionId: number } }
  | { type: 'recording_started'; data: { recordingId: number } }
  | { type: 'recording_stopped'; data: { recordingId: number } }
  | { type: 'breakout_rooms_opened'; data: { rooms: BreakoutRoom[] } }
  | { type: 'breakout_rooms_closed'; data: {} }
  | { type: 'meeting_locked'; data: { locked: boolean } }
  | { type: 'meeting_ending'; data: { endingIn: number } }
  | { type: 'settings_changed'; data: Partial<WorkshopSettings> };

// API Response Types
export interface WorkshopResponse {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

export interface ParticipantActionResponse {
  success: boolean;
  participant?: WorkshopParticipant;
  error?: string;
}
