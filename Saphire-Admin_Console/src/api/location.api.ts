import api from './axios';
import type { ApiResponse } from './auth.api';

export interface Location {
    id: number;
    companyId: number;
    companyName: string;
    name: string;
    code: string;
    address: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LocationRequest {
    companyId: number;
    name: string;
    code: string;
    address?: string;
    active?: boolean;
}

export const locationApi = {
    getAll: () =>
        api.get<ApiResponse<Location[]>>('/locations'),

    getById: (id: number) =>
        api.get<ApiResponse<Location>>(`/locations/${id}`),

    getByCompanyId: (companyId: number) =>
        api.get<ApiResponse<Location[]>>(`/locations/company/${companyId}`),

    getActiveByCompanyId: (companyId: number) =>
        api.get<ApiResponse<Location[]>>(`/locations/company/${companyId}/active`),

    create: (data: LocationRequest) =>
        api.post<ApiResponse<Location>>('/locations', data),

    update: (id: number, data: LocationRequest) =>
        api.put<ApiResponse<Location>>(`/locations/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/locations/${id}`),
};
