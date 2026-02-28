"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import TransitBookingForm from "./outreach/TransitBookingForm";
import OutreachRegistrationForm from "./outreach/OutreachRegistrationForm";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin, Calendar, CircleCheck, LogIn, ClipboardCheck } from "lucide-react";

export interface ServiceModalData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  shortDescription: string;
  fullDescription: string;
  image: string;
  features: string[];
  benefits: string[];
  cta: {
    primary: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
  contact?: {
    phone?: string;
    email?: string;
    hours?: string;
  };
  stats?: Array<{ label: string; value: string }>;
}

interface ServiceModalProps {
  data: ServiceModalData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceModal({ data, open, onOpenChange }: ServiceModalProps) {
  const [liveStats, setLiveStats] = useState<Array<{ label: string; value: string }> | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (open && data?.id) {
      setLoadingStats(true);
      fetch(`/api/outreach-stats?serviceId=${data.id}`)
        .then(res => res.json())
        .then(response => {
          if (response.stats) {
            setLiveStats(response.stats);
          }
        })
        .catch(err => {
          console.error('Failed to fetch live stats:', err);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [open, data?.id]);

  const { data: session } = useSession();

  if (!data) return null;
  
  const displayStats = liveStats || data.stats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative w-full h-64">
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Floating Icon */}
          <div className="absolute bottom-4 left-6 w-16 h-16 bg-[#A92FFA] rounded-xl flex items-center justify-center shadow-xl">
            {data.icon}
          </div>
        </div>

        <div className="px-6 py-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="details">Service Details</TabsTrigger>
              <TabsTrigger value="action" className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                {data.id === "transit" ? "Book a Ride" : "Apply / Join"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{data.title}</DialogTitle>
                <DialogDescription className="text-lg">{data.subtitle}</DialogDescription>
              </DialogHeader>

              {/* Stats */}
              {displayStats && displayStats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  {displayStats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-[#A92FFA]">
                        {loadingStats ? '...' : stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">{data.fullDescription}</p>

                {/* Features */}
                {data.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">What We Provide</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {data.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CircleCheck className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {data.benefits.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Impact & Benefits</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {data.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CircleCheck className="w-5 h-5 text-[#F28C28] mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {data.contact && (
                  <div className="bg-muted p-6 rounded-lg space-y-3">
                    <h3 className="text-xl font-semibold mb-4">Get Connected</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.contact.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-[#A92FFA]" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{data.contact.phone}</p>
                          </div>
                        </div>
                      )}
                      {data.contact.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-[#A92FFA]" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{data.contact.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="action">
              {!session ? (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <LogIn className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-bold mb-2">Registered Convicts Only</h3>
                    <p className="text-muted-foreground mb-6">
                      To access {data.title} services, you must be a registered member of our community. Please log in or create an account to proceed.
                    </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                          <Link href={`/login?redirect=${encodeURIComponent((typeof window !== 'undefined' ? window.location.pathname : '/') + '?openService=' + data.id)}`}>Login</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/register">Join Our Community</Link>
                        </Button>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto py-4">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">
                      {data.id === "transit" ? "Request a Ride" : `Apply for ${data.title}`}
                    </h2>
                    <p className="text-muted-foreground">
                      Fill out the form below and our team will process your request.
                    </p>
                  </div>

                  {data.id === "transit" ? (
                    <TransitBookingForm onSuccess={() => onOpenChange(false)} />
                  ) : (
                    <OutreachRegistrationForm 
                      serviceId={data.id} 
                      serviceTitle={data.title} 
                      onSuccess={() => onOpenChange(false)} 
                    />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
