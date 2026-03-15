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
import { BookOpen, Search, Plus, Users, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface Workshop {
  id: number;
  title: string;
  type: string;
  description: string;
  startTime: string;
  duration: number;
  capacity: number;
  status: string;
  createdAt: string;
}

const WORKSHOP_TYPES = [
  { value: "EQUIP", label: "UCON EQUIP - Workshops" },
  { value: "AWAKEN", label: "UCON AWAKEN - Spiritual Growth" },
  { value: "SHEPHERD", label: "UCON SHEPHERD - Pastoral Care" },
  { value: "BRIDGE", label: "UCON BRIDGE - Mentorship" },
];

export default function WorkshopsManagement() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workshops");
      if (response.ok) {
        const data = await response.json();
        setWorkshops(data);
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
      toast.error("Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || workshop.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-600",
      in_progress: "bg-green-600",
      completed: "bg-gray-600",
      cancelled: "bg-red-600",
    };
    return colors[status] || "bg-gray-600";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workshops Management</h1>
          <p className="text-muted-foreground">
            Manage all ministry workshops and educational programs
          </p>
        </div>
        <Button className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Workshop
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Workshops</p>
              <BookOpen className="w-5 h-5 text-[#A92FFA]" />
            </div>
            <p className="text-3xl font-bold">{workshops.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">
              {workshops.filter((w) => w.status === "scheduled").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">
              {workshops.filter((w) => w.status === "in_progress").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold">
              {workshops.filter((w) => w.status === "completed").length}
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
                  placeholder="Search workshops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workshop Types</SelectItem>
                {WORKSHOP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workshops List */}
      <Card>
        <CardHeader>
          <CardTitle>Workshop Schedule</CardTitle>
          <CardDescription>
            {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading workshops...
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No workshops found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#F28C28] rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{workshop.title}</h3>
                        <Badge className={`${getStatusColor(workshop.status)} text-white text-xs`}>
                          {workshop.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {workshop.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {workshop.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(workshop.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{workshop.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Capacity: {workshop.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
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
