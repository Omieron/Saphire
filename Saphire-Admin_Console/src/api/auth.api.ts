import api from './axios';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export const authApi = {
    login: (data: LoginRequest) =>
        api.post<ApiResponse<LoginResponse>>('/auth/login', data),

    register: (data: RegisterRequest) =>
        api.post<ApiResponse<User>>('/auth/register', data),

    me: () =>
        api.get<ApiResponse<User>>('/auth/me'),
};
