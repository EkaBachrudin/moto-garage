-- Add order_code column to existing service_orders table
-- Run this script manually on existing databases

-- Step 1: Add the column (nullable first)
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(20);

-- Step 2: Generate order codes for existing orders
-- Format: ORD-YYYYMMDD-XXXX based on entry_date
UPDATE service_orders
SET order_code = 'ORD-' || TO_CHAR(entry_date, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (
  PARTITION BY DATE(entry_date)
  ORDER BY entry_date
)::TEXT, 4, '0')
WHERE order_code IS NULL;

-- Step 3: Make the column required and add unique constraint
ALTER TABLE service_orders ALTER COLUMN order_code SET NOT NULL;
ALTER TABLE service_orders ADD CONSTRAINT service_orders_order_code_key UNIQUE (order_code);
