import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, MessageCircle } from 'lucide-react';
import './ChatBot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m Taskly AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '⚠️ Gemini API key not configured. Please add your API key in the .env file (VITE_GEMINI_API_KEY).'
                }]);
                setIsLoading(false);
                return;
            }

            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            ...history,
                            { role: 'user', parts: [{ text: userMessage }] }
                        ],
                        systemInstruction: {
                            parts: [{ text: 'You are Taskly AI, a helpful assistant for a task management application called Taskly. Keep responses concise and helpful. You can help users with task management tips, productivity advice, and general questions.' }]
                        },
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 512,
                        }
                    })
                }
            );

            const data = await response.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (error) {
            console.error('Gemini API error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button className="chatbot-fab" onClick={() => setIsOpen(true)} title="AI Assistant">
                    <Bot size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <Bot size={20} />
                            <div>
                                <h4>Taskly AI</h4>
                                <span className="chatbot-status">Online</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="chatbot-avatar">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className="chatbot-bubble">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-msg assistant">
                                <div className="chatbot-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="chatbot-bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send"
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Global Chat FAB (separate) */}
            {!isOpen && (
                <a href="/chat" className="globalchat-fab" title="Global Chat">
                    <MessageCircle size={22} />
                </a>
            )}
        </>
    );
}
