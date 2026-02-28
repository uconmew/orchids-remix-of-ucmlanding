"use client"

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DonationCheckout } from "@/components/donations/DonationCheckout";
import { 
  Heart, DollarSign, Users, Home, Utensils, 
  GraduationCap, CircleCheck, ArrowRight, Sparkles,
  Calendar, RefreshCw, ArrowLeft, Mail
} from "lucide-react";

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

const donationTiers = [
  {
    id: "supporter",
    name: "Supporter",
    amount: 2500,
    color: "from-blue-500 to-blue-600",
    icon: Heart,
    description: "Help provide meals and basic necessities",
    impact: [
      "Provides 5 meals for someone in need",
      "Supports outreach transportation",
      "Helps stock our food pantry"
    ]
  },
  {
    id: "partner",
    name: "Partner",
    amount: 5000,
    color: "from-[#A92FFA] to-purple-600",
    icon: Users,
    popular: true,
    description: "Support counseling and mentorship programs",
    impact: [
      "Funds 2 counseling sessions",
      "Supports mentorship programs",
      "Provides workshop materials"
    ]
  },
  {
    id: "advocate",
    name: "Advocate",
    amount: 10000,
    color: "from-[#F28C28] to-orange-600",
    icon: Home,
    description: "Help provide housing support",
    impact: [
      "Covers housing costs for 1 week",
      "Provides emergency shelter assistance",
      "Supports facility maintenance"
    ]
  },
  {
    id: "champion",
    name: "Champion",
    amount: 25000,
    color: "from-green-500 to-green-600",
    icon: GraduationCap,
    description: "Invest in leadership development",
    impact: [
      "Supports LDI program curriculum",
      "Funds educational materials",
      "Enables skill-building workshops"
    ]
  }
];

type Step = "selection" | "info" | "payment" | "success";

