"use client"

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, Phone, MapPin, Clock, Send, MessageCircle,
  Heart, Users, Calendar, Building2, Headphones,
  CircleCheck, Sparkles, Facebook, Twitter, Instagram,
  Linkedin, ArrowRight
} from "lucide-react";
import Link from "next/link";

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

export default function ContactPage() {
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [formRef, formVisible] = useIntersectionObserver();
  const [infoRef, infoVisible] = useIntersectionObserver();
  const [waysRef, waysVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "general",
      message: ""
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      primary: "720.663.9243",
      secondary: "Main Office",
      color: "from-[#A92FFA] to-purple-600",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email",
      primary: "info@uconministries.org",
      secondary: "General Inquiries",
      color: "from-[#F28C28] to-orange-600",
      action: "Send Email"
    },
    {
      icon: MapPin,
      title: "Location",
      primary: "2000 S Colorado Blvd T1 Ste 2000",
      secondary: "Denver, CO 80202",
      color: "from-purple-600 to-[#A92FFA]",
      action: "Get Directions"
    },
    {
      icon: Clock,
      title: "Hours",
      primary: "24/7 Crisis Support",
      secondary: "Office: Mon-Fri 9AM-6PM",
      color: "from-[#F28C28] to-yellow-600",
      action: "View Schedule"
    }
  ];

  const getInvolvedOptions = [
    {
      icon: Heart,
      title: "Volunteer",
      description: "Join our team of dedicated volunteers making a difference in the community",
      action: "Apply to Volunteer",
      color: "from-[#A92FFA] to-purple-600"
    },
    {
      icon: Building2,
      title: "Partner Organization",
      description: "Collaborate with us to amplify our collective impact",
      action: "Explore Partnership",
      color: "from-[#F28C28] to-orange-600"
    },
    {
      icon: Users,
      title: "Donate",
      description: "Support our mission with a financial contribution",
      action: "Make a Donation",
      color: "from-purple-600 to-[#A92FFA]"
    },
    {
      icon: Calendar,
      title: "Attend an Event",
      description: "Join us for community gatherings, workshops, and celebrations",
      action: "See Events",
      color: "from-orange-600 to-[#F28C28]"
    },
    {
      icon: MessageCircle,
      title: "Join Prayer Wall",
      description: "Share prayer requests and pray for others in our community",
      action: "Visit Prayer Wall",
      color: "from-[#A92FFA] to-pink-600"
    },
    {
      icon: Headphones,
      title: "Career Opportunities",
      description: "Explore employment opportunities with UCon Ministries",
      action: "View Openings",
      color: "from-[#F28C28] to-red-600"
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#", color: "hover:text-blue-500" },
    { icon: Twitter, name: "Twitter", url: "#", color: "hover:text-blue-400" },
    { icon: Instagram, name: "Instagram", url: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, name: "LinkedIn", url: "#", color: "hover:text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden double-exposure"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-700 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-6 bg-[#A92FFA] hover:bg-[#A92FFA]/90 text-lg px-6 py-2">
              <MessageCircle className="w-5 h-5 mr-2" />
              Get in Touch
            </Badge>
            <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 transition-all duration-700 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Contact
              <br />
              <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                UCon Ministries
              </span>
            </h1>
            <p className={`text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto transition-all duration-700 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              We're here to listen, support, and connect with you. Reach out anytime—we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section 
        ref={infoRef}
        className="py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card 
                key={index}
                className={`hover-lift transition-all duration-700 ${
                  infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 mx-auto`}>
                    <method.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-center text-xl">{method.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="font-semibold text-lg mb-1">{method.primary}</p>
                  <p className="text-sm text-muted-foreground mb-4">{method.secondary}</p>
                  <Button variant="outline" size="sm" className="w-full border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section 
        ref={formRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#F28C28] hover:bg-[#F28C28]/90">
              <Send className="w-4 h-4 mr-2" />
              Send a Message
            </Badge>
            <h2 className="text-5xl font-bold mb-4">We'd Love to Hear From You</h2>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card className="hover-lift">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="720.663.9243"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="volunteer">Volunteer Opportunities</option>
                      <option value="ldi">LDI Program Information</option>
                      <option value="services">Services & Support</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="donation">Donation Information</option>
                      <option value="prayer">Prayer Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <Textarea
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  * Required fields. We typically respond within 24-48 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section 
        ref={waysRef}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            waysVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Involved
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">Ways to Connect</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              There are many ways to support our mission and make a difference in the community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getInvolvedOptions.map((option, index) => (
              <Card 
                key={index}
                className={`hover-lift transition-all duration-700 ${
                  waysVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${option.color} mb-4`} />
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{option.description}</p>
                  <Button variant="outline" className="w-full border-[#A92FFA] hover:bg-[#A92FFA] hover:text-white">
                    {option.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media & Location */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 overlay-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Social Media */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-3xl">Connect on Social Media</CardTitle>
                <CardDescription className="text-base">
                  Stay updated with our latest news, events, and stories of transformation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#A92FFA] to-[#F28C28] flex items-center justify-center text-white transition-transform hover:scale-110 ${social.color}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visit Us */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-3xl">Visit Our Office</CardTitle>
                <CardDescription className="text-base">
                  Stop by to learn more about our programs and how you can get involved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-[#A92FFA] flex-shrink-0" />
                  <div>
                    <p className="font-semibold">123 Hope Street</p>
                    <p className="text-muted-foreground">Denver, CO 80202</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-[#F28C28] flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Office Hours</p>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>
                <Button className="w-full bg-[#F28C28] hover:bg-[#F28C28]/90">
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Support CTA */}
      <section 
        ref={ctaRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-glow">
            <CardContent className="p-12 text-center">
              <CircleCheck className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Need Immediate Support?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                We offer 24/7 crisis support. If you or someone you know needs immediate assistance, don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Crisis Line
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white text-lg">
                  <Link href="/prayer-wall">
                    <Heart className="w-5 h-5 mr-2" />
                    Prayer Wall
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
