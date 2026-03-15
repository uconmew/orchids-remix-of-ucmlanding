"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Shield, Clock, User, AlertTriangle, CheckCircle2, 
  XCircle, Key, RefreshCw, Eye, EyeOff 
} from "lucide-react";

interface ChangeRequest {
  id: number;
  requestType: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterStaffNumber?: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  changeDetails: Record<string, unknown>;
  approverStaffNumber: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  isExpired?: boolean;
}

interface SensitiveChangeApprovalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ChangeRequest | null;
  onApproved?: () => void;
  onDenied?: () => void;
}

export function SensitiveChangeApproval({
  isOpen,
  onClose,
  request,
  onApproved,
  onDenied,
}: SensitiveChangeApprovalProps) {
  const [accessCode, setAccessCode] = useState("");
  const [denialReason, setDenialReason] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!request?.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(request.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [request?.expiresAt]);

  const handleApprove = useCallback(async () => {
    if (!request || !accessCode) {
      toast.error("Please enter your Personal Access Code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sensitive-changes/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          accessCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve");
      }

      toast.success("Request approved successfully");
      setAccessCode("");
      onApproved?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    } finally {
      setIsLoading(false);
    }
  }, [request, accessCode, onApproved, onClose]);

  const handleDeny = useCallback(async () => {
    if (!request) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sensitive-changes/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deny",
          denialReason: denialReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to deny");
      }

      toast.success("Request denied");
      setDenialReason("");
      onDenied?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deny request");
    } finally {
      setIsLoading(false);
    }
  }, [request, denialReason, onDenied, onClose]);

  const formatChangeType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getChangeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      password_reset: "bg-amber-500",
      email_change: "bg-blue-500",
      profile_update: "bg-green-500",
      audit_delete: "bg-red-500",
      role_change: "bg-purple-500",
      credential_change: "bg-orange-500",
      staff_name_change: "bg-cyan-500",
      operational_change: "bg-pink-500",
      pac_change: "bg-violet-500",
    };
    return colors[type] || "bg-gray-500";
  };

  if (!request) return null;

  const isExpired = request.isExpired || timeLeft === "Expired";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#A92FFA]" />
            Approval Request
          </DialogTitle>
          <DialogDescription>
            Review and respond to this sensitive change request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Badge className={getChangeTypeColor(request.requestType)}>
              {formatChangeType(request.requestType)}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Clock className={`w-4 h-4 ${isExpired ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={isExpired ? "text-red-500 font-medium" : "text-muted-foreground"}>
                {timeLeft}
              </span>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Requested by</p>
                <p className="text-sm text-muted-foreground">
                  {request.requesterName || "Unknown"} 
                  {request.requesterStaffNumber && (
                    <span className="ml-1">({request.requesterStaffNumber})</span>
                  )}
                </p>
              </div>
            </div>

            {request.targetUserName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Target User</p>
                  <p className="text-sm text-muted-foreground">
                    {request.targetUserName} ({request.targetUserEmail})
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-1 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Change Details</p>
                <pre className="text-xs text-muted-foreground bg-background p-2 rounded mt-1 overflow-auto max-h-32">
                  {JSON.stringify(request.changeDetails, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {isExpired ? (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-500 font-medium">
                This request has expired and can no longer be processed.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Your Personal Access Code (PAC)
                </Label>
                <div className="relative">
                  <Input
                    id="accessCode"
                    type={showAccessCode ? "text" : "password"}
                    placeholder="Enter your 6-digit PAC"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    maxLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                  >
                    {showAccessCode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="denialReason">Reason for Denial (optional)</Label>
                <Textarea
                  id="denialReason"
                  placeholder="Enter a reason if you choose to deny..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!isExpired && (
            <>
              <Button
                variant="destructive"
                onClick={handleDeny}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Deny
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isLoading || !accessCode}
                className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SensitiveChangeApproval;
