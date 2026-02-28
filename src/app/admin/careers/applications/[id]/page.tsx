"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  ExternalLink,
  Save,
} from "lucide-react";

interface JobApplication {
  id: number;
  jobPostingId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeUrl?: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  currentEmployer?: string;
  expectedSalary?: string;
  availableStartDate?: string;
  howDidYouHear?: string;
  whyInterested: string;
  additionalInfo?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  interviewDate?: string;
  notes?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface JobPosting {
  id: number;
  title: string;
  department: string;
  employmentType: string;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [status, setStatus] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/job-applications/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setStatus(data.status);
        setInterviewDate(data.interviewDate || "");
        setNotes(data.notes || "");
        
        // Fetch job details
        const jobResponse = await fetch(`/api/job-postings/${data.jobPostingId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData);
        }
      } else {
        router.push("/admin/careers");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!application) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/job-applications/${application.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          interviewDate: interviewDate || null,
          notes,
        }),
      });

      if (response.ok) {
        alert("Application updated successfully");
        fetchApplication();
      } else {
        alert("Failed to update application");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
        <Link href="/admin/careers">
          <Button>Back to Careers</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "reviewing": return "default";
      case "interview": return "outline";
      case "hired": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/careers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Career Management
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {application.firstName} {application.lastName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Application for {job?.title || "Loading..."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Submitted: {new Date(application.submittedAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={getStatusColor(status)} className="text-lg py-2 px-4">
            {status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${application.email}`} className="text-[#A92FFA] hover:underline">
                  {application.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${application.phone}`} className="hover:text-[#A92FFA]">
                  {application.phone}
                </a>
              </div>
              {application.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p>{application.address}</p>
                    {application.city && application.state && (
                      <p>
                        {application.city}, {application.state} {application.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.yearsOfExperience !== undefined && (
                <div>
                  <Label>Years of Experience</Label>
                  <p className="text-muted-foreground">{application.yearsOfExperience} years</p>
                </div>
              )}
              
              {application.currentEmployer && (
                <div>
                  <Label>Current Employer</Label>
                  <p className="text-muted-foreground">{application.currentEmployer}</p>
                </div>
              )}
              
              {application.expectedSalary && (
                <div>
                  <Label>Expected Salary</Label>
                  <p className="text-muted-foreground">{application.expectedSalary}</p>
                </div>
              )}
              
              {application.availableStartDate && (
                <div>
                  <Label>Available Start Date</Label>
                  <p className="text-muted-foreground">
                    {new Date(application.availableStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {application.howDidYouHear && (
                <div>
                  <Label>How They Heard About Us</Label>
                  <p className="text-muted-foreground">{application.howDidYouHear}</p>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Links</Label>
                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#A92FFA] hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.linkedinUrl && (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#A92FFA] hover:underline"
                  >
                    LinkedIn Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#A92FFA] hover:underline"
                  >
                    Portfolio
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter & Motivation */}
          {application.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {application.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Why Interested?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {application.whyInterested}
              </p>
            </CardContent>
          </Card>

          {application.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {application.additionalInfo}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Status Management */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Update application status and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewDate">Interview Date (Optional)</Label>
                <Input
                  id="interviewDate"
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  rows={5}
                  placeholder="Add internal notes about this applicant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              {application.reviewedAt && (
                <div className="text-sm text-muted-foreground pt-4 border-t">
                  <p className="font-semibold">Last Reviewed</p>
                  <p>{new Date(application.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job && (
                <>
                  <div>
                    <Label>Position</Label>
                    <p className="text-muted-foreground">{job.title}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-muted-foreground">{job.department}</p>
                  </div>
                  <div>
                    <Label>Employment Type</Label>
                    <p className="text-muted-foreground">{job.employmentType}</p>
                  </div>
                  <Link href={`/careers/${job.id}`} target="_blank">
                    <Button variant="outline" className="w-full mt-4">
                      View Job Posting
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
