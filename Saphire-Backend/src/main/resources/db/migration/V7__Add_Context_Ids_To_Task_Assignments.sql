-- V7__Add_Context_Ids_To_Task_Assignments.sql

ALTER TABLE task_assignments ADD COLUMN machine_id BIGINT;
ALTER TABLE task_assignments ADD COLUMN product_id BIGINT;

-- Add foreign key constraints if needed, but these are optional depending on the system design.
-- Usually it's better to stay flexible if these are simple references.
-- ALTER TABLE task_assignments ADD CONSTRAINT fk_task_assignments_machine FOREIGN KEY (machine_id) REFERENCES machines(id);
-- ALTER TABLE task_assignments ADD CONSTRAINT fk_task_assignments_product FOREIGN KEY (product_id) REFERENCES products(id);
