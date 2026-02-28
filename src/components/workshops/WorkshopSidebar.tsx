"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  BarChart3,
  HelpCircle,
  FileText,
  MoreHorizontal,
  X,
  Palette,
  DoorOpen,
  Play,
  Circle
} from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { PollsPanel } from "./PollsPanel";
import { QuestionsPanel } from "./QuestionsPanel";
import { FilesPanel } from "./FilesPanel";
import WhiteboardCanvas from "./WhiteboardCanvas";
import BreakoutRooms from "./BreakoutRooms";
import VideoPlayer from "./VideoPlayer";
import RecordingControls from "./RecordingControls";

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
  joinedAt: string;
  leftAt: string | null;
}

type SidebarTab = "chat" | "participants" | "polls" | "qa" | "files" | "more";

interface WorkshopSidebarProps {
  workshopId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'host' | 'co-host' | 'facilitator' | 'moderator' | 'presenter' | 'participant';
  participants: Participant[];
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isHost: boolean;
  onClose: () => void;
  onRefreshParticipants: () => void;
}

export function WorkshopSidebar({
  workshopId,
  currentUserId,
  currentUserName,
  currentUserRole,
  participants,
  activeTab,
  onTabChange,
  isHost,
  onClose,
  onRefreshParticipants,
}: WorkshopSidebarProps) {
  return (
    <div className="fixed right-0 top-[57px] bottom-[89px] w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-40">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Workshop Tools</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as SidebarTab)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-6 bg-gray-800/50 rounded-none border-b border-gray-800 h-auto p-1">
          <TabsTrigger 
            value="chat" 
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px]">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="participants"
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px]">People</span>
          </TabsTrigger>
          <TabsTrigger 
            value="polls"
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px]">Polls</span>
          </TabsTrigger>
          <TabsTrigger 
            value="qa"
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px]">Q&A</span>
          </TabsTrigger>
          <TabsTrigger 
            value="files"
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Files</span>
          </TabsTrigger>
          <TabsTrigger 
            value="more"
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-[#A92FFA] data-[state=active]:text-white"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px]">More</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ChatPanel
              workshopId={workshopId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </TabsContent>

          <TabsContent value="participants" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ParticipantsPanel
              workshopId={workshopId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              participants={participants}
              onRefresh={onRefreshParticipants}
            />
          </TabsContent>

          <TabsContent value="polls" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <PollsPanel
              workshopId={workshopId}
              currentUserId={currentUserId}
              isHost={isHost}
            />
          </TabsContent>

          <TabsContent value="qa" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <QuestionsPanel
              workshopId={workshopId}
              currentUserId={currentUserId}
              isHost={isHost}
            />
          </TabsContent>

          <TabsContent value="files" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <FilesPanel
              workshopId={workshopId}
              currentUserId={currentUserId}
              isHost={isHost}
            />
          </TabsContent>

          <TabsContent value="more" className="h-full m-0 p-4 space-y-2 overflow-y-auto">
            <Card className="bg-gray-800 border-gray-700">
              <Tabs defaultValue="whiteboard" className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-gray-700/50">
                  <TabsTrigger value="whiteboard" className="text-xs">
                    <Palette className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="breakout" className="text-xs">
                    <DoorOpen className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="video" className="text-xs">
                    <Play className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="recording" className="text-xs">
                    <Circle className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>

                <div className="mt-2">
                  <TabsContent value="whiteboard" className="mt-0">
                    <WhiteboardCanvas
                      workshopId={parseInt(workshopId)}
                      userId={currentUserId}
                      isHost={isHost}
                    />
                  </TabsContent>

                  <TabsContent value="breakout" className="mt-0">
                    <BreakoutRooms
                      workshopId={parseInt(workshopId)}
                      userId={currentUserId}
                      isHost={isHost}
                      participants={participants}
                    />
                  </TabsContent>

                  <TabsContent value="video" className="mt-0">
                    <VideoPlayer
                      workshopId={parseInt(workshopId)}
                      userId={currentUserId}
                      isHost={isHost}
                    />
                  </TabsContent>

                  <TabsContent value="recording" className="mt-0">
                    <RecordingControls
                      workshopId={parseInt(workshopId)}
                      userId={currentUserId}
                      isHost={isHost}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
