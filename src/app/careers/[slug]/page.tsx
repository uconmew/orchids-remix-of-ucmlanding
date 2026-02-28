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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CircleCheck,
  ArrowLeft,
  Send,
  Building2,
  Users,
  Star,
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Application form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    resumeUrl: "",
    coverLetter: "",
    linkedinUrl: "",
    portfolioUrl: "",
    yearsOfExperience: 0,
    currentEmployer: "",
    expectedSalary: "",
    availableStartDate: "",
    howDidYouHear: "",
    whyInterested: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (params.slug) {
      fetchJob();
    }
  }, [params.slug]);

  const fetchJob = async () => {
    try {
      // Find job by slug
      const response = await fetch("/api/job-postings");
      if (response.ok) {
        const jobs = await response.json();
        const foundJob = jobs.find((j: JobPosting) => j.slug === params.slug);
        if (foundJob) {
          setJob(foundJob);
        } else {
          router.push("/careers");
        }
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          jobPostingId: job.id,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setIsDialogOpen(false);
        // Send confirmation email
        await fetch("/api/job-applications/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            jobTitle: job.title,
            applicantName: `${formData.firstName} ${formData.lastName}`,
          }),
        });
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Loading position...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Position Not Found</h1>
          <Link href="/careers">
            <Button>Back to Careers</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const responsibilities = JSON.parse(job.responsibilities);
  const qualifications = JSON.parse(job.qualifications);
  const benefits = job.benefits ? JSON.parse(job.benefits) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Success Message */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 px-4 py-3 mb-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-green-800">
            <CircleCheck className="w-5 h-5" />
            <p>
              Application submitted successfully! Check your email for confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/careers">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Button>
        </Link>
      </div>

      {/* Job Header */}
      <section className="bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {job.isFeatured && (
                <Badge className="mb-3 bg-[#F28C28] text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {job.department}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {job.employmentType}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#A92FFA] hover:bg-[#A92FFA]/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <span className="flex items-center gap-2 justify-center">
                  <Users className="w-4 h-4" />
                  {job.applicationCount} applicants
                </span>
                {job.applicationDeadline && (
                  <span className="flex items-center gap-2 justify-center mt-1">
                    <Calendar className="w-4 h-4" />
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Details */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>About This Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {responsibilities.map((resp: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {qualifications.map((qual: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Ready to Apply?</CardTitle>
                  <CardDescription>
                    Join our team and make a lasting impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">What to expect:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Submit your application
                      </li>
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Initial review within 5 business days
                      </li>
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Phone or video interview
                      </li>
                      <li className="flex items-start gap-2">
                        <CircleCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Final interview and decision
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-2">Questions?</p>
                    <p>
                      Contact us at{" "}
                      <a
                        href="mailto:careers@uconministries.org"
                        className="text-[#A92FFA] hover:underline"
                      >
                        careers@uconministries.org
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your application
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
                  <Input
                    id="resumeUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.resumeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, resumeUrl: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.portfolioUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolioUrl: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearsOfExperience: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentEmployer">Current Employer (Optional)</Label>
                  <Input
                    id="currentEmployer"
                    value={formData.currentEmployer}
                    onChange={(e) =>
                      setFormData({ ...formData, currentEmployer: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
                  <Input
                    id="expectedSalary"
                    placeholder="$XX,XXX - $XX,XXX"
                    value={formData.expectedSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedSalary: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableStartDate">Available Start Date (Optional)</Label>
                  <Input
                    id="availableStartDate"
                    type="date"
                    value={formData.availableStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howDidYouHear">How did you hear about us? (Optional)</Label>
                  <Input
                    id="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={(e) =>
                      setFormData({ ...formData, howDidYouHear: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter & Additional Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    rows={5}
                    placeholder="Tell us about your interest in this position..."
                    value={formData.coverLetter}
                    onChange={(e) =>
                      setFormData({ ...formData, coverLetter: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyInterested">Why are you interested in this position? *</Label>
                  <Textarea
                    id="whyInterested"
                    rows={5}
                    placeholder="Share your motivation and what draws you to UCon Ministries..."
                    value={formData.whyInterested}
                    onChange={(e) =>
                      setFormData({ ...formData, whyInterested: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    rows={3}
                    placeholder="Anything else you'd like us to know?"
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalInfo: e.target.value })
                    }
                  />
                </div>
              </div>
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
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
