-- ============================================================
-- SpeedBilling PostgreSQL Schema Migration
-- Hair Extension Shop Billing & Customer Service System
-- Version: 2.0.0
-- Target: Supabase PostgreSQL 15+
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PART 1: EXISTING TABLES (Adapted from SQLite → PostgreSQL)
-- ============================================================

-- 1. Users (Authentication)
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiration_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Shift Management
CREATE TABLE shift_management (
    shift_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
    final_cash DECIMAL(12,2),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    composition VARCHAR(500),
    manufacturer VARCHAR(200),
    schedule_type VARCHAR(20) DEFAULT 'Normal',
    category VARCHAR(100) NOT NULL,
    hsn_code VARCHAR(20),
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Batches (Stock & Pricing)
CREATE TABLE batches (
    batch_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    batch_code VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    mrp DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    stocks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Doctors (For Schedule H compliance)
CREATE TABLE doctors (
    doctor_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Customers (Extended - will be further enhanced in Part 2)
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE,
    name VARCHAR(200) NOT NULL DEFAULT 'Walk-in Customer',
    email VARCHAR(200),
    -- New fields (Part 2 extension)
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    date_of_birth DATE,
    gender VARCHAR(10),
    photo_url TEXT,
    -- Hair extension specific
    hair_extension_type VARCHAR(100),
    hair_length VARCHAR(50),
    hair_color VARCHAR(50),
    installation_date DATE,
    -- Status & meta
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    referred_by VARCHAR(200),
    last_visit_date TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Orders (Bill Headers)
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    shift_id BIGINT NOT NULL REFERENCES shift_management(shift_id),
    total_amount_before_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    doctor_name VARCHAR(200),
    final_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Order Items (Line Items)
CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    batch_id BIGINT REFERENCES batches(batch_id),
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    avail_return_items INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Payments
CREATE TABLE payments (
    payment_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    cash DECIMAL(12,2) NOT NULL DEFAULT 0,
    upi DECIMAL(12,2) NOT NULL DEFAULT 0,
    card DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_paid DECIMAL(12,2) NOT NULL,
    excess_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    upi_txn_id VARCHAR(200),
    card_txn_id VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Active Bills (In-progress drafts per cashier)
CREATE TABLE active_bills (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    bills_data JSONB NOT NULL DEFAULT '[]',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Returns
CREATE TABLE returns (
    return_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    shift_id BIGINT NOT NULL REFERENCES shift_management(shift_id),
    refund_amount DECIMAL(12,2) NOT NULL,
    return_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Return Items
CREATE TABLE return_items (
    return_item_id BIGSERIAL PRIMARY KEY,
    return_id BIGINT NOT NULL REFERENCES returns(return_id),
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PART 2: NEW TABLES (Customer Service & Session Management)
-- ============================================================

-- 13. Service Sessions (Hair extension service tracking)
CREATE TABLE service_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service_type VARCHAR(100) NOT NULL,
    -- Service details
    service_description TEXT,
    technician_name VARCHAR(200),
    products_used TEXT,
    bundles_used INTEGER,
    cost DECIMAL(12,2),
    -- Customer feedback
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    notes TEXT,
    -- Next session tracking
    next_session_date DATE,
    next_session_interval INTEGER,
    next_session_reminder_sent BOOLEAN DEFAULT FALSE,
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    -- Metadata
    created_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_session_status CHECK (status IN ('completed', 'upcoming', 'missed', 'cancelled')),
    CONSTRAINT valid_next_interval CHECK (next_session_interval IN (30, 45, 60) OR next_session_interval IS NULL)
);

-- 14. Appointment Calendar
CREATE TABLE appointments (
    appointment_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    appointment_date TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    service_type VARCHAR(100) NOT NULL,
    service_description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    -- Reminder tracking
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    -- Assigned to
    assigned_to BIGINT REFERENCES users(user_id),
    -- Meta
    created_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_appointment_status CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

-- 15. Photos (Before/After/Scalp/Document)
CREATE TABLE photos (
    photo_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    session_id BIGINT REFERENCES service_sessions(session_id),
    -- File info
    storage_key VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    -- Classification
    photo_type VARCHAR(30) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    -- URLs
    public_url TEXT,
    thumbnail_url TEXT,
    -- Metadata
    uploaded_by BIGINT REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_photo_type CHECK (photo_type IN ('before', 'after', 'scalp', 'document', 'profile', 'progress', 'other'))
);

-- 16. Reminders (Logged reminders for audit)
CREATE TABLE reminders (
    reminder_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    session_id BIGINT REFERENCES service_sessions(session_id),
    appointment_id BIGINT REFERENCES appointments(appointment_id),
    reminder_type VARCHAR(50) NOT NULL,
    reminder_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Channel (extensible for WhatsApp later)
    channel VARCHAR(20) DEFAULT 'dashboard',
    message_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    -- Meta
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraints
    CONSTRAINT valid_reminder_type CHECK (reminder_type IN (
        'upcoming_session', 'overdue_session', 'follow_up',
        'maintenance_due', 'appointment_reminder'
    )),
    CONSTRAINT valid_reminder_status CHECK (status IN ('pending', 'sent', 'acknowledged', 'dismissed')),
    CONSTRAINT valid_reminder_channel CHECK (channel IN ('dashboard', 'sms', 'email', 'whatsapp'))
);

-- 17. System Logs (Activity audit)
CREATE TABLE activity_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. App Configuration (Key-value store for settings)
CREATE TABLE app_config (
    config_id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PART 3: INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Shift Management
CREATE INDEX idx_shifts_user_id ON shift_management(user_id);
CREATE INDEX idx_shifts_start_time ON shift_management(start_time);
CREATE INDEX idx_shifts_status ON shift_management(status);

-- Products
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category);

-- Batches
CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_product_stock ON batches(product_id, stocks);

-- Customers
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_visit ON customers(last_visit_date);

-- Orders
CREATE INDEX idx_orders_invoice ON orders(invoice_no);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_shift ON orders(shift_id);
CREATE INDEX idx_orders_created ON orders(created_at);
-- Use DATE() function which is IMMUTABLE for TIMESTAMPTZ
CREATE INDEX idx_orders_date ON orders((DATE(created_at AT TIME ZONE 'UTC')));

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);

-- Service Sessions
CREATE INDEX idx_sessions_customer ON service_sessions(customer_id);
CREATE INDEX idx_sessions_date ON service_sessions(session_date);
CREATE INDEX idx_sessions_status ON service_sessions(status);
CREATE INDEX idx_sessions_next_date ON service_sessions(next_session_date);
CREATE INDEX idx_sessions_customer_date ON service_sessions(customer_id, session_date);

-- Appointments
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);

-- Photos
CREATE INDEX idx_photos_customer ON photos(customer_id);
CREATE INDEX idx_photos_session ON photos(session_id);
CREATE INDEX idx_photos_type ON photos(photo_type);

-- Reminders
CREATE INDEX idx_reminders_customer ON reminders(customer_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_type_date ON reminders(reminder_type, reminder_date);

-- Activity Logs
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_type ON activity_logs(action_type);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- ============================================================
-- PART 4: SEED DATA
-- ============================================================

-- Default admin user (password: admin123)
-- Password hash uses bcrypt
INSERT INTO users (username, password_hash, role, expiration_date)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',
        '2030-12-31 23:59:59+00')
ON CONFLICT (username) DO NOTHING;

-- Default configurations
INSERT INTO app_config (config_key, config_value, description) VALUES
    ('shop_name', 'Speed Billing', 'Shop display name'),
    ('shop_address', 'Your Shop Address', 'Shop physical address'),
    ('shop_phone', '044-12345678', 'Shop contact number'),
    ('shop_gstin', '33AAAAA0000A1Z5', 'GST Identification Number'),
    ('session_intervals', '[30,45,60]', 'Available next session intervals in days'),
    ('business_hours', '{"weekday": "09:00-20:00", "sunday": "10:00-18:00"}', 'Business operating hours')
ON CONFLICT (config_key) DO NOTHING;

-- Default reminder settings
INSERT INTO app_config (config_key, config_value, description) VALUES
    ('reminder_enabled', 'true', 'Enable automated reminders'),
    ('reminder_days_before', '1', 'Days before appointment to send reminder'),
    ('overdue_days_threshold', '7', 'Days after next_session_date to mark overdue')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- PART 5: TRIGGERS (AUTO-UPDATE TIMESTAMPS)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_sessions_updated_at BEFORE UPDATE ON service_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_visit_date on customer when bill is saved
CREATE OR REPLACE FUNCTION update_customer_last_visit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET last_visit_date = NEW.created_at,
        total_visits = total_visits + 1
    WHERE customer_id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_update_customer
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_last_visit();

-- ============================================================
-- PART 6: ROW LEVEL SECURITY (Supabase)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Basic RLS: Authenticated users can read all data
-- (This is simplified; refine in production)
CREATE POLICY "Authenticated users can read users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read customers" ON customers
    FOR ALL USING (auth.role() = 'authenticated');
