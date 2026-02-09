const db = require('../db');

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
                    num_predict: 200
                }
            })
        });

        const data = await response.json();
        return data.response || 'I could not generate a response.';
    } catch (error) {
        console.error('Ollama error:', error.message);
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

        // Build prompt for Ollama
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
- Add emojis for modern feel

User Question: ${message}

Response:`;

        const response = await callOllama(systemPrompt);

        res.json({
            success: true,
            response: response.trim()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process your question',
            response: "I'm having trouble right now. Make sure Ollama is running!"
        });
    }
};
