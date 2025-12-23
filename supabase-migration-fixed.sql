-- Supabase Migration: Create results table (with quoted column names for PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Drop the table if it exists to recreate with correct column names
DROP TABLE IF EXISTS results CASCADE;

CREATE TABLE results (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT NOT NULL,
  team_code TEXT,
  "natural_D" INTEGER NOT NULL,
  "natural_I" INTEGER NOT NULL,
  "natural_S" INTEGER NOT NULL,
  "natural_C" INTEGER NOT NULL,
  "adaptive_D" INTEGER NOT NULL,
  "adaptive_I" INTEGER NOT NULL,
  "adaptive_S" INTEGER NOT NULL,
  "adaptive_C" INTEGER NOT NULL,
  primary_natural TEXT NOT NULL,
  primary_adaptive TEXT NOT NULL,
  driving_forces TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_department ON results(department);
CREATE INDEX IF NOT EXISTS idx_created_at ON results(created_at);
CREATE INDEX IF NOT EXISTS idx_team_code ON results(team_code);

-- Enable Row Level Security (RLS) - you can adjust policies as needed
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your security needs)
-- For now, we'll allow all operations. You can restrict this later.
CREATE POLICY "Allow all operations on results" ON results
  FOR ALL
  USING (true)
  WITH CHECK (true);

