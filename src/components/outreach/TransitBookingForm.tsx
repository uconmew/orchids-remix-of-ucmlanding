"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Calendar, MapPin, Clock, AlertCircle, CheckCircle, User, Phone, Mail, FileText, Shield, Info, Loader2, Key, Home, Star, Check, X } from "lucide-react";

interface TransitBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SavedAddress {
  id: number;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

interface AddressVerification {
  isValid: boolean;
  errors: { code: string; message: string; field: string }[];
  formattedAddress?: string;
}

const RIDE_PURPOSES = [
  { value: "job_interview", label: "Job Interview" },
  { value: "medical", label: "Medical Appointment" },
  { value: "court", label: "Court Date" },
  { value: "housing", label: "Housing Connection" },
  { value: "social_services", label: "Social Services Appointment" },
  { value: "grocery", label: "Grocery Shopping" },
  { value: "church", label: "Church/Religious Services" },
  { value: "other", label: "Other" },
];

export default function TransitBookingForm({ onSuccess, onCancel }: TransitBookingFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [availability, setAvailability] = useState<any[]>([]);
  const [requires24hOverride, setRequires24hOverride] = useState(false);
  const [overrideCode, setOverrideCode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [pickupVerification, setPickupVerification] = useState<AddressVerification | null>(null);
  const [destVerification, setDestVerification] = useState<AddressVerification | null>(null);
  const [isVerifyingPickup, setIsVerifyingPickup] = useState(false);
  const [isVerifyingDest, setIsVerifyingDest] = useState(false);

  const [formData, setFormData] = useState({
    riderName: '',
    riderPhone: '',
    riderEmail: '',
    pickupLocation: '',
    destination: '',
    requestedDate: '',
    requestedTime: '',
    ridePurpose: '',
    specialNeeds: '',
    userNotes: '',
    termsAccepted: false,
    coComplianceAccepted: false,
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        riderName: session.user.name || '',
        riderEmail: session.user.email || '',
      }));
    }
  }, [session]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch('/api/outreach/transit/availability');
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };
    fetchAvailability();
  }, []);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!session?.user) return;
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch('/api/user-addresses', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
        }
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
      }
    };
    fetchSavedAddresses();
  }, [session]);

  const verifyAddress = async (address: string, type: 'pickup' | 'destination') => {
    if (!address.trim()) return;
    
    const setVerifying = type === 'pickup' ? setIsVerifyingPickup : setIsVerifyingDest;
    const setVerification = type === 'pickup' ? setPickupVerification : setDestVerification;
    
    setVerifying(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/address-verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ address }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerification(data);
      }
    } catch (error) {
      console.error('Error verifying address:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectSavedAddress = (addressId: string, field: 'pickupLocation' | 'destination') => {
    const address = savedAddresses.find(a => a.id.toString() === addressId);
    if (address) {
      handleInputChange(field, address.fullAddress);
      if (field === 'pickupLocation') {
        setPickupVerification({ isValid: true, errors: [], formattedAddress: address.fullAddress });
      } else {
        setDestVerification({ isValid: true, errors: [], formattedAddress: address.fullAddress });
      }
    }
  };

  const handleUseSuggested = (type: 'pickup' | 'destination') => {
    const verification = type === 'pickup' ? pickupVerification : destVerification;
    if (verification?.formattedAddress) {
      handleInputChange(type === 'pickup' ? 'pickupLocation' : 'destination', verification.formattedAddress);
      if (type === 'pickup') {
        setPickupVerification({ ...verification, isValid: true, errors: [] });
      } else {
        setDestVerification({ ...verification, isValid: true, errors: [] });
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitStatus('idle');
    setErrorMessage('');
    setRequires24hOverride(false);
    
    if (field === 'pickupLocation') setPickupVerification(null);
    if (field === 'destination') setDestVerification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    if (!formData.pickupLocation || !formData.destination || !formData.requestedDate || !formData.requestedTime) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAccepted || !formData.coComplianceAccepted) {
      setErrorMessage('You must accept both the terms of service and Colorado compliance acknowledgment');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestedTime = new Date(`${formData.requestedDate}T${formData.requestedTime}`).toISOString();
      const token = localStorage.getItem("bearer_token");

      const response = await fetch('/api/outreach/transit/book', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          riderName: formData.riderName,
          riderPhone: formData.riderPhone,
          riderEmail: formData.riderEmail,
          pickupLocation: formData.pickupLocation,
          destination: formData.destination,
          requestedTime,
          ridePurpose: formData.ridePurpose,
          specialNeeds: formData.specialNeeds,
          userNotes: formData.userNotes,
          termsAccepted: formData.termsAccepted,
          coComplianceAccepted: formData.coComplianceAccepted,
          overrideCode: overrideCode || undefined,
        }),
      });

      const data = await response.json();

        if (!response.ok) {
          if (data.requires24hOverride || data.requiresOpenHoursOverride) {
            setRequires24hOverride(true);
            // Include error code in message if present
            const errorMsg = data.code 
              ? `[${data.code}] ${data.error}` 
              : data.error;
            setErrorMessage(errorMsg);
            setSubmitStatus('error');
          } else {
            // Include error code if present
            const errorMsg = data.code 
              ? `[${data.code}] ${data.error || 'Failed to submit booking'}` 
              : (data.error || 'Failed to submit booking');
            throw new Error(errorMsg);
          }
          setIsSubmitting(false);
          return;
        }

      setSubmitStatus('success');
      setRequires24hOverride(false);
      setOverrideCode('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (submitStatus === 'success') {
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-green-500">Request Submitted Successfully!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your transit request has been received. A staff member will review your request and respond within 24-48 hours.
              </p>
            </div>

            <Card className="bg-muted/50 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#A92FFA]" />
                  Request Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Pickup:</span>
                    <p className="font-medium">{formData.pickupLocation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Destination:</span>
                    <p className="font-medium">{formData.destination}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{formData.requestedDate ? new Date(formData.requestedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{formData.requestedTime ? new Date(`2000-01-01T${formData.requestedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</p>
                  </div>
                  {formData.ridePurpose && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Purpose:</span>
                      <p className="font-medium">{RIDE_PURPOSES.find(p => p.value === formData.ridePurpose)?.label || formData.ridePurpose}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-[#A92FFA]/5 border border-[#A92FFA]/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-[#A92FFA]">
                <Info className="w-4 h-4" />
                What Happens Next?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>A staff member will review your request</li>
                <li>You'll receive a notification when your request is approved or if more info is needed</li>
                <li>Track your request status anytime in your Convict Portal</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild className="bg-[#A92FFA] hover:bg-[#A92FFA]/90">
                <a href="/convict-portal">
                  <User className="w-4 h-4 mr-2" />
                  Go to Convict Portal
                </a>
              </Button>
              <Button onClick={() => setSubmitStatus('idle')} variant="outline">
                Submit Another Request
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="ghost">
                  Close
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
            <div className="w-12 h-12 rounded-lg bg-[#A92FFA]/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#A92FFA]" />
            </div>
            <div>
              <CardTitle>Request a Ride</CardTitle>
              <CardDescription>Fill out this form to request transportation services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riderName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
                <Input
                  id="riderName"
                  placeholder="Your full name"
                  value={formData.riderName}
                  onChange={(e) => handleInputChange('riderName', e.target.value)}
                  readOnly={!!session?.user}
                  className={session?.user ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riderPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="riderPhone"
                  type="tel"
                  placeholder="(720) 555-0123"
                  value={formData.riderPhone}
                  onChange={(e) => handleInputChange('riderPhone', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riderEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="riderEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.riderEmail}
                  onChange={(e) => handleInputChange('riderEmail', e.target.value)}
                  readOnly={!!session?.user}
                  className={session?.user ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
          </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Pickup Location *
                </Label>
                {savedAddresses.length > 0 && (
                  <Select onValueChange={(val) => handleSelectSavedAddress(val, 'pickupLocation')}>
                    <SelectTrigger className="mb-2">
                      <SelectValue placeholder="Select from saved addresses" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id.toString()}>
                          <div className="flex items-center gap-2">
                            {addr.isDefault && <Star className="w-3 h-3 text-amber-500" />}
                            <Home className="w-3 h-3" />
                            <span className="font-medium">{addr.label}</span>
                            <span className="text-muted-foreground text-xs truncate max-w-[200px]">{addr.fullAddress}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative">
                  <Input
                    id="pickupLocation"
                    placeholder="Full address (e.g., 123 Main St, Denver, CO 80202)"
                    value={formData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    onBlur={() => verifyAddress(formData.pickupLocation, 'pickup')}
                    required
                    className={pickupVerification ? (pickupVerification.isValid ? 'border-green-500' : 'border-amber-500') : ''}
                  />
                  {isVerifyingPickup && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                  {!isVerifyingPickup && pickupVerification?.isValid && <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
                </div>
                {pickupVerification && !pickupVerification.isValid && pickupVerification.errors.length > 0 && (
                  <div className="text-xs space-y-1">
                    {pickupVerification.errors.map((err, i) => (
                      <p key={i} className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        [{err.code}] {err.message}
                      </p>
                    ))}
                    {pickupVerification.formattedAddress && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-700 dark:text-blue-300 text-xs font-medium mb-1">Suggested correction:</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-auto py-2 px-3 text-left justify-start border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          onClick={() => handleUseSuggested('pickup')}
                        >
                          <Check className="w-3 h-3 mr-2 flex-shrink-0 text-green-500" />
                          <span className="truncate">{pickupVerification.formattedAddress}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Destination *
                </Label>
                {savedAddresses.length > 0 && (
                  <Select onValueChange={(val) => handleSelectSavedAddress(val, 'destination')}>
                    <SelectTrigger className="mb-2">
                      <SelectValue placeholder="Select from saved addresses" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id.toString()}>
                          <div className="flex items-center gap-2">
                            {addr.isDefault && <Star className="w-3 h-3 text-amber-500" />}
                            <Home className="w-3 h-3" />
                            <span className="font-medium">{addr.label}</span>
                            <span className="text-muted-foreground text-xs truncate max-w-[200px]">{addr.fullAddress}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative">
                  <Input
                    id="destination"
                    placeholder="Full address (e.g., 456 Oak Ave, Denver, CO 80203)"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    onBlur={() => verifyAddress(formData.destination, 'destination')}
                    required
                    className={destVerification ? (destVerification.isValid ? 'border-green-500' : 'border-amber-500') : ''}
                  />
                  {isVerifyingDest && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                  {!isVerifyingDest && destVerification?.isValid && <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
                </div>
                {destVerification && !destVerification.isValid && destVerification.errors.length > 0 && (
                  <div className="text-xs space-y-1">
                    {destVerification.errors.map((err, i) => (
                      <p key={i} className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        [{err.code}] {err.message}
                      </p>
                    ))}
                    {destVerification.formattedAddress && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-700 dark:text-blue-300 text-xs font-medium mb-1">Suggested correction:</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-auto py-2 px-3 text-left justify-start border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          onClick={() => handleUseSuggested('destination')}
                        >
                          <Check className="w-3 h-3 mr-2 flex-shrink-0 text-green-500" />
                          <span className="truncate">{destVerification.formattedAddress}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Requested Date *
              </Label>
              <Input
                id="requestedDate"
                type="date"
                value={formData.requestedDate}
                onChange={(e) => handleInputChange('requestedDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Requested Time *
              </Label>
              <Input
                id="requestedTime"
                type="time"
                value={formData.requestedTime}
                onChange={(e) => handleInputChange('requestedTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ridePurpose">Purpose of Ride *</Label>
              <Select value={formData.ridePurpose} onValueChange={(value) => handleInputChange('ridePurpose', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {RIDE_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Special Needs or Accommodations</Label>
            <Textarea
              id="specialNeeds"
              placeholder="Wheelchair accessible, mobility assistance, multiple stops, etc."
              value={formData.specialNeeds}
              onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userNotes">Additional Notes</Label>
            <Textarea
              id="userNotes"
              placeholder="Any other information that would help us serve you better"
              value={formData.userNotes}
              onChange={(e) => handleInputChange('userNotes', e.target.value)}
              rows={2}
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
              UCON Transit is a faith-based community transportation service provided to registered Convicts (registered members) of UCON Ministries. 
              Service availability depends on volunteer drivers and vehicle availability.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground">Terms of Service:</h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>Rides are subject to availability and must be requested at least 24 hours in advance</li>
              <li>Riders must be registered members (Convicts) of UCON Ministries</li>
              <li>Cancellations must be made at least 2 hours before scheduled pickup</li>
              <li>No-shows without notice may result in temporary suspension of service</li>
              <li>Service is provided for approved purposes only (medical, employment, court, etc.)</li>
              <li>Riders must conduct themselves respectfully and follow driver instructions</li>
              <li>UCON Ministries reserves the right to deny service for safety concerns</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
              I have read and agree to the UCON Transit Terms of Service. I understand that this service is volunteer-based and subject to availability.
            </Label>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Colorado Compliance Acknowledgment:
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>All UCON Transit drivers maintain valid Colorado driver's licenses</li>
              <li>Vehicles are properly registered and insured in the State of Colorado</li>
              <li>Service operates in compliance with Colorado nonprofit transportation guidelines</li>
              <li>Your personal information is protected under Colorado privacy laws</li>
              <li>This is a volunteer-based ministry service, not a commercial transportation company</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="coComplianceAccepted"
              checked={formData.coComplianceAccepted}
              onCheckedChange={(checked) => handleInputChange('coComplianceAccepted', checked as boolean)}
            />
            <Label htmlFor="coComplianceAccepted" className="text-sm cursor-pointer">
              I acknowledge that UCON Transit operates as a faith-based ministry service in compliance with Colorado state regulations, and I agree to provide accurate information for this ride request.
            </Label>
          </div>

          {submitStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {requires24hOverride && (
              <Card className="border-2 border-amber-500/50 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                    <Key className="w-5 h-5" />
                    Override Code Required
                  </CardTitle>
                <CardDescription>
                    {errorMessage || 'An override code is required to complete this booking.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="overrideCode" className="text-sm font-medium">
                      4-Digit Override Code
                    </Label>
                    <Input
                      id="overrideCode"
                      type="text"
                      maxLength={4}
                      placeholder="Enter code (e.g., 1234)"
                      value={overrideCode}
                      onChange={(e) => setOverrideCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="text-center text-2xl tracking-[0.5em] font-mono border-2 border-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Contact staff at <a href="tel:7206639243" className="text-amber-600 font-medium">720.663.9243</a> or your assigned case worker to obtain an override code for urgent requests.</p>
                    <p className="text-amber-600 font-semibold">Note: Override codes expire 5 minutes after generation. Staff will provide the exact expiration time.</p>
                  </div>
                </CardContent>
              </Card>
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
                  <Truck className="w-4 h-4 mr-2" />
                  Submit Ride Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
