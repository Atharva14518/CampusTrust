-- Voting System Migration
-- Adds tx_id columns for blockchain verification

-- Add tx_id to proposals (for on-chain proposal creation)
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS tx_id VARCHAR(255);

-- Add tx_id to votes (for on-chain vote verification)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS tx_id VARCHAR(255);
