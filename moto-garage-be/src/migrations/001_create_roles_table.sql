-- Roles Table
-- Menyimpan data role/hak akses pengguna sistem

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian role berdasarkan name dan is_active
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);

COMMENT ON TABLE roles IS 'Tabel untuk menyimpan role/hak akses pengguna sistem';
COMMENT ON COLUMN roles.permissions IS 'JSONB structure: {"dashboard":{"view":true,"create":false...}}';
