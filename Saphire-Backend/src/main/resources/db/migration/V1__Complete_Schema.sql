-- V1__Complete_Schema.sql
-- Complete database schema for Saphire QC application
-- Includes all tables with proper foreign keys, indexes, and partitioning

-- =====================================================
-- MASTER TABLES (no dependencies)
-- =====================================================

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Locations (company_id nullable for backward compatibility)
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES locations(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    active BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    available_from TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PRODUCTION TABLES
-- =====================================================

-- Product Routes (must be before product_instances)
CREATE TABLE IF NOT EXISTS product_routes (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Instances (all columns from entity)
CREATE TABLE IF NOT EXISTS product_instances (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    route_id BIGINT NOT NULL REFERENCES product_routes(id),
    location_id BIGINT NOT NULL REFERENCES locations(id),
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority INTEGER DEFAULT 3,
    due_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Machine Status (correct table name matching entity)
CREATE TABLE IF NOT EXISTS machine_status (
    id BIGSERIAL PRIMARY KEY,
    machine_id BIGINT UNIQUE NOT NULL REFERENCES machines(id),
    current_status VARCHAR(50) NOT NULL DEFAULT 'IDLE',
    current_instance_id BIGINT REFERENCES product_instances(id),
    current_step_id BIGINT,
    current_operator_id BIGINT REFERENCES users(id),
    status_since TIMESTAMP NOT NULL DEFAULT NOW(),
    estimated_finish_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Route Steps
CREATE TABLE IF NOT EXISTS product_route_steps (
    id BIGSERIAL PRIMARY KEY,
    route_id BIGINT NOT NULL REFERENCES product_routes(id),
    step_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add FK constraint for current_step_id after product_route_steps exists
ALTER TABLE machine_status 
    ADD CONSTRAINT fk_machine_status_step 
    FOREIGN KEY (current_step_id) REFERENCES product_route_steps(id);

-- Route Step Machines
CREATE TABLE IF NOT EXISTS route_step_machines (
    id BIGSERIAL PRIMARY KEY,
    route_step_id BIGINT NOT NULL REFERENCES product_route_steps(id),
    machine_id BIGINT NOT NULL REFERENCES machines(id),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Production Steps
CREATE TABLE IF NOT EXISTS production_steps (
    id BIGSERIAL PRIMARY KEY,
    product_instance_id BIGINT NOT NULL REFERENCES product_instances(id),
    route_step_id BIGINT REFERENCES product_route_steps(id),
    machine_id BIGINT REFERENCES machines(id),
    operator_id BIGINT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- QC TABLES
-- =====================================================

-- QC Form Templates
CREATE TABLE IF NOT EXISTS qc_form_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    context_type VARCHAR(50) NOT NULL,
    machine_id BIGINT REFERENCES machines(id),
    product_id BIGINT REFERENCES products(id),
    schedule_type VARCHAR(50) DEFAULT 'ON_DEMAND',
    schedule_config JSONB,
    requires_approval BOOLEAN DEFAULT false,
    allow_partial_save BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QC Form Header Fields
CREATE TABLE IF NOT EXISTS qc_form_header_fields (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES qc_form_templates(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    options JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QC Form Sections
CREATE TABLE IF NOT EXISTS qc_form_sections (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES qc_form_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    section_order INTEGER DEFAULT 0,
    is_repeatable BOOLEAN DEFAULT false,
    repeat_count INTEGER DEFAULT 1,
    repeat_label VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QC Form Fields
CREATE TABLE IF NOT EXISTS qc_form_fields (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES qc_form_sections(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    unit VARCHAR(50),
    field_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    default_value TEXT,
    options JSONB,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- QC RECORDS - PARTITIONED TABLE
-- =====================================================

-- QC Form Records (Partitioned by submitted_at)
CREATE TABLE qc_form_records (
    id BIGSERIAL,
    template_id BIGINT NOT NULL,
    machine_id BIGINT,
    product_instance_id BIGINT,
    production_step_id BIGINT,
    header_data JSONB NOT NULL DEFAULT '{}',
    scheduled_for TIMESTAMP,
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    status VARCHAR(50) DEFAULT 'DRAFT',
    overall_result VARCHAR(50),
    filled_by BIGINT,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id, submitted_at)
) PARTITION BY RANGE (submitted_at);

-- Create partitions for current and next 24 months
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    partition_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..24 LOOP
        partition_date := start_date + (i || ' months')::INTERVAL;
        partition_name := 'qc_form_records_' || TO_CHAR(partition_date, 'YYYY_MM');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF qc_form_records
             FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            partition_date,
            partition_date + INTERVAL '1 month'
        );
    END LOOP;
END $$;

-- Default partition for data outside defined ranges
CREATE TABLE IF NOT EXISTS qc_form_records_default PARTITION OF qc_form_records DEFAULT;

-- QC Form Values (references record_id only, no partition key)
CREATE TABLE IF NOT EXISTS qc_form_values (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL,
    field_id BIGINT NOT NULL REFERENCES qc_form_fields(id),
    repeat_index INTEGER DEFAULT 0,
    group_key VARCHAR(50),
    value_text TEXT,
    value_number DECIMAL(15,4),
    value_boolean BOOLEAN,
    value_json JSONB,
    result VARCHAR(50),
    auto_evaluated BOOLEAN DEFAULT true,
    entered_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Locations
CREATE INDEX idx_locations_company ON locations(company_id);

-- Machines
CREATE INDEX idx_machines_location ON machines(location_id);
CREATE INDEX idx_machines_active ON machines(active);

-- Products
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_active ON products(active);

-- Product Instances
CREATE INDEX idx_product_instances_product ON product_instances(product_id);
CREATE INDEX idx_product_instances_route ON product_instances(route_id);
CREATE INDEX idx_product_instances_location ON product_instances(location_id);
CREATE INDEX idx_product_instances_status ON product_instances(status);

-- Production Steps
CREATE INDEX idx_production_steps_instance ON production_steps(product_instance_id);
CREATE INDEX idx_production_steps_machine ON production_steps(machine_id);
CREATE INDEX idx_production_steps_operator ON production_steps(operator_id);
CREATE INDEX idx_production_steps_status ON production_steps(status);

-- Machine Status
CREATE INDEX idx_machine_status_machine ON machine_status(machine_id);
CREATE INDEX idx_machine_status_current_status ON machine_status(current_status);

-- QC Templates
CREATE INDEX idx_qc_templates_machine ON qc_form_templates(machine_id);
CREATE INDEX idx_qc_templates_product ON qc_form_templates(product_id);
CREATE INDEX idx_qc_templates_active ON qc_form_templates(active);

-- QC Sections
CREATE INDEX idx_qc_sections_template ON qc_form_sections(template_id);

-- QC Fields
CREATE INDEX idx_qc_fields_section ON qc_form_fields(section_id);

-- QC Records (Partitioned table indexes)
CREATE INDEX idx_qc_records_template ON qc_form_records(template_id);
CREATE INDEX idx_qc_records_machine ON qc_form_records(machine_id);
CREATE INDEX idx_qc_records_status ON qc_form_records(status);
CREATE INDEX idx_qc_records_filled_by ON qc_form_records(filled_by);
CREATE INDEX idx_qc_records_submitted_at ON qc_form_records(submitted_at DESC);
CREATE INDEX idx_qc_records_machine_status ON qc_form_records(machine_id, status);

-- QC Values
CREATE INDEX idx_qc_values_record ON qc_form_values(record_id);
CREATE INDEX idx_qc_values_field ON qc_form_values(field_id);

-- =====================================================
-- AUTO-PARTITION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_qc_records_partition()
RETURNS void AS $$
DECLARE
    next_month DATE := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name TEXT := 'qc_form_records_' || TO_CHAR(next_month, 'YYYY_MM');
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = partition_name) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF qc_form_records
             FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            next_month,
            next_month + INTERVAL '1 month'
        );
        RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA - Admin User
-- =====================================================

INSERT INTO users (username, email, full_name, hashed_password, role)
VALUES ('admin', 'admin@saphire.com', 'System Admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z81b5E.pL0VZCuzI5q6B2', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Default company
INSERT INTO companies (code, name) VALUES ('SAPHIRE', 'Saphire Sirket') ON CONFLICT (code) DO NOTHING;

-- Default location with company reference
INSERT INTO locations (company_id, code, name) 
SELECT c.id, 'LOC001', 'Ana Tesis' FROM companies c WHERE c.code = 'SAPHIRE'
ON CONFLICT (code) DO NOTHING;
