-- Add volunteer stats tracking tables
CREATE TABLE IF NOT EXISTS volunteer_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  active_volunteers INTEGER NOT NULL DEFAULT 0,
  hours_donated INTEGER NOT NULL DEFAULT 0,
  partner_churches INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL
);

-- Insert initial data
INSERT INTO volunteer_stats (active_volunteers, hours_donated, partner_churches, last_updated) 
VALUES (250, 5000, 45, datetime('now'));

-- Add volunteer time clock table for future time tracking system
CREATE TABLE IF NOT EXISTS volunteer_time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id TEXT NOT NULL,
  volunteer_name TEXT NOT NULL,
  clock_in TEXT NOT NULL,
  clock_out TEXT,
  total_hours REAL,
  activity_type TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_volunteer_time_entries_volunteer_id ON volunteer_time_entries(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_time_entries_clock_in ON volunteer_time_entries(clock_in);
