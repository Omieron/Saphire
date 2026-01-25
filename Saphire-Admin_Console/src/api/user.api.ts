import api from './axios';
import type { ApiResponse, User } from './auth.api';

export interface UserRequest {
    username: string;
    password?: string;
    email: string;
    fullName: string;
    role: string;
    active?: boolean;
    machineIds?: number[];
}

export const userApi = {
    getAll: (search?: string) =>
        api.get<ApiResponse<User[]>>(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    getById: (id: number) =>
        api.get<ApiResponse<User>>(`/users/${id}`),

    getByUsername: (username: string) =>
        api.get<ApiResponse<User>>(`/users/username/${username}`),

    getActive: () =>
        api.get<ApiResponse<User[]>>('/users/active'),

    getByRole: (role: string) =>
        api.get<ApiResponse<User[]>>(`/users/role/${role}`),

    create: (data: UserRequest) =>
        api.post<ApiResponse<User>>('/users', data),

    update: (id: number, data: UserRequest) =>
        api.put<ApiResponse<User>>(`/users/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/users/${id}`),
};
