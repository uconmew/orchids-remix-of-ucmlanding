"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  workshopId: number;
  userId: string;
  message: string;
  messageType: "public" | "private";
  recipientId: string | null;
  sentAt: string;
}

interface ChatPanelProps {
  workshopId: string;
  currentUserId: string;
  currentUserName: string;
}

export function ChatPanel({ workshopId, currentUserId, currentUserName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [workshopId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = () => {
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/workshops/${workshopId}/chat?messageType=public`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);

      const response = await fetch(`/api/workshops/${workshopId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          userId: currentUserId,
          message: newMessage.trim(),
          messageType: "public",
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {messages.map((msg) => {
                const isOwnMessage = msg.userId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">
                        {isOwnMessage ? "You" : `User ${msg.userId.slice(0, 8)}`}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(msg.sentAt)}</span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[80%] break-words ${
                        isOwnMessage
                          ? "bg-[#A92FFA] text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isSending}
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSending || !newMessage.trim()}
              className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
