"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, ExternalLink, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Alert {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  referenceId?: string;
  referenceType?: string;
  priority: string;
  isRead: boolean;
  isDismissed: boolean;
  metadata?: any;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertCenterProps {
  className?: string;
}

export default function AlertCenter({ className }: AlertCenterProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/alerts?includeRead=true');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user, fetchAlerts]);

  const markAsRead = async (alertId: number) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, action: 'read' }),
      });
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, isRead: true } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (alertId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await fetch(`/api/alerts?id=${alertId}`, { method: 'DELETE' });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      const alert = alerts.find(a => a.id === alertId);
      if (alert && !alert.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Alert dismissed');
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  const dismissAllAlerts = async () => {
    try {
      await fetch('/api/alerts?dismissAll=true', { method: 'DELETE' });
      setAlerts([]);
      setUnreadCount(0);
      toast.success('All alerts dismissed');
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
      toast.error('Failed to dismiss alerts');
    }
  };

  const handleAlertClick = async (alert: Alert) => {
    if (!alert.isRead) {
      await markAsRead(alert.id);
    }
    if (alert.actionUrl) {
      setIsOpen(false);
      router.push(alert.actionUrl);
    }
  };

  const getAlertIcon = (type: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    switch (type) {
      case 'more_info_needed':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case 'booking_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'booking_denied':
        return <X className="w-5 h-5 text-red-500" />;
      case 'workshop_reminder':
        return <Clock className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'normal':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!session?.user) return null;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open alerts"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-background border-2 border-[#A92FFA]/30 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#A92FFA]" />
                    <h3 className="font-bold text-lg">Alerts</h3>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {alerts.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                        onClick={dismissAllAlerts}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No alerts</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                          alert.isRead 
                            ? 'bg-background border-border/50' 
                            : 'bg-[#A92FFA]/5 border-[#A92FFA]/20'
                        }`}
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertIcon(alert.type, alert.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-semibold leading-tight ${
                                alert.isRead ? 'text-foreground' : 'text-foreground'
                              }`}>
                                {alert.title}
                              </h4>
                              {!alert.isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-[#A92FFA] rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {alert.message}
                            </p>
                            
                            {alert.metadata?.staffRequirements && (
                              <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                                  Staff Requirements:
                                </p>
                                <p className="text-xs text-blue-700">
                                  {alert.metadata.staffRequirements}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[10px] h-5 ${getPriorityColor(alert.priority)}`}>
                                  {alert.priority.toUpperCase()}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTimeAgo(alert.createdAt)}
                                </span>
                              </div>
                              {alert.actionLabel && (
                                <span className="text-[10px] text-[#A92FFA] font-medium flex items-center gap-1">
                                  {alert.actionLabel}
                                  <ExternalLink className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => dismissAlert(alert.id, e)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
