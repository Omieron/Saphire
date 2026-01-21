-- Migration to add 'active' flag to QC entities for soft-delete support

ALTER TABLE qc_form_header_fields ADD COLUMN active BOOLEAN DEFAULT true;
ALTER TABLE qc_form_sections ADD COLUMN active BOOLEAN DEFAULT true;
ALTER TABLE qc_form_fields ADD COLUMN active BOOLEAN DEFAULT true;
