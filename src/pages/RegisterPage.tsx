import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await register(name, email, password);

        if (result.success) {
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
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
                        <h1 className="auth-tagline">Start your journey today</h1>
                        <p className="auth-description">
                            Join thousands of users who trust Taskly to manage their tasks and
                            stay productive every day.
                        </p>
                        <div className="auth-features">
                            <div className="feature-item">
                                <span className="feature-icon">🚀</span>
                                <span>Quick Setup</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💯</span>
                                <span>Free to Use</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span>Instant Access</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>

                        {error && (
                            <div className="auth-error animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="auth-success animate-fade-in">
                                <CheckCircle size={18} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-with-icon">
                                    <User className="input-icon" size={18} />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        placeholder="Create a password (min 6 characters)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
