import api from './axios';
import type { ApiResponse } from './auth.api';

export interface Company {
    id: number;
    name: string;
    code: string;
    active: boolean;
    logo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompanyRequest {
    name: string;
    code: string;
    active?: boolean;
    logo?: string;
}

export const companyApi = {
    getAll: (search?: string) =>
        api.get<ApiResponse<Company[]>>(`/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    getById: (id: number) =>
        api.get<ApiResponse<Company>>(`/companies/${id}`),

    getByCode: (code: string) =>
        api.get<ApiResponse<Company>>(`/companies/code/${code}`),

    create: (data: CompanyRequest) =>
        api.post<ApiResponse<Company>>('/companies', data),

    update: (id: number, data: CompanyRequest) =>
        api.put<ApiResponse<Company>>(`/companies/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/companies/${id}`),
};
