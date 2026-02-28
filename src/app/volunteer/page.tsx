"use client"

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Users, Calendar, CircleCheck } from "lucide-react";
import { toast } from "sonner";

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    availability: "",
    interests: [] as string[],
    experience: "",
    whyVolunteer: "",
    backgroundCheckConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availabilityOptions = [
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "both", label: "Both Weekdays & Weekends" },
  ];

  const interestOptions = [
    { value: "outreach", label: "Outreach & Community Service" },
    { value: "workshops", label: "Workshop Facilitation" },
    { value: "administrative", label: "Administrative Support" },
    { value: "transportation", label: "Transportation Services" },
    { value: "food_distribution", label: "Food Distribution" },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.whyVolunteer) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.backgroundCheckConsent) {
      toast.error("You must consent to a background check to volunteer");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/volunteer-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          interests: JSON.stringify(formData.interests),
        }),
      });

      if (response.ok) {
        toast.success("Application submitted successfully!");
        setSubmitted(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          availability: "",
          interests: [],
          experience: "",
          whyVolunteer: "",
          backgroundCheckConsent: false,
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 fade-in">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CircleCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Application Received!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your interest in volunteering with UCon Ministries. We've received your application and will review it carefully. A member of our team will contact you within 5-7 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Application
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Return Home
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 fade-in">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-[#A92FFA]">Join Our Team</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Volunteer With UCon
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Make a difference in your community. Join our team of passionate volunteers serving those in need and helping transform lives.
          </p>
        </div>
      </section>

      {/* Why Volunteer Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[#A92FFA]" />
                </div>
                <CardTitle>Make an Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Directly serve individuals and families in crisis, providing hope and practical assistance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-[#F28C28]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#F28C28]" />
                </div>
                <CardTitle>Build Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with like-minded individuals passionate about serving and making a difference.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-[#A92FFA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[#A92FFA]" />
                </div>
                <CardTitle>Flexible Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose volunteer opportunities that fit your schedule, from one-time events to ongoing commitments.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Volunteer Application</CardTitle>
              <CardDescription>
                Complete this form to begin your journey as a UCon Ministries volunteer. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="720.663.9243"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="CO"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Availability</h3>
                  <div className="space-y-2">
                    <Label>When are you available to volunteer?</Label>
                    <div className="space-y-2">
                      {availabilityOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={option.value}
                            name="availability"
                            value={option.value}
                            checked={formData.availability === option.value}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            className="w-4 h-4 text-primary"
                          />
                          <Label htmlFor={option.value} className="font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Areas of Interest */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Areas of Interest</h3>
                  <div className="space-y-2">
                    <Label>What volunteer opportunities interest you? (Select all that apply)</Label>
                    <div className="space-y-2">
                      {interestOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={formData.interests.includes(option.value)}
                            onCheckedChange={() => handleInterestToggle(option.value)}
                          />
                          <Label htmlFor={option.value} className="font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Previous Volunteer or Relevant Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Tell us about any previous volunteer work or relevant experience..."
                    rows={4}
                  />
                </div>

                {/* Why Volunteer */}
                <div className="space-y-2">
                  <Label htmlFor="whyVolunteer">Why do you want to volunteer with UCon Ministries? *</Label>
                  <Textarea
                    id="whyVolunteer"
                    value={formData.whyVolunteer}
                    onChange={(e) => setFormData({ ...formData, whyVolunteer: e.target.value })}
                    placeholder="Share your motivation and what draws you to our mission..."
                    rows={4}
                    required
                  />
                </div>

                {/* Background Check Consent */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="backgroundCheck"
                      checked={formData.backgroundCheckConsent}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, backgroundCheckConsent: checked as boolean })
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="backgroundCheck" className="font-normal cursor-pointer">
                        I consent to a background check as part of the volunteer application process. *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        UCon Ministries requires background checks for all volunteers to ensure the safety of those we serve.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}