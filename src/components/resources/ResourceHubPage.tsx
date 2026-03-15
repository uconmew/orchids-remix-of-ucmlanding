"use client"

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, FileText, BookOpen, Video, Headphones,
  Home, Utensils, Shield, Stethoscope, Heart, Phone,
  MapPin, Clock, ExternalLink, Search, Sparkles, 
  CircleCheck, Star, Building2, Award, AlertCircle,
  Cross, Users, Briefcase, DollarSign, Car, Baby,
  GraduationCap, Scale, Pill, Brain, HeartHandshake
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function ResourceHubPage() {
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [emergencyRef, emergencyVisible] = useIntersectionObserver();
  const [resourcesRef, resourcesVisible] = useIntersectionObserver();
  const [downloadsRef, downloadsVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const coloradoResources = [
    // HOUSING RESOURCES
    {
      name: "Colorado Coalition for the Homeless",
      category: "Housing",
      region: "Denver Metro",
      description: "Emergency shelter, transitional housing, permanent supportive housing, healthcare for homeless",
      phone: "(303) 293-2217",
      address: "2111 Champa St, Denver, CO 80205",
      hours: "24/7 Crisis Line",
      website: "www.coloradocoalition.org",
      acceptsMedicaid: true,
      icon: Home,
      color: "from-blue-600 to-blue-400"
    },
    {
      name: "Denver Rescue Mission",
      category: "Housing",
      region: "Denver Metro",
      description: "Emergency shelter, meals, recovery programs, transitional housing, job training",
      phone: "(303) 297-1815",
      address: "6100 Smith Rd, Denver, CO 80216",
      hours: "24/7",
      website: "www.denverrescuemission.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-blue-500 to-cyan-400"
    },
    {
      name: "Colorado Housing Connects",
      category: "Housing",
      region: "Statewide",
      description: "Statewide housing assistance hotline, rental assistance, housing vouchers",
      phone: "1-844-926-6632",
      address: "Statewide Service",
      hours: "Mon-Fri 8am-5pm",
      website: "www.coloradohousingconnects.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-indigo-600 to-blue-500"
    },
    {
      name: "Metro Denver Homeless Initiative (MDHI)",
      category: "Housing",
      region: "Denver Metro",
      description: "Coordinated entry system, housing navigation, rapid rehousing programs",
      phone: "(720) 895-5011",
      address: "711 Park Ave W #301, Denver, CO 80205",
      hours: "Mon-Fri 8am-5pm",
      website: "www.mdhi.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-purple-600 to-indigo-500"
    },
    {
      name: "Springs Rescue Mission",
      category: "Housing",
      region: "Colorado Springs",
      description: "Emergency shelter, meals, recovery programs, job training, life transformation",
      phone: "(719) 632-1822",
      address: "5 W Las Vegas St, Colorado Springs, CO 80903",
      hours: "24/7",
      website: "www.springsrescuemission.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-sky-600 to-blue-400"
    },
    {
      name: "Volunteers of America Colorado",
      category: "Housing",
      region: "Statewide",
      description: "Housing services, veterans housing, affordable housing programs",
      phone: "(303) 297-0408",
      address: "2660 Larimer St, Denver, CO 80205",
      hours: "Mon-Fri 8am-5pm",
      website: "www.voacolorado.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-red-600 to-orange-500"
    },
    {
      name: "Boulder Shelter for the Homeless",
      category: "Housing",
      region: "Boulder",
      description: "Emergency overnight shelter, day services, housing navigation",
      phone: "(303) 442-4646",
      address: "4869 N Broadway, Boulder, CO 80304",
      hours: "5pm-8am daily",
      website: "www.bouldershelter.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-teal-600 to-cyan-400"
    },

    // SOBER LIVING
    {
      name: "Oxford House Colorado",
      category: "Sober Living",
      region: "Statewide",
      description: "Self-supporting recovery housing, peer-run sober living homes across Colorado",
      phone: "(303) 691-4200",
      address: "Multiple Locations Statewide",
      hours: "24/7 Referral Line",
      website: "www.oxfordhouse.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-emerald-600 to-green-400"
    },
    {
      name: "Haven of Hope Recovery Home",
      category: "Sober Living",
      region: "Denver Metro",
      description: "Faith-based sober living for women, 12-step integration, life skills",
      phone: "(303) 355-7144",
      address: "Denver Metro Area",
      hours: "Intake 9am-5pm",
      website: "www.havenofhoperecovery.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-pink-600 to-rose-400"
    },
    {
      name: "Steps Recovery Homes",
      category: "Sober Living",
      region: "Colorado Springs",
      description: "Structured sober living, 12-step meetings, employment assistance",
      phone: "(719) 358-1917",
      address: "Colorado Springs Area",
      hours: "Mon-Fri 9am-5pm",
      website: "www.stepsrecoveryhomes.com",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-violet-600 to-purple-400"
    },
    {
      name: "New Beginnings Recovery Residence",
      category: "Sober Living",
      region: "Denver Metro",
      description: "Gender-specific recovery housing, peer support, employment resources",
      phone: "(720) 383-8777",
      address: "Aurora, CO",
      hours: "24/7",
      website: "www.newbeginningscolorado.org",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-amber-600 to-yellow-400"
    },

    // MENTAL HEALTH
    {
      name: "Colorado Crisis Services",
      category: "Mental Health",
      region: "Statewide",
      description: "Free 24/7 mental health crisis support - call, text, chat, or walk-in centers",
      phone: "1-844-493-8255",
      address: "Walk-in Centers Statewide",
      hours: "24/7",
      website: "www.coloradocrisisservices.org",
      acceptsMedicaid: true,
      icon: Brain,
      color: "from-teal-600 to-cyan-400"
    },
    {
      name: "Mental Health Center of Denver",
      category: "Mental Health",
      region: "Denver Metro",
      description: "Comprehensive mental health services, psychiatry, counseling, case management",
      phone: "(303) 504-6500",
      address: "4141 E Dickenson Pl, Denver, CO 80222",
      hours: "Mon-Fri 8am-5pm, 24/7 Crisis",
      website: "www.mhcd.org",
      acceptsMedicaid: true,
      icon: Brain,
      color: "from-blue-600 to-indigo-400"
    },
    {
      name: "Jefferson Center for Mental Health",
      category: "Mental Health",
      region: "Jefferson County",
      description: "Mental health, substance use treatment, crisis services, family support",
      phone: "(303) 425-0300",
      address: "4851 Independence St, Wheat Ridge, CO 80033",
      hours: "Mon-Fri 8am-5pm",
      website: "www.jcmh.org",
      acceptsMedicaid: true,
      icon: Brain,
      color: "from-purple-600 to-violet-400"
    },
    {
      name: "AspenPointe",
      category: "Mental Health",
      region: "Colorado Springs",
      description: "Behavioral health, crisis services, substance abuse, veteran services",
      phone: "(719) 572-6100",
      address: "115 S Parkside Dr, Colorado Springs, CO 80910",
      hours: "Mon-Fri 8am-5pm",
      website: "www.aspenpointe.org",
      acceptsMedicaid: true,
      icon: Brain,
      color: "from-cyan-600 to-teal-400"
    },
    {
      name: "Health First Colorado (Medicaid)",
      category: "Mental Health",
      region: "Statewide",
      description: "Colorado's Medicaid program - mental health and substance abuse coverage",
      phone: "1-800-221-3943",
      address: "Statewide Service",
      hours: "Mon-Fri 8am-5pm",
      website: "www.healthfirstcolorado.com",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-green-600 to-emerald-400"
    },
    {
      name: "Mental Health Colorado",
      category: "Mental Health",
      region: "Statewide",
      description: "Mental health advocacy, resources, referrals, and support statewide",
      phone: "(303) 377-3040",
      address: "1120 Lincoln St #1606, Denver, CO 80203",
      hours: "Mon-Fri 9am-5pm",
      website: "www.mentalhealthcolorado.org",
      acceptsMedicaid: false,
      icon: Brain,
      color: "from-indigo-600 to-blue-400"
    },
    {
      name: "Signal Behavioral Health Network",
      category: "Mental Health",
      region: "Statewide",
      description: "Managed service organization for Medicaid mental health benefits",
      phone: "(719) 540-4545",
      address: "Statewide Service",
      hours: "Mon-Fri 8am-5pm",
      website: "www.signalbhn.org",
      acceptsMedicaid: true,
      icon: Brain,
      color: "from-rose-600 to-pink-400"
    },

    // RECOVERY/ADDICTION
    {
      name: "Stout Street Foundation",
      category: "Recovery",
      region: "Denver Metro",
      description: "Free detox and residential treatment for substance use disorders",
      phone: "(303) 607-8201",
      address: "2317 Stout St, Denver, CO 80205",
      hours: "24/7 Admissions",
      website: "www.stoutstreet.org",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-red-600 to-orange-500"
    },
    {
      name: "Sandstone Care",
      category: "Recovery",
      region: "Statewide",
      description: "Adolescent and young adult substance abuse and mental health treatment",
      phone: "(888) 850-1890",
      address: "Multiple Locations",
      hours: "24/7 Admissions",
      website: "www.sandstonecare.com",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-orange-600 to-amber-400"
    },
    {
      name: "CeDAR (University of Colorado)",
      category: "Recovery",
      region: "Denver Metro",
      description: "Evidence-based addiction treatment, detox, residential, outpatient",
      phone: "(720) 848-3000",
      address: "1399 N Potomac St, Aurora, CO 80011",
      hours: "24/7 Admissions",
      website: "www.uchealth.org/cedar",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-yellow-600 to-orange-400"
    },
    {
      name: "Arapahoe House",
      category: "Recovery",
      region: "Denver Metro",
      description: "Comprehensive addiction treatment, detox, residential, outpatient programs",
      phone: "(303) 657-3700",
      address: "8801 Lipan St, Thornton, CO 80260",
      hours: "24/7 Crisis",
      website: "www.arapahoehouse.org",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-green-600 to-teal-400"
    },
    {
      name: "Denver CARES",
      category: "Recovery",
      region: "Denver Metro",
      description: "Detox facility, alcohol and drug withdrawal management",
      phone: "(303) 436-4787",
      address: "710 S Ash St, Denver, CO 80246",
      hours: "24/7",
      website: "www.denvercares.org",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-blue-600 to-cyan-400"
    },

    // AA & 12-STEP PROGRAMS
    {
      name: "Alcoholics Anonymous Colorado",
      category: "AA/12-Step",
      region: "Statewide",
      description: "AA meetings throughout Colorado, 24/7 hotline, meeting finder",
      phone: "(303) 322-4440",
      address: "Meetings Statewide",
      hours: "24/7 Hotline",
      website: "www.coloradoaa.org",
      acceptsMedicaid: false,
      icon: Users,
      color: "from-blue-700 to-blue-500"
    },
    {
      name: "Colorado Narcotics Anonymous",
      category: "AA/12-Step",
      region: "Statewide",
      description: "NA meetings for addiction recovery, peer support, 12-step program",
      phone: "(303) 534-1102",
      address: "Meetings Statewide",
      hours: "Daily Meetings",
      website: "www.coloradona.org",
      acceptsMedicaid: false,
      icon: Users,
      color: "from-amber-600 to-yellow-500"
    },
    {
      name: "Celebrate Recovery Colorado",
      category: "AA/12-Step",
      region: "Statewide",
      description: "Christ-centered 12-step recovery program for all hurts, habits, hangups",
      phone: "Various Church Locations",
      address: "Churches Statewide",
      hours: "Weekly Meetings",
      website: "www.celebraterecovery.com",
      acceptsMedicaid: false,
      icon: Cross,
      color: "from-purple-700 to-violet-500"
    },
    {
      name: "Al-Anon Colorado",
      category: "AA/12-Step",
      region: "Statewide",
      description: "Support for families and friends of alcoholics, meetings statewide",
      phone: "(303) 321-8788",
      address: "Meetings Statewide",
      hours: "Daily Meetings",
      website: "www.al-anon-colorado.org",
      acceptsMedicaid: false,
      icon: Users,
      color: "from-teal-700 to-cyan-500"
    },
    {
      name: "SMART Recovery Colorado",
      category: "AA/12-Step",
      region: "Statewide",
      description: "Science-based addiction recovery support, alternative to 12-step",
      phone: "Online Meetings Available",
      address: "Multiple Locations",
      hours: "Various Schedules",
      website: "www.smartrecovery.org",
      acceptsMedicaid: false,
      icon: Brain,
      color: "from-green-700 to-emerald-500"
    },

    // BIBLICAL/FAITH-BASED RESOURCES
    {
      name: "Rescue Mission Alliance of Colorado",
      category: "Biblical/Faith",
      region: "Statewide",
      description: "Christ-centered shelter, meals, recovery programs, spiritual support",
      phone: "(303) 297-1815",
      address: "Multiple Locations",
      hours: "24/7",
      website: "www.denverrescuemission.org",
      acceptsMedicaid: false,
      icon: Cross,
      color: "from-purple-600 to-indigo-400"
    },
    {
      name: "Teen Challenge Colorado",
      category: "Biblical/Faith",
      region: "Denver Metro",
      description: "Faith-based residential recovery for men, women, and teens",
      phone: "(303) 922-5433",
      address: "5401 N Federal Blvd, Denver, CO 80221",
      hours: "Intake 9am-5pm",
      website: "www.teenchallenge.cc",
      acceptsMedicaid: false,
      icon: Cross,
      color: "from-red-600 to-rose-400"
    },
    {
      name: "Union Gospel Mission Denver",
      category: "Biblical/Faith",
      region: "Denver Metro",
      description: "Christian ministry providing meals, shelter, addiction recovery",
      phone: "(303) 294-0157",
      address: "2012 Larimer St, Denver, CO 80205",
      hours: "Daily Services",
      website: "www.ugmdenver.org",
      acceptsMedicaid: false,
      icon: Cross,
      color: "from-amber-600 to-orange-400"
    },
    {
      name: "The Salvation Army Colorado",
      category: "Biblical/Faith",
      region: "Statewide",
      description: "Emergency assistance, shelter, rehabilitation, spiritual support",
      phone: "(303) 866-9933",
      address: "Multiple Locations Statewide",
      hours: "Varies by Location",
      website: "www.salvationarmycolorado.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-red-700 to-red-500"
    },
    {
      name: "Catholic Charities Colorado",
      category: "Biblical/Faith",
      region: "Statewide",
      description: "Housing, food, counseling, immigration services, emergency assistance",
      phone: "(303) 742-0828",
      address: "Multiple Locations",
      hours: "Mon-Fri 8am-5pm",
      website: "www.ccdenver.org",
      acceptsMedicaid: false,
      icon: Cross,
      color: "from-blue-700 to-indigo-500"
    },
    {
      name: "Jewish Family Service of Colorado",
      category: "Biblical/Faith",
      region: "Denver Metro",
      description: "Mental health, senior services, refugee assistance, food bank",
      phone: "(303) 597-5000",
      address: "3201 S Tamarac Dr, Denver, CO 80231",
      hours: "Mon-Fri 9am-5pm",
      website: "www.jewishfamilyservice.org",
      acceptsMedicaid: true,
      icon: Heart,
      color: "from-blue-600 to-cyan-400"
    },

    // FOOD RESOURCES
    {
      name: "Food Bank of the Rockies",
      category: "Food",
      region: "Statewide",
      description: "Largest hunger-relief organization in Colorado, distributing food statewide",
      phone: "(303) 371-9250",
      address: "10700 E 45th Ave, Denver, CO 80239",
      hours: "Mon-Fri 8am-4:30pm",
      website: "www.foodbankrockies.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-green-600 to-emerald-400"
    },
    {
      name: "Care and Share Food Bank",
      category: "Food",
      region: "Southern Colorado",
      description: "Serving Southern Colorado with food distribution and mobile pantries",
      phone: "(719) 329-5663",
      address: "2605 Preamble Point, Colorado Springs, CO 80915",
      hours: "Mon-Fri 8am-5pm",
      website: "www.careandshare.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-green-500 to-lime-400"
    },
    {
      name: "Community Food Share (Boulder)",
      category: "Food",
      region: "Boulder",
      description: "Boulder County's food bank serving 30,000+ people monthly",
      phone: "(303) 652-3663",
      address: "650 S Taylor Ave, Louisville, CO 80027",
      hours: "Mon-Fri 9am-5pm",
      website: "www.communityfoodshare.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-emerald-600 to-green-500"
    },
    {
      name: "Feeding Colorado Network",
      category: "Food",
      region: "Statewide",
      description: "Network of food banks and pantries across Colorado, food finder tool",
      phone: "Varies by Location",
      address: "Statewide Network",
      hours: "Varies",
      website: "www.feedingcolorado.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-orange-600 to-amber-400"
    },
    {
      name: "Denver Food Rescue",
      category: "Food",
      region: "Denver Metro",
      description: "Rescuing healthy food from waste, distributing to communities in need",
      phone: "(720) 495-0441",
      address: "Denver Metro Area",
      hours: "Various Distributions",
      website: "www.denverfoodrescue.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-teal-600 to-green-400"
    },
    {
      name: "Metro Caring (Denver)",
      category: "Food",
      region: "Denver Metro",
      description: "Fresh food market, nutrition education, housing assistance",
      phone: "(303) 860-7200",
      address: "1100 E 18th Ave, Denver, CO 80218",
      hours: "Mon-Sat various hours",
      website: "www.metrocaring.org",
      acceptsMedicaid: false,
      icon: Utensils,
      color: "from-lime-600 to-green-400"
    },

    // SHELTERS
    {
      name: "The Gathering Place",
      category: "Shelters",
      region: "Denver Metro",
      description: "Day shelter for women, transgender, and children experiencing poverty",
      phone: "(303) 321-4198",
      address: "1535 High St, Denver, CO 80218",
      hours: "Mon-Fri 8:30am-5pm",
      website: "www.tgpdenver.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-pink-600 to-rose-400"
    },
    {
      name: "St. Francis Center",
      category: "Shelters",
      region: "Denver Metro",
      description: "Day services, meals, showers, laundry, employment assistance",
      phone: "(303) 534-4233",
      address: "2323 Curtis St, Denver, CO 80205",
      hours: "Mon-Fri 7am-3pm",
      website: "www.sfcdenver.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-blue-600 to-indigo-400"
    },
    {
      name: "Samaritan House",
      category: "Shelters",
      region: "Denver Metro",
      description: "Emergency shelter for families and single women, case management",
      phone: "(303) 294-0241",
      address: "2301 Lawrence St, Denver, CO 80205",
      hours: "24/7",
      website: "www.ccdenver.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-amber-600 to-yellow-400"
    },
    {
      name: "Father Woody's Haven of Hope",
      category: "Shelters",
      region: "Denver Metro",
      description: "Day shelter, meals, basic services for homeless individuals",
      phone: "(303) 607-0855",
      address: "1780 Vine St, Denver, CO 80206",
      hours: "Mon-Fri 7am-2pm",
      website: "www.fatherwoody.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-red-600 to-rose-400"
    },

    // DV SHELTERS
    {
      name: "SafeHouse Denver",
      category: "DV Shelters",
      region: "Denver Metro",
      description: "24/7 crisis line, emergency shelter, support services for DV survivors",
      phone: "(303) 318-9989",
      address: "Confidential Location",
      hours: "24/7 Crisis Line",
      website: "www.safehouse-denver.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-purple-600 to-pink-500"
    },
    {
      name: "Violence Free Colorado",
      category: "DV Shelters",
      region: "Statewide",
      description: "Statewide coalition connecting survivors to local DV resources",
      phone: "(303) 831-9632",
      address: "Statewide Service",
      hours: "24/7 Support",
      website: "www.violencefreecolorado.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-pink-600 to-rose-400"
    },
    {
      name: "TESSA (Colorado Springs)",
      category: "DV Shelters",
      region: "Colorado Springs",
      description: "Emergency shelter, counseling, legal advocacy for DV/SA survivors",
      phone: "(719) 633-1462",
      address: "Confidential Location",
      hours: "24/7 Crisis Line",
      website: "www.tessacs.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-purple-500 to-fuchsia-400"
    },
    {
      name: "Rose Andom Center",
      category: "DV Shelters",
      region: "Denver Metro",
      description: "One-stop service center for domestic violence survivors",
      phone: "(720) 337-4400",
      address: "1330 Fox St, Denver, CO 80204",
      hours: "Mon-Fri 8am-5pm",
      website: "www.roseandomcenter.org",
      acceptsMedicaid: false,
      icon: Shield,
      color: "from-rose-600 to-red-400"
    },

    // ASSISTANCE PROGRAMS
    {
      name: "Colorado PEAK (Benefits Portal)",
      category: "Assistance",
      region: "Statewide",
      description: "Apply for SNAP, Medicaid, TANF, childcare assistance, and more",
      phone: "1-800-536-5298",
      address: "Online Portal",
      hours: "24/7 Online Access",
      website: "www.colorado.gov/peak",
      acceptsMedicaid: true,
      icon: DollarSign,
      color: "from-green-600 to-teal-400"
    },
    {
      name: "LEAP (Energy Assistance)",
      category: "Assistance",
      region: "Statewide",
      description: "Low-income energy assistance program for heating costs",
      phone: "1-866-432-8435",
      address: "Statewide Service",
      hours: "Nov-Apr Application Period",
      website: "www.colorado.gov/cdhs/leap",
      acceptsMedicaid: false,
      icon: Home,
      color: "from-orange-600 to-red-400"
    },
    {
      name: "Mile High United Way 211",
      category: "Assistance",
      region: "Statewide",
      description: "Free referral service connecting to health, housing, and human services",
      phone: "211",
      address: "Statewide Service",
      hours: "24/7",
      website: "www.211colorado.org",
      acceptsMedicaid: false,
      icon: Phone,
      color: "from-blue-600 to-purple-400"
    },
    {
      name: "Emergency Family Assistance Association",
      category: "Assistance",
      region: "Boulder",
      description: "Emergency rent, utilities, food, medical assistance for families",
      phone: "(303) 442-3042",
      address: "1575 Yarmouth Ave, Boulder, CO 80304",
      hours: "Mon-Fri 9am-5pm",
      website: "www.efaa.org",
      acceptsMedicaid: false,
      icon: HeartHandshake,
      color: "from-amber-600 to-orange-400"
    },
    {
      name: "Colorado Legal Services",
      category: "Assistance",
      region: "Statewide",
      description: "Free civil legal help for low-income Coloradans",
      phone: "(303) 837-1313",
      address: "1905 Sherman St #400, Denver, CO 80203",
      hours: "Mon-Fri 8:30am-5pm",
      website: "www.coloradolegalservices.org",
      acceptsMedicaid: false,
      icon: Scale,
      color: "from-indigo-600 to-blue-400"
    },
    {
      name: "Supplemental Security Income (SSI)",
      category: "Assistance",
      region: "Statewide",
      description: "Federal income support for aged, blind, and disabled individuals",
      phone: "1-800-772-1213",
      address: "Social Security Offices",
      hours: "Mon-Fri 8am-7pm",
      website: "www.ssa.gov/ssi",
      acceptsMedicaid: true,
      icon: DollarSign,
      color: "from-blue-700 to-indigo-500"
    },

    // MEDICARE ACCEPTED SERVICES
    {
      name: "Denver Health",
      category: "Medicare Accepted",
      region: "Denver Metro",
      description: "Full-service hospital, clinics, behavioral health - accepts Medicare/Medicaid",
      phone: "(303) 436-6000",
      address: "777 Bannock St, Denver, CO 80204",
      hours: "24/7 ER, Clinics vary",
      website: "www.denverhealth.org",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-red-600 to-pink-400"
    },
    {
      name: "UCHealth",
      category: "Medicare Accepted",
      region: "Statewide",
      description: "Network of hospitals and clinics accepting Medicare throughout Colorado",
      phone: "(720) 848-0000",
      address: "Multiple Locations",
      hours: "Varies by Location",
      website: "www.uchealth.org",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-amber-600 to-yellow-400"
    },
    {
      name: "Community Health Centers",
      category: "Medicare Accepted",
      region: "Statewide",
      description: "Federally qualified health centers - sliding scale fees, accept all insurance",
      phone: "Varies by Location",
      address: "FQHC Locations Statewide",
      hours: "Varies",
      website: "www.nachc.org",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-green-600 to-emerald-400"
    },
    {
      name: "Stride Community Health Center",
      category: "Medicare Accepted",
      region: "Denver Metro",
      description: "Primary care, dental, behavioral health - sliding scale, accepts Medicare",
      phone: "(303) 360-6276",
      address: "Multiple Denver Metro Locations",
      hours: "Mon-Fri 8am-5pm",
      website: "www.stridechc.org",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-teal-600 to-cyan-400"
    },
    {
      name: "Clinica Family Health",
      category: "Medicare Accepted",
      region: "Boulder/Broomfield",
      description: "Community health center - primary care, dental, behavioral health",
      phone: "(303) 650-4460",
      address: "Multiple Boulder County Locations",
      hours: "Mon-Fri 8am-5pm",
      website: "www.clinica.org",
      acceptsMedicaid: true,
      icon: Stethoscope,
      color: "from-blue-600 to-indigo-400"
    },
      {
        name: "Peak Vista Community Health Centers",
        category: "Medicare Accepted",
        region: "Colorado Springs",
        description: "Primary care, dental, pharmacy, behavioral health - accepts Medicare/Medicaid",
        phone: "(719) 632-5700",
        address: "Multiple Colorado Springs Locations",
        hours: "Mon-Fri 8am-5pm",
        website: "www.peakvista.org",
        acceptsMedicaid: true,
        icon: Stethoscope,
        color: "from-purple-600 to-violet-400"
      },
      {
        name: "Gravity Counseling LLC",
        category: "Medicare Accepted",
        region: "Denver Metro",
        description: "Mental health counseling, therapy services, individual and group counseling - accepts Medicaid",
        phone: "(720) 707-7700",
        address: "Denver Metro Area",
        hours: "Mon-Fri 9am-6pm",
        website: "www.gravitycounselingllc.com",
        acceptsMedicaid: true,
        icon: Brain,
        color: "from-indigo-600 to-purple-400"
      },

      // VETERANS
    {
      name: "VA Eastern Colorado Health Care",
      category: "Veterans",
      region: "Statewide",
      description: "Healthcare, mental health, substance abuse treatment for veterans",
      phone: "(303) 399-8020",
      address: "1700 N Wheeling St, Aurora, CO 80045",
      hours: "24/7 ER",
      website: "www.va.gov/eastern-colorado",
      acceptsMedicaid: true,
      icon: Shield,
      color: "from-blue-700 to-blue-500"
    },
    {
      name: "Veterans Crisis Line",
      category: "Veterans",
      region: "Statewide",
      description: "24/7 crisis support for veterans and their families",
      phone: "988 (Press 1)",
      address: "Nationwide Service",
      hours: "24/7",
      website: "www.veteranscrisisline.net",
      acceptsMedicaid: false,
      icon: Phone,
      color: "from-red-700 to-red-500"
    },
    {
      name: "Colorado Coalition for the Homeless Veterans",
      category: "Veterans",
      region: "Denver Metro",
      description: "Housing, employment, health services specifically for veterans",
      phone: "(303) 293-2217",
      address: "2111 Champa St, Denver, CO 80205",
      hours: "Mon-Fri 8am-5pm",
      website: "www.coloradocoalition.org",
      acceptsMedicaid: true,
      icon: Home,
      color: "from-green-700 to-teal-500"
    },
  ];

  const emergencyHotlines = [
    {
      name: "National Suicide & Crisis Lifeline",
      number: "988",
      description: "24/7 crisis support - call or text for immediate help",
      icon: Phone
    },
    {
      name: "Colorado Crisis Services",
      number: "1-844-493-8255",
      description: "Text 'TALK' to 38255 - walk-in centers available",
      icon: Phone
    },
    {
      name: "National Domestic Violence Hotline",
      number: "1-800-799-7233",
      description: "24/7 support for domestic violence survivors",
      icon: Shield
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Substance abuse and mental health referrals 24/7",
      icon: Heart
    },
    {
      name: "National Sexual Assault Hotline",
      number: "1-800-656-4673",
      description: "24/7 support for sexual assault survivors",
      icon: Shield
    },
    {
      name: "Veterans Crisis Line",
      number: "988 (Press 1)",
      description: "24/7 support for veterans and their families",
      icon: Phone
    },
    {
      name: "Colorado 211",
      number: "211",
      description: "Connect to local health and human services resources",
      icon: Phone
    },
    {
      name: "Poison Control",
      number: "1-800-222-1222",
      description: "24/7 emergency poison and overdose assistance",
      icon: AlertCircle
    }
  ];

  const downloadableResources = [
    {
      title: "Complete Colorado Resource Directory",
      description: "Printable guide to all housing, food, mental health, and recovery resources",
      category: "Directories",
      type: "PDF",
      size: "3.2 MB",
      icon: FileText,
      color: "from-[#A92FFA] to-purple-600"
    },
    {
      title: "LDI Program Overview Guide",
      description: "Complete guide to the Leadership Development Institute",
      category: "Program Guides",
      type: "PDF",
      size: "2.4 MB",
      icon: FileText,
      color: "from-[#F28C28] to-orange-600"
    },
    {
      title: "Recovery Journey Workbook",
      description: "Interactive workbook for personal recovery journey",
      category: "Workbooks",
      type: "PDF",
      size: "5.1 MB",
      icon: BookOpen,
      color: "from-purple-600 to-[#A92FFA]"
    },
    {
      title: "Medicare/Medicaid Services Guide",
      description: "Complete list of Medicare-accepted providers in Colorado",
      category: "Insurance",
      type: "PDF",
      size: "1.8 MB",
      icon: Stethoscope,
      color: "from-teal-600 to-cyan-400"
    },
    {
      title: "AA & 12-Step Meeting Finder",
      description: "Comprehensive list of AA, NA, and recovery meetings statewide",
      category: "Recovery",
      type: "PDF",
      size: "2.0 MB",
      icon: Users,
      color: "from-blue-600 to-indigo-400"
    },
    {
      title: "Family Support Guide",
      description: "Resources for families supporting loved ones in recovery",
      category: "Family Resources",
      type: "PDF",
      size: "2.2 MB",
      icon: HeartHandshake,
      color: "from-orange-600 to-[#F28C28]"
    },
    {
      title: "Faith-Based Recovery Resources",
      description: "Biblical resources and faith-based recovery programs",
      category: "Faith",
      type: "PDF",
      size: "1.9 MB",
      icon: Cross,
      color: "from-purple-700 to-indigo-500"
    },
    {
      title: "Sober Living Directory",
      description: "Comprehensive list of sober living homes across Colorado",
      category: "Housing",
      type: "PDF",
      size: "1.5 MB",
      icon: Home,
      color: "from-emerald-600 to-green-400"
    },
    {
      title: "Volunteer Training Handbook",
      description: "Complete training guide for new volunteers",
      category: "Training Materials",
      type: "PDF",
      size: "3.1 MB",
      icon: BookOpen,
      color: "from-[#A92FFA] to-purple-700"
    }
  ];

  const categories = [
    "all",
    "Housing",
    "Sober Living",
    "Mental Health",
    "Recovery",
    "AA/12-Step",
    "Biblical/Faith",
    "Food",
    "Shelters",
    "DV Shelters",
    "Assistance",
    "Medicare Accepted",
    "Veterans"
  ];

  const regions = [
    "all",
    "Statewide",
    "Denver Metro",
    "Colorado Springs",
    "Boulder",
    "Jefferson County",
    "Southern Colorado"
  ];

  const filteredResources = coloradoResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || resource.region === selectedRegion || resource.region === "Statewide";
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const medicaidResources = coloradoResources.filter(r => r.acceptsMedicaid);

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
              <MapPin className="w-5 h-5 mr-2" />
              Colorado Resource Hub
            </Badge>
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 glow-text transition-all duration-700 delay-100 ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              Comprehensive
              <br />
              <span className="bg-gradient-to-r from-[#A92FFA] to-[#F28C28] bg-clip-text text-transparent">
                Colorado Resources
              </span>
            </h1>
            <p className={`text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 transition-all duration-700 delay-200 ${
              heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              Housing, mental health, recovery, AA meetings, biblical resources, shelters, food banks, sober living, assistance programs, and Medicare-accepted services across all of Colorado
            </p>
            <div className={`flex flex-wrap gap-3 justify-center transition-all duration-700 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Home className="w-4 h-4 mr-1" /> Housing</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Brain className="w-4 h-4 mr-1" /> Mental Health</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Heart className="w-4 h-4 mr-1" /> Recovery</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Users className="w-4 h-4 mr-1" /> AA/12-Step</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Cross className="w-4 h-4 mr-1" /> Biblical</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Shield className="w-4 h-4 mr-1" /> Shelters</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Utensils className="w-4 h-4 mr-1" /> Food</Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3"><Stethoscope className="w-4 h-4 mr-1" /> Medicare Accepted</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines */}
      <section 
        ref={emergencyRef}
        className={`py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 transition-all duration-700 ${
          emergencyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              Emergency Support
            </Badge>
            <h2 className="text-3xl font-bold mb-2 glow-text">24/7 Crisis Hotlines</h2>
            <p className="text-muted-foreground">Immediate help is available - you're not alone</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emergencyHotlines.map((hotline, index) => (
              <Card key={index} className="bg-white dark:bg-card border-2 border-red-200 dark:border-red-900 hover-lift">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mb-2">
                    <hotline.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <CardTitle className="text-sm leading-tight">{hotline.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xl font-bold text-red-600 mb-1">{hotline.number}</p>
                  <p className="text-xs text-muted-foreground">{hotline.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search resources by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border border-border rounded-md bg-background min-w-[180px]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="p-2 border border-border rounded-md bg-background min-w-[180px]"
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>
                        {region === "all" ? "All Regions" : region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Quick filters:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSelectedCategory("all"); setSelectedRegion("all"); setSearchQuery(""); }}
                  className="h-7"
                >
                  Clear All
                </Button>
                <Button 
                  variant={selectedCategory === "Medicare Accepted" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("Medicare Accepted")}
                  className="h-7"
                >
                  <Stethoscope className="w-3 h-3 mr-1" /> Medicare Accepted
                </Button>
                <Button 
                  variant={selectedCategory === "AA/12-Step" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("AA/12-Step")}
                  className="h-7"
                >
                  <Users className="w-3 h-3 mr-1" /> AA/12-Step
                </Button>
                <Button 
                  variant={selectedCategory === "Biblical/Faith" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("Biblical/Faith")}
                  className="h-7"
                >
                  <Cross className="w-3 h-3 mr-1" /> Faith-Based
                </Button>
                <Button 
                  variant={selectedCategory === "Sober Living" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedCategory("Sober Living")}
                  className="h-7"
                >
                  <Home className="w-3 h-3 mr-1" /> Sober Living
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredResources.length}</span> resources
              {selectedCategory !== "all" && <span> in <Badge variant="secondary">{selectedCategory}</Badge></span>}
              {selectedRegion !== "all" && <span> in <Badge variant="outline">{selectedRegion}</Badge></span>}
            </p>
            {medicaidResources.length > 0 && selectedCategory === "all" && (
              <Badge className="bg-green-600">
                <CircleCheck className="w-3 h-3 mr-1" />
                {medicaidResources.length} Accept Medicare/Medicaid
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Colorado Resources Grid */}
      <section 
        ref={resourcesRef}
        className="py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-[#A92FFA]">
              <MapPin className="w-4 h-4 mr-2" />
              Local Resources
            </Badge>
            <h2 className="text-3xl font-bold mb-2">Colorado Service Directory</h2>
            <p className="text-muted-foreground">Housing, mental health, recovery, food, and support services across Colorado</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <Card 
                key={index}
                className={`hover-lift transition-all duration-500 opacity-100 translate-y-0`}
                style={{ transitionDelay: `${Math.min(index * 30, 300)}ms` }}
              >
                <CardHeader>
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${resource.color} mb-4`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center flex-shrink-0`}>
                      <resource.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">{resource.category}</Badge>
                      {resource.acceptsMedicaid && (
                        <Badge className="bg-green-600 text-xs">
                          <CircleCheck className="w-3 h-3 mr-1" />
                          Medicare/Medicaid
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mb-1">{resource.name}</CardTitle>
                  <CardDescription className="text-sm">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <p className="font-semibold">{resource.phone}</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#F28C28] mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs">{resource.address}</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#A92FFA] mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs">{resource.hours}</p>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">{resource.region}</Badge>
                  </div>
                  <Button className="w-full mt-3" variant="outline" size="sm" asChild>
                    <a href={`https://${resource.website}`} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedRegion("all");
              }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Downloadable Resources */}
      <section 
        ref={downloadsRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 overlay-gradient transition-all duration-700 ${
          downloadsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#A92FFA]">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </Badge>
            <h2 className="text-4xl font-bold mb-4 glow-text">Downloadable Resources</h2>
            <p className="text-xl text-muted-foreground">Free guides, workbooks, and directories for your recovery journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadableResources.map((resource, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${resource.color} mb-4`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center`}>
                      <resource.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary">{resource.type}</Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{resource.category}</Badge>
                    <span className="text-sm text-muted-foreground">{resource.size}</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#A92FFA] to-[#F28C28] hover:opacity-90">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 glow-text">Need Immediate Help?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our team is available 24/7 to help you access the resources you need across all of Colorado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="bg-white text-[#A92FFA] hover:bg-white/90 border-white text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Call 720.663.9243
                </Button>
                <Button size="lg" variant="outline" className="bg-white text-[#F28C28] hover:bg-white/90 border-white text-lg">
                  Contact Us
                  <ExternalLink className="w-5 h-5 ml-2" />
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
