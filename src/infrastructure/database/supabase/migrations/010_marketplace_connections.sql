-- Migration: Marketplace Connections
-- Description: Create marketplace_connections table for managing external marketplace integrations

-- Create marketplace_connections table
CREATE TABLE IF NOT EXISTS marketplace_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    marketplace VARCHAR(50) NOT NULL CHECK (marketplace IN ('trendyol', 'amazon', 'hepsiburada', 'n11', 'gittigidiyor', 'ciceksepeti')),
    name VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    auto_sync_interval INTEGER, -- minutes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, name),
    CONSTRAINT valid_auto_sync_interval CHECK (auto_sync_interval IS NULL OR auto_sync_interval > 0)
);

-- Create indexes for better performance (after table creation)
CREATE INDEX IF NOT EXISTS idx_marketplace_connections_tenant_id ON marketplace_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_connections_marketplace ON marketplace_connections(marketplace);
CREATE INDEX IF NOT EXISTS idx_marketplace_connections_status ON marketplace_connections(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_connections_sync_enabled ON marketplace_connections(sync_enabled);
CREATE INDEX IF NOT EXISTS idx_marketplace_connections_last_sync_at ON marketplace_connections(last_sync_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_marketplace_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketplace_connections_updated_at
    BEFORE UPDATE ON marketplace_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_marketplace_connections_updated_at();

-- Enable Row Level Security
ALTER TABLE marketplace_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_connections
-- Super admins can see all connections
CREATE POLICY "Super admins can view all marketplace connections" ON marketplace_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Super admins can manage all connections
CREATE POLICY "Super admins can manage all marketplace connections" ON marketplace_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Tenant admins can only see their own connections
CREATE POLICY "Tenant admins can view own marketplace connections" ON marketplace_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = marketplace_connections.tenant_id
            AND users.role = 'admin'
        )
    );

-- Tenant admins can manage their own connections
CREATE POLICY "Tenant admins can manage own marketplace connections" ON marketplace_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = marketplace_connections.tenant_id
            AND users.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE marketplace_connections IS 'Stores marketplace connection configurations and credentials';
COMMENT ON COLUMN marketplace_connections.marketplace IS 'Type of marketplace (trendyol, amazon, hepsiburada, etc.)';
COMMENT ON COLUMN marketplace_connections.credentials IS 'Encrypted marketplace API credentials (API keys, tokens, etc.)';
COMMENT ON COLUMN marketplace_connections.config IS 'Marketplace-specific configuration settings';
COMMENT ON COLUMN marketplace_connections.status IS 'Connection status (active, inactive, error, testing)';
COMMENT ON COLUMN marketplace_connections.last_sync_at IS 'Last successful synchronization timestamp';
COMMENT ON COLUMN marketplace_connections.last_error IS 'Last error message if status is error';
COMMENT ON COLUMN marketplace_connections.sync_enabled IS 'Whether automatic synchronization is enabled';
COMMENT ON COLUMN marketplace_connections.auto_sync_interval IS 'Automatic sync interval in minutes (NULL = disabled)';
