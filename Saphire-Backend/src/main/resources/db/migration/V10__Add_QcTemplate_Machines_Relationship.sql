-- Create join table for QC Templates and Machines
CREATE TABLE qc_template_machines (
    qc_template_id BIGINT REFERENCES qc_form_templates(id),
    machine_id BIGINT REFERENCES machines(id),
    PRIMARY KEY (qc_template_id, machine_id)
);

-- Migrate existing data from qc_form_templates to the join table
INSERT INTO qc_template_machines (qc_template_id, machine_id)
SELECT id, machine_id FROM qc_form_templates WHERE machine_id IS NOT NULL;

-- Remove the old machine_id column from qc_form_templates
ALTER TABLE qc_form_templates DROP COLUMN machine_id;
