-- Create table for tracking Perplexity API daily usage
-- Critical: Perplexity PRO has a hard limit of 300 searches/day
-- This table tracks daily usage to prevent exceeding the limit

CREATE TABLE IF NOT EXISTS perplexity_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  searches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on date for fast lookups
CREATE INDEX IF NOT EXISTS idx_perplexity_usage_date ON perplexity_usage(date);

-- Create index on date DESC for recent usage queries
CREATE INDEX IF NOT EXISTS idx_perplexity_usage_date_desc ON perplexity_usage(date DESC);

-- Add RLS policies (if using RLS)
-- Allow service role to read/write (for server-side tracking)
-- Allow authenticated users to read (for dashboard)
ALTER TABLE perplexity_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON perplexity_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can read (for dashboard)
CREATE POLICY "Authenticated users can read"
  ON perplexity_usage
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_perplexity_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_perplexity_usage_updated_at
  BEFORE UPDATE ON perplexity_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_perplexity_usage_updated_at();

-- Add comment
COMMENT ON TABLE perplexity_usage IS 'Tracks daily Perplexity API usage to respect 300 searches/day limit';
COMMENT ON COLUMN perplexity_usage.date IS 'Date in YYYY-MM-DD format (UTC)';
COMMENT ON COLUMN perplexity_usage.searches IS 'Total number of Perplexity searches on this date';

