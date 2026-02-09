/**
 * AI Service using OpenAI GPT-4o-mini for LLM inference
 */

async function callOpenAI(prompt, systemMessage = '') {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    try {
        const messages = [];
        if (systemMessage) {
            messages.push({ role: 'system', content: systemMessage });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('OpenAI error:', error.message);
        throw error;
    }
}

/**
 * Generate attendance insights using OpenAI
 */
exports.generateAttendanceInsights = async (attendanceData) => {
    const systemMessage = 'You are an educational analytics AI. Always respond with valid JSON only, no markdown.';

    const prompt = `Analyze this attendance data and provide insights.

Attendance Data:
- Total Records: ${attendanceData.totalRecords || 0}
- Unique Students: ${attendanceData.uniqueStudents || 0}
- Classes: ${JSON.stringify(attendanceData.byClass || {})}
- By Day: ${JSON.stringify(attendanceData.byDay || {})}

Respond with this exact JSON structure:
{
    "summary": "One sentence summary of attendance patterns",
    "trends": ["trend 1", "trend 2", "trend 3"],
    "atRiskStudents": [],
    "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    try {
        const response = await callOpenAI(prompt, systemMessage);

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
            summary: 'AI analysis temporarily unavailable. Check OpenAI API key configuration.',
            trends: ['Data collection ongoing'],
            atRiskStudents: [],
            recommendations: ['Verify OPENAI_API_KEY in environment variables']
        };
    }
};

/**
 * Generate class-specific report using OpenAI
 */
exports.generateClassReport = async (classId, attendanceRecords, students) => {
    const totalRecords = attendanceRecords?.length || 0;
    const uniqueStudents = students?.length || 0;

    const prompt = `Generate a brief 2-3 sentence report for class ${classId}.

Data:
- Total Attendance Records: ${totalRecords}
- Unique Students: ${uniqueStudents}
- Average Attendance per Student: ${uniqueStudents > 0 ? (totalRecords / uniqueStudents).toFixed(1) : 0}

Provide only the summary text, no formatting.`;

    try {
        const response = await callOpenAI(prompt);
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
 * Analyze feedback sentiment using OpenAI
 */
exports.analyzeFeedbackSentiment = async (feedbackText) => {
    const systemMessage = 'You are a sentiment analyzer. Respond only with valid JSON.';

    const prompt = `Analyze the sentiment of this feedback:

"${feedbackText}"

Respond with only this JSON format:
{"sentiment": "positive/negative/neutral", "score": 0.0-1.0}`;

    try {
        const response = await callOpenAI(prompt, systemMessage);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { sentiment: 'neutral', score: 0.5 };
    } catch (error) {
        return { sentiment: 'neutral', score: 0.5 };
    }
};
