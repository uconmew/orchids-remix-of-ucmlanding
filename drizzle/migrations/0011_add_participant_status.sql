-- Add status column to workshop_participants table
ALTER TABLE workshop_participants ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Update existing rows to set status based on leftAt
UPDATE workshop_participants 
SET status = CASE 
  WHEN left_at IS NOT NULL THEN 'left'
  ELSE 'active'
END;
