import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../services/api';
import { authApi } from '../services/api';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            // Check for existing session on mount
            const currentUser = authApi.getCurrentUser();
            if (currentUser && authApi.isAuthenticated()) {
                setUser(currentUser);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            Cookies.remove('token');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authApi.login({ username, password });
            if (response.success && response.data) {
                setUser(response.data.user);
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message || 'Login failed' };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return {
                success: false,
                message: err.response?.data?.message || 'An error occurred during login'
            };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await authApi.register({ name, email, password });
            if (response.success) {
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message || 'Registration failed' };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return {
                success: false,
                message: err.response?.data?.message || 'An error occurred during registration'
            };
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
