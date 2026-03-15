"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  UserCog,
  Users,
  Shield,
  Monitor,
  User,
  Search,
  AlertCircle,
  Check,
  X,
  Info,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { WorkshopRole } from "@/types/workshop";
import {
  getRoleConfig,
  canAssignRole,
  getAssignableRoles,
  getAllRolesSorted,
  ROLE_DESCRIPTIONS,
} from "@/lib/workshop-roles-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  id: number;
  workshopId: number;
  userId: string;
  userName: string;
  peerId: string | null;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  role: WorkshopRole;
  hasHandRaised?: boolean;
  status: 'active' | 'waiting' | 'left';
  joinedAt: string;
  leftAt: string | null;
}

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  currentUserId: string;
  currentUserRole: WorkshopRole;
  workshopId: string;
  onRoleUpdate: () => void;
}

const ROLE_ICONS: Record<WorkshopRole, any> = {
  host: Crown,
  "co-host": UserCog,
  facilitator: Users,
  moderator: Shield,
  presenter: Monitor,
  participant: User,
};

export function RoleManagementDialog({
  open,
  onOpenChange,
  participants,
  currentUserId,
  currentUserRole,
  workshopId,
  onRoleUpdate,
}: RoleManagementDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"assign" | "overview">("assign");

  const currentUserConfig = getRoleConfig(currentUserRole);
  const assignableRoles = getAssignableRoles(currentUserRole);

  // Filter participants based on search
  const filteredParticipants = participants.filter((p) =>
    p.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group participants by role
  const participantsByRole = getAllRolesSorted().reduce((acc, roleConfig) => {
    acc[roleConfig.name] = participants.filter((p) => p.role === roleConfig.name);
    return acc;
  }, {} as Record<WorkshopRole, Participant[]>);

  const handleRoleChange = async (participant: Participant, newRole: WorkshopRole) => {
    if (!canAssignRole(currentUserRole, newRole)) {
      toast.error("You don't have permission to assign this role");
      return;
    }

    if (participant.userId === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/participants/${participant.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${participant.userName}'s role changed to ${getRoleConfig(newRole).displayName}`);
        onRoleUpdate();
        setSelectedParticipant(null);
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: WorkshopRole) => {
    const Icon = ROLE_ICONS[role];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#A92FFA]" />
            Role Management
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Assign and manage participant roles in this workshop
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="assign">Assign Roles</TabsTrigger>
            <TabsTrigger value="overview">Role Overview</TabsTrigger>
          </TabsList>

          {/* Assign Roles Tab */}
          <TabsContent value="assign" className="space-y-4 mt-4">
            {/* Your Current Role */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Your Role</p>
                  <div className="flex items-center gap-2">
                    <Badge className={currentUserConfig.color}>
                      {getRoleIcon(currentUserRole)}
                      <span className="ml-1">{currentUserConfig.displayName}</span>
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Can Assign</p>
                  <p className="text-sm font-medium">
                    {assignableRoles.length} role{assignableRoles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Participants List */}
            <ScrollArea className="h-[400px] border border-gray-800 rounded-lg">
              <div className="p-4 space-y-2">
                {filteredParticipants.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No participants found</p>
                  </div>
                ) : (
                  filteredParticipants.map((participant) => {
                    const participantRoleConfig = getRoleConfig(participant.role);
                    const isCurrentUser = participant.userId === currentUserId;
                    const canChange = !isCurrentUser && assignableRoles.length > 0;

                    return (
                      <div
                        key={participant.id}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedParticipant?.id === participant.id
                            ? "bg-gray-700 border-[#A92FFA]"
                            : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {participant.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {participant.userName}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={participantRoleConfig.color}>
                                  {getRoleIcon(participant.role)}
                                  <span className="ml-1">{participantRoleConfig.displayName}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {canChange ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedParticipant(
                                  selectedParticipant?.id === participant.id ? null : participant
                                )
                              }
                            >
                              Change Role
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" disabled>
                                    <Info className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {isCurrentUser
                                      ? "You cannot change your own role"
                                      : "You don't have permission to change this role"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Role Change UI */}
                        {selectedParticipant?.id === participant.id && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-3">Select New Role:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {assignableRoles.map((role) => {
                                const roleConfig = getRoleConfig(role);
                                const isCurrent = role === participant.role;

                                return (
                                  <Button
                                    key={role}
                                    variant={isCurrent ? "default" : "outline"}
                                    className={`justify-start ${roleConfig.color}`}
                                    onClick={() => handleRoleChange(participant, role)}
                                    disabled={isCurrent || isUpdating}
                                  >
                                    {getRoleIcon(role)}
                                    <span className="ml-2">{roleConfig.displayName}</span>
                                    {isCurrent && <Check className="w-4 h-4 ml-auto" />}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Role Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {getAllRolesSorted().map((roleConfig) => {
                  const participantsWithRole = participantsByRole[roleConfig.name] || [];
                  const permissions = roleConfig.permissions;

                  // Group permissions by resource
                  const permissionsByResource = permissions.reduce((acc, perm) => {
                    if (!acc[perm.resource]) {
                      acc[perm.resource] = [];
                    }
                    acc[perm.resource].push(perm);
                    return acc;
                  }, {} as Record<string, typeof permissions>);

                  return (
                    <div
                      key={roleConfig.name}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg ${roleConfig.color} flex items-center justify-center`}>
                            {getRoleIcon(roleConfig.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              {roleConfig.displayName}
                              <Badge variant="outline" className="text-xs">
                                Level {roleConfig.level}
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-400">{roleConfig.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {participantsWithRole.length} participant{participantsWithRole.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      <Separator className="my-3 bg-gray-700" />

                      {/* Permissions */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-300">Permissions:</p>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(permissionsByResource).map(([resource, perms]) => (
                            <div
                              key={resource}
                              className="p-3 bg-gray-900/50 rounded border border-gray-700"
                            >
                              <p className="text-xs font-medium text-gray-400 uppercase mb-2">
                                {resource}
                              </p>
                              <div className="space-y-1">
                                {perms.map((perm) => (
                                  <div
                                    key={`${perm.resource}-${perm.action}`}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{perm.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Can Assign */}
                      {roleConfig.canAssign.length > 0 && (
                        <>
                          <Separator className="my-3 bg-gray-700" />
                          <div>
                            <p className="text-sm font-medium mb-2 text-gray-300">Can Assign:</p>
                            <div className="flex flex-wrap gap-2">
                              {roleConfig.canAssign.map((assignableRole) => {
                                const assignableConfig = getRoleConfig(assignableRole);
                                return (
                                  <Badge
                                    key={assignableRole}
                                    variant="outline"
                                    className={assignableConfig.color}
                                  >
                                    {getRoleIcon(assignableRole)}
                                    <span className="ml-1">{assignableConfig.displayName}</span>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}