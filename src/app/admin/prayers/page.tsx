"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Search, Eye, EyeOff, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Prayer {
  id: number;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  isApproved: boolean;
  prayerCount: number;
  createdAt: string;
}

const PRAYER_CATEGORIES = [
  { value: "healing", label: "Healing" },
  { value: "guidance", label: "Guidance" },
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "protection", label: "Protection" },
  { value: "provision", label: "Provision" },
  { value: "relationships", label: "Relationships" },
  { value: "ministry", label: "Ministry" },
  { value: "other", label: "Other" },
];

export default function PrayersManagement() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/prayers");
      if (response.ok) {
        const data = await response.json();
        setPrayers(data);
      }
    } catch (error) {
      console.error("Error fetching prayers:", error);
      toast.error("Failed to load prayers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrayer = async (prayerId: number, approve: boolean) => {
    try {
      const response = await fetch(`/api/prayers/${prayerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });

      if (response.ok) {
        toast.success(approve ? "Prayer approved" : "Prayer hidden");
        fetchPrayers();
      } else {
        toast.error("Failed to update prayer");
      }
    } catch (error) {
      console.error("Error updating prayer:", error);
      toast.error("An error occurred");
    }
  };

  const handleDeletePrayer = async (prayerId: number) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) {
      return;
    }

    try {
      const response = await fetch(`/api/prayers/${prayerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Prayer deleted");
        fetchPrayers();
      } else {
        toast.error("Failed to delete prayer");
      }
    } catch (error) {
      console.error("Error deleting prayer:", error);
      toast.error("An error occurred");
    }
  };

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch =
      (prayer.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (prayer.content?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || prayer.category === selectedCategory;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && prayer.isApproved) ||
      (filterStatus === "pending" && !prayer.isApproved);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      healing: "bg-green-600",
      guidance: "bg-blue-600",
      thanksgiving: "bg-yellow-600",
      protection: "bg-purple-600",
      provision: "bg-orange-600",
      relationships: "bg-pink-600",
      ministry: "bg-[#A92FFA]",
      other: "bg-gray-600",
    };
    return colors[category] || "bg-gray-600";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Prayer Wall Management</h1>
          <p className="text-muted-foreground">
            Moderate and manage community prayer requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Prayers</p>
              <Heart className="w-5 h-5 text-[#A92FFA]" />
            </div>
            <p className="text-3xl font-bold">{prayers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">
              {prayers.filter((p) => p.isApproved).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <EyeOff className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold">
              {prayers.filter((p) => !p.isApproved).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Prayers Offered</p>
              <Heart className="w-5 h-5 text-[#F28C28]" fill="currentColor" />
            </div>
            <p className="text-3xl font-bold">
              {prayers.reduce((sum, p) => sum + p.prayerCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search prayers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRAYER_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prayers List */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Requests</CardTitle>
          <CardDescription>
            {filteredPrayers.length} prayer request{filteredPrayers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading prayers...
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prayers found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    prayer.isApproved
                      ? "border-border hover:bg-accent/50"
                      : "border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{prayer.title}</h3>
                        <Badge className={`${getCategoryColor(prayer.category)} text-white text-xs`}>
                          {prayer.category}
                        </Badge>
                        {prayer.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                        {!prayer.isApproved && (
                          <Badge className="bg-yellow-600 text-white text-xs">
                            Pending Review
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {prayer.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" fill="currentColor" />
                          <span>{prayer.prayerCount} prayers</span>
                        </div>
                        <span>
                          Posted {new Date(prayer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {prayer.isApproved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovePrayer(prayer.id, false)}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprovePrayer(prayer.id, true)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePrayer(prayer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}