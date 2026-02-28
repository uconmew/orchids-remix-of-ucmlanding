"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Upload, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface WorkshopVideo {
  id: number;
  workshopId: number;
  title: string;
  videoUrl: string;
  durationSeconds: number | null;
  uploadedBy: string;
  currentTime: number;
  isPlaying: boolean;
  uploadedAt: string;
}

interface VideoPlayerProps {
  workshopId: number;
  userId: string;
  isHost: boolean;
}

export default function VideoPlayer({ workshopId, userId, isHost }: VideoPlayerProps) {
  const [videos, setVideos] = useState<WorkshopVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<WorkshopVideo | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 3000);
    return () => clearInterval(interval);
  }, [workshopId]);

  // Sync video playback
  useEffect(() => {
    if (!activeVideo || !videoRef.current) return;

    const video = videoRef.current;
    
    // Set video time if different from server state
    if (Math.abs(video.currentTime - activeVideo.currentTime) > 2) {
      video.currentTime = activeVideo.currentTime;
    }

    // Sync play/pause state
    if (activeVideo.isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!activeVideo.isPlaying && !video.paused) {
      video.pause();
    }
  }, [activeVideo]);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data);
        
        // Update active video state
        if (activeVideo) {
          const updated = data.find((v: WorkshopVideo) => v.id === activeVideo.id);
          if (updated) {
            setActiveVideo(updated);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim() || !uploadUrl.trim()) {
      toast.error('Please provide both title and URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: uploadTitle,
          videoUrl: uploadUrl,
          uploadedBy: userId
        })
      });

      if (response.ok) {
        toast.success('Video uploaded successfully');
        setUploadTitle('');
        setUploadUrl('');
        await fetchVideos();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/videos?videoId=${videoId}&hostUserId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Video deleted');
        if (activeVideo?.id === videoId) {
          setActiveVideo(null);
        }
        await fetchVideos();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!activeVideo || !videoRef.current) return;

    const video = videoRef.current;
    const newIsPlaying = video.paused;

    // Sync to server (host only)
    if (isHost) {
      try {
        const token = localStorage.getItem('bearer_token');
        await fetch(`/api/workshops/${workshopId}/videos/${activeVideo.id}/sync`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostUserId: userId,
            currentTime: Math.floor(video.currentTime),
            isPlaying: newIsPlaying
          })
        });

        if (newIsPlaying) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      } catch (error) {
        console.error('Error syncing video:', error);
      }
    }
  };

  const handleTimeUpdate = async () => {
    if (!activeVideo || !videoRef.current || !isHost) return;

    const video = videoRef.current;
    
    // Sync to server every 5 seconds
    if (Math.floor(video.currentTime) % 5 === 0) {
      try {
        const token = localStorage.getItem('bearer_token');
        await fetch(`/api/workshops/${workshopId}/videos/${activeVideo.id}/sync`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostUserId: userId,
            currentTime: Math.floor(video.currentTime),
            isPlaying: !video.paused
          })
        });
      } catch (error) {
        // Silently fail to avoid spam
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Shared Videos
        </CardTitle>
        <CardDescription>
          {isHost ? 'Upload and control video playback for all participants' : 'Watch videos together with the group'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Form (Host Only) */}
        {isHost && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Input
              placeholder="Video title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <Input
              placeholder="Video URL (e.g., YouTube, Vimeo)"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
            <Button onClick={handleUpload} disabled={loading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </div>
        )}

        {/* Active Video Player */}
        {activeVideo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{activeVideo.title}</h3>
              {isHost && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(activeVideo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={activeVideo.videoUrl}
                controls={isHost}
                onTimeUpdate={handleTimeUpdate}
                className="w-full"
              />
              {!isHost && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary">
                    Host is controlling playback
                  </Badge>
                </div>
              )}
            </div>
            {isHost && (
              <div className="flex gap-2">
                <Button onClick={handlePlayPause} className="flex-1">
                  {activeVideo.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause for All
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play for All
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Available Videos</h3>
            <div className="space-y-2">
              {videos.map(video => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    activeVideo?.id === video.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(video.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {video.isPlaying && (
                      <Badge variant="default">
                        <Play className="w-3 h-3 mr-1" />
                        Playing
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No videos uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