export default function Donations() {
  const [selectedTier, setSelectedTier] = useState<string | null>("partner");
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<"one_time" | "recurring">("recurring");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    anonymous: false,
    message: ""
  });
  const [step, setStep] = useState<Step>("selection");
  const [error, setError] = useState<string | null>(null);

  const [heroRef, heroVisible] = useIntersectionObserver();
  const [tiersRef, tiersVisible] = useIntersectionObserver();
  const [impactRef, impactVisible] = useIntersectionObserver();

  const selectedTierData = donationTiers.find(t => t.id === selectedTier);
  const donationAmount = customAmount ? parseInt(customAmount) * 100 : (selectedTierData?.amount || 0);

  const handleContinue = () => {
    if (donationAmount < 100) {
      setError("Minimum donation is $1.00");
      return;
    }
    if (donationType === "recurring" && donationAmount < 500) {
      setError("Minimum recurring donation is $5.00");
      return;
    }
    setError(null);
    setStep("info");
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorInfo.email) {
      setError("Email is required");
      return;
    }
    if (!donorInfo.anonymous && !donorInfo.name) {
      setError("Name is required unless donating anonymously");
      return;
    }
    setError(null);
    setStep("payment");
  };

  const handlePaymentSuccess = () => {
    setStep("success");
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStartOver = () => {
    setStep("selection");
    setDonorInfo({ name: "", email: "", anonymous: false, message: "" });
    setSelectedTier("partner");
    setCustomAmount("");
    setError(null);
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CircleCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Thank You for Your <span className="text-[#A92FFA]">Generosity!</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your {donationType === "recurring" ? "recurring " : ""}donation of ${(donationAmount / 100).toFixed(2)}
              {donationType === "recurring" ? `/${interval}` : ""} will help transform lives through UCon Ministries.
            </p>
            <Card className="mb-8 text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#A92FFA]" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to <strong>{donorInfo.email}</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Your tax-deductible receipt will arrive within 24 hours
                  </p>
                </div>
                {donationType === "recurring" && (
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Your {interval}ly donation will be automatically processed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="lg"
              >
                Make Another Donation
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                size="lg"
                className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28]"
              >
                Return to Homepage
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
      
      <section 
        ref={heroRef}
        className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden overlay-gradient"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#F28C28] hover:bg-[#F28C28]/90">
              <Heart className="w-4 h-4 mr-2" fill="currentColor" />
              Make a Difference
            </Badge>
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 transition-all duration-1000 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Transform Lives Today
            </h1>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              Your generosity helps restore hope, dignity, and purpose to individuals impacted by addiction, homelessness, and personal brokenness.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div 
          ref={impactRef}
          className={`max-w-7xl mx-auto grid md:grid-cols-4 gap-6 transition-all duration-1000 ${
            impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-[#A92FFA]">250+</CardTitle>
              <CardDescription>Lives Transformed</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-[#F28C28]">10K+</CardTitle>
              <CardDescription>Meals Served</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-500">500+</CardTitle>
              <CardDescription>Counseling Sessions</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover-lift">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-blue-500">95%</CardTitle>
              <CardDescription>Program Success Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {step === "selection" && (
        <>
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div 
                ref={tiersRef}
                className={`text-center mb-12 transition-all duration-1000 ${
                  tiersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Impact Level</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Select a donation tier or enter a custom amount. Every dollar goes directly to transforming lives.
                </p>
              </div>

              <div className="flex gap-4 justify-center mb-8">
                <button
                  onClick={() => setDonationType("recurring")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    donationType === "recurring"
                      ? "bg-[#A92FFA] text-white shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Monthly
                </button>
                <button
                  onClick={() => setDonationType("one_time")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    donationType === "one_time"
                      ? "bg-[#F28C28] text-white shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  One-Time
                </button>
              </div>

              {donationType === "recurring" && (
                <div className="flex gap-2 justify-center mb-8">
                  <button
                    onClick={() => setInterval("month")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      interval === "month"
                        ? "bg-[#A92FFA]/10 text-[#A92FFA] border border-[#A92FFA]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setInterval("year")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      interval === "year"
                        ? "bg-[#A92FFA]/10 text-[#A92FFA] border border-[#A92FFA]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {donationTiers.map((tier, index) => {
                  const Icon = tier.icon;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setSelectedTier(tier.id);
                        setCustomAmount("");
                      }}
                      className="text-left transition-all duration-300"
                    >
                      <Card className={`h-full relative overflow-hidden hover-lift ${
                        selectedTier === tier.id ? 'border-[#A92FFA] ring-2 ring-[#A92FFA]/20' : ''
                      }`}>
                        {tier.popular && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-[#F28C28]">Most Popular</Badge>
                          </div>
                        )}
                        <CardHeader>
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-2xl">{tier.name}</CardTitle>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">${tier.amount / 100}</span>
                            {donationType === "recurring" && (
                              <span className="text-muted-foreground">/{interval}</span>
                            )}
                          </div>
                          <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {tier.impact.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CircleCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">{item}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>Custom Amount</CardTitle>
                    <CardDescription>Enter any amount you'd like to donate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedTier(null);
                        }}
                        className="pl-10"
                        min="1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {error && (
                <div className="max-w-md mx-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 px-12 py-6 text-lg"
                  disabled={donationAmount < 100}
                >
                  Continue to Donate ${(donationAmount / 100).toFixed(2)}
                  {donationType === "recurring" ? `/${interval}` : ""}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {step === "info" && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep("selection")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to donation options
            </button>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Information</CardTitle>
                <CardDescription>
                  {donationType === "recurring" 
                    ? `Setting up ${interval}ly donation of $${(donationAmount / 100).toFixed(2)}`
                    : `One-time donation of $${(donationAmount / 100).toFixed(2)}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Full Name {!donorInfo.anonymous && "*"}
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                      disabled={donorInfo.anonymous}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send your tax receipt to this email
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={donorInfo.anonymous}
                      onChange={(e) => setDonorInfo({...donorInfo, anonymous: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="anonymous" className="text-sm">
                      Make this donation anonymous
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Message (optional)
                    </label>
                    <textarea
                      placeholder="Share why you're supporting UCon Ministries..."
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})}
                      className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-[#A92FFA]/20 focus:border-[#A92FFA]"
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#A92FFA] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Tax Deductible</p>
                        <p className="text-sm text-muted-foreground">
                          UCon Ministries is a 501(c)(3) nonprofit. Your donation is tax-deductible.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-lg py-6"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {step === "payment" && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Complete Your Donation</CardTitle>
                <CardDescription>
                  Secure payment powered by Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonationCheckout
                  amount={donationAmount}
                  email={donorInfo.email}
                  name={donorInfo.name}
                  isAnonymous={donorInfo.anonymous}
                  donationType={donationType}
                  interval={interval}
                  tier={selectedTier || undefined}
                  message={donorInfo.message || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onBack={() => setStep("info")}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Other Ways to Give</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <Utensils className="w-10 h-10 text-[#F28C28] mb-3" />
                <CardTitle>In-Kind Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Donate food, clothing, household items, and other supplies that directly support our programs.
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/contact"}>
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <Users className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle>Volunteer Your Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your time and skills are valuable. Join our team of volunteers making a difference.
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/volunteer"}>
                  Get Involved
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <Heart className="w-10 h-10 text-green-500 mb-3" />
                <CardTitle>Legacy Giving</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a lasting impact through planned giving or estate gifts.
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/contact"}>
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
