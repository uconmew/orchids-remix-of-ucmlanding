"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  Users,
  Hand,
  Settings,
  MoreVertical,
  Shield,
  Maximize,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkshopToolbarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  showSidebar: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleSidebar: () => void;
  onLeave: () => void;
  participantCount: number;
}

export function WorkshopToolbar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHost,
  showSidebar,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSidebar,
  onLeave,
  participantCount,
}: WorkshopToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section - Meeting Info */}
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">{participantCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{participantCount} participant{participantCount !== 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isHost && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Shield className="w-3 h-3 mr-1" />
              Host
            </Badge>
          )}
        </div>

        {/* Center Section - Main Controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Microphone Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleMute}
                  className={`rounded-full w-14 h-14 ${
                    isMuted 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isMuted ? "Unmute" : "Mute"}</p>
                <p className="text-xs text-gray-400">Space to toggle</p>
              </TooltipContent>
            </Tooltip>

            {/* Video Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleVideo}
                  className={`rounded-full w-14 h-14 ${
                    isVideoOff 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isVideoOff ? "Start video" : "Stop video"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Screen Share Control */}
            {isHost && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="lg"
                    onClick={onToggleScreenShare}
                    className={`rounded-full w-14 h-14 ${
                      isScreenSharing
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {isScreenSharing ? (
                      <MonitorOff className="w-5 h-5" />
                    ) : (
                      <MonitorUp className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Chat/Sidebar Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onToggleSidebar}
                  className={`rounded-full w-14 h-14 ${
                    showSidebar
                      ? "bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{showSidebar ? "Hide sidebar" : "Show sidebar"}</p>
              </TooltipContent>
            </Tooltip>

            {/* More Options */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Workshop Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Hand className="w-4 h-4 mr-2" />
                  Raise Hand
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Maximize className="w-4 h-4 mr-2" />
                  Fullscreen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Leave Button */}
            <div className="ml-4">
              <Button
                variant="destructive"
                size="lg"
                onClick={onLeave}
                className="bg-red-600 hover:bg-red-700 px-6 rounded-full"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Leave
              </Button>
            </div>
          </TooltipProvider>
        </div>

        {/* Right Section - Additional Info */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}