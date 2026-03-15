# Workshop Live Environment - Complete Implementation Guide

## 🎯 Overview

This document describes the complete workshop environment with waiting rooms, live video cameras, breakout rooms, and role-based UIs for participants and hosts.

## 🏗️ Architecture

### Components

1. **Waiting Room** - Pre-join space with media preview
2. **Main Workshop Room** - Live session with video grid
3. **Breakout Rooms** - Small group discussions
4. **Video System** - PeerJS-based real-time video/audio
5. **Role-Based UI** - Different interfaces for hosts, presenters, and participants

### Tech Stack

- **PeerJS** - Peer-to-peer video/audio streaming
- **WebRTC** - Real-time communications
- **React** - UI framework
- **Better Auth** - Authentication
- **SQLite** - Database

## 📋 Features Implemented

### ✅ Waiting Room
- [x] Media preview (camera/microphone test)
- [x] Device selection (audio input, video input, audio output)
- [x] Audio level visualization
- [x] Permission checks and error handling
- [x] Host presence detection
- [x] Live participant count in waiting room
- [x] Automatic entry when host joins

### ✅ Main Workshop Room
- [x] Grid/Spotlight/Sidebar video layouts
- [x] Real-time video streaming between participants
- [x] Mute/unmute audio controls
- [x] Enable/disable video controls
- [x] Screen sharing
- [x] Hand raise feature
- [x] Chat panel
- [x] Participants list
- [x] Polls and Q&A
- [x] File sharing
- [x] Reactions
- [x] Whiteboard
- [x] Session recording
- [x] Live stats (participants, duration, quality)

### ✅ Breakout Rooms
- [x] Create breakout rooms
- [x] Assign participants automatically or manually
- [x] Move between rooms
- [x] Host can broadcast to all rooms
- [x] Time limits
- [x] Return to main room

### ✅ Role-Based Access Control
- [x] **Host** - Full control over workshop
- [x] **Co-Host** - Help manage workshop
- [x] **Presenter** - Share screen, manage content
- [x] **Moderator** - Manage participants, chat
- [x] **Participant** - Basic viewing and interaction
- [x] **Guest** - Limited viewing rights

### ✅ Video System
- [x] PeerJS peer-to-peer connections
- [x] Automatic reconnection
- [x] Quality adaptation
- [x] Background pause (stops video when tab is inactive)
- [x] Multi-device support (open in multiple tabs)
- [x] Device switching mid-session

## 🎥 Video Streaming Flow

### 1. Join Workshop
```
User clicks "Join" 
  → Initialize media (camera/mic)
  → Create PeerJS peer instance
  → Add participant to database
  → Fetch existing participants
  → Connect to each participant
```

### 2. Peer-to-Peer Connection
```
Participant A                    Participant B
    |                                 |
    |-- createPeer() ---------------->|
    |                                 |
    |<--- call.answer(stream) --------|
    |                                 |
    |-- stream event --------------->|
    |                                 |
    |<--- addRemoteStream() ----------|
```

### 3. Participant Leaves
```
User clicks "Leave"
  → Stop local media tracks
  → Close all peer connections
  → Remove participant from database
  → Notify other participants
```

## 🎨 UI Layouts

### Grid View (default)
- All participants displayed in equal-sized tiles
- Automatically adjusts grid size (2x2, 3x3, 4x4)
- Self-view in bottom-right corner

### Spotlight View
- One large video (active speaker or presenter)
- Thumbnails of other participants below
- Automatic speaker detection

### Sidebar View
- Main video on left
- Chat/participants panel on right
- Collapsible sidebar

## 🔐 Access Control Matrix

