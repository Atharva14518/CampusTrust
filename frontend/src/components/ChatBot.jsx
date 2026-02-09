import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { API_URL } from '../config';
import { useWallet } from '../context/WalletContext';

const ChatBot = () => {
    const { account } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: "Hey! 👋 I'm your TrustCampus AI. Ask me about attendance, certificates, or anything!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    walletAddress: account
                })
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'bot',
                content: data.response || data.error || 'Hmm, something went wrong.',
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'Oops! Having trouble connecting. Try again?',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        "What's my attendance?",
        "Show my badges",
        "How does blockchain work?",
        "What's my streak?"
    ];

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl transition-all duration-300 
                    bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
                    hover:scale-110 shadow-lg shadow-pink-500/30 ${isOpen ? 'hidden' : 'flex'} items-center justify-center`}
            >
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-black" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[550px] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        background: 'linear-gradient(180deg, rgba(20,10,30,0.98) 0%, rgba(10,10,15,0.99) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">TrustCampus AI</h3>
                                <p className="text-xs text-white/70">Powered by Ollama</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                                    }`}>
                                    {msg.role === 'user'
                                        ? <User className="w-4 h-4 text-white" />
                                        : <Bot className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <div className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-[10px] opacity-50 mt-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(q)}
                                        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 border border-white/10 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask anything..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 text-sm"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center disabled:opacity-50 transition-all"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
