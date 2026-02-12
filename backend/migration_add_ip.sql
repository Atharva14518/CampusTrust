ALTER TABLE attendance ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE attendance ADD INDEX idx_class_ip (class_id, ip_address);
