const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true
};

const schema = `
CREATE DATABASE IF NOT EXISTS trustcampus;
USE trustcampus;

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(255),
    wallet_address VARCHAR(255) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    tx_id VARCHAR(255),
    timestamp BIGINT
);

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    date DATE,
    description TEXT,
    student_address VARCHAR(255) NOT NULL,
    metadata_cid VARCHAR(255),
    image_cid VARCHAR(255),
    asset_id VARCHAR(255),
    status ENUM('PENDING', 'CONFIRMED') DEFAULT 'PENDING',
    tx_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(255),
    course_id VARCHAR(50),
    rating INT,
    comment TEXT,
    sentiment_score FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function main() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');
        await connection.query(schema);
        console.log('Database and tables created successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

main();
