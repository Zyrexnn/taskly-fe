import { create } from "zustand";
import type { User } from "../services/api";
import { authApi } from "../services/api";

type AuthUser = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    setuser: (user: User) => void;
    settoken: (token: string) => void;
    setisAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthUser>((set) => ({
    user: authApi.getCurrentUser(),
    token: null, // Token is handled by Cookies
    isAuthenticated: authApi.isAuthenticated(),
    login: async (username, password) => {
        try {
            const response = await authApi.login({ username, password });
            if (response.success && response.data) {
                set({
                    user: response.data.user,
                    token: response.data.token,
                    isAuthenticated: true
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },
    logout: () => {
        authApi.logout();
        set({ user: null, token: null, isAuthenticated: false });
    },
    setuser: (user: User) => {
        set({ user });
    },
    settoken: (token: string) => {
        set({ token });
    },
    setisAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
    },
}));




