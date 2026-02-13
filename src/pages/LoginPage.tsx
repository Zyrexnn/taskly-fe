import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(identifier, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-branding-content">
                        <div className="auth-logo">
                            <span className="logo-icon">✓</span>
                            <span className="logo-text">Taskly</span>
                        </div>
                        <h1 className="auth-tagline">Manage your tasks with ease</h1>
                        <p className="auth-description">
                            Stay organized, boost productivity, and never miss a deadline with our
                            intuitive task management platform.
                        </p>
                        <div className="auth-features">
                            <div className="feature-item">
                                <span className="feature-icon">📋</span>
                                <span>Task Management</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">👨‍🎓</span>
                                <span>Student Records</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Secure Authentication</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Welcome Back</h2>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        {error && (
                            <div className="auth-error animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="identifier">Username / Email</label>
                                <div className="input-with-icon">
                                    <UserIcon className="input-icon" size={18} />
                                    <input
                                        id="identifier"
                                        type="text"
                                        placeholder="Enter your username or email"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={3}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary auth-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="spinning" size={20} />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>


                    </div>
                </div>
            </div>
        </div>
    );
}
