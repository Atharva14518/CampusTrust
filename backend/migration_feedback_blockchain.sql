-- Migration: Add blockchain fields to feedback table
-- Run this in MySQL: mysql -u root -p trustcampus < migration_feedback_blockchain.sql

-- Add new columns if they don't exist
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS class_id VARCHAR(100) AFTER teacher_id,
ADD COLUMN IF NOT EXISTS feedback_text TEXT AFTER class_id,
ADD COLUMN IF NOT EXISTS tx_id VARCHAR(255) AFTER hash,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE AFTER tx_id;

-- Update existing column names if needed (student_id -> student_address)
-- Note: Only run if column exists
-- ALTER TABLE feedback CHANGE student_id student_address VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_class ON feedback(class_id);
CREATE INDEX IF NOT EXISTS idx_feedback_verified ON feedback(verified);
CREATE INDEX IF NOT EXISTS idx_feedback_tx ON feedback(tx_id);
