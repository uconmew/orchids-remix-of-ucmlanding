"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Circle, Square, Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Recording {
  id: number;
  workshopId: number;
  recordingUrl: string;
  duration: number | null;
  transcriptUrl: string | null;
  createdAt: string;
}

interface RecordingControlsProps {
  workshopId: number;
  userId: string;
  isHost: boolean;
}

export default function RecordingControls({ workshopId, userId, isHost }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch existing recordings
  useEffect(() => {
    fetchRecordings();
  }, [workshopId]);

  // Update recording duration every second
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchRecordings = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/workshops/${workshopId}/recordings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecordings(data);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const handleStartRecording = async () => {
    if (!isHost) {
      toast.error('Only the host can start recording');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      
      // In production, you would integrate with actual recording service (e.g., Daily.co, Twilio, etc.)
      // For now, we'll create a placeholder recording URL
      const mockRecordingUrl = `https://recordings.uconministries.org/${workshopId}/${Date.now()}.mp4`;
      
      const response = await fetch(`/api/workshops/${workshopId}/recordings/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostUserId: userId,
          recordingUrl: mockRecordingUrl
        })
      });

      if (response.ok) {
        const recording = await response.json();
        setCurrentRecordingId(recording.id);
        setIsRecording(true);
        setRecordingDuration(0);
        toast.success('Recording started');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    } finally {
      setLoading(false);
    }
  };

  const handleStopRecording = async () => {
    if (!isHost || !currentRecordingId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(
        `/api/workshops/${workshopId}/recordings/${currentRecordingId}/stop?id=${workshopId}&recordingId=${currentRecordingId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostUserId: userId,
            duration: recordingDuration
          })
        }
      );

      if (response.ok) {
        setIsRecording(false);
        setCurrentRecordingId(null);
        setRecordingDuration(0);
        toast.success('Recording stopped and saved');
        await fetchRecordings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to stop recording');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Circle className={`w-5 h-5 ${isRecording ? 'fill-red-500 text-red-500 animate-pulse' : ''}`} />
              Recording
            </CardTitle>
            <CardDescription>
              {isHost ? 'Record this workshop session' : 'Session recording status'}
            </CardDescription>
          </div>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(recordingDuration)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls (Host Only) */}
        {isHost && (
          <div className="flex gap-2">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                <Circle className="w-4 h-4 mr-2 fill-white" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        )}

        {/* Recording Status for Non-Hosts */}
        {!isHost && (
          <div className="text-center py-4">
            {isRecording ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Circle className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
                  <span className="font-medium">This session is being recorded</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Duration: {formatDuration(recordingDuration)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Not currently recording</p>
            )}
          </div>
        )}

        {/* Previous Recordings */}
        {recordings.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Previous Recordings</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recordings.map(recording => (
                <div
                  key={recording.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {new Date(recording.createdAt).toLocaleString()}
                      </p>
                      {recording.duration && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {formatDuration(recording.duration)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={recording.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                  {recording.transcriptUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="mt-2 h-auto p-0 text-xs"
                    >
                      <a
                        href={recording.transcriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transcript
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p>
            {isHost
              ? 'Recordings are automatically saved and can be downloaded after the session.'
              : 'If recording is active, this session will be saved for future reference.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
