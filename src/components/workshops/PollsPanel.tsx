"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Poll {
  id: number;
  workshopId: number;
  question: string;
  options: string[];
  createdBy: string;
  createdAt: string;
  endsAt: string | null;
  isActive: boolean;
}

interface PollResult {
  option: string;
  index: number;
  votes: number;
  percentage: number;
}

interface PollsPanelProps {
  workshopId: string;
  currentUserId: string;
  isHost: boolean;
}

export function PollsPanel({ workshopId, currentUserId, isHost }: PollsPanelProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create poll state
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  
  // Results state
  const [pollResults, setPollResults] = useState<{ [key: number]: PollResult[] }>({});
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 3000);
    return () => clearInterval(interval);
  }, [workshopId]);

  const fetchPolls = async () => {
    try {
      const response = await fetch(`/api/workshops/${workshopId}/polls?onlyActive=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPolls(data);
        
        // Fetch results for each poll
        data.forEach((poll: Poll) => {
          fetchPollResults(poll.id);
        });
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPollResults = async (pollId: number) => {
    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/polls/${pollId}/results`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPollResults((prev) => ({ ...prev, [pollId]: data.results }));
      }
    } catch (error) {
      console.error("Error fetching poll results:", error);
    }
  };

  const handleCreatePoll = async () => {
    const validOptions = newPollOptions.filter((opt) => opt.trim() !== "");
    
    if (!newPollQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch(`/api/workshops/${workshopId}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          question: newPollQuestion.trim(),
          options: validOptions,
          createdBy: currentUserId,
          isActive: true,
        }),
      });

      if (response.ok) {
        toast.success("Poll created successfully!");
        setShowCreateDialog(false);
        setNewPollQuestion("");
        setNewPollOptions(["", ""]);
        fetchPolls();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create poll");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Error creating poll");
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (pollId: number, optionIndex: number) => {
    if (votedPolls.has(pollId)) {
      toast.error("You have already voted on this poll");
      return;
    }

    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/polls/${pollId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
            optionIndex,
          }),
        }
      );

      if (response.ok) {
        toast.success("Vote recorded!");
        setVotedPolls((prev) => new Set(prev).add(pollId));
        fetchPollResults(pollId);
      } else {
        const data = await response.json();
        if (data.code === "ALREADY_VOTED") {
          setVotedPolls((prev) => new Set(prev).add(pollId));
        }
        toast.error(data.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error voting");
    }
  };

  const addOption = () => {
    if (newPollOptions.length < 10) {
      setNewPollOptions([...newPollOptions, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Polls
          </CardTitle>
          {isHost && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Create Poll</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Question</label>
                    <Input
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      placeholder="Enter your question"
                      className="bg-gray-800 border-gray-700"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Options</label>
                    <div className="space-y-2">
                      {newPollOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="bg-gray-800 border-gray-700"
                            maxLength={100}
                          />
                          {newPollOptions.length > 2 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {newPollOptions.length < 10 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={addOption}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleCreatePoll}
                    disabled={isCreating}
                    className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Poll"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No active polls
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const results = pollResults[poll.id] || [];
                const hasVoted = votedPolls.has(poll.id);
                const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

                return (
                  <Card key={poll.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-white mb-1">{poll.question}</h4>
                        <p className="text-xs text-gray-400">{totalVotes} votes</p>
                      </div>
                      
                      <div className="space-y-2">
                        {hasVoted || isHost ? (
                          // Show results
                          results.map((result) => (
                            <div key={result.index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{result.option}</span>
                                <span className="text-gray-400">
                                  {result.votes} ({result.percentage}%)
                                </span>
                              </div>
                              <Progress value={result.percentage} className="h-2" />
                            </div>
                          ))
                        ) : (
                          // Show voting buttons
                          poll.options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => handleVote(poll.id, index)}
                            >
                              {option}
                            </Button>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
