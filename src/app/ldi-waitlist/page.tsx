"use client"

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, CircleCheck, Users, Calendar, 
  Heart, Sparkles, ArrowRight, Loader2
} from "lucide-react";

// Intersection Observer Hook
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
}

export default function LDIWaitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    currentSituation: "",
    experience: "",
    motivation: "",
    availability: "",
    emergencyContact: "",
    emergencyPhone: ""
  });

  const [heroRef, heroVisible] = useIntersectionObserver();
  const [formRef, formVisible] = useIntersectionObserver();
  const [infoRef, infoVisible] = useIntersectionObserver();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call - in production, this would save to database
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-full flex items-center justify-center mx-auto mb-6">
              <CircleCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Application Submitted!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your interest in the Leadership Development Institute. Our team will review your application and contact you within 5-7 business days.
            </p>
            <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#F28C28]/10 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">What Happens Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#A92FFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <p className="text-sm">Our team will review your application within 5-7 business days</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#A92FFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <p className="text-sm">We'll contact you to schedule an initial interview</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#A92FFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <p className="text-sm">You'll receive information about the next available cohort</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#A92FFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <p className="text-sm">Upon acceptance, we'll guide you through the onboarding process</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#F28C28] hover:bg-[#F28C28]/90">
                <a href="/">Return Home</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/ldi">Learn More About LDI</a>
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
      <section 
        ref={heroRef}
        className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden overlay-gradient"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <ClipboardList className="w-4 h-4 mr-2" />
              LDI Application
            </Badge>
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 transition-all duration-1000 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Join the Waiting List
            </h1>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              The Leadership Development Institute is currently in development. Register your interest to be among the first to join our transformative 64-week program.
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div 
          ref={infoRef}
          className={`max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 ${
            infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 hover-lift">
            <CardHeader>
              <Sparkles className="w-10 h-10 text-[#A92FFA] mb-3" />
              <CardTitle>64-Week Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Four-tier comprehensive leadership development program designed to transform lives and develop authentic leaders.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5 hover-lift">
            <CardHeader>
              <Users className="w-10 h-10 text-[#F28C28] mb-3" />
              <CardTitle>Full Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Housing, meals, counseling, and comprehensive support provided throughout your journey of transformation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#A92FFA]/10 via-[#F28C28]/10 to-accent/5 hover-lift">
            <CardHeader>
              <Heart className="w-10 h-10 text-accent mb-3" />
              <CardTitle>Life Transformation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Move from personal transformation to mentoring others and influencing entire systems. Where your past becomes your purpose.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div 
          ref={formRef}
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">LDI Waiting List Application</CardTitle>
              <CardDescription>
                Complete this form to express your interest in the Leadership Development Institute. All information is confidential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#A92FFA]">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name *</label>
                      <Input
                        type="text"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name *</label>
                      <Input
                        type="text"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                      <Input
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Age *</label>
                    <Input
                      type="number"
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      required
                      min="18"
                    />
                  </div>
                </div>

                {/* Background Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#F28C28]">Background & Situation</h3>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Situation *</label>
                    <Textarea
                      placeholder="Please describe your current living situation and circumstances..."
                      value={formData.currentSituation}
                      onChange={(e) => setFormData({...formData, currentSituation: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Relevant Experience
                    </label>
                    <Textarea
                      placeholder="Share any experience with recovery, rehabilitation, faith-based programs, or personal challenges you've overcome..."
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Motivation & Goals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#A92FFA]">Your Journey</h3>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Why are you interested in the LDI program? *
                    </label>
                    <Textarea
                      placeholder="Tell us what draws you to the Leadership Development Institute and what you hope to achieve..."
                      value={formData.motivation}
                      onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Availability *</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="">Select your availability</option>
                      <option value="immediate">Immediate (Within 1 month)</option>
                      <option value="1-3months">1-3 Months</option>
                      <option value="3-6months">3-6 Months</option>
                      <option value="6+months">6+ Months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#F28C28]">Emergency Contact</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Contact Name *</label>
                      <Input
                        type="text"
                        placeholder="Emergency contact full name"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Contact Phone *</label>
                      <Input
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Consent & Submit */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      By submitting this application, you acknowledge that all information provided is accurate and consent to be contacted by UCon Ministries regarding the LDI program. Your information will be kept confidential and used solely for program evaluation and communication.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
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
