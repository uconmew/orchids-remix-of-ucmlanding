"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Loader2, ThumbsUp, CircleCheck } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  workshopId: number;
  userId: string;
  question: string;
  upvotes: number;
  isAnswered: boolean;
  askedAt: string;
}

interface QuestionsPanelProps {
  workshopId: string;
  currentUserId: string;
  isHost: boolean;
}

export function QuestionsPanel({ workshopId, currentUserId, isHost }: QuestionsPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotedQuestions, setUpvotedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 3000);
    return () => clearInterval(interval);
  }, [workshopId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/questions?showAnswered=false&sortBy=upvotes`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) return;
    
    if (newQuestion.trim().length < 10) {
      toast.error("Question must be at least 10 characters");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/workshops/${workshopId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          userId: currentUserId,
          question: newQuestion.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Question submitted!");
        setNewQuestion("");
        fetchQuestions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit question");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Error submitting question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: number) => {
    if (upvotedQuestions.has(questionId)) {
      toast.error("You have already upvoted this question");
      return;
    }

    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/questions/${questionId}/upvote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        setUpvotedQuestions((prev) => new Set(prev).add(questionId));
        fetchQuestions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Error upvoting");
    }
  };

  const handleMarkAnswered = async (questionId: number, isAnswered: boolean) => {
    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/questions/${questionId}/answer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
          body: JSON.stringify({ isAnswered }),
        }
      );

      if (response.ok) {
        toast.success(isAnswered ? "Marked as answered" : "Marked as unanswered");
        fetchQuestions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Error updating question");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Q&A ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No questions yet. Be the first to ask!
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {questions.map((q) => (
                  <Card key={q.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              upvotedQuestions.has(q.id)
                                ? "text-[#A92FFA]"
                                : "text-gray-400"
                            }`}
                            onClick={() => handleUpvote(q.id)}
                            disabled={upvotedQuestions.has(q.id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <span className="text-xs font-semibold text-white">
                            {q.upvotes}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-2">{q.question}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatTime(q.askedAt)}</span>
                            {q.isAnswered && (
                              <Badge className="bg-green-500/20 text-green-400">
                                <CircleCheck className="w-3 h-3 mr-1" />
                                Answered
                              </Badge>
                            )}
                          </div>
                          {isHost && !q.isAnswered && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => handleMarkAnswered(q.id, true)}
                            >
                              Mark as Answered
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <form onSubmit={handleAskQuestion} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isSubmitting}
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newQuestion.trim()}
              className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Ask"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
