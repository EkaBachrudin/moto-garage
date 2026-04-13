-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUTHENTICATION TABLES
-- ============================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table (formerly Employees)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(role_id) ON DELETE SET NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UserSessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RevokedTokens Table (JWT Blacklist)
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jti VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- CORE BUSINESS TABLES
-- ============================================

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL
);

-- 6. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(100),
  address TEXT
);

-- 7. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  is_member BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  brand_type VARCHAR(100) NOT NULL
);

-- 9. Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  buy_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sell_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_qty INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  unit_buy VARCHAR(20),
  unit_sell VARCHAR(20),
  conversion INT DEFAULT 1
);

-- 10. ServiceOrders Table
CREATE TABLE IF NOT EXISTS service_orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'Antri' CHECK (status IN ('Antri', 'Pengecekan', 'Dikerjakan', 'Konfirmasi Part', 'Menunggu Part', 'Selesai', 'Batal')),
  entry_type VARCHAR(10) DEFAULT 'Walk-In' CHECK (entry_type IN ('Booking', 'Walk-In')),
  complaint TEXT,
  diagnosis TEXT,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ
);

-- 11. OrderDetails Table
CREATE TABLE IF NOT EXISTS order_details (
  detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES service_orders(order_id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('Jasa', 'Sparepart')),
  product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT check_product_for_sparepart CHECK (
    (type = 'Sparepart' AND product_id IS NOT NULL) OR
    (type = 'Jasa' AND product_id IS NULL)
  )
);

-- 12. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES service_orders(order_id) ON DELETE CASCADE,
  processed_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  total_bill DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  dp_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(10) CHECK (payment_method IN ('Tunai', 'Debit', 'QRIS')),
  payment_status VARCHAR(15) DEFAULT 'Belum Lunas' CHECK (payment_status IN ('Lunas', 'Belum Lunas')),
  payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(user_id) WHERE is_active = true;

-- Single Device Login Function: Deactivate existing sessions when creating new one
CREATE OR REPLACE FUNCTION enforce_single_device_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Deactivate all existing active sessions for this user
  UPDATE user_sessions
  SET is_active = false
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND session_id IS DISTINCT FROM NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single device login
DROP TRIGGER IF EXISTS enforce_single_device_login_trigger ON user_sessions;
CREATE TRIGGER enforce_single_device_login_trigger
  BEFORE INSERT OR UPDATE OF is_active ON user_sessions
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION enforce_single_device_login();
CREATE INDEX IF NOT EXISTS idx_revoked_jti ON revoked_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_revoked_expires_at ON revoked_tokens(expires_at);

-- Business indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_qty) WHERE stock_qty <= min_stock;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vehicle_id ON service_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_orders_mechanic_id ON service_orders(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_entry_date ON service_orders(entry_date);
CREATE INDEX IF NOT EXISTS idx_order_details_order_id ON order_details(order_id);
CREATE INDEX IF NOT EXISTS idx_order_details_product_id ON order_details(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update stock when sparepart is used
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'Sparepart' AND TG_OP = 'INSERT' THEN
    UPDATE products
    SET stock_qty = stock_qty - NEW.quantity
    WHERE product_id = NEW.product_id;
  ELSIF NEW.type = 'Sparepart' AND TG_OP = 'UPDATE' THEN
    -- Handle stock adjustment
    UPDATE products
    SET stock_qty = stock_qty - (NEW.quantity - OLD.quantity)
    WHERE product_id = NEW.product_id;
  ELSIF OLD.type = 'Sparepart' AND TG_OP = 'DELETE' THEN
    -- Restore stock when deleted
    UPDATE products
    SET stock_qty = stock_qty + OLD.quantity
    WHERE product_id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to order_details
CREATE TRIGGER update_stock_on_order_detail_change
  AFTER INSERT OR UPDATE OR DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Full access to all features', '{"dashboard":{"view":true,"create":true,"update":true,"delete":true},"orders":{"view":true,"create":true,"update":true,"delete":true},"products":{"view":true,"create":true,"update":true,"delete":true},"customers":{"view":true,"create":true,"update":true,"delete":true},"employees":{"view":true,"create":true,"update":true,"delete":true},"reports":{"view":true,"export":true}}'),
('kasir', 'Can manage orders and payments', '{"dashboard":{"view":true,"create":false,"update":false,"delete":false},"orders":{"view":true,"create":true,"update":true,"delete":false},"products":{"view":true,"create":false,"update":false,"delete":false},"customers":{"view":true,"create":true,"update":true,"delete":false},"employees":{"view":false,"create":false,"update":false,"delete":false},"reports":{"view":true,"export":false}}'),
('mekanik', 'Can view and update assigned orders', '{"dashboard":{"view":true,"create":false,"update":false,"delete":false},"orders":{"view":true,"create":false,"update":true,"delete":false},"products":{"view":true,"create":false,"update":false,"delete":false},"customers":{"view":true,"create":false,"update":false,"delete":false},"employees":{"view":false,"create":false,"update":false,"delete":false},"reports":{"view":false,"export":false}}')
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name) VALUES
('Sparepart'),
('Aksesoris'),
('Oli'),
('Jasa Servis')
ON CONFLICT DO NOTHING;

-- Insert default admin user
-- Email: admin@motogarage.com
-- Password: Admin123! (CHANGE THIS IN PRODUCTION!)
-- Password hash is argon2id hash of 'Admin123!'
INSERT INTO users (role_id, full_name, email, phone, password_hash, is_active)
SELECT
  (SELECT role_id FROM roles WHERE name = 'admin'),
  'Super Admin',
  'admin@motogarage.com',
  '+6281234567890',
  '$argon2id$v=19$m=65536,t=3,p=4$qxxAhZ/kxNreoe/6lv69Hw$2uOcNu+R/Pk7bYMvUPU0gkD3JPs6Ies11mdMIM8Mdzg',
  true
ON CONFLICT (email) DO NOTHING;

-- Insert default kasir user
-- Email: kasir@motogarage.com
-- Password: Kasir123! (CHANGE THIS IN PRODUCTION!)
-- Password hash is argon2id hash of 'Kasir123!'
INSERT INTO users (role_id, full_name, email, phone, password_hash, commission_rate, is_active)
SELECT
  (SELECT role_id FROM roles WHERE name = 'kasir'),
  'Kasir Bengkel',
  'kasir@motogarage.com',
  '+6281234567891',
  '$argon2id$v=19$m=65536,t=3,p=4$7P2H3cGW0iz9u/roHoAfdA$H3+Cha0UAIWFpdIJNfesFdAxQCLBmHABkwLoBjxa6nw',
  0.00,
  true
ON CONFLICT (email) DO NOTHING;

-- Insert default mekanik user
-- Email: mekanik@motogarage.com
-- Password: Mekanik123! (CHANGE THIS IN PRODUCTION!)
-- Password hash is argon2id hash of 'Mekanik123!'
INSERT INTO users (role_id, full_name, email, phone, password_hash, commission_rate, is_active)
SELECT
  (SELECT role_id FROM roles WHERE name = 'mekanik'),
  'Mekanik Bengkel',
  'mekanik@motogarage.com',
  '+6281234567892',
  '$argon2id$v=19$m=65536,t=3,p=4$asYu0fePhQuEmR+OAnMBaA$BCiD3h0225twd4XRL8RqXkAbOcObhc1NfbZww7R/S4c',
  5.00,
  true
ON CONFLICT (email) DO NOTHING;
