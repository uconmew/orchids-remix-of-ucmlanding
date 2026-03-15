"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, User, Phone, Mail, FileText, Shield, Info, Loader2, Heart } from "lucide-react";

interface OutreachRegistrationFormProps {
  serviceId: string;
  serviceTitle: string;
  onSuccess?: () => void;
}

export default function OutreachRegistrationForm({ 
  serviceId, 
  serviceTitle, 
  onSuccess 
}: OutreachRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    registrantName: '',
    registrantPhone: '',
    registrantEmail: '',
    notes: '',
    termsAccepted: false,
    coComplianceAccepted: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    if (!formData.termsAccepted || !formData.coComplianceAccepted) {
      setErrorMessage('You must accept both the terms of service and Colorado compliance acknowledgment');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/outreach/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          serviceId,
          registrantName: formData.registrantName,
          registrantEmail: formData.registrantEmail,
          registrantPhone: formData.registrantPhone,
          notes: formData.notes,
          termsAccepted: formData.termsAccepted,
          coComplianceAccepted: formData.coComplianceAccepted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      setSubmitStatus('success');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'An error occurred while submitting your registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-green-500">Registration Submitted!</h3>
            <p className="text-muted-foreground">
              Your registration for {serviceTitle} has been submitted and is pending review. You will receive a notification once it has been processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3 border border-[#A92FFA]/20">
        <Heart className="w-5 h-5 text-[#A92FFA] mt-0.5 flex-shrink-0" fill="currentColor" />
        <p className="text-sm">
          You are applying to join <strong>{serviceTitle}</strong>. We meet individuals at their point of need, offering immediate practical assistance and guiding them through a journey of healing and transformation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrantName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="registrantName"
              placeholder="Your full name"
              value={formData.registrantName}
              onChange={(e) => handleInputChange('registrantName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrantPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="registrantPhone"
              type="tel"
              placeholder="(720) 555-0123"
              value={formData.registrantPhone}
              onChange={(e) => handleInputChange('registrantPhone', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrantEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="registrantEmail"
              type="email"
              placeholder="your@email.com"
              value={formData.registrantEmail}
              onChange={(e) => handleInputChange('registrantEmail', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">How can we help you? What are you looking for?</Label>
          <Textarea
            id="notes"
            placeholder="Tell us a bit about yourself and why you're interested in this service..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <Card className="border border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Terms of Service & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold text-foreground text-sm">Terms of Service:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>You must be a registered member (Convict) of UCON Ministries</li>
              <li>Service availability is subject to resources and volunteer capacity</li>
              <li>You agree to participate respectfully and follow program guidelines</li>
              <li>Your information will only be used for ministry purposes</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="text-xs cursor-pointer">
              I have read and agree to the UCON Ministries Terms of Service for this program.
            </Label>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Shield className="w-3 h-3" />
              Colorado Compliance:
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>UCON Ministries operates as a faith-based 501(c)(3) nonprofit in Colorado</li>
              <li>Your personal information is protected under Colorado privacy laws</li>
              <li>All services operate in compliance with Colorado state regulations</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="coComplianceAccepted"
              checked={formData.coComplianceAccepted}
              onCheckedChange={(checked) => handleInputChange('coComplianceAccepted', checked as boolean)}
            />
            <Label htmlFor="coComplianceAccepted" className="text-xs cursor-pointer">
              I acknowledge Colorado compliance requirements and agree to provide accurate information.
            </Label>
          </div>

          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
            disabled={isSubmitting || !formData.termsAccepted || !formData.coComplianceAccepted}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Join {serviceTitle}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
