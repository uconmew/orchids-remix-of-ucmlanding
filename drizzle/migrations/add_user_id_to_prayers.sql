-- Add user_id column to prayers table if it doesn't exist
ALTER TABLE prayers ADD COLUMN IF NOT EXISTS user_id TEXT;
