const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    database: process.env.DB_NAME || 'trustcampus'
};

async function main() {
    let connection;
    try {
        // First connect without database selected to create it if needed
        const { database, ...serverConfig } = dbConfig;
        connection = await mysql.createConnection(serverConfig);
        console.log('Connected to MySQL server.');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
        await connection.query(`USE ${database}`);
        console.log(`Using database: ${database}`);

        // Define Base Tables
        const baseSchema = `
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
                INDEX idx_student (student_address)
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
            
            CREATE TABLE IF NOT EXISTS proposals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                creator_role ENUM('TEACHER', 'HOD') DEFAULT 'TEACHER',
                creator_address VARCHAR(255),
                deadline TIMESTAMP NULL,
                yes_votes INT DEFAULT 0,
                no_votes INT DEFAULT 0,
                abstain_votes INT DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS votes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                proposal_id INT NOT NULL,
                voter_address VARCHAR(255) NOT NULL,
                vote_choice ENUM('YES', 'NO', 'ABSTAIN') NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_vote (proposal_id, voter_address),
                FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
            );
        `;

        await connection.query(baseSchema);
        console.log('Base tables created/verified.');

        // Migrations (Alter existing tables)

        // 1. Add ip_address to attendance
        try {
            await connection.query('SELECT ip_address FROM attendance LIMIT 1');
            console.log('Column ip_address exists in attendance.');
        } catch (e) {
            console.log('Adding ip_address column to attendance...');
            await connection.query('ALTER TABLE attendance ADD COLUMN ip_address VARCHAR(45)');
            await connection.query('ALTER TABLE attendance ADD INDEX idx_class_ip (class_id, ip_address)');
            console.log('Added ip_address column.');
        }

        // 2. Add tx_id to proposals
        try {
            await connection.query('SELECT tx_id FROM proposals LIMIT 1');
            console.log('Column tx_id exists in proposals.');
        } catch (e) {
            console.log('Adding tx_id to proposals...');
            await connection.query('ALTER TABLE proposals ADD COLUMN tx_id VARCHAR(255)');
            console.log('Added tx_id to proposals.');
        }

        // 3. Add tx_id to votes
        try {
            await connection.query('SELECT tx_id FROM votes LIMIT 1');
            console.log('Column tx_id exists in votes.');
        } catch (e) {
            console.log('Adding tx_id to votes...');
            await connection.query('ALTER TABLE votes ADD COLUMN tx_id VARCHAR(255)');
            console.log('Added tx_id to votes.');
        }

        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        if (connection) await connection.end();
    }
}

main();
