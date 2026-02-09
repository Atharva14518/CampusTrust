/**
 * AI Service using Ollama for local LLM inference
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma:2b';

async function callOllama(prompt) {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 500
                }
            })
        });

        const data = await response.json();
        return data.response || '';
    } catch (error) {
        console.error('Ollama error:', error.message);
        throw error;
    }
}

/**
 * Generate attendance insights using Ollama
 */
exports.generateAttendanceInsights = async (attendanceData) => {
    const prompt = `You are an educational analytics AI. Analyze this attendance data and provide insights.

Attendance Data:
- Total Records: ${attendanceData.totalRecords || 0}
- Unique Students: ${attendanceData.uniqueStudents || 0}
- Classes: ${JSON.stringify(attendanceData.byClass || {})}
- By Day: ${JSON.stringify(attendanceData.byDay || {})}

Provide a JSON response with this exact structure (no markdown):
{
    "summary": "One sentence summary of attendance patterns",
    "trends": ["trend 1", "trend 2", "trend 3"],
    "atRiskStudents": ["student1 or empty array if none"],
    "recommendations": ["recommendation 1", "recommendation 2"]
}

JSON Response:`;

    try {
        const response = await callOllama(prompt);

        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback structure
        return {
            summary: response.substring(0, 200),
            trends: ['Attendance data collected', 'Students are participating'],
            atRiskStudents: [],
            recommendations: ['Continue monitoring attendance patterns']
        };
    } catch (error) {
        console.error('AI insights error:', error);
        return {
            summary: 'AI analysis temporarily unavailable. Ensure Ollama is running.',
            trends: ['Data collection ongoing'],
            atRiskStudents: [],
            recommendations: ['Start ollama with: ollama serve']
        };
    }
};

/**
 * Generate class-specific report using Ollama
 */
exports.generateClassReport = async (classId, attendanceRecords, students) => {
    const totalRecords = attendanceRecords?.length || 0;
    const uniqueStudents = students?.length || 0;

    const prompt = `Generate a brief report for class ${classId}.

Data:
- Total Attendance Records: ${totalRecords}
- Unique Students: ${uniqueStudents}
- Average Attendance per Student: ${uniqueStudents > 0 ? (totalRecords / uniqueStudents).toFixed(1) : 0}

Provide a 2-3 sentence summary of this class's attendance performance.

Summary:`;

    try {
        const response = await callOllama(prompt);
        return {
            classId,
            summary: response.trim() || `Class ${classId} has ${totalRecords} attendance records from ${uniqueStudents} students.`,
            totalStudents: uniqueStudents,
            averageAttendance: uniqueStudents > 0 ? Math.round((totalRecords / uniqueStudents) * 10) : 0
        };
    } catch (error) {
        return {
            classId,
            summary: `Class ${classId} has ${totalRecords} attendance records from ${uniqueStudents} students.`,
            totalStudents: uniqueStudents,
            averageAttendance: uniqueStudents > 0 ? Math.round((totalRecords / uniqueStudents) * 10) : 0
        };
    }
};

/**
 * Analyze feedback sentiment using Ollama
 */
exports.analyzeFeedbackSentiment = async (feedbackText) => {
    const prompt = `Analyze the sentiment of this feedback and respond with ONLY a JSON object:

Feedback: "${feedbackText}"

Response format (JSON only, no markdown):
{"sentiment": "positive/negative/neutral", "score": 0.0-1.0}

JSON:`;

    try {
        const response = await callOllama(prompt);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { sentiment: 'neutral', score: 0.5 };
    } catch (error) {
        return { sentiment: 'neutral', score: 0.5 };
    }
};
