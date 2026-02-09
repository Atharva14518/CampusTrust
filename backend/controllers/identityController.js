const db = require('../db');

exports.register = async (req, res) => {
    const { wallet_address, name, department } = req.body;
    try {
        const [rows] = await db.execute(
            'INSERT INTO students (wallet_address, name, department) VALUES (?, ?, ?)',
            [wallet_address, name, department]
        );
        res.status(201).json({ message: 'Student registered', studentId: rows.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { wallet_address } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM students WHERE wallet_address = ?', [wallet_address]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Login successful', student: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    const { wallet_address } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM students WHERE wallet_address = ?', [wallet_address]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
