-- ============================================================================
-- OTONIQ.AI - Add Priority Column to Feed Optimization Rules
-- Migration 085: Add priority column to feed_optimization_rules table
-- ============================================================================

-- Add priority column to feed_optimization_rules table
ALTER TABLE feed_optimization_rules 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 10 CHECK (priority >= 1 AND priority <= 100);

-- Create index for priority column
CREATE INDEX IF NOT EXISTS idx_feed_rules_priority ON feed_optimization_rules(priority);

-- Update existing rules with default priority values
UPDATE feed_optimization_rules 
SET priority = 10 
WHERE priority IS NULL;

-- Add comment
COMMENT ON COLUMN feed_optimization_rules.priority IS 'Rule priority (1-100, lower = higher priority)';

-- ============================================================================
-- COMPLETE
-- ============================================================================
