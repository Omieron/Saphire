-- Migration for System Error Logs
CREATE TABLE system_error_logs (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    source_class VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster searching by timestamp
CREATE INDEX idx_system_error_logs_timestamp ON system_error_logs(timestamp);
