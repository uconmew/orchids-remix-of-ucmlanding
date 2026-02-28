"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  Heart,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Donation {
  id: number;
  stripePaymentIntentId: string;
  donorEmail: string;
  donorName: string | null;
  amount: number;
  donationType: string;
  tier: string | null;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface Subscription {
  id: number;
  stripeSubscriptionId: string;
  donorEmail: string;
  donorName: string | null;
  amount: number;
  interval: string;
  tier: string | null;
  status: string;
  isAnonymous: boolean;
  currentPeriodEnd: string;
  createdAt: string;
}

interface Stats {
  totalRaised: number;
  totalOneTime: number;
  monthlyRecurring: number;
  totalDonations: number;
  activeSubscriptions: number;
  last30Days: {
    oneTime: number;
    recurring: number;
    total: number;
  };
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [donationsRes, statsRes] = await Promise.all([
        fetch("/api/donations"),
        fetch("/api/donations/stats"),
      ]);

      if (donationsRes.ok) {
        const data = await donationsRes.json();
        setDonations(data.donations || []);
        setSubscriptions(data.subscriptions || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching donation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      succeeded: "bg-green-100 text-green-800",
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      incomplete: "bg-yellow-100 text-yellow-800",
      canceled: "bg-gray-100 text-gray-800",
      failed: "bg-red-100 text-red-800",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  const filteredDonations = donations.filter(
    (d) =>
      d.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const filteredSubscriptions = subscriptions.filter(
    (s) =>
      s.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Donation Management</h1>
                <p className="text-sm text-muted-foreground">
                  View and manage all donations and subscriptions
                </p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Raised</CardDescription>
                <CardTitle className="text-3xl text-[#A92FFA]">
                  {formatCurrency(stats.totalRaised)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-1" />
                  All time donations
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Recurring</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {formatCurrency(stats.monthlyRecurring)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {stats.activeSubscriptions} active subscriptions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Last 30 Days</CardDescription>
                <CardTitle className="text-3xl text-[#F28C28]">
                  {formatCurrency(stats.last30Days.total)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Recent donations
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Donations</CardDescription>
                <CardTitle className="text-3xl text-blue-600">
                  {stats.totalDonations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 mr-1" />
                  Completed one-time gifts
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="one-time">One-Time Donations</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Donations</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search donors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent One-Time Donations</CardTitle>
                  <CardDescription>Last 10 one-time gifts</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : donations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No donations yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {donations.slice(0, 10).map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {donation.isAnonymous
                                ? "Anonymous"
                                : donation.donorName || donation.donorEmail}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(donation.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#A92FFA]">
                              {formatCurrency(donation.amount)}
                            </p>
                            <Badge className={getStatusBadge(donation.status)}>
                              {donation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Current recurring donors</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : subscriptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active subscriptions
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subscriptions.slice(0, 10).map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {sub.isAnonymous
                                ? "Anonymous"
                                : sub.donorName || sub.donorEmail}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Next: {formatDate(sub.currentPeriodEnd)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(sub.amount)}/{sub.interval}
                            </p>
                            <Badge className={getStatusBadge(sub.status)}>
                              {sub.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="one-time">
            <Card>
              <CardHeader>
                <CardTitle>All One-Time Donations</CardTitle>
                <CardDescription>
                  Complete history of one-time gifts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredDonations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No donations found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Donor
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Tier
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDonations.map((donation) => (
                          <tr key={donation.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">
                                  {donation.isAnonymous
                                    ? "Anonymous"
                                    : donation.donorName || "N/A"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {donation.donorEmail}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {formatCurrency(donation.amount)}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {donation.tier || "Custom"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadge(donation.status)}>
                                {donation.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {formatDate(donation.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring">
            <Card>
              <CardHeader>
                <CardTitle>All Recurring Donations</CardTitle>
                <CardDescription>
                  Manage subscription-based donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Donor
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Frequency
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Next Billing
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubscriptions.map((sub) => (
                          <tr key={sub.id} className="border-b">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">
                                  {sub.isAnonymous
                                    ? "Anonymous"
                                    : sub.donorName || "N/A"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {sub.donorEmail}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {formatCurrency(sub.amount)}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {sub.interval === "month" ? "Monthly" : "Yearly"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadge(sub.status)}>
                                {sub.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {formatDate(sub.currentPeriodEnd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
