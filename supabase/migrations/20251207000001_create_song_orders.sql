-- Migration: Create song orders tables
-- Created: 2025-12-07
-- Description: Initial schema for song order management system

-- Song Orders Table
-- Stores all custom song order information
CREATE TABLE IF NOT EXISTS song_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(20) UNIQUE NOT NULL,
    stripe_payment_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    song_brief TEXT,
    generated_prompt TEXT,
    suno_url VARCHAR(500),
    suno_embed_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING',
    package_type VARCHAR(50),
    occasion VARCHAR(100),
    mood VARCHAR(100),
    genre VARCHAR(100),
    event_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_song_orders_order_id ON song_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_song_orders_stripe_payment_id ON song_orders(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_song_orders_customer_email ON song_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_song_orders_status ON song_orders(status);
CREATE INDEX IF NOT EXISTS idx_song_orders_created_at ON song_orders(created_at DESC);

-- Song Order Audit Table
-- Tracks all changes and actions on song orders
CREATE TABLE IF NOT EXISTS song_order_audit (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES song_orders(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB,
    user_email VARCHAR(255),
    ip_address INET
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_song_order_audit_order_id ON song_order_audit(order_id);
CREATE INDEX IF NOT EXISTS idx_song_order_audit_timestamp ON song_order_audit(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_song_order_audit_action ON song_order_audit(action);

-- Enable Row Level Security (RLS)
ALTER TABLE song_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_order_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for song_orders
-- Allow service role to do everything (for API)
CREATE POLICY "Service role can do everything on song_orders"
    ON song_orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read their own orders
CREATE POLICY "Users can read their own orders"
    ON song_orders
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = customer_email);

-- Allow anon users to insert orders (for checkout)
CREATE POLICY "Anonymous users can create orders"
    ON song_orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- RLS Policies for song_order_audit
-- Only service role can access audit logs
CREATE POLICY "Service role can access audit logs"
    ON song_order_audit
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION log_song_order_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO song_order_audit (order_id, action, details)
        VALUES (NEW.id, 'CREATED', to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO song_order_audit (order_id, action, details)
        VALUES (NEW.id, 'UPDATED', jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        ));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO song_order_audit (order_id, action, details)
        VALUES (OLD.id, 'DELETED', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically log changes
CREATE TRIGGER song_order_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON song_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_song_order_change();

-- Comments for documentation
COMMENT ON TABLE song_orders IS 'Stores custom song order information from customers';
COMMENT ON TABLE song_order_audit IS 'Audit trail for all changes to song orders';
COMMENT ON COLUMN song_orders.status IS 'Order status: PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED';
COMMENT ON COLUMN song_orders.package_type IS 'Package type: express, standard, wedding';
