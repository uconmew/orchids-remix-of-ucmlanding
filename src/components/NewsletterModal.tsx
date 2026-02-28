"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Mail, CircleCheck, Loader2 } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call - in production, this would send to your email service
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail("");
        setName("");
      }, 2000);
    }, 1000);
  };

  const handleSkip = () => {
    onClose();
    setEmail("");
    setName("");
    setSuccess(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <Card className="max-w-md w-full animate-slide-in-up">
        <CardHeader className="relative">
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Stay Connected!</CardTitle>
          <CardDescription className="text-center">
            Thank you for submitting your prayer request. Join our newsletter to receive encouragement, updates, and prayer testimonies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8 animate-fade-in">
              <CircleCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Our Community!</h3>
              <p className="text-muted-foreground">You'll receive our newsletter soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="text-xs text-muted-foreground">
                By subscribing, you agree to receive occasional emails from UCon Ministries. You can unsubscribe at any time.
              </div>
              
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#F28C28] hover:bg-[#F28C28]/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Subscribe to Newsletter
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkip}
                  className="w-full"
                >
                  Maybe Later
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
