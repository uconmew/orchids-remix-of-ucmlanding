"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hand, Heart, ThumbsUp, Sparkles, Brain } from "lucide-react";
import { toast } from "sonner";

interface Reaction {
  id: number;
  workshopId: number;
  userId: string;
  reactionType: "hand" | "thumbsup" | "heart" | "clap" | "thinking";
  isActive: boolean;
  createdAt: string;
}

interface ReactionsPanelProps {
  workshopId: string;
  currentUserId: string;
}

const reactionConfig = {
  hand: { icon: Hand, label: "Raise Hand", color: "text-yellow-400" },
  thumbsup: { icon: ThumbsUp, label: "Like", color: "text-blue-400" },
  heart: { icon: Heart, label: "Love", color: "text-red-400" },
  clap: { icon: Sparkles, label: "Applause", color: "text-green-400" },
  thinking: { icon: Brain, label: "Thinking", color: "text-purple-400" },
};

export function ReactionsPanel({ workshopId, currentUserId }: ReactionsPanelProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
    const interval = setInterval(fetchReactions, 2000);
    return () => clearInterval(interval);
  }, [workshopId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/workshops/${workshopId}/reactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReactions(data);
        
        const userReaction = data.find(
          (r: Reaction) => r.userId === currentUserId && r.isActive
        );
        setCurrentReaction(userReaction?.reactionType || null);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      if (currentReaction === reactionType) {
        // Remove reaction
        const response = await fetch(
          `/api/workshops/${workshopId}/reactions?userId=${currentUserId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
            },
          }
        );

        if (response.ok) {
          setCurrentReaction(null);
          fetchReactions();
        }
      } else {
        // Add/update reaction
        const response = await fetch(`/api/workshops/${workshopId}/reactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
            reactionType,
          }),
        });

        if (response.ok) {
          setCurrentReaction(reactionType);
          fetchReactions();
        }
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Error sending reaction");
    }
  };

  const getReactionCounts = () => {
    const counts: { [key: string]: number } = {};
    reactions.forEach((r) => {
      if (r.isActive) {
        counts[r.reactionType] = (counts[r.reactionType] || 0) + 1;
      }
    });
    return counts;
  };

  const reactionCounts = getReactionCounts();

  return (
    <div className="space-y-2">
      {/* Reaction Buttons */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(reactionConfig).map(([type, config]) => {
          const Icon = config.icon;
          const count = reactionCounts[type] || 0;
          const isActive = currentReaction === type;

          return (
            <Button
              key={type}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={`relative ${
                isActive
                  ? "bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => handleReaction(type)}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Active Reactions Display */}
      {reactions.filter((r) => r.isActive && r.reactionType === "hand").length > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Hand className="w-4 h-4" />
              <span>
                {reactions.filter((r) => r.isActive && r.reactionType === "hand").length}{" "}
                raised hand(s)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}