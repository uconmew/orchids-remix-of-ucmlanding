"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

// Playlist of 4 background songs - using the existing audio files
const PLAYLIST = [
  "https://od.lk/d/NzNfMTEyMzkwMDUwXw/emotional-cinematic-inspiring-piano-beautiful-ambient-background-music-238377.mp3",
  "https://od.lk/d/NzNfMTEyMzg5ODUxXw/cinematic-hit-425569.mp3",
  "https://od.lk/d/NzNfMTEyMzg5ODUzXw/fx-dramatic-cinematic-boom-sound-effect-249258.mp3",
  "https://od.lk/d/NzNfMTEyMzg5ODUyXw/cinematic-impact-106030.mp3",
];

export default function BackgroundMusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showControl, setShowControl] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(PLAYLIST[0]);
      audioRef.current.volume = 0.4;
      
      // Auto-advance to next track when current track ends
      audioRef.current.addEventListener('ended', playNextTrack);
    }

    // Listen for animation complete to show control
    const handleAnimationComplete = () => {
      setShowControl(true);
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => console.log("Auto-play prevented:", err));
        }
      }
    };

    window.addEventListener('wordShuffleComplete', handleAnimationComplete);

    return () => {
      window.removeEventListener('wordShuffleComplete', handleAnimationComplete);
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', playNextTrack);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playNextTrack = () => {
    if (!audioRef.current) return;
    
    // Move to next track, loop back to start if at end
    const nextTrack = (currentTrack + 1) % PLAYLIST.length;
    setCurrentTrack(nextTrack);
    
    audioRef.current.src = PLAYLIST[nextTrack];
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.log("Play next track failed:", err));
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Play failed:", err));
    }
  };

  // Don't show control until animation completes
  if (!showControl) return null;

  return (
    <Button
      onClick={togglePlayPause}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:from-[#A92FFA]/90 hover:to-[#F28C28]/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      aria-label={isPlaying ? "Pause Music" : "Play Music"}>
      {isPlaying ? (
        <Pause className="h-7 w-7 text-white fill-white" />
      ) : (
        <Play className="h-7 w-7 text-white fill-white" />
      )}
    </Button>
  );
}