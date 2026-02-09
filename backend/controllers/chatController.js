const db = require('../db');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function callOpenAI(systemPrompt, userMessage) {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'I could not generate a response.';
    } catch (error) {
        console.error('OpenAI error:', error.message);
        throw error;
    }
}

exports.askQuestion = async (req, res) => {
    const { message, walletAddress } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Fetch user context if wallet connected
        let userContext = '';
        if (walletAddress) {
            try {
                const [attendance] = await db.execute(
                    'SELECT COUNT(*) as count FROM attendance WHERE wallet_address = ?',
                    [walletAddress]
                );
                const [certificates] = await db.execute(
                    'SELECT COUNT(*) as count FROM certificates WHERE student_address = ?',
                    [walletAddress]
                );
                userContext = `
User Context:
- Wallet: ${walletAddress.substring(0, 8)}...
- Total Attendance Records: ${attendance[0].count}
- Certificates Earned: ${certificates[0].count}
`;
            } catch (dbError) {
                console.log('Could not fetch user context:', dbError.message);
            }
        }

        // System prompt for OpenAI
        const systemPrompt = `You are TrustCampus AI, a helpful assistant for a blockchain-based campus management platform.

The platform features:
- Attendance tracking with blockchain verification on Algorand
- NFT certificates for achievements
- Geolocation-verified check-ins (students must be within 100m)
- AI-powered analytics and reports
- Student leaderboard with streaks and badges

${userContext}

Guidelines:
- Be concise and friendly (max 100 words)
- Use simple language
- Add emojis for modern feel`;

        const response = await callOpenAI(systemPrompt, message);

        res.json({
            success: true,
            response: response.trim()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process your question',
            response: "I'm having trouble right now. Please check if the AI service is configured properly."
        });
    }
};
