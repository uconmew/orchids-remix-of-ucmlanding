"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Search, Filter, Download, Calendar, User, 
  Shield, Clock, Activity, RefreshCw, ChevronLeft, ChevronRight,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SensitiveChangeRequest } from "@/components/SensitiveChangeRequest";

interface AuditLog {
  id: number;
  category: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  staffRegistrationNumber: string | null;
  ipAddress: string | null;
  details: any;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  transit: "bg-blue-500",
  bookings: "bg-green-500",
  users: "bg-purple-500",
  donations: "bg-amber-500",
  workshops: "bg-pink-500",
  admin: "bg-red-500",
  auth: "bg-cyan-500",
  outreach: "bg-orange-500",
  override_codes: "bg-yellow-500",
  settings: "bg-gray-500",
  roles: "bg-indigo-500",
  permissions: "bg-violet-500",
  constraints: "bg-teal-500",
  staff: "bg-emerald-500",
  convicts: "bg-rose-500",
};

const ACTION_ICONS: Record<string, string> = {
  create: "➕",
  update: "✏️",
  delete: "🗑️",
  view: "👁️",
  approve: "✅",
  deny: "❌",
  login: "🔐",
  logout: "🚪",
  generate: "🔑",
  use: "🎯",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLogForDeletion, setSelectedLogForDeletion] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, startDate, endDate, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", limit.toString());
      params.set("offset", (page * limit).toString());

      const response = await fetch(`/api/admin/audit?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotal(data.total);
        setCategories(data.categories);
        setCategoryCounts(data.categoryCounts);
      } else if (response.status === 403) {
        toast.error("You don't have permission to view audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          format: "csv",
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Audit logs exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export audit logs");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-[#A92FFA]" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">Track all system activity and changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => { setSelectedCategory("all"); setPage(0); }}
              >
                <span>All Categories</span>
                <Badge variant="secondary">{total}</Badge>
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => { setSelectedCategory(cat); setPage(0); }}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-500"}`} />
                    {cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <Badge variant="secondary">{categoryCounts[cat] || 0}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by user, email, staff #..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                  <Button onClick={handleSearch}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-4 animate-pulse" />
                    Loading audit logs...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${CATEGORY_COLORS[log.category] || "bg-gray-500"}`}>
                          <span className="text-lg">{ACTION_ICONS[log.action] || "📝"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {log.category.replace(/_/g, " ")}
                            </Badge>
                            <Badge className="text-xs bg-muted text-foreground">
                              {log.action}
                            </Badge>
                            {log.entityType && (
                              <span className="text-xs text-muted-foreground">
                                {log.entityType} #{log.entityId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            {log.userName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.userName}
                              </span>
                            )}
                            {log.userEmail && (
                              <span className="text-muted-foreground truncate max-w-[200px]">
                                {log.userEmail}
                              </span>
                            )}
                            {log.staffRegistrationNumber && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Staff #{log.staffRegistrationNumber}
                              </Badge>
                            )}
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedLogForDeletion(log);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete audit log (requires approval)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total} logs
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedLogForDeletion && (
          <SensitiveChangeRequest
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedLogForDeletion(null);
            }}
            requestType="audit_delete"
            targetEntityType="audit_log"
            targetEntityId={selectedLogForDeletion.id.toString()}
            changeDetails={{
              action: "delete_audit_log",
              logId: selectedLogForDeletion.id,
              logCategory: selectedLogForDeletion.category,
              logAction: selectedLogForDeletion.action,
              logCreatedAt: selectedLogForDeletion.createdAt,
              logUserName: selectedLogForDeletion.userName,
            }}
            onSuccess={() => {
              toast.success("Deletion request submitted. Awaiting approval from a Director or Executive.");
              setSelectedLogForDeletion(null);
            }}
          />
        )}
      </div>
    );
  }