| Feature                  | Guest | Participant | Moderator | Presenter | Co-Host | Host |
|-------------------------|-------|-------------|-----------|-----------|---------|------|
| View video              | ✅    | ✅          | ✅        | ✅        | ✅      | ✅   |
| Share video             | ❌    | ✅          | ✅        | ✅        | ✅      | ✅   |
| Share audio             | ❌    | ✅          | ✅        | ✅        | ✅      | ✅   |
| Chat                    | ❌    | ✅          | ✅        | ✅        | ✅      | ✅   |
| Raise hand              | ❌    | ✅          | ✅        | ✅        | ✅      | ✅   |
| Screen share            | ❌    | ❌          | ❌        | ✅        | ✅      | ✅   |
| Manage participants     | ❌    | ❌          | ✅        | ❌        | ✅      | ✅   |
| Create polls            | ❌    | ❌          | ✅        | ✅        | ✅      | ✅   |
| Create breakout rooms   | ❌    | ❌          | ❌        | ❌        | ✅      | ✅   |
| Record session          | ❌    | ❌          | ❌        | ❌        | ✅      | ✅   |
| Lock meeting            | ❌    | ❌          | ❌        | ❌        | ✅      | ✅   |
| End for all             | ❌    | ❌          | ❌        | ❌        | ❌      | ✅   |

## 📱 Navigation

### From Main Website
```
Homepage → Workshops Page → Workshop Details → Join Live
```

### During Workshop
```
Workshop Room (Main)
  ├── Chat (sidebar)
  ├── Participants (sidebar)
  ├── Polls (sidebar)
  ├── Q&A (sidebar)
  ├── Files (sidebar)
  ├── Whiteboard (full screen)
  ├── Breakout Rooms (separate rooms)
  └── Back to Website (header link)
```

### Header Links (Always Visible)
- Back to Workshop Details
- Back to Workshops List
- Back to Homepage

## 🚀 Quick Start Guide

### For Hosts

1. **Create Workshop**
   - Go to Admin Dashboard → Workshops
   - Click "Create Workshop"
   - Fill in details (title, description, date/time)
   - Set to "Live" status

2. **Start Workshop**
   - Navigate to workshop details
   - Click "Start Workshop"
   - Allow camera/microphone permissions
   - Click "Join Workshop"

3. **Manage Session**
   - Admit participants from waiting room
   - Create breakout rooms if needed
   - Share screen for presentations
   - Launch polls and Q&A
   - Monitor chat and participants

### For Participants

1. **Join Workshop**
   - Navigate to workshop from email/calendar
   - Click "Join Live"
   - Allow camera/microphone permissions
   - Test audio/video in preview
   - Click "Join Workshop"

2. **Wait for Host**
   - If host not present, enter waiting room
   - See live countdown and participant count
   - Automatically admitted when host joins

3. **Participate**
   - Mute/unmute as needed
   - Share video optionally
   - Use chat to communicate
   - Raise hand to speak
   - Join breakout rooms when assigned

## 🔧 Configuration

### Workshop Settings (Admin)
```typescript
{
  requiresAuth: boolean,      // Require login
  allowGuests: boolean,        // Allow guest participants
  autoAdmit: boolean,          // Skip waiting room
  enableRecording: boolean,    // Allow session recording
  enableBreakout: boolean,     // Enable breakout rooms
  enableChat: boolean,         // Enable chat
  enablePolls: boolean,        // Enable polls
  enableWhiteboard: boolean,   // Enable whiteboard
  maxParticipants: number      // Maximum participants
}
```

### Media Constraints
```typescript
video: {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: "user"
}

audio: {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
}
```

## 🐛 Troubleshooting

### Video Not Working
1. Check browser permissions (camera/microphone)
2. Verify media devices are connected
3. Try different browser (Chrome recommended)
4. Check firewall/network settings
5. Refresh and rejoin

### Audio Issues
1. Check microphone selection in settings
2. Verify microphone is not muted in OS
3. Test audio level in preview
4. Check browser audio permissions
5. Try different audio device

### Connection Issues
1. Check internet connection
2. Try refreshing the page
3. Clear browser cache
4. Disable VPN temporarily
5. Contact support if persistent

## 🔜 Future Enhancements

- [ ] Virtual backgrounds
- [ ] Noise suppression AI
- [ ] Live transcription
- [ ] Language translation
- [ ] Reactions overlay on video
- [ ] Attendance tracking
- [ ] Post-session analytics
- [ ] Mobile app support
- [ ] Hardware webcam controls
- [ ] Custom layouts

## 📞 Support

For issues or questions:
- Email: support@uconministries.org
- Phone: 720.663.9243
- Documentation: /workshops/help
