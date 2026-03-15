"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, CircleCheck, Loader2, Sparkles, Heart, Bell, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsletterPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterPopupModal({ isOpen, onClose }: NewsletterPopupModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source: 'homepage_modal'
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setSuccess(true);
        localStorage.setItem("newsletter-subscribed", "true");
        
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail("");
          setName("");
        }, 2500);
      } else {
        setError(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("newsletter-dismissed", Date.now().toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#A92FFA] via-[#F28C28] to-[#A92FFA] rounded-2xl blur-lg opacity-50 animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-[#A92FFA]/30 shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#A92FFA]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F28C28]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <button 
                onClick={handleSkip}
                className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 p-6">
                {success ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30"
                    >
                      <CircleCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Welcome to the Family!</h3>
                    <p className="text-sm text-slate-300">You're now part of our UCon community. Watch your inbox for inspiration!</p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 flex justify-center gap-2"
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                        >
                          <Heart className="w-5 h-5 text-[#F28C28]" fill="currentColor" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex justify-center mb-4"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#A92FFA] to-[#F28C28] rounded-xl flex items-center justify-center shadow-xl shadow-[#A92FFA]/30 transform rotate-3">
                            <Mail className="w-8 h-8 text-white" />
                          </div>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2,
                              repeatDelay: 1
                            }}
                            className="absolute -top-1 -right-1"
                          >
                            <Bell className="w-6 h-6 text-[#F28C28]" fill="currentColor" />
                          </motion.div>
                        </div>
                      </motion.div>

                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-bold text-white mb-2"
                      >
                        Stay Connected with UCon
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-slate-300"
                      >
                        Join our community and receive inspiring stories of transformation, upcoming events, and ways to get involved.
                      </motion.p>
                    </div>

                    <motion.form 
                      onSubmit={handleSubmit} 
                      className="space-y-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{error}</p>
                        </motion.div>
                      )}

                      <div>
                        <Input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-10 focus:border-[#A92FFA] focus:ring-[#A92FFA]/20"
                        />
                      </div>
                      
                      <div>
                        <Input
                          type="email"
                          placeholder="Your Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-10 focus:border-[#A92FFA] focus:ring-[#A92FFA]/20"
                        />
                      </div>

                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-[#F28C28] flex-shrink-0 mt-0.5" />
                        <span>Get weekly encouragement, transformation stories, prayer updates, and exclusive event invites.</span>
                      </div>
                      
                      <div className="pt-3 space-y-2">
                        <Button 
                          type="submit" 
                          className="w-full h-10 bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90 text-white font-semibold shadow-lg shadow-[#A92FFA]/20"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Joining Community...
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                              Join the Movement
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={handleSkip}
                          className="w-full text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-9"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </motion.form>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-xs text-slate-500 mt-4"
                    >
                      We respect your privacy. Unsubscribe anytime.
                    </motion.p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}