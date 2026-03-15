"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Briefcase,
  Users,
  Calendar,
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
  createdAt: string;
  updatedAt: string;
}

interface JobApplication {
  id: number;
  jobPostingId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  submittedAt: string;
}

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    salaryRange: "",
    description: "",
    responsibilities: [] as string[],
    qualifications: [] as string[],
    benefits: [] as string[],
    applicationDeadline: "",
    isPublished: false,
    isFeatured: false,
  });

  // Dynamic list inputs
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newQualification, setNewQualification] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/job-postings?includeUnpublished=true");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/job-applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleOpenDialog = (job?: JobPosting) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        employmentType: job.employmentType,
        salaryRange: job.salaryRange || "",
        description: job.description,
        responsibilities: JSON.parse(job.responsibilities),
        qualifications: JSON.parse(job.qualifications),
        benefits: job.benefits ? JSON.parse(job.benefits) : [],
        applicationDeadline: job.applicationDeadline || "",
        isPublished: job.isPublished,
        isFeatured: job.isFeatured,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        department: "",
        location: "",
        employmentType: "",
        salaryRange: "",
        description: "",
        responsibilities: [],
        qualifications: [],
        benefits: [],
        applicationDeadline: "",
        isPublished: false,
        isFeatured: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingJob
        ? `/api/job-postings/${editingJob.id}`
        : "/api/job-postings";
      const method = editingJob ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchJobs();
        setIsDialogOpen(false);
      } else {
        alert("Failed to save job posting");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;

    try {
      const response = await fetch(`/api/job-postings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const togglePublish = async (job: JobPosting) => {
    try {
      const response = await fetch(`/api/job-postings/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !job.isPublished }),
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const toggleFeatured = async (job: JobPosting) => {
    try {
      const response = await fetch(`/api/job-postings/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !job.isFeatured }),
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResponsibility],
      });
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification],
      });
      setNewQualification("");
    }
  };

  const removeQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit],
      });
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const stats = {
    totalJobs: jobs.length,
    publishedJobs: jobs.filter((j) => j.isPublished).length,
    totalApplications: applications.length,
    pendingReview: applications.filter((a) => a.status === "submitted").length,
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Career Board Management</h1>
          <p className="text-muted-foreground">
            Manage job postings and applications
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5" />
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.publishedJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingReview}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>All Job Postings</CardTitle>
              <CardDescription>
                Manage your career opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {job.isFeatured && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                          {job.title}
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.employmentType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={job.isPublished ? "default" : "secondary"}>
                          {job.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.viewCount}</TableCell>
                      <TableCell>{job.applicationCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePublish(job)}
                            title={job.isPublished ? "Unpublish" : "Publish"}
                          >
                            {job.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFeatured(job)}
                            title={job.isFeatured ? "Unfeature" : "Feature"}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                job.isFeatured ? "fill-yellow-400 text-yellow-400" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(job)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                View and manage candidate applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const job = jobs.find((j) => j.id === app.jobPostingId);
                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.firstName} {app.lastName}
                        </TableCell>
                        <TableCell>{job?.title || "Unknown"}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === "submitted"
                                ? "secondary"
                                : app.status === "reviewing"
                                ? "default"
                                : app.status === "interview"
                                ? "outline"
                                : app.status === "hired"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/admin/careers/applications/${app.id}`;
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job Posting" : "Create Job Posting"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the job posting
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employmentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  value={formData.salaryRange}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryRange: e.target.value })
                  }
                  placeholder="e.g. $50,000 - $70,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationDeadline: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
                required
              />
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <Label>Responsibilities *</Label>
              <div className="flex gap-2">
                <Input
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  placeholder="Add a responsibility"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                />
                <Button type="button" onClick={addResponsibility}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {formData.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                    <span className="flex-1">{resp}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <Label>Qualifications *</Label>
              <div className="flex gap-2">
                <Input
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add a qualification"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addQualification())}
                />
                <Button type="button" onClick={addQualification}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {formData.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                    <span className="flex-1">{qual}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualification(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label>Benefits (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-2">
                {formData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                    <span className="flex-1">{benefit}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>Publish immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>Feature this job</span>
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingJob ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
