-- Check current constraint and update it to allow new notification types
-- First, let's see what constraint exists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'notifications_type_check';

-- Drop the existing constraint if it exists
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Create a new constraint that allows the notification types we're using
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('order_created', 'status_change', 'general', 'system'));