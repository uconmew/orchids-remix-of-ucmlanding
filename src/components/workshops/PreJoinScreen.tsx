"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings,
  User,
  Monitor,
  Clock,
  Users,
  ArrowRight
} from "lucide-react";
import Image from "next/image";

interface PreJoinScreenProps {
  workshop: {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  };
  userName: string;
  onJoin: (videoEnabled: boolean, audioEnabled: boolean) => void;
}

export function PreJoinScreen({ workshop, userName, onJoin }: PreJoinScreenProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializePreview();
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (previewStream && videoRef.current) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  useEffect(() => {
    if (previewStream) {
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = videoEnabled;
      }
    }
  }, [videoEnabled, previewStream]);

  const initializePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPreviewStream(stream);
    } catch (error) {
      console.error("Error accessing media:", error);
    }
  };

  const handleJoin = () => {
    setIsLoading(true);
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    onJoin(videoEnabled, audioEnabled);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Video Preview */}
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <CardContent className="p-0">
            {/* Video Preview */}
            <div className="relative aspect-video bg-gray-950 flex items-center justify-center">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-medium">{userName}</p>
                  <p className="text-sm">Camera is off</p>
                </div>
              )}
              
              {/* Preview Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className={audioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={videoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"}
                  onClick={() => setVideoEnabled(!videoEnabled)}
                >
                  {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Device Settings */}
            <div className="p-6 space-y-4 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="video-switch" className="text-sm font-medium flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Start with video on
                </Label>
                <Switch
                  id="video-switch"
                  checked={videoEnabled}
                  onCheckedChange={setVideoEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="audio-switch" className="text-sm font-medium flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Start with audio on
                </Label>
                <Switch
                  id="audio-switch"
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Workshop Details */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge className="bg-[#A92FFA] text-white">UCON Workshop</Badge>
                  <CardTitle className="text-2xl text-white">{workshop.title}</CardTitle>
                </div>
                <Badge className="bg-red-500 text-white animate-pulse">
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-400 leading-relaxed">
                {workshop.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#F28C28]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Schedule</p>
                    <p className="font-medium">
                      {formatTime(workshop.startTime)} - {formatTime(workshop.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#A92FFA]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Joining as</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold mb-3 text-gray-300">Workshop Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-[#A92FFA] mt-0.5">•</span>
                    <span>Be respectful and supportive of all participants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A92FFA] mt-0.5">•</span>
                    <span>Mute your microphone when not speaking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A92FFA] mt-0.5">•</span>
                    <span>Use the chat for questions and comments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#A92FFA] mt-0.5">•</span>
                    <span>Keep your camera on if possible</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={isLoading}
            size="lg"
            className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-white text-lg py-6"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Joining...
              </>
            ) : (
              <>
                Join Workshop
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            By joining, you agree to the workshop guidelines and terms of service
          </p>
        </div>
      </div>
    </div>
  );
}
