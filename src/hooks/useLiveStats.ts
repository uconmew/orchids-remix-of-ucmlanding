"use client";

import { useState, useEffect } from "react";

export interface LiveStats {
  livesTransformed: number;
  ldiApplicants: number;
  communityTouchPoints: number;
  prayersCount: number;
  communityPrayers: number;
  activeMentors: number;
}

const defaultStats: LiveStats = {
  livesTransformed: 500,
  ldiApplicants: 150,
  communityTouchPoints: 25000,
  prayersCount: 0,
  communityPrayers: 0,
  activeMentors: 0
};

export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error fetching stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
