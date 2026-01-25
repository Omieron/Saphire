CREATE TABLE user_machines (
    user_id BIGINT NOT NULL,
    machine_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, machine_id),
    CONSTRAINT fk_um_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_um_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- Index for better performance when querying by machine
CREATE INDEX idx_user_machines_machine ON user_machines(machine_id);
