-- V2__Sync_QC_Schema.sql
-- Sync database schema with JPA entities for QC-related tables

-- 1. Update qc_form_sections
ALTER TABLE qc_form_sections 
    RENAME COLUMN repeat_label TO repeat_label_pattern;

ALTER TABLE qc_form_sections 
    ADD COLUMN IF NOT EXISTS has_groups BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS group_labels JSONB;

-- 2. Update qc_form_fields
-- Rename field_type to input_type to match entity @Column(name = "input_type")
ALTER TABLE qc_form_fields 
    RENAME COLUMN field_type TO input_type;

-- Rename is_required to required to match entity @Column(name = "required")
ALTER TABLE qc_form_fields 
    RENAME COLUMN is_required TO required;

-- Add missing columns
ALTER TABLE qc_form_fields 
    ADD COLUMN IF NOT EXISTS target_value DECIMAL(15,4),
    ADD COLUMN IF NOT EXISTS tolerance DECIMAL(15,4),
    ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2,
    ADD COLUMN IF NOT EXISTS fail_condition TEXT,
    ADD COLUMN IF NOT EXISTS help_text TEXT,
    ADD COLUMN IF NOT EXISTS placeholder TEXT,
    ADD COLUMN IF NOT EXISTS width VARCHAR(20) DEFAULT 'full';

-- 3. Update qc_form_header_fields
-- Rename is_required to required to match entity @Column(name = "required")
ALTER TABLE qc_form_header_fields 
    RENAME COLUMN is_required TO required;
