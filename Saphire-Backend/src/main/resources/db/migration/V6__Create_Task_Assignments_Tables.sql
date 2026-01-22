-- V6__Create_Task_Assignments_Tables.sql

CREATE TABLE task_assignments (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES qc_form_templates(id),
    type VARCHAR(20) NOT NULL, -- ONCE, RECURRING
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_assignment_users (
    assignment_id BIGINT NOT NULL REFERENCES task_assignments(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (assignment_id, user_id)
);

CREATE TABLE task_schedules (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES task_assignments(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 1-7 (Monday-Sunday) for RECURRING
    specific_date DATE, -- for ONCE
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_schedules_assignment ON task_schedules(assignment_id);
CREATE INDEX idx_task_assignment_users_user ON task_assignment_users(user_id);
