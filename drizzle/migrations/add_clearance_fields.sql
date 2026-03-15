-- Add clearance fields to user_roles table
ALTER TABLE user_roles ADD COLUMN permission_clearance INTEGER DEFAULT 0;
ALTER TABLE user_roles ADD COLUMN duty_clearance INTEGER DEFAULT 0;
