-- Migration: Add student_name column to attendance table
USE trustcampus;

-- Add student_name column if it doesn't exist
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS student_name VARCHAR(255) AFTER wallet_address;

-- Verify the change
DESCRIBE attendance;
