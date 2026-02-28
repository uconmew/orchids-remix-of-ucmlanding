"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Shield, AlertTriangle, RefreshCw } from "lucide-react";

interface SensitiveChangeRequestProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: string;
  targetUserId?: string;
  targetUserName?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  changeDetails: Record<string, unknown>;
  onSuccess?: () => void;
}

export function SensitiveChangeRequest({
  isOpen,
  onClose,
  requestType,
  targetUserId,
  targetUserName,
  targetEntityType,
  targetEntityId,
  changeDetails,
  onSuccess,
}: SensitiveChangeRequestProps) {
  const [approverStaffNumber, setApproverStaffNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatChangeType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

    const handleSubmit = async () => {
    if (!approverStaffNumber.trim()) {
      toast.error("Please enter the approver's YYRRRR staff number");
      return;
    }

    // Accept 6-digit YYRRRR format (e.g., 260001)
    const normalizedId = approverStaffNumber.trim();
    const numericPattern = /^\d{6}$/;

    if (!numericPattern.test(normalizedId)) {
      toast.error("Please enter a valid 6-digit staff number (YYRRRR format, e.g., 260001)");
      return;
    }

    // Convert YYRRRR to full UCM registration format for API lookup
    const yy = normalizedId.substring(0, 2);
    const rrrrr = normalizedId.substring(2);
    const fullYear = parseInt(yy) > 50 ? `19${yy}` : `20${yy}`;
    const fullStaffNumber = `UCM-${fullYear}-0${rrrrr}`;

    setIsLoading(true);
    try {
      const response = await fetch("/api/sensitive-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          targetUserId,
          targetEntityType,
          targetEntityId,
          changeDetails,
          approverStaffNumber: fullStaffNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast.success(data.message || "Request submitted successfully");
      setApproverStaffNumber("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#A92FFA]" />
            Request Approval
          </DialogTitle>
          <DialogDescription>
            This change requires authorization from another staff member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>{formatChangeType(requestType)}</strong> requires approval from a Level 1 or Level 2 staff member.
            </p>
          </div>

          {targetUserName && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Target:</span>{" "}
                <span className="font-medium">{targetUserName}</span>
              </p>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Change Details:</p>
            <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-auto max-h-24">
              {JSON.stringify(changeDetails, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
              <Label htmlFor="approverStaffNumber">Approver&apos;s Staff Number (YYRRRR)</Label>
              <Input
                id="approverStaffNumber"
                placeholder="e.g., 260001"
                value={approverStaffNumber}
                onChange={(e) => setApproverStaffNumber(e.target.value)}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit YYRRRR staff number of a Level 1 or 2 staff member.
                They will have 30 minutes to respond.
              </p>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !approverStaffNumber.trim()}
            className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SensitiveChangeRequest;
