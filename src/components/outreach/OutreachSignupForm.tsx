"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, User, Phone, Mail, FileText, Shield, Info, Loader2 } from "lucide-react";

interface OutreachSignupFormProps {
  serviceId: string;
  serviceName: string;
  serviceIcon?: React.ReactNode;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OutreachSignupForm({ 
  serviceId, 
  serviceName, 
  serviceIcon,
  onSuccess, 
  onCancel 
}: OutreachSignupFormProps) {
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
      const response = await fetch('/api/outreach/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (onSuccess) onSuccess();
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
              Your registration for {serviceName} has been submitted and is pending review. You will receive a notification once it has been processed.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={() => setSubmitStatus('idle')} variant="outline">
                Register for Another Service
              </Button>
              {onCancel && (
                <Button onClick={onCancel}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {serviceIcon && (
              <div className="w-12 h-12 rounded-lg bg-[#A92FFA]/10 flex items-center justify-center">
                {serviceIcon}
              </div>
            )}
            <div>
              <CardTitle>Join {serviceName}</CardTitle>
              <CardDescription>Complete this form to register for this service</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label htmlFor="notes">Why are you interested in this service?</Label>
            <Textarea
              id="notes"
              placeholder="Tell us a bit about yourself and why you're interested in this service..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#A92FFA]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Terms of Service & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-sm">
              {serviceName} is a faith-based community service provided to registered Convicts (registered members) of UCON Ministries.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground">Terms of Service:</h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must be a registered member (Convict) of UCON Ministries to access services</li>
              <li>Service availability is subject to resources and volunteer capacity</li>
              <li>You agree to participate respectfully and follow program guidelines</li>
              <li>UCON Ministries reserves the right to modify or discontinue services</li>
              <li>Your information will only be used for ministry purposes</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
              I have read and agree to the UCON Ministries Terms of Service for this program.
            </Label>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Colorado Compliance Acknowledgment:
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>UCON Ministries operates as a faith-based 501(c)(3) nonprofit in Colorado</li>
              <li>Your personal information is protected under Colorado privacy laws</li>
              <li>All services operate in compliance with Colorado state regulations</li>
              <li>You have the right to opt-out of any service at any time</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="coComplianceAccepted"
              checked={formData.coComplianceAccepted}
              onCheckedChange={(checked) => handleInputChange('coComplianceAccepted', checked as boolean)}
            />
            <Label htmlFor="coComplianceAccepted" className="text-sm cursor-pointer">
              I acknowledge that UCON Ministries operates in compliance with Colorado state regulations and I agree to provide accurate information.
            </Label>
          </div>

          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-[#A92FFA] hover:bg-[#A92FFA]/90"
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
                  Submit Registration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
