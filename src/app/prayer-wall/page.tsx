"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsletterModal from "@/components/NewsletterModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Search, Plus, User, Clock, Users,
  CircleCheck, Sparkles, MessageCircle, Loader2,
  ChevronDown, ChevronUp, Send, Edit2, Reply
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const categories = [
  { value: "all", label: "All Prayers", color: "bg-primary" },
  { value: "Healing", label: "Healing", color: "bg-red-500" },
  { value: "Strength", label: "Strength", color: "bg-blue-500" },
  { value: "Guidance", label: "Guidance", color: "bg-[#A92FFA]" },
  { value: "Family", label: "Family", color: "bg-green-500" },
  { value: "Provision", label: "Provision", color: "bg-yellow-500" },
  { value: "Ministry", label: "Ministry", color: "bg-indigo-500" },
  { value: "Breakthrough", label: "Breakthrough", color: "bg-[#F28C28]" }
];

// Intersection Observer Hook for animations
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // CRITICAL: Save scroll before visibility change
        const currentScroll = window.scrollY;
        requestAnimationFrame(() => {
          setIsVisible(true);
          // Restore scroll after state update
          requestAnimationFrame(() => {
            window.scrollTo(0, currentScroll);
          });
        });
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
}

export default function PrayerWall() {
  // Session for logged in user
  const { data: session } = useSession();
  
  // CRITICAL: Prevent auto-scrolling during renders
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);
  
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [expandedPrayer, setExpandedPrayer] = useState<number | null>(null);
  const [prayerText, setPrayerText] = useState<{[key: number]: string}>({});
  const [opReply, setOpReply] = useState<{[key: number]: string}>({});
  const [submittingPrayer, setSubmittingPrayer] = useState<number | null>(null);
  const [submittingReply, setSubmittingReply] = useState<number | null>(null);
  
  // Edit prayer modal state
  const [editingPrayerId, setEditingPrayerId] = useState<number | null>(null);
  const [editPrayerRequest, setEditPrayerRequest] = useState("");
  const [editingPrayer, setEditingPrayer] = useState(false);
  
  // Reply to community prayer state
  const [replyingToPrayerId, setReplyingToPrayerId] = useState<number | null>(null);
  const [communityReply, setCommunityReply] = useState("");
  const [submittingCommunityReply, setSubmittingCommunityReply] = useState(false);
  
  // NEW: Live stats state from API
    const [liveStats, setLiveStats] = useState({
      prayersCount: 0,
      communityPrayers: 0,
      messageCount: 0
    });

  
  // NEW: Pray modal state
  const [showPrayModal, setShowPrayModal] = useState(false);
  const [selectedPrayerId, setSelectedPrayerId] = useState<number | null>(null);
  const [prayModalMessage, setPrayModalMessage] = useState("");
  const [submittingPrayModal, setSubmittingPrayModal] = useState(false);
  
  // NEW: All messages modal state
  const [showAllMessagesModal, setShowAllMessagesModal] = useState(false);
  const [allMessagesPrayerId, setAllMessagesPrayerId] = useState<number | null>(null);
  
  // NEW: Featured prayers state (persisted daily)
  const [featuredPrayerIds, setFeaturedPrayerIds] = useState<number[]>([]);
  
  // Animation refs
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [statsRef, statsVisible] = useIntersectionObserver();
  const [filtersRef, filtersVisible] = useIntersectionObserver();
  const [infoRef, infoVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    anonymous: false,
    category: "Strength",
    prayerRequest: ""
  });
  
  // Helper function to get display name (first name + last initial)
  const getDisplayName = (fullName: string | undefined): string => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1]?.[0] || "";
    return `${firstName} ${lastInitial}.`;
  };
  
  // Pre-populate name when user logs in
  useEffect(() => {
    if (session?.user?.name && !formData.name && !formData.anonymous) {
      setFormData(prev => ({ ...prev, name: getDisplayName(session.user.name) }));
    }
  }, [session?.user?.name]);

  // NEW: Load featured prayers from localStorage (once per day)
  useEffect(() => {
    const stored = localStorage.getItem('featuredPrayers');
    if (stored) {
      try {
        const { ids, date } = JSON.parse(stored);
        const today = new Date().toDateString();
        
        // If stored date is today, use stored IDs
        if (date === today) {
          setFeaturedPrayerIds(ids);
        } else {
          // Clear old data if it's a new day
          localStorage.removeItem('featuredPrayers');
        }
      } catch (error) {
        // Invalid data, clear it
        localStorage.removeItem('featuredPrayers');
      }
    }
  }, []);

  // Fetch prayers from API - ONLY ON PAGE LOAD, NO POLLING
  useEffect(() => {
    fetchPrayers();
    fetchStats(); // Fetch live stats on mount
    // REMOVED: Live polling interval - only fetch once on mount
  }, []);

  const fetchPrayers = async () => {
    // CRITICAL: Save scroll position before update
    const currentScroll = window.scrollY;
    
    try {
      setLoading(true);
      const response = await fetch('/api/prayers?limit=5000');
      if (response.ok) {
        const data = await response.json();
        setPrayers(data.slice(0, 5000));
        
        // CRITICAL: Restore scroll position after update
        requestAnimationFrame(() => {
          window.scrollTo(0, currentScroll);
        });
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
      toast.error('Failed to load prayers');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch live stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
          setLiveStats({
            prayersCount: data.prayersCount || 0,
            communityPrayers: data.communityPrayers || 0,
            messageCount: data.messageCount || 0
          });

      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // NEW: Generate featured prayers once when prayers load (if not already set for today)
  useEffect(() => {
    if (prayers.length > 0 && featuredPrayerIds.length === 0) {
      // Generate new random selection
      const shuffled = [...prayers].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      const selectedIds = selected.map(p => p.id);
      
      // Store in localStorage with today's date
      const today = new Date().toDateString();
      localStorage.setItem('featuredPrayers', JSON.stringify({
        ids: selectedIds,
        date: today
      }));
      
      setFeaturedPrayerIds(selectedIds);
    }
  }, [prayers, featuredPrayerIds]);

  // Get featured prayers (memoized)
  const featuredPrayers = featuredPrayerIds
    .map(id => prayers.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 3);

  // Filter prayers with proper null checks
  const filteredPrayers = prayers
    .filter(prayer => {
      const matchesCategory = selectedCategory === "all" || prayer.category === selectedCategory;
      const searchLower = searchQuery?.toLowerCase() || "";
      const prayerRequestLower = (prayer.prayerRequest || "").toLowerCase();
      const nameLower = (prayer.name || "").toLowerCase();
      const matchesSearch = !searchQuery || 
        prayerRequestLower.includes(searchLower) ||
        nameLower.includes(searchLower);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "popular") {
        // FIXED: Use prayCount field for sorting by popularity
        const aCount = a.prayCount || 0;
        const bCount = b.prayCount || 0;
        return bCount - aCount;
      }
      return 0;
    });

  // Get top 3 most prayed for (by prayCount field)
  const mostPrayedFor = [...prayers]
    .sort((a, b) => {
      // FIXED: Use prayCount field instead of prayers.length
      const aCount = a.prayCount || 0;
      const bCount = b.prayCount || 0;
      return bCount - aCount;
    })
    .slice(0, 3);

  const handlePrayFor = async (prayerId: number) => {
    if (!prayerText[prayerId]?.trim()) return;
    
    setSubmittingPrayer(prayerId);
    try {
      const response = await fetch(`/api/prayers?id=${prayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addPrayer',
          prayerText: prayerText[prayerId]
        })
      });
      
      if (response.ok) {
        const updatedPrayer = await response.json();
        setPrayers(prayers.map(prayer => 
          prayer.id === prayerId ? updatedPrayer : prayer
        ));
        setPrayerText({...prayerText, [prayerId]: ''});
        toast.success('Prayer added successfully!');
      } else {
        toast.error('Failed to add prayer');
      }
    } catch (error) {
      console.error('Error adding prayer:', error);
      toast.error('Failed to add prayer');
    } finally {
      setSubmittingPrayer(null);
    }
  };

  const handleOpReply = async (prayerId: number) => {
    if (!opReply[prayerId]?.trim()) return;
    
    setSubmittingReply(prayerId);
    try {
      const response = await fetch(`/api/prayers?id=${prayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addOpReply',
          opReply: opReply[prayerId]
        })
      });
      
      if (response.ok) {
        const updatedPrayer = await response.json();
        setPrayers(prayers.map(prayer => 
          prayer.id === prayerId ? updatedPrayer : prayer
        ));
        setOpReply({...opReply, [prayerId]: ''});
        toast.success('Reply posted successfully!');
      } else {
        toast.error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error adding OP reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(null);
    }
  };

  // NEW: Handle pray button click
  const handlePrayButtonClick = (prayerId: number) => {
    setSelectedPrayerId(prayerId);
    setPrayModalMessage("");
    setShowPrayModal(true);
  };

  // NEW: Handle pray modal submit
  const handlePrayModalSubmit = async () => {
    if (!selectedPrayerId) return;
    
    setSubmittingPrayModal(true);
    try {
      const hasMessage = prayModalMessage.trim().length > 0;
      
      const response = await fetch(`/api/prayers?id=${selectedPrayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addPrayer',
          // FIXED: Send empty string when no message, so API only increments count
          prayerText: hasMessage ? prayModalMessage.trim() : ''
        })
      });
      
      if (response.ok) {
        const updatedPrayer = await response.json();
        setPrayers(prayers.map(prayer => 
          prayer.id === selectedPrayerId ? updatedPrayer : prayer
        ));
        setShowPrayModal(false);
        setPrayModalMessage("");
        setSelectedPrayerId(null);
        
        if (hasMessage) {
          toast.success('Prayer and message added successfully!');
        } else {
          toast.success('Prayer count updated!');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add prayer');
      }
    } catch (error) {
      console.error('Error adding prayer:', error);
      toast.error('Failed to add prayer');
    } finally {
      setSubmittingPrayModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.anonymous ? null : formData.name,
          prayerRequest: formData.prayerRequest,
          category: formData.category,
          isAnonymous: formData.anonymous,
          userId: session?.user?.id || null // Include userId for logged in users
        })
      });
      
      if (response.ok) {
        const newPrayer = await response.json();
        // Update the prayers list immediately
        setPrayers([newPrayer, ...prayers]);
        setFormData({
          name: session?.user?.name ? getDisplayName(session.user.name) : "",
          anonymous: false,
          category: "Strength",
          prayerRequest: ""
        });
        setShowSubmitForm(false);
        toast.success('Prayer request submitted successfully!');
        // Show newsletter modal after successful submission
        setTimeout(() => {
          setShowNewsletterModal(true);
        }, 500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit prayer request');
      }
    } catch (error) {
      console.error('Error submitting prayer:', error);
      toast.error('Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle editing a prayer (only for owner)
  const handleEditPrayer = async (prayerId: number) => {
    if (!session?.user?.id) return;
    
    setEditingPrayer(true);
    try {
      const response = await fetch(`/api/prayers?id=${prayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'editPrayer',
          userId: session.user.id,
          newPrayerRequest: editPrayerRequest
        })
      });
      
      if (response.ok) {
        const updatedPrayer = await response.json();
        setPrayers(prayers.map(p => p.id === prayerId ? updatedPrayer : p));
        setEditingPrayerId(null);
        setEditPrayerRequest("");
        toast.success('Prayer updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update prayer');
      }
    } catch (error) {
      console.error('Error updating prayer:', error);
      toast.error('Failed to update prayer');
    } finally {
      setEditingPrayer(false);
    }
  };
  
  // Handle replying to a community prayer
  const handleCommunityReply = async (prayerId: number) => {
    if (!communityReply.trim()) return;
    
    setSubmittingCommunityReply(true);
    try {
      const response = await fetch(`/api/prayers?id=${prayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addCommunityReply',
          replyText: communityReply,
          replyUserName: session?.user?.name ? getDisplayName(session.user.name) : 'Anonymous',
          userId: session?.user?.id || null
        })
      });
      
      if (response.ok) {
        const updatedPrayer = await response.json();
        setPrayers(prayers.map(p => p.id === prayerId ? updatedPrayer : p));
        setReplyingToPrayerId(null);
        setCommunityReply("");
        toast.success('Reply posted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingCommunityReply(false);
    }
  };

  // Stats with null safety - FIXED: Use prayCount field
  const activeCategories = new Set(prayers.map(p => p.category).filter(Boolean)).size;

  const selectedPrayer = selectedPrayerId ? prayers.find(p => p.id === selectedPrayerId) : null;
  const allMessagesPrayer = allMessagesPrayerId ? prayers.find(p => p.id === allMessagesPrayerId) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden double-exposure"
      >
        <div className="absolute inset-0 overlay-gradient opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center mb-8 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Badge className="mb-4 bg-[#A92FFA] hover:bg-[#A92FFA]/90">
              <Heart className="w-4 h-4 mr-2" fill="currentColor" />
              Community Prayer
            </Badge>
            <h1 className={`text-5xl sm:text-6xl font-bold mb-6 transition-all duration-1000 delay-100 glow-text ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Interactive <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">Prayer Wall</span>
            </h1>
            <p className={`text-xl text-muted-foreground max-w-3xl mx-auto mb-8 transition-all duration-1000 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              Share your prayer requests, pray for others, and experience the power of unified prayer in our community.
            </p>
            <div className={`transition-all duration-1000 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Button 
                size="lg" 
                onClick={() => setShowSubmitForm(true)} 
                className="text-lg px-8 bg-[#F28C28] hover:bg-[#F28C28]/90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Prayer Request
              </Button>
            </div>
          </div>
          
          {/* Stats - LIVE DATA FROM API */}
          <div 
            ref={statsRef}
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 transition-all duration-1000 ${
              statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-[#A92FFA] text-white hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl font-bold">{liveStats.prayersCount}</CardTitle>
                <CardDescription className="text-white/80">Submitted Prayers</CardDescription>
              </CardHeader>
            </Card>
              <Card className="bg-[#F28C28] text-white hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-3xl font-bold">{(liveStats.prayersCount + liveStats.communityPrayers).toLocaleString()}</CardTitle>
                  <CardDescription className="text-white/80">Total Prayers</CardDescription>
                </CardHeader>
              </Card>

            <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl font-bold">{activeCategories}</CardTitle>
                <CardDescription className="text-white/80">Categories</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl font-bold">24/7</CardTitle>
                <CardDescription>Support</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
            <CardHeader>
              <CardTitle className="text-2xl">Submit Prayer Request</CardTitle>
              <CardDescription>Share your prayer needs with our community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={formData.anonymous}
                    required={!formData.anonymous}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData({...formData, anonymous: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="anonymous" className="text-sm">Submit anonymously</label>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    required
                  >
                    {categories.filter(c => c.value !== "all").map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Prayer Request</label>
                  <Textarea
                    placeholder="Share your prayer request with our community..."
                    value={formData.prayerRequest}
                    onChange={(e) => setFormData({...formData, prayerRequest: e.target.value})}
                    rows={5}
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-[#F28C28] hover:bg-[#F28C28]/90" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Submit Prayer
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NEW: Pray Modal */}
      {showPrayModal && selectedPrayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-lg w-full animate-slide-in-up">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#A92FFA]" fill="currentColor" />
                Pray for this Request
              </CardTitle>
              <CardDescription>
                Your prayer will be counted. Optionally add a message of encouragement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prayer Request Preview */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categories.find(c => c.value === selectedPrayer.category)?.color}>
                    {selectedPrayer.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {selectedPrayer.isAnonymous ? "Anonymous" : selectedPrayer.name || "Anonymous"}
                  </span>
                </div>
                <p className="text-sm line-clamp-3">{selectedPrayer.prayerRequest}</p>
              </div>
              
              {/* Optional Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prayer Message <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Add a message of encouragement or simply pray silently..."
                  value={prayModalMessage}
                  onChange={(e) => setPrayModalMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to pray silently and update the prayer count only.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handlePrayModalSubmit} 
                  className="flex-1 bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                  disabled={submittingPrayModal}
                >
                  {submittingPrayModal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Praying...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                      {prayModalMessage.trim() ? 'Pray & Send Message' : 'Pray for This'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPrayModal(false);
                    setPrayModalMessage("");
                    setSelectedPrayerId(null);
                  }}
                  disabled={submittingPrayModal}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NEW: All Messages Modal */}
      {showAllMessagesModal && allMessagesPrayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slide-in-up">
            <CardHeader className="border-b sticky top-0 bg-background z-10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-[#A92FFA]" />
                All Prayer Messages
              </CardTitle>
              <CardDescription>
                {Array.isArray(allMessagesPrayer.prayers) ? allMessagesPrayer.prayers.length : 0} messages from the community
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Prayer Request Preview */}
              <div className="p-4 bg-muted/50 rounded-lg border mb-4 sticky top-0 bg-background z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categories.find(c => c.value === allMessagesPrayer.category)?.color}>
                    {allMessagesPrayer.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {allMessagesPrayer.isAnonymous ? "Anonymous" : allMessagesPrayer.name || "Anonymous"}
                  </span>
                </div>
                <p className="text-sm">{allMessagesPrayer.prayerRequest}</p>
              </div>
              
              {/* All Prayer Messages */}
              <div className="space-y-3">
                {Array.isArray(allMessagesPrayer.prayers) && allMessagesPrayer.prayers.length === 0 ? (
                  <p className="text-center text-muted-foreground italic py-8">
                    No prayer messages yet. Be the first to share!
                  </p>
                ) : (
                  Array.isArray(allMessagesPrayer.prayers) && allMessagesPrayer.prayers.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm">{p.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <div className="border-t p-4 sticky bottom-0 bg-background">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowAllMessagesModal(false);
                  setAllMessagesPrayerId(null);
                }}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Featured Prayers - Random */}
          {!loading && featuredPrayers.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-[#A92FFA] to-[#F28C28]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Featured Prayers
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Random Selections</h2>
                <p className="text-muted-foreground">Join our community in praying for these prayer requests</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {featuredPrayers.map((prayer) => {
                  const category = categories.find(c => c.value === prayer.category);
                  const prayerCount = prayer.prayCount || 0;
                  
                  return (
                    <Card 
                      key={prayer.id}
                      className={`relative overflow-hidden hover-lift hover-glow border-2 border-accent`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A92FFA]/20 to-[#F28C28]/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{prayer.isAnonymous ? "Anonymous" : prayer.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(prayer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={category?.color}>{category?.label}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {prayer.prayerRequest}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Heart className="w-4 h-4 text-[#A92FFA]" fill="currentColor" />
                            <span className="text-[#A92FFA]">{prayerCount} prayer{prayerCount !== 1 ? 's' : ''}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-[#F28C28] hover:bg-[#F28C28]/90"
                            onClick={() => handlePrayButtonClick(prayer.id)}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Pray
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
            </div>
          )}
          
          {/* Most Prayed For Section */}
          {!loading && mostPrayedFor.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-[#A92FFA]">
                  <Users className="w-4 h-4 mr-2" />
                  Most Prayed For
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Community Top 3</h2>
                <p className="text-muted-foreground">The most supported prayer requests by our community</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {mostPrayedFor.map((prayer, index) => {
                  const category = categories.find(c => c.value === prayer.category);
                  const prayerCount = prayer.prayCount || 0;
                  
                  return (
                    <Card 
                      key={prayer.id}
                      className={`relative overflow-hidden hover-lift hover-glow border-2 ${
                        index === 0 ? 'border-[#A92FFA]' : 
                        index === 1 ? 'border-[#F28C28]' : 
                        'border-accent'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-[#A92FFA]' : 
                        index === 1 ? 'bg-[#F28C28]' : 
                        'bg-accent'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A92FFA]/20 to-[#F28C28]/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{prayer.isAnonymous ? "Anonymous" : prayer.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(prayer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={category?.color}>{category?.label}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {prayer.prayerRequest}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Heart className="w-4 h-4 text-[#A92FFA]" fill="currentColor" />
                            <span className="text-[#A92FFA]">{prayerCount} prayer{prayerCount !== 1 ? 's' : ''}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-[#F28C28] hover:bg-[#F28C28]/90"
                            onClick={() => handlePrayButtonClick(prayer.id)}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Pray
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
            </div>
          )}
          
          {/* Filters and Search */}
          <div 
            ref={filtersRef}
            className={`mb-8 transition-all duration-1000 ${
              filtersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search prayers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-border rounded-md bg-background min-w-[150px]"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Prayed For</option>
              </select>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${selectedCategory === cat.value ? cat.color : ""}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                  {cat.value === "all" && ` (${prayers.length})`}
                  {cat.value !== "all" && ` (${prayers.filter(p => p.category === cat.value).length})`}
                </Badge>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading prayers...</p>
            </div>
          )}

          {/* Prayer Cards Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPrayers.map((prayer, index) => {
                const category = categories.find(c => c.value === prayer.category);
                const isFromLeft = index % 2 === 0;
                const isExpanded = expandedPrayer === prayer.id;
                const prayerCount = prayer.prayCount || 0;
                const prayers_list = Array.isArray(prayer.prayers) ? prayer.prayers : [];
                const messageCount = prayers_list.length;
                
                return (
                  <Card 
                    key={prayer.id}
                    id={`prayer-${prayer.id}`}
                    className={`hover:shadow-lg transition-all duration-1000 flex flex-col hover-lift ${
                      isFromLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'
                    }`}
                    style={{ animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A92FFA]/20 to-[#F28C28]/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{prayer.isAnonymous ? "Anonymous" : prayer.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(prayer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={category?.color}>{category?.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {prayer.prayerRequest}
                      </p>
                      
                      {/* OP Reply */}
                      {prayer.opReply && (
                        <div className="mb-4 p-3 bg-[#A92FFA]/10 rounded-lg border border-[#A92FFA]/20">
                          <p className="text-xs font-semibold text-[#A92FFA] mb-1">Response from {prayer.isAnonymous ? "Anonymous" : prayer.name || "OP"}:</p>
                          <p className="text-sm">{prayer.opReply}</p>
                        </div>
                      )}
                      
                      <div className="space-y-3 pt-4 border-t">
                        {/* Pray Button - Always Visible */}
                        <Button 
                          className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                          onClick={() => handlePrayButtonClick(prayer.id)}
                        >
                          <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                          Pray for This Request
                        </Button>
                        
                        {/* Stats and Expand */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Heart className="w-4 h-4" fill="currentColor" />
                            <span>{prayerCount} prayer{prayerCount !== 1 ? 's' : ''}</span>
                            {messageCount > 0 && (
                              <span className="text-xs">({messageCount} message{messageCount !== 1 ? 's' : ''})</span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setExpandedPrayer(isExpanded ? null : prayer.id)}
                            className="gap-2"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Collapse' : 'View Messages'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded Content - Shows prayer messages */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4 animate-slide-in-up">
                          {/* Display First 20 Prayer Messages */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-muted-foreground">
                                {messageCount} prayer message{messageCount !== 1 ? 's' : ''} from the community
                                {messageCount > 20 && ' (showing first 20)'}:
                              </p>
                              {messageCount > 20 && (
                                <Button
                                  size="sm"
                                  variant="link"
                                  className="text-[#A92FFA] hover:text-[#A92FFA]/80 p-0 h-auto"
                                  onClick={() => {
                                    setAllMessagesPrayerId(prayer.id);
                                    setShowAllMessagesModal(true);
                                  }}
                                >
                                  View All {messageCount} Messages
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {prayers_list.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No prayer messages yet. Be the first to share!</p>
                              ) : (
                                prayers_list.slice(0, 20).map((p: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                                    <p className="text-xs text-muted-foreground mb-1">{new Date(p.createdAt).toLocaleString()}</p>
                                    <p>{p.text}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          
                          {/* Add Prayer Form */}
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add your prayer message..."
                              value={prayerText[prayer.id] || ''}
                              onChange={(e) => setPrayerText({...prayerText, [prayer.id]: e.target.value})}
                              rows={2}
                              className="text-sm"
                            />
                            <Button 
                              size="sm" 
                              className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                              onClick={() => handlePrayFor(prayer.id)}
                              disabled={submittingPrayer === prayer.id || !prayerText[prayer.id]?.trim()}
                            >
                              {submittingPrayer === prayer.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Submit Prayer
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* OP Reply Form (only if no reply yet) */}
                          {!prayer.opReply && (
                            <div className="space-y-2 pt-2 border-t">
                              <p className="text-xs font-semibold text-muted-foreground">Reply to your prayer community (one time only):</p>
                              <Textarea
                                placeholder="Share an update or thank the community..."
                                value={opReply[prayer.id] || ''}
                                onChange={(e) => setOpReply({...opReply, [prayer.id]: e.target.value})}
                                rows={2}
                                className="text-sm"
                              />
                              <Button 
                                size="sm" 
                                className="w-full bg-[#F28C28] hover:bg-[#F28C28]/90"
                                onClick={() => handleOpReply(prayer.id)}
                                disabled={submittingReply === prayer.id || !opReply[prayer.id]?.trim()}
                              >
                                {submittingReply === prayer.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredPrayers.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No prayers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Info Cards */}
          <div 
            ref={infoRef}
            className={`grid md:grid-cols-3 gap-6 transition-all duration-1000 ${
              infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="bg-gradient-to-br from-[#A92FFA]/10 to-[#A92FFA]/5 hover-lift hover-glow">
              <CardHeader>
                <Sparkles className="w-10 h-10 text-[#A92FFA] mb-3" />
                <CardTitle>The Power of Prayer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven." - Matthew 18:19
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#F28C28]/10 to-[#F28C28]/5 hover-lift hover-glow">
              <CardHeader>
                <Users className="w-10 h-10 text-[#F28C28] mb-3" />
                <CardTitle>Pray Together</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join our community in lifting up prayers for those in need. Your prayers make a difference and bring hope to those who are struggling.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#A92FFA]/10 via-[#F28C28]/10 to-accent/5 hover-lift hover-glow">
              <CardHeader>
                <CircleCheck className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Share Testimonies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Have you seen prayers answered? Share your testimony to encourage others and glorify God's faithfulness in our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className={`py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all duration-1000 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="absolute inset-0 overlay-gradient opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="bg-gradient-to-br from-[#A92FFA] to-[#F28C28] text-white hover-glow">
            <CardContent className="pt-8">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" fill="currentColor" />
                <h2 className="text-3xl font-bold mb-4">Need Prayer Support?</h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Don't face your challenges alone. Our pastoral team is available 24/7 for confidential prayer support and spiritual guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Pastoral Team
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white" onClick={() => setShowSubmitForm(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Prayer Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      
      {/* Newsletter Modal */}
      <NewsletterModal 
        isOpen={showNewsletterModal} 
        onClose={() => setShowNewsletterModal(false)} 
      />
    </div>
  );
}