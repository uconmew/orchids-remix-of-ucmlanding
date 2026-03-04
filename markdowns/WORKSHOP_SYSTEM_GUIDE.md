# UCON Workshop System - Complete Guide

## 🎯 Overview

The UCON Workshop System is a comprehensive Zoom-like video conferencing platform designed specifically for ministry workshops, featuring role-based access control, interactive tools, and collaborative features.

## 🎨 UI Design

### **Modern Dark Theme Interface**
- **Color Scheme**: Dark gray backgrounds (#gray-900, #gray-950) with purple (#A92FFA) and orange (#F28C28) accents
- **Layout**: Professional 3-panel layout (Video | Sidebar | Controls)
- **Responsive**: Optimized for desktop, tablet, and mobile devices

### **Key UI Components**

1. **Pre-Join Screen** (`PreJoinScreen.tsx`)
   - Live video/audio preview before joining
   - Device settings (camera/mic toggles)
   - Workshop details and guidelines
   - Professional welcome interface

2. **Video Grid** (`VideoGrid.tsx`)
   - Multiple view layouts: Grid, Spotlight, Sidebar
   - Participant cards with overlays
   - Role badges and status indicators
   - Screen sharing support
   - Hand-raise visual indicators

3. **Sidebar Panel** (`WorkshopSidebar.tsx`)
   - 6 main tabs: Chat, Participants, Polls, Q&A, Files, More
   - Collapsible design
   - Real-time updates
   - Context-aware tools

4. **Control Toolbar** (`WorkshopToolbar.tsx`)
   - Bottom-fixed control bar
   - Large circular buttons (Zoom-style)
   - Tooltips for all controls
   - Participant count display
   - Host badge indicators

## 👥 Role-Based Access Control (RBAC)

### **Role Hierarchy** (Highest to Lowest)

1. **Host** 🟡
   - Full control over workshop
   - Can end meeting for everyone
   - Assign all roles
   - Manage all features

2. **Co-Host** 🔵
   - Nearly full permissions
   - Cannot end meeting for all
   - Can manage participants and content
   - Backup host capabilities

3. **Facilitator** 🟣
   - Lead discussions and activities
   - Manage breakout rooms
   - Control polls and whiteboard
   - Limited participant management

4. **Moderator** 🟢
   - Chat and Q&A moderation
   - Can mute/remove disruptive users
   - Cannot manage content tools
   - Focus on participant behavior

5. **Presenter** 🟠
   - Content sharing permissions
   - Screen share and whiteboard
   - Manage polls
   - Limited participant control

6. **Participant** ⚪
   - Basic viewing and interaction
   - Can chat and raise hand
   - Cannot manage others
   - Standard attendee role

### **Permission Matrix**

| Feature | Host | Co-Host | Facilitator | Moderator | Presenter | Participant |
|---------|------|---------|-------------|-----------|-----------|-------------|
| Mute Participants | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Remove Participants | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Screen Share | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Record Session | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Polls | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Manage Breakout Rooms | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Whiteboard Access | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Upload Files | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Moderate Chat | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| End Meeting | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 🚀 Features

### **Core Video Features**
- ✅ Real-time video streaming (webcam)
- ✅ Audio controls (mute/unmute)
- ✅ Video controls (on/off)
- ✅ Screen sharing (host/presenters)
- ✅ Multiple view layouts (grid/spotlight)
- ✅ Picture-in-picture thumbnails

### **Communication Tools**
- ✅ **Live Chat**: Public and private messaging
- ✅ **Q&A Panel**: Question submission with upvoting
- ✅ **Polls**: Create and vote on polls in real-time
- ✅ **Reactions**: Emoji reactions and hand-raise
- ✅ **Participants List**: Real-time attendee roster

### **Collaboration Features**
- ✅ **Whiteboard**: Collaborative drawing canvas
- ✅ **Breakout Rooms**: Small group discussions
- ✅ **File Sharing**: Upload and share documents
- ✅ **Video Playback**: Synchronized video watching
- ✅ **Recording**: Session recording (host only)

### **Workshop Management**
- ✅ **Role Assignment**: Dynamic role changes during session
- ✅ **Participant Controls**: Mute, remove, assign roles
- ✅ **Session Lock**: Prevent new participants from joining
- ✅ **Hand Raise**: Participants can signal to speak
- ✅ **Waiting Room**: Participants wait for approval (future)

## 📋 How to Use

### **For Hosts**

1. **Starting a Workshop**
   - Navigate to `/workshops/[id]/live`
   - Adjust camera/mic settings on pre-join screen
   - Click "Join Workshop"
   - Workshop automatically goes LIVE

2. **Managing Participants**
   - Open Participants panel from sidebar
   - Click ⋮ menu on any participant
   - Mute, change role, or remove participants
   - Assign co-hosts for help managing

3. **Using Tools**
   - **Screen Share**: Click monitor icon in toolbar
   - **Breakout Rooms**: More tab → Breakout → Create rooms
   - **Polls**: Polls tab → Create new poll
   - **Recording**: More tab → Recording → Start recording

4. **Ending Workshop**
   - Click "Leave" dropdown
   - Choose "Leave Meeting" (you leave, others stay)
   - Or "End for Everyone" (closes workshop completely)

### **For Participants**

1. **Joining a Workshop**
   - Must be registered first (register from workshop page)
   - Enter pre-join screen
   - Test camera/mic
   - Click "Join Workshop"

2. **Participating**
   - Use toolbar to control mic/camera
   - Chat with everyone via Chat tab
   - Raise hand to get attention
   - Ask questions in Q&A tab
   - Respond to polls

3. **Breakout Rooms**
   - When assigned, you'll see available rooms
   - Click "Join Room" to enter
   - Return to main room when done

## 🔧 Technical Architecture

### **Components Structure**
```
src/app/workshops/[id]/live/
  └── page.tsx (Main workshop page)

src/components/workshops/
  ├── PreJoinScreen.tsx       # Pre-join interface
  ├── VideoGrid.tsx            # Video layout engine
  ├── WorkshopSidebar.tsx      # Right sidebar with tabs
  ├── WorkshopToolbar.tsx      # Bottom control bar
  ├── ChatPanel.tsx            # Live chat
  ├── ParticipantsPanel.tsx    # Participant management
  ├── PollsPanel.tsx           # Polling system
  ├── QuestionsPanel.tsx       # Q&A system
  ├── FilesPanel.tsx           # File sharing
  ├── ReactionsPanel.tsx       # Emoji reactions
  ├── WhiteboardCanvas.tsx     # Collaborative whiteboard
  ├── BreakoutRooms.tsx        # Breakout room manager
  ├── VideoPlayer.tsx          # Synchronized video playback
  └── RecordingControls.tsx    # Recording management
```

### **API Endpoints**

All workshop APIs are located at `/api/workshops/[id]/`:

#### **Participant Management**
- `POST /api/workshops/[id]/participants` - Join workshop
- `GET /api/workshops/[id]/participants` - List participants
- `DELETE /api/workshops/[id]/participants` - Leave workshop
- `POST /api/workshops/[id]/participants/[participantId]/mute` - Mute participant
- `PUT /api/workshops/[id]/participants/[participantId]/role` - Change role
- `DELETE /api/workshops/[id]/participants/[participantId]` - Remove participant

#### **Communication**
- `GET /api/workshops/[id]/chat` - Get chat messages
- `POST /api/workshops/[id]/chat` - Send message
- `GET /api/workshops/[id]/questions` - Get Q&A questions
- `POST /api/workshops/[id]/questions` - Submit question
- `POST /api/workshops/[id]/questions/[questionId]/upvote` - Upvote question
- `POST /api/workshops/[id]/reactions` - Send reaction

#### **Collaboration Tools**
- `GET /api/workshops/[id]/polls` - Get active polls
- `POST /api/workshops/[id]/polls` - Create poll
- `POST /api/workshops/[id]/polls/[pollId]/vote` - Vote on poll
- `GET /api/workshops/[id]/files` - List shared files
- `POST /api/workshops/[id]/files` - Upload file

#### **Breakout Rooms**
- `POST /api/workshops/[id]/breakout-rooms` - Create rooms
- `GET /api/workshops/[id]/breakout-rooms` - List rooms
- `POST /api/workshops/[id]/breakout-rooms/assign` - Auto-assign participants
- `POST /api/workshops/[id]/breakout-rooms/[roomId]/join` - Join room
- `POST /api/workshops/[id]/breakout-rooms/[roomId]/leave` - Leave room

#### **Recording & Media**
- `POST /api/workshops/[id]/recordings/start` - Start recording
- `POST /api/workshops/[id]/recordings/[recordingId]/stop` - Stop recording
- `GET /api/workshops/[id]/recordings` - List recordings
- `POST /api/workshops/[id]/videos` - Upload video
- `POST /api/workshops/[id]/videos/[videoId]/sync` - Sync video playback

#### **Whiteboard**
- `GET /api/workshops/[id]/whiteboard` - Get whiteboard content
- `POST /api/workshops/[id]/whiteboard/stroke` - Add drawing stroke
- `POST /api/workshops/[id]/whiteboard/shape` - Add shape

## 🎮 Controls Reference

### **Keyboard Shortcuts**
- `Space` - Toggle mute/unmute (hold to talk)
- `V` - Toggle video on/off
- `H` - Raise/lower hand
- `C` - Open/close chat
- `P` - Open participants
- `F` - Toggle fullscreen
- `S` - Start/stop screen share (host only)

### **Toolbar Buttons**

**🎤 Microphone** (Red = Muted, Gray = Unmuted)
- Click to toggle mute
- Hold Space to temporarily unmute

**📹 Video** (Red = Off, Gray = On)
- Click to toggle camera
- Shows avatar when off

**🖥️ Screen Share** (Blue = Active, Gray = Inactive) *Host/Presenters Only*
- Share your entire screen
- Automatically stops when window closed

**💬 Chat** (Purple = Active, Gray = Inactive)
- Opens/closes right sidebar
- Shows unread message count

**⋯ More Options**
- Raise hand
- Settings
- Fullscreen
- Advanced features

**📞 Leave** (Red)
- Host: Can leave or end for everyone
- Others: Leave meeting

## 🔐 Security & Privacy

### **Access Controls**
- ✅ Authentication required (better-auth)
- ✅ Registration required before joining
- ✅ Role-based permissions enforced server-side
- ✅ Session validation on all API calls
- ✅ Bearer token authentication

### **Data Protection**
- ✅ All API calls use authorization headers
- ✅ User actions logged with timestamps
- ✅ Participant data encrypted in transit
- ✅ Recording consent required

## 📊 Real-Time Features

### **Live Updates** (Polling every 3 seconds)
- Participant list refreshes
- Chat messages update
- Poll results update
- Q&A questions refresh
- Breakout room assignments sync

### **State Management**
- Local state for UI controls
- Server-side state for participants
- Optimistic updates for better UX
- Automatic reconnection handling

## 🎓 Workshop Flow

### **1. Pre-Workshop**
```
User registers → Receives confirmation → Gets calendar invite
```

### **2. Joining**
```
Navigate to /workshops/[id]/live →
Pre-join screen (test devices) →
Click "Join" →
Enter main workshop →
Start participating
```

### **3. During Workshop**
```
Host starts session →
Participants join →
Host assigns roles as needed →
Use collaboration tools →
Breakout rooms for small groups →
Return to main session →
Q&A and polls →
Host ends session
```

### **4. Post-Workshop**
```
View recordings →
Access shared files →
Review chat transcripts →
Download resources
```

## 🛠️ Advanced Features

### **Breakout Rooms**
```typescript
// Host creates rooms
1. Navigate to "More" tab → "Breakout Rooms"
2. Set number of rooms (2-20)
3. Click "Create Rooms"
4. Auto-assign or manually assign participants
5. Participants receive notification
6. Monitor room activity
7. Close all rooms to return everyone
```

### **Polls**
```typescript
// Create a poll
1. Navigate to "Polls" tab
2. Click "Create Poll"
3. Enter question and options
4. Set duration (optional)
5. Launch poll
6. View results in real-time
7. Share results with participants
```

### **Whiteboard**
```typescript
// Collaborative whiteboard
1. Navigate to "More" tab → "Whiteboard"
2. Draw using mouse/stylus
3. Add shapes and text
4. All participants see updates
5. Export whiteboard when done
```

### **Video Playback**
```typescript
// Synchronized video watching
1. Navigate to "More" tab → "Video"
2. Upload video file or paste URL
3. Click "Play" to sync for all
4. Everyone watches together
5. Host controls playback
```

## 📱 Mobile Considerations

### **Responsive Design**
- Stacked layout on mobile (<768px)
- Touch-friendly 56px button targets
- Simplified toolbar on small screens
- Swipeable sidebar panels

### **Mobile-Specific Features**
- Tap to toggle mic/video
- Swipe to open/close sidebar
- Picture-in-picture support
- Auto-rotate handling

## 🎯 Best Practices

### **For Hosts**
1. ✅ **Test before session**: Join 10 minutes early to test everything
2. ✅ **Assign co-host**: Have backup in case of technical issues
3. ✅ **Use waiting room**: Review participants before admitting
4. ✅ **Record important sessions**: Keep records of key workshops
5. ✅ **Prepare polls**: Create polls in advance for efficiency
6. ✅ **Use breakout rooms**: Small groups encourage participation
7. ✅ **Monitor chat**: Assign moderator to manage questions

### **For Participants**
1. ✅ **Test devices**: Use pre-join screen to verify camera/mic
2. ✅ **Stable connection**: Use wired internet when possible
3. ✅ **Mute when not speaking**: Reduce background noise
4. ✅ **Use chat appropriately**: Keep messages relevant
5. ✅ **Raise hand to speak**: Wait to be called on
6. ✅ **Participate actively**: Respond to polls and Q&A

## 🔄 State Management

### **Workshop States**
- `scheduled` - Workshop created, not started
- `live` - Currently active
- `ended` - Completed
- `cancelled` - Cancelled by host

### **Participant States**
- `waiting` - In waiting room (future feature)
- `active` - In main session
- `left` - Has left workshop

## 🚨 Troubleshooting

### **Common Issues**

**Camera/Mic not working**
- Grant browser permissions
- Check device settings
- Try different browser
- Refresh and rejoin

**Can't join workshop**
- Verify registration
- Check workshop is live
- Confirm authentication
- Clear browser cache

**Poor video quality**
- Check internet connection
- Close other applications
- Reduce video quality in settings
- Turn off camera to save bandwidth

**Permission errors**
- Verify your role assignment
- Contact workshop host
- Check API logs
- Re-authenticate if needed

## 📊 Analytics & Reporting

### **Available Metrics** (Host View)
- Total participants over time
- Average attendance duration
- Engagement metrics (chat, polls, Q&A)
- Breakout room participation
- Question/answer ratios
- Recording views

### **Export Options**
- Chat transcripts (CSV/JSON)
- Poll results (Excel)
- Participant list with roles
- Recording files (MP4)
- Attendance reports

## 🔮 Future Enhancements

### **Planned Features**
- 🔄 Waiting room with host approval
- 🔄 AI-powered transcription
- 🔄 Automated closed captions
- 🔄 Virtual backgrounds
- 🔄 Noise suppression
- 🔄 Beauty filters
- 🔄 Gesture recognition
- 🔄 Language translation
- 🔄 Integration with calendar
- 🔄 Post-workshop surveys

## 📞 Support

### **Getting Help**
- **Documentation**: This guide
- **Technical Support**: support@uconministries.org
- **Workshop Issues**: Contact your workshop host
- **Bug Reports**: File issue in admin panel

## 🎉 Success Tips

### **Hosting Engaging Workshops**
1. 📌 Start on time
2. 📌 Welcome participants warmly
3. 📌 Set clear expectations
4. 📌 Use interactive features (polls, Q&A)
5. 📌 Take breaks for longer sessions
6. 📌 Encourage camera-on participation
7. 📌 Follow up with recordings and resources

### **Building Community**
- Use breakout rooms for connection
- Create polls to gauge understanding
- Encourage questions and discussion
- Celebrate milestones and progress
- Share resources after sessions

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Maintained By**: UCON Ministries Development Team
