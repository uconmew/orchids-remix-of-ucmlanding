"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Shield, Clock, CheckCircle2 } from "lucide-react";
import { SensitiveChangeApproval } from "./SensitiveChangeApproval";

interface PendingRequest {
  id: number;
  requestType: string;
  requesterName?: string;
  requesterStaffNumber?: string;
  targetUserName?: string;
  changeDetails: Record<string, unknown>;
  approverStaffNumber: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  isExpired?: boolean;
}

export function ApprovalNotificationBadge() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/sensitive-changes?status=pending&forApprover=true");
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.filter((r: PendingRequest) => !r.isExpired));
      }
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  const formatChangeType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m left`;
  };

  const handleRequestClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsApprovalOpen(true);
    setIsOpen(false);
  };

  const handleApprovalComplete = () => {
    fetchPendingRequests();
  };

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Shield className="w-5 h-5" />
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#A92FFA]"
            >
              {pendingRequests.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-3 border-b">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#A92FFA]" />
              Pending Approvals
            </h4>
            <p className="text-xs text-muted-foreground">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? "s" : ""} awaiting your approval
            </p>
          </div>
          <ScrollArea className="max-h-[300px]">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleRequestClick(request)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {formatChangeType(request.requestType)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      From: {request.requesterName || "Unknown"}
                    </p>
                    {request.targetUserName && (
                      <p className="text-xs text-muted-foreground truncate">
                        For: {request.targetUserName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Clock className="w-3 h-3" />
                    {getTimeLeft(request.expiresAt)}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          {pendingRequests.length > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  handleRequestClick(pendingRequests[0]);
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Review First Request
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <SensitiveChangeApproval
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        request={selectedRequest}
        onApproved={handleApprovalComplete}
        onDenied={handleApprovalComplete}
      />
    </>
  );
}

export default ApprovalNotificationBadge;
