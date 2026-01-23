import api from './axios';
import type { ApiResponse } from './auth.api';

export interface Product {
    id: number;
    name: string;
    code: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    name: string;
    code: string;
    description?: string;
    active?: boolean;
}

export const productApi = {
    getAll: (search?: string) =>
        api.get<ApiResponse<Product[]>>(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    getById: (id: number) =>
        api.get<ApiResponse<Product>>(`/products/${id}`),

    getByCode: (code: string) =>
        api.get<ApiResponse<Product>>(`/products/code/${code}`),

    getActive: () =>
        api.get<ApiResponse<Product[]>>('/products/active'),

    create: (data: ProductRequest) =>
        api.post<ApiResponse<Product>>('/products', data),

    update: (id: number, data: ProductRequest) =>
        api.put<ApiResponse<Product>>(`/products/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/products/${id}`),
};
