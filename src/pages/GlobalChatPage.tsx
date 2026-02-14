import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Send,
    Loader2,
    ListTodo,
    Users,
    LogOut,
    Menu,
    Sun,
    Moon,
    ClipboardList,
    MessageCircle
} from 'lucide-react';
import './Dashboard.css';
import './GlobalChat.css';

interface ChatMsg {
    id?: number;
    user_id: number;
    user_name: string;
    message: string;
    created_at?: string;
    time?: string;
}

export default function GlobalChatPage() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load message history via REST
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
                const httpUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
                const res = await fetch(`${httpUrl}/chat/messages?limit=100`);
                const data = await res.json();
                if (data.success && data.data) {
                    setMessages(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch chat history:', err);
            }
        };
        fetchHistory();
    }, []);

    // WebSocket connection
    useEffect(() => {
        if (!user) return;

        const connectWs = () => {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
            const ws = new WebSocket(
                `${wsUrl}/ws/chat?user_id=${user.id}&user_name=${encodeURIComponent(user.name)}`
            );

            ws.onopen = () => {
                setIsConnected(true);
                console.log('[GlobalChat] WebSocket connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as ChatMsg;
                    setMessages(prev => [...prev, data]);
                } catch (err) {
                    console.error('[GlobalChat] Parse error:', err);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                console.log('[GlobalChat] WebSocket disconnected, reconnecting in 3s...');
                reconnectTimerRef.current = setTimeout(connectWs, 3000);
            };

            ws.onerror = (err) => {
                console.error('[GlobalChat] WebSocket error:', err);
                ws.close();
            };

            wsRef.current = ws;
        };

        connectWs();

        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            wsRef.current?.close();
        };
    }, [user]);

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        wsRef.current.send(JSON.stringify({ message: input.trim() }));
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (msg: ChatMsg) => {
        const timeStr = msg.time || msg.created_at;
        if (!timeStr) return '';
        try {
            return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'is-visible' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <ClipboardList className="brand-icon" size={28} />
                        <span className="brand-name">Taskly</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-link">
                        <div className="nav-inner">
                            <ListTodo size={22} />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                    <Link to="/siswa" className="nav-link">
                        <div className="nav-inner">
                            <Users size={22} />
                            <span>Students</span>
                        </div>
                    </Link>
                    <Link to="/chat" className="nav-link active">
                        <div className="nav-inner">
                            <MessageCircle size={22} />
                            <span>Global Chat</span>
                        </div>
                        <div className="active-dot" />
                    </Link>
                </nav>

                <div className="sidebar-profile">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <p className="profile-name">{user?.name}</p>
                            <button className="btn-signout" onClick={logout}>
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="dashboard-main">
                <header className="content-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="welcome-text">
                            <h2>Global Chat</h2>
                            <p>
                                {isConnected ? (
                                    <span className="gc-status online">● Connected</span>
                                ) : (
                                    <span className="gc-status offline">● Reconnecting...</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="theme-switcher" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </header>

                <div className="dashboard-content gc-wrapper">
                    {/* Chat Messages */}
                    <div className="gc-messages">
                        {messages.length === 0 ? (
                            <div className="gc-empty">
                                <MessageCircle size={48} className="opacity-10" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.user_id === user?.id;
                                return (
                                    <div key={msg.id || i} className={`gc-msg ${isMe ? 'me' : 'other'}`}>
                                        {!isMe && (
                                            <div className="gc-msg-avatar">
                                                {msg.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="gc-msg-content">
                                            {!isMe && <span className="gc-msg-name">{msg.user_name}</span>}
                                            <div className="gc-msg-bubble">
                                                {msg.message}
                                            </div>
                                            <span className="gc-msg-time">{formatTime(msg)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="gc-input-bar">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!isConnected}
                        />
                        <button
                            className="gc-send-btn"
                            onClick={sendMessage}
                            disabled={!isConnected || !input.trim()}
                        >
                            {!isConnected ? <Loader2 size={18} className="spinning" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </main>

            {sidebarOpen && (
                <div className="modern-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
