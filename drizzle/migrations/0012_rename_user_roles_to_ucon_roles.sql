-- Migration: Rename user_roles table to ucon_roles
-- Purpose: Clarify that these roles are for STAFF ONLY (Ucon Roles)
-- Other roles: Convicts and Convict Volunteers (tracked in convicts table with convictType and convictRole)

-- Rename the table
ALTER TABLE user_roles RENAME TO ucon_roles;

-- Update any indexes if they exist
-- SQLite will automatically handle this during the table rename

-- Note: The userRoles export in schema.ts remains as an alias for backward compatibility
-- New code should reference: uconRoles (staff roles)
-- Convicts/Volunteers: use convicts table with convictType ('Convict' | 'Convict Volunteer') and convictRole (job title)
