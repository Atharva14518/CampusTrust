CREATE DATABASE IF NOT EXISTS trustcampus;
USE trustcampus;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id VARCHAR(100) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    student_name VARCHAR(255),
    tx_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    INDEX idx_class (class_id),
    INDEX idx_wallet (wallet_address)
);

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_address VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    metadata_cid VARCHAR(255) NOT NULL,
    image_cid VARCHAR(255) NOT NULL,
    asset_id BIGINT,
    tx_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student (student_address),
    INDEX idx_asset (asset_id)
);

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_address VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(100),
    sentiment_score FLOAT,
    feedback_text TEXT,
    hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student (student_address)
);
