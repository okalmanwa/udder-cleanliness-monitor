-- Add cow_number column to udders table
ALTER TABLE udders ADD COLUMN IF NOT EXISTS cow_number INTEGER NOT NULL DEFAULT 1; 