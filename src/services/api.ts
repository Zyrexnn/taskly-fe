import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create Axios Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add JWT Token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Handle Errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove('token');
            localStorage.removeItem('user');
            // Prevent recursive redirects if already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ===== API Response Types =====
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown;
}

// ===== User Types =====
export interface User {
    id: number;
    name: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    identifier: string;
    password: string;
}

// ===== Task Types =====
export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    user_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    completed?: boolean;
}

// ===== Siswa Types =====
export interface Siswa {
    id: number;
    nis: string;
    nama: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string | null;
    alamat: string;
    no_telepon: string;
    email: string;
    kelas: string;
    tahun_masuk: number;
    created_at: string;
    updated_at: string;
}

export interface CreateSiswaRequest {
    nis: string;
    nama: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    no_telepon?: string;
    email?: string;
    kelas?: string;
    tahun_masuk?: number;
}

export interface UpdateSiswaRequest extends Partial<CreateSiswaRequest> { }

export interface SiswaListResponse {
    data: Siswa[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

// ===== Auth API =====
export const authApi = {
    register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/user/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/user/login', data);
        if (response.data.success && response.data.data) {
            Cookies.set('token', response.data.data.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    logout: () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: (): boolean => {
        return !!Cookies.get('token');
    },
};

// ===== Task API =====
export const taskApi = {
    getAll: async (): Promise<ApiResponse<Task[]>> => {
        const response = await api.get<ApiResponse<Task[]>>('/tasks');
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Task>> => {
        const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data;
    },

    create: async (data: CreateTaskRequest): Promise<ApiResponse<Task>> => {
        const response = await api.post<ApiResponse<Task>>('/tasks', data);
        return response.data;
    },

    update: async (id: number, data: UpdateTaskRequest): Promise<ApiResponse<Task>> => {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
        return response.data;
    },
};

// ===== Siswa API =====
export const siswaApi = {
    getAll: async (page = 1, limit = 10, search = ''): Promise<ApiResponse<SiswaListResponse>> => {
        const response = await api.get<ApiResponse<SiswaListResponse>>('/siswa', {
            params: { page, limit, search },
        });
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Siswa>> => {
        const response = await api.get<ApiResponse<Siswa>>(`/siswa/${id}`);
        return response.data;
    },

    create: async (data: CreateSiswaRequest): Promise<ApiResponse<Siswa>> => {
        const response = await api.post<ApiResponse<Siswa>>('/siswa', data);
        return response.data;
    },

    update: async (id: number, data: UpdateSiswaRequest): Promise<ApiResponse<Siswa>> => {
        const response = await api.put<ApiResponse<Siswa>>(`/siswa/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/siswa/${id}`);
        return response.data;
    },
};

export default api;
