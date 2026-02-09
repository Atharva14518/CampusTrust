const axios = require('axios');
const db = require('../db');
const aiService = require('../services/aiService');

/**
 * Generate NAAC/NIRF style report using Ollama (legacy)
 */
exports.generateReport = async (req, res) => {
    try {
        const [attendance] = await db.execute('SELECT COUNT(*) as total FROM attendance');
        const [certificates] = await db.execute('SELECT COUNT(*) as total FROM certificates');
        const [feedback] = await db.execute('SELECT AVG(sentiment_score) as avg_sentiment FROM feedback');

        const contextData = {
            total_attendance: attendance[0].total,
            total_certificates: certificates[0].total,
            avg_sentiment: feedback[0].avg_sentiment || 0
        };

        const prompt = `Generate a brief NAAC/NIRF accreditation report summary for a university based on this data: 
        Total Student Attendance Records: ${contextData.total_attendance}, 
        Certificates Issued: ${contextData.total_certificates}, 
        Average Student Feedback Score (out of 10): ${contextData.avg_sentiment}. 
        Focus on "Institutional Values and Best Practices" and "Teaching-Learning and Evaluation". Keep it under 200 words.`;

        const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
        const model = process.env.OLLAMA_MODEL || 'gemma:2b';

        const response = await axios.post(`${ollamaHost}/api/generate`, {
            model: model,
            prompt: prompt,
            stream: false
        });

        res.json({
            report: response.data.response,
            data: contextData
        });

    } catch (error) {
        console.error("Ollama Error:", error.message);
        res.status(500).json({
            error: "Failed to generate report",
            details: error.message,
            suggestion: "Ensure Ollama is running (wsl ollama serve) and port 11434 is exposed."
        });
    }
};

/**
 * Generate AI-powered attendance insights using Gemini
 */
exports.getAIInsights = async (req, res) => {
    try {
        // Fetch attendance data
        const [attendanceRecords] = await db.execute(`
            SELECT 
                class_id,
                wallet_address,
                student_name,
                DATE(timestamp) as date,
                timestamp
            FROM attendance 
            ORDER BY timestamp DESC 
            LIMIT 500
        `);

        // Get class summary
        const [classSummary] = await db.execute(`
            SELECT 
                class_id,
                COUNT(*) as total_records,
                COUNT(DISTINCT wallet_address) as unique_students,
                MIN(timestamp) as first_record,
                MAX(timestamp) as last_record
            FROM attendance 
            GROUP BY class_id
        `);

        // Get student summary
        const [studentSummary] = await db.execute(`
            SELECT 
                wallet_address,
                student_name,
                COUNT(*) as attendance_count,
                COUNT(DISTINCT class_id) as classes_attended
            FROM attendance 
            GROUP BY wallet_address, student_name
        `);

        const attendanceData = {
            records: attendanceRecords,
            totalRecords: attendanceRecords.length,
            byClass: classSummary,
            byStudent: studentSummary
        };

        const classInfo = {
            totalClasses: classSummary.length,
            classes: classSummary.map(c => c.class_id)
        };

        // Generate AI insights
        const insights = await aiService.generateAttendanceInsights(attendanceData, classInfo);

        res.json({
            success: true,
            insights,
            data: {
                totalRecords: attendanceRecords.length,
                totalClasses: classSummary.length,
                totalStudents: studentSummary.length
            }
        });

    } catch (error) {
        console.error("AI Insights Error:", error.message);
        res.status(500).json({
            error: "Failed to generate AI insights",
            details: error.message
        });
    }
};

/**
 * Generate class-specific report
 */
exports.getClassReport = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        // Fetch attendance for this class
        const [attendanceRecords] = await db.execute(`
            SELECT 
                wallet_address,
                student_name,
                DATE(timestamp) as date,
                timestamp
            FROM attendance 
            WHERE class_id = ?
            ORDER BY timestamp DESC
        `, [classId]);

        // Get unique students
        const [students] = await db.execute(`
            SELECT DISTINCT 
                wallet_address,
                student_name,
                COUNT(*) as attendance_count
            FROM attendance 
            WHERE class_id = ?
            GROUP BY wallet_address, student_name
        `, [classId]);

        if (attendanceRecords.length === 0) {
            return res.json({
                success: true,
                classId,
                message: 'No attendance records found for this class',
                report: null
            });
        }

        // Generate AI report
        const report = await aiService.generateClassReport(classId, attendanceRecords, students);

        res.json({
            success: true,
            classId,
            report,
            rawData: {
                totalRecords: attendanceRecords.length,
                uniqueStudents: students.length
            }
        });

    } catch (error) {
        console.error("Class Report Error:", error.message);
        res.status(500).json({
            error: "Failed to generate class report",
            details: error.message
        });
    }
};

/**
 * Get attendance statistics summary
 */
exports.getStatsSummary = async (req, res) => {
    try {
        const [totalAttendance] = await db.execute('SELECT COUNT(*) as count FROM attendance');
        const [totalCertificates] = await db.execute('SELECT COUNT(*) as count FROM certificates');
        const [totalStudents] = await db.execute('SELECT COUNT(DISTINCT wallet_address) as count FROM attendance');
        const [totalClasses] = await db.execute('SELECT COUNT(DISTINCT class_id) as count FROM attendance');

        // Attendance by class
        const [byClass] = await db.execute(`
            SELECT class_id, COUNT(*) as count 
            FROM attendance 
            GROUP BY class_id 
            ORDER BY count DESC 
            LIMIT 10
        `);

        // Attendance by day of week
        const [byDayOfWeek] = await db.execute(`
            SELECT DAYNAME(timestamp) as day, COUNT(*) as count 
            FROM attendance 
            GROUP BY DAYNAME(timestamp)
            ORDER BY FIELD(DAYNAME(timestamp), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        `);

        // Recent activity (last 7 days)
        const [recentActivity] = await db.execute(`
            SELECT DATE(timestamp) as date, COUNT(*) as count 
            FROM attendance 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(timestamp)
            ORDER BY date
        `);

        res.json({
            success: true,
            stats: {
                totalAttendance: totalAttendance[0].count,
                totalCertificates: totalCertificates[0].count,
                totalStudents: totalStudents[0].count,
                totalClasses: totalClasses[0].count
            },
            charts: {
                byClass: byClass.reduce((acc, row) => {
                    acc[row.class_id] = row.count;
                    return acc;
                }, {}),
                byDayOfWeek: byDayOfWeek.reduce((acc, row) => {
                    acc[row.day] = row.count;
                    return acc;
                }, {}),
                recentActivity: recentActivity
            }
        });

    } catch (error) {
        console.error("Stats Error:", error.message);
        res.status(500).json({
            error: "Failed to fetch statistics",
            details: error.message
        });
    }
};
