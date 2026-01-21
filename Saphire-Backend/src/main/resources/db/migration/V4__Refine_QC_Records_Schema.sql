-- V4__Refine_QC_Records_Schema.sql
-- Ensure rejection_reason and notes columns exist in qc_form_records
-- This is a safety migration in case V1 was skipped due to existing tables

DO $$
BEGIN
    -- Add rejection_reason if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='qc_form_records' AND column_name='rejection_reason') THEN
        ALTER TABLE qc_form_records ADD COLUMN rejection_reason TEXT;
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='qc_form_records' AND column_name='notes') THEN
        ALTER TABLE qc_form_records ADD COLUMN notes TEXT;
    END IF;
END $$;
