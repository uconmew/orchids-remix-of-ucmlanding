"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  Star,
  ChevronRight,
  Building2,
} from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  benefits?: string;
  applicationDeadline?: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
  publishedAt?: string;
  createdAt: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, departmentFilter, typeFilter, locationFilter]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/job-postings");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((job) => job.department === departmentFilter);
    }

    // Employment type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job.employmentType === typeFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setTypeFilter("all");
    setLocationFilter("all");
  };

  // Get unique departments, types, and locations
  const departments = Array.from(new Set(jobs.map((job) => job.department)));
  const employmentTypes = Array.from(
    new Set(jobs.map((job) => job.employmentType))
  );
  const locations = Array.from(new Set(jobs.map((job) => job.location)));

  const featuredJobs = filteredJobs.filter((job) => job.isFeatured);
  const regularJobs = filteredJobs.filter((job) => !job.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-[#A92FFA] text-white">CAREERS</Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Be part of a transformational ministry that's changing lives and communities. 
            Whether you're seeking employment, internship opportunities, or volunteer positions, 
            there's a place for you at UCon Ministries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#A92FFA]">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Open Positions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#F28C28]">{departments.length}</p>
              <p className="text-sm text-muted-foreground">Departments</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#A92FFA]">24/7</p>
              <p className="text-sm text-muted-foreground">Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Job title, keyword, or department"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger id="department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Type Filter */}
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger id="location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery ||
                departmentFilter !== "all" ||
                typeFilter !== "all" ||
                locationFilter !== "all") && (
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="outline">
                    {filteredJobs.length} results
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No positions found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back soon for new opportunities.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-[#F28C28] fill-[#F28C28]" />
                    <h2 className="text-2xl font-bold">Featured Positions</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {featuredJobs.map((job) => (
                      <JobCard key={job.id} job={job} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Jobs */}
              {regularJobs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {featuredJobs.length > 0 ? "All Positions" : "Open Positions"}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regularJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/5 to-[#F28C28]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Join UCon Ministries?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Work with purpose, make lasting impact, and be part of a community 
              transforming lives every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Building2 className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle>Mission-Driven Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every role directly contributes to transforming lives and building 
                  stronger communities through faith and service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="w-10 h-10 text-[#F28C28] mb-3" />
                <CardTitle>Growth & Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access professional development, training, and leadership opportunities 
                  as you grow in your career and faith.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle>Supportive Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join a team that values authenticity, celebrates transformation, 
                  and walks alongside each other in purpose.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Job Card Component
function JobCard({ job, featured = false }: { job: JobPosting; featured?: boolean }) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? "border-2 border-[#F28C28]" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {featured && (
              <Badge className="mb-2 bg-[#F28C28] text-white">Featured</Badge>
            )}
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {job.employmentType}
            </Badge>
            {job.salaryRange && (
              <Badge variant="secondary">{job.salaryRange}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/careers/${job.slug}`} className="w-full">
          <Button className="w-full">
            View Details
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
